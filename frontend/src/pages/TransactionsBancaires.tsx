import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Filter, ArrowRight, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTransactionsBancaires, useTransactionsBancairesStats, useConvertTransaction, useIgnoreTransaction } from '@/hooks/useTransactionsBancaires';
import { usePieces } from '@/hooks/usePieces';
import { useTaches } from '@/hooks/useTaches';
import { useMateriaux } from '@/hooks/useMateriaux';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TransactionBancaire } from '@/types/compteBancaire';

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

export function TransactionsBancaires() {
  const [selectedStatut, setSelectedStatut] = useState<string>('NOUVEAU');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionBancaire | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: result, isLoading } = useTransactionsBancaires(undefined, { statut: selectedStatut });
  const { data: stats } = useTransactionsBancairesStats();
  const { data: pieces = [] } = usePieces();
  const { data: taches = [] } = useTaches();
  const { data: materiaux = [] } = useMateriaux();

  const convertMutation = useConvertTransaction();
  const ignoreMutation = useIgnoreTransaction();

  const transactions = result?.transactions || [];

  const handleConvert = (transaction: TransactionBancaire) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleIgnore = async (transactionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir ignorer cette transaction ?')) {
      await ignoreMutation.mutateAsync(transactionId);
    }
  };

  const handleSubmitConversion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      categorie: formData.get('categorie') as string || undefined,
      pieceId: formData.get('pieceId') as string || undefined,
      tacheId: formData.get('tacheId') as string || undefined,
      materiauId: formData.get('materiauId') as string || undefined,
      passeDansCredit: formData.get('passeDansCredit') === 'on',
    };

    await convertMutation.mutateAsync({
      transactionId: selectedTransaction.id,
      data,
    });

    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="w-8 h-8 text-primary-400 animate-pulse mx-auto mb-2" />
          <p className="text-tertiary">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary-400" />
            Transactions Bancaires
          </h1>
          <p className="text-tertiary mt-1">
            Convertissez vos transactions en dépenses de rénovation
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div variants={item} className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-accent-400">
                {stats.NOUVEAU?.count || 0}
              </p>
              <p className="text-sm text-tertiary mt-1">À traiter</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-green-400">
                {stats.CONVERTI?.count || 0}
              </p>
              <p className="text-sm text-tertiary mt-1">Converties</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-muted">
                {stats.IGNORE?.count || 0}
              </p>
              <p className="text-sm text-tertiary mt-1">Ignorées</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Filtres */}
      <motion.div variants={item}>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-tertiary" />
            <div className="flex gap-2">
              {['NOUVEAU', 'CONVERTI', 'IGNORE'].map((statut) => (
                <button
                  key={statut}
                  onClick={() => setSelectedStatut(statut)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatut === statut
                      ? 'bg-primary-500 text-white'
                      : 'bg-overlay text-tertiary hover:bg-surface-700'
                  }`}
                >
                  {statut === 'NOUVEAU' ? 'À traiter' : statut === 'CONVERTI' ? 'Converties' : 'Ignorées'}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Liste des transactions */}
      {transactions.length === 0 ? (
        <motion.div variants={item} className="text-center py-12 glass rounded-xl">
          <Receipt className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-tertiary">
            Aucune transaction {selectedStatut === 'NOUVEAU' ? 'à traiter' : selectedStatut === 'CONVERTI' ? 'convertie' : 'ignorée'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={container} className="space-y-3">
          {transactions.map((transaction) => (
            <motion.div key={transaction.id} variants={item}>
              <Card className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-primary">{transaction.description}</h3>
                        <p className="text-sm text-tertiary">
                          {format(new Date(transaction.dateTransaction), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-400">
                          {transaction.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                        {transaction.suggestion && transaction.suggestion.confidence > 0.5 && (
                          <span className="inline-flex items-center gap-1 text-xs text-accent-400">
                            <AlertCircle className="w-3 h-3" />
                            {transaction.suggestion.categorie}
                          </span>
                        )}
                      </div>
                    </div>

                    {transaction.categorie && (
                      <span className="inline-block px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-medium">
                        {transaction.categorie}
                      </span>
                    )}
                  </div>

                  {transaction.statut === 'NOUVEAU' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConvert(transaction)}
                      >
                        <ArrowRight className="w-3 h-3" />
                        Convertir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleIgnore(transaction.id)}
                        className="text-tertiary hover:text-primary"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {transaction.statut === 'CONVERTI' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Convertie</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de conversion */}
      <AnimatePresence>
        {isModalOpen && selectedTransaction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <Card className="w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-primary mb-4">
                  Convertir en dépense
                </h2>

                <form onSubmit={handleSubmitConversion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Montant
                    </label>
                    <input
                      type="text"
                      value={selectedTransaction.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      disabled
                      className="w-full px-3 py-2 bg-overlay border border-primary rounded-lg text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Catégorie
                    </label>
                    <input
                      name="categorie"
                      type="text"
                      defaultValue={selectedTransaction.suggestion?.categorie || selectedTransaction.categorie || ''}
                      placeholder="Ex: Matériaux, Main d'œuvre..."
                      className="w-full px-3 py-2 bg-overlay border border-primary rounded-lg text-primary focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Pièce (optionnel)
                    </label>
                    <select
                      name="pieceId"
                      className="w-full px-3 py-2 bg-overlay border border-primary rounded-lg text-primary focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Aucune</option>
                      {pieces.map((piece) => (
                        <option key={piece.id} value={piece.id}>
                          {piece.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Tâche (optionnel)
                    </label>
                    <select
                      name="tacheId"
                      className="w-full px-3 py-2 bg-overlay border border-primary rounded-lg text-primary focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Aucune</option>
                      {taches.map((tache) => (
                        <option key={tache.id} value={tache.id}>
                          {tache.titre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Matériau (optionnel)
                    </label>
                    <select
                      name="materiauId"
                      className="w-full px-3 py-2 bg-overlay border border-primary rounded-lg text-primary focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Aucun</option>
                      {materiaux.map((materiau) => (
                        <option key={materiau.id} value={materiau.id}>
                          {materiau.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="passeDansCredit"
                      id="passeDansCredit"
                      className="w-4 h-4 rounded border-primary bg-overlay text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="passeDansCredit" className="text-sm text-secondary">
                      Passé dans un crédit travaux
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={convertMutation.isPending}
                    >
                      {convertMutation.isPending ? 'Conversion...' : 'Convertir'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

