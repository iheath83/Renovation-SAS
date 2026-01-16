We're implementing API CRUD Backend - Task Group 3:

## Implement this task and its sub-tasks:

#### Task Group 3: API Projet & ProjetUser
**Dependencies:** Task Group 2

- [ ] 3.0 Implémenter les routes Projet
  - [ ] 3.1 Créer `src/validators/projet.validator.js`
    - createProjetSchema, updateProjetSchema
    - queryProjetSchema (pagination, filtres)
  - [ ] 3.2 Créer `src/controllers/projet.controller.js`
    - list, create, getById, update, softDelete
    - Pagination cursor-based
    - Filtre par userId via ProjetUser
  - [ ] 3.3 Créer `src/routes/projet.routes.js`
    - GET /api/projets
    - POST /api/projets
    - GET /api/projets/:projetId
    - PUT /api/projets/:projetId
    - DELETE /api/projets/:projetId
  - [ ] 3.4 Créer middleware `checkProjetAccess`
    - Vérifier que l'utilisateur est membre du projet
    - Injecter req.projet

**Acceptance Criteria:**
- CRUD Projet fonctionnel
- Pagination cursor-based
- Accès restreint aux membres

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/queries.md

