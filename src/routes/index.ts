import type { AppEnv } from '../types'
import { Hono } from 'hono'
import { config } from '../config/env'
import auth from './auth'
import health from './health'
import users from './users'
import ws, { websocket } from './ws'

const routes = new Hono<AppEnv>()

// 健康检查
routes.route('/health', health)

// WebSocket 路由
routes.route('/ws', ws)

// API 路由
const api = new Hono<AppEnv>()
api.route('/auth', auth)
api.route('/users', users)

routes.route(config.apiPrefix, api)

export { websocket }
export default routes
