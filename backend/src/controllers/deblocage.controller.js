import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { creditId } = req.params;
  const { cursor, limit } = req.query;

  const deblocages = await prisma.deblocage.findMany({
    where: { creditId, deletedAt: null },
    take: (limit || 20) + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { dateDeblocage: 'desc' },
  });

  const hasMore = deblocages.length > (limit || 20);
  const data = hasMore ? deblocages.slice(0, -1) : deblocages;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { creditId } = req.params;

  const deblocage = await prisma.deblocage.create({
    data: { ...req.body, creditId },
  });

  res.status(201).json(successResponse(deblocage));
};

export const getById = async (req, res) => {
  const { deblocageId } = req.params;

  const deblocage = await prisma.deblocage.findUnique({
    where: { id: deblocageId, deletedAt: null },
    include: {
      depenses: { where: { deletedAt: null } },
    },
  });

  res.json(successResponse(deblocage));
};

export const update = async (req, res) => {
  const { deblocageId } = req.params;

  const deblocage = await prisma.deblocage.update({
    where: { id: deblocageId },
    data: req.body,
  });

  res.json(successResponse(deblocage));
};

export const softDelete = async (req, res) => {
  const { deblocageId } = req.params;

  await prisma.deblocage.update({
    where: { id: deblocageId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

