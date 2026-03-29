# Agent Instructions

## Project Overview

Enterprise-grade Hono REST API scaffold with TypeScript, Zod validation, and layered architecture.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Validation**: Zod + @hono/zod-validator
- **Linting**: ESLint (@antfu/eslint-config)

## Commands

```bash
bun run dev     # Start dev server (hot reload)
bun run start   # Start production server
bun run build   # Bundle to dist/
bun run lint    # Type check + ESLint (auto-fix)
```

## Project Structure

```
src/
├── index.ts           # Entry point, middleware setup
├── config/
│   ├── env.ts         # Environment validation (Zod)
│   └── database.ts    # Database placeholder
├── middleware/
│   ├── auth.ts        # JWT authentication
│   ├── errorHandler.ts
│   ├── rateLimit.ts
│   ├── requestId.ts
│   └── requestLogger.ts
├── routes/
│   ├── auth.ts        # Auth routes (login, me, refresh)
│   ├── health.ts
│   ├── users.ts
│   └── index.ts
├── controllers/       # Request handlers
├── services/          # Business logic
├── validators/        # Zod schemas
├── types/             # TypeScript types
└── utils/
    ├── errors.ts      # AppError class
    └── logger.ts      # Structured logger
example/
└── login.html         # JWT login demo page
```

## Code Conventions

### Error Handling

Use static factory methods on `AppError`:

```typescript
import { AppError } from '../utils/errors'

throw AppError.notFound('User not found')
throw AppError.badRequest('Invalid email')
throw AppError.unauthorized()
```

### Validation

Define schemas in `src/validators/`:

```typescript
import { z } from 'zod'

export const userSchemas = {
  create: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
  }),
}
```

Use in routes with `zValidator`:

```typescript
import { zValidator } from '@hono/zod-validator'

users.post('/', zValidator('json', userSchemas.create), controller.create)
```

### Logging

```typescript
import { logger } from '../utils'

logger.info('Message', { context: 'data' })
logger.error('Error', { error })
```

### Adding New Resources

1. Create validator in `src/validators/`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Create route in `src/routes/`
5. Register route in `src/routes/index.ts`

## Environment Variables

See `.env.example`. Key variables:

- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - debug/info/warn/error
- `RATE_LIMIT_MAX` - Max requests per window
- `CORS_ORIGIN` - Allowed origins
- `JWT_SECRET` - JWT signing secret (change in production!)
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `DATABASE_URL` - Database connection string

## Authentication (JWT with httpOnly Cookie)

Token is stored in httpOnly cookie for security (prevents XSS attacks).

### Auth Routes

```
POST /api/v1/auth/login   # Login, sets httpOnly cookie
GET  /api/v1/auth/me      # Get current user (protected)
POST /api/v1/auth/refresh # Refresh token (protected)
POST /api/v1/auth/logout  # Logout, clears cookie
```

### Protecting Routes

```typescript
import { authMiddleware } from '../middleware'

// Single route
router.get('/protected', authMiddleware, handler)

// All routes in router
router.use(authMiddleware)
```

### Frontend Usage

Use `credentials: 'include'` in fetch requests:

```javascript
fetch('/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
```

### Demo Page

Visit `http://localhost:3000/example/login.html` for a working login demo.

Test accounts:
- admin@example.com / 123456
- user@example.com / 123456

## Testing

(Not yet configured - add vitest or bun:test as needed)

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml`:
- Runs on push/PR to main
- Installs deps with Bun
- Runs `bun run lint` (type check + ESLint)
