import type { Context } from 'hono'
import type { AppEnv } from '../types'

export async function requestIdMiddleware(c: Context<AppEnv>, next: () => Promise<void>) {
  const id = crypto.randomUUID()
  c.set('requestId', id)
  c.res.headers.set('X-Request-ID', id)
  await next()
}
