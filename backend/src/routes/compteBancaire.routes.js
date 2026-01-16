import express from 'express';
import { CompteBancaireController } from '../controllers/compteBancaire.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(auth);

// Callback OAuth Powens
router.post('/callback', CompteBancaireController.handleCallback);

// Liste des comptes bancaires d'un projet
router.get('/projets/:projetId/comptes-bancaires', CompteBancaireController.list);

// Synchroniser un compte
router.post('/:id/sync', CompteBancaireController.sync);

// Déconnecter un compte
router.delete('/:id', CompteBancaireController.disconnect);

export default router;

