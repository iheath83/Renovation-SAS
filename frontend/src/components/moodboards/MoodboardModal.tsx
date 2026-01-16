import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Moodboard, CreateMoodboardInput } from '@/types/moodboard';
import { usePieces } from '@/hooks/usePieces';
import { cn } from '@/lib/utils';

interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  moodboard?: Moodboard | null;
  onSave: (data: CreateMoodboardInput) => void;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  '#E74C3C', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#2C3E50',
  '#FFFFFF', '#F5F5F5', '#000000',
];

export function MoodboardModal({ 
  isOpen, 
  onClose, 
  moodboard, 
  onSave, 
  isLoading 
}: MoodboardModalProps) {
  const [formData, setFormData] = useState<CreateMoodboardInput>({
    nom: '',
    description: '',
    pieceIds: [],
    palette: [],
  });

  const { data: pieces = [] } = usePieces();

  useEffect(() => {
    if (moodboard) {
      setFormData({
        nom: moodboard.nom,
        description: moodboard.description || '',
        pieceIds: moodboard.pieceIds,
        palette: moodboard.palette,
        coverImage: moodboard.coverImage || '',
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        pieceIds: [],
        palette: [],
      });
    }
  }, [moodboard, isOpen]);

  const handleTogglePiece = (pieceId: string) => {
    setFormData(prev => ({
      ...prev,
      pieceIds: prev.pieceIds?.includes(pieceId)
        ? prev.pieceIds.filter(id => id !== pieceId)
        : [...(prev.pieceIds || []), pieceId],
    }));
  };

  const handleToggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      palette: prev.palette?.includes(color)
        ? prev.palette.filter(c => c !== color)
        : [...(prev.palette || []), color],
    }));
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="glass-dark rounded-2xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent-500/20">
                    <Palette className="w-5 h-5 text-accent-400" />
                  </div>
                  <h2 className="text-xl font-display font-semibold text-primary">
                    {moodboard ? 'Modifier le moodboard' : 'Nouveau moodboard'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover-bg transition-colors"
                >
                  <X className="w-5 h-5 text-tertiary" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Nom */}
                <Input
                  label="Nom du moodboard"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Ambiance Scandinave"
                  required
                />

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez l'ambiance de ce moodboard..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  />
                </div>

                {/* Palette de couleurs */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-3">
                    Palette de couleurs
                  </label>
                  
                  {/* Selected colors */}
                  {formData.palette && formData.palette.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-overlay/50">
                      <span className="text-sm text-tertiary mr-2">Sélectionnées:</span>
                      {formData.palette.map((color, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleToggleColor(color)}
                          className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-red-500 transition-colors relative group"
                          style={{ backgroundColor: color }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg">
                            <X className="w-4 h-4 text-white" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Color picker grid */}
                  <div className="grid grid-cols-12 gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleToggleColor(color)}
                        className={cn(
                          'w-full aspect-square rounded-lg border-2 transition-all',
                          formData.palette?.includes(color)
                            ? 'border-primary-500 scale-110 z-10'
                            : 'border-transparent hover:border-white/30'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Pièces associées */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-3">
                    Pièces associées
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {pieces.map((piece) => (
                      <button
                        key={piece.id}
                        type="button"
                        onClick={() => handleTogglePiece(piece.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm transition-all',
                          formData.pieceIds?.includes(piece.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-overlay text-tertiary hover:text-primary'
                        )}
                      >
                        {piece.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover image */}
                <Input
                  label="Image de couverture (URL)"
                  value={formData.coverImage || ''}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.nom}>
                  {isLoading ? 'Enregistrement...' : moodboard ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

