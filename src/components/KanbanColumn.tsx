import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, Column } from '@/src/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/src/lib/utils';
import { Plus, GripHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  index: number;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  index,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "flex h-full w-80 shrink-0 flex-col rounded-xl bg-gray-100/50 border border-gray-200 transition-shadow",
            snapshot.isDragging ? "shadow-xl ring-2 ring-indigo-500/50 rotate-1" : ""
          )}
        >
          <div
            {...provided.dragHandleProps}
            className="group flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/50 rounded-t-xl backdrop-blur-sm cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center">
              <GripHorizontal className="mr-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {column.title}
                <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  {tasks.length}
                </span>
              </h2>
            </div>
            <button
              onClick={() => onAddTask(column.id)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              aria-label="Add task"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'flex-1 overflow-y-auto p-3 transition-colors scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
                  snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
                )}
              >
                {tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};
