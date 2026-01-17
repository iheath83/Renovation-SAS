# Task Breakdown: Modèle de données & Prisma

## Overview
Total Tasks: 24

## Task List

### Configuration Prisma

#### Task Group 1: Setup Initial
**Dependencies:** None

- [x] 1.0 Configuration Prisma et PostgreSQL
  - [x] 1.1 Initialiser le projet backend Node.js
    - Créer package.json avec scripts prisma
    - Installer prisma et @prisma/client
  - [x] 1.2 Configurer Prisma
    - Initialiser prisma avec `npx prisma init`
    - Configurer DATABASE_URL dans .env
    - Configurer le provider postgresql dans schema.prisma
  - [x] 1.3 Créer la structure de dossiers
    - prisma/schema.prisma
    - prisma/migrations/
    - src/ pour le futur code applicatif

**Acceptance Criteria:**
- Prisma initialisé avec connexion PostgreSQL configurée
- Fichier .env avec DATABASE_URL
- Structure de projet prête

### Enums & Types

#### Task Group 2: Définition des Enums
**Dependencies:** Task Group 1

- [x] 2.0 Créer tous les enums Prisma
  - [x] 2.1 Enums utilisateur et projet
    - Role: ADMIN, USER
    - ProjetRole: OWNER, MEMBER
  - [x] 2.2 Enums pièces
    - TypePiece: SALON, CUISINE, CHAMBRE, SDB, WC, BUREAU, COULOIR, GARAGE, EXTERIEUR, AUTRE
    - StatutPiece: A_FAIRE, EN_COURS, TERMINE
  - [x] 2.3 Enums tâches
    - StatutTache: A_FAIRE, EN_COURS, EN_ATTENTE, TERMINE
    - Priorite: BASSE, MOYENNE, HAUTE, URGENTE
  - [x] 2.4 Enums matériaux
    - CategorieMateriau: PEINTURE, REVETEMENT_SOL, REVETEMENT_MUR, MENUISERIE, PLOMBERIE, ELECTRICITE, QUINCAILLERIE, AUTRE
    - Unite: M2, M, PIECE, LITRE, KG, LOT

**Acceptance Criteria:**
- Tous les enums définis dans schema.prisma
- Syntaxe Prisma valide

### Modèles Fondamentaux

#### Task Group 3: User & Projet
**Dependencies:** Task Group 2

- [x] 3.0 Créer les modèles User et Projet
  - [x] 3.1 Modèle User
    - id (String @id @default(cuid()))
    - email (String @unique)
    - name (String)
    - role (Role @default(USER))
    - budgetMaxProjet (Float?)
    - createdAt, updatedAt, deletedAt
    - Relation vers ProjetUser
  - [x] 3.2 Modèle Projet
    - id, name, description
    - createdAt, updatedAt, deletedAt
    - Relations vers toutes les entités enfants
  - [x] 3.3 Table pivot ProjetUser
    - projetId, userId (clé composite)
    - role (ProjetRole @default(MEMBER))
    - joinedAt (DateTime @default(now()))
    - Relations vers User et Projet

**Acceptance Criteria:**
- Modèles User et Projet créés
- Relation many-to-many fonctionnelle via ProjetUser
- Soft delete configuré

### Modèles Métier - Pièces & Tâches

#### Task Group 4: Piece, Tache, SousTache
**Dependencies:** Task Group 3

- [x] 4.0 Créer les modèles de gestion de projet
  - [x] 4.1 Modèle Piece
    - id, projetId, name, type (TypePiece), etage, surface, budget
    - statut (StatutPiece @default(A_FAIRE))
    - images (Json), tags (String[])
    - createdAt, updatedAt, deletedAt
    - Relation vers Projet, Tache[], Moodboard[]
  - [x] 4.2 Modèle Tache
    - id, projetId, pieceId (optionnel)
    - title, description, statut (StatutTache), priorite (Priorite)
    - dateDebut, dateFin, coutEstime, coutReel, pourcentage
    - createdAt, updatedAt, deletedAt
    - Relations vers Projet, Piece?, SousTache[]
  - [x] 4.3 Table pivot TacheDependance
    - tacheId, dependanceId (self-referencing)
    - Relation self-referencing many-to-many
  - [x] 4.4 Modèle SousTache
    - id, tacheId, title, completed (Boolean @default(false)), ordre (Int)
    - createdAt, updatedAt
    - Relation obligatoire vers Tache

**Acceptance Criteria:**
- Modèles Piece et Tache avec relation optionnelle
- Dépendances entre tâches fonctionnelles (self-referencing)
- Sous-tâches liées aux tâches parentes

### Modèles Métier - Matériaux

#### Task Group 5: Materiau & MateriauPiece
**Dependencies:** Task Group 4

