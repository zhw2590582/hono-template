import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { config } from '../config/env'

const MAX_STORE_SIZE = 10000
const store = new Map<string, { count: number, resetTime: number }>()

// 定期清理过期记录
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store) {
    if (value.resetTime < now)
      store.delete(key)
  }
}, 60000)

export function rateLimiter(opts?: { max?: number, window?: number }) {
  const max = opts?.max ?? config.rateLimitMax
  const window = opts?.window ?? config.rateLimitWindow

  return async (c: Context<AppEnv>, next: () => Promise<void>) => {
    // 超过存储上限时清理过期记录
    if (store.size > MAX_STORE_SIZE) {
      const now = Date.now()
      for (const [key, value] of store) {
        if (value.resetTime < now)
          store.delete(key)
      }
    }

    const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? c.req.header('x-real-ip') ?? 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    const record = store.get(key)
    if (!record || record.resetTime < now) {
      store.set(key, { count: 1, resetTime: now + window })
    }
    else {
      record.count++
    }

    const current = store.get(key)!
    const remaining = Math.max(0, max - current.count)
    const reset = Math.ceil((current.resetTime - now) / 1000)

    c.res.headers.set('X-RateLimit-Limit', String(max))
    c.res.headers.set('X-RateLimit-Remaining', String(remaining))
    c.res.headers.set('X-RateLimit-Reset', String(reset))

    if (current.count > max) {
      return c.json({ message: 'Too many requests', retryAfter: reset }, 429)
    }

    await next()
  }
}
