import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Materiau } from '@/types/materiau';
import { CATEGORIE_ICONS, CATEGORIE_COLORS, CATEGORIE_LABELS, UNITE_LABELS } from '@/types/materiau';

interface MateriauCardProps {
  materiau: Materiau;
  onEdit: (materiau: Materiau) => void;
}

export function MateriauCard({ materiau, onEdit }: MateriauCardProps) {
  const totalCost = (materiau.prixUnitaire || 0) * (materiau.quantite || 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group glass p-5 rounded-xl hover:shadow-primary-glow transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{CATEGORIE_ICONS[materiau.categorie]}</span>
          <div>
            <h3 className="font-semibold text-primary group-hover:text-primary-400 transition-colors">
              {materiau.nom}
            </h3>
            {materiau.marque && (
              <p className="text-sm text-muted">{materiau.marque}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(materiau)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>

      {/* Description */}
      {materiau.description && (
        <p className="text-sm text-tertiary mb-3 line-clamp-2">
          {materiau.description}
        </p>
      )}

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium border',
          CATEGORIE_COLORS[materiau.categorie]
        )}>
          {CATEGORIE_LABELS[materiau.categorie]}
        </span>
        {materiau.reference && (
          <span className="text-xs text-muted">
            Réf: {materiau.reference}
          </span>
        )}
      </div>

      {/* Price & Quantity */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-3 rounded-lg bg-overlay/50">
        <div className="text-center">
          <p className="text-xs text-muted">Prix unit.</p>
          <p className="font-semibold text-primary">
            {(materiau.prixUnitaire || 0).toLocaleString('fr-FR')}€
          </p>
        </div>
        <div className="text-center border-x border-primary">
          <p className="text-xs text-muted">Quantité</p>
          <p className="font-semibold text-primary">
            {(materiau.quantite || 1)} {UNITE_LABELS[materiau.unite]}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted">Total</p>
          <p className="font-semibold text-primary-400">
            {totalCost.toLocaleString('fr-FR')}€
          </p>
        </div>
      </div>

      {/* Pieces */}
      {(materiau.pieceNames || []).length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-3 h-3 text-muted" />
          <div className="flex flex-wrap gap-1">
            {(materiau.pieceNames || []).slice(0, 3).map((name, i) => (
              <span key={i} className="text-xs text-tertiary">
                {name}{i < Math.min((materiau.pieceNames || []).length - 1, 2) ? ',' : ''}
              </span>
            ))}
            {(materiau.pieceNames || []).length > 3 && (
              <span className="text-xs text-muted">
                +{(materiau.pieceNames || []).length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Merchant link */}
      {materiau.lienMarchand && (
        <a
          href={materiau.lienMarchand}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Voir le produit
        </a>
      )}
    </motion.div>
  );
}

