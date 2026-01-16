import { TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useDepensesStats } from '@/hooks/useDepenses';
import { CATEGORIE_DEPENSE_LABELS, CATEGORIE_DEPENSE_ICONS } from '@/types/depense';
import type { CategorieDepense } from '@/types/depense';

export function DepenseStats() {
  const stats = useDepensesStats();

  const topCategories = Object.entries(stats.byCategorieRealisees || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <TrendingUp className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-primary-400">
              {stats.totalRealisees.toLocaleString('fr-FR')}€
            </p>
            <p className="text-sm text-tertiary">Total dépensé</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <CreditCard className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-green-400">
              {stats.dansCredit.toLocaleString('fr-FR')}€
            </p>
            <p className="text-sm text-tertiary">Dans crédit</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-500/20">
            <Wallet className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-accent-400">
              {stats.horsCredit.toLocaleString('fr-FR')}€
            </p>
            <p className="text-sm text-tertiary">Hors crédit</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-tertiary mb-2">Top catégories</p>
        <div className="space-y-1">
          {topCategories.map(([cat, amount]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <span>{CATEGORIE_DEPENSE_ICONS[cat as CategorieDepense]}</span>
                <span className="text-secondary">{CATEGORIE_DEPENSE_LABELS[cat as CategorieDepense]}</span>
              </span>
              <span className="font-medium text-primary">{(amount as number).toLocaleString('fr-FR')}€</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
