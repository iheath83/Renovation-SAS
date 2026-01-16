import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Home, Lightbulb, Calendar, Edit } from 'lucide-react';
import type { Moodboard } from '@/types/moodboard';
import { usePieces } from '@/hooks/usePieces';
import { useIdees } from '@/hooks/useIdees';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MoodboardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  moodboard: Moodboard | null;
  onEdit: (moodboard: Moodboard) => void;
}

export function MoodboardDetailModal({ 
  isOpen, 
  onClose, 
  moodboard,
  onEdit 
}: MoodboardDetailModalProps) {
  const { data: pieces = [] } = usePieces();
  const { data: idees = [] } = useIdees();

  if (!moodboard) return null;

  const linkedPieces = pieces.filter(p => moodboard.pieceIds.includes(p.id));
  const linkedIdees = idees.filter(i => moodboard.ideeIds.includes(i.id));

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
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50"
          >
            <div className="glass-dark rounded-2xl w-full h-full overflow-hidden flex flex-col">
              {/* Header with cover */}
              <div className="relative h-48 md:h-64">
                {moodboard.coverImage ? (
                  <img
                    src={moodboard.coverImage}
                    alt={moodboard.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">
                    {moodboard.nom}
                  </h2>
                  {moodboard.description && (
                    <p className="text-white/70 max-w-2xl">{moodboard.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(moodboard);
                    }}
                    className="p-2 rounded-lg bg-black/50 text-white backdrop-blur-sm hover:bg-primary-500 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-black/50 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Palette */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
                    <Palette className="w-5 h-5 text-accent-400" />
                    Palette de couleurs
                  </h3>
                  <div className="flex items-center gap-3">
                    {moodboard.palette.map((color, i) => (
                      <div key={i} className="text-center">
                        <div
                          className="w-16 h-16 rounded-xl border-2 border-primary shadow-lg mb-2"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-muted">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pièces */}
                {linkedPieces.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
                      <Home className="w-5 h-5 text-primary-400" />
                      Pièces associées
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {linkedPieces.map((piece) => (
                        <div
                          key={piece.id}
                          className="px-4 py-2 rounded-xl bg-overlay text-primary"
                        >
                          {piece.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Idées */}
                {linkedIdees.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Inspirations liées
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {linkedIdees.map((idee) => (
                        <div
                          key={idee.id}
                          className="aspect-[3/4] rounded-xl overflow-hidden bg-overlay"
                        >
                          {idee.imageUrl ? (
                            <img
                              src={idee.imageUrl}
                              alt={idee.titre || 'Idée Pinterest'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Lightbulb className="w-8 h-8 text-muted" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="flex items-center gap-4 text-sm text-muted pt-4 border-t border-subtle">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Créé le {format(new Date(moodboard.createdAt), 'd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

