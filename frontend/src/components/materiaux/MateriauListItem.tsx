import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Materiau } from '@/types/materiau';
import { CATEGORIE_ICONS, CATEGORIE_COLORS, CATEGORIE_LABELS, UNITE_LABELS } from '@/types/materiau';

interface MateriauListItemProps {
  materiau: Materiau;
  onEdit: (materiau: Materiau) => void;
}

export function MateriauListItem({ materiau, onEdit }: MateriauListItemProps) {
  const totalCost = (materiau.prixUnitaire || 0) * (materiau.quantite || 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group glass p-4 rounded-xl flex items-center gap-4 hover:shadow-primary-glow transition-all duration-300"
    >
      {/* Icon */}
      <span className="text-2xl">{CATEGORIE_ICONS[materiau.categorie]}</span>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-primary truncate group-hover:text-primary-400 transition-colors">
            {materiau.nom}
          </h3>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
            CATEGORIE_COLORS[materiau.categorie]
          )}>
            {CATEGORIE_LABELS[materiau.categorie]}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {materiau.marque && (
            <span className="text-sm text-muted">{materiau.marque}</span>
          )}
          {materiau.reference && (
            <span className="text-xs text-muted">Réf: {materiau.reference}</span>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="text-center px-4">
        <p className="text-xs text-muted">Quantité</p>
        <p className="font-medium text-primary">
          {(materiau.quantite || 1)} {UNITE_LABELS[materiau.unite]}
        </p>
      </div>

      {/* Unit price */}
      <div className="text-center px-4 border-x border-primary">
        <p className="text-xs text-muted">Prix unit.</p>
        <p className="font-medium text-primary">
          {(materiau.prixUnitaire || 0).toLocaleString('fr-FR')}€
        </p>
      </div>

      {/* Total */}
      <div className="text-center px-4 min-w-[100px]">
        <p className="text-xs text-muted">Total</p>
        <p className="font-semibold text-primary-400">
          {totalCost.toLocaleString('fr-FR')}€
        </p>
      </div>

      {/* Pieces */}
      <div className="hidden lg:flex items-center gap-1 min-w-[150px]">
        <MapPin className="w-3 h-3 text-muted flex-shrink-0" />
        <span className="text-sm text-tertiary truncate">
          {(materiau.pieceNames || []).length > 0 
            ? (materiau.pieceNames || []).slice(0, 2).join(', ')
            : '-'
          }
          {(materiau.pieceNames || []).length > 2 && ` +${(materiau.pieceNames || []).length - 2}`}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {materiau.lienMarchand && (
          <a
            href={materiau.lienMarchand}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover-bg text-tertiary hover:text-primary-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(materiau)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

