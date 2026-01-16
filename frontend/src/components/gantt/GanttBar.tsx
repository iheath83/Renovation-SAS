import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getStatusColor, getPriorityBorder } from '@/lib/gantt';
import type { GanttTask } from '@/lib/gantt';
import { Check, Clock, Pause, AlertTriangle } from 'lucide-react';

interface GanttBarProps {
  task: GanttTask;
  left: number;
  width: number;
  onClick?: () => void;
}

const StatusIcon = ({ statut }: { statut: string }) => {
  switch (statut) {
    case 'TERMINE':
      return <Check className="w-3 h-3" />;
    case 'EN_COURS':
      return <Clock className="w-3 h-3" />;
    case 'EN_ATTENTE':
      return <Pause className="w-3 h-3" />;
    default:
      return null;
  }
};

export function GanttBar({ task, left, width, onClick }: GanttBarProps) {
  const isUrgent = task.priorite === 'URGENTE';
  const isHigh = task.priorite === 'HAUTE';
  const showProgress = task.progress > 0 && task.progress < 100;

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      whileHover={{ scale: 1.02, y: -1 }}
      className={cn(
        'absolute top-1.5 bottom-1.5 rounded-lg cursor-pointer overflow-hidden',
        'shadow-lg hover:shadow-xl transition-shadow',
        getStatusColor(task.statut),
        getPriorityBorder(task.priorite)
      )}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 3)}%`, // Minimum width for visibility
        transformOrigin: 'left',
      }}
      onClick={onClick}
    >
      {/* Progress background */}
      {showProgress && (
        <div 
          className="absolute inset-y-0 left-0 bg-white/20"
          style={{ width: `${task.progress}%` }}
        />
      )}
      
      {/* Urgent/High priority indicator */}
      {(isUrgent || isHigh) && (
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          isUrgent ? 'bg-red-500' : 'bg-orange-500'
        )} />
      )}
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center gap-1.5 px-2 overflow-hidden">
        {/* Status icon */}
        <div className="flex-shrink-0 opacity-80">
          <StatusIcon statut={task.statut} />
        </div>
        
        {/* Title */}
        <span className="text-xs font-medium text-white truncate whitespace-nowrap flex-1">
          {task.titre}
        </span>
        
        {/* Progress percentage */}
        {showProgress && width > 8 && (
          <span className="text-[10px] font-bold text-white/80 flex-shrink-0">
            {Math.round(task.progress)}%
          </span>
        )}
        
        {/* Urgent indicator */}
        {isUrgent && width > 5 && (
          <AlertTriangle className="w-3 h-3 text-white/80 flex-shrink-0" />
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none z-50">
        <div className="px-2 py-1 rounded bg-elevated text-xs text-white whitespace-nowrap shadow-lg">
          {task.titre}
        </div>
      </div>
    </motion.div>
  );
}
