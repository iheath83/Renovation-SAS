import { z } from 'zod';

const typePieceEnum = z.enum([
  'SALON', 'CUISINE', 'CHAMBRE', 'SDB', 'WC', 'BUREAU', 
  'COULOIR', 'GARAGE', 'EXTERIEUR', 'AUTRE'
]);

const statutPieceEnum = z.enum(['A_FAIRE', 'EN_COURS', 'TERMINE']);

export const createPieceSchema = {
  body: z.object({
    name: z.string().min(1, 'Le nom est requis').max(255),
    type: typePieceEnum.default('AUTRE'),
    etage: z.number().int().optional(),
    surface: z.number().positive().optional(),
    budget: z.number().positive().optional(),
    statut: statutPieceEnum.default('A_FAIRE'),
    images: z.any().optional(),
    tags: z.array(z.string()).default([]),
  }),
};

export const updatePieceSchema = {
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    type: typePieceEnum.optional(),
    etage: z.number().int().optional(),
    surface: z.number().positive().optional(),
    budget: z.number().positive().optional(),
    statut: statutPieceEnum.optional(),
    images: z.any().optional(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({
    projetId: z.string().cuid(),
    pieceId: z.string().cuid(),
  }),
};

export const queryPieceSchema = {
  query: z.object({
    cursor: z.string().cuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    type: typePieceEnum.optional(),
    statut: statutPieceEnum.optional(),
    etage: z.coerce.number().int().optional(),
  }),
};

