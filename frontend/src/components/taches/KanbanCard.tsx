import { motion } from 'framer-motion';
import { Calendar, Euro, CheckSquare, MapPin, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tache } from '@/types/tache';
import { PRIORITE_LABELS, PRIORITE_COLORS } from '@/types/tache';

interface KanbanCardProps {
  tache: Tache;
  onClick?: () => void;
  isDragging?: boolean;
}

export function KanbanCard({ tache, onClick, isDragging }: KanbanCardProps) {
  const completedSousTaches = tache.sousTaches.filter(st => st.fait).length;
  const totalSousTaches = tache.sousTaches.length;
  const progressPercent = totalSousTaches > 0 ? (completedSousTaches / totalSousTaches) * 100 : 0;

  const isOverdue = tache.dateFin && new Date(tache.dateFin) < new Date() && tache.statut !== 'TERMINE';

  return (
    <motion.div
      layout
      layoutId={tache.id}
      onClick={onClick}
      className={cn(
        'group p-3 rounded-xl bg-overlay/80 border border-primary/50 cursor-pointer',
        'hover:border-primary-500/30 hover:bg-overlay transition-colors',
        isDragging && 'shadow-lg shadow-primary-500/20 border-primary-500/50 rotate-2',
      )}
    >
      {/* Drag handle + Priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className={cn('text-xs font-medium', PRIORITE_COLORS[tache.priorite])}>
            {PRIORITE_LABELS[tache.priorite]}
          </span>
        </div>
        {tache.pieceName && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="w-3 h-3" />
            {tache.pieceName}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-medium text-primary text-sm mb-2 line-clamp-2">
        {tache.titre}
      </h4>

      {/* Description */}
      {tache.description && (
        <p className="text-xs text-tertiary mb-3 line-clamp-2">
          {tache.description}
        </p>
      )}

      {/* Sous-tâches progress */}
      {totalSousTaches > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-tertiary mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              Sous-tâches
            </span>
            <span>{completedSousTaches}/{totalSousTaches}</span>
          </div>
          <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Date */}
        {tache.dateFin && (
          <span className={cn(
            'flex items-center gap-1 text-xs',
            isOverdue ? 'text-red-400' : 'text-muted'
          )}>
            <Calendar className="w-3 h-3" />
            {new Date(tache.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
        )}

        {/* Cost */}
        {tache.coutEstime && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Euro className="w-3 h-3" />
            {tache.coutReel || tache.coutEstime}€
          </span>
        )}
      </div>
    </motion.div>
  );
}

