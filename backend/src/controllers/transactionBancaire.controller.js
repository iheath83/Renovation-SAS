import prisma from '../lib/prisma.js';
import { CategoService } from '../services/categorisation.service.js';

/**
 * Controller pour la gestion des transactions bancaires
 */
export const TransactionBancaireController = {
  /**
   * Liste les transactions bancaires non traitées d'un projet
   */
  async list(req, res) {
    try {
      const { projetId } = req.params;
      const { statut, limit = 50, offset = 0 } = req.query;
      
      const where = {
        compteBancaire: {
          projetId,
          deletedAt: null,
        },
      };

      if (statut) {
        where.statut = statut;
      }

      const transactions = await prisma.transactionBancaire.findMany({
        where,
        include: {
          compteBancaire: {
            select: {
              id: true,
              banque: true,
              projetId: true,
            }
          },
          depense: {
            select: {
              id: true,
              montant: true,
              description: true,
              categorie: true,
            }
          }
        },
        orderBy: {
          dateTransaction: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

      // Ajouter les suggestions de catégorisation
      const transactionsAvecSuggestions = transactions.map(transaction => ({
        ...transaction,
        suggestion: CategoService.categorizeTransaction(transaction),
      }));

      const total = await prisma.transactionBancaire.count({ where });

      return res.json({
        success: true,
        data: transactionsAvecSuggestions,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        }
      });

    } catch (error) {
      console.error('[TransactionBancaireController] Error in list:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Convertit une transaction en dépense
   */
  async convertToDepense(req, res) {
    try {
      const { id } = req.params;
      const {
        categorie,
        pieceId,
        tacheId,
        materiauId,
        passeDansCredit,
      } = req.body;

      const transaction = await prisma.transactionBancaire.findUnique({
        where: { id },
        include: {
          compteBancaire: true,
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction non trouvée'
        });
      }

      if (transaction.statut === 'CONVERTI') {
        return res.status(400).json({
          success: false,
          error: 'Transaction déjà convertie'
        });
      }

      // Créer la dépense
      const depense = await prisma.depense.create({
        data: {
          projetId: transaction.compteBancaire.projetId,
          montant: transaction.montant,
          description: transaction.description,
          categorie: categorie || transaction.categorie || 'Autre',
          dateDepense: transaction.dateTransaction,
          pieceId,
          tacheId,
          materiauId,
          passeDansCredit: passeDansCredit || false,
          transactionBancaireId: transaction.id,
          importeAutomatiquement: true,
        },
        include: {
          piece: true,
          tache: true,
          materiau: true,
        }
      });

      // Marquer la transaction comme convertie
      await prisma.transactionBancaire.update({
        where: { id },
        data: {
          statut: 'CONVERTI',
          depenseId: depense.id,
          estDepenseRenovation: true,
        }
      });

      return res.status(201).json({
        success: true,
        data: depense
      });

    } catch (error) {
      console.error('[TransactionBancaireController] Error in convertToDepense:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Ignore une transaction (ne pas convertir)
   */
  async ignore(req, res) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transactionBancaire.findUnique({
        where: { id },
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction non trouvée'
        });
      }

      await prisma.transactionBancaire.update({
        where: { id },
        data: {
          statut: 'IGNORE',
        }
      });

      return res.json({
        success: true,
        message: 'Transaction ignorée'
      });

    } catch (error) {
      console.error('[TransactionBancaireController] Error in ignore:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Statistiques des transactions
   */
  async stats(req, res) {
    try {
      const { projetId } = req.params;

      const stats = await prisma.transactionBancaire.groupBy({
        by: ['statut'],
        where: {
          compteBancaire: {
            projetId,
            deletedAt: null,
          }
        },
        _count: {
          id: true,
        },
        _sum: {
          montant: true,
        }
      });

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat.statut] = {
          count: stat._count.id,
          total: stat._sum.montant || 0,
        };
        return acc;
      }, {});

      return res.json({
        success: true,
        data: formattedStats
      });

    } catch (error) {
      console.error('[TransactionBancaireController] Error in stats:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

