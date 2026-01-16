import { useState, useMemo } from 'react';
import { addMonths, subMonths, startOfMonth } from 'date-fns';
import { GanttHeader } from './GanttHeader';
import { GanttTimeline } from './GanttTimeline';
import { GanttRow } from './GanttRow';
import { getMonthDays } from '@/lib/gantt';
import type { Tache } from '@/types/tache';
import { CheckCircle2, Clock, Pause, Circle } from 'lucide-react';

interface GanttChartProps {
  taches: Tache[];
  onTaskClick?: (tache: Tache) => void;
}

export function GanttChart({ taches, onTaskClick }: GanttChartProps) {
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => getMonthDays(currentDate), [currentDate]);

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(startOfMonth(new Date()));

  // Convert taches to GanttTask format
  const ganttTasks = useMemo(() => 
    taches.map(t => ({
      id: t.id,
      titre: t.titre,
      pieceName: t.pieceName,
      statut: t.statut,
      priorite: t.priorite,
      dateDebut: t.dateDebut ? new Date(t.dateDebut) : null,
      dateFin: t.dateFin ? new Date(t.dateFin) : null,
      progress: t.sousTaches.length > 0 
        ? (t.sousTaches.filter(st => st.fait).length / t.sousTaches.length) * 100 
        : t.statut === 'TERMINE' ? 100 : 0,
      dependances: t.dependances,
    })),
    [taches]
  );

  // Sort by start date, then by priority, then by those without dates
  const sortedTasks = useMemo(() => 
    [...ganttTasks].sort((a, b) => {
      // Tasks without dates go last
      if (!a.dateDebut && !b.dateDebut) return 0;
      if (!a.dateDebut) return 1;
      if (!b.dateDebut) return -1;
      // Sort by date
      return a.dateDebut.getTime() - b.dateDebut.getTime();
    }),
    [ganttTasks]
  );

  // Stats
  const stats = useMemo(() => ({
    total: taches.length,
    termine: taches.filter(t => t.statut === 'TERMINE').length,
    enCours: taches.filter(t => t.statut === 'EN_COURS').length,
    aFaire: taches.filter(t => t.statut === 'A_FAIRE').length,
    enAttente: taches.filter(t => t.statut === 'EN_ATTENTE').length,
  }), [taches]);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-primary/50">
        <GanttHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      </div>

      {/* Quick stats */}
      <div className="px-4 py-3 border-b border-subtle/50 bg-elevated/30">
        <div className="flex items-center gap-6 text-xs">
          <span className="text-tertiary">
            <strong className="text-primary">{stats.total}</strong> tâches
          </span>
          <div className="flex items-center gap-1.5 text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats.termine}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary-400">
            <Clock className="w-3 h-3" />
            <span>{stats.enCours}</span>
          </div>
          <div className="flex items-center gap-1.5 text-accent-400">
            <Pause className="w-3 h-3" />
            <span>{stats.enAttente}</span>
          </div>
          <div className="flex items-center gap-1.5 text-tertiary">
            <Circle className="w-3 h-3" />
            <span>{stats.aFaire}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header row with day labels */}
          <div className="flex sticky top-0 bg-elevated/98 backdrop-blur-sm z-10 border-b border-primary/50">
            <div className="w-72 flex-shrink-0 p-3 border-r border-primary/50">
              <span className="font-medium text-secondary text-sm">Tâche</span>
            </div>
            <div className="flex-1">
              <GanttTimeline days={days} />
            </div>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-surface-800/30">
            {sortedTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-overlay flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted" />
                </div>
                <p className="text-tertiary font-medium">Aucune tâche à afficher</p>
                <p className="text-muted text-sm mt-1">Créez des tâches pour les voir dans le Gantt</p>
              </div>
            ) : (
              sortedTasks.map(task => (
                <GanttRow
                  key={task.id}
                  task={task}
                  days={days}
                  currentDate={currentDate}
                  onClick={() => {
                    const original = taches.find(t => t.id === task.id);
                    if (original && onTaskClick) {
                      onTaskClick(original);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-primary/50 bg-elevated/30">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <span className="text-muted font-medium">Légende :</span>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded bg-surface-600" />
              <span className="text-tertiary">À faire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded bg-primary-500" />
              <span className="text-tertiary">En cours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded bg-accent-500" />
              <span className="text-tertiary">En attente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded bg-green-500" />
              <span className="text-tertiary">Terminé</span>
            </div>
          </div>

          <div className="h-4 w-px bg-surface-700" />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-tertiary">Urgente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-tertiary">Haute</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-tertiary">Moyenne</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
