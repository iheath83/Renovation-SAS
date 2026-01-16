import {
  CheckCircle2,
  Receipt,
  Lightbulb,
  CreditCard,
  Home,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type ActivityType = 'task' | 'expense' | 'idea' | 'credit' | 'piece' | 'material';

interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  item: string;
  time: string;
  metadata?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  task: { icon: CheckCircle2, color: 'text-primary-400 bg-primary-500/20' },
  expense: { icon: Receipt, color: 'text-accent-400 bg-accent-500/20' },
  idea: { icon: Lightbulb, color: 'text-yellow-400 bg-yellow-500/20' },
  credit: { icon: CreditCard, color: 'text-blue-400 bg-blue-500/20' },
  piece: { icon: Home, color: 'text-purple-400 bg-purple-500/20' },
  material: { icon: Package, color: 'text-cyan-400 bg-cyan-500/20' },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 py-3 border-b border-subtle last:border-0 group cursor-pointer hover-bg -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className={cn('p-2 rounded-lg flex-shrink-0', config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-tertiary">{activity.action}</p>
                  <p className="font-medium text-primary truncate">{activity.item}</p>
                  {activity.metadata && (
                    <p className="text-xs text-muted mt-0.5">{activity.metadata}</p>
                  )}
                </div>
                <span className="text-xs text-muted flex-shrink-0">
                  {activity.time}
                </span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

