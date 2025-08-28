# We0-index

[English](README.md) | [中文](README-zh.md)

A Python-based code indexing engine similar to Cursor, designed to transform Git repository code into code snippets with semantic embeddings for intelligent code search and retrieval.

## 🚀 Features

- **Code Snippet Generation**: Automatically processes Git repositories and converts code into searchable snippets
- **Semantic Search**: Generates semantic embeddings for intelligent code retrieval based on user queries
- **Multi-Language Support**: Optimized for Python, Java, Go, JavaScript, and TypeScript
- **Flexible Backends**: Supports multiple vector database backends and embedding service providers
- **MCP Integration**: Built-in support for MCP (Model Context Protocol) service calls
- **Deployment Ready**: Flexible deployment options for different environments

## 📋 Requirements

- Python 3.12+
- Git

## 🛠️ Installation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/we0-dev/we0-index
cd we0-index

# Set up environment configuration
cp .env.example .env
vim .env

# Configure application settings
vim resource/dev.yaml

# Create virtual environment and install dependencies
uv venv
# Linux/macOS
source .venv/bin/activate
# Windows
.venv\Scripts\activate
uv sync
```

### Development Setup

```bash
# Install development dependencies
uv sync --frozen
```

## ⚙️ Configuration

1. **Environment Variables**: Copy `.env.example` to `.env` and configure your settings
2. **Application Config**: Edit `resource/dev.yaml` to customize your deployment
3. **Vector Database**: Configure your preferred vector database backend
4. **Embedding Service**: Set up your embedding service provider

## 🚀 Running the Service

We0-index supports two running modes: Web API service and MCP protocol service.

### Web API Mode

Start the FastAPI web server to provide RESTful API endpoints:

```bash
# Activate virtual environment
# Linux/macOS
source .venv/bin/activate
# Windows
.venv\Scripts\activate

# Start web service
python main.py --mode fastapi
```

The web service will start on the configured host and port (check `resource/dev.yaml` for default configuration).

### MCP Protocol Mode

Start the MCP (Model Context Protocol) service for AI integration:

```bash
# Activate virtual environment
# Linux/macOS
source .venv/bin/activate
# Windows
.venv\Scripts\activate

# Start MCP service (default with streamable-http transport)
python main.py --mode mcp

# Specify other transport protocols
python main.py --mode mcp --transport stdio
python main.py --mode mcp --transport sse
```

The MCP service runs with streamable-http transport by default and can be integrated with MCP-compatible AI clients.

### Runtime Parameters

**Mode Parameters**:
- `--mode fastapi`: Start Web API service
- `--mode mcp`: Start MCP protocol service

**Transport Parameters** (only applicable for MCP mode):
- `--transport streamable-http`: Use HTTP streaming transport (default)
- `--transport stdio`: Use standard input/output transport
- `--transport sse`: Use sse transport



## 🏗️ Architecture

We0-index is built with a modular architecture supporting:

- **Code Parsers**: Language-specific code parsing and snippet extraction
- **Embedding Engines**: Multiple embedding service integrations
- **Vector Stores**: Pluggable vector database backends
- **Search Interface**: RESTful API and CLI for code search
- **MCP Protocol**: Model Context Protocol for AI integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## 📚 Documentation

For detailed documentation, please visit our [Documentation Site](https://docs.we0-dev.com) or check the `docs/` directory.

## 🐛 Issues

If you encounter any issues, please [create an issue](https://github.com/we0-dev/we0-index/issues) on GitHub.

## 📞 Support

- 📧 Email: we0@wegc.cn 
- 💬 Discussions: [GitHub Discussions](https://github.com/we0-dev/we0-index/discussions)
- 📖 Wiki: [Project Wiki](https://deepwiki.com/we0-dev/we0-index)

## 🌟 Acknowledgments

- Thanks to all contributors who have helped make this project better
- Inspired by Cursor's approach to code intelligence
- Built with modern Python tooling and best practices

---

**Made with ❤️ by the We0-dev Team**

## Deploy to Cloudflare Pages (Free)

This repository includes a zero-change deployment setup for Cloudflare Pages using Pages Functions as a reverse proxy to your existing FastAPI backend. Your Python code and data remain unchanged.

### Added structure

- `functions/[[path]].js`: Universal proxy forwarding all routes to your backend at `ORIGIN_URL`. Includes permissive CORS.
- `public/index.html`: Minimal static page to allow successful Pages deployments.

### How it works

- Requests to your Pages domain (e.g., `https://your-project.pages.dev/...`) are proxied to `ORIGIN_URL + <same path and query>`.
- Example: `GET https://your-project.pages.dev/vector/health` → `GET ${ORIGIN_URL}/vector/health`.

### Setup steps

1. Push this repository to GitHub/GitLab.
2. In Cloudflare dashboard: Workers & Pages → Create application → Pages → Connect to Git.
3. Build settings:
   - Build command: leave empty
   - Build output directory: `public`
4. Project → Settings → Environment Variables:
   - Name: `ORIGIN_URL`
   - Value: your FastAPI base URL, e.g., `https://api.example.com`.
5. Deploy. All routes will proxy to your backend with CORS headers applied.

### Notes

- To proxy only specific paths (e.g., `/api/*`), move the function to `functions/api/[[path]].js` and keep static assets under `public/`.
- No changes to Python/uvicorn code are necessary.