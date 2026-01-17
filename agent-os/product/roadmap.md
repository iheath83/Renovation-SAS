# Product Roadmap

1. [x] Modèle de données & Prisma — Créer les 8 entités (Piece, Tache, Materiau, Depense, Credit, Deblocage, IdeePinterest, Moodboard, User) avec leurs relations et migrations Prisma. `M`

2. [x] API CRUD Backend — Implémenter les endpoints REST pour toutes les entités avec validation et gestion d'erreurs. `M`

3. [x] Authentification — Mettre en place l'auth avec Passport.js/Clerk, gestion des sessions, rôles admin/user et protection des routes. `S`

4. [x] Layout & Navigation — Créer le layout principal glassmorphism avec navigation responsive, animations blob en fond et sidebar. `S`

5. [x] Dashboard — Développer le tableau de bord avec KPIs budgétaires, graphique budget par pièce (Recharts), alertes tâches en retard et activité récente. `M`

6. [x] Module Pièces — Implémenter la gestion des pièces avec vue grid/list, filtres, upload images, progression budgétaire et tags. `M`

7. [x] Module Tâches Kanban — Créer la vue Kanban drag & drop avec @hello-pangea/dnd, gestion dépendances, sous-tâches et coûts. `L`

8. [x] Module Gantt — Développer la timeline des tâches avec navigation mensuelle, calcul durées automatique et indicateurs dépendances. `M`

9. [x] Module Matériaux — Implémenter le catalogue visuel avec catégorisation, calcul coûts, liens marchands et unités multiples. `S`

10. [x] Module Dépenses — Créer la liste des dépenses avec multi-upload factures, statistiques et indicateur "passé dans crédit". `M`

11. [x] Module Budget & Suivi — Développer la vue budget avec budget max projet, projection payé + prévu, graphique pie, variances et alertes. `M`

12. [x] Module Crédits Travaux — Implémenter la gestion multi-crédits avec déblocages, upload justificatifs et progression visuelle. `S`

13. [x] Module Idées Pinterest + IA — Créer la collection d'inspirations avec extraction IA de métadonnées via LLM, tags et liens. `L`

14. [x] Module Moodboards — Développer les planches d'inspiration avec palettes de couleurs et associations matériaux/pièces. `M`

15. [x] Upload fichiers & Storage — Configurer AWS S3/Cloudinary pour images, factures et justificatifs avec multi-upload. `S`

16. [ ] Optimisation & Cache — Implémenter React Query avec cache optimisé, invalidation intelligente et recherche temps réel. `S`

17. [ ] Intégration Bancaire — Connecter les comptes bancaires via Bridge API pour récupérer automatiquement les transactions et créer des dépenses. `L`

> Notes
> - Order items by technical dependencies and product architecture
> - Each item should represent an end-to-end (frontend + backend) functional and testable feature

