import { useMemo } from 'react';
import { useDepenses } from './useDepenses';
import { usePieces } from './usePieces';
import { useProjetSettings } from './useSettings';
import type { BudgetProjet, BudgetPiece, BudgetCategorie, AlerteBudget } from '@/types/budget';
import { CATEGORIE_DEPENSE_LABELS } from '@/types/depense';
import type { CategorieDepense } from '@/types/depense';
import type { Piece } from '@/types/piece';

const DEFAULT_BUDGET_MAX = 50000; // Fallback si pas de settings

const PIE_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export function useBudget() {
  // Récupérer le budget max des settings
  const { data: projetSettings } = useProjetSettings();
  const BUDGET_MAX_PROJET = projetSettings?.budgetMax ?? DEFAULT_BUDGET_MAX;

  // Séparer dépenses réalisées et prévues
  const { data: depensesRealisees = [] } = useDepenses({ estPrevue: false });
  const { data: depensesPrevues = [] } = useDepenses({ estPrevue: true });
  const { data: pieces = [] } = usePieces();

  const budgetProjet = useMemo<BudgetProjet>(() => {
    // Total dépensé = uniquement dépenses réalisées
    const totalDepensees = depensesRealisees.reduce((sum, d) => sum + d.montant, 0);
    
    // Total prévu = uniquement les dépenses prévues (créées par l'utilisateur)
    const totalPrevu = depensesPrevues.reduce((sum, d) => sum + d.montant, 0);
    
    const dansCredit = depensesRealisees.filter(d => d.passeDansCredit).reduce((sum, d) => sum + d.montant, 0);
    const horsCredit = totalDepensees - dansCredit;
    
    return {
      budgetMax: BUDGET_MAX_PROJET,
      totalDepense: totalDepensees,
      totalPrevu,
      totalRestant: BUDGET_MAX_PROJET - totalDepensees - totalPrevu,
      pourcentageUtilise: Math.round((totalDepensees / BUDGET_MAX_PROJET) * 100),
      dansCredit,
      horsCredit,
    };
  }, [depensesRealisees, depensesPrevues, BUDGET_MAX_PROJET]);

  const budgetParPiece = useMemo<BudgetPiece[]>(() => {
    return (pieces as Piece[]).map((piece: Piece) => {
      const depensesRealiseesPiece = depensesRealisees.filter(d => d.pieceId === piece.id);
      const depensesPrevuesPiece = depensesPrevues.filter(d => d.pieceId === piece.id);
      
      const depense = depensesRealiseesPiece.reduce((sum, d) => sum + d.montant, 0);
      const prevu = depensesPrevuesPiece.reduce((sum, d) => sum + d.montant, 0);
      
      const budgetAlloue = piece.budget || 0;
      const restant = budgetAlloue - depense - prevu;
      const variance = budgetAlloue - depense;
      
      return {
        pieceId: piece.id,
        pieceName: piece.name,
        budgetAlloue,
        depense,
        prevu,
        restant,
        pourcentage: budgetAlloue > 0 ? Math.round((depense / budgetAlloue) * 100) : 0,
        variance,
        isOverBudget: depense > budgetAlloue,
      };
    }).sort((a: BudgetPiece, b: BudgetPiece) => b.depense - a.depense);
  }, [pieces, depensesRealisees, depensesPrevues]);

  const budgetParCategorie = useMemo<BudgetCategorie[]>(() => {
    // Uniquement les dépenses réalisées pour le graphique
    const byCategorie = depensesRealisees.reduce((acc, d) => {
      acc[d.categorie] = (acc[d.categorie] || 0) + d.montant;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(byCategorie).reduce((sum, v) => sum + v, 0);
    
    return Object.entries(byCategorie)
      .map(([cat, montant], index) => ({
        categorie: cat,
        label: CATEGORIE_DEPENSE_LABELS[cat as CategorieDepense] || cat,
        montant,
        pourcentage: total > 0 ? Math.round((montant / total) * 100) : 0,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .sort((a, b) => b.montant - a.montant);
  }, [depensesRealisees]);

  const alertes = useMemo<AlerteBudget[]>(() => {
    const alerts: AlerteBudget[] = [];
    
    // Alerte budget global
    if (budgetProjet.pourcentageUtilise > 90) {
      alerts.push({
        id: 'global-90',
        type: 'DEPASSEMENT',
        message: `Budget projet utilisé à ${budgetProjet.pourcentageUtilise}%`,
        montant: budgetProjet.totalDepense,
      });
    } else if (budgetProjet.pourcentageUtilise > 75) {
      alerts.push({
        id: 'global-75',
        type: 'ATTENTION',
        message: `Budget projet utilisé à ${budgetProjet.pourcentageUtilise}%`,
        montant: budgetProjet.totalDepense,
      });
    }

    // Projection dépassement
    const projection = budgetProjet.totalDepense + budgetProjet.totalPrevu;
    if (projection > budgetProjet.budgetMax) {
      alerts.push({
        id: 'projection',
        type: 'DEPASSEMENT',
        message: `Projection dépasse le budget de ${(projection - budgetProjet.budgetMax).toLocaleString('fr-FR')}€`,
        montant: projection - budgetProjet.budgetMax,
      });
    }

    // Alertes par pièce
    budgetParPiece.forEach(piece => {
      if (piece.isOverBudget && piece.budgetAlloue > 0) {
        alerts.push({
          id: `piece-${piece.pieceId}`,
          type: 'DEPASSEMENT',
          message: `${piece.pieceName} dépasse son budget de ${Math.abs(piece.variance).toLocaleString('fr-FR')}€`,
          pieceId: piece.pieceId,
          pieceName: piece.pieceName,
          montant: Math.abs(piece.variance),
        });
      } else if (piece.pourcentage > 80 && piece.budgetAlloue > 0 && !piece.isOverBudget) {
        alerts.push({
          id: `piece-warning-${piece.pieceId}`,
          type: 'ATTENTION',
          message: `${piece.pieceName} à ${piece.pourcentage}% du budget`,
          pieceId: piece.pieceId,
          pieceName: piece.pieceName,
        });
      }
    });

    return alerts;
  }, [budgetProjet, budgetParPiece]);

  return {
    budgetProjet,
    budgetParPiece,
    budgetParCategorie,
    alertes,
    BUDGET_MAX: BUDGET_MAX_PROJET,
    // Valeurs simplifiées pour le dashboard
    totalBudgetProjet: BUDGET_MAX_PROJET,
    totalDepensees: budgetProjet.totalDepense,
    totalPrevu: budgetProjet.totalPrevu,
    alertesBudgetaires: alertes,
  };
}
