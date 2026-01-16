import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { Tache, CreateTacheInput, StatutTache, Priorite, SousTache } from '@/types/tache';
import { STATUT_TACHE_LABELS, PRIORITE_LABELS } from '@/types/tache';
import { useToggleSousTache, useAddSousTache } from '@/hooks/useTaches';
import { usePieces } from '@/hooks/usePieces';

interface TacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  tache?: Tache | null;
  defaultStatut?: StatutTache;
  onSave: (data: CreateTacheInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function TacheModal({ 
  isOpen, 
  onClose, 
  tache, 
  defaultStatut = 'A_FAIRE',
  onSave,
  onDelete,
  isLoading 
}: TacheModalProps) {
  const [formData, setFormData] = useState<CreateTacheInput>({
    titre: '',
    description: '',
    statut: defaultStatut,
    priorite: 'MOYENNE',
    dateDebut: '',
    dateFin: '',
    coutEstime: undefined,
  });
  const [newSousTache, setNewSousTache] = useState('');
  // État local pour les sous-tâches (mise à jour en temps réel)
  const [localSousTaches, setLocalSousTaches] = useState<SousTache[]>([]);

  const { data: pieces = [] } = usePieces();
  const toggleSousTache = useToggleSousTache();
  const addSousTache = useAddSousTache();

  useEffect(() => {
    if (tache) {
      setFormData({
        titre: tache.titre,
        description: tache.description || '',
        statut: tache.statut,
        priorite: tache.priorite,
        dateDebut: tache.dateDebut || '',
        dateFin: tache.dateFin || '',
        coutEstime: tache.coutEstime || undefined,
        pieceId: tache.pieceId,
      });
      setLocalSousTaches(tache.sousTaches || []);
    } else {
      setFormData({
        titre: '',
        description: '',
        statut: defaultStatut,
        priorite: 'MOYENNE',
        dateDebut: '',
        dateFin: '',
        coutEstime: undefined,
      });
      setLocalSousTaches([]);
    }
  }, [tache, defaultStatut, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddSousTache = () => {
    if (tache && newSousTache.trim()) {
      // Ajouter immédiatement en local
      const newSt: SousTache = {
        id: `st-temp-${Date.now()}`,
        tacheId: tache.id,
        titre: newSousTache.trim(),
        fait: false,
        ordre: localSousTaches.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalSousTaches(prev => [...prev, newSt]);
      setNewSousTache('');
      // Sauvegarder en arrière-plan
      addSousTache.mutate({ tacheId: tache.id, titre: newSousTache.trim() });
    }
  };

  const handleToggleSousTache = (sousTacheId: string) => {
    if (tache) {
      // Mettre à jour immédiatement en local
      setLocalSousTaches(prev => 
        prev.map(st => 
          st.id === sousTacheId ? { ...st, fait: !st.fait } : st
        )
      );
      // Sauvegarder en arrière-plan
      toggleSousTache.mutate({ tacheId: tache.id, sousTacheId });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl z-50"
          >
            <div className="glass-dark rounded-2xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <h2 className="text-xl font-display font-semibold text-primary">
                  {tache ? 'Modifier la tâche' : 'Nouvelle tâche'}
                </h2>
                <div className="flex items-center gap-2">
                  {tache && onDelete && (
                    <button
                      onClick={onDelete}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover-bg transition-colors"
                  >
                    <X className="w-5 h-5 text-tertiary" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
                <Input
                  label="Titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Poser le carrelage"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Détails de la tâche..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Pièce associée
                  </label>
                  <select
                    value={formData.pieceId || ''}
                    onChange={(e) => setFormData({ ...formData, pieceId: e.target.value || undefined })}
                    className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    <option value="">Aucune pièce</option>
                    {pieces.map((piece) => (
                      <option key={piece.id} value={piece.id}>{piece.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutTache })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {Object.entries(STATUT_TACHE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Priorité
                    </label>
                    <select
                      value={formData.priorite}
                      onChange={(e) => setFormData({ ...formData, priorite: e.target.value as Priorite })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {Object.entries(PRIORITE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Date début"
                    type="date"
                    value={formData.dateDebut || ''}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  />

                  <Input
                    label="Date fin"
                    type="date"
                    value={formData.dateFin || ''}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  />

                  <Input
                    label="Coût estimé (€)"
                    type="number"
                    value={formData.coutEstime || ''}
                    onChange={(e) => setFormData({ ...formData, coutEstime: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>

                {/* Sous-tâches (only for existing tasks) */}
                {tache && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-secondary">
                        Sous-tâches
                      </label>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                        {localSousTaches.filter(st => st.fait).length}/{localSousTaches.length} terminées
                      </span>
                    </div>

                    {/* Progress bar */}
                    {localSousTaches.length > 0 && (
                      <div className="h-1.5 rounded-full bg-surface-700 mb-3 overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 transition-all duration-300"
                          style={{ 
                            width: `${(localSousTaches.filter(st => st.fait).length / localSousTaches.length) * 100}%` 
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
                      {localSousTaches.length === 0 ? (
                        <p className="text-sm text-muted italic py-2">Aucune sous-tâche</p>
                      ) : (
                        localSousTaches.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => handleToggleSousTache(st.id)}
                            className={cn(
                              'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all',
                              st.fait 
                                ? 'bg-green-500/10 hover:bg-green-500/15' 
                                : 'bg-overlay/50 hover:bg-overlay'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                              st.fait 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-surface-500 hover:border-primary-500'
                            )}>
                              {st.fait && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn(
                              'text-sm flex-1 transition-all',
                              st.fait ? 'text-muted line-through' : 'text-primary'
                            )}>
                              {st.titre}
                            </span>
                            {toggleSousTache.isPending && (
                              <Loader2 className="w-3 h-3 text-muted animate-spin" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add sous-tâche */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSousTache}
                        onChange={(e) => setNewSousTache(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSousTache())}
                        placeholder="Ajouter une sous-tâche..."
                        className="flex-1 px-4 py-2 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onClick={handleAddSousTache}
                        disabled={!newSousTache.trim() || addSousTache.isPending}
                      >
                        {addSousTache.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.titre}>
                  {isLoading ? 'Enregistrement...' : tache ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

