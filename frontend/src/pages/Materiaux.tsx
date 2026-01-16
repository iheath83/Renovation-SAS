import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MateriauCard, MateriauListItem, MateriauModal, MateriauFilters } from '@/components/materiaux';
import { useMateriaux, useCreateMateriau, useUpdateMateriau, useDeleteMateriau } from '@/hooks/useMateriaux';
import type { Materiau, CategorieMateriau, CreateMateriauInput } from '@/types/materiau';
import { CATEGORIE_LABELS, CATEGORIE_ICONS } from '@/types/materiau';

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

export function Materiaux() {
  const [search, setSearch] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieMateriau | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateriau, setEditingMateriau] = useState<Materiau | null>(null);

  const { data: materiaux = [] } = useMateriaux({
    categorie: selectedCategorie === 'ALL' ? undefined : selectedCategorie,
    search,
  });
  
  const createMateriau = useCreateMateriau();
  const updateMateriau = useUpdateMateriau();
  const deleteMateriau = useDeleteMateriau();

  const handleEdit = (materiau: Materiau) => {
    setEditingMateriau(materiau);
    setIsModalOpen(true);
  };

  const handleSave = (data: CreateMateriauInput) => {
    if (editingMateriau) {
      updateMateriau.mutate(
        { id: editingMateriau.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingMateriau(null);
          },
        }
      );
    } else {
      createMateriau.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (editingMateriau) {
      deleteMateriau.mutate(editingMateriau.id, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingMateriau(null);
        },
      });
    }
  };

  // Stats
  const allMateriaux = useMateriaux().data || [];
  const totalCost = allMateriaux.reduce((sum, m) => sum + ((m.prixUnitaire || 0) * (m.quantite || 1)), 0);
  const categoriesCount = Object.entries(
    allMateriaux.reduce((acc, m) => {
      acc[m.categorie] = (acc[m.categorie] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <motion.div
      variants={container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-400" />
            Matériaux
          </h1>
          <p className="text-tertiary mt-1">
            Catalogue des matériaux de votre projet
          </p>
        </div>
        <Button onClick={() => { setEditingMateriau(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Nouveau matériau
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-primary-400">{allMateriaux.length}</p>
          <p className="text-sm text-tertiary mt-1">Matériaux</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-accent-400">
            {totalCost.toLocaleString('fr-FR')}€
          </p>
          <p className="text-sm text-tertiary mt-1">Coût total</p>
        </Card>
        {categoriesCount.slice(0, 2).map(([cat, count]) => (
          <Card key={cat} className="text-center py-4">
            <p className="text-2xl mb-1">{CATEGORIE_ICONS[cat as CategorieMateriau]}</p>
            <p className="font-semibold text-primary">{count}</p>
            <p className="text-xs text-tertiary">{CATEGORIE_LABELS[cat as CategorieMateriau]}</p>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <MateriauFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategorie={selectedCategorie}
          onCategorieChange={setSelectedCategorie}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </motion.div>

      {/* Results count */}
      <motion.div variants={item} className="flex items-center justify-between">
        <p className="text-sm text-tertiary">
          {materiaux.length} matériau{materiaux.length > 1 ? 'x' : ''} trouvé{materiaux.length > 1 ? 's' : ''}
        </p>
        {selectedCategorie !== 'ALL' && (
          <p className="text-sm text-secondary">
            Total catégorie: <span className="font-semibold text-primary-400">
              {materiaux.reduce((sum, m) => sum + ((m.prixUnitaire || 0) * (m.quantite || 1)), 0).toLocaleString('fr-FR')}€
            </span>
          </p>
        )}
      </motion.div>

      {/* Grid / List */}
      <AnimatePresence mode="wait">
        {materiaux.length === 0 ? (
          <motion.div
            key="empty"
            variants={item}
            className="text-center py-12 glass rounded-xl"
          >
            <Package className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-tertiary">Aucun matériau trouvé</p>
            <p className="text-sm text-muted mt-1">
              Ajoutez un nouveau matériau ou modifiez vos filtres
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {materiaux.map((materiau) => (
              <MateriauCard
                key={materiau.id}
                materiau={materiau}
                onEdit={handleEdit}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={container}
            className="space-y-3"
          >
            {materiaux.map((materiau) => (
              <MateriauListItem
                key={materiau.id}
                materiau={materiau}
                onEdit={handleEdit}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <MateriauModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMateriau(null);
        }}
        materiau={editingMateriau}
        onSave={handleSave}
        onDelete={editingMateriau ? handleDelete : undefined}
        isLoading={createMateriau.isPending || updateMateriau.isPending}
      />
    </motion.div>
  );
}

