import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as creditController from '../controllers/credit.controller.js';
import {
  createCreditSchema,
  updateCreditSchema,
} from '../validators/finance.validator.js';
import deblocageRoutes from './deblocage.routes.js';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(creditController.list));
router.post('/', validate(createCreditSchema), asyncHandler(creditController.create));
router.get('/:creditId', asyncHandler(creditController.getById));
router.patch('/:creditId', validate(updateCreditSchema), asyncHandler(creditController.update));
router.delete('/:creditId', asyncHandler(creditController.softDelete));

// Nested deblocages
router.use('/:creditId/deblocages', deblocageRoutes);

export default router;

