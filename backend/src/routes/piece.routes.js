import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as pieceController from '../controllers/piece.controller.js';
import {
  createPieceSchema,
  updatePieceSchema,
  queryPieceSchema,
} from '../validators/piece.validator.js';

const router = Router({ mergeParams: true });

router.get('/', validate(queryPieceSchema), asyncHandler(pieceController.list));
router.post('/', validate(createPieceSchema), asyncHandler(pieceController.create));
router.get('/:pieceId', asyncHandler(pieceController.getById));
router.patch('/:pieceId', validate(updatePieceSchema), asyncHandler(pieceController.update));
router.delete('/:pieceId', asyncHandler(pieceController.softDelete));

export default router;

