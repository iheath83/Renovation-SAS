import express from 'express';
import { TransactionBancaireController } from '../controllers/transactionBancaire.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(auth);

// Liste des transactions d'un projet
router.get('/projets/:projetId/transactions', TransactionBancaireController.list);

// Statistiques des transactions
router.get('/projets/:projetId/transactions/stats', TransactionBancaireController.stats);

// Convertir une transaction en dépense
router.post('/:id/convert', TransactionBancaireController.convertToDepense);

// Ignorer une transaction
router.patch('/:id/ignore', TransactionBancaireController.ignore);

export default router;

