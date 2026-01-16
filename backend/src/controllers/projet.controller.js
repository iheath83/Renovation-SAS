import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { cursor, limit = 20 } = req.validatedQuery || req.query;
  const userId = req.user.id;
  const takeLimit = typeof limit === 'number' ? limit : parseInt(limit, 10) || 20;

  const projets = await prisma.projet.findMany({
    where: {
      deletedAt: null,
      users: { some: { userId } },
    },
    take: takeLimit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      users: { where: { userId }, select: { role: true } },
      _count: { select: { pieces: true, taches: true } },
    },
  });

  const hasMore = projets.length > takeLimit;
  const data = hasMore ? projets.slice(0, -1) : projets;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const projet = await prisma.projet.create({
    data: {
      name,
      description,
      users: {
        create: { userId, role: 'OWNER' },
      },
    },
    include: {
      users: { where: { userId }, select: { role: true } },
    },
  });

  res.status(201).json(successResponse(projet));
};

export const getById = async (req, res) => {
  const { projetId } = req.params;

  const projet = await prisma.projet.findUnique({
    where: { id: projetId, deletedAt: null },
    include: {
      users: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { pieces: true, taches: true, materiaux: true, depenses: true } },
    },
  });

  res.json(successResponse(projet));
};

export const update = async (req, res) => {
  const { projetId } = req.params;
  const data = req.body;

  const projet = await prisma.projet.update({
    where: { id: projetId },
    data,
  });

  res.json(successResponse(projet));
};

export const softDelete = async (req, res) => {
  const { projetId } = req.params;

  await prisma.projet.update({
    where: { id: projetId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

