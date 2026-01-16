import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { AlerteBudget } from '@/types/budget';
import { ALERT_COLORS, ALERT_ICONS } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetAlertesProps {
  alertes: AlerteBudget[];
}

const AlertIcon = ({ type }: { type: AlerteBudget['type'] }) => {
  switch (type) {
    case 'DEPASSEMENT':
      return <AlertTriangle className="w-5 h-5" />;
    case 'ATTENTION':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

export function BudgetAlertes({ alertes }: BudgetAlertesProps) {
  if (alertes.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Alertes budget</h3>
        <div className="flex items-center justify-center py-8 text-green-400">
          <span className="text-2xl mr-2">✓</span>
          <span>Aucune alerte - Budget sous contrôle</span>
        </div>
      </Card>
    );
  }

  const depassements = alertes.filter(a => a.type === 'DEPASSEMENT');
  const attentions = alertes.filter(a => a.type === 'ATTENTION');

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Alertes budget</h3>
        <div className="flex items-center gap-2 text-sm">
          {depassements.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
              {depassements.length} critique{depassements.length > 1 ? 's' : ''}
            </span>
          )}
          {attentions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
              {attentions.length} attention
            </span>
          )}
        </div>
      </div>

      <motion.div className="space-y-2">
        <AnimatePresence>
          {alertes.map((alerte, index) => (
            <motion.div
              key={alerte.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border',
                ALERT_COLORS[alerte.type]
              )}
            >
              <span className="text-xl">{ALERT_ICONS[alerte.type]}</span>
              <div className="flex-1">
                <p className="font-medium">{alerte.message}</p>
                {alerte.montant && (
                  <p className="text-sm opacity-80">
                    Montant: {alerte.montant.toLocaleString('fr-FR')}€
                  </p>
                )}
              </div>
              <AlertIcon type={alerte.type} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}

