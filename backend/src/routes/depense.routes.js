import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as depenseController from '../controllers/depense.controller.js';
import {
  createDepenseSchema,
  updateDepenseSchema,
  queryDepenseSchema,
} from '../validators/finance.validator.js';

const router = Router({ mergeParams: true });

router.get('/', validate(queryDepenseSchema), asyncHandler(depenseController.list));
router.post('/', validate(createDepenseSchema), asyncHandler(depenseController.create));
router.get('/:depenseId', asyncHandler(depenseController.getById));
router.patch('/:depenseId', validate(updateDepenseSchema), asyncHandler(depenseController.update));
router.delete('/:depenseId', asyncHandler(depenseController.softDelete));

export default router;

