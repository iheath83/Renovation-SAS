import prisma from '../lib/prisma.js';
import { successResponse, listResponse } from '../lib/response.js';

export const list = async (req, res) => {
  const { cursor, limit = 20 } = req.validatedQuery || req.query;
  const userId = req.user.id;
  const takeLimit = typeof limit === 'number' ? limit : parseInt(limit, 10) || 20;

  const projets = await prisma.projet.findMany({
    where: {
      deletedAt: null,
      users: { some: { userId } },
    },
    take: takeLimit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      adresse: true,
      budgetMax: true,
      dateDebut: true,
      dateFin: true,
      createdAt: true,
      updatedAt: true,
      users: { where: { userId }, select: { role: true } },
      _count: { select: { pieces: true, taches: true } },
    },
  });

  const hasMore = projets.length > takeLimit;
  const data = hasMore ? projets.slice(0, -1) : projets;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json(listResponse(data, { nextCursor, hasMore }));
};

export const create = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const projet = await prisma.projet.create({
    data: {
      name,
      description,
      users: {
        create: { userId, role: 'OWNER' },
      },
    },
    include: {
      users: { where: { userId }, select: { role: true } },
    },
  });

  res.status(201).json(successResponse(projet));
};

export const getById = async (req, res) => {
  const { projetId } = req.params;

  const projet = await prisma.projet.findUnique({
    where: { id: projetId, deletedAt: null },
    include: {
      users: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { pieces: true, taches: true, materiaux: true, depenses: true } },
    },
  });

  res.json(successResponse(projet));
};

export const update = async (req, res) => {
  const { projetId } = req.params;
  const data = req.body;

  console.log('===== UPDATE PROJET =====');
  console.log('Projet ID:', projetId);
  console.log('Data received:', JSON.stringify(data, null, 2));

  const projet = await prisma.projet.update({
    where: { id: projetId },
    data,
  });

  console.log('Projet updated:', JSON.stringify(projet, null, 2));

  res.json(successResponse(projet));
};

export const softDelete = async (req, res) => {
  const { projetId } = req.params;

  await prisma.projet.update({
    where: { id: projetId },
    data: { deletedAt: new Date() },
  });

  res.json(successResponse({ deleted: true }));
};

