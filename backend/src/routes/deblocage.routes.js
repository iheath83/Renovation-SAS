import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as deblocageController from '../controllers/deblocage.controller.js';
import {
  createDeblocageSchema,
  updateDeblocageSchema,
} from '../validators/finance.validator.js';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(deblocageController.list));
router.post('/', validate(createDeblocageSchema), asyncHandler(deblocageController.create));
router.get('/:deblocageId', asyncHandler(deblocageController.getById));
router.patch('/:deblocageId', validate(updateDeblocageSchema), asyncHandler(deblocageController.update));
router.delete('/:deblocageId', asyncHandler(deblocageController.softDelete));

export default router;

