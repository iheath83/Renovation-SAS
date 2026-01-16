import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  try {
    const { projetId } = req.params;
    const { cursor, limit, categorie, pieceId, tacheId, passeDansCredit } = req.query;

    const limitNum = limit ? parseInt(limit, 10) : 20;

    const where = {
      projetId,
      deletedAt: null,
      ...(categorie && { categorie }),
      ...(pieceId && { pieceId }),
      ...(tacheId && { tacheId }),
      ...(passeDansCredit !== undefined && { passeDansCredit }),
    };

    const depenses = await prisma.depense.findMany({
      where,
      take: limitNum + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { dateDepense: 'desc' },
      include: {
        piece: { select: { id: true, name: true } },
        tache: { select: { id: true, title: true } },
        materiau: { select: { id: true, name: true } },
        deblocage: { select: { id: true, montant: true } },
      },
    });

    const hasMore = depenses.length > limitNum;
    const data = hasMore ? depenses.slice(0, -1) : depenses;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    res.json(listResponse(data, { nextCursor, hasMore }));
  } catch (error) {
    console.error('Error in list depenses:', error);
    throw error;
  }
};

export const create = async (req, res) => {
  const { projetId } = req.params;

  const depense = await prisma.depense.create({
    data: { ...req.body, projetId },
    include: {
      piece: { select: { id: true, name: true } },
      tache: { select: { id: true, title: true } },
    },
  });

  res.status(201).json(successResponse(depense));
};

export const getById = async (req, res) => {
  const { depenseId } = req.params;

  const depense = await prisma.depense.findUnique({
    where: { id: depenseId, deletedAt: null },
    include: {
      piece: { select: { id: true, name: true } },
      tache: { select: { id: true, title: true } },
      materiau: { select: { id: true, name: true } },
      deblocage: { select: { id: true, montant: true, dateDeblocage: true } },
    },
  });

  res.json(successResponse(depense));
};

export const update = async (req, res) => {
  const { depenseId } = req.params;

  const depense = await prisma.depense.update({
    where: { id: depenseId },
    data: req.body,
  });

  res.json(successResponse(depense));
};

export const softDelete = async (req, res) => {
  const { depenseId } = req.params;

  await prisma.depense.update({
    where: { id: depenseId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

