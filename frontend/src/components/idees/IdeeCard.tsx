import { motion } from 'framer-motion';
import { Heart, ExternalLink, Sparkles, Trash2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IdeePinterest } from '@/types/idee';

interface IdeeCardProps {
  idee: IdeePinterest;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (idee: IdeePinterest) => void;
}

export function IdeeCard({ idee, onToggleFavorite, onDelete, onClick }: IdeeCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-elevated cursor-pointer"
      onClick={() => onClick(idee)}
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {idee.imageUrl ? (
          <img
            src={idee.imageUrl}
            alt={idee.titre || 'Idée Pinterest'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* AI Badge */}
        {idee.aiExtracted && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center gap-1 text-xs text-white">
            <Sparkles className="w-3 h-3" />
            IA
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(idee.id);
            }}
            className={cn(
              'p-2 rounded-full backdrop-blur-sm transition-all',
              idee.isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-black/50 text-white hover:bg-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', idee.isFavorite && 'fill-current')} />
          </button>
          <a
            href={idee.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-primary-500 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(idee.id);
            }}
            className="p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Color palette */}
        <div className="absolute bottom-16 left-3 right-3 flex items-center gap-1">
          {idee.couleurs && Array.isArray(idee.couleurs) && idee.couleurs.slice(0, 5).map((color: string, i: number) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white text-lg line-clamp-2 mb-1">
            {idee.titre}
          </h3>
          {idee.pieceName && (
            <p className="text-sm text-white/70 mb-2">
              📍 {idee.pieceName}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="p-3 bg-overlay/50">
        <div className="flex flex-wrap gap-1.5">
          {idee.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-surface-700 text-secondary text-xs flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {idee.tags.length > 4 && (
            <span className="px-2 py-0.5 rounded-full bg-surface-700 text-tertiary text-xs">
              +{idee.tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

