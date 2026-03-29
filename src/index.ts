import type { AppEnv } from './types'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { config } from './config/env'
import { errorHandler, rateLimiter, requestIdMiddleware, requestLogger } from './middleware'
import routes from './routes'

const app = new Hono<AppEnv>()

// 中间件
app.use(requestIdMiddleware)
app.use('*', secureHeaders())
app.use('*', cors({ origin: config.corsOrigin }))
app.use('/api/*', rateLimiter())
app.use(errorHandler)
app.use(requestLogger)

// 静态文件（example 目录）
app.use('/example/*', serveStatic({ root: './' }))

// 路由
app.route('', routes)

// 404
app.notFound(c => c.json({ message: 'Not Found' }, 404))

export default app
