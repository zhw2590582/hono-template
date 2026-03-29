import type { AppEnv } from '../types'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import { z } from 'zod'
import { config } from '../config/env'
import { authMiddleware } from '../middleware'
import { AppError } from '../utils/errors'

const auth = new Hono<AppEnv>()

const COOKIE_NAME = 'token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

// 登录 schema
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

// Mock 用户数据（实际应从数据库获取）
const mockUsers = [
  { id: '1', name: 'Admin', email: 'admin@example.com', password: '123456' },
  { id: '2', name: 'User', email: 'user@example.com', password: '123456' },
]

// 设置 token cookie
function setTokenCookie(c: Parameters<typeof setCookie>[0], token: string) {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

// 登录
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = mockUsers.find(u => u.email === email && u.password === password)
  if (!user) {
    throw AppError.unauthorized('Invalid email or password')
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + COOKIE_MAX_AGE

  const token = await sign(
    { sub: user.id, name: user.name, email: user.email, exp },
    config.jwt.secret,
  )

  setTokenCookie(c, token)

  return c.json({
    user: { id: user.id, name: user.name, email: user.email },
  })
})

// 获取当前用户（需要认证）
auth.get('/me', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({ user })
})

// 刷新 token（需要认证）
auth.post('/refresh', authMiddleware, async (c) => {
  const user = c.get('user')!
  const now = Math.floor(Date.now() / 1000)
  const exp = now + COOKIE_MAX_AGE

  const token = await sign(
    { sub: user.id, name: user.name, email: user.email, exp },
    config.jwt.secret,
  )

  setTokenCookie(c, token)

  return c.json({ message: 'Token refreshed' })
})

// 登出
auth.post('/logout', (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' })
  return c.json({ message: 'Logged out' })
})

export default auth
