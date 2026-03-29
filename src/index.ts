import type { AppEnv } from './types'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { config } from './config/env'
import { errorHandler, rateLimiter, requestIdMiddleware, requestLogger } from './middleware'
import routes, { websocket } from './routes'

const app = new Hono<AppEnv>()

// 中间件（errorHandler 必须最先注册以捕获所有错误）
app.use(errorHandler)
app.use(requestIdMiddleware)
app.use(requestLogger)
app.use('*', secureHeaders())
app.use('*', cors({ origin: config.corsOrigin }))
app.use('/api/*', rateLimiter())

// 静态文件（example 目录）
app.use('/example/*', serveStatic({ root: './' }))

// 路由
app.route('', routes)

// 404
app.notFound(c => c.json({ message: 'Not Found' }, 404))

export default {
  fetch: app.fetch,
  websocket,
}
