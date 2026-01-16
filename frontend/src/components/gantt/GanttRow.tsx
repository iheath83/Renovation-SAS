import { startOfMonth, endOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { GanttBar } from './GanttBar';
import { calculateBarPosition, calculateTaskDuration } from '@/lib/gantt';
import type { GanttTask, GanttDay } from '@/lib/gantt';
import { MapPin, Calendar, CheckCircle2, Clock, Pause, Circle } from 'lucide-react';

interface GanttRowProps {
  task: GanttTask;
  days: GanttDay[];
  currentDate: Date;
  onClick?: () => void;
}

const StatusBadge = ({ statut }: { statut: string }) => {
  const config = {
    TERMINE: { icon: CheckCircle2, color: 'text-green-400 bg-green-500/20', label: 'Terminé' },
    EN_COURS: { icon: Clock, color: 'text-primary-400 bg-primary-500/20', label: 'En cours' },
    EN_ATTENTE: { icon: Pause, color: 'text-accent-400 bg-accent-500/20', label: 'En attente' },
    A_FAIRE: { icon: Circle, color: 'text-tertiary bg-surface-500/20', label: 'À faire' },
  }[statut] || { icon: Circle, color: 'text-tertiary bg-surface-500/20', label: statut };

  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', config.color)}>
      <Icon className="w-2.5 h-2.5" />
      <span className="hidden xl:inline">{config.label}</span>
    </div>
  );
};

const PriorityDot = ({ priorite }: { priorite: string }) => {
  const colors = {
    URGENTE: 'bg-red-500',
    HAUTE: 'bg-orange-500',
    MOYENNE: 'bg-blue-500',
    BASSE: 'bg-surface-500',
  }[priorite] || 'bg-surface-500';

  return <div className={cn('w-2 h-2 rounded-full flex-shrink-0', colors)} />;
};

export function GanttRow({ task, days, currentDate, onClick }: GanttRowProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const totalDays = days.length;

  const { left, width, visible } = calculateBarPosition(
    task.dateDebut,
    task.dateFin,
    monthStart,
    monthEnd,
    totalDays
  );

  const duration = calculateTaskDuration(task.dateDebut, task.dateFin);

  return (
    <div 
      className={cn(
        'flex border-b border-subtle/50 transition-colors group',
        'hover:bg-overlay/40'
      )}
    >
      {/* Task info - Left panel */}
      <div 
        className="w-72 flex-shrink-0 p-3 border-r border-primary/50 cursor-pointer hover:bg-overlay/30"
        onClick={onClick}
      >
        <div className="flex items-start gap-2">
          {/* Priority indicator */}
          <PriorityDot priorite={task.priorite} />
          
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-medium text-primary text-sm truncate group-hover:text-primary-400 transition-colors">
              {task.titre}
            </h4>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {/* Status badge */}
              <StatusBadge statut={task.statut} />
              
              {/* Piece name */}
              {task.pieceName && (
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[80px]">{task.pieceName}</span>
                </div>
              )}
              
              {/* Duration */}
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {duration > 0 ? `${duration}j` : 'Non planifié'}
                </span>
              </div>
            </div>

            {/* Date range if available */}
            {task.dateDebut && task.dateFin && (
              <div className="text-[10px] text-muted mt-1">
                {format(task.dateDebut, 'd MMM', { locale: fr })} → {format(task.dateFin, 'd MMM', { locale: fr })}
              </div>
            )}

            {/* Progress bar for tasks with subtasks */}
            {task.progress > 0 && task.progress < 100 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-surface-700 overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted">{Math.round(task.progress)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline area */}
      <div className="flex-1 relative h-14">
        {/* Day columns background */}
        <div className="absolute inset-0 flex">
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                'flex-1 min-w-[28px] border-r border-subtle/30',
                day.isWeekend && 'bg-elevated/40',
                day.isToday && 'bg-primary-500/10 border-primary-500/30'
              )}
            />
          ))}
        </div>

        {/* Task bar */}
        {visible && (
          <GanttBar
            task={task}
            left={left}
            width={width}
            onClick={onClick}
          />
        )}

        {/* No dates indicator */}
        {!visible && !task.dateDebut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-overlay/50 text-[10px] text-muted">
              <Calendar className="w-3 h-3" />
              <span>Cliquez pour définir les dates</span>
            </div>
          </div>
        )}

        {/* Task outside current month indicator */}
        {!visible && task.dateDebut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-overlay/50 text-[10px] text-muted">
              <Calendar className="w-3 h-3" />
              <span>
                {task.dateDebut < monthStart ? '← Mois précédent' : 'Mois suivant →'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
