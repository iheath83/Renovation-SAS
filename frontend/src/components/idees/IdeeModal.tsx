import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Plus, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CreateIdeeInput } from '@/types/idee';
import { api } from '@/lib/api';

interface IdeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateIdeeInput) => void;
  isLoading?: boolean;
}

export function IdeeModal({ isOpen, onClose, onSave, isLoading }: IdeeModalProps) {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<{
    titre?: string;
    description?: string;
    tags?: string[];
    couleurs?: string[];
    imageUrl?: string;
  } | null>(null);
  const [newTag, setNewTag] = useState('');

  const handleExtract = async () => {
    if (!url) return;
    
    setIsExtracting(true);
    setExtractionError(null);
    
    try {
      const response = await api.extractPinterestMetadata(url);
      
      if (response.success && response.data) {
        const data = response.data as { titre?: string; description?: string; tags?: string[]; couleurs?: string[]; imageUrl?: string };
        setExtracted({
          titre: data.titre,
          description: data.description || '',
          tags: data.tags || [],
          couleurs: data.couleurs || [],
          imageUrl: data.imageUrl,
        });
      } else {
        setExtractionError(response.error?.message || 'Erreur lors de l\'extraction');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setExtractionError('Erreur de connexion au serveur');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && extracted && extracted.tags && !extracted.tags.includes(newTag)) {
      setExtracted({
        ...extracted,
        tags: [...extracted.tags, newTag],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (extracted && extracted.tags) {
      setExtracted({
        ...extracted,
        tags: extracted.tags.filter(t => t !== tag),
      });
    }
  };

  const handleSubmit = () => {
    if (!url) return;
    
    onSave({
      url: url,
      titre: extracted?.titre,
      description: extracted?.description,
      imageUrl: extracted?.imageUrl,
      tags: extracted?.tags,
      couleurs: extracted?.couleurs,
    });
    
    // Reset
    setUrl('');
    setExtracted(null);
  };

  const handleClose = () => {
    setUrl('');
    setExtracted(null);
    setExtractionError(null);
    onClose();
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
            onClick={handleClose}
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
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-primary">
                      Ajouter une inspiration
                    </h2>
                    <p className="text-sm text-tertiary">
                      L'IA va extraire les métadonnées automatiquement
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover-bg transition-colors"
                >
                  <X className="w-5 h-5 text-tertiary" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* URL Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-secondary">
                    Lien Pinterest
                  </label>
                  <div className="flex gap-3">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://pinterest.com/pin/..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleExtract}
                      disabled={!url || isExtracting}
                      className="shrink-0"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Analyse...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Extraire
                        </>
                      )}
                    </Button>
                  </div>
                  {extractionError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>{extractionError}</p>
                    </div>
                  )}
                </div>

                {/* Extracted content */}
                {extracted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image */}
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-overlay">
                        <img
                          src={extracted.imageUrl}
                          alt={extracted.titre}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-tertiary mb-1">
                            Titre (extrait par IA)
                          </label>
                          <Input
                            value={extracted.titre}
                            onChange={(e) => setExtracted({ ...extracted, titre: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-tertiary mb-1">
                            Description
                          </label>
                          <textarea
                            value={extracted.description}
                            onChange={(e) => setExtracted({ ...extracted, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none text-sm"
                          />
                        </div>

                        {/* Colors */}
                        {extracted.couleurs && extracted.couleurs.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-tertiary mb-2">
                              Palette de couleurs
                            </label>
                            <div className="flex items-center gap-2">
                              {extracted.couleurs.map((color, i) => (
                                <div
                                  key={i}
                                  className="w-10 h-10 rounded-lg border-2 border-primary shadow-lg"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {extracted.tags && extracted.tags.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-tertiary mb-2">
                              Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {extracted.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm flex items-center gap-1"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                <button
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 hover:text-red-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Nouveau tag..."
                              className="flex-1"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <Button variant="ghost" size="sm" onClick={handleAddTag}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={handleClose}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !url}
                >
                  {isLoading ? 'Enregistrement...' : 'Ajouter l\'inspiration'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

