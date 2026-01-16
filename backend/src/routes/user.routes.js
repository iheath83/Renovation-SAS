import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validate } from '../middlewares/validate.js';
import { isAdmin } from '../middlewares/auth.js';
import * as userController from '../controllers/user.controller.js';
import { updateUserSchema, queryUserSchema } from '../validators/user.validator.js';

const router = Router();

// Routes utilisateur courant
router.get('/me', asyncHandler(userController.me));
router.patch('/me', validate(updateUserSchema), asyncHandler(userController.update));
router.delete('/me', asyncHandler(userController.softDelete));

// Routes admin
router.get('/', isAdmin, validate(queryUserSchema), asyncHandler(userController.list));
router.get('/:userId', isAdmin, asyncHandler(userController.getById));

export default router;

