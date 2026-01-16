import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, Circle, Store, MoreVertical, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Depense } from '@/types/depense';
import { CATEGORIE_DEPENSE_ICONS, CATEGORIE_DEPENSE_LABELS } from '@/types/depense';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';

interface DepenseListItemProps {
  depense: Depense;
  onEdit: (depense: Depense) => void;
  onDelete: (depense: Depense) => void;
  onValider?: (depense: Depense) => void;
  isSelected?: boolean;
  onSelect?: (depense: Depense, selected: boolean) => void;
  selectionMode?: boolean;
}

export function DepenseListItem({ depense, onEdit, onDelete, onValider, isSelected = false, onSelect, selectionMode = false }: DepenseListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPrevue = depense.estPrevue ?? false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "group bg-card hover:bg-overlay transition-all duration-200 cursor-pointer",
        "border-b border-subtle last:border-b-0",
        isSelected && "bg-primary-500/5"
      )}
    >
      <div className="flex items-center gap-4 py-4 px-5">
        {/* Checkbox for selection mode */}
        {selectionMode && onSelect && (
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(depense, e.target.checked)}
              className="w-4 h-4 rounded border-2 border-primary/30 bg-transparent checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors"
            />
          </div>
        )}

        {/* Icon/Logo */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0",
          isPrevue ? "bg-accent-500/10" : "bg-primary-500/10"
        )}>
          {CATEGORIE_DEPENSE_ICONS[depense.categorie]}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-primary truncate">
              {depense.description}
            </h3>
          </div>
          
          <div className="flex items-center gap-3 mt-0.5 text-sm text-muted">
            {/* Date and time */}
            <span>
              {format(new Date(depense.dateDepense), 'd MMM, HH:mm', { locale: fr })}
            </span>
            
            {/* Fournisseur */}
            {depense.fournisseur && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted/50" />
                <span className="flex items-center gap-1.5">
                  <Store className="w-3 h-3" />
                  {depense.fournisseur}
                </span>
              </>
            )}
            
            {/* Piece */}
            {depense.pieceName && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted/50" />
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {depense.pieceName}
                </span>
              </>
            )}

            {/* Factures */}
            {depense.factures && depense.factures.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted/50" />
                <span className="flex items-center gap-1 text-accent-400">
                  <FileText className="w-3 h-3" />
                  {depense.factures.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-overlay/50 border border-subtle">
          {isPrevue ? (
            <>
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-xs font-medium text-accent-400">Prévue</span>
            </>
          ) : depense.passeDansCredit ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-medium text-green-400">Crédit</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-blue-400">Personnel</span>
            </>
          )}
        </div>

        {/* Category */}
        <div className="hidden lg:block px-3 py-1.5 rounded-lg bg-overlay/30 text-xs font-medium text-tertiary min-w-[100px] text-center">
          {CATEGORIE_DEPENSE_LABELS[depense.categorie]}
        </div>

        {/* Amount */}
        <div className="text-right min-w-[100px]">
          <p className={cn(
            "text-base font-semibold",
            isPrevue ? "text-accent-400" : "text-primary"
          )}>
            {depense.montant >= 0 ? '-' : '+'}{Math.abs(depense.montant).toLocaleString('fr-FR')}€
          </p>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover-bg rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-tertiary" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-1 w-48 bg-elevated border border-primary rounded-xl shadow-xl overflow-hidden z-10"
            >
              {isPrevue && onValider && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onValider(depense);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-green-400 hover:bg-green-500/10 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Valider la dépense
                  </button>
                  <div className="border-t border-subtle" />
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(depense);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-secondary hover-bg transition-colors flex items-center gap-2"
              >
                Modifier
              </button>
              {depense.factures && depense.factures.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    depense.factures?.forEach(url => window.open(url, '_blank'));
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-secondary hover-bg transition-colors flex items-center gap-2"
                >
                  Voir les factures
                </button>
              )}
              <div className="border-t border-subtle" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(depense);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                Supprimer
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

