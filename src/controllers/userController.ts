import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { userService } from '../services'
import { AppError } from '../utils/errors'

export const userController = {
  getAll: async (c: Context<AppEnv>) => {
    const users = await userService.getAllUsers()
    return c.json({ data: users })
  },

  getById: async (c: Context<AppEnv>) => {
    const user = await userService.getUserById(c.req.param('id')!)
    if (!user)
      throw AppError.notFound('User not found')
    return c.json({ data: user })
  },

  create: async (c: Context<AppEnv>) => {
    const user = await userService.createUser(await c.req.json())
    return c.json({ data: user }, 201)
  },

  update: async (c: Context<AppEnv>) => {
    const user = await userService.updateUser(c.req.param('id')!, await c.req.json())
    if (!user)
      throw AppError.notFound('User not found')
    return c.json({ data: user })
  },

  delete: async (c: Context<AppEnv>) => {
    if (!(await userService.deleteUser(c.req.param('id')!))) {
      throw AppError.notFound('User not found')
    }
    return c.json({ message: 'Deleted' })
  },
}
