import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import { checkProjetAccess } from '../middlewares/checkProjetAccess.js';
import * as projetController from '../controllers/projet.controller.js';
import {
  createProjetSchema,
  updateProjetSchema,
  queryProjetSchema,
  projetParamsSchema,
} from '../validators/projet.validator.js';

// Import nested routes
import pieceRoutes from './piece.routes.js';
import tacheRoutes from './tache.routes.js';
import materiauRoutes from './materiau.routes.js';
import creditRoutes from './credit.routes.js';
import depenseRoutes from './depense.routes.js';
import ideeRoutes from './ideePinterest.routes.js';
import moodboardRoutes from './moodboard.routes.js';

const router = Router();

// Projet CRUD
router.get('/', validate(queryProjetSchema), asyncHandler(projetController.list));
router.post('/', validate(createProjetSchema), asyncHandler(projetController.create));
router.get('/:projetId', validate(projetParamsSchema), checkProjetAccess, asyncHandler(projetController.getById));
router.patch('/:projetId', validate(updateProjetSchema), checkProjetAccess, asyncHandler(projetController.update));
router.delete('/:projetId', validate(projetParamsSchema), checkProjetAccess, asyncHandler(projetController.softDelete));

// Export / Import
router.get('/:projetId/export', validate(projetParamsSchema), checkProjetAccess, asyncHandler(projetController.exportProjet));
router.post('/import', asyncHandler(projetController.importProjet));

// Nested routes - tous avec checkProjetAccess
router.use('/:projetId/pieces', validate(projetParamsSchema), checkProjetAccess, pieceRoutes);
router.use('/:projetId/taches', validate(projetParamsSchema), checkProjetAccess, tacheRoutes);
router.use('/:projetId/materiaux', validate(projetParamsSchema), checkProjetAccess, materiauRoutes);
router.use('/:projetId/credits', validate(projetParamsSchema), checkProjetAccess, creditRoutes);
router.use('/:projetId/depenses', validate(projetParamsSchema), checkProjetAccess, depenseRoutes);
router.use('/:projetId/idees', validate(projetParamsSchema), checkProjetAccess, ideeRoutes);
router.use('/:projetId/moodboards', validate(projetParamsSchema), checkProjetAccess, moodboardRoutes);

export default router;

