/**
 * Service de catégorisation intelligente des transactions bancaires
 */

// Règles de catégorisation basées sur des mots-clés
const RULES = {
  'Matériaux': {
    keywords: [
      'leroy merlin', 'castorama', 'brico depot', 'bricoman', 'point p', 
      'weldom', 'mr bricolage', 'bricomarche', 'brico cash', 'maxmat',
      'gedimat', 'lapeyre', 'saint maclou', 'la plateforme du batiment'
    ],
    confidence: 0.9
  },
  'Main d\'œuvre': {
    keywords: [
      'electricien', 'plombier', 'peintre', 'menuisier', 'carreleur',
      'macon', 'plaquier', 'platrier', 'chauffagiste', 'couvreur',
      'entreprise', 'artisan', 'sas', 'sarl', 'eurl'
    ],
    confidence: 0.8
  },
  'Mobilier': {
    keywords: [
      'ikea', 'conforama', 'but', 'maisons du monde', 'fly',
      'alinea', 'la redoute', 'made', 'habitat', 'meuble'
    ],
    confidence: 0.9
  },
  'Outillage': {
    keywords: [
      'outillage', 'outil', 'makita', 'bosch', 'dewalt', 'metabo',
      'ryobi', 'stanley', 'black decker', 'hilti', 'festool'
    ],
    confidence: 0.95
  },
  'Électricité': {
    keywords: [
      'electrique', 'electricite', 'cable', 'prise', 'interrupteur',
      'tableau electrique', 'disjoncteur', 'ampoule', 'luminaire', 'lampe'
    ],
    confidence: 0.85
  },
  'Plomberie': {
    keywords: [
      'plomberie', 'robinet', 'tuyau', 'sanitaire', 'salle de bain',
      'douche', 'baignoire', 'wc', 'chasse d\'eau', 'lavabo', 'evier'
    ],
    confidence: 0.85
  },
  'Peinture': {
    keywords: [
      'peinture', 'vernis', 'lasure', 'enduit', 'colle', 'mastic',
      'rouleau', 'pinceau', 'bac peinture', 'dulux', 'ripolin', 'v33'
    ],
    confidence: 0.9
  },
  'Revêtement sol': {
    keywords: [
      'parquet', 'carrelage', 'moquette', 'vinyl', 'lino', 'stratifie',
      'plancher', 'sol', 'dalle', 'plinthe'
    ],
    confidence: 0.85
  },
  'Revêtement mur': {
    keywords: [
      'papier peint', 'tapisserie', 'carrelage mural', 'faience',
      'lambris', 'panneau mural'
    ],
    confidence: 0.85
  },
  'Isolation': {
    keywords: [
      'isolation', 'isolant', 'laine de verre', 'laine de roche',
      'polystyrene', 'mousse polyurethane', 'ouate de cellulose'
    ],
    confidence: 0.9
  }
};

export const CategoService = {
  /**
   * Catégorise une transaction bancaire
   * @param {Object} transaction - Transaction à catégoriser
   * @returns {Object} { categorie, confidence, materiauxSuggeres }
   */
  categorizeTransaction(transaction) {
    const description = (transaction.description || '').toLowerCase();
    
    let bestMatch = {
      categorie: null,
      confidence: 0,
    };

    // Parcourir toutes les règles
    for (const [categorie, rule] of Object.entries(RULES)) {
      const matchCount = rule.keywords.filter(keyword => 
        description.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > 0) {
        const confidence = (matchCount / rule.keywords.length) * rule.confidence;
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            categorie,
            confidence,
          };
        }
      }
    }

    return bestMatch.categorie ? bestMatch : {
      categorie: 'Autre',
      confidence: 0
    };
  },

  /**
   * Suggère des matériaux existants basés sur la description de la transaction
   * @param {Object} transaction - Transaction
   * @param {Array} materiaux - Liste des matériaux du projet
   * @returns {Array} Matériaux suggérés
   */
  async suggestMateriaux(transaction, materiaux) {
    const description = (transaction.description || '').toLowerCase();
    const suggestions = [];

    for (const materiau of materiaux) {
      const fournisseur = (materiau.fournisseur || '').toLowerCase();
      const name = (materiau.name || '').toLowerCase();

      // Match sur le fournisseur
      if (fournisseur && description.includes(fournisseur)) {
        suggestions.push({
          materiau,
          confidence: 0.8,
          reason: 'Fournisseur identique'
        });
        continue;
      }

      // Match sur le nom du matériau
      if (name && description.includes(name)) {
        suggestions.push({
          materiau,
          confidence: 0.6,
          reason: 'Nom similaire'
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  },

  /**
   * Détecte si une transaction est probablement liée à la rénovation
   * @param {Object} transaction - Transaction
   * @returns {Boolean}
   */
  isRenovationRelated(transaction) {
    const { categorie, confidence } = this.categorizeTransaction(transaction);
    return categorie !== 'Autre' && confidence > 0.5;
  }
};

