import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatMonthYear } from '@/lib/gantt';

interface GanttHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function GanttHeader({ currentDate, onPrevMonth, onNextMonth, onToday }: GanttHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onPrevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-display font-semibold text-primary capitalize min-w-[180px] text-center">
          {formatMonthYear(currentDate)}
        </h2>
        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <Button variant="secondary" size="sm" onClick={onToday}>
        <Calendar className="w-4 h-4 mr-2" />
        Aujourd'hui
      </Button>
    </div>
  );
}

