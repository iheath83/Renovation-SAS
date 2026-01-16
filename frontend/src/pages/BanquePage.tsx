import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComptesBancaires } from './ComptesBancaires';
import { TransactionsBancaires } from './TransactionsBancaires';

type TabType = 'comptes' | 'transactions';

export function BanquePage() {
  const [activeTab, setActiveTab] = useState<TabType>('comptes');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('comptes')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'comptes'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <Building2 className="w-4 h-4" />
          Comptes bancaires
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'transactions'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Transactions
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'comptes' ? <ComptesBancaires /> : <TransactionsBancaires />}
      </motion.div>
    </div>
  );
}
