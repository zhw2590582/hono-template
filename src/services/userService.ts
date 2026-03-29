// Mock database
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
]

export const userService = {
  getAllUsers: async () => {
    return users
  },

  getUserById: async (id: string) => {
    return users.find(u => u.id === id)
  },

  createUser: async (data: { name: string, email: string }) => {
    const newUser = {
      id: `${users.length + 1}`,
      ...data,
    }
    users.push(newUser)
    return newUser
  },

  updateUser: async (id: string, data: Partial<{ name: string, email: string }>) => {
    const user = users.find(u => u.id === id)
    if (!user)
      return null
    Object.assign(user, data)
    return user
  },

  deleteUser: async (id: string) => {
    const index = users.findIndex(u => u.id === id)
    if (index === -1)
      return false
    users.splice(index, 1)
    return true
  },
}
