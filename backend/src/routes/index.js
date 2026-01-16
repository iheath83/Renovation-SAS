import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import authRoutes from './auth.routes.js';
import projetRoutes from './projet.routes.js';
import userRoutes from './user.routes.js';
import compteBancaireRoutes from './compteBancaire.routes.js';
import transactionBancaireRoutes from './transactionBancaire.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Version info
router.get('/', (req, res) => {
  res.json({ success: true, name: 'RénoVision API', version: '1.0.0' });
});

// Routes auth (publiques)
router.use('/auth', authRoutes);

// Routes protégées par auth
router.use('/projets', auth, projetRoutes);
router.use('/users', auth, userRoutes);
router.use('/comptes-bancaires', compteBancaireRoutes);
router.use('/transactions-bancaires', transactionBancaireRoutes);
router.use('/settings', settingsRoutes);

export default router;

