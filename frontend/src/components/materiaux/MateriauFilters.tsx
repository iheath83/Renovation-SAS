import { Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { CategorieMateriau } from '@/types/materiau';
import { CATEGORIE_LABELS, CATEGORIE_ICONS } from '@/types/materiau';

interface MateriauFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategorie: CategorieMateriau | 'ALL';
  onCategorieChange: (categorie: CategorieMateriau | 'ALL') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function MateriauFilters({
  search,
  onSearchChange,
  selectedCategorie,
  onCategorieChange,
  viewMode,
  onViewModeChange,
}: MateriauFiltersProps) {
  const categories: (CategorieMateriau | 'ALL')[] = [
    'ALL',
    'PEINTURE',
    'CARRELAGE',
    'PARQUET',
    'PLOMBERIE',
    'ELECTRICITE',
    'MENUISERIE',
    'ISOLATION',
    'QUINCAILLERIE',
    'DECORATION',
    'AUTRE',
  ];

  return (
    <div className="space-y-4">
      {/* Search & View toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Rechercher un matériau..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600/20 text-primary-400' : ''}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary-600/20 text-primary-400' : ''}`}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategorieChange(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              selectedCategorie === cat
                ? 'bg-primary-500 text-white'
                : 'bg-overlay text-tertiary hover:bg-surface-700 hover:text-primary'
            )}
          >
            {cat === 'ALL' ? (
              'Tous'
            ) : (
              <span className="flex items-center gap-1.5">
                <span>{CATEGORIE_ICONS[cat]}</span>
                <span>{CATEGORIE_LABELS[cat]}</span>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

