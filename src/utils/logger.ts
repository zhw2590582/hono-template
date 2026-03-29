import { config } from '../config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

class Logger {
  private minLevel = LEVELS[config.logLevel] || 1

  private log(level: LogLevel, message: string, ctx?: Record<string, unknown>) {
    if (LEVELS[level] < this.minLevel)
      return
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...ctx,
    }
    const output
      = config.env === 'production'
        ? JSON.stringify(entry)
        : `[${entry.level}] ${entry.timestamp} - ${message}${ctx ? ` ${JSON.stringify(ctx)}` : ''}`
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](output)
  }

  debug(message: string, ctx?: Record<string, unknown>) {
    this.log('debug', message, ctx)
  }

  info(message: string, ctx?: Record<string, unknown>) {
    this.log('info', message, ctx)
  }

  warn(message: string, ctx?: Record<string, unknown>) {
    this.log('warn', message, ctx)
  }

  error(message: string, ctx?: Record<string, unknown>) {
    this.log('error', message, ctx)
  }
}

export const logger = new Logger()
