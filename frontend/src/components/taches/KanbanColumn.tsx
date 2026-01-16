import { Droppable, Draggable, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';
import type { Tache, StatutTache } from '@/types/tache';
import { STATUT_TACHE_LABELS } from '@/types/tache';

interface KanbanColumnProps {
  statut: StatutTache;
  taches: Tache[];
  onCardClick: (tache: Tache) => void;
  onAddClick: () => void;
}

const columnHeaderColors: Record<StatutTache, string> = {
  A_FAIRE: 'border-l-surface-500',
  EN_COURS: 'border-l-primary-500',
  EN_ATTENTE: 'border-l-accent-500',
  TERMINE: 'border-l-green-500',
};

export function KanbanColumn({ statut, taches, onCardClick, onAddClick }: KanbanColumnProps) {
  const sortedTaches = [...taches].sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-t-xl bg-overlay/50 border-l-4',
        columnHeaderColors[statut]
      )}>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-primary">
            {STATUT_TACHE_LABELS[statut]}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-surface-700 text-xs text-tertiary">
            {taches.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1 rounded-lg hover-bg text-tertiary hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={statut}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2 rounded-b-xl bg-elevated/30 min-h-[200px] space-y-2 transition-colors',
              snapshot.isDraggingOver && 'bg-primary-500/5 border-2 border-dashed border-primary-500/30'
            )}
          >
            {sortedTaches.map((tache, index) => (
              <Draggable key={tache.id} draggableId={tache.id} index={index}>
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <KanbanCard
                      tache={tache}
                      onClick={() => onCardClick(tache)}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {taches.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-muted">
                <p className="text-sm">Aucune tâche</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

