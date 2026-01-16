import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Plus, Edit, Trash2, CheckCircle2, Circle, Euro } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { usePiece, useUpdatePiece, useDeletePiece } from '@/hooks/usePieces';
import { useTaches } from '@/hooks/useTaches';
import { useDepenses } from '@/hooks/useDepenses';
import { PieceModal } from '@/components/pieces';
import { STATUT_PIECE_LABELS, TYPE_PIECE_LABELS } from '@/types/piece';
import { STATUT_TACHE_LABELS } from '@/types/tache';
import { CATEGORIE_DEPENSE_LABELS } from '@/types/depense';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PieceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: piece, isLoading } = usePiece(id!);
  const { data: taches = [] } = useTaches({ pieceId: id });
  const { data: depenses = [] } = useDepenses({ pieceId: id });
  const updatePiece = useUpdatePiece();
  const deletePiece = useDeletePiece();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!piece) {
    return (
      <div className="text-center py-12">
        <p className="text-tertiary">Pièce non trouvée</p>
        <Button onClick={() => navigate('/pieces')} className="mt-4">
          <ArrowLeft className="w-4 h-4" />
          Retour aux pièces
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pièce ?')) {
      deletePiece.mutate(piece.id, {
        onSuccess: () => navigate('/pieces'),
      });
    }
  };

  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const tachesTerminees = taches.filter(t => t.statut === 'TERMINE').length;
  const progressionTaches = taches.length > 0 ? (tachesTerminees / taches.length) * 100 : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pieces')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux pièces
          </Button>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <Home className="w-8 h-8 text-primary-400" />
            {piece.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium">
              {TYPE_PIECE_LABELS[piece.type]}
            </span>
            <span className="px-3 py-1 rounded-lg bg-accent-500/20 text-accent-400 text-sm font-medium">
              {STATUT_PIECE_LABELS[piece.statut]}
            </span>
            {piece.etage !== undefined && (
              <span className="text-tertiary text-sm">
                Étage {piece.etage}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Edit className="w-4 h-4" />
            Modifier
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Supprimer
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-primary-400">
            {piece.surface || '-'} m²
          </p>
          <p className="text-sm text-tertiary mt-1">Surface</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-green-400">
            {piece.budget ? `${piece.budget.toLocaleString()} €` : '-'}
          </p>
          <p className="text-sm text-tertiary mt-1">Budget prévu</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-accent-400">
            {totalDepenses.toLocaleString()} €
          </p>
          <p className="text-sm text-tertiary mt-1">Dépensé</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold font-display text-secondary">
            {Math.round(progressionTaches)}%
          </p>
          <p className="text-sm text-tertiary mt-1">Tâches complétées</p>
        </Card>
      </motion.div>

      {/* Tâches */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-400" />
                Tâches ({taches.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => navigate('/taches', { state: { pieceId: piece.id } })}
              >
                <Plus className="w-4 h-4" />
                Ajouter une tâche
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {taches.length === 0 ? (
              <p className="text-center text-muted py-8">
                Aucune tâche pour cette pièce
              </p>
            ) : (
              <div className="space-y-2">
                {taches.map((tache) => (
                  <div
                    key={tache.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-overlay/50 hover:bg-overlay transition-colors cursor-pointer"
                    onClick={() => navigate('/taches')}
                  >
                    {tache.statut === 'TERMINE' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-primary font-medium truncate">{tache.titre}</p>
                      {tache.description && (
                        <p className="text-sm text-muted truncate">{tache.description}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 rounded text-xs bg-surface-700 text-tertiary whitespace-nowrap">
                      {STATUT_TACHE_LABELS[tache.statut]}
                    </span>
                    {tache.coutEstime && (
                      <span className="text-tertiary text-sm flex items-center gap-1 whitespace-nowrap">
                        <Euro className="w-3 h-3" />
                        {tache.coutEstime.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dépenses */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-green-400" />
                Dépenses ({depenses.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => navigate('/depenses', { state: { pieceId: piece.id } })}
              >
                <Plus className="w-4 h-4" />
                Ajouter une dépense
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {depenses.length === 0 ? (
              <p className="text-center text-muted py-8">
                Aucune dépense pour cette pièce
              </p>
            ) : (
              <div className="space-y-2">
                {depenses.map((depense) => (
                  <div
                    key={depense.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-overlay/50 hover:bg-overlay transition-colors cursor-pointer"
                    onClick={() => navigate('/depenses')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-primary font-medium truncate">{depense.description}</p>
                      <p className="text-sm text-muted">
                        {new Date(depense.dateDepense).toLocaleDateString('fr-FR')}
                        {depense.fournisseur && ` • ${depense.fournisseur}`}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs bg-surface-700 text-tertiary whitespace-nowrap">
                      {CATEGORIE_DEPENSE_LABELS[depense.categorie]}
                    </span>
                    <span className="text-green-400 font-bold text-lg whitespace-nowrap">
                      {depense.montant.toLocaleString()} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Modal */}
      <PieceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        piece={piece}
        onSave={(data) => {
          updatePiece.mutate(
            { id: piece.id, data },
            {
              onSuccess: () => setIsEditModalOpen(false),
            }
          );
        }}
        isLoading={updatePiece.isPending}
      />
    </motion.div>
  );
}

