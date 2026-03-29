import type { Context, Next } from 'hono'
import type { AppEnv, JwtPayload } from '../types'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { config } from '../config/env'
import { AppError } from '../utils/errors'

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  // 优先从 cookie 获取，然后从 Authorization header 获取
  let token = getCookie(c, 'token')

  if (!token) {
    const authHeader = c.req.header('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }

  if (!token) {
    throw AppError.unauthorized('Missing token')
  }

  try {
    const payload = await verify(token, config.jwt.secret, 'HS256') as unknown as JwtPayload
    c.set('jwtPayload', payload)
    c.set('user', { id: payload.sub, name: payload.name, email: payload.email })
    await next()
  }
  catch {
    throw AppError.unauthorized('Invalid or expired token')
  }
}
