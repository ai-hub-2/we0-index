# Contributing to CollabHub

Thank you for your interest in contributing to CollabHub! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the appropriate issue template** for bugs, features, or questions
3. **Provide detailed information** including:
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, browser, version)
   - Screenshots or logs if applicable

### Suggesting Features

We welcome feature suggestions! When proposing a feature:

1. **Describe the problem** you're trying to solve
2. **Explain your proposed solution**
3. **Consider the impact** on existing functionality
4. **Provide examples** of how it would work

### Code Contributions

#### Prerequisites

- Node.js 18+ and Go 1.21+
- Docker and Docker Compose
- Git

#### Development Setup

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/collabhub-platform.git
   cd collabhub-platform
   ```

3. **Set up the development environment:**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && go mod download
   ```

4. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

##### Frontend (React/Next.js)

- **Follow the existing code style** and use Prettier/ESLint
- **Write TypeScript** for all new code
- **Add tests** for new components and functionality
- **Use the component library** and design system
- **Follow accessibility guidelines** (WCAG 2.1)

```typescript
// Example component structure
import React from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
};
```

##### Backend (Go)

- **Follow Go conventions** and use `gofmt`
- **Write tests** for all new functions
- **Use proper error handling**
- **Document public APIs** with comments
- **Follow the project structure**

```go
// Example Go service structure
package service

import (
    "context"
    "errors"
)

type UserService struct {
    db Database
}

func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    if id == "" {
        return nil, errors.New("user ID is required")
    }
    
    user, err := s.db.GetUser(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)
    }
    
    return user, nil
}
```

#### Testing

- **Frontend:** Run `npm test` in the frontend directory
- **Backend:** Run `go test ./...` in the backend directory
- **Integration:** Use the provided test containers
- **Coverage:** Aim for >80% test coverage

#### Code Review Process

1. **Self-review** your changes before submitting
2. **Write clear commit messages** following conventional commits
3. **Update documentation** if needed
4. **Add tests** for new functionality
5. **Submit a pull request** with a clear description

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(auth): add OAuth 2.0 support`
- `fix(api): resolve user creation race condition`
- `docs(readme): update installation instructions`
- `test(backend): add user service tests`

### Pull Request Guidelines

1. **Use a descriptive title** that explains the change
2. **Fill out the PR template** completely
3. **Link related issues** using keywords
4. **Include screenshots** for UI changes
5. **Ensure all tests pass** before submitting
6. **Request reviews** from appropriate team members

## 📋 Issue Templates

### Bug Report

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem
```

### Feature Request

```markdown
## Problem Statement
Describe the problem you're trying to solve

## Proposed Solution
Describe your proposed solution

## Alternative Solutions
Describe any alternative solutions you've considered

## Additional Context
Any other context, screenshots, or examples
```

## 🏗️ Project Structure

```
collabhub/
├── frontend/                 # React/Next.js frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Next.js pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client and services
│   │   └── store/          # State management
│   ├── public/             # Static assets
│   └── tests/              # Frontend tests
├── backend/                 # Go microservices
│   ├── cmd/                # Application entry points
│   ├── internal/           # Private application code
│   ├── pkg/                # Public packages
│   ├── api/                # API definitions
│   └── migrations/         # Database migrations
├── sdk/                    # Client libraries
├── cli/                    # Command-line tools
├── docs/                   # Documentation
├── k8s/                    # Kubernetes manifests
├── terraform/              # Infrastructure as code
└── scripts/                # Build and deployment scripts
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && go test ./...

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Test Coverage

We aim for high test coverage:
- **Frontend:** >80% coverage
- **Backend:** >85% coverage
- **Integration:** Critical paths covered

## 📚 Documentation

### Writing Documentation

- **Use clear, concise language**
- **Include code examples**
- **Keep documentation up to date**
- **Use proper markdown formatting**
- **Add diagrams when helpful**

### Documentation Structure

```
docs/
├── api/                    # API documentation
├── guides/                 # User guides
├── development/           # Developer guides
├── deployment/            # Deployment guides
└── contributing/          # Contributing guidelines
```

## 🔒 Security

### Security Guidelines

- **Never commit secrets** or sensitive data
- **Use environment variables** for configuration
- **Validate all inputs** and sanitize data
- **Follow OWASP guidelines** for web security
- **Report security issues** privately

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do not create a public issue**
2. **Email security@collabhub.com**
3. **Include detailed information** about the vulnerability
4. **Allow time for assessment** before public disclosure

## 🎯 Getting Help

### Resources

- **Documentation:** [docs.collabhub.com](https://docs.collabhub.com)
- **Discord:** [Join our community](https://discord.gg/collabhub)
- **Issues:** [GitHub Issues](https://github.com/collabhub/platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/collabhub/platform/discussions)

### Community Guidelines

- **Be respectful** and inclusive
- **Help others** when you can
- **Share knowledge** and experiences
- **Follow the code of conduct**

## 📄 License

By contributing to CollabHub, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- **GitHub contributors list**
- **Project documentation**
- **Release notes**
- **Community acknowledgments**

Thank you for contributing to CollabHub! 🚀