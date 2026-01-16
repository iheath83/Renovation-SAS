import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ExternalLink, Sparkles, Tag, Calendar, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { IdeePinterest } from '@/types/idee';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface IdeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  idee: IdeePinterest | null;
  onToggleFavorite: (id: string) => void;
}

export function IdeeDetailModal({ isOpen, onClose, idee, onToggleFavorite }: IdeeDetailModalProps) {
  if (!idee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex"
          >
            <div className="glass-dark rounded-2xl w-full overflow-hidden flex flex-col lg:flex-row">
              {/* Image */}
              <div className="lg:w-1/2 relative bg-elevated">
                {idee.imageUrl ? (
                  <img
                    src={idee.imageUrl}
                    alt={idee.titre || 'Idée Pinterest'}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-64 lg:h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                    <Sparkles className="w-20 h-20 text-white/30" />
                  </div>
                )}

                {/* AI Badge */}
                {idee.aiExtracted && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-purple-500/90 backdrop-blur-sm flex items-center gap-2 text-sm text-white">
                    <Sparkles className="w-4 h-4" />
                    Extrait par IA
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="lg:w-1/2 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-subtle">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-display font-bold text-primary mb-2">
                      {idee.titre}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(idee.createdAt), 'd MMMM yyyy', { locale: fr })}
                      </span>
                      {idee.pieceName && (
                        <span className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {idee.pieceName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFavorite(idee.id)}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        idee.isFavorite
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-overlay text-tertiary hover:text-red-400'
                      )}
                    >
                      <Heart className={cn('w-5 h-5', idee.isFavorite && 'fill-current')} />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg bg-overlay text-tertiary hover:text-primary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Description */}
                  {idee.description && (
                    <div>
                      <h3 className="text-sm font-medium text-tertiary mb-2">Description</h3>
                      <p className="text-primary">{idee.description}</p>
                    </div>
                  )}

                  {/* Color palette */}
                  {idee.couleurs && Array.isArray(idee.couleurs) && idee.couleurs.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-tertiary mb-3">Palette de couleurs</h3>
                      <div className="flex items-center gap-3">
                        {idee.couleurs.map((color: string, i: number) => (
                          <div key={i} className="text-center">
                            <div
                              className="w-14 h-14 rounded-xl border-2 border-primary shadow-lg mb-1"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-muted">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <h3 className="text-sm font-medium text-tertiary mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {idee.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full bg-primary-500/20 text-primary-400 text-sm flex items-center gap-1.5"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-subtle">
                  <a
                    href={idee.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir sur Pinterest
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

