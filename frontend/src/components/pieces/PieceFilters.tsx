import { Search, LayoutGrid, List, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { TypePiece, StatutPiece } from '@/types/piece';
import { TYPE_PIECE_LABELS, STATUT_PIECE_LABELS } from '@/types/piece';

interface PieceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  typeFilter?: TypePiece;
  onTypeFilterChange: (type?: TypePiece) => void;
  statutFilter?: StatutPiece;
  onStatutFilterChange: (statut?: StatutPiece) => void;
  etageFilter?: number;
  onEtageFilterChange: (etage?: number) => void;
}

export function PieceFilters({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  typeFilter,
  onTypeFilterChange,
  statutFilter,
  onStatutFilterChange,
  etageFilter,
  onEtageFilterChange,
}: PieceFiltersProps) {
  const hasFilters = typeFilter || statutFilter || etageFilter !== undefined;

  const clearFilters = () => {
    onTypeFilterChange(undefined);
    onStatutFilterChange(undefined);
    onEtageFilterChange(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Top row - Search and view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Rechercher une pièce..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-elevated/50 border border-primary/50">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-primary-600 text-white'
                : 'text-tertiary hover:text-primary hover-bg'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'text-tertiary hover:text-primary hover-bg'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted" />

        {/* Type filter */}
        <select
          value={typeFilter || ''}
          onChange={(e) => onTypeFilterChange(e.target.value as TypePiece || undefined)}
          className="px-3 py-1.5 rounded-lg bg-elevated/50 border border-primary/50 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_PIECE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Statut filter */}
        <select
          value={statutFilter || ''}
          onChange={(e) => onStatutFilterChange(e.target.value as StatutPiece || undefined)}
          className="px-3 py-1.5 rounded-lg bg-elevated/50 border border-primary/50 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_PIECE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Etage filter */}
        <select
          value={etageFilter ?? ''}
          onChange={(e) => onEtageFilterChange(e.target.value ? parseInt(e.target.value) : undefined)}
          className="px-3 py-1.5 rounded-lg bg-elevated/50 border border-primary/50 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="">Tous les étages</option>
          <option value="0">RDC</option>
          <option value="1">1er étage</option>
          <option value="2">2ème étage</option>
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-3 h-3" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}

