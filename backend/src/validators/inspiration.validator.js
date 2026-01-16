import { z } from 'zod';

// IdeePinterest
export const createIdeeSchema = {
  body: z.object({
    url: z.string().url('URL invalide'),
    titre: z.string().max(255).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    couleurs: z.any().optional(),
    materiaux: z.any().optional(),
    style: z.string().max(100).optional(),
    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),
  }),
};

export const updateIdeeSchema = {
  body: z.object({
    url: z.string().url().optional(),
    titre: z.string().max(255).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().nullable().optional(),
    couleurs: z.any().optional(),
    materiaux: z.any().optional(),
    style: z.string().max(100).nullable().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }),
};

export const queryIdeeSchema = {
  query: z.object({
    cursor: z.string().cuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    style: z.string().optional(),
    tags: z.string().optional(), // comma-separated
  }),
};

// Moodboard
export const createMoodboardSchema = {
  body: z.object({
    name: z.string().min(1, 'Le nom est requis').max(255),
    description: z.string().optional(),
    pieceId: z.string().cuid().optional(),
    palette: z.any().optional(),
  }),
};

export const updateMoodboardSchema = {
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    pieceId: z.string().cuid().nullable().optional(),
    palette: z.any().optional(),
  }),
};

export const queryMoodboardSchema = {
  query: z.object({
    cursor: z.string().cuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    pieceId: z.string().cuid().optional(),
  }),
};

export const addIdeeToMoodboardSchema = {
  body: z.object({
    ideeId: z.string().cuid(),
    ordre: z.number().int().default(0),
  }),
};

