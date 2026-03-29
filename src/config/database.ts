import { logger } from '../utils'
import { config } from './env'

/**
 * 数据库连接占位符
 * 使用时替换为实际的数据库客户端，如 Prisma / Drizzle / Kysely
 *
 * @example Prisma
 * import { PrismaClient } from '@prisma/client'
 * export const db = new PrismaClient()
 */

class Database {
  private connected = false

  async connect() {
    if (this.connected || !config.database.url)
      return
    // TODO: 添加实际数据库连接逻辑
    this.connected = true
    logger.info('Database connected')
  }

  async disconnect() {
    if (!this.connected)
      return
    this.connected = false
    logger.info('Database disconnected')
  }

  healthCheck = () => this.connected
}

export const db = new Database()
