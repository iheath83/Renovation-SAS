import { cn } from '@/lib/utils';
import type { GanttDay } from '@/lib/gantt';

interface GanttTimelineProps {
  days: GanttDay[];
}

const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export function GanttTimeline({ days }: GanttTimelineProps) {
  return (
    <div className="flex">
      {days.map((day, index) => (
        <div
          key={index}
          className={cn(
            'flex-1 min-w-[28px] py-2 text-center border-r border-subtle/30 flex flex-col items-center gap-0.5',
            day.isWeekend && 'bg-elevated/40',
            day.isToday && 'bg-primary-500/15'
          )}
        >
          {/* Day of week */}
          <span className={cn(
            'text-[9px] uppercase font-medium',
            day.isToday ? 'text-primary-400' : day.isWeekend ? 'text-muted' : 'text-muted'
          )}>
            {dayNames[day.dayOfWeek]}
          </span>
          {/* Day number */}
          <span className={cn(
            'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full',
            day.isToday 
              ? 'bg-primary-500 text-white' 
              : day.isWeekend 
                ? 'text-muted' 
                : 'text-secondary'
          )}>
            {day.dayOfMonth}
          </span>
        </div>
      ))}
    </div>
  );
}
