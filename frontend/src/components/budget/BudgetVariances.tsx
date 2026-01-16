import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { BudgetPiece } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetVariancesProps {
  pieces: BudgetPiece[];
}

export function BudgetVariances({ pieces }: BudgetVariancesProps) {
  const piecesWithBudget = pieces.filter(p => p.budgetAlloue > 0);

  if (piecesWithBudget.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Variances par pièce</h3>
        <div className="text-center py-8 text-muted">
          Aucune pièce avec budget défini
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Variances par pièce</h3>
      <div className="space-y-3">
        {piecesWithBudget.map((piece) => {
          return (
            <div 
              key={piece.pieceId}
              className="flex items-center gap-4 p-3 rounded-xl bg-overlay/50"
            >
              {/* Piece name */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary truncate">
                  {piece.pieceName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span>Budget: {piece.budgetAlloue.toLocaleString('fr-FR')}€</span>
                  <span>•</span>
                  <span>Dépensé: {piece.depense.toLocaleString('fr-FR')}€</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-32 hidden sm:block">
                <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all',
                      piece.pourcentage > 100 ? 'bg-red-500' :
                      piece.pourcentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                    )}
                    style={{ width: `${Math.min(piece.pourcentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted text-center mt-1">
                  {piece.pourcentage}%
                </p>
              </div>

              {/* Variance */}
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg min-w-[120px] justify-end',
                piece.isOverBudget 
                  ? 'bg-red-500/10 text-red-400' 
                  : piece.variance === 0 
                    ? 'bg-surface-700 text-tertiary'
                    : 'bg-green-500/10 text-green-400'
              )}>
                {piece.isOverBudget ? (
                  <TrendingDown className="w-4 h-4" />
                ) : piece.variance === 0 ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {piece.isOverBudget ? '-' : '+'}
                  {Math.abs(piece.variance).toLocaleString('fr-FR')}€
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

