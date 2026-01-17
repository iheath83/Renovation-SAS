# Task Breakdown: API CRUD Backend

## Overview
Total Tasks: 32
**Status: COMPLETED ✅**

## Task List

### Configuration Express

#### Task Group 1: Setup Express & Structure
**Dependencies:** None
**Status:** ✅ Completed

- [x] 1.0 Configuration Express.js
  - [x] 1.1 Installer les dépendances
    - express, cors, helmet, compression
    - zod pour validation
    - jsonwebtoken pour auth
  - [x] 1.2 Créer le point d'entrée `src/server.js`
    - Configuration Express (json, cors, helmet)
    - Montage des routes
    - Error handler global
    - Démarrage serveur sur PORT
  - [x] 1.3 Créer la structure de dossiers
    - src/routes/, src/controllers/, src/middlewares/
    - src/validators/, src/lib/
  - [x] 1.4 Créer `src/lib/prisma.js`
    - Singleton PrismaClient
    - Gestion connexion/déconnexion

### Helpers & Middlewares

#### Task Group 2: Utilitaires et Middlewares
**Dependencies:** Task Group 1
**Status:** ✅ Completed

- [x] 2.0 Créer les helpers et middlewares de base
  - [x] 2.1 Créer `src/lib/response.js`
    - `successResponse(data)` → `{ success: true, data }`
    - `listResponse(data, pagination)` → `{ success: true, data, pagination }`
    - `errorResponse(message, code, details)` → `{ success: false, error }`
  - [x] 2.2 Créer `src/middlewares/errorHandler.js`
    - Catch toutes les erreurs async
    - Format standardisé des erreurs
    - Codes HTTP appropriés
  - [x] 2.3 Créer `src/middlewares/auth.js`
    - Vérification header Authorization
    - Décodage JWT
    - Injection req.user
    - Gestion erreur 401
  - [x] 2.4 Créer `src/middlewares/validate.js`
    - Middleware générique validate(schema)
    - Validation body, params, query
    - Format erreurs Zod

### Routes Projet

#### Task Group 3: API Projet & ProjetUser
**Dependencies:** Task Group 2
**Status:** ✅ Completed

- [x] 3.0 Implémenter les routes Projet
  - [x] 3.1 Créer `src/validators/projet.validator.js`
    - createProjetSchema, updateProjetSchema
    - queryProjetSchema (pagination, filtres)
  - [x] 3.2 Créer `src/controllers/projet.controller.js`
    - list, create, getById, update, softDelete
    - Pagination cursor-based
    - Filtre par userId via ProjetUser
  - [x] 3.3 Créer `src/routes/projet.routes.js`
    - GET /api/projets
    - POST /api/projets
    - GET /api/projets/:projetId
    - PATCH /api/projets/:projetId
    - DELETE /api/projets/:projetId
  - [x] 3.4 Créer middleware `checkProjetAccess`
    - Vérifier que l'utilisateur est membre du projet
    - Injecter req.projet

### Routes Piece

#### Task Group 4: API Piece
**Dependencies:** Task Group 3
**Status:** ✅ Completed

- [x] 4.0 Implémenter les routes Piece
  - [x] 4.1 Créer `src/validators/piece.validator.js`
    - createPieceSchema, updatePieceSchema
    - queryPieceSchema (type, statut, etage)
  - [x] 4.2 Créer `src/controllers/piece.controller.js`
    - CRUD avec filtres
    - Include stats (count taches, budget)
  - [x] 4.3 Créer `src/routes/piece.routes.js`
    - Routes imbriquées sous /api/projets/:projetId/pieces

### Routes Tache

#### Task Group 5: API Tache, SousTache, Dépendances
**Dependencies:** Task Group 4
**Status:** ✅ Completed

- [x] 5.0 Implémenter les routes Tache
  - [x] 5.1 Créer `src/validators/tache.validator.js`
    - Schemas pour tache, sous-tache, dépendance
    - Filtres : statut, priorite, pieceId
  - [x] 5.2 Créer `src/controllers/tache.controller.js`
    - CRUD Tache avec filtres
    - Include sous-tâches et dépendances
    - Sous-tâches et dépendances intégrées
  - [x] 5.3 Créer `src/routes/tache.routes.js`
    - CRUD /api/projets/:projetId/taches
    - /:tacheId/sous-taches
    - /:tacheId/dependances

