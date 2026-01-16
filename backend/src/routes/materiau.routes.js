import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import * as materiauController from '../controllers/materiau.controller.js';
import {
  createMateriauSchema,
  updateMateriauSchema,
  queryMateriauSchema,
  associatePieceSchema,
} from '../validators/materiau.validator.js';

const router = Router({ mergeParams: true });

router.get('/', validate(queryMateriauSchema), asyncHandler(materiauController.list));
router.post('/', validate(createMateriauSchema), asyncHandler(materiauController.create));
router.get('/:materiauId', asyncHandler(materiauController.getById));
router.patch('/:materiauId', validate(updateMateriauSchema), asyncHandler(materiauController.update));
router.delete('/:materiauId', asyncHandler(materiauController.softDelete));

// Association avec pièces
router.post('/:materiauId/pieces', validate(associatePieceSchema), asyncHandler(materiauController.associatePiece));
router.delete('/:materiauId/pieces/:pieceId', asyncHandler(materiauController.dissociatePiece));

export default router;

