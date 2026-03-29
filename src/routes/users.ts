import type { AppEnv } from '../types'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { userController } from '../controllers'
import { userSchemas } from '../validators'

const users = new Hono<AppEnv>()

users.get('/', userController.getAll)
users.get('/:id', zValidator('param', userSchemas.id), userController.getById)
users.post('/', zValidator('json', userSchemas.create), userController.create)
users.put(
  '/:id',
  zValidator('param', userSchemas.id),
  zValidator('json', userSchemas.update),
  userController.update,
)
users.delete('/:id', zValidator('param', userSchemas.id), userController.delete)

export default users