### Routes Materiau

#### Task Group 6: API Materiau & MateriauPiece
**Dependencies:** Task Group 4
**Status:** ✅ Completed

- [x] 6.0 Implémenter les routes Materiau
  - [x] 6.1 Créer `src/validators/materiau.validator.js`
    - Schemas materiau et association piece
    - Filtres : categorie, unite
  - [x] 6.2 Créer `src/controllers/materiau.controller.js`
    - CRUD Materiau
    - Association/dissociation avec pieces
  - [x] 6.3 Créer `src/routes/materiau.routes.js`
    - CRUD /api/projets/:projetId/materiaux
    - /:materiauId/pieces pour associations

### Routes Finance

#### Task Group 7: API Credit, Deblocage, Depense
**Dependencies:** Task Group 5
**Status:** ✅ Completed

- [x] 7.0 Implémenter les routes financières
  - [x] 7.1 Créer validators pour Credit, Deblocage, Depense
    - Schemas création/update
    - Filtres depense : categorie, pieceId, passeDansCredit
  - [x] 7.2 Créer `src/controllers/credit.controller.js`
    - CRUD Credit
  - [x] 7.3 Créer `src/controllers/deblocage.controller.js`
    - CRUD Deblocage imbriqué sous Credit
  - [x] 7.4 Créer `src/controllers/depense.controller.js`
    - CRUD Depense avec associations optionnelles
  - [x] 7.5 Créer routes financières
    - /api/projets/:projetId/credits
    - /api/projets/:projetId/credits/:creditId/deblocages
    - /api/projets/:projetId/depenses

### Routes Inspiration

#### Task Group 8: API IdeePinterest & Moodboard
**Dependencies:** Task Group 4
**Status:** ✅ Completed

- [x] 8.0 Implémenter les routes inspiration
  - [x] 8.1 Créer validators pour IdeePinterest et Moodboard
    - Filtres idee : style, tags
    - Filtres moodboard : pieceId
  - [x] 8.2 Créer `src/controllers/ideePinterest.controller.js`
    - CRUD IdeePinterest
  - [x] 8.3 Créer `src/controllers/moodboard.controller.js`
    - CRUD Moodboard
    - Ajout/retrait idées du moodboard
  - [x] 8.4 Créer routes inspiration
    - /api/projets/:projetId/idees
    - /api/projets/:projetId/moodboards
    - /moodboards/:id/idees

### Routes User

#### Task Group 9: API User
**Dependencies:** Task Group 2
**Status:** ✅ Completed

- [x] 9.0 Implémenter les routes User
  - [x] 9.1 Créer `src/validators/user.validator.js`
    - updateUserSchema
  - [x] 9.2 Créer `src/controllers/user.controller.js`
    - getProfile, updateProfile, softDelete
    - Liste users (admin only)
  - [x] 9.3 Créer `src/routes/user.routes.js`
    - GET /api/users (admin)
    - GET /api/users/me
    - PATCH /api/users/me
    - DELETE /api/users/me

### Finalisation

#### Task Group 10: Montage routes & Tests manuels
**Dependencies:** Task Groups 3-9
**Status:** ✅ Completed

- [x] 10.0 Finaliser l'API
  - [x] 10.1 Monter toutes les routes dans index.js
    - Import et use de toutes les routes
    - Ordre correct des middlewares
  - [x] 10.2 Ajouter route health check
    - GET /api/health → { status: 'ok' }
  - [x] 10.3 Vérifier soft delete global
    - Tous les GET filtrent deletedAt: null
    - Tous les DELETE font soft delete

## API Endpoints Summary

### Projets
- `GET    /api/projets`
- `POST   /api/projets`
- `GET    /api/projets/:projetId`
- `PATCH  /api/projets/:projetId`
- `DELETE /api/projets/:projetId`

