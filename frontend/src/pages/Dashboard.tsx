import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  CheckSquare,
  Receipt,
  Wallet,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  StatCard,
  BudgetChart,
  BudgetPieChart,
  AlertsList,
  RecentActivity,
  ProgressBar,
} from '@/components/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { usePieces } from '@/hooks/usePieces';
import { useTaches } from '@/hooks/useTaches';
import { useDepenses, useDepensesStats } from '@/hooks/useDepenses';
import { useCredits } from '@/hooks/useCredits';
import { useMateriaux } from '@/hooks/useMateriaux';
import { useIdees } from '@/hooks/useIdees';
import { useComptesBancaires } from '@/hooks/useComptesBancaires';
import { useTransactionsBancaires } from '@/hooks/useTransactionsBancaires';
import { useProjetSettings } from '@/hooks/useSettings';
import { format, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, isWithinInterval, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CATEGORIE_DEPENSE_LABELS } from '@/types/depense';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const CATEGORY_COLORS: Record<string, string> = {
  MATERIAU: '#10b981',
  MAIN_OEUVRE: '#3b82f6',
  OUTIL: '#64748b',
  LIVRAISON: '#8b5cf6',
  ETUDE: '#14b8a6',
  AUTRE: '#6b7280',
};

export function Dashboard() {
  const { data: pieces = [] } = usePieces();
  const { data: taches = [] } = useTaches();
  const { data: depenses = [] } = useDepenses();
  const depensesStats = useDepensesStats();
  const { data: credits = [] } = useCredits();
  const { data: materiaux = [] } = useMateriaux();
  const { data: idees = [] } = useIdees();
  const { data: comptesBancaires = [] } = useComptesBancaires();
  const { data: transactionsBancairesData } = useTransactionsBancaires();
  const transactionsBancaires = transactionsBancairesData?.transactions || [];
  const { data: projetSettings } = useProjetSettings();

  // Calculs des statistiques
  const piecesEnCours = pieces.filter(p => p.statut === 'EN_COURS').length;
  const piecesTerminees = pieces.filter(p => p.statut === 'TERMINE').length;

  const tachesEnCours = taches.filter(t => t.statut === 'EN_COURS').length;
  const tachesTerminees = taches.filter(t => t.statut === 'TERMINE').length;
  const tachesTotal = taches.length;

  // Budget total (depuis les paramètres du projet OU somme des budgets des pièces si non défini)
  const totalBudget = useMemo(() => {
    // Priorité au budget défini dans les paramètres
    if (projetSettings?.budgetMax && projetSettings.budgetMax > 0) {
      return projetSettings.budgetMax;
    }
    // Sinon, somme des budgets des pièces
    return pieces.reduce((sum, p) => sum + (p.budget || 0), 0);
  }, [pieces, projetSettings]);

  const totalSpent = depensesStats.totalRealisees;
  const budgetRestant = totalBudget - totalSpent;

  // Dépenses ce mois
  const depensesCeMois = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return depenses
      .filter(d => {
        const date = new Date(d.dateDepense);
        return isWithinInterval(date, { start, end });
      })
      .reduce((sum, d) => sum + d.montant, 0);
  }, [depenses]);

  // Progression globale (basée sur les tâches terminées)
  const projectProgress = useMemo(() => {
    if (tachesTotal === 0) return 0;
    return Math.round((tachesTerminees / tachesTotal) * 100);
  }, [tachesTerminees, tachesTotal]);

  // Transactions bancaires ce mois
  const transactionsBancairesCeMois = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactionsBancaires
      .filter(t => {
        const date = new Date(t.dateTransaction);
        return isWithinInterval(date, { start, end });
      })
      .reduce((sum, t) => sum + t.montant, 0);
  }, [transactionsBancaires]);

  // Nombre de transactions bancaires non catégorisées
  const transactionsNonCategories = transactionsBancaires.filter(t => !t.estDepenseRenovation && t.statut === 'NOUVEAU').length;

  // Stats cards
  const stats = [
    {
      label: 'Pièces',
      value: pieces.length.toString(),
      subtitle: `${piecesEnCours} en cours, ${piecesTerminees} terminées`,
      icon: Home,
      color: 'primary' as const,
    },
    {
      label: 'Tâches',
      value: tachesTotal.toString(),
      subtitle: `${tachesEnCours} en cours`,
      icon: CheckSquare,
      color: 'blue' as const,
      trend: tachesTerminees > 0 ? { value: Math.round((tachesTerminees / tachesTotal) * 100), isPositive: true } : undefined,
    },
    {
      label: 'Dépenses',
      value: `${totalSpent.toLocaleString('fr-FR')}€`,
      subtitle: `Ce mois: ${depensesCeMois.toLocaleString('fr-FR')}€`,
      icon: Receipt,
      color: 'accent' as const,
    },
    {
      label: 'Budget restant',
      value: `${budgetRestant.toLocaleString('fr-FR')}€`,
      subtitle: `sur ${totalBudget.toLocaleString('fr-FR')}€`,
      icon: Wallet,
      color: budgetRestant < 0 ? 'red' as const : 'primary' as const,
    },
  ];

  // Budget par pièce
  const budgetByPiece = useMemo(() => {
    return pieces.map(piece => {
      const depensesPiece = depenses
        .filter(d => d.pieceId === piece.id)
        .reduce((sum, d) => sum + d.montant, 0);
      return {
        name: piece.name,
        budget: piece.budget || 0,
        depense: depensesPiece,
      };
    }).filter(p => p.budget > 0 || p.depense > 0);
  }, [pieces, depenses]);

  // Budget par catégorie
  const budgetCategories = useMemo(() => {
    return Object.entries(depensesStats.byCategorieRealisees || {}).map(([cat, value]) => ({
      name: CATEGORIE_DEPENSE_LABELS[cat as keyof typeof CATEGORIE_DEPENSE_LABELS] || cat,
      value: value as number,
      color: CATEGORY_COLORS[cat] || '#6b7280',
    }));
  }, [depensesStats.byCategorieRealisees]);

  // Alertes (tâches en retard ou proches de l'échéance)
  const alerts = useMemo(() => {
    const now = new Date();
    return taches
      .filter(t => t.statut !== 'TERMINE' && t.dateFin && t.priorite !== 'BASSE')
      .map(t => {
        const dueDate = new Date(t.dateFin!);
        const daysUntil = differenceInDays(dueDate, now);
        const isOverdue = isBefore(dueDate, now);
        
        let dueDateText = '';
        if (isOverdue) {
          dueDateText = `Échéance dépassée de ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''}`;
        } else if (daysUntil === 0) {
          dueDateText = "Aujourd'hui";
        } else if (daysUntil === 1) {
          dueDateText = 'Demain';
        } else {
          dueDateText = `Dans ${daysUntil} jours`;
        }

        return {
          id: t.id,
          title: t.titre,
          dueDate: dueDateText,
          priority: t.priorite as 'URGENTE' | 'HAUTE' | 'MOYENNE',
          isOverdue,
          pieceName: t.pieceName || undefined,
        };
      })
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return 0;
      })
      .slice(0, 5);
  }, [taches]);

  // Activité récente
  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'task' | 'expense' | 'idea' | 'credit' | 'material';
      action: string;
      item: string;
      time: string;
      metadata?: string;
      date: Date;
    }> = [];

    // Tâches récentes
    taches
      .filter(t => t.statut === 'TERMINE')
      .slice(0, 3)
      .forEach(t => {
        activities.push({
          id: `task-${t.id}`,
          type: 'task',
          action: 'Tâche terminée',
          item: t.titre,
          time: format(new Date(t.updatedAt), "'Il y a' d 'jours'", { locale: fr }),
          metadata: t.pieceName || undefined,
          date: new Date(t.updatedAt),
        });
      });

    // Dépenses récentes
    depenses.slice(0, 3).forEach(d => {
      activities.push({
        id: `expense-${d.id}`,
        type: 'expense',
        action: 'Dépense ajoutée',
        item: d.description,
        time: format(new Date(d.createdAt), "'Il y a' d 'jours'", { locale: fr }),
        metadata: `${d.montant.toLocaleString('fr-FR')}€`,
        date: new Date(d.createdAt),
      });
    });

    // Idées récentes
    idees.slice(0, 2).forEach(i => {
      activities.push({
        id: `idea-${i.id}`,
        type: 'idea',
        action: 'Nouvelle inspiration',
        item: i.titre || 'Idée sans titre',
        time: format(new Date(i.createdAt), "'Il y a' d 'jours'", { locale: fr }),
        metadata: 'Pinterest',
        date: new Date(i.createdAt),
      });
    });

    // Déblocages de crédit récents
    credits.forEach(c => {
      c.deblocages?.slice(0, 1).forEach(d => {
        activities.push({
          id: `credit-${d.id}`,
          type: 'credit',
          action: 'Déblocage crédit',
          item: c.nom,
          time: format(new Date(d.dateDeblocage), "'Il y a' d 'jours'", { locale: fr }),
          metadata: `+${d.montant.toLocaleString('fr-FR')}€`,
          date: new Date(d.dateDeblocage),
        });
      });
    });

    // Matériaux récents
    materiaux.slice(0, 2).forEach(m => {
      activities.push({
        id: `material-${m.id}`,
        type: 'material',
        action: 'Matériau ajouté',
        item: m.nom,
        time: format(new Date(m.createdAt), "'Il y a' d 'jours'", { locale: fr }),
        metadata: `${(m.prixUnitaire || 0).toLocaleString('fr-FR')}€/${m.unite}`,
        date: new Date(m.createdAt),
      });
    });

    // Transactions bancaires récentes (non catégorisées uniquement)
    transactionsBancaires
      .filter(t => t.statut === 'NOUVEAU' && !t.estDepenseRenovation)
      .slice(0, 3)
      .forEach(t => {
        activities.push({
          id: `transaction-${t.id}`,
          type: 'expense',
          action: 'Transaction bancaire',
          item: t.description,
          time: format(new Date(t.dateTransaction), "'Il y a' d 'jours'", { locale: fr }),
          metadata: `${t.montant.toLocaleString('fr-FR')}€`,
          date: new Date(t.dateTransaction),
        });
      });

    // Trier par date et limiter
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8)
      .map(({ date, ...rest }) => rest);
  }, [taches, depenses, idees, credits, materiaux, transactionsBancaires]);

  // Échéances
  const echeances = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const nextWeekStart = addWeeks(thisWeekStart, 1);
    const nextWeekEnd = addWeeks(thisWeekEnd, 1);
    const monthEnd = endOfMonth(now);

    const tachesAvecEcheance = taches.filter(t => t.statut !== 'TERMINE' && t.dateFin);

    const cetteSemaine = tachesAvecEcheance.filter(t => {
      const date = new Date(t.dateFin!);
      return isWithinInterval(date, { start: thisWeekStart, end: thisWeekEnd });
    }).length;

    const semaineProchaine = tachesAvecEcheance.filter(t => {
      const date = new Date(t.dateFin!);
      return isWithinInterval(date, { start: nextWeekStart, end: nextWeekEnd });
    }).length;

    const ceMois = tachesAvecEcheance.filter(t => {
      const date = new Date(t.dateFin!);
      return isWithinInterval(date, { start: now, end: monthEnd });
    }).length;

    const enRetard = tachesAvecEcheance.filter(t => {
      const date = new Date(t.dateFin!);
      return isBefore(date, now);
    }).length;

    return { cetteSemaine, semaineProchaine, ceMois, enRetard };
  }, [taches]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary">
            Tableau de bord 👋
          </h1>
          <p className="text-tertiary mt-1">
            Voici l'état de votre projet de rénovation
          </p>
        </div>
        <Card className="lg:w-72">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-tertiary mb-1">Progression globale</p>
              <ProgressBar value={projectProgress} size="md" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-400 font-display">{projectProgress}%</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </motion.div>

      {/* Budget Warning */}
      {budgetRestant < 0 && (
        <motion.div variants={item}>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="font-medium text-red-400">Budget dépassé</p>
              <p className="text-sm text-red-400/70">
                Vous avez dépassé votre budget de {Math.abs(budgetRestant).toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          {budgetByPiece.length > 0 ? (
            <BudgetChart data={budgetByPiece} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-tertiary">Ajoutez des pièces avec un budget pour voir le graphique</p>
              </div>
            </Card>
          )}
        </motion.div>
        <motion.div variants={item}>
          <BudgetPieChart
            data={budgetCategories.length > 0 ? budgetCategories : [{ name: 'Aucune dépense', value: 1, color: '#374151' }]}
            total={totalBudget}
            spent={totalSpent}
          />
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <motion.div variants={item}>
          <AlertsList alerts={alerts} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="lg:col-span-2">
          <RecentActivity activities={recentActivity} />
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Échéances à venir */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-tertiary" />
                Échéances à venir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Cette semaine', value: echeances.cetteSemaine, color: 'accent' },
                  { label: 'Semaine prochaine', value: echeances.semaineProchaine, color: 'primary' },
                  { label: 'Ce mois', value: echeances.ceMois, color: 'blue' },
                  { label: 'En retard', value: echeances.enRetard, color: 'red' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-4 rounded-xl bg-elevated/50"
                  >
                    <p className={`text-3xl font-bold font-display ${
                      stat.color === 'red' ? 'text-red-400' :
                      stat.color === 'accent' ? 'text-accent-400' :
                      stat.color === 'blue' ? 'text-blue-400' :
                      'text-primary-400'
                    }`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-tertiary mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Finances & Banque */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-tertiary" />
                Finances & Banque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-elevated/50">
                  <p className="text-3xl font-bold font-display text-primary-400">
                    {comptesBancaires.filter(c => c.actif).length}
                  </p>
                  <p className="text-sm text-tertiary mt-1">Comptes bancaires</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-elevated/50">
                  <p className="text-3xl font-bold font-display text-accent-400">
                    {transactionsBancaires.length}
                  </p>
                  <p className="text-sm text-tertiary mt-1">Transactions</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-elevated/50">
                  <p className="text-3xl font-bold font-display text-blue-400">
                    {transactionsBancairesCeMois.toLocaleString('fr-FR')}€
                  </p>
                  <p className="text-sm text-tertiary mt-1">Ce mois (banque)</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-elevated/50">
                  <p className="text-3xl font-bold font-display text-yellow-400">
                    {transactionsNonCategories}
                  </p>
                  <p className="text-sm text-tertiary mt-1">À catégoriser</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
