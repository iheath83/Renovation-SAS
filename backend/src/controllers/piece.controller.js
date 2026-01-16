import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { projetId } = req.params;
  const query = req.validatedQuery || req.query;
  const { cursor, limit = 20, type, statut, etage } = query;
  const takeLimit = typeof limit === 'number' ? limit : parseInt(limit, 10) || 20;

  const where = {
    projetId,
    deletedAt: null,
    ...(type && { type }),
    ...(statut && { statut }),
    ...(etage !== undefined && { etage }),
  };

  const pieces = await prisma.piece.findMany({
    where,
    take: takeLimit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { taches: true, materiaux: true, depenses: true } },
    },
  });

  const hasMore = pieces.length > takeLimit;
  const data = hasMore ? pieces.slice(0, -1) : pieces;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { projetId } = req.params;

  const piece = await prisma.piece.create({
    data: { ...req.body, projetId },
  });

  res.status(201).json(successResponse(piece));
};

export const getById = async (req, res) => {
  const { pieceId } = req.params;

  const piece = await prisma.piece.findUnique({
    where: { id: pieceId, deletedAt: null },
    include: {
      _count: { select: { taches: true, materiaux: true, depenses: true } },
    },
  });

  res.json(successResponse(piece));
};

export const update = async (req, res) => {
  const { pieceId } = req.params;

  const piece = await prisma.piece.update({
    where: { id: pieceId },
    data: req.body,
  });

  res.json(successResponse(piece));
};

export const softDelete = async (req, res) => {
  const { pieceId } = req.params;

  await prisma.piece.update({
    where: { id: pieceId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

