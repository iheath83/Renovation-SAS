import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { projetId } = req.params;
  const query = req.validatedQuery || req.query;
  const { cursor, limit = 20, statut, priorite, pieceId } = query;
  const takeLimit = typeof limit === 'number' ? limit : parseInt(limit, 10) || 20;

  const where = {
    projetId,
    deletedAt: null,
    ...(statut && { statut }),
    ...(priorite && { priorite }),
    ...(pieceId && { pieceId }),
  };

  const taches = await prisma.tache.findMany({
    where,
    take: takeLimit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      piece: { select: { id: true, name: true } },
      sousTaches: { orderBy: { ordre: 'asc' } },
      _count: { select: { dependances: true, dependantsDe: true } },
    },
  });

  const hasMore = taches.length > takeLimit;
  const data = hasMore ? taches.slice(0, -1) : taches;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { projetId } = req.params;

  const tache = await prisma.tache.create({
    data: { ...req.body, projetId },
    include: { sousTaches: true },
  });

  res.status(201).json(successResponse(tache));
};

export const getById = async (req, res) => {
  const { tacheId } = req.params;

  const tache = await prisma.tache.findUnique({
    where: { id: tacheId, deletedAt: null },
    include: {
      piece: { select: { id: true, name: true } },
      sousTaches: { orderBy: { ordre: 'asc' } },
      dependances: { include: { dependance: { select: { id: true, title: true } } } },
      dependantsDe: { include: { tache: { select: { id: true, title: true } } } },
    },
  });

  res.json(successResponse(tache));
};

export const update = async (req, res) => {
  const { tacheId } = req.params;

  const tache = await prisma.tache.update({
    where: { id: tacheId },
    data: req.body,
    include: { sousTaches: true },
  });

  res.json(successResponse(tache));
};

export const softDelete = async (req, res) => {
  const { tacheId } = req.params;

  await prisma.tache.update({
    where: { id: tacheId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

// Sous-tâches
export const createSousTache = async (req, res) => {
  const { tacheId } = req.params;

  const sousTache = await prisma.sousTache.create({
    data: { ...req.body, tacheId },
  });

  res.status(201).json(successResponse(sousTache));
};

export const updateSousTache = async (req, res) => {
  const { sousTacheId } = req.params;

  const sousTache = await prisma.sousTache.update({
    where: { id: sousTacheId },
    data: req.body,
  });

  res.json(successResponse(sousTache));
};

export const deleteSousTache = async (req, res) => {
  const { sousTacheId } = req.params;

  await prisma.sousTache.delete({
    where: { id: sousTacheId },
  });

  res.json(successResponse({ deleted: true }));
};

// Dépendances
export const addDependance = async (req, res) => {
  const { tacheId } = req.params;
  const { dependanceId } = req.body;

  const dependance = await prisma.tacheDependance.create({
    data: { tacheId, dependanceId },
  });

  res.status(201).json(successResponse(dependance));
};

export const removeDependance = async (req, res) => {
  const { tacheId, dependanceId } = req.params;

  await prisma.tacheDependance.delete({
    where: { tacheId_dependanceId: { tacheId, dependanceId } },
  });

  res.json(successResponse({ deleted: true }));
};