// Export complet du projet
export const exportProjet = async (req, res) => {
  const { projetId } = req.params;
  const userId = req.user.id;

  // Récupérer toutes les données du projet
  const projet = await prisma.projet.findUnique({
    where: { id: projetId, deletedAt: null },
    include: {
      pieces: {
        where: { deletedAt: null },
        include: {
          taches: { where: { deletedAt: null } },
          materiaux: {
            include: {
              materiau: true
            }
          },
          depenses: { where: { deletedAt: null } },
        },
      },
      taches: {
        where: { deletedAt: null },
        include: {
          sousTaches: true,
          dependances: true,
        },
      },
      materiaux: { where: { deletedAt: null } },
      depenses: { where: { deletedAt: null } },
      credits: {
        where: { deletedAt: null },
        include: {
          deblocages: { where: { deletedAt: null } },
        },
      },
      ideesPinterest: { where: { deletedAt: null } },
      moodboards: {
        where: { deletedAt: null },
        include: {
          idees: true,
        },
      },
      comptesBancaires: { where: { deletedAt: null } },
      categoriesCustom: true,
    },
  });

  if (!projet) {
    return res.status(404).json({
      success: false,
      error: { message: 'Projet non trouvé', code: 'NOT_FOUND' },
    });
  }

  // Récupérer les transactions bancaires
  const transactions = await prisma.transactionBancaire.findMany({
    where: {
      compteBancaire: {
        projetId,
        deletedAt: null,
      },
    },
  });

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedBy: userId,
    projet: {
      name: projet.name,
      description: projet.description,
      adresse: projet.adresse,
      budgetMax: projet.budgetMax,
      dateDebut: projet.dateDebut,
      dateFin: projet.dateFin,
    },
    pieces: projet.pieces,
    taches: projet.taches,
    materiaux: projet.materiaux,
    depenses: projet.depenses,
    credits: projet.credits,
    ideesPinterest: projet.ideesPinterest,
    moodboards: projet.moodboards,
    comptesBancaires: projet.comptesBancaires,
    transactions: transactions,
    categoriesCustom: projet.categoriesCustom,
  };

  // Définir le nom du fichier
  const fileName = `renovation-${projet.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.json(exportData);
};

// Import d'un projet
export const importProjet = async (req, res) => {
  const userId = req.user.id;
  const importData = req.body;

  // Vérifier la version
  if (!importData.version || !importData.projet) {
    return res.status(400).json({
      success: false,
      error: { message: 'Format d\'import invalide', code: 'INVALID_FORMAT' },
    });
  }

  try {
    // Créer le nouveau projet avec toutes ses données
    const newProjet = await prisma.projet.create({
      data: {
        name: importData.projet.name + ' (importé)',
        description: importData.projet.description,
        adresse: importData.projet.adresse,
        budgetMax: importData.projet.budgetMax,
        dateDebut: importData.projet.dateDebut ? new Date(importData.projet.dateDebut) : null,
        dateFin: importData.projet.dateFin ? new Date(importData.projet.dateFin) : null,
        users: {
          create: { userId, role: 'OWNER' },
        },
        // Créer les catégories custom
        categoriesCustom: {
          create: (importData.categoriesCustom || []).map(cat => ({
            type: cat.type,
            nom: cat.nom,
            icon: cat.icon,
            color: cat.color,
          })),
        },
        // Créer les pièces
        pieces: {
          create: (importData.pieces || []).map(piece => ({
            name: piece.name,
            type: piece.type,
            surface: piece.surface,
            etage: piece.etage,
            statut: piece.statut,
            budget: piece.budget,
            images: piece.images,
            tags: piece.tags || [],
          })),
        },
        // Créer les matériaux (sans association aux pièces pour l'instant)
        materiaux: {
          create: (importData.materiaux || []).map(mat => ({
            name: mat.name,
            categorie: mat.categorie,
            quantite: mat.quantite,
            unite: mat.unite,
            prixUnitaire: mat.prixUnitaire,
            fournisseur: mat.fournisseur,
            reference: mat.reference,
            lienMarchand: mat.lienMarchand,
            image: mat.image,
            notes: mat.notes,
          })),
        },
        // Créer les dépenses (sans association aux pièces)
        depenses: {
          create: (importData.depenses || []).map(dep => ({
            description: dep.description,
            montant: dep.montant,
            categorie: dep.categorie,
            dateDepense: dep.dateDepense ? new Date(dep.dateDepense) : new Date(),
            fournisseur: dep.fournisseur,
            factures: dep.factures,
            passeDansCredit: dep.passeDansCredit || false,
            estPrevue: dep.estPrevue || false,
          })),
        },
        // Créer les tâches
        taches: {
          create: (importData.taches || []).map(tache => ({
            title: tache.title,
            description: tache.description,
            statut: tache.statut,
            priorite: tache.priorite,
            dateDebut: tache.dateDebut ? new Date(tache.dateDebut) : null,
            dateFin: tache.dateFin ? new Date(tache.dateFin) : null,
            coutEstime: tache.coutEstime,
            coutReel: tache.coutReel,
            sousTaches: {
              create: (tache.sousTaches || []).map(st => ({
                title: st.title,
                completed: st.completed || false,
                ordre: st.ordre || 0,
              })),
            },
          })),
        },
        // Créer les crédits avec déblocages
        credits: {
          create: (importData.credits || []).map(credit => ({
            nom: credit.nom,
            organisme: credit.organisme,
            montantTotal: credit.montantTotal,
            tauxInteret: credit.tauxInteret,
            dureeRemboursement: credit.dureeRemboursement,
            mensualite: credit.mensualite,
            dateDebut: credit.dateDebut ? new Date(credit.dateDebut) : null,
            statut: credit.statut,
            deblocages: {
              create: (credit.deblocages || []).map(deb => ({
                montant: deb.montant,
                date: deb.date ? new Date(deb.date) : new Date(),
                description: deb.description,
              })),
            },
          })),
        },
        // Créer les idées Pinterest
        ideesPinterest: {
          create: (importData.ideesPinterest || []).map(idee => ({
            url: idee.url,
            title: idee.title,
            description: idee.description,
            imageUrl: idee.imageUrl,
            tags: idee.tags || [],
          })),
        },
        // Créer les moodboards
        moodboards: {
          create: (importData.moodboards || []).map(mb => ({
            title: mb.title,
            description: mb.description,
          })),
        },
      },
    });
          create: (importData.ideesPinterest || []).map(idee => ({
            titre: idee.titre,
            description: idee.description,
            url: idee.url,
            imageUrl: idee.imageUrl,
            tags: idee.tags,
            couleurs: idee.couleurs,
          })),
        },
      },
      include: {
        users: { where: { userId }, select: { role: true } },
      },
    });

    res.status(201).json(successResponse({
      projet: newProjet,
      message: 'Projet importé avec succès',
    }));
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de l\'import', code: 'IMPORT_ERROR' },
    });
  }
};

