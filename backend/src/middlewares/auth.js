import prisma from '../lib/prisma.js';
import { errorResponse } from '../lib/response.js';
import { verifyAccessToken } from '../lib/tokens.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('Token manquant', 'UNAUTHORIZED')
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, deletedAt: null },
    });

    if (!user) {
      return res.status(401).json(
        errorResponse('Utilisateur non trouvé', 'UNAUTHORIZED')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        errorResponse('Token invalide', 'INVALID_TOKEN')
      );
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        errorResponse('Token expiré', 'TOKEN_EXPIRED')
      );
    }
    next(error);
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json(
      errorResponse('Accès réservé aux administrateurs', 'FORBIDDEN')
    );
  }
  next();
};

