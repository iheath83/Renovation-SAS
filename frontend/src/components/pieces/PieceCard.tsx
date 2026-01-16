import { motion } from 'framer-motion';
import { MoreHorizontal, MapPin, Ruler, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import type { Piece } from '@/types/piece';
import { TYPE_PIECE_ICONS, TYPE_PIECE_LABELS, STATUT_PIECE_LABELS } from '@/types/piece';

interface PieceCardProps {
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

export function PieceCard({ piece, depense, onClick, onEdit }: PieceCardProps) {
  const budget = piece.budget || 0;
  const progression = budget > 0 ? Math.min((depense / budget) * 100, 100) : 0;
  const isOverBudget = depense > budget && budget > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-[var(--radius-card)] p-5 cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover-bg transition-all"
      >
        <MoreHorizontal className="w-4 h-4 text-tertiary" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{TYPE_PIECE_ICONS[piece.type]}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary truncate">{piece.name}</h3>
          <p className="text-sm text-tertiary">{TYPE_PIECE_LABELS[piece.type]}</p>
        </div>
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium', statutColors[piece.statut])}>
          {STATUT_PIECE_LABELS[piece.statut]}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        {piece.etage !== null && piece.etage !== undefined && (
          <div className="p-2 rounded-lg bg-elevated/50">
            <MapPin className="w-4 h-4 mx-auto text-muted mb-1" />
            <p className="text-xs text-tertiary">Étage {piece.etage}</p>
          </div>
        )}
        {piece.surface && (
          <div className="p-2 rounded-lg bg-elevated/50">
            <Ruler className="w-4 h-4 mx-auto text-muted mb-1" />
            <p className="text-xs text-tertiary">{piece.surface}m²</p>
          </div>
        )}
        {piece._count && (
          <div className="p-2 rounded-lg bg-elevated/50">
            <CheckSquare className="w-4 h-4 mx-auto text-muted mb-1" />
            <p className="text-xs text-tertiary">{piece._count.taches} tâches</p>
          </div>
        )}
      </div>

      {/* Budget progress */}
      {budget > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tertiary">Budget</span>
            <span className={cn('font-medium', isOverBudget ? 'text-red-400' : 'text-primary')}>
              {depense.toLocaleString('fr-FR')}€ / {budget.toLocaleString('fr-FR')}€
            </span>
          </div>
          <ProgressBar
            value={progression}
            color={isOverBudget ? 'red' : progression > 80 ? 'accent' : 'primary'}
            size="sm"
            showValue={false}
          />
        </div>
      )}

      {/* Tags */}
      {piece.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {piece.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-md bg-overlay text-tertiary"
            >
              {tag}
            </span>
          ))}
          {piece.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-md bg-overlay text-muted">
              +{piece.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Hover glow */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-primary-500 opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500" />
    </motion.div>
  );
}

