import { useEffect, useMemo, useState } from "react";
import { Column, Task, User} from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onView: (task: Task) => void;
  currentUser: User;
  onStatusChange: (taskId: string, newStatus: string) => void;
  columns: Column[]; // pass columns as a prop
}

export function KanbanBoard({
  tasks,
  onEditTask,
  onView,
  currentUser,
  onStatusChange,
  columns, // use the passed columns prop
}: KanbanBoardProps) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

useEffect(() => {
  if (columns.length > 0 && visibleColumns.length === 0) {
    setVisibleColumns(columns.map((c) => c.name));
  }
}, [columns]);


  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.name] = tasks.filter((task) => task.status === column.name);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, columns]);

  const canEditTask = (task: Task) => {
    if (["manager", "admin"].includes(currentUser.role)) return true;
    if (currentUser.role === "developer") return true;
    return false;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId as string;
    onStatusChange(draggableId, newStatus);
  };

  return (
    
    <DragDropContext onDragEnd={handleDragEnd}>



      <div className="flex flex-wrap gap-2 mb-4">
        {columns.map((col) => (
          <Badge
            key={col.name}
            variant={visibleColumns.includes(col.name) ? "default" : "secondary"}
            className="cursor-pointer select-none"
            onClick={() => {
              setVisibleColumns((prev) =>
                prev.includes(col.name)
                  ? prev.filter((c) => c !== col.name) // hide if visible
                  : [...prev, col.name]               // show if hidden
              );
            }}
          >
            {col.name}
          </Badge>
        ))}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {columns
        .filter((col) => visibleColumns.includes(col.name))
        .map((column) => {
          const columnTasks = tasksByStatus[column.name] || [];

          return (
            <Droppable key={column.name} droppableId={column.name}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex flex-col rounded-lg border-2 border-dashed p-4 h-[80vh]"
                  )}
                   style={{ borderColor: column.color, backgroundColor: `${column.color}20`}}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        {column.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {column.description}
                    </p>
                  </div>

                  <div className="flex-1 overflow-x-hidden overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    {columnTasks.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        No tasks in {column.name.toLowerCase()}
                      </div>
                    ) : (
                      columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(providedDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                onEdit={onEditTask}
                                onView={onView}
                                canEdit={canEditTask(task)}
                                statusMeta={column}   // pass the column info (color, title, etc.)
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