### Pièces (nested under projets)
- `GET    /api/projets/:projetId/pieces`
- `POST   /api/projets/:projetId/pieces`
- `GET    /api/projets/:projetId/pieces/:pieceId`
- `PATCH  /api/projets/:projetId/pieces/:pieceId`
- `DELETE /api/projets/:projetId/pieces/:pieceId`

### Tâches (nested under projets)
- `GET    /api/projets/:projetId/taches`
- `POST   /api/projets/:projetId/taches`
- `GET    /api/projets/:projetId/taches/:tacheId`
- `PATCH  /api/projets/:projetId/taches/:tacheId`
- `DELETE /api/projets/:projetId/taches/:tacheId`
- `POST   /api/projets/:projetId/taches/:tacheId/sous-taches`
- `PATCH  /api/projets/:projetId/taches/:tacheId/sous-taches/:sousTacheId`
- `DELETE /api/projets/:projetId/taches/:tacheId/sous-taches/:sousTacheId`
- `POST   /api/projets/:projetId/taches/:tacheId/dependances`
- `DELETE /api/projets/:projetId/taches/:tacheId/dependances/:dependanceId`

### Matériaux (nested under projets)
- `GET    /api/projets/:projetId/materiaux`
- `POST   /api/projets/:projetId/materiaux`
- `GET    /api/projets/:projetId/materiaux/:materiauId`
- `PATCH  /api/projets/:projetId/materiaux/:materiauId`
- `DELETE /api/projets/:projetId/materiaux/:materiauId`
- `POST   /api/projets/:projetId/materiaux/:materiauId/pieces`
- `DELETE /api/projets/:projetId/materiaux/:materiauId/pieces/:pieceId`

### Crédits (nested under projets)
- `GET    /api/projets/:projetId/credits`
- `POST   /api/projets/:projetId/credits`
- `GET    /api/projets/:projetId/credits/:creditId`
- `PATCH  /api/projets/:projetId/credits/:creditId`
- `DELETE /api/projets/:projetId/credits/:creditId`

### Déblocages (nested under credits)
- `GET    /api/projets/:projetId/credits/:creditId/deblocages`
- `POST   /api/projets/:projetId/credits/:creditId/deblocages`
- `GET    /api/projets/:projetId/credits/:creditId/deblocages/:deblocageId`
- `PATCH  /api/projets/:projetId/credits/:creditId/deblocages/:deblocageId`
- `DELETE /api/projets/:projetId/credits/:creditId/deblocages/:deblocageId`

### Dépenses (nested under projets)
- `GET    /api/projets/:projetId/depenses`
- `POST   /api/projets/:projetId/depenses`
- `GET    /api/projets/:projetId/depenses/:depenseId`
- `PATCH  /api/projets/:projetId/depenses/:depenseId`
- `DELETE /api/projets/:projetId/depenses/:depenseId`

### Idées Pinterest (nested under projets)
- `GET    /api/projets/:projetId/idees`
- `POST   /api/projets/:projetId/idees`
- `GET    /api/projets/:projetId/idees/:ideeId`
- `PATCH  /api/projets/:projetId/idees/:ideeId`
- `DELETE /api/projets/:projetId/idees/:ideeId`

### Moodboards (nested under projets)
- `GET    /api/projets/:projetId/moodboards`
- `POST   /api/projets/:projetId/moodboards`
- `GET    /api/projets/:projetId/moodboards/:moodboardId`
- `PATCH  /api/projets/:projetId/moodboards/:moodboardId`
- `DELETE /api/projets/:projetId/moodboards/:moodboardId`
- `POST   /api/projets/:projetId/moodboards/:moodboardId/idees`
- `DELETE /api/projets/:projetId/moodboards/:moodboardId/idees/:ideeId`

### Users
- `GET    /api/users` (admin only)
- `GET    /api/users/me`
- `PATCH  /api/users/me`
- `DELETE /api/users/me`
- `GET    /api/users/:userId` (admin only)

### Health
- `GET    /api/health`

## Notes
- Tests automatisés explicitement hors scope
- Documentation Swagger hors scope
- Upload fichiers sera dans spec #15
