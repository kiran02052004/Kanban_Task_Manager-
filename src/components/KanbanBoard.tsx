import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { BoardData, Task, Column } from '@/src/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { ColumnModal } from './ColumnModal';
import { ConfirmModal } from './ConfirmModal';
import { Button } from './ui/Button';
import { Plus, Layout } from 'lucide-react';

const initialData: BoardData = {
  tasks: {},
  columns: {
    'todo': {
      id: 'todo',
      title: 'To Do',
      taskIds: [],
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      taskIds: [],
    },
    'done': {
      id: 'done',
      title: 'Done',
      taskIds: [],
    },
    'delivered': {
      id: 'delivered',
      title: 'Delivered',
      taskIds: [],
    },
  },
  columnOrder: ['todo', 'in-progress', 'done', 'delivered'],
};

export const KanbanBoard: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isClearBoardModalOpen, setIsClearBoardModalOpen] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('kanban-board-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure new columns from initialData are present in saved data
        const mergedColumns = { ...initialData.columns, ...parsedData.columns };
        // Ensure new columns are added to the order
        const mergedOrder = Array.from(new Set([...parsedData.columnOrder, ...initialData.columnOrder]));
        
        setBoardData({
          ...parsedData,
          columns: mergedColumns,
          columnOrder: mergedOrder,
        });
      } catch (error) {
        console.error('Failed to parse board data:', error);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('kanban-board-data', JSON.stringify(boardData));
  }, [boardData]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(boardData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      setBoardData((prev) => ({
        ...prev,
        columnOrder: newColumnOrder,
      }));
      return;
    }

    const startColumn = boardData.columns[source.droppableId];
    const finishColumn = boardData.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setBoardData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    setBoardData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  };

  const handleAddTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setActiveColumnId(null);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;

    setBoardData((prev) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskToDelete];

      const newColumns = { ...prev.columns };
      for (const columnId in newColumns) {
        newColumns[columnId] = {
          ...newColumns[columnId],
          taskIds: newColumns[columnId].taskIds.filter((id) => id !== taskToDelete),
        };
      }

      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns,
      };
    });
    setTaskToDelete(null);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      // Edit existing task
      setBoardData((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [editingTask.id]: { ...editingTask, ...taskData } as Task,
        },
      }));
    } else {
      // Create new task
      const newTaskId = uuidv4();
      const newTask: Task = {
        id: newTaskId,
        title: taskData.title || 'Untitled',
        description: taskData.description || '',
        priority: taskData.priority || 'Medium',
        createdAt: new Date().toISOString(),
      };

      const targetColumnId = activeColumnId || 'todo';

      setBoardData((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTaskId]: newTask,
        },
        columns: {
          ...prev.columns,
          [targetColumnId]: {
            ...prev.columns[targetColumnId],
            taskIds: [...prev.columns[targetColumnId].taskIds, newTaskId],
          },
        },
      }));
    }
    setIsModalOpen(false);
  };

  const handleAddColumn = () => {
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = (title: string) => {
    const newColumnId = uuidv4();
    const newColumn: Column = {
      id: newColumnId,
      title,
      taskIds: [],
    };

    setBoardData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...prev.columnOrder, newColumnId],
    }));
    setIsColumnModalOpen(false);
  };

  const handleResetBoard = () => {
    setIsClearBoardModalOpen(true);
  };

  const confirmResetBoard = () => {
    setBoardData(initialData);
    localStorage.removeItem('kanban-board-data');
    setIsClearBoardModalOpen(false);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-indigo-600 p-2 text-white">
            <Layout className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Kanban Task Manager
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={handleResetBoard} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Clear Board
          </Button>
          <Button variant="secondary" onClick={handleAddColumn}>
            Add Column
          </Button>
          <Button onClick={() => handleAddTask('todo')}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div
                className="flex h-full space-x-6"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {boardData.columnOrder.map((columnId, index) => {
                  const column = boardData.columns[columnId];
                  const tasks = column.taskIds
                    .map((taskId) => boardData.tasks[taskId])
                    .filter((task): task is Task => task !== undefined);

                  return (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      tasks={tasks}
                      index={index}
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          initialTask={editingTask}
        />
      )}
      
      {isColumnModalOpen && (
        <ColumnModal
          isOpen={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          onSave={handleSaveColumn}
        />
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteTask}
        onClose={() => setTaskToDelete(null)}
      />

      <ConfirmModal
        isOpen={isClearBoardModalOpen}
        title="Clear Board"
        message="Are you sure you want to clear all tasks? This action cannot be undone."
        confirmText="Clear All"
        onConfirm={confirmResetBoard}
        onClose={() => setIsClearBoardModalOpen(false)}
      />
    </div>
  );
};
