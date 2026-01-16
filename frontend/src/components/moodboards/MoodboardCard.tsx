import { motion } from 'framer-motion';
import { Palette, Home, Lightbulb, Package, Edit, Trash2, Eye } from 'lucide-react';
import type { Moodboard } from '@/types/moodboard';

interface MoodboardCardProps {
  moodboard: Moodboard;
  onView: (moodboard: Moodboard) => void;
  onEdit: (moodboard: Moodboard) => void;
  onDelete: (id: string) => void;
}

export function MoodboardCard({ moodboard, onView, onEdit, onDelete }: MoodboardCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-elevated cursor-pointer"
      onClick={() => onView(moodboard)}
    >
      {/* Cover Image */}
      <div className="aspect-video relative overflow-hidden">
        {moodboard.coverImage ? (
          <img
            src={moodboard.coverImage}
            alt={moodboard.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Palette className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(moodboard);
            }}
            className="p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-primary-500 transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(moodboard.id);
            }}
            className="p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Palette */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          {moodboard.palette.slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          {moodboard.palette.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center">
              +{moodboard.palette.length - 5}
            </div>
          )}
        </div>

        {/* View button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 rounded-full bg-primary-500 text-white">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-primary text-lg mb-1 line-clamp-1">
          {moodboard.nom}
        </h3>
        {moodboard.description && (
          <p className="text-sm text-tertiary line-clamp-2 mb-3">
            {moodboard.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Home className="w-4 h-4" />
            {moodboard.pieceIds.length}
          </span>
          <span className="flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            {moodboard.ideeIds.length}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {moodboard.materiauIds.length}
          </span>
          <span className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            {moodboard.palette.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

