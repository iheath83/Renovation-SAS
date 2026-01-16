import prisma from '../lib/prisma.js';

const SettingsController = {
  // === USER SETTINGS ===
  
  /**
   * Récupère les paramètres utilisateur
   */
  async getUserSettings(req, res) {
    try {
      const userId = req.user.id;
      
      // Récupérer l'utilisateur avec ses paramètres
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { settings: true },
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé',
        });
      }
      
      // Si pas de settings, créer les paramètres par défaut
      let settings = user.settings;
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: {
            userId,
            notifEmail: true,
            notifPush: true,
            notifAlertesBudget: true,
            notifRappelsTaches: true,
          },
        });
      }
      
      return res.json({
        success: true,
        data: {
          id: user.id,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
          notifications: {
            email: settings.notifEmail,
            push: settings.notifPush,
            alertesBudget: settings.notifAlertesBudget,
            rappelsTaches: settings.notifRappelsTaches,
          },
        },
      });
    } catch (error) {
      console.error('[SettingsController] Error in getUserSettings:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Met à jour les paramètres utilisateur
   */
  async updateUserSettings(req, res) {
    try {
      const userId = req.user.id;
      const { prenom, nom, email, telephone, notifications } = req.body;
      
      // Mettre à jour l'utilisateur
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(prenom && { prenom }),
          ...(nom && { nom }),
          ...(email && { email }),
          ...(telephone !== undefined && { telephone }),
        },
      });
      
      // Mettre à jour les notifications si fournies
      if (notifications) {
        await prisma.userSettings.upsert({
          where: { userId },
          create: {
            userId,
            notifEmail: notifications.email ?? true,
            notifPush: notifications.push ?? true,
            notifAlertesBudget: notifications.alertesBudget ?? true,
            notifRappelsTaches: notifications.rappelsTaches ?? true,
          },
          update: {
            ...(notifications.email !== undefined && { notifEmail: notifications.email }),
            ...(notifications.push !== undefined && { notifPush: notifications.push }),
            ...(notifications.alertesBudget !== undefined && { notifAlertesBudget: notifications.alertesBudget }),
            ...(notifications.rappelsTaches !== undefined && { notifRappelsTaches: notifications.rappelsTaches }),
          },
        });
      }
      
      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('[SettingsController] Error in updateUserSettings:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // === PROJET SETTINGS ===
  
  /**
   * Récupère les paramètres du projet
   */
  async getProjetSettings(req, res) {
    try {
      const { id: projetId } = req.params;
      
      const projet = await prisma.projet.findUnique({
        where: { id: projetId, deletedAt: null },
      });
      
      if (!projet) {
        return res.status(404).json({
          success: false,
          error: 'Projet non trouvé',
        });
      }
      
      return res.json({
        success: true,
        data: {
          id: projet.id,
          nom: projet.name,
          description: projet.description,
          adresse: projet.adresse,
          budgetMax: projet.budgetMax,
          dateDebut: projet.dateDebut,
          dateFin: projet.dateFin,
        },
      });
    } catch (error) {
      console.error('[SettingsController] Error in getProjetSettings:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Met à jour les paramètres du projet
   */
  async updateProjetSettings(req, res) {
    try {
      const { id: projetId } = req.params;
      const { nom, description, adresse, budgetMax, dateDebut, dateFin } = req.body;
      
      const projet = await prisma.projet.update({
        where: { id: projetId },
        data: {
          ...(nom && { name: nom }),
          ...(description !== undefined && { description }),
          ...(adresse !== undefined && { adresse }),
          ...(budgetMax !== undefined && { budgetMax }),
          ...(dateDebut !== undefined && { dateDebut: dateDebut ? new Date(dateDebut) : null }),
          ...(dateFin !== undefined && { dateFin: dateFin ? new Date(dateFin) : null }),
        },
      });
      
      return res.json({
        success: true,
        data: projet,
      });
    } catch (error) {
      console.error('[SettingsController] Error in updateProjetSettings:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // === CATEGORIES CUSTOM ===
  
  /**
   * Liste les catégories personnalisées d'un projet
   */
  async listCategories(req, res) {
    try {
      const { id: projetId } = req.params;
      const { type } = req.query;
      
      const categories = await prisma.categorieCustom.findMany({
        where: {
          projetId,
          deletedAt: null,
          ...(type && { type: type.toUpperCase() }),
        },
        orderBy: { createdAt: 'asc' },
      });
      
      return res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('[SettingsController] Error in listCategories:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Crée une catégorie personnalisée
   */
  async createCategory(req, res) {
    try {
      const { id: projetId } = req.params;
      const { type, nom, icon, color } = req.body;
      
      const category = await prisma.categorieCustom.create({
        data: {
          projetId,
          type: type.toUpperCase(),
          nom,
          icon: icon || '📦',
          color: color || 'blue',
          isDefault: false,
        },
      });
      
      return res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('[SettingsController] Error in createCategory:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Met à jour une catégorie personnalisée
   */
  async updateCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { nom, icon, color } = req.body;
      
      const category = await prisma.categorieCustom.update({
        where: { id: categoryId },
        data: {
          ...(nom && { nom }),
          ...(icon && { icon }),
          ...(color && { color }),
        },
      });
      
      return res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('[SettingsController] Error in updateCategory:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Supprime une catégorie personnalisée
   */
  async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;
      
      await prisma.categorieCustom.update({
        where: { id: categoryId },
        data: { deletedAt: new Date() },
      });
      
      return res.json({
        success: true,
        message: 'Catégorie supprimée',
      });
    } catch (error) {
      console.error('[SettingsController] Error in deleteCategory:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

export default SettingsController;

