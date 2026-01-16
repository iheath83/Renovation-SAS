# Planning Initialization: Intégration Bancaire

## Feature Overview
Implémentation de la connexion bancaire sécurisée via Bridge API pour automatiser l'import des dépenses de rénovation à partir des transactions bancaires.

## Complexity Assessment
**Size: L (Large)**

Cette feature est complexe car elle implique :
- Intégration d'une API tierce (Bridge API)
- Gestion de webhooks et synchronisation asynchrone
- Nouveau modèle de données avec 2 entités
- Logique de catégorisation intelligente
- Frontend avec widget externe et nouvelles pages
- Considérations de sécurité importantes (données bancaires)

## Key Technical Decisions
1. **Bridge API** : API française recommandée par la Banque de France, conforme DSP2
2. **Webhooks** : Synchronisation en temps réel via webhooks plutôt que polling
3. **Semi-automatique** : Validation manuelle requise avant conversion en dépense (sécurité)
4. **Catégorisation** : Règles simples basées sur mots-clés pour MVP (pas de ML)

