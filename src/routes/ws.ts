import type { AppEnv } from '../types'
import { Hono } from 'hono'
import { upgradeWebSocket, websocket } from 'hono/bun'
import { logger } from '../utils'

const ws = new Hono<AppEnv>()

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
        try {
          const data = JSON.parse(event.data.toString())
          logger.info('WebSocket message received', { data })

          // 处理不同类型的消息
          switch (data.type) {
            case 'chat':
              // 广播聊天消息给所有客户端
              broadcast({
                type: 'chat',
                user: data.user || 'Anonymous',
                message: data.message,
                timestamp: new Date().toISOString(),
              })
              break

            case 'ping':
              // 回复 pong
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString(),
              }))
              break

            default:
              // 回显未知消息
              ws.send(JSON.stringify({
                type: 'echo',
                original: data,
                timestamp: new Date().toISOString(),
              }))
          }
        }
        catch {
          // 非 JSON 消息，直接回显
          ws.send(JSON.stringify({
            type: 'echo',
            message: event.data.toString(),
            timestamp: new Date().toISOString(),
          }))
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
