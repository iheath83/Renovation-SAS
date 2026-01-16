We're implementing API CRUD Backend - Task Group 6:

## Implement this task and its sub-tasks:

#### Task Group 6: API Materiau & MateriauPiece
**Dependencies:** Task Group 4

- [ ] 6.0 Implémenter les routes Materiau
  - [ ] 6.1 Créer `src/validators/materiau.validator.js`
    - Schemas materiau et association piece
    - Filtres : categorie, unite
  - [ ] 6.2 Créer `src/controllers/materiau.controller.js`
    - CRUD Materiau
    - Association/dissociation avec pieces
  - [ ] 6.3 Créer `src/routes/materiau.routes.js`
    - CRUD /api/projets/:projetId/materiaux
    - /:materiauId/pieces pour associations

**Acceptance Criteria:**
- CRUD Materiau fonctionnel
- Association materiau-piece avec quantité

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/queries.md

