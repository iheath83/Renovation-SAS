import { z } from 'zod';

export const updateUserSchema = {
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    budgetMaxProjet: z.number().positive().nullable().optional(),
  }),
};

export const queryUserSchema = {
  query: z.object({
    cursor: z.string().cuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
};

