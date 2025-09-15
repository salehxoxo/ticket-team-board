import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2, GripVertical } from "lucide-react";
import { Column } from "@/types/task";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface StatusTableProps {
  statuses: Column[];
  onEditStatus: (status: Column) => void;
  onDeleteStatus: (status: Column) => void;
  onReorderStatuses: (statuses: Column[]) => void; // new prop for saving order
}

export function StatusTable({ statuses, onEditStatus, onDeleteStatus, onReorderStatuses }: StatusTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 🔎 Filtering only
  const filteredStatuses = useMemo(() => {
    return statuses.filter((status) =>
      [status.name, status.description].some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [statuses, search]);

  const paginatedStatuses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStatuses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStatuses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredStatuses.length / itemsPerPage);

  // 🔄 Handle Drag End
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(filteredStatuses);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Reassign sortOrder sequentially
    const withSortOrder = reordered.map((status, idx) => ({
      ...status,
      sortOrder: idx + 1,
    }));

    console.log("Reordered Statuses:", withSortOrder);

    onReorderStatuses(withSortOrder);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search statuses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table with Drag & Drop */}
      <div className="border rounded-lg">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="statuses">
            {(provided) => (
              <Table ref={provided.innerRef} {...provided.droppableProps}>
                <TableHeader>
                  <TableRow>

                    <TableHead>Status Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStatuses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No statuses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStatuses.map((status, index) => (
                      <Draggable
                        key={status.id}
                        draggableId={status.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`hover:bg-muted/50 ${snapshot.isDragging ? "bg-muted" : ""
                              }`}
                          >
                            {/* <TableCell> */}
                            {/* <GripVertical className="h-4 w-4 text-muted-foreground" /> */}
                            {/* </TableCell> */}
                            <TableCell>
                              <span className="inline-flex items-center gap-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                {status.name}
                              </span>
                            </TableCell>
                            <TableCell>{status.description}</TableCell>
                            <TableCell>{status.sortOrder}</TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                              {["todo", "in-progress", "done"].includes(status.name.toLowerCase()) ? (
                                // 🔒 No edit/delete for primary statuses
                                <span className="text-sm text-muted-foreground italic">Locked</span>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditStatus(status)}
                                  >
                                    <Edit className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteStatus(status)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredStatuses.length)} of{" "}
            {filteredStatuses.length} statuses
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
