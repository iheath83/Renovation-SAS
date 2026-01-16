import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      projets: {
        where: { projet: { deletedAt: null } },
        include: { projet: { select: { id: true, name: true } } },
      },
    },
  });

  res.json(successResponse(user));
};

export const update = async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: req.body,
  });

  res.json(successResponse(user));
};

export const softDelete = async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

// Admin only
export const list = async (req, res) => {
  const { cursor, limit } = req.query;

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    take: (limit || 20) + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { projets: true } },
    },
  });

  const hasMore = users.length > (limit || 20);
  const data = hasMore ? users.slice(0, -1) : users;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const getById = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { projets: true } },
    },
  });

  res.json(successResponse(user));
};

