import prisma from '../lib/prisma.js';
import { BridgeService } from '../services/bridge.service.js';

/**
 * Controller pour la gestion des comptes bancaires
 */
export const CompteBancaireController = {
  /**
   * Callback après connexion Powens (OAuth)
   * Enregistre le nouveau compte bancaire
   */
  async handleCallback(req, res) {
    try {
      const { code, state } = req.query;
      
      console.log('[handleCallback] Received:', { code: code?.substring(0, 20) + '...', state });
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Code d\'autorisation manquant'
        });
      }

      // Décoder le state pour récupérer userId et projetId
      const { userId, projetId } = JSON.parse(Buffer.from(state, 'base64').toString());
      console.log('[handleCallback] Decoded state:', { userId, projetId });

      // Échanger le code contre un access token
      const tokenResult = await BridgeService.exchangeCode(code);
      console.log('[handleCallback] Token result:', { success: tokenResult.success, data: tokenResult.data });
      
      if (!tokenResult.success) {
        console.error('[handleCallback] Token exchange failed:', tokenResult.error);
        return res.status(500).json({
          success: false,
          error: 'Échec de l\'authentification Powens',
          details: tokenResult.error
        });
      }

      const { access_token } = tokenResult.data;
      console.log('[handleCallback] Got access_token:', access_token?.substring(0, 20) + '...');

      // Récupérer les informations du compte
      const accountsResult = await BridgeService.getAccounts(access_token);
      console.log('[handleCallback] Accounts result:', { success: accountsResult.success });
      
      if (!accountsResult.success) {
        console.error('[handleCallback] Get accounts failed:', accountsResult.error);
        return res.status(500).json({
          success: false,
          error: 'Impossible de récupérer les comptes',
          details: accountsResult.error
        });
      }

      // Powens retourne { connections: [...] } et non { resources: [...] }
      const connection = accountsResult.data.connections?.[0];
      console.log('[handleCallback] Connection:', connection ? `Found (id: ${connection.id})` : 'NOT FOUND');
      
      if (!connection) {
        return res.status(400).json({
          success: false,
          error: 'Aucune connexion trouvée',
          debug: accountsResult.data
        });
      }

      // L'item_id est l'ID de la connexion dans Powens
      const item_id = connection.id;
      const banque = connection.connector?.name || connection.bank_name || 'Banque inconnue';
      
      console.log('[handleCallback] Creating compte with:', { item_id, banque, accountsCount: connection.accounts?.length });

      // Enregistrer le compte bancaire (upsert pour éviter les doublons)
      const compteBancaire = await prisma.compteBancaire.upsert({
        where: {
          powensItemId: item_id.toString(),
        },
        create: {
          projetId,
          userId,
          powensItemId: item_id.toString(),
          powensAccessToken: access_token,
          banque,
          derniereSynchronisation: new Date(),
        },
        update: {
          powensAccessToken: access_token,
          banque,
          actif: true,
          deletedAt: null,
          derniereSynchronisation: new Date(),
        },
        include: {
          projet: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      // Synchroniser les transactions initiales
      await CompteBancaireController.synchronizeTransactions(compteBancaire.id);

      return res.status(201).json({
        success: true,
        data: compteBancaire
      });

    } catch (error) {
      console.error('[CompteBancaireController] Error in handleCallback:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Liste les comptes bancaires d'un projet
   */
  async list(req, res) {
    try {
      const { projetId } = req.params;
      
      const comptes = await prisma.compteBancaire.findMany({
        where: {
          projetId,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          transactions: {
            where: {
              statut: 'NOUVEAU',
            },
            take: 5,
            orderBy: {
              dateTransaction: 'desc',
            }
          },
          _count: {
            select: {
              transactions: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        }
      });

      return res.json({
        success: true,
        data: comptes
      });

    } catch (error) {
      console.error('[CompteBancaireController] Error in list:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Force la synchronisation d'un compte bancaire
   */
  async sync(req, res) {
    try {
      const { id } = req.params;
      
      const compte = await prisma.compteBancaire.findUnique({
        where: { id },
      });

      if (!compte) {
        return res.status(404).json({
          success: false,
          error: 'Compte bancaire non trouvé'
        });
      }

      if (!compte.actif) {
        return res.status(400).json({
          success: false,
          error: 'Compte bancaire inactif'
        });
      }

      // Note: Powens synchronise automatiquement les comptes en arrière-plan
      // Pas besoin d'appeler un endpoint de sync forcé
      
      // Compter les transactions avant
      const countBefore = await prisma.transactionBancaire.count({
        where: { compteBancaireId: id }
      });
      
      // Récupérer et enregistrer les transactions
      const syncResult = await CompteBancaireController.synchronizeTransactions(id);
      
      // Compter les transactions après
      const countAfter = await prisma.transactionBancaire.count({
        where: { compteBancaireId: id }
      });
      
      const newTransactions = countAfter - countBefore;
      
      // Mettre à jour la date de synchronisation
      await prisma.compteBancaire.update({
        where: { id },
        data: {
          derniereSynchronisation: new Date(),
        }
      });

      return res.json({
        success: true,
        message: newTransactions > 0 
          ? `${newTransactions} nouvelle(s) transaction(s) importée(s)`
          : 'Aucune nouvelle transaction (Powens synchronise peut-être encore les données)',
        count: newTransactions,
        tokenExpired: syncResult?.tokenExpired || false
      });

    } catch (error) {
      console.error('[CompteBancaireController] Error in sync:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Déconnecte un compte bancaire
   */
  async disconnect(req, res) {
    try {
      const { id } = req.params;
      
      const compte = await prisma.compteBancaire.findUnique({
        where: { id },
      });

      if (!compte) {
        return res.status(404).json({
          success: false,
          error: 'Compte bancaire non trouvé'
        });
      }

      // Révoquer l'accès Powens
      await BridgeService.disconnectItem(
        compte.powensAccessToken,
        compte.powensItemId
      );

      // Soft delete du compte
      await prisma.compteBancaire.update({
        where: { id },
        data: {
          actif: false,
          deletedAt: new Date(),
        }
      });

      return res.json({
        success: true,
        message: 'Compte bancaire déconnecté'
      });

    } catch (error) {
      console.error('[CompteBancaireController] Error in disconnect:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Synchronise les transactions d'un compte (méthode interne)
   */
  async synchronizeTransactions(compteBancaireId) {
    try {
      const compte = await prisma.compteBancaire.findUnique({
        where: { id: compteBancaireId },
      });

      if (!compte || !compte.actif) {
        return { success: false, tokenExpired: false };
      }

      // Récupérer les connexions pour obtenir les comptes
      const connectionsResult = await BridgeService.getAccounts(compte.powensAccessToken);
      
      if (!connectionsResult.success) {
        console.error('[CompteBancaireController] Failed to get connections:', connectionsResult.error);
        
        // Si le token a expiré, marquer le compte comme nécessitant une reconnexion
        if (connectionsResult.error?.includes('unauthorized') || connectionsResult.error?.includes('expired')) {
          await prisma.compteBancaire.update({
            where: { id: compteBancaireId },
            data: { actif: false }
          });
          console.log('[CompteBancaireController] Token expired, account marked as inactive');
          return { success: false, tokenExpired: true };
        }
        return { success: false, tokenExpired: false };
      }

      // Powens retourne { connections: [...] } et non { resources: [...] }
      // Trouver la connexion qui correspond au powensItemId de ce compte
      const connection = connectionsResult.data.connections?.find(c => c.id.toString() === compte.powensItemId);
      if (!connection || !connection.accounts) {
        console.error(`[CompteBancaireController] No connection or accounts found for item ID: ${compte.powensItemId}`);
        return;
      }

      console.log(`[CompteBancaireController] Syncing ${connection.accounts.length} accounts`);

      // Pour chaque compte, récupérer les transactions
      for (const account of connection.accounts) {
        console.log(`[CompteBancaireController] Fetching transactions for account ${account.id}`);
        const transactionsResult = await BridgeService.getTransactions(
          compte.powensAccessToken,
          account.id,
          {
            limit: 1000, // Maximum autorisé par Powens
            since: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 an
          }
        );

        if (!transactionsResult.success) {
          console.error(`[CompteBancaireController] Failed to get transactions for account ${account.id}:`, transactionsResult.error);
          
          // Si c'est une erreur 404, c'est normal : Powens n'a pas encore synchronisé les transactions
          if (transactionsResult.error?.includes('notFound')) {
            console.log('[CompteBancaireController] Transactions not yet available (Powens still syncing)');
          }
          continue;
        }

        // Powens retourne { transactions: [...] } et non { resources: [...] }
        const transactions = transactionsResult.data.transactions || [];
        console.log(`[CompteBancaireController] Found ${transactions.length} transactions`);

        // Insérer les transactions (ignorer les doublons)
        for (const transaction of transactions) {
          // Extraire la catégorie principale (premier élément de l'array categories)
          const mainCategory = transaction.categories?.[0]?.code || null;
          
          await prisma.transactionBancaire.upsert({
            where: {
              powensTransactionId: transaction.id.toString(),
            },
            create: {
              compteBancaireId: compte.id,
              powensTransactionId: transaction.id.toString(),
              montant: Math.abs(transaction.value || 0),
              description: transaction.wording || transaction.original_wording || 'Transaction',
              dateTransaction: new Date(transaction.date),
              categorie: mainCategory,
              metadata: transaction,
            },
            update: {
              montant: Math.abs(transaction.value || 0),
              description: transaction.wording || transaction.original_wording || 'Transaction',
              categorie: mainCategory,
            }
          });
        }
      }

      console.log(`[CompteBancaireController] Synchronized transactions for compte ${compteBancaireId}`);
      return { success: true, tokenExpired: false };

    } catch (error) {
      console.error('[CompteBancaireController] Error synchronizing transactions:', error);
      return { success: false, tokenExpired: false };
    }
  }
};

