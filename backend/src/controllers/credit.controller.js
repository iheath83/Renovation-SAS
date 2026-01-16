import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { projetId } = req.params;
  const { cursor, limit } = req.query;

  const credits = await prisma.credit.findMany({
    where: { projetId, deletedAt: null },
    take: (limit || 20) + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      deblocages: { where: { deletedAt: null }, orderBy: { dateDeblocage: 'desc' } },
    },
  });

  const hasMore = credits.length > (limit || 20);
  const data = hasMore ? credits.slice(0, -1) : credits;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { projetId } = req.params;

  const credit = await prisma.credit.create({
    data: { ...req.body, projetId },
  });

  res.status(201).json(successResponse(credit));
};

export const getById = async (req, res) => {
  const { creditId } = req.params;

  const credit = await prisma.credit.findUnique({
    where: { id: creditId, deletedAt: null },
    include: {
      deblocages: { where: { deletedAt: null }, orderBy: { dateDeblocage: 'desc' } },
    },
  });

  res.json(successResponse(credit));
};

export const update = async (req, res) => {
  const { creditId } = req.params;

  const credit = await prisma.credit.update({
    where: { id: creditId },
    data: req.body,
  });

  res.json(successResponse(credit));
};

export const softDelete = async (req, res) => {
  const { creditId } = req.params;

  await prisma.credit.update({
    where: { id: creditId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

