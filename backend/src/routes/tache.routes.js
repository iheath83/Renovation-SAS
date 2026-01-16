import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as tacheController from '../controllers/tache.controller.js';
import {
  createTacheSchema,
  updateTacheSchema,
  queryTacheSchema,
  createSousTacheSchema,
  updateSousTacheSchema,
  dependanceSchema,
} from '../validators/tache.validator.js';

const router = Router({ mergeParams: true });

// Taches CRUD
router.get('/', validate(queryTacheSchema), asyncHandler(tacheController.list));
router.post('/', validate(createTacheSchema), asyncHandler(tacheController.create));
router.get('/:tacheId', asyncHandler(tacheController.getById));
router.patch('/:tacheId', validate(updateTacheSchema), asyncHandler(tacheController.update));
router.delete('/:tacheId', asyncHandler(tacheController.softDelete));

// Sous-tâches
router.post('/:tacheId/sous-taches', validate(createSousTacheSchema), asyncHandler(tacheController.createSousTache));
router.patch('/:tacheId/sous-taches/:sousTacheId', validate(updateSousTacheSchema), asyncHandler(tacheController.updateSousTache));
router.delete('/:tacheId/sous-taches/:sousTacheId', asyncHandler(tacheController.deleteSousTache));

// Dépendances
router.post('/:tacheId/dependances', validate(dependanceSchema), asyncHandler(tacheController.addDependance));
router.delete('/:tacheId/dependances/:dependanceId', asyncHandler(tacheController.removeDependance));

export default router;

