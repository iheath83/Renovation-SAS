import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GanttChart } from '@/components/gantt';
import { TacheModal } from '@/components/taches';
import { useTaches, useUpdateTache } from '@/hooks/useTaches';
import type { Tache, CreateTacheInput } from '@/types/tache';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Gantt() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTache, setEditingTache] = useState<Tache | null>(null);

  const { data: taches = [] } = useTaches();
  const updateTache = useUpdateTache();

  const handleTaskClick = (tache: Tache) => {
    setEditingTache(tache);
    setIsModalOpen(true);
  };

  const handleSave = (data: CreateTacheInput) => {
    if (editingTache) {
      updateTache.mutate(
        { id: editingTache.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingTache(null);
          },
        }
      );
    }
  };

  // Stats
  const plannedTasks = taches.filter(t => t.dateDebut && t.dateFin);
  const unplannedTasks = taches.filter(t => !t.dateDebut || !t.dateFin);
  const overdueTasks = taches.filter(t => 
    t.dateFin && 
    new Date(t.dateFin) < new Date() && 
    t.statut !== 'TERMINE'
  );

  // Calculate total duration
  const totalDuration = plannedTasks.reduce((sum, t) => {
    if (t.dateDebut && t.dateFin) {
      const start = new Date(t.dateDebut);
      const end = new Date(t.dateFin);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return sum;
  }, 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary-400" />
            Planning Gantt
          </h1>
          <p className="text-tertiary mt-1">
            Visualisez la timeline de vos tâches
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.location.href = '/taches'}>
          <List className="w-4 h-4 mr-2" />
          Vue Kanban
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-primary-400">{plannedTasks.length}</p>
          <p className="text-sm text-tertiary mt-1">Planifiées</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-tertiary">{unplannedTasks.length}</p>
          <p className="text-sm text-tertiary mt-1">Non planifiées</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-red-400">{overdueTasks.length}</p>
          <p className="text-sm text-tertiary mt-1">En retard</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-accent-400">{totalDuration}j</p>
          <p className="text-sm text-tertiary mt-1">Durée totale</p>
        </Card>
      </motion.div>

      {/* Gantt Chart */}
      <motion.div variants={item}>
        <GanttChart
          taches={taches}
          onTaskClick={handleTaskClick}
        />
      </motion.div>

      {/* Unplanned tasks warning */}
      {unplannedTasks.length > 0 && (
        <motion.div variants={item}>
          <Card className="p-4 border-l-4 border-l-accent-500">
            <h3 className="font-medium text-primary mb-2">
              Tâches non planifiées ({unplannedTasks.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {unplannedTasks.slice(0, 5).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTaskClick(t)}
                  className="px-3 py-1 rounded-full bg-overlay text-secondary text-sm hover:bg-surface-700 transition-colors"
                >
                  {t.titre}
                </button>
              ))}
              {unplannedTasks.length > 5 && (
                <span className="px-3 py-1 text-muted text-sm">
                  +{unplannedTasks.length - 5} autres
                </span>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Modal */}
      <TacheModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTache(null);
        }}
        tache={editingTache}
        onSave={handleSave}
        isLoading={updateTache.isPending}
      />
    </motion.div>
  );
}

