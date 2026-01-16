We're continuing our implementation of Modèle de données & Prisma by implementing task group number 1:

## Implement this task and its sub-tasks:

#### Task Group 1: Setup Initial
**Dependencies:** None

- [ ] 1.0 Configuration Prisma et PostgreSQL
  - [ ] 1.1 Initialiser le projet backend Node.js
    - Créer package.json avec scripts prisma
    - Installer prisma et @prisma/client
  - [ ] 1.2 Configurer Prisma
    - Initialiser prisma avec `npx prisma init`
    - Configurer DATABASE_URL dans .env
    - Configurer le provider postgresql dans schema.prisma
  - [ ] 1.3 Créer la structure de dossiers
    - prisma/schema.prisma
    - prisma/migrations/
    - src/ pour le futur code applicatif

**Acceptance Criteria:**
- Prisma initialisé avec connexion PostgreSQL configurée
- Fichier .env avec DATABASE_URL
- Structure de projet prête

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

