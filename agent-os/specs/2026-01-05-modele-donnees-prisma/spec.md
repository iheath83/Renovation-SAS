# Specification: Modèle de données & Prisma

## Goal
Créer le schéma Prisma complet avec les 10 entités principales de RénoVision et leurs relations, incluant les migrations initiales pour PostgreSQL.

## User Stories
- As a développeur, I want to avoir un schéma de base de données complet so that je peux construire les API et le frontend sur une base solide
- As a propriétaire en rénovation, I want to que mes données soient organisées par projet so that je peux gérer plusieurs rénovations et collaborer avec d'autres utilisateurs

## Specific Requirements

**Entité User**
- Champs : id, email, name, role (enum: ADMIN/USER), budget_max_projet, createdAt, updatedAt, deletedAt
- Relation many-to-many avec Projet via table pivot ProjetUser
- Enum Role avec valeurs ADMIN et USER

**Entité Projet**
- Champs : id, name, description, createdAt, updatedAt, deletedAt
- Relation many-to-many avec User (un projet peut avoir plusieurs utilisateurs)
- Toutes les autres entités (Piece, Tache, etc.) appartiennent à un Projet

**Entité Piece**
- Champs : id, projetId, name, type (enum), etage, surface, budget, statut (enum), images (Json), tags (String[]), createdAt, updatedAt, deletedAt
- Enum TypePiece : SALON, CUISINE, CHAMBRE, SDB, WC, BUREAU, COULOIR, GARAGE, EXTERIEUR, AUTRE
- Enum StatutPiece : A_FAIRE, EN_COURS, TERMINE

**Entité Tache**
- Champs : id, projetId, pieceId (optionnel), title, description, statut (enum Kanban), priorite, dateDebut, dateFin, coutEstime, coutReel, pourcentage, createdAt, updatedAt, deletedAt
- Relation optionnelle vers Piece (tâches globales possibles)
- Relation self-referencing many-to-many pour dépendances via table TacheDependance
- Relation one-to-many vers SousTache (sous-tâches)
- Enum StatutTache : A_FAIRE, EN_COURS, EN_ATTENTE, TERMINE

**Entité SousTache**
- Champs : id, tacheId, title, completed, ordre, createdAt, updatedAt
- Relation obligatoire vers Tache parent

**Entité Materiau**
- Champs : id, projetId, name, categorie (enum), prixUnitaire, unite (enum), reference, fournisseur, lienMarchand, image, notes, createdAt, updatedAt, deletedAt
- Enum CategorieMateriau : PEINTURE, REVETEMENT_SOL, REVETEMENT_MUR, MENUISERIE, PLOMBERIE, ELECTRICITE, QUINCAILLERIE, AUTRE
- Enum Unite : M2, M, PIECE, LITRE, KG, LOT
- Relation many-to-many avec Piece via table pivot MateriauPiece incluant quantite

**Entité Depense**
- Champs : id, projetId, pieceId (opt), tacheId (opt), materiauId (opt), deblocageId (opt), montant, description, categorie, dateDepense, factures (Json), passeDansCredit, createdAt, updatedAt, deletedAt
- Relations optionnelles vers Piece, Tache, Materiau, Deblocage
- Champ passeDansCredit (Boolean) pour tracker le lien avec un déblocage

**Entité Credit**
- Champs : id, projetId, banque, montantTotal, tauxInteret, duree, notes, createdAt, updatedAt, deletedAt
- Relation one-to-many vers Deblocage

**Entité Deblocage**
- Champs : id, creditId, montant, dateDeblocage, justificatifs (Json), notes, createdAt, updatedAt, deletedAt
- Relation many-to-one vers Credit
- Relation one-to-many vers Depense (dépenses couvertes par ce déblocage)

**Entité IdeePinterest**
- Champs : id, projetId, url, titre, description, imageUrl, couleurs (Json), materiaux (Json), style, tags (String[]), notes, createdAt, updatedAt, deletedAt
- Relation many-to-many avec Moodboard via table IdeesMoodboard
- Champs pour métadonnées extraites par IA (couleurs, materiaux, style)

**Entité Moodboard**
- Champs : id, projetId, pieceId (opt), name, description, palette (Json), createdAt, updatedAt, deletedAt
- Relation optionnelle vers Piece
- Relation many-to-many avec IdeePinterest

**Tables pivot avec données**
- ProjetUser : projetId, userId, role (enum OWNER/MEMBER), joinedAt
- TacheDependance : tacheId, dependanceId (self-referencing)
- MateriauPiece : materiauId, pieceId, quantite
- IdeesMoodboard : ideeId, moodboardId, ordre

**Configuration et patterns transverses**
- Soft delete : champ deletedAt (DateTime?) sur toutes les entités principales
- Timestamps automatiques : createdAt (default now()), updatedAt (@updatedAt)
- Index sur : projetId, pieceId, deletedAt pour optimiser les requêtes fréquentes
- Cascade delete configuré pour les relations enfants

## Visual Design
No visual assets provided.

## Existing Code to Leverage
No existing code - starting from scratch.

## Out of Scope
- Endpoints API REST (roadmap item #2)
- Authentification et gestion des sessions (roadmap item #3)
- Logique métier d'extraction IA des métadonnées Pinterest
- Upload et stockage de fichiers (AWS S3/Cloudinary)
- Validation des données au niveau applicatif
- Seeds de données de test
- Tests unitaires du schéma
- Configuration CI/CD pour les migrations
- Gestion des permissions et autorisations
- Historique des modifications (audit log)

