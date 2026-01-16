import { differenceInDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface GanttTask {
  id: string;
  titre: string;
  pieceName?: string | null;
  statut: string;
  priorite: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  progress: number; // 0-100
  dependances?: string[];
}

export interface GanttDay {
  date: Date;
  dayOfMonth: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  isWeekend: boolean;
  isToday: boolean;
}

export function getMonthDays(date: Date): GanttDay[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  return eachDayOfInterval({ start, end }).map(d => ({
    date: d,
    dayOfMonth: d.getDate(),
    dayOfWeek: d.getDay(),
    isWeekend: isWeekend(d),
    isToday: isToday(d),
  }));
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: fr });
}

export function calculateBarPosition(
  taskStart: Date | null,
  taskEnd: Date | null,
  monthStart: Date,
  monthEnd: Date,
  totalDays: number
): { left: number; width: number; visible: boolean } {
  if (!taskStart || !taskEnd) {
    return { left: 0, width: 0, visible: false };
  }

  // Task is entirely before or after the visible month
  if (taskEnd < monthStart || taskStart > monthEnd) {
    return { left: 0, width: 0, visible: false };
  }

  // Clamp dates to visible month
  const visibleStart = taskStart < monthStart ? monthStart : taskStart;
  const visibleEnd = taskEnd > monthEnd ? monthEnd : taskEnd;

  const dayOffset = differenceInDays(visibleStart, monthStart);
  const duration = differenceInDays(visibleEnd, visibleStart) + 1;

  const left = (dayOffset / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  return { left, width, visible: true };
}

export function calculateTaskDuration(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  return differenceInDays(end, start) + 1;
}

export function getStatusColor(statut: string): string {
  switch (statut) {
    case 'A_FAIRE':
      return 'bg-surface-600';
    case 'EN_COURS':
      return 'bg-primary-500';
    case 'EN_ATTENTE':
      return 'bg-accent-500';
    case 'TERMINE':
      return 'bg-green-500';
    default:
      return 'bg-surface-500';
  }
}

export function getPriorityBorder(priorite: string): string {
  switch (priorite) {
    case 'URGENTE':
      return 'border-l-4 border-l-red-500';
    case 'HAUTE':
      return 'border-l-4 border-l-orange-500';
    case 'MOYENNE':
      return 'border-l-4 border-l-blue-500';
    case 'BASSE':
      return 'border-l-4 border-l-surface-500';
    default:
      return '';
  }
}

