import { z } from 'zod';

export const createProjetSchema = {
  body: z.object({
    name: z.string().min(1, 'Le nom est requis').max(255),
    description: z.string().optional(),
  }),
};

export const updateProjetSchema = {
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    projetId: z.string().cuid(),
  }),
};

export const queryProjetSchema = {
  query: z.object({
    cursor: z.string().cuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
};

export const projetParamsSchema = {
  params: z.object({
    projetId: z.string().cuid(),
  }),
};

