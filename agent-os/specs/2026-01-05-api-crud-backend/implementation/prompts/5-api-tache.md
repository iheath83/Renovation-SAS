We're implementing API CRUD Backend - Task Group 5:

## Implement this task and its sub-tasks:

#### Task Group 5: API Tache, SousTache, Dépendances
**Dependencies:** Task Group 4

- [ ] 5.0 Implémenter les routes Tache
  - [ ] 5.1 Créer `src/validators/tache.validator.js`
    - Schemas pour tache, sous-tache, dépendance
    - Filtres : statut, priorite, pieceId
  - [ ] 5.2 Créer `src/controllers/tache.controller.js`
    - CRUD Tache avec filtres
    - Include sous-tâches et dépendances
  - [ ] 5.3 Créer `src/controllers/sousTache.controller.js`
    - create, update, delete sous-tâches
  - [ ] 5.4 Créer `src/controllers/dependance.controller.js`
    - Ajouter/retirer dépendances entre tâches
  - [ ] 5.5 Créer `src/routes/tache.routes.js`
    - CRUD /api/projets/:projetId/taches
    - /:tacheId/sous-taches
    - /:tacheId/dependances

**Acceptance Criteria:**
- CRUD Tache fonctionnel
- Gestion sous-tâches
- Gestion dépendances

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/queries.md

