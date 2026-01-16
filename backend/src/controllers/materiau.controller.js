import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { projetId } = req.params;
  const { cursor, limit = 20, categorie, unite } = req.query;

  const where = {
    projetId,
    deletedAt: null,
    ...(categorie && { categorie }),
    ...(unite && { unite }),
  };

  const materiaux = await prisma.materiau.findMany({
    where,
    take: Number(limit) + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      pieces: { include: { piece: { select: { id: true, name: true } } } },
    },
  });

  const hasMore = materiaux.length > Number(limit);
  const data = hasMore ? materiaux.slice(0, -1) : materiaux;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { projetId } = req.params;

  const materiau = await prisma.materiau.create({
    data: { ...req.body, projetId },
  });

  res.status(201).json(successResponse(materiau));
};

export const getById = async (req, res) => {
  const { materiauId } = req.params;

  const materiau = await prisma.materiau.findUnique({
    where: { id: materiauId, deletedAt: null },
    include: {
      pieces: { include: { piece: { select: { id: true, name: true } } } },
    },
  });

  res.json(successResponse(materiau));
};

export const update = async (req, res) => {
  const { materiauId } = req.params;

  const materiau = await prisma.materiau.update({
    where: { id: materiauId },
    data: req.body,
  });

  res.json(successResponse(materiau));
};

export const softDelete = async (req, res) => {
  const { materiauId } = req.params;

  await prisma.materiau.update({
    where: { id: materiauId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

// Association avec pièces
export const associatePiece = async (req, res) => {
  const { materiauId } = req.params;
  const { pieceId, quantite } = req.body;

  const association = await prisma.materiauPiece.upsert({
    where: { materiauId_pieceId: { materiauId, pieceId } },
    create: { materiauId, pieceId, quantite },
    update: { quantite },
  });

  res.status(201).json(successResponse(association));
};

export const dissociatePiece = async (req, res) => {
  const { materiauId, pieceId } = req.params;

  await prisma.materiauPiece.delete({
    where: { materiauId_pieceId: { materiauId, pieceId } },
  });

  res.json(successResponse({ deleted: true }));
};

