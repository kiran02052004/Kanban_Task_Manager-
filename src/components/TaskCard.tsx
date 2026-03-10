import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Trash2, Edit, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'group mb-3 rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing',
            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50 rotate-2' : ''
          )}
          style={provided.draggableProps.style}
        >
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-gray-300">
                <GripVertical className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium border',
                  priorityColors[task.priority]
                )}
              >
                {task.priority}
              </span>
            </div>
            <div className="flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Edit task"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <h3 className="mb-1 font-semibold text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-3">{task.description}</p>
          <div className="mt-3 text-xs text-gray-400">
            {new Date(task.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </Draggable>
  );
};
