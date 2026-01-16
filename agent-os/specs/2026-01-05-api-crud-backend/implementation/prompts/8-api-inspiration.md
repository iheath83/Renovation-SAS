We're implementing API CRUD Backend - Task Group 8:

## Implement this task and its sub-tasks:

#### Task Group 8: API IdeePinterest & Moodboard
**Dependencies:** Task Group 4

- [ ] 8.0 Implémenter les routes inspiration
  - [ ] 8.1 Créer validators pour IdeePinterest et Moodboard
    - Filtres idee : style, tags
    - Filtres moodboard : pieceId
  - [ ] 8.2 Créer `src/controllers/idee.controller.js`
    - CRUD IdeePinterest
  - [ ] 8.3 Créer `src/controllers/moodboard.controller.js`
    - CRUD Moodboard
    - Ajout/retrait idées du moodboard
  - [ ] 8.4 Créer routes inspiration
    - /api/projets/:projetId/idees
    - /api/projets/:projetId/moodboards
    - /moodboards/:id/idees

**Acceptance Criteria:**
- CRUD Idées et Moodboards fonctionnel
- Association idées-moodboards avec ordre

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/queries.md

