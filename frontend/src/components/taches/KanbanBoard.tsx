import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import type { Tache, StatutTache } from '@/types/tache';
import { KANBAN_COLUMNS } from '@/types/tache';
import { useMoveTache } from '@/hooks/useTaches';

interface KanbanBoardProps {
  taches: Tache[];
  onCardClick: (tache: Tache) => void;
  onAddClick: (statut: StatutTache) => void;
}

export function KanbanBoard({ taches, onCardClick, onAddClick }: KanbanBoardProps) {
  const moveTache = useMoveTache();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside
    if (!destination) return;

    // Same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatut = destination.droppableId as StatutTache;
    
    moveTache.mutate({
      tacheId: draggableId,
      newStatut,
      newOrdre: destination.index,
    });
  };

  // Grouper les tâches par statut
  const tachesByStatut = KANBAN_COLUMNS.reduce((acc, statut) => {
    acc[statut] = taches.filter(t => t.statut === statut);
    return acc;
  }, {} as Record<StatutTache, Tache[]>);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {KANBAN_COLUMNS.map((statut) => (
          <KanbanColumn
            key={statut}
            statut={statut}
            taches={tachesByStatut[statut]}
            onCardClick={onCardClick}
            onAddClick={() => onAddClick(statut)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

