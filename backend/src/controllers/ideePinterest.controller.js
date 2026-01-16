import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';
import { extractPinMetadata } from '../services/pinterest.service.js';

export const list = async (req, res) => {
  const { projetId } = req.params;
  const { cursor, limit, style, tags } = req.query;

  const where = {
    projetId,
    deletedAt: null,
    ...(style && { style }),
    ...(tags && { tags: { hasSome: tags.split(',') } }),
  };

  const idees = await prisma.ideePinterest.findMany({
    where,
    take: (limit || 20) + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      moodboards: { include: { moodboard: { select: { id: true, name: true } } } },
    },
  });

  const hasMore = idees.length > (limit || 20);
  const data = hasMore ? idees.slice(0, -1) : idees;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { projetId } = req.params;

  const idee = await prisma.ideePinterest.create({
    data: { ...req.body, projetId },
  });

  res.status(201).json(successResponse(idee));
};

export const getById = async (req, res) => {
  const { ideeId } = req.params;

  const idee = await prisma.ideePinterest.findUnique({
    where: { id: ideeId, deletedAt: null },
    include: {
      moodboards: { include: { moodboard: { select: { id: true, name: true } } } },
    },
  });

  res.json(successResponse(idee));
};

export const update = async (req, res) => {
  const { ideeId } = req.params;

  const idee = await prisma.ideePinterest.update({
    where: { id: ideeId },
    data: req.body,
  });

  res.json(successResponse(idee));
};

export const softDelete = async (req, res) => {
  const { ideeId } = req.params;

  await prisma.ideePinterest.update({
    where: { id: ideeId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

export const extractMetadata = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: { message: 'URL Pinterest requise', code: 'MISSING_URL' },
    });
  }

  try {
    const metadata = await extractPinMetadata(url);
    res.json(successResponse(metadata));
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'EXTRACTION_FAILED' },
    });
  }
};

