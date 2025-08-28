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
- **Cloudflare Pages**: Automatic deployment with reverse proxy to FastAPI backend

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

## 🚀 Deploy to Cloudflare Pages (Free + Auto-Deploy)

This repository includes automatic deployment to Cloudflare Pages using GitHub Actions. Your Python code and data remain unchanged.

### Automatic Deployment Setup

1. **Fork/Clone this repository** to your GitHub account
2. **Add GitHub Secrets** in your repository settings:
   - Go to Settings → Secrets and variables → Actions
   - Add `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages:Edit permissions
   - Add `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found in dashboard)
3. **Update ORIGIN_URL** in `wrangler.toml`:
   - Replace `https://your-backend-url.com` with your actual FastAPI backend URL
4. **Push to main branch** - deployment will start automatically!

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. Push this repository to GitHub/GitLab
2. In Cloudflare dashboard: Workers & Pages → Create application → Pages → Connect to Git
3. Build settings:
   - Build command: leave empty
   - Build output directory: `public`
4. Project → Settings → Environment Variables:
   - Name: `ORIGIN_URL`
   - Value: your FastAPI base URL
5. Deploy

### How it works

- **Automatic**: Every push to main branch triggers GitHub Actions deployment
- **Proxy**: All requests to Pages domain are proxied to your FastAPI backend
- **CORS**: Built-in CORS handling for cross-origin requests
- **Zero Changes**: No modifications to your Python code or data

### Structure

- `functions/[[path]].js`: Universal proxy function
- `public/index.html`: Static landing page
- `.github/workflows/`: GitHub Actions for auto-deployment
- `wrangler.toml`: Cloudflare configuration

### Testing

After deployment, test your API:
```bash
curl -i https://your-project.pages.dev/vector/health
```

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