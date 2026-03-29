import { randomUUID } from 'node:crypto'

interface User { id: string, name: string, email: string }

// Mock database
const users = new Map<string, User>([
  ['1', { id: '1', name: 'John Doe', email: 'john@example.com' }],
  ['2', { id: '2', name: 'Jane Smith', email: 'jane@example.com' }],
])

export const userService = {
  getAllUsers: async () => Array.from(users.values()),

  getUserById: async (id: string) => users.get(id),

  createUser: async (data: { name: string, email: string }) => {
    const id = randomUUID()
    const newUser = { id, ...data }
    users.set(id, newUser)
    return newUser
  },

  updateUser: async (id: string, data: Partial<{ name: string, email: string }>) => {
    const user = users.get(id)
    if (!user)
      return null
    Object.assign(user, data)
    return user
  },

  deleteUser: async (id: string) => users.delete(id),
}
