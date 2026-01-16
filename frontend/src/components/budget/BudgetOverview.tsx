import { TrendingUp, CreditCard, Wallet, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { BudgetProjet } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetOverviewProps {
  budget: BudgetProjet;
}

export function BudgetOverview({ budget }: BudgetOverviewProps) {
  const isOverBudget = budget.totalRestant < 0;
  const projection = budget.totalDepense + budget.totalPrevu;
  const projectionPourcent = Math.round((projection / budget.budgetMax) * 100);

  return (
    <div className="space-y-4">
      {/* Main budget card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Budget max */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/20">
              <Target className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-tertiary">Budget max projet</p>
              <p className="text-3xl font-bold font-display text-primary">
                {budget.budgetMax.toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-tertiary">Utilisation</span>
              <span className={cn(
                'text-sm font-medium',
                budget.pourcentageUtilise > 90 ? 'text-red-400' :
                budget.pourcentageUtilise > 75 ? 'text-orange-400' : 'text-green-400'
              )}>
                {budget.pourcentageUtilise}%
              </span>
            </div>
            <div className="h-4 bg-overlay rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  budget.pourcentageUtilise > 90 ? 'bg-red-500' :
                  budget.pourcentageUtilise > 75 ? 'bg-orange-500' : 'bg-green-500'
                )}
                style={{ width: `${Math.min(budget.pourcentageUtilise, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted">
              <span>Dépensé: {budget.totalDepense.toLocaleString('fr-FR')}€</span>
              <span>Restant: {budget.totalRestant.toLocaleString('fr-FR')}€</span>
            </div>
          </div>

          {/* Restant */}
          <div className="text-right">
            <p className="text-sm text-tertiary">Restant</p>
            <p className={cn(
              'text-2xl font-bold font-display',
              isOverBudget ? 'text-red-400' : 'text-green-400'
            )}>
              {isOverBudget && '-'}
              {Math.abs(budget.totalRestant).toLocaleString('fr-FR')}€
            </p>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold font-display text-blue-400">
                {budget.totalDepense.toLocaleString('fr-FR')}€
              </p>
              <p className="text-sm text-tertiary">Payé</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-500/20">
              <ArrowUpRight className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-xl font-bold font-display text-accent-400">
                {budget.totalPrevu.toLocaleString('fr-FR')}€
              </p>
              <p className="text-sm text-tertiary">Dépenses prévues</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CreditCard className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold font-display text-green-400">
                {budget.dansCredit.toLocaleString('fr-FR')}€
              </p>
              <p className="text-sm text-tertiary">Dans crédit</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Wallet className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold font-display text-orange-400">
                {budget.horsCredit.toLocaleString('fr-FR')}€
              </p>
              <p className="text-sm text-tertiary">Hors crédit</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Projection */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowDownRight className={cn(
              'w-5 h-5',
              projection > budget.budgetMax ? 'text-red-400' : 'text-green-400'
            )} />
            <div>
              <p className="text-sm text-tertiary">Projection (payé + prévu)</p>
              <p className={cn(
                'text-lg font-bold',
                projection > budget.budgetMax ? 'text-red-400' : 'text-primary'
              )}>
                {projection.toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              projectionPourcent > 100 
                ? 'bg-red-500/20 text-red-400' 
                : projectionPourcent > 80 
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-green-500/20 text-green-400'
            )}>
              {projectionPourcent}% du budget
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

