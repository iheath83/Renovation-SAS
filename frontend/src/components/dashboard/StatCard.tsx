import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'red' | 'blue';
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  const colorClasses = {
    primary: {
      icon: 'bg-primary-500/20 text-primary-400',
      glow: 'bg-primary-500',
      trend: 'text-primary-400',
    },
    accent: {
      icon: 'bg-accent-500/20 text-accent-400',
      glow: 'bg-accent-500',
      trend: 'text-accent-400',
    },
    red: {
      icon: 'bg-red-500/20 text-red-400',
      glow: 'bg-red-500',
      trend: 'text-red-400',
    },
    blue: {
      icon: 'bg-blue-500/20 text-blue-400',
      glow: 'bg-blue-500',
      trend: 'text-blue-400',
    },
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-[var(--radius-card)] p-5 relative overflow-hidden group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-tertiary">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold text-primary font-display">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-primary-400' : 'text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colorClasses[color].icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Glow effect on hover */}
      <div
        className={cn(
          'absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500',
          colorClasses[color].glow
        )}
      />
    </motion.div>
  );
}

