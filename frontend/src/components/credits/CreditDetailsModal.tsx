import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Calendar, Percent, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Credit } from '@/types/credit';
import { useCreditStats } from '@/hooks/useCredits';
import { DeblocageList } from './DeblocageList';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CreditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credit: Credit | null;
  onAddDeblocage: (credit: Credit) => void;
  onDeleteDeblocage: (creditId: string, deblocageId: string) => void;
}

export function CreditDetailsModal({ 
  isOpen, 
  onClose, 
  credit,
  onAddDeblocage,
  onDeleteDeblocage
}: CreditDetailsModalProps) {
  if (!credit) return null;

  const stats = useCreditStats(credit);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="glass-dark rounded-xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-primary">{credit.nom}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{credit.organisme}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-overlay text-tertiary transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Stats */}
                <div className="p-5 border-b border-subtle">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-overlay/30">
                      <p className="text-xs text-muted mb-1">Total</p>
                      <p className="text-lg font-bold text-primary">
                        {credit.montantTotal.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-overlay/30">
                      <p className="text-xs text-muted mb-1">Débloqué</p>
                      <p className="text-lg font-bold text-green-400">
                        {stats.montantDebloque.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-overlay/30">
                      <p className="text-xs text-muted mb-1">Disponible</p>
                      <p className="text-lg font-bold text-accent-400">
                        {stats.montantRestant.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-overlay/30">
                      <p className="text-xs text-muted mb-1">Mensualité</p>
                      <p className="text-lg font-bold text-blue-400">
                        {credit.mensualite?.toLocaleString('fr-FR') || '-'}€
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted">Progression</span>
                      <span className={cn(
                        'font-semibold',
                        stats.pourcentageDebloque === 100 ? 'text-green-400' : 'text-primary-400'
                      )}>
                        {stats.pourcentageDebloque}%
                      </span>
                    </div>
                    <div className="h-2 bg-overlay rounded-full overflow-hidden">
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

                  {/* Info badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium flex items-center gap-1.5">
                      <Percent className="w-3 h-3" />
                      {credit.tauxInteret}%
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {credit.dureeRemboursement} mois
                    </span>
                    {credit.dateDebut && (
                      <span className="px-2.5 py-1 rounded-lg bg-surface-700 text-secondary text-xs font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(credit.dateDebut), 'd MMM yyyy', { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Deblocages */}
                <div>
                  <div className="flex items-center justify-between p-5 border-b border-subtle">
                    <h3 className="text-sm font-semibold text-secondary">
                      Déblocages ({stats.nombreDeblocages})
                    </h3>
                    <Button size="sm" onClick={() => onAddDeblocage(credit)}>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Ajouter
                    </Button>
                  </div>
                  <DeblocageList
                    deblocages={credit.deblocages}
                    onDelete={(deblocageId) => onDeleteDeblocage(credit.id, deblocageId)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
