import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Alert {
  id: string;
  title: string;
  dueDate: string;
  priority: 'URGENTE' | 'HAUTE' | 'MOYENNE';
  isOverdue: boolean;
  pieceName?: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

const priorityColors = {
  URGENTE: 'bg-red-500/20 border-red-500/30 text-red-400',
  HAUTE: 'bg-accent-500/20 border-accent-500/30 text-accent-400',
  MOYENNE: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
};

const priorityBadge = {
  URGENTE: 'bg-red-500/30 text-red-300',
  HAUTE: 'bg-accent-500/30 text-accent-300',
  MOYENNE: 'bg-blue-500/30 text-blue-300',
};

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary-400" />
            Alertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-primary-400" />
            </div>
            <p className="text-secondary font-medium">Aucune alerte</p>
            <p className="text-sm text-muted">Toutes vos tâches sont à jour</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent-500" />
          Alertes
          <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-accent-500/20 text-accent-400">
            {alerts.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]',
              priorityColors[alert.priority]
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('px-2 py-0.5 text-xs font-medium rounded', priorityBadge[alert.priority])}>
                    {alert.priority}
                  </span>
                  {alert.pieceName && (
                    <span className="text-xs text-muted truncate">
                      {alert.pieceName}
                    </span>
                  )}
                </div>
                <p className="font-medium text-primary truncate">{alert.title}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className={cn('text-sm', alert.isOverdue ? 'text-red-400' : '')}>
                    {alert.dueDate}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

