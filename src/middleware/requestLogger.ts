import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { logger } from '../utils'

export async function requestLogger(c: Context<AppEnv>, next: () => Promise<void>) {
  const start = performance.now()
  await next()
  const ms = (performance.now() - start).toFixed(2)
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`, {
    requestId: c.get('requestId'),
  })
  c.res.headers.set('X-Response-Time', `${ms}ms`)
}
