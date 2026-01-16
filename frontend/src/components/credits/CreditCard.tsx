import { motion } from 'framer-motion';
import { Building2, TrendingUp, Wallet, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Credit } from '@/types/credit';
import { useCreditStats } from '@/hooks/useCredits';

interface CreditCardProps {
  credit: Credit;
  onEdit: (credit: Credit) => void;
  onDelete: (credit: Credit) => void;
  onAddDeblocage: (credit: Credit) => void;
  onDeleteDeblocage: (creditId: string, deblocageId: string) => void;
}

export function CreditCard({ credit, onEdit, onDelete, onAddDeblocage }: CreditCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const stats = useCreditStats(credit);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 h-full cursor-pointer hover:shadow-lg transition-all relative group" onClick={() => onAddDeblocage(credit)}>
        {/* Menu */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg hover:bg-overlay text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 glass-dark rounded-lg shadow-xl overflow-hidden border border-subtle">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(credit);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-secondary hover:bg-overlay transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(credit);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-primary mb-1 pr-8">{credit.nom}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Building2 className="w-3.5 h-3.5" />
            <span>{credit.organisme}</span>
          </div>
        </div>

        {/* Main amount */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-primary">
            {credit.montantTotal.toLocaleString('fr-FR')}€
          </div>
          <div className="text-xs text-tertiary">Montant total</div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted">Déblocages</span>
            <span className={cn(
              'font-semibold',
              stats.pourcentageDebloque === 100 ? 'text-green-400' : 'text-primary-400'
            )}>
              {stats.pourcentageDebloque}%
            </span>
          </div>
          <div className="h-1.5 bg-overlay rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.pourcentageDebloque}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                stats.pourcentageDebloque === 100 ? 'bg-green-500' : 'bg-primary-500'
              )}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-subtle">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted mb-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Reçu</span>
            </div>
            <div className="text-sm font-semibold text-green-400">
              {stats.montantDebloque.toLocaleString('fr-FR')}€
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted mb-0.5">
              <Wallet className="w-3 h-3" />
              <span>Restant</span>
            </div>
            <div className="text-sm font-semibold text-accent-400">
              {stats.montantRestant.toLocaleString('fr-FR')}€
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

