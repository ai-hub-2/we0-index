export async function onRequest(context) {
  const { request, env } = context;

  // Basic CORS handling (allow all origins). Adjust in dashboard if needed.
  const requestOrigin = request.headers.get("Origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": requestOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
    "Vary": "Origin",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const originBase = env.ORIGIN_URL;
  if (!originBase) {
    return new Response(
      JSON.stringify({ 
        error: "Missing ORIGIN_URL environment variable",
        message: "Please set ORIGIN_URL in Cloudflare Pages environment variables"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, originBase);

  // Clone headers, but drop host-related headers that can cause issues
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cf-connecting-ip");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-proto");
  headers.delete("content-length");

  const init = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "follow",
  };

  let upstreamResponse;
  try {
    console.log(`Proxying ${request.method} ${incomingUrl.pathname} to ${targetUrl.toString()}`);
    upstreamResponse = await fetch(targetUrl.toString(), init);
  } catch (error) {
    console.error(`Proxy error: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        error: "Upstream fetch failed", 
        details: String(error),
        target: targetUrl.toString(),
        message: "Check if your backend is running and accessible"
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Build response with CORS headers
  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.set("Access-Control-Allow-Origin", requestOrigin);
  responseHeaders.set("Access-Control-Allow-Credentials", "true");
  responseHeaders.set("Vary", "Origin");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

