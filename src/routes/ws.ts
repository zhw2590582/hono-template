import type { AppEnv } from '../types'
import { Hono } from 'hono'
import { upgradeWebSocket, websocket } from 'hono/bun'
import { z } from 'zod'
import { logger } from '../utils'

const ws = new Hono<AppEnv>()

// 消息验证 schema
const messageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('chat'), message: z.string().min(1).max(1000), user: z.string().max(50).optional() }),
  z.object({ type: z.literal('ping') }),
])

// 存储所有连接的客户端
const clients = new Set<{ send: (data: string) => void }>()

// WebSocket 路由
ws.get(
  '/',
  upgradeWebSocket(() => {
    return {
      onOpen(_event, ws) {
        clients.add(ws)
        logger.info('WebSocket client connected', { total: clients.size })

        // 发送欢迎消息
        ws.send(JSON.stringify({
          type: 'system',
          message: 'Connected to WebSocket server',
          timestamp: new Date().toISOString(),
          clients: clients.size,
        }))

        // 广播新用户加入
        broadcast({
          type: 'system',
          message: 'A new user joined',
          clients: clients.size,
        }, ws)
      },

      onMessage(event, ws) {
        let rawData: unknown
        try {
          rawData = JSON.parse(event.data.toString())
        }
        catch {
          rawData = null
        }

        const parsed = messageSchema.safeParse(rawData)
        if (!parsed.success) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format', timestamp: new Date().toISOString() }))
          return
        }

        const data = parsed.data
        logger.info('WebSocket message received', { type: data.type })

        switch (data.type) {
          case 'chat':
            broadcast({
              type: 'chat',
              user: data.user || 'Anonymous',
              message: data.message,
              timestamp: new Date().toISOString(),
            })
            break
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }))
            break
        }
      },

      onClose(_event, ws) {
        clients.delete(ws)
        logger.info('WebSocket client disconnected', { total: clients.size })

        // 广播用户离开
        broadcast({
          type: 'system',
          message: 'A user left',
          clients: clients.size,
        })
      },

      onError(event) {
        logger.error('WebSocket error', { error: event })
      },
    }
  }),
)

// 广播消息给所有客户端（可选排除某个客户端）
function broadcast(data: object, exclude?: { send: (data: string) => void }) {
  const message = JSON.stringify(data)
  for (const client of clients) {
    if (client !== exclude) {
      try {
        client.send(message)
      }
      catch {
        clients.delete(client)
      }
    }
  }
}

export { websocket }
export default ws
