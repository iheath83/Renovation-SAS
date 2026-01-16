import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as ideeController from '../controllers/ideePinterest.controller.js';
import {
  createIdeeSchema,
  updateIdeeSchema,
  queryIdeeSchema,
} from '../validators/inspiration.validator.js';

const router = Router({ mergeParams: true });

router.post('/extract', asyncHandler(ideeController.extractMetadata));
router.get('/', validate(queryIdeeSchema), asyncHandler(ideeController.list));
router.post('/', validate(createIdeeSchema), asyncHandler(ideeController.create));
router.get('/:ideeId', asyncHandler(ideeController.getById));
router.patch('/:ideeId', validate(updateIdeeSchema), asyncHandler(ideeController.update));
router.delete('/:ideeId', asyncHandler(ideeController.softDelete));

export default router;

