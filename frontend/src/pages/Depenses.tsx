import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Receipt, Search, CheckCircle2, Circle, Clock, Wallet, Upload, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DepenseListItem, DepenseModal, DepenseImportModal, type ImportedDepense } from '@/components/depenses';
import { useDepenses, useCreateDepense, useUpdateDepense, useDeleteDepense, useDepensesStats } from '@/hooks/useDepenses';
import type { Depense, CategorieDepense, CreateDepenseInput } from '@/types/depense';
import { CATEGORIE_DEPENSE_LABELS, CATEGORIE_DEPENSE_ICONS } from '@/types/depense';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type TabType = 'realisees' | 'prevues';

export function Depenses() {
  const [activeTab, setActiveTab] = useState<TabType>('realisees');
  const [search, setSearch] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieDepense | 'ALL'>('ALL');
  const [filterCredit, setFilterCredit] = useState<'ALL' | 'DANS' | 'HORS'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  const [createAsPrevue, setCreateAsPrevue] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDepenses, setSelectedDepenses] = useState<Set<string>>(new Set());

  const { data: depenses = [] } = useDepenses({
    estPrevue: activeTab === 'prevues',
    categorie: selectedCategorie === 'ALL' ? undefined : selectedCategorie,
    passeDansCredit: activeTab === 'realisees' && filterCredit !== 'ALL' 
      ? filterCredit === 'DANS' 
      : undefined,
    search,
  });

  const stats = useDepensesStats();
  const createDepense = useCreateDepense();
  const updateDepense = useUpdateDepense();
  const deleteDepense = useDeleteDepense();

  const handleEdit = (depense: Depense) => {
    setEditingDepense(depense);
    setCreateAsPrevue(depense.estPrevue);
    setIsModalOpen(true);
  };

  const handleDelete = (depense: Depense) => {
    if (confirm('Supprimer cette dépense ?')) {
      deleteDepense.mutate(depense.id);
    }
  };

  const handleValider = (depense: Depense) => {
    if (confirm('Valider cette dépense prévue ? Elle sera convertie en dépense réalisée.')) {
      updateDepense.mutate({
        id: depense.id,
        data: { estPrevue: false, dateDepense: new Date().toISOString().split('T')[0] }
      });
    }
  };

  const handleSave = (data: CreateDepenseInput) => {
    const dataWithPrevue = { ...data, estPrevue: createAsPrevue };
    
    if (editingDepense) {
      updateDepense.mutate(
        { id: editingDepense.id, data: dataWithPrevue },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingDepense(null);
          },
        }
      );
    } else {
      createDepense.mutate(dataWithPrevue, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDeleteFromModal = () => {
    if (editingDepense) {
      deleteDepense.mutate(editingDepense.id, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingDepense(null);
        },
      });
    }
  };

  const openNewDepense = (asPrevue: boolean) => {
    setEditingDepense(null);
    setCreateAsPrevue(asPrevue);
    setIsModalOpen(true);
  };

  const handleImport = async (importedDepenses: ImportedDepense[]) => {
    // Import en batch
    for (const depense of importedDepenses) {
      await createDepense.mutateAsync(depense);
    }
  };

  const handleSelectDepense = (depense: Depense, selected: boolean) => {
    setSelectedDepenses(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(depense.id);
      } else {
        newSet.delete(depense.id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDepenses.size === depenses.length) {
      setSelectedDepenses(new Set());
    } else {
      setSelectedDepenses(new Set(depenses.map(d => d.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDepenses.size === 0) return;
    
    if (confirm(`Supprimer ${selectedDepenses.size} dépense${selectedDepenses.size > 1 ? 's' : ''} ?`)) {
      for (const id of selectedDepenses) {
        await deleteDepense.mutateAsync(id);
      }
      setSelectedDepenses(new Set());
      setSelectionMode(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedDepenses(new Set());
  };

  const totalFiltered = depenses.reduce((sum, d) => sum + d.montant, 0);

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
            <Receipt className="w-8 h-8 text-primary-400" />
            Dépenses
          </h1>
          <p className="text-tertiary mt-1">
            Suivi des dépenses réalisées et prévues
          </p>
        </div>
        <div className="flex gap-2">
          {!selectionMode ? (
            <>
              <Button variant="ghost" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="w-4 h-4" />
                Importer CSV
              </Button>
              <Button variant="ghost" onClick={() => setSelectionMode(true)}>
                <CheckCircle2 className="w-4 h-4" />
                Sélectionner
              </Button>
              <Button variant="secondary" onClick={() => openNewDepense(true)}>
                <Clock className="w-4 h-4" />
                Dépense prévue
              </Button>
              <Button onClick={() => openNewDepense(false)}>
                <Plus className="w-4 h-4" />
                Nouvelle dépense
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleCancelSelection}>
                <X className="w-4 h-4" />
                Annuler
              </Button>
              <Button variant="secondary" onClick={handleSelectAll}>
                <CheckCircle2 className="w-4 h-4" />
                {selectedDepenses.size === depenses.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDeleteSelected}
                disabled={selectedDepenses.size === 0}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer ({selectedDepenses.size})
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase">Réalisées</p>
              <p className="text-xl font-bold text-primary">{stats.totalRealisees.toLocaleString('fr-FR')}€</p>
              <p className="text-xs text-muted">{stats.countRealisees} dépenses</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-500/20">
              <Clock className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase">Prévues</p>
              <p className="text-xl font-bold text-accent-400">{stats.totalPrevues.toLocaleString('fr-FR')}€</p>
              <p className="text-xs text-muted">{stats.countPrevues} à venir</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <Wallet className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase">Total prévu</p>
              <p className="text-xl font-bold text-primary-400">{stats.totalGlobal.toLocaleString('fr-FR')}€</p>
              <p className="text-xs text-muted">Réalisé + Prévu</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Receipt className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase">Dans crédit</p>
              <p className="text-xl font-bold text-blue-400">{stats.dansCredit.toLocaleString('fr-FR')}€</p>
              <p className="text-xs text-muted">{Math.round((stats.dansCredit / (stats.totalRealisees || 1)) * 100)}% du réalisé</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <div className="flex border-b border-primary">
          <button
            onClick={() => setActiveTab('realisees')}
            className={cn(
              'px-6 py-3 font-medium text-sm transition-all relative',
              activeTab === 'realisees'
                ? 'text-primary-400'
                : 'text-tertiary hover:text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Dépenses réalisées
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                activeTab === 'realisees' ? 'bg-primary-500/20 text-primary-400' : 'bg-overlay text-muted'
              )}>
                {stats.countRealisees}
              </span>
            </div>
            {activeTab === 'realisees' && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('prevues')}
            className={cn(
              'px-6 py-3 font-medium text-sm transition-all relative',
              activeTab === 'prevues'
                ? 'text-accent-400'
                : 'text-tertiary hover:text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Dépenses prévues
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                activeTab === 'prevues' ? 'bg-accent-500/20 text-accent-400' : 'bg-overlay text-muted'
              )}>
                {stats.countPrevues}
              </span>
            </div>
            {activeTab === 'prevues' && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Rechercher une dépense..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          
          {/* Credit filter - only for realized expenses */}
          {activeTab === 'realisees' && (
            <div className="flex rounded-xl overflow-hidden border border-primary/50">
              <button
                onClick={() => setFilterCredit('ALL')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  filterCredit === 'ALL' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-overlay text-tertiary hover:text-primary'
                )}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterCredit('DANS')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                  filterCredit === 'DANS' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-overlay text-tertiary hover:text-primary'
                )}
              >
                <CheckCircle2 className="w-3 h-3" />
                Crédit
              </button>
              <button
                onClick={() => setFilterCredit('HORS')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                  filterCredit === 'HORS' 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-overlay text-tertiary hover:text-primary'
                )}
              >
                <Circle className="w-3 h-3" />
                Hors crédit
              </button>
            </div>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategorie('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              selectedCategorie === 'ALL'
                ? 'bg-primary-500 text-white'
                : 'bg-overlay text-tertiary hover-bg hover:text-primary'
            )}
          >
            Toutes
          </button>
          {Object.entries(CATEGORIE_DEPENSE_LABELS).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setSelectedCategorie(cat as CategorieDepense)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                selectedCategorie === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-overlay text-tertiary hover-bg hover:text-primary'
              )}
            >
              <span>{CATEGORIE_DEPENSE_ICONS[cat as CategorieDepense]}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-tertiary">
            {depenses.length} dépense{depenses.length > 1 ? 's' : ''} {activeTab === 'prevues' ? 'prévues' : 'réalisées'}
          </p>
          {selectionMode && selectedDepenses.size > 0 && (
            <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
              {selectedDepenses.size} sélectionnée{selectedDepenses.size > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-sm text-secondary">
          Total: <span className={cn(
            'font-semibold',
            activeTab === 'prevues' ? 'text-accent-400' : 'text-primary-400'
          )}>
            {totalFiltered.toLocaleString('fr-FR')}€
          </span>
        </p>
      </motion.div>

      {/* List */}
      <motion.div variants={item}>
        <Card className="overflow-hidden p-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-primary">
                  Historique des {activeTab === 'prevues' ? 'dépenses prévues' : 'transactions'}
                </h2>
                <p className="text-sm text-muted mt-0.5">
                  {depenses.length > 0 && (
                    <>
                      {format(new Date(depenses[depenses.length - 1].dateDepense), 'd MMM', { locale: fr })} - {format(new Date(depenses[0].dateDepense), 'd MMM yyyy', { locale: fr })}
                    </>
                  )}
                </p>
              </div>
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                Filtrer
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {depenses.length === 0 ? (
              <motion.div
                key="empty"
                variants={item}
                className="text-center py-16"
              >
                {activeTab === 'prevues' ? (
                  <>
                    <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-tertiary">Aucune dépense prévue</p>
                    <p className="text-sm text-muted mt-1">
                      Planifiez vos dépenses à venir pour mieux gérer votre budget
                    </p>
                    <Button variant="secondary" className="mt-4" onClick={() => openNewDepense(true)}>
                      <Plus className="w-4 h-4" />
                      Ajouter une dépense prévue
                    </Button>
                  </>
                ) : (
                  <>
                    <Receipt className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-tertiary">Aucune dépense trouvée</p>
                    <p className="text-sm text-muted mt-1">
                      Ajoutez une nouvelle dépense ou modifiez vos filtres
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={container}
                initial="hidden"
                animate="show"
              >
                {depenses.map((depense) => (
                  <div key={depense.id} className="relative group/item">
                    <DepenseListItem
                      depense={depense}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onValider={activeTab === 'prevues' ? handleValider : undefined}
                      selectionMode={selectionMode}
                      isSelected={selectedDepenses.has(depense.id)}
                      onSelect={handleSelectDepense}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Modal */}
      <DepenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDepense(null);
        }}
        depense={editingDepense}
        onSave={handleSave}
        onDelete={editingDepense ? handleDeleteFromModal : undefined}
        isLoading={createDepense.isPending || updateDepense.isPending}
        isPrevue={createAsPrevue}
      />

      {/* Import Modal */}
      <DepenseImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </motion.div>
  );
}
