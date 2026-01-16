import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CreditCard, Receipt, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/files';
import type { Depense, CreateDepenseInput, CategorieDepense } from '@/types/depense';
import { CATEGORIE_DEPENSE_LABELS } from '@/types/depense';
import type { UploadedFile } from '@/types/file';
import { usePieces } from '@/hooks/usePieces';
import { useTaches } from '@/hooks/useTaches';

interface DepenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  depense?: Depense | null;
  onSave: (data: CreateDepenseInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isPrevue?: boolean; // Mode dépense prévue
}

export function DepenseModal({ 
  isOpen, 
  onClose, 
  depense, 
  onSave,
  onDelete,
  isLoading,
  isPrevue = false
}: DepenseModalProps) {
  const [formData, setFormData] = useState<CreateDepenseInput>({
    description: '',
    montant: 0,
    categorie: 'MATERIAU',
    dateDepense: new Date().toISOString().split('T')[0],
    fournisseur: '',
    passeDansCredit: false,
    factures: [],
  });

  const { data: pieces = [] } = usePieces();
  const { data: taches = [] } = useTaches();

  useEffect(() => {
    if (depense) {
      setFormData({
        description: depense.description,
        montant: depense.montant,
        categorie: depense.categorie,
        dateDepense: depense.dateDepense,
        fournisseur: depense.fournisseur || '',
        passeDansCredit: depense.passeDansCredit,
        pieceId: depense.pieceId,
        tacheId: depense.tacheId,
        factures: depense.factures || [],
      });
    } else {
      setFormData({
        description: '',
        montant: 0,
        categorie: 'MATERIAU',
        dateDepense: new Date().toISOString().split('T')[0],
        fournisseur: '',
        passeDansCredit: false,
        factures: [],
      });
    }
  }, [depense, isOpen]);

  const handleFacturesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, factures: files.map(f => f.url) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="glass-dark rounded-2xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <div className="flex items-center gap-3">
                  {isPrevue ? (
                    <div className="p-2 rounded-lg bg-accent-500/20">
                      <Clock className="w-5 h-5 text-accent-400" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-primary-500/20">
                      <CheckCircle2 className="w-5 h-5 text-primary-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-display font-semibold text-primary">
                      {depense 
                        ? (isPrevue ? 'Modifier la dépense prévue' : 'Modifier la dépense') 
                        : (isPrevue ? 'Nouvelle dépense prévue' : 'Nouvelle dépense')
                      }
                    </h2>
                    {isPrevue && (
                      <p className="text-xs text-muted">Cette dépense sera comptabilisée dans le budget prévisionnel</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {depense && onDelete && (
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
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Achat carrelage salle de bain"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Montant (€)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.montant}
                    onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                    required
                  />

                  <Input
                    label={isPrevue ? "Date prévue" : "Date"}
                    type="date"
                    value={formData.dateDepense}
                    onChange={(e) => setFormData({ ...formData, dateDepense: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Catégorie
                    </label>
                    <select
                      value={formData.categorie}
                      onChange={(e) => setFormData({ ...formData, categorie: e.target.value as CategorieDepense })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {Object.entries(CATEGORIE_DEPENSE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Fournisseur"
                    value={formData.fournisseur}
                    onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                    placeholder="Ex: Leroy Merlin"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Tâche associée
                    </label>
                    <select
                      value={formData.tacheId || ''}
                      onChange={(e) => setFormData({ ...formData, tacheId: e.target.value || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="">Aucune tâche</option>
                      {taches.map((tache) => (
                        <option key={tache.id} value={tache.id}>
                          {tache.titre}
                          {tache.pieceName && ` (${tache.pieceName})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Factures Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Factures / Justificatifs
                  </label>
                  <FileUploader
                    accept="document"
                    maxFiles={5}
                    onChange={handleFacturesChange}
                    initialUrls={depense?.factures || []}
                    resetKey={depense?.id || 'new'}
                    variant="list"
                    compact
                  />
                </div>

                {/* Passé dans crédit toggle */}
                <div 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.passeDansCredit 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-overlay/50 border-primary/50 hover:border-surface-600'
                  }`}
                  onClick={() => setFormData({ ...formData, passeDansCredit: !formData.passeDansCredit })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${formData.passeDansCredit ? 'text-green-400' : 'text-muted'}`} />
                      <div>
                        <p className={`font-medium ${formData.passeDansCredit ? 'text-green-400' : 'text-secondary'}`}>
                          Passé dans le crédit
                        </p>
                        <p className="text-xs text-muted">
                          Cette dépense sera comptabilisée dans le déblocage crédit
                        </p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      formData.passeDansCredit ? 'bg-green-500' : 'bg-surface-700'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white mt-0.5 transition-transform ${
                        formData.passeDansCredit ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.description || !formData.montant}>
                  {isLoading ? 'Enregistrement...' : depense ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

