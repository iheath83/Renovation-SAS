import { Router } from 'express';
import SettingsController from '../controllers/settings.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(auth);

// === USER SETTINGS ===
router.get('/user', SettingsController.getUserSettings);
router.put('/user', SettingsController.updateUserSettings);

// === PROJET SETTINGS ===
router.get('/projets/:id', SettingsController.getProjetSettings);
router.put('/projets/:id', SettingsController.updateProjetSettings);

// === CATEGORIES CUSTOM ===
router.get('/projets/:id/categories', SettingsController.listCategories);
router.post('/projets/:id/categories', SettingsController.createCategory);
router.put('/categories/:categoryId', SettingsController.updateCategory);
router.delete('/categories/:categoryId', SettingsController.deleteCategory);

export default router;

