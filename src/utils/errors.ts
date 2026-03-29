/**
 * 自定义错误基类
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message = 'Bad Request') {
    return new AppError(400, message)
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, message)
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(403, message)
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, message)
  }

  static conflict(message = 'Resource conflict') {
    return new AppError(409, message)
  }

  static internal(message = 'Internal Server Error') {
    return new AppError(500, message, false)
  }
}

// 便捷别名，保持向后兼容
export const NotFoundError = (msg?: string) => AppError.notFound(msg)
export const BadRequestError = (msg?: string) => AppError.badRequest(msg)
