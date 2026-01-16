import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Taches } from './Taches';
import { Gantt } from './Gantt';

type TabType = 'kanban' | 'gantt';

export function TachesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('kanban');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('kanban')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'kanban'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <CheckSquare className="w-4 h-4" />
          Kanban
        </button>
        <button
          onClick={() => setActiveTab('gantt')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'gantt'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-overlay text-tertiary hover:bg-surface-700'
          )}
        >
          <CalendarDays className="w-4 h-4" />
          Gantt
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'kanban' ? <Taches /> : <Gantt />}
      </motion.div>
    </div>
  );
}
