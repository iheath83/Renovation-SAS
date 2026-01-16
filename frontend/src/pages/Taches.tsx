import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KanbanBoard, TacheModal } from '@/components/taches';
import { useTaches, useCreateTache, useUpdateTache, useDeleteTache } from '@/hooks/useTaches';
import type { Tache, StatutTache, CreateTacheInput } from '@/types/tache';
import { STATUT_TACHE_LABELS } from '@/types/tache';

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

export function Taches() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTache, setEditingTache] = useState<Tache | null>(null);
  const [defaultStatut, setDefaultStatut] = useState<StatutTache>('A_FAIRE');

  const { data: taches = [] } = useTaches({ search });
  const createTache = useCreateTache();
  const updateTache = useUpdateTache();
  const deleteTache = useDeleteTache();

  const handleCardClick = (tache: Tache) => {
    setEditingTache(tache);
    setIsModalOpen(true);
  };

  const handleAddClick = (statut: StatutTache) => {
    setEditingTache(null);
    setDefaultStatut(statut);
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
    } else {
      createTache.mutate(
        { ...data, statut: defaultStatut },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (editingTache) {
      deleteTache.mutate(editingTache.id, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingTache(null);
        },
      });
    }
  };

  // Stats
  const stats = {
    total: taches.length,
    aFaire: taches.filter(t => t.statut === 'A_FAIRE').length,
    enCours: taches.filter(t => t.statut === 'EN_COURS').length,
    enAttente: taches.filter(t => t.statut === 'EN_ATTENTE').length,
    termine: taches.filter(t => t.statut === 'TERMINE').length,
  };

  // Coût total
  const coutTotal = taches.reduce((sum, t) => sum + (t.coutReel || t.coutEstime || 0), 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stats & Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-primary-400" />
            Tâches
          </h1>
          <p className="text-tertiary mt-1">
            Gérez les tâches de votre projet en vue Kanban
          </p>
        </div>
        <Button onClick={() => handleAddClick('A_FAIRE')}>
          <Plus className="w-4 h-4" />
          Nouvelle tâche
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-primary-400">{stats.total}</p>
          <p className="text-sm text-tertiary mt-1">Total</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-secondary">{stats.aFaire}</p>
          <p className="text-sm text-tertiary mt-1">{STATUT_TACHE_LABELS.A_FAIRE}</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-primary-400">{stats.enCours}</p>
          <p className="text-sm text-tertiary mt-1">{STATUT_TACHE_LABELS.EN_COURS}</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-accent-400">{stats.enAttente}</p>
          <p className="text-sm text-tertiary mt-1">{STATUT_TACHE_LABELS.EN_ATTENTE}</p>
        </Card>
        <Card className="text-center py-4 col-span-2 lg:col-span-1">
          <p className="text-3xl font-bold font-display text-green-400">{stats.termine}</p>
          <p className="text-sm text-tertiary mt-1">{STATUT_TACHE_LABELS.TERMINE}</p>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-tertiary">
          <span>Coût total:</span>
          <span className="font-semibold text-primary">{coutTotal.toLocaleString('fr-FR')}€</span>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <motion.div variants={item}>
        <KanbanBoard
          taches={taches}
          onCardClick={handleCardClick}
          onAddClick={handleAddClick}
        />
      </motion.div>

      {/* Modal */}
      <TacheModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTache(null);
        }}
        tache={editingTache}
        defaultStatut={defaultStatut}
        onSave={handleSave}
        onDelete={editingTache ? handleDelete : undefined}
        isLoading={createTache.isPending || updateTache.isPending}
      />
    </motion.div>
  );
}

