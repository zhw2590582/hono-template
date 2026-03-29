import type { AppEnv } from './types'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { serveStatic } from 'hono/bun'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { languageDetector } from 'hono/language'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { timeout } from 'hono/timeout'
import { config } from './config/env'
import { errorHandler, rateLimiter, requestIdMiddleware } from './middleware'
import routes, { websocket } from './routes'

const app = new Hono<AppEnv>()

// 中间件（errorHandler 必须最先注册以捕获所有错误）
app.use(errorHandler)
app.use(requestIdMiddleware)
app.use(logger())
app.use(compress())
app.use(timeout(config.timeout))
app.use(bodyLimit({ maxSize: config.bodyLimit }))
app.use(languageDetector({ supportedLanguages: ['en', 'zh'], fallbackLanguage: 'en' }))
app.use('*', secureHeaders())
app.use('*', cors({ origin: config.corsOrigin }))
app.use('/api/*', csrf({ origin: config.corsOrigin === '*' ? undefined : config.corsOrigin }))
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
