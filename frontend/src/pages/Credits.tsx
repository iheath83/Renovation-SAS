import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard as CreditCardIcon, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CreditCard, CreditModal, DeblocageModal, CreditDetailsModal } from '@/components/credits';
import { 
  useCredits, 
  useCreateCredit, 
  useUpdateCredit, 
  useDeleteCredit,
  useAddDeblocage,
  useDeleteDeblocage,
  useGlobalCreditStats 
} from '@/hooks/useCredits';
import type { Credit, CreateCreditInput, CreateDeblocageInput } from '@/types/credit';

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

export function Credits() {
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isDeblocageModalOpen, setIsDeblocageModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);

  const { data: credits = [] } = useCredits();
  const globalStats = useGlobalCreditStats();
  
  const createCredit = useCreateCredit();
  const updateCredit = useUpdateCredit();
  const deleteCredit = useDeleteCredit();
  const addDeblocage = useAddDeblocage();
  const deleteDeblocage = useDeleteDeblocage();

  const handleEditCredit = (credit: Credit) => {
    setEditingCredit(credit);
    setIsCreditModalOpen(true);
  };

  const handleDeleteCredit = (credit: Credit) => {
    if (confirm(`Supprimer le crédit "${credit.nom}" ?`)) {
      deleteCredit.mutate(credit.id);
    }
  };

  const handleSaveCredit = (data: CreateCreditInput) => {
    if (editingCredit) {
      updateCredit.mutate(
        { id: editingCredit.id, data },
        {
          onSuccess: () => {
            setIsCreditModalOpen(false);
            setEditingCredit(null);
          },
        }
      );
    } else {
      createCredit.mutate(data, {
        onSuccess: () => {
          setIsCreditModalOpen(false);
        },
      });
    }
  };

  const handleDeleteCreditFromModal = () => {
    if (editingCredit) {
      deleteCredit.mutate(editingCredit.id, {
        onSuccess: () => {
          setIsCreditModalOpen(false);
          setEditingCredit(null);
        },
      });
    }
  };

  const handleViewCredit = (credit: Credit) => {
    setSelectedCredit(credit);
    setIsDetailsModalOpen(true);
  };

  const handleAddDeblocage = (credit: Credit) => {
    setSelectedCredit(credit);
    setIsDeblocageModalOpen(true);
  };

  const handleSaveDeblocage = (data: CreateDeblocageInput) => {
    if (selectedCredit) {
      addDeblocage.mutate(
        { creditId: selectedCredit.id, data },
        {
          onSuccess: () => {
            setIsDeblocageModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteDeblocage = (creditId: string, deblocageId: string) => {
    if (confirm('Supprimer ce déblocage ?')) {
      deleteDeblocage.mutate({ creditId, deblocageId });
    }
  };

  return (
    <motion.div
      variants={container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <CreditCardIcon className="w-8 h-8 text-primary-400" />
            Crédits Travaux
          </h1>
          <p className="text-tertiary mt-1">
            Gestion des crédits et suivi des déblocages
          </p>
        </div>
        <Button onClick={() => { setEditingCredit(null); setIsCreditModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Nouveau crédit
        </Button>
      </motion.div>

      {/* Global Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <PiggyBank className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary">
                {globalStats.totalCredits.toLocaleString('fr-FR')}€
              </p>
              <p className="text-xs text-muted">Total emprunté</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-400">
                {globalStats.totalDebloque.toLocaleString('fr-FR')}€
              </p>
              <p className="text-xs text-muted">Débloqué</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-500/10">
              <Wallet className="w-4 h-4 text-accent-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-accent-400">
                {globalStats.totalRestantADebloquer.toLocaleString('fr-FR')}€
              </p>
              <p className="text-xs text-muted">Disponible</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CreditCardIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">
                {globalStats.nombreCredits}
              </p>
              <p className="text-xs text-muted">Crédit{globalStats.nombreCredits > 1 ? 's' : ''}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Global progress */}
      {globalStats.totalCredits > 0 && (
        <motion.div variants={item}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-tertiary">Progression globale</span>
              <span className="text-sm font-semibold text-primary">
                {Math.round((globalStats.totalDebloque / globalStats.totalCredits) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-overlay rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((globalStats.totalDebloque / globalStats.totalCredits) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-green-500"
              />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Credits Grid */}
      <AnimatePresence mode="wait">
        {credits.length === 0 ? (
          <motion.div
            key="empty"
            variants={item}
            className="text-center py-12 glass rounded-xl"
          >
            <CreditCardIcon className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-tertiary">Aucun crédit enregistré</p>
            <Button 
              onClick={() => { setEditingCredit(null); setIsCreditModalOpen(true); }}
              size="sm"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un crédit
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {credits.map((credit) => (
              <CreditCard
                key={credit.id}
                credit={credit}
                onEdit={handleEditCredit}
                onDelete={handleDeleteCredit}
                onAddDeblocage={handleViewCredit}
                onDeleteDeblocage={handleDeleteDeblocage}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreditModal
        isOpen={isCreditModalOpen}
        onClose={() => {
          setIsCreditModalOpen(false);
          setEditingCredit(null);
        }}
        credit={editingCredit}
        onSave={handleSaveCredit}
        onDelete={editingCredit ? handleDeleteCreditFromModal : undefined}
        isLoading={createCredit.isPending || updateCredit.isPending}
      />

      <CreditDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCredit(null);
        }}
        credit={selectedCredit}
        onAddDeblocage={handleAddDeblocage}
        onDeleteDeblocage={handleDeleteDeblocage}
      />

      <DeblocageModal
        isOpen={isDeblocageModalOpen}
        onClose={() => {
          setIsDeblocageModalOpen(false);
        }}
        credit={selectedCredit}
        onSave={handleSaveDeblocage}
        isLoading={addDeblocage.isPending}
      />
    </motion.div>
  );
}

