import type { AppEnv } from '../types'
import { Hono } from 'hono'
import { db } from '../config/database'

const health = new Hono<AppEnv>()

health.get('/', (c) => {
  const status = db.healthCheck() ? 'healthy' : 'degraded'
  return c.json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, status === 'healthy' ? 200 : 503)
})

export default health
