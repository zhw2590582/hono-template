# My App

A modern, enterprise-grade Hono web application with production-ready architecture.

## ✨ Features

- 🏗️ **Layered Architecture** - Clear separation of concerns
- 🔒 **Type-Safe** - Full TypeScript with strict mode
- ✅ **Validation** - Zod schemas for input validation
- 🛡️ **Error Handling** - Custom error classes with centralized handler
- 📊 **Logging** - Structured logging with configurable levels
- ⚡ **Rate Limiting** - Request throttling
- 🔐 **Security** - Secure headers, CORS, request tracking
- 💚 **Health Checks** - Service health endpoint

## 📁 Project Structure

```
src/
├── index.ts           # Entry point & middleware
├── config/
│   ├── env.ts         # Environment validation
│   └── database.ts    # Database placeholder
├── middleware/        # Error handler, rate limit, logging
├── routes/            # Route definitions
├── controllers/       # Request handlers
├── services/          # Business logic
├── validators/        # Zod schemas
├── types/             # TypeScript types
└── utils/             # Logger, error classes
```

## 🚀 Getting Started

```bash
bun install
cp .env.example .env
bun run dev
```

App available at `http://localhost:3000`

## 📜 Scripts

```bash
bun run dev     # Dev server with hot reload
bun run start   # Production server
bun run build   # Build for production
bun run lint    # Type check + ESLint (auto-fix)
```

## 📡 API

```
GET    /health            # Health check
GET    /api/v1/users      # List users
GET    /api/v1/users/:id  # Get user
POST   /api/v1/users      # Create user
PUT    /api/v1/users/:id  # Update user
DELETE /api/v1/users/:id  # Delete user
```

## ⚙️ Environment

See [.env.example](.env.example) for all options.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `LOG_LEVEL` | info | debug/info/warn/error |
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `CORS_ORIGIN` | * | Allowed origins |

## 🔐 Security

- Secure headers (`hono/secure-headers`)
- CORS configuration
- Rate limiting
- Request ID tracking
- Input validation (Zod)

## 📚 Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Validation**: Zod
- **Linting**: ESLint (@antfu/eslint-config)

## 📖 Resources

- [Hono](https://hono.dev/)
- [Zod](https://zod.dev/)
- [Bun](https://bun.sh/)
