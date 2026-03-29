import process from 'node:process'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
  TIMEOUT: z.coerce.number().default(30000),
  BODY_LIMIT: z.coerce.number().default(1024 * 1024), // 1MB
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('your-super-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production' && data.JWT_SECRET.includes('change-in-production')) {
    ctx.addIssue({ code: 'custom', path: ['JWT_SECRET'], message: 'JWT_SECRET must be changed in production' })
  }
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  const errors = result.error.issues.map(e => `  ${e.path.join('.')}: ${e.message}`).join('\n')
  console.error(`Environment validation failed:\n${errors}`)
  process.exit(1)
}
const env = result.data

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,
  logLevel: env.LOG_LEVEL,
  corsOrigin: env.CORS_ORIGIN,
  rateLimitMax: env.RATE_LIMIT_MAX,
  rateLimitWindow: env.RATE_LIMIT_WINDOW,
  timeout: env.TIMEOUT,
  bodyLimit: env.BODY_LIMIT,
  database: { url: env.DATABASE_URL },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
} as const
