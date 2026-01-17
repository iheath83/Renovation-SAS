# Tech Stack - RénoVision

## Framework & Runtime
- **Application Framework:** Express (ou Fastify)
- **Language/Runtime:** Node.js
- **Package Manager:** npm

## Frontend
- **JavaScript Framework:** React 18.2.0 + JSX
- **CSS Framework:** Tailwind CSS (design glassmorphism)
- **UI Components:** shadcn/ui (Radix UI components)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Routing:** React Router DOM v7
- **State Management:** React Query v5
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Drag & Drop:** @hello-pangea/dnd
- **Dates:** date-fns

## Database & Storage
- **Database:** PostgreSQL
- **ORM:** Prisma
- **File Storage:** AWS S3 / Cloudinary
- **Queue:** BullMQ (jobs async)

## Testing & Quality
- **Test Framework:** Jest / Vitest
- **Linting/Formatting:** ESLint, Prettier

## Deployment & Infrastructure
- **Hosting:** Railway, Render ou Fly.io
- **CI/CD:** GitHub Actions

## Third-Party Services
- **Authentication:** Passport.js ou Clerk
- **IA/LLM:** Extraction métadonnées Pinterest (provider à définir)
- **Monitoring:** Sentry (recommandé)

## Design System
- **Style:** Glassmorphism
  - `backdrop-filter: blur(20px)`
  - Background semi-transparent
  - Borders subtils
  - Shadows profonds
- **Palette:** Gradients Purple/Blue/Pink/Cyan, Dark mode (#1a202c → #2d3748)
- **Animations:** Blob en fond, transitions Framer Motion
- **Responsive:** Mobile-first
- **Accessibility:** Via Radix UI (shadcn/ui)

