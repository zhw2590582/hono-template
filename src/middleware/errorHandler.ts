import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { ZodError } from 'zod'
import { logger } from '../utils'
import { AppError } from '../utils/errors'

export async function errorHandler(c: Context<AppEnv>, next: () => Promise<void>) {
  try {
    await next()
  }
  catch (error) {
    const requestId = c.get('requestId')

    // Zod 验证错误
    if (error instanceof ZodError) {
      logger.warn('Validation error', { errors: error.issues, requestId })
      return c.json(
        {
          code: 400,
          message: 'Validation failed',
          errors: error.issues.map(e => ({ path: e.path.join('.'), message: e.message })),
          requestId,
        },
        400,
      )
    }

    // 应用错误
    if (error instanceof AppError) {
      const level = error.isOperational ? 'warn' : 'error'
      logger[level]('App error', {
        message: error.message,
        statusCode: error.statusCode,
        requestId,
      })
      return c.json(
        { code: error.statusCode, message: error.message, requestId },
        error.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
      )
    }

    // 未知错误
    logger.error('Unhandled error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
    })
    return c.json({ code: 500, message: 'Internal Server Error', requestId }, 500)
  }
}
