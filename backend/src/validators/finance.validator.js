import { z } from 'zod';

// Credit
export const createCreditSchema = {
  body: z.object({
    banque: z.string().min(1, 'La banque est requise').max(255),
    montantTotal: z.number().positive('Le montant doit être positif'),
    tauxInteret: z.number().min(0).max(100).optional(),
    duree: z.number().int().positive().optional(),
    notes: z.string().optional(),
  }),
};

export const updateCreditSchema = {
  body: z.object({
    banque: z.string().min(1).max(255).optional(),
    montantTotal: z.number().positive().optional(),
    tauxInteret: z.number().min(0).max(100).nullable().optional(),
    duree: z.number().int().positive().nullable().optional(),
    notes: z.string().optional(),
  }),
};

// Deblocage
export const createDeblocageSchema = {
  body: z.object({
    montant: z.number().positive('Le montant doit être positif'),
    dateDeblocage: z.coerce.date(),
    justificatifs: z.any().optional(),
    notes: z.string().optional(),
  }),
};

export const updateDeblocageSchema = {
  body: z.object({
    montant: z.number().positive().optional(),
    dateDeblocage: z.coerce.date().optional(),
    justificatifs: z.any().optional(),
    notes: z.string().optional(),
  }),
};

// Depense
export const createDepenseSchema = {
  body: z.object({
    montant: z.number().positive('Le montant doit être positif'),
    description: z.string().optional(),
    categorie: z.string().max(100).optional(),
    fournisseur: z.string().optional(),
    dateDepense: z.coerce.date().default(() => new Date()),
    factures: z.any().optional(),
    passeDansCredit: z.boolean().default(false),
    estPrevue: z.boolean().default(false),
    pieceId: z.string().cuid().optional(),
    tacheId: z.string().cuid().optional(),
    materiauId: z.string().cuid().optional(),
    deblocageId: z.string().cuid().optional(),
  }),
};

export const updateDepenseSchema = {
  body: z.object({
    montant: z.number().positive().optional(),
    description: z.string().optional(),
    categorie: z.string().max(100).optional(),
    fournisseur: z.string().optional(),
    dateDepense: z.coerce.date().optional(),
    factures: z.any().optional(),
    passeDansCredit: z.boolean().optional(),
    estPrevue: z.boolean().optional(),
    pieceId: z.string().cuid().nullable().optional(),
    tacheId: z.string().cuid().nullable().optional(),
    materiauId: z.string().cuid().nullable().optional(),
    deblocageId: z.string().cuid().nullable().optional(),
  }),
};

export const queryDepenseSchema = {
  query: z.object({
    cursor: z.string().cuid().optional(),
    limit: z.coerce.number().min(1).max(1000).default(20),
    categorie: z.string().optional(),
    pieceId: z.string().cuid().optional(),
    tacheId: z.string().cuid().optional(),
    passeDansCredit: z.coerce.boolean().optional(),
  }),
};

