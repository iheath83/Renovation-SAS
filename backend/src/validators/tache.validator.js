import { z } from 'zod';

const statutTacheEnum = z.enum(['A_FAIRE', 'EN_COURS', 'EN_ATTENTE', 'TERMINE']);
const prioriteEnum = z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE']);

export const createTacheSchema = {
  body: z.object({
    title: z.string().min(1, 'Le titre est requis').max(255),
    description: z.string().optional(),
    pieceId: z.string().cuid().optional(),
    statut: statutTacheEnum.default('A_FAIRE'),
    priorite: prioriteEnum.default('MOYENNE'),
    dateDebut: z.coerce.date().optional(),
    dateFin: z.coerce.date().optional(),
    coutEstime: z.number().positive().optional(),
    coutReel: z.number().positive().optional(),
    pourcentage: z.number().int().min(0).max(100).default(0),
  }),
};

export const updateTacheSchema = {
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    pieceId: z.string().cuid().nullable().optional(),
    statut: statutTacheEnum.optional(),
    priorite: prioriteEnum.optional(),
    dateDebut: z.coerce.date().nullable().optional(),
    dateFin: z.coerce.date().nullable().optional(),
    coutEstime: z.number().positive().nullable().optional(),
    coutReel: z.number().positive().nullable().optional(),
    pourcentage: z.number().int().min(0).max(100).optional(),
  }),
};

export const queryTacheSchema = {
  query: z.object({
    cursor: z.string().cuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    statut: statutTacheEnum.optional(),
    priorite: prioriteEnum.optional(),
    pieceId: z.string().cuid().optional(),
  }),
};

export const createSousTacheSchema = {
  body: z.object({
    title: z.string().min(1, 'Le titre est requis').max(255),
    completed: z.boolean().default(false),
    ordre: z.number().int().default(0),
  }),
};

export const updateSousTacheSchema = {
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    completed: z.boolean().optional(),
    ordre: z.number().int().optional(),
  }),
};

export const dependanceSchema = {
  body: z.object({
    dependanceId: z.string().cuid(),
  }),
};

