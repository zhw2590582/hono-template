import { z } from 'zod'

// User schemas
export const userSchemas = {
  create: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
  }),

  update: z
    .object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
    })
    .refine(data => data.name || data.email, {
      message: 'At least one field required',
    }),

  id: z.object({
    id: z.string().min(1),
  }),
}

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

// Type exports
export type CreateUserInput = z.infer<typeof userSchemas.create>
export type UpdateUserInput = z.infer<typeof userSchemas.update>
