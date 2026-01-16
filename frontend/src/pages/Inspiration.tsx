import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Lightbulb, Palette, Heart, Sparkles, Search, Grid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { IdeeCard, IdeeModal, IdeeDetailModal } from '@/components/idees';
import { MoodboardCard, MoodboardModal, MoodboardDetailModal } from '@/components/moodboards';
import { useIdees, useCreateIdee, useDeleteIdee, useToggleFavorite } from '@/hooks/useIdees';
import { useMoodboards, useCreateMoodboard, useUpdateMoodboard, useDeleteMoodboard } from '@/hooks/useMoodboards';
import type { IdeePinterest, CreateIdeePinterestInput } from '@/types/idee';
import type { Moodboard, CreateMoodboardInput } from '@/types/moodboard';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type TabType = 'idees' | 'moodboards';
type FilterType = 'all' | 'favorites';

export function Inspiration() {
  const [activeTab, setActiveTab] = useState<TabType>('idees');
  const [isIdeeModalOpen, setIsIdeeModalOpen] = useState(false);
  const [isMoodboardModalOpen, setIsMoodboardModalOpen] = useState(false);
  const [selectedIdee, setSelectedIdee] = useState<IdeePinterest | null>(null);
  const [selectedMoodboard, setSelectedMoodboard] = useState<Moodboard | null>(null);
  const [editingMoodboard, setEditingMoodboard] = useState<Moodboard | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  // Idées hooks
  const { data: idees = [] } = useIdees();
  const createIdee = useCreateIdee();
  const deleteIdee = useDeleteIdee();
  const toggleFavorite = useToggleFavorite();

  // Moodboards hooks
  const { data: moodboards = [] } = useMoodboards();
  const createMoodboard = useCreateMoodboard();
  const updateMoodboard = useUpdateMoodboard();
  const deleteMoodboard = useDeleteMoodboard();

  // Filtered idées
  const filteredIdees = useMemo(() => {
    let filtered = idees;
    if (filter === 'favorites') {
      filtered = filtered.filter(i => i.isFavorite);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        i =>
          i.titre.toLowerCase().includes(searchLower) ||
          i.description?.toLowerCase().includes(searchLower) ||
          i.tags.some(t => t.toLowerCase().includes(searchLower)) ||
          i.pieceName?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [idees, filter, search]);

  // Filtered moodboards
  const filteredMoodboards = useMemo(() => {
    if (!search) return moodboards;
    const searchLower = search.toLowerCase();
    return moodboards.filter(
      m =>
        m.nom.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower)
    );
  }, [moodboards, search]);

  // Stats
  const stats = useMemo(() => {
    if (activeTab === 'idees') {
      return {
        total: idees.length,
        favorites: idees.filter(i => i.isFavorite).length,
        aiExtracted: idees.filter(i => i.aiExtracted).length,
        uniqueTags: [...new Set(idees.flatMap(i => i.tags))].length,
      };
    } else {
      const allIdees = moodboards.flatMap(m => m.ideeIds);
      const allMateriaux = moodboards.flatMap(m => m.materiauIds);
      const allColors = moodboards.flatMap(m => m.palette);
      return {
        total: moodboards.length,
        totalIdees: [...new Set(allIdees)].length,
        totalMateriaux: [...new Set(allMateriaux)].length,
        uniqueColors: [...new Set(allColors)].length,
      };
    }
  }, [activeTab, idees, moodboards]);

  // Handlers
  const handleSaveIdee = (data: CreateIdeePinterestInput) => {
    createIdee.mutate(data, {
      onSuccess: () => setIsIdeeModalOpen(false),
    });
  };

  const handleSaveMoodboard = (data: CreateMoodboardInput) => {
    if (editingMoodboard) {
      updateMoodboard.mutate(
        { id: editingMoodboard.id, data },
        {
          onSuccess: () => {
            setIsMoodboardModalOpen(false);
            setEditingMoodboard(null);
          },
        }
      );
    } else {
      createMoodboard.mutate(data, {
        onSuccess: () => setIsMoodboardModalOpen(false),
      });
    }
  };

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
            <Sparkles className="w-8 h-8 text-primary-400" />
            Inspiration
          </h1>
          <p className="text-tertiary mt-1">
            Vos idées Pinterest et moodboards créatifs
          </p>
        </div>
        <Button
          onClick={() => activeTab === 'idees' ? setIsIdeeModalOpen(true) : setIsMoodboardModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'idees' ? 'Nouvelle idée' : 'Nouveau moodboard'}
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-2">
        <button
          onClick={() => {
            setActiveTab('idees');
            setSearch('');
            setFilter('all');
          }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'idees'
              ? 'bg-primary-500 text-white'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <Lightbulb className="w-4 h-4" />
          Idées ({idees.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('moodboards');
            setSearch('');
            setFilter('all');
          }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'moodboards'
              ? 'bg-accent-500 text-white'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <Palette className="w-4 h-4" />
          Moodboards ({moodboards.length})
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'idees' ? (
          <>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-primary-400">{stats.total}</p>
              <p className="text-sm text-tertiary mt-1">Total</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-pink-400">{stats.favorites}</p>
              <p className="text-sm text-tertiary mt-1">Favoris</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-accent-400">{stats.aiExtracted}</p>
              <p className="text-sm text-tertiary mt-1">IA extraites</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-secondary">{stats.uniqueTags}</p>
              <p className="text-sm text-tertiary mt-1">Tags uniques</p>
            </Card>
          </>
        ) : (
          <>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-accent-400">{stats.total}</p>
              <p className="text-sm text-tertiary mt-1">Moodboards</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-primary-400">{stats.totalIdees}</p>
              <p className="text-sm text-tertiary mt-1">Idées</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-green-400">{stats.totalMateriaux}</p>
              <p className="text-sm text-tertiary mt-1">Matériaux</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold font-display text-secondary">{stats.uniqueColors}</p>
              <p className="text-sm text-tertiary mt-1">Couleurs</p>
            </Card>
          </>
        )}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'idees' ? 'Rechercher des idées...' : 'Rechercher des moodboards...'}
            className="pl-11"
          />
        </div>

        {activeTab === 'idees' && (
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-overlay text-tertiary hover:bg-surface-700'
              )}
            >
              <Grid className="w-4 h-4 inline mr-2" />
              Toutes
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === 'favorites'
                  ? 'bg-pink-500 text-white'
                  : 'bg-overlay text-tertiary hover:bg-surface-700'
              )}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Favoris
            </button>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'idees' ? (
          <motion.div
            key="idees"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredIdees.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Lightbulb className="w-12 h-12 mx-auto text-muted mb-4" />
                <h3 className="text-lg font-medium text-secondary mb-2">
                  Aucune idée trouvée
                </h3>
                <p className="text-muted mb-4">
                  {search || filter === 'favorites'
                    ? 'Essayez de modifier vos filtres'
                    : 'Commencez par ajouter votre première inspiration'}
                </p>
                {!search && filter === 'all' && (
                  <Button onClick={() => setIsIdeeModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Ajouter une idée
                  </Button>
                )}
              </div>
            ) : (
              filteredIdees.map((idee) => (
                <IdeeCard
                  key={idee.id}
                  idee={idee}
                  onClick={() => setSelectedIdee(idee)}
                  onToggleFavorite={() => toggleFavorite.mutate(idee.id)}
                  onDelete={() => {
                    if (confirm('Supprimer cette inspiration ?')) {
                      deleteIdee.mutate(idee.id);
                    }
                  }}
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="moodboards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredMoodboards.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Palette className="w-12 h-12 mx-auto text-muted mb-4" />
                <h3 className="text-lg font-medium text-secondary mb-2">
                  Aucun moodboard trouvé
                </h3>
                <p className="text-muted mb-4">
                  {search
                    ? 'Essayez de modifier votre recherche'
                    : 'Commencez par créer votre premier moodboard'}
                </p>
                {!search && (
                  <Button onClick={() => setIsMoodboardModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Créer un moodboard
                  </Button>
                )}
              </div>
            ) : (
              filteredMoodboards.map((moodboard) => (
                <MoodboardCard
                  key={moodboard.id}
                  moodboard={moodboard}
                  onView={() => setSelectedMoodboard(moodboard)}
                  onEdit={() => {
                    setEditingMoodboard(moodboard);
                    setIsMoodboardModalOpen(true);
                  }}
                  onDelete={() => {
                    if (confirm('Supprimer ce moodboard ?')) {
                      deleteMoodboard.mutate(moodboard.id);
                    }
                  }}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <IdeeModal
        isOpen={isIdeeModalOpen}
        onClose={() => setIsIdeeModalOpen(false)}
        onSave={handleSaveIdee}
        isLoading={createIdee.isPending}
      />

      <MoodboardModal
        isOpen={isMoodboardModalOpen}
        onClose={() => {
          setIsMoodboardModalOpen(false);
          setEditingMoodboard(null);
        }}
        moodboard={editingMoodboard}
        onSave={handleSaveMoodboard}
        isLoading={editingMoodboard ? updateMoodboard.isPending : createMoodboard.isPending}
      />

      <IdeeDetailModal
        isOpen={!!selectedIdee}
        onClose={() => setSelectedIdee(null)}
        idee={selectedIdee}
        onToggleFavorite={() => {
          if (selectedIdee) {
            toggleFavorite.mutate(selectedIdee.id);
          }
        }}
      />

      <MoodboardDetailModal
        isOpen={!!selectedMoodboard}
        onClose={() => setSelectedMoodboard(null)}
        moodboard={selectedMoodboard}
        onEdit={() => {
          if (selectedMoodboard) {
            setEditingMoodboard(selectedMoodboard);
            setSelectedMoodboard(null);
            setIsMoodboardModalOpen(true);
          }
        }}
      />
    </motion.div>
  );
}

