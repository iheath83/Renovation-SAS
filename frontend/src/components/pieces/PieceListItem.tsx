import { motion } from 'framer-motion';
import { MoreHorizontal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import type { Piece } from '@/types/piece';
import { TYPE_PIECE_ICONS, TYPE_PIECE_LABELS, STATUT_PIECE_LABELS } from '@/types/piece';

interface PieceListItemProps {
  piece: Piece;
  depense: number;
  onClick?: () => void;
  onEdit?: () => void;
}

const statutColors = {
  A_FAIRE: 'bg-surface-700 text-secondary',
  EN_COURS: 'bg-primary-500/20 text-primary-400',
  TERMINE: 'bg-green-500/20 text-green-400',
};

export function PieceListItem({ piece, depense, onClick, onEdit }: PieceListItemProps) {
  const budget = piece.budget || 0;
  const progression = budget > 0 ? Math.min((depense / budget) * 100, 100) : 0;
  const isOverBudget = depense > budget && budget > 0;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-4 rounded-xl glass cursor-pointer group"
      onClick={onClick}
    >
      {/* Icon */}
      <div className="text-2xl flex-shrink-0">{TYPE_PIECE_ICONS[piece.type]}</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-primary truncate">{piece.name}</h3>
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statutColors[piece.statut])}>
            {STATUT_PIECE_LABELS[piece.statut]}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-tertiary">
          <span>{TYPE_PIECE_LABELS[piece.type]}</span>
          {piece.etage !== null && piece.etage !== undefined && (
            <span>Étage {piece.etage}</span>
          )}
          {piece.surface && <span>{piece.surface}m²</span>}
          {piece._count && <span>{piece._count.taches} tâches</span>}
        </div>
      </div>

      {/* Budget */}
      <div className="hidden md:flex flex-col items-end gap-1 w-48">
        {budget > 0 ? (
          <>
            <span className={cn('text-sm font-medium', isOverBudget ? 'text-red-400' : 'text-primary')}>
              {depense.toLocaleString('fr-FR')}€ / {budget.toLocaleString('fr-FR')}€
            </span>
            <div className="w-full">
              <ProgressBar
                value={progression}
                color={isOverBudget ? 'red' : progression > 80 ? 'accent' : 'primary'}
                size="sm"
                showValue={false}
              />
            </div>
          </>
        ) : (
          <span className="text-sm text-muted">Pas de budget</span>
        )}
      </div>

      {/* Tags */}
      <div className="hidden lg:flex items-center gap-1.5 w-32">
        {piece.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs rounded bg-overlay text-tertiary">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover-bg transition-all"
        >
          <MoreHorizontal className="w-4 h-4 text-tertiary" />
        </button>
        <ChevronRight className="w-5 h-5 text-muted group-hover:text-secondary transition-colors" />
      </div>
    </motion.div>
  );
}

