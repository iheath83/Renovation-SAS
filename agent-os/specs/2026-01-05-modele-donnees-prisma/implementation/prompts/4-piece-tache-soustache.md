We're continuing our implementation of Modèle de données & Prisma by implementing task group number 4:

## Implement this task and its sub-tasks:

#### Task Group 4: Piece, Tache, SousTache
**Dependencies:** Task Group 3

- [ ] 4.0 Créer les modèles de gestion de projet
  - [ ] 4.1 Modèle Piece
    - id, projetId, name, type (TypePiece), etage, surface, budget
    - statut (StatutPiece @default(A_FAIRE))
    - images (Json), tags (String[])
    - createdAt, updatedAt, deletedAt
    - Relation vers Projet, Tache[], Moodboard[]
  - [ ] 4.2 Modèle Tache
    - id, projetId, pieceId (optionnel)
    - title, description, statut (StatutTache), priorite (Priorite)
    - dateDebut, dateFin, coutEstime, coutReel, pourcentage
    - createdAt, updatedAt, deletedAt
    - Relations vers Projet, Piece?, SousTache[]
  - [ ] 4.3 Table pivot TacheDependance
    - tacheId, dependanceId (self-referencing)
    - Relation self-referencing many-to-many
  - [ ] 4.4 Modèle SousTache
    - id, tacheId, title, completed (Boolean @default(false)), ordre (Int)
    - createdAt, updatedAt
    - Relation obligatoire vers Tache

**Acceptance Criteria:**
- Modèles Piece et Tache avec relation optionnelle
- Dépendances entre tâches fonctionnelles (self-referencing)
- Sous-tâches liées aux tâches parentes

## Understand the context

Read @agent-os/specs/2026-01-05-modele-donnees-prisma/spec.md to understand the context for this spec and where the current task fits into it.

Also read these further context and reference:
- @agent-os/specs/2026-01-05-modele-donnees-prisma/planning/requirements.md
- @agent-os/specs/2026-01-05-modele-donnees-prisma/planning/visuals

## Perform the implementation

Implement all tasks assigned to you and ONLY those task(s) that have been assigned to you.

## Implementation process:

1. Analyze the provided spec.md, requirements.md, and visuals (if any)
2. Analyze patterns in the codebase according to its built-in workflow
3. Implement the assigned task group according to requirements and standards
4. Update `agent-os/specs/2026-01-05-modele-donnees-prisma/tasks.md` to update the tasks you've implemented to mark that as done by updating their checkbox to checked state: `- [x]`

## Guide your implementation using:
- **The existing patterns** that you've found and analyzed in the codebase.
- **Specific notes provided in requirements.md, spec.md AND/OR tasks.md**
- **Visuals provided (if any)** which would be located in `agent-os/specs/2026-01-05-modele-donnees-prisma/planning/visuals/`
- **User Standards & Preferences** which are defined below.

## Self-verify and test your work by:
- Running ONLY the tests you've written (if any) and ensuring those tests pass.
- IF your task involves user-facing UI, and IF you have access to browser testing tools, open a browser and use the feature you've implemented as if you are a user to ensure a user can use the feature in the intended way.
  - Take screenshots of the views and UI elements you've tested and store those in `agent-os/specs/2026-01-05-modele-donnees-prisma/verification/screenshots/`. Do not store screenshots anywhere else in the codebase other than this location.
  - Analyze the screenshot(s) you've taken to check them against your current requirements.


## User Standards & Preferences Compliance

IMPORTANT: Ensure that your implementation work is ALIGNED and DOES NOT CONFLICT with the user's preferences and standards as detailed in the following files:

@agent-os/standards/global/coding-style.md
@agent-os/standards/global/commenting.md
@agent-os/standards/global/conventions.md
@agent-os/standards/global/error-handling.md
@agent-os/standards/global/tech-stack.md
@agent-os/standards/global/validation.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/migrations.md
@agent-os/standards/backend/models.md
@agent-os/standards/backend/queries.md
@agent-os/standards/frontend/accessibility.md
@agent-os/standards/frontend/components.md
@agent-os/standards/frontend/css.md
@agent-os/standards/frontend/responsive.md
@agent-os/standards/testing/test-writing.md

