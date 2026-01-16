import { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, PiggyBank, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Depenses } from './Depenses';
import { Budget } from './Budget';
import { Credits } from './Credits';

type TabType = 'depenses' | 'budget' | 'credits';

export function BudgetPage() {
  const [activeTab, setActiveTab] = useState<TabType>('budget');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('budget')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'budget'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <PiggyBank className="w-4 h-4" />
          Budget
        </button>
        <button
          onClick={() => setActiveTab('depenses')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'depenses'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <Receipt className="w-4 h-4" />
          Dépenses
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'credits'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <CreditCard className="w-4 h-4" />
          Crédits
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'budget' && <Budget />}
        {activeTab === 'depenses' && <Depenses />}
        {activeTab === 'credits' && <Credits />}
      </motion.div>
    </div>
  );
}
