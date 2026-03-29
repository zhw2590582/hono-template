import type { AppEnv } from '../types'
import { Hono } from 'hono'
import { config } from '../config/env'
import auth from './auth'
import health from './health'
import users from './users'

const routes = new Hono<AppEnv>()

// 健康检查
routes.route('/health', health)

// API 路由
const api = new Hono<AppEnv>()
api.route('/auth', auth)
api.route('/users', users)

routes.route(config.apiPrefix, api)

export default routes
