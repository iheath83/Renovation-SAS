import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { projetId } = req.params;
  const { cursor, limit, pieceId } = req.query;

  const where = {
    projetId,
    deletedAt: null,
    ...(pieceId && { pieceId }),
  };

  const moodboards = await prisma.moodboard.findMany({
    where,
    take: (limit || 20) + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      piece: { select: { id: true, name: true } },
      _count: { select: { idees: true } },
    },
  });

  const hasMore = moodboards.length > (limit || 20);
  const data = hasMore ? moodboards.slice(0, -1) : moodboards;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { projetId } = req.params;

  const moodboard = await prisma.moodboard.create({
    data: { ...req.body, projetId },
  });

  res.status(201).json(successResponse(moodboard));
};

export const getById = async (req, res) => {
  const { moodboardId } = req.params;

  const moodboard = await prisma.moodboard.findUnique({
    where: { id: moodboardId, deletedAt: null },
    include: {
      piece: { select: { id: true, name: true } },
      idees: {
        orderBy: { ordre: 'asc' },
        include: { idee: true },
      },
    },
  });

  res.json(successResponse(moodboard));
};

export const update = async (req, res) => {
  const { moodboardId } = req.params;

  const moodboard = await prisma.moodboard.update({
    where: { id: moodboardId },
    data: req.body,
  });

  res.json(successResponse(moodboard));
};

export const softDelete = async (req, res) => {
  const { moodboardId } = req.params;

  await prisma.moodboard.update({
    where: { id: moodboardId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

// Gestion des idées dans le moodboard
export const addIdee = async (req, res) => {
  const { moodboardId } = req.params;
  const { ideeId, ordre } = req.body;

  const relation = await prisma.ideesMoodboard.upsert({
    where: { ideeId_moodboardId: { ideeId, moodboardId } },
    create: { ideeId, moodboardId, ordre },
    update: { ordre },
  });

  res.status(201).json(successResponse(relation));
};

export const removeIdee = async (req, res) => {
  const { moodboardId, ideeId } = req.params;

  await prisma.ideesMoodboard.delete({
    where: { ideeId_moodboardId: { ideeId, moodboardId } },
  });

  res.json(successResponse({ deleted: true }));
};

