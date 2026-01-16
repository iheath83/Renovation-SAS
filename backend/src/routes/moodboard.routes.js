import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as moodboardController from '../controllers/moodboard.controller.js';
import {
  createMoodboardSchema,
  updateMoodboardSchema,
  queryMoodboardSchema,
  addIdeeToMoodboardSchema,
} from '../validators/inspiration.validator.js';

const router = Router({ mergeParams: true });

router.get('/', validate(queryMoodboardSchema), asyncHandler(moodboardController.list));
router.post('/', validate(createMoodboardSchema), asyncHandler(moodboardController.create));
router.get('/:moodboardId', asyncHandler(moodboardController.getById));
router.patch('/:moodboardId', validate(updateMoodboardSchema), asyncHandler(moodboardController.update));
router.delete('/:moodboardId', asyncHandler(moodboardController.softDelete));

// Gestion des idées dans le moodboard
router.post('/:moodboardId/idees', validate(addIdeeToMoodboardSchema), asyncHandler(moodboardController.addIdee));
router.delete('/:moodboardId/idees/:ideeId', asyncHandler(moodboardController.removeIdee));

export default router;

