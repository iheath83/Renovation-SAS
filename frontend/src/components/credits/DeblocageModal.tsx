import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/files';
import type { Credit, CreateDeblocageInput } from '@/types/credit';
import { useCreditStats } from '@/hooks/useCredits';
import type { UploadedFile } from '@/types/file';

interface DeblocageModalProps {
  isOpen: boolean;
  onClose: () => void;
  credit: Credit | null;
  onSave: (data: CreateDeblocageInput) => void;
  isLoading?: boolean;
}

export function DeblocageModal({ 
  isOpen, 
  onClose, 
  credit,
  onSave,
  isLoading 
}: DeblocageModalProps) {
  const [formData, setFormData] = useState<CreateDeblocageInput>({
    montant: 0,
    dateDeblocage: new Date().toISOString().split('T')[0],
    description: '',
    justificatifs: [],
  });

  const stats = credit ? useCreditStats(credit) : null;

  const handleJustificatifsChange = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, justificatifs: files.map(f => f.url) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      montant: 0,
      dateDeblocage: new Date().toISOString().split('T')[0],
      description: '',
      justificatifs: [],
    });
  };

  if (!credit) return null;

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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="glass-dark rounded-xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-primary">
                    Nouveau déblocage
                  </h2>
                  <p className="text-sm text-muted mt-0.5 truncate">{credit.nom}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-overlay text-tertiary transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Available amount */}
              {stats && (
                <div className="px-5 pt-4">
                  <div className="p-3 rounded-lg bg-accent-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tertiary">Montant disponible</span>
                      <span className="text-lg font-bold text-accent-400">
                        {stats.montantRestant.toLocaleString('fr-FR')}€
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <Input
                  label="Montant (€)"
                  type="number"
                  min="0"
                  max={stats?.montantRestant}
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                  required
                />

                <Input
                  label="Date du déblocage"
                  type="date"
                  value={formData.dateDeblocage}
                  onChange={(e) => setFormData({ ...formData, dateDeblocage: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Déblocage pour travaux électricité"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  />
                </div>

                {/* Justificatifs Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Justificatifs
                  </label>
                  <FileUploader
                    accept="document"
                    maxFiles={5}
                    onChange={handleJustificatifsChange}
                    resetKey={`${credit.id}-${isOpen}`}
                    variant="list"
                    compact
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !formData.montant || formData.montant <= 0}
                >
                  {isLoading ? 'Enregistrement...' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

