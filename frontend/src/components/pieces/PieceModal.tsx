import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/files';
import type { Piece, CreatePieceInput, TypePiece, StatutPiece } from '@/types/piece';
import { TYPE_PIECE_LABELS, STATUT_PIECE_LABELS } from '@/types/piece';
import type { UploadedFile } from '@/types/file';

interface PieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  piece?: Piece | null;
  onSave: (data: CreatePieceInput) => void;
  isLoading?: boolean;
}

export function PieceModal({ isOpen, onClose, piece, onSave, isLoading }: PieceModalProps) {
  const [formData, setFormData] = useState<CreatePieceInput>({
    name: '',
    type: 'AUTRE',
    etage: 0,
    surface: undefined,
    budget: undefined,
    statut: 'A_FAIRE',
    tags: [],
    images: [],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (piece) {
      setFormData({
        name: piece.name,
        type: piece.type,
        etage: piece.etage ?? 0,
        surface: piece.surface ?? undefined,
        budget: piece.budget ?? undefined,
        statut: piece.statut,
        tags: piece.tags,
        images: piece.images || [],
      });
    } else {
      setFormData({
        name: '',
        type: 'AUTRE',
        etage: 0,
        surface: undefined,
        budget: undefined,
        statut: 'A_FAIRE',
        tags: [],
        images: [],
      });
    }
  }, [piece, isOpen]);

  const handleImagesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, images: files.map(f => f.url) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) });
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="glass-dark rounded-2xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <h2 className="text-xl font-display font-semibold text-primary">
                  {piece ? 'Modifier la pièce' : 'Nouvelle pièce'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover-bg transition-colors"
                >
                  <X className="w-5 h-5 text-tertiary" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
                <Input
                  label="Nom de la pièce"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cuisine principale"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as TypePiece })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {Object.entries(TYPE_PIECE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutPiece })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {Object.entries(STATUT_PIECE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Étage
                    </label>
                    <select
                      value={formData.etage ?? 0}
                      onChange={(e) => setFormData({ ...formData, etage: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value={-1}>Sous-sol</option>
                      <option value={0}>RDC</option>
                      <option value={1}>1er</option>
                      <option value={2}>2ème</option>
                      <option value={3}>3ème</option>
                    </select>
                  </div>

                  <Input
                    label="Surface (m²)"
                    type="number"
                    value={formData.surface || ''}
                    onChange={(e) => setFormData({ ...formData, surface: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Ex: 15"
                  />

                  <Input
                    label="Budget (€)"
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Ex: 5000"
                  />
                </div>

                {/* Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Images de la pièce
                  </label>
                  <FileUploader
                    accept="image"
                    maxFiles={5}
                    onChange={handleImagesChange}
                    initialUrls={piece?.images || []}
                    resetKey={piece?.id || 'new'}
                    variant="grid"
                    compact
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Ajouter un tag..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                    <Button type="button" variant="secondary" onClick={addTag}>
                      Ajouter
                    </Button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-primary-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
                  {isLoading ? 'Enregistrement...' : piece ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

