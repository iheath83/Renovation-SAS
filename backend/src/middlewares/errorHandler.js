import { errorResponse } from '../lib/response.js';

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ZodError') {
    return res.status(400).json(
      errorResponse('Données invalides', 'VALIDATION_ERROR', err.errors)
    );
  }

  if (err.code === 'P2025') {
    return res.status(404).json(
      errorResponse('Ressource non trouvée', 'NOT_FOUND')
    );
  }

  if (err.code === 'P2002') {
    return res.status(409).json(
      errorResponse('Cette ressource existe déjà', 'DUPLICATE')
    );
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, err.code || 'ERROR')
    );
  }

  res.status(500).json(
    errorResponse('Erreur interne du serveur', 'INTERNAL_ERROR')
  );
};

