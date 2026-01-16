import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  PieceCard,
  PieceListItem,
  PieceFilters,
  PieceModal,
} from '@/components/pieces';
import { usePieces, usePieceDepense, useCreatePiece, useUpdatePiece } from '@/hooks/usePieces';
import type { Piece, TypePiece, StatutPiece, CreatePieceInput } from '@/types/piece';
import { STATUT_PIECE_LABELS } from '@/types/piece';

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

// Composant wrapper pour récupérer les dépenses
function PieceCardWrapper({ piece, onClick, onEdit }: { piece: Piece; onClick: () => void; onEdit: () => void }) {
  const depense = usePieceDepense(piece.id);
  return <PieceCard piece={piece} depense={depense} onClick={onClick} onEdit={onEdit} />;
}

function PieceListItemWrapper({ piece, onClick, onEdit }: { piece: Piece; onClick: () => void; onEdit: () => void }) {
  const depense = usePieceDepense(piece.id);
  return <PieceListItem piece={piece} depense={depense} onClick={onClick} onEdit={onEdit} />;
}

export function Pieces() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypePiece>();
  const [statutFilter, setStatutFilter] = useState<StatutPiece>();
  const [etageFilter, setEtageFilter] = useState<number>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);

  const { data: pieces = [], isLoading } = usePieces({
    type: typeFilter,
    statut: statutFilter,
    etage: etageFilter,
    search,
  });

  const createPiece = useCreatePiece();
  const updatePiece = useUpdatePiece();

  const handleSave = (data: CreatePieceInput) => {
    if (editingPiece) {
      updatePiece.mutate(
        { id: editingPiece.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingPiece(null);
          },
        }
      );
    } else {
      createPiece.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleEdit = (piece: Piece) => {
    setEditingPiece(piece);
    setIsModalOpen(true);
  };

  const handlePieceClick = (pieceId: string) => {
    navigate(`/pieces/${pieceId}`);
  };

  const handleCreate = () => {
    setEditingPiece(null);
    setIsModalOpen(true);
  };

  // Statistiques
  const stats = {
    total: pieces.length,
    aFaire: pieces.filter(p => p.statut === 'A_FAIRE').length,
    enCours: pieces.filter(p => p.statut === 'EN_COURS').length,
    termine: pieces.filter(p => p.statut === 'TERMINE').length,
  };

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
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <Home className="w-8 h-8 text-primary-400" />
            Pièces
          </h1>
          <p className="text-tertiary mt-1">
            Gérez les pièces de votre projet de rénovation
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Nouvelle pièce
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'primary' },
          { label: STATUT_PIECE_LABELS.A_FAIRE, value: stats.aFaire, color: 'surface' },
          { label: STATUT_PIECE_LABELS.EN_COURS, value: stats.enCours, color: 'accent' },
          { label: STATUT_PIECE_LABELS.TERMINE, value: stats.termine, color: 'green' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center py-4">
            <p className={`text-3xl font-bold font-display text-${stat.color === 'surface' ? 'surface-300' : stat.color + '-400'}`}>
              {stat.value}
            </p>
            <p className="text-sm text-tertiary mt-1">{stat.label}</p>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <PieceFilters
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statutFilter={statutFilter}
          onStatutFilterChange={setStatutFilter}
          etageFilter={etageFilter}
          onEtageFilterChange={setEtageFilter}
        />
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pieces.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center py-12">
            <Home className="w-12 h-12 mx-auto text-muted mb-4" />
            <h3 className="text-lg font-medium text-secondary mb-2">
              Aucune pièce trouvée
            </h3>
            <p className="text-muted mb-4">
              {search || typeFilter || statutFilter
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par ajouter votre première pièce'}
            </p>
            {!search && !typeFilter && !statutFilter && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4" />
                Ajouter une pièce
              </Button>
            )}
          </Card>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {pieces.map((piece) => (
            <PieceCardWrapper
              key={piece.id}
              piece={piece}
              onClick={() => handlePieceClick(piece.id)}
              onEdit={() => handleEdit(piece)}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {pieces.map((piece) => (
            <PieceListItemWrapper
              key={piece.id}
              piece={piece}
              onClick={() => handlePieceClick(piece.id)}
              onEdit={() => handleEdit(piece)}
            />
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <PieceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPiece(null);
        }}
        piece={editingPiece}
        onSave={handleSave}
        isLoading={createPiece.isPending || updatePiece.isPending}
      />
    </motion.div>
  );
}

