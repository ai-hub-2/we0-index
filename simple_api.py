#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="We0 Index Simple API", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "We0 Index API is running!"}

@app.get("/vector/health")
async def health_check():
    return {"status": "healthy", "service": "vector"}

@app.get("/git/status")
async def git_status():
    return {"status": "ready", "service": "git"}

@app.post("/vector/search")
async def search():
    return {"results": [], "query": "test"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)