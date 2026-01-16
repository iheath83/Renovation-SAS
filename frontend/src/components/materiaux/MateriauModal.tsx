import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Materiau, CreateMateriauInput, CategorieMateriau, Unite } from '@/types/materiau';
import { CATEGORIE_LABELS, UNITE_LABELS } from '@/types/materiau';

interface MateriauModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiau?: Materiau | null;
  onSave: (data: CreateMateriauInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function MateriauModal({ 
  isOpen, 
  onClose, 
  materiau, 
  onSave,
  onDelete,
  isLoading 
}: MateriauModalProps) {
  const [formData, setFormData] = useState<CreateMateriauInput>({
    nom: '',
    description: '',
    categorie: 'AUTRE',
    marque: '',
    reference: '',
    prixUnitaire: 0,
    unite: 'UNITE',
    quantite: 1,
    lienMarchand: '',
  });

  useEffect(() => {
    if (materiau) {
      setFormData({
        nom: materiau.nom,
        description: materiau.description || '',
        categorie: materiau.categorie,
        marque: materiau.marque || '',
        reference: materiau.reference || '',
        prixUnitaire: materiau.prixUnitaire || 0,
        unite: materiau.unite,
        quantite: materiau.quantite || 1,
        lienMarchand: materiau.lienMarchand || '',
        pieceIds: materiau.pieceIds || [],
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        categorie: 'AUTRE',
        marque: '',
        reference: '',
        prixUnitaire: 0,
        unite: 'UNITE',
        quantite: 1,
        lienMarchand: '',
      });
    }
  }, [materiau, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const totalCost = formData.prixUnitaire * formData.quantite;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

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
                  {materiau ? 'Modifier le matériau' : 'Nouveau matériau'}
                </h2>
                <div className="flex items-center gap-2">
                  {materiau && onDelete && (
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
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <Input
                  label="Nom du matériau"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Peinture blanc satin"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Détails du matériau..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Catégorie
                    </label>
                    <select
                      value={formData.categorie}
                      onChange={(e) => setFormData({ ...formData, categorie: e.target.value as CategorieMateriau })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {Object.entries(CATEGORIE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Unité
                    </label>
                    <select
                      value={formData.unite}
                      onChange={(e) => setFormData({ ...formData, unite: e.target.value as Unite })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {Object.entries(UNITE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Marque"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    placeholder="Ex: V33"
                  />

                  <Input
                    label="Référence"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ex: V33-BS-10L"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prix unitaire (€)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.prixUnitaire}
                    onChange={(e) => setFormData({ ...formData, prixUnitaire: parseFloat(e.target.value) || 0 })}
                    required
                  />

                  <Input
                    label="Quantité"
                    type="number"
                    min="1"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                {/* Total preview */}
                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Coût total estimé</span>
                    <span className="text-2xl font-bold text-primary-400">
                      {totalCost.toLocaleString('fr-FR')}€
                    </span>
                  </div>
                </div>

                <Input
                  label="Lien marchand"
                  type="url"
                  value={formData.lienMarchand}
                  onChange={(e) => setFormData({ ...formData, lienMarchand: e.target.value })}
                  placeholder="https://..."
                />
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.nom}>
                  {isLoading ? 'Enregistrement...' : materiau ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

