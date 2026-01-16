import prisma from '../lib/prisma.js';
import { errorResponse } from '../lib/response.js';

export const checkProjetAccess = async (req, res, next) => {
  try {
    const { projetId } = req.params;
    const userId = req.user.id;

    const projetUser = await prisma.projetUser.findUnique({
      where: {
        projetId_userId: { projetId, userId },
      },
      include: {
        projet: true,
      },
    });

    if (!projetUser || projetUser.projet.deletedAt) {
      return res.status(404).json(
        errorResponse('Projet non trouvé ou accès non autorisé', 'NOT_FOUND')
      );
    }

    req.projet = projetUser.projet;
    req.projetRole = projetUser.role;
    next();
  } catch (error) {
    next(error);
  }
};

