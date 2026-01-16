import { z } from 'zod';

const categorieEnum = z.enum([
  'PEINTURE', 'REVETEMENT_SOL', 'REVETEMENT_MUR', 'MENUISERIE',
  'PLOMBERIE', 'ELECTRICITE', 'QUINCAILLERIE', 'AUTRE'
]);

const uniteEnum = z.enum(['UNITE', 'M2', 'ML', 'M', 'L', 'LITRE', 'PIECE', 'KG', 'ROULEAU', 'PACK', 'LOT']);

export const createMateriauSchema = {
  body: z.object({
    name: z.string().min(1, 'Le nom est requis').max(255),
    categorie: categorieEnum.default('AUTRE'),
    prixUnitaire: z.number().positive().optional().nullable(),
    unite: uniteEnum.default('PIECE'),
    reference: z.string().max(255).optional().nullable(),
    fournisseur: z.string().max(255).optional().nullable(),
    lienMarchand: z.string().url().optional().nullable().or(z.literal('')),
    image: z.string().url().optional().nullable().or(z.literal('')),
    notes: z.string().optional().nullable(),
  }),
};

export const updateMateriauSchema = {
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    categorie: categorieEnum.optional(),
    prixUnitaire: z.number().positive().nullable().optional(),
    unite: uniteEnum.optional(),
    reference: z.string().max(255).nullable().optional(),
    fournisseur: z.string().max(255).nullable().optional(),
    lienMarchand: z.string().url().nullable().optional().or(z.literal('')),
    image: z.string().url().nullable().optional().or(z.literal('')),
    notes: z.string().nullable().optional(),
  }),
};

export const queryMateriauSchema = {
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    categorie: categorieEnum.optional(),
    unite: uniteEnum.optional(),
  }).optional().default({}),
};

export const associatePieceSchema = {
  body: z.object({
    pieceId: z.string().cuid(),
    quantite: z.number().positive().default(1),
  }),
};

