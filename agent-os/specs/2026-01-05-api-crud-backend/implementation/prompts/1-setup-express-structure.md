We're implementing API CRUD Backend - Task Group 1:

## Implement this task and its sub-tasks:

#### Task Group 1: Setup Express & Structure
**Dependencies:** None

- [ ] 1.0 Configuration Express.js
  - [ ] 1.1 Installer les dépendances
    - express, cors, helmet, compression
    - zod pour validation
    - jsonwebtoken pour auth
  - [ ] 1.2 Créer le point d'entrée `src/index.js`
    - Configuration Express (json, cors, helmet)
    - Montage des routes
    - Error handler global
    - Démarrage serveur sur PORT
  - [ ] 1.3 Créer la structure de dossiers
    - src/routes/, src/controllers/, src/middlewares/
    - src/validators/, src/lib/
  - [ ] 1.4 Créer `src/lib/prisma.js`
    - Singleton PrismaClient
    - Gestion connexion/déconnexion

**Acceptance Criteria:**
- Serveur Express démarre sans erreur
- Structure de projet créée
- Prisma Client accessible

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

Reference: @agent-os/specs/2026-01-05-api-crud-backend/planning/requirements.md

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/global/conventions.md
@agent-os/standards/global/error-handling.md
@agent-os/standards/backend/api.md

