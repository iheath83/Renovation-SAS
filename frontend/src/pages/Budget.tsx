import { motion } from 'framer-motion';
import { PiggyBank } from 'lucide-react';
import { BudgetOverview, BudgetPieChart, BudgetVariances, BudgetAlertes } from '@/components/budget';
import { useBudget } from '@/hooks/useBudget';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Budget() {
  const { budgetProjet, budgetParPiece, budgetParCategorie, alertes } = useBudget();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-primary-400" />
          Budget & Suivi
        </h1>
        <p className="text-tertiary mt-1">
          Vue globale et projection budgétaire du projet
        </p>
      </motion.div>

      {/* Overview */}
      <motion.div variants={item}>
        <BudgetOverview budget={budgetProjet} />
      </motion.div>

      {/* Alertes - en haut si critiques */}
      {alertes.filter(a => a.type === 'DEPASSEMENT').length > 0 && (
        <motion.div variants={item}>
          <BudgetAlertes alertes={alertes} />
        </motion.div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <motion.div variants={item}>
          <BudgetPieChart data={budgetParCategorie} />
        </motion.div>

        {/* Variances */}
        <motion.div variants={item}>
          <BudgetVariances pieces={budgetParPiece} />
        </motion.div>
      </div>

      {/* Alertes - en bas si seulement warnings */}
      {alertes.filter(a => a.type === 'DEPASSEMENT').length === 0 && alertes.length > 0 && (
        <motion.div variants={item}>
          <BudgetAlertes alertes={alertes} />
        </motion.div>
      )}

      {/* No alerts message */}
      {alertes.length === 0 && (
        <motion.div variants={item}>
          <BudgetAlertes alertes={[]} />
        </motion.div>
      )}
    </motion.div>
  );
}