- [x] 5.0 Créer les modèles matériaux
  - [x] 5.1 Modèle Materiau
    - id, projetId, name, categorie (CategorieMateriau)
    - prixUnitaire (Float), unite (Unite)
    - reference, fournisseur, lienMarchand, image, notes
    - createdAt, updatedAt, deletedAt
    - Relation vers Projet, MateriauPiece[]
  - [x] 5.2 Table pivot MateriauPiece
    - materiauId, pieceId (clé composite)
    - quantite (Float)
    - Relations vers Materiau et Piece

**Acceptance Criteria:**
- Modèle Materiau avec tous les champs
- Relation many-to-many avec quantité par pièce

### Modèles Métier - Finance

#### Task Group 6: Credit, Deblocage, Depense
**Dependencies:** Task Group 5

- [x] 6.0 Créer les modèles financiers
  - [x] 6.1 Modèle Credit
    - id, projetId, banque, montantTotal (Float)
    - tauxInteret (Float?), duree (Int?), notes
    - createdAt, updatedAt, deletedAt
    - Relation vers Projet, Deblocage[]
  - [x] 6.2 Modèle Deblocage
    - id, creditId, montant (Float), dateDeblocage
    - justificatifs (Json), notes
    - createdAt, updatedAt, deletedAt
    - Relations vers Credit, Depense[]
  - [x] 6.3 Modèle Depense
    - id, projetId, montant (Float), description, categorie
    - dateDepense, factures (Json), passeDansCredit (Boolean @default(false))
    - pieceId?, tacheId?, materiauId?, deblocageId? (tous optionnels)
    - createdAt, updatedAt, deletedAt
    - Relations optionnelles vers Piece, Tache, Materiau, Deblocage

**Acceptance Criteria:**
- Chaîne Credit → Deblocage → Depense fonctionnelle
- Dépenses liables à plusieurs entités (Piece, Tache, Materiau)
- Flag passeDansCredit pour le suivi

### Modèles Métier - Inspiration

#### Task Group 7: IdeePinterest, Moodboard
**Dependencies:** Task Group 4

- [x] 7.0 Créer les modèles d'inspiration
  - [x] 7.1 Modèle IdeePinterest
    - id, projetId, url, titre, description, imageUrl
    - couleurs (Json), materiaux (Json), style
    - tags (String[]), notes
    - createdAt, updatedAt, deletedAt
    - Relation vers Projet, IdeesMoodboard[]
  - [x] 7.2 Modèle Moodboard
    - id, projetId, pieceId (optionnel), name, description
    - palette (Json)
    - createdAt, updatedAt, deletedAt
    - Relations vers Projet, Piece?, IdeesMoodboard[]
  - [x] 7.3 Table pivot IdeesMoodboard
    - ideeId, moodboardId (clé composite)
    - ordre (Int @default(0))
    - Relations vers IdeePinterest et Moodboard

**Acceptance Criteria:**
- Modèles IdeePinterest et Moodboard créés
- Relation many-to-many avec ordre
- Champs pour métadonnées IA prêts

### Optimisations & Migration

#### Task Group 8: Index, Validation & Migration
**Dependencies:** Task Groups 3-7

- [x] 8.0 Finaliser le schéma et migrer
  - [x] 8.1 Ajouter les index de performance
    - @@index([projetId]) sur toutes les entités projet
    - @@index([pieceId]) sur Tache, MateriauPiece
    - @@index([deletedAt]) pour le soft delete
    - @@index([creditId]) sur Deblocage
  - [x] 8.2 Configurer les cascades
    - onDelete: Cascade pour les relations enfants
    - onDelete: SetNull pour les relations optionnelles
  - [x] 8.3 Générer et appliquer la migration
    - npx prisma migrate dev --name init (à exécuter avec DB connectée)
    - Vérifier le SQL généré
  - [x] 8.4 Générer le client Prisma
    - npx prisma generate ✓
    - Vérifier les types TypeScript générés ✓

**Acceptance Criteria:**
- Index créés pour les requêtes fréquentes
- Migration appliquée sans erreur
- Client Prisma généré et fonctionnel
- Schéma complet validé par Prisma

## Execution Order

Recommended implementation sequence:
1. Configuration Prisma (Task Group 1)
2. Enums & Types (Task Group 2)
3. User & Projet (Task Group 3)
4. Piece, Tache, SousTache (Task Group 4)
5. Materiau & MateriauPiece (Task Group 5)
6. Credit, Deblocage, Depense (Task Group 6)
7. IdeePinterest, Moodboard (Task Group 7)
8. Index, Validation & Migration (Task Group 8)

## Notes
- Tests unitaires du schéma explicitement hors scope
- Pas de seeds de données (hors scope)
- Validation applicative sera dans la spec API

