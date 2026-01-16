import { motion } from 'framer-motion';
import { Calendar, FileText, Trash2 } from 'lucide-react';
import type { Deblocage } from '@/types/credit';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DeblocageListProps {
  deblocages: Deblocage[];
  onDelete: (deblocageId: string) => void;
}

export function DeblocageList({ deblocages, onDelete }: DeblocageListProps) {
  if (deblocages.length === 0) {
    return (
      <div className="p-6 text-center">
        <FileText className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
        <p className="text-sm text-tertiary">Aucun déblocage</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedDeblocages = [...deblocages].sort(
    (a, b) => new Date(b.dateDeblocage).getTime() - new Date(a.dateDeblocage).getTime()
  );

  return (
    <div className="p-4 space-y-2">
      {sortedDeblocages.map((deblocage, index) => (
        <motion.div
          key={deblocage.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group flex items-center gap-3 p-3 rounded-lg bg-overlay/30 hover:bg-overlay/50 transition-colors"
        >
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted min-w-[90px]">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(deblocage.dateDeblocage), 'd MMM yyyy', { locale: fr })}</span>
          </div>

          {/* Description */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary truncate">
              {deblocage.description || 'Déblocage'}
            </p>
          </div>

          {/* Amount */}
          <p className="text-sm font-semibold text-green-400 min-w-[80px] text-right">
            +{deblocage.montant.toLocaleString('fr-FR')}€
          </p>

          {/* Delete */}
          <button
            onClick={() => onDelete(deblocage.id)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

