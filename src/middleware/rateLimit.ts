import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { config } from '../config/env'

const store: Record<string, { count: number, resetTime: number }> = {}

// 定期清理过期记录
setInterval(() => {
  const now = Date.now()
  for (const key of Object.keys(store)) {
    if (store[key].resetTime < now)
      delete store[key]
  }
}, 60000)

export function rateLimiter(opts?: { max?: number, window?: number }) {
  const max = opts?.max ?? config.rateLimitMax
  const window = opts?.window ?? config.rateLimitWindow

  return async (c: Context<AppEnv>, next: () => Promise<void>) => {
    const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    if (!store[key] || store[key].resetTime < now) {
      store[key] = { count: 1, resetTime: now + window }
    }
    else {
      store[key].count++
    }

    const remaining = Math.max(0, max - store[key].count)
    const reset = Math.ceil((store[key].resetTime - now) / 1000)

    c.res.headers.set('X-RateLimit-Limit', String(max))
    c.res.headers.set('X-RateLimit-Remaining', String(remaining))
    c.res.headers.set('X-RateLimit-Reset', String(reset))

    if (store[key].count > max) {
      return c.json({ message: 'Too many requests', retryAfter: reset }, 429)
    }

    await next()
  }
}
