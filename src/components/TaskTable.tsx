import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskPriority, KanbanColumn, Column } from "@/types/task";
import { Edit, Search, ArrowUpDown, AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  canEdit?: boolean;
  columns: Column[];
  onView: (task: Task) => void;
}

type SortField = 'name' | 'status' | 'priority' | 'endDate' | 'project';
type SortDirection = 'asc' | 'desc';

// const statusConfig = {
//   todo: { 
//     label: 'To Do', 
//     className: 'bg-status-todo text-status-todo-foreground'
//   },
//   'in-progress': { 
//     label: 'In Progress', 
//     className: 'bg-status-in-progress text-status-in-progress-foreground'
//   },
//   review: { 
//     label: 'Review', 
//     className: 'bg-status-review text-status-review-foreground'
//   },
//   done: { 
//     label: 'Done', 
//     className: 'bg-status-done text-status-done-foreground'
//   }
// };

const priorityConfig = {
  low: { 
    label: 'Low', 
    className: 'bg-priority-low text-priority-low-foreground'
  },
  medium: { 
    label: 'Medium', 
    className: 'bg-priority-medium text-priority-medium-foreground'
  },
  high: { 
    label: 'High', 
    className: 'bg-priority-high text-priority-high-foreground'
  },
  urgent: { 
    label: 'Urgent', 
    className: 'bg-priority-urgent text-priority-urgent-foreground animate-pulse'
  }
};

export function TaskTable({ tasks, onEditTask, onView, canEdit = true, columns }: TaskTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [sortField, setSortField] = useState<SortField>('endDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase()) ||
                           task.description.toLowerCase().includes(search.toLowerCase()) ||
                           task.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { 'low': 0, 'medium': 1, 'high': 2, 'urgent': 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'endDate':
          aValue = a.endDate.getTime();
          bValue = b.endDate.getTime();
          break;
        case 'project':
          aValue = a.project.toLowerCase();
          bValue = b.project.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, search, statusFilter, priorityFilter, sortField, sortDirection]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTasks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </Button>
  );

    const getStatusColor = (status: string) => {
  const col = columns.find((c) => c.name === status);
  return col?.color || "#6b7280"; // default gray if not found
};

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* <Select value={statusFilter} onValueChange={(value: string | "all") => setStatusFilter(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select> */}

        <Select
        value={statusFilter}
        onValueChange={(value: string | "all") => setStatusFilter(value)}
        >
        <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {columns.map((col) => (
            <SelectItem key={col.id} value={col.name}>
                {col.name}
            </SelectItem>
            ))}
        </SelectContent>
    </Select>


        <Select value={priorityFilter} onValueChange={(value: TaskPriority | "all") => setPriorityFilter(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="name">Task</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="status">Status</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="priority">Priority</SortButton>
              </TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>
                <SortButton field="project">Project</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="endDate">Due Date</SortButton>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No tasks found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => { 
                const daysUntilDue = differenceInDays(task.endDate, new Date());
                const isOverdue = daysUntilDue < 0 && task.status !== 'done';
                const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0 && task.status !== 'done';
                
                return (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.name}</span>
                          {(isOverdue || isDueSoon) && (
                            <AlertTriangle className={cn("h-3 w-3", 
                              isOverdue ? "text-destructive" : "text-orange-500"
                            )} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                        {/* <Badge variant="outline" className="text-xs">
                          {task.id}
                        </Badge> */}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* <Badge className={cn("text-xs", statusConfig[task.status].className)}>
                        {statusConfig[task.status].label}
                      </Badge> */}

                      <Badge
                        style={{
                          backgroundColor: `${getStatusColor(task.status)}43`,
                          color: 'black',
                        }}
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", priorityConfig[task.priority].className)}>
                        {priorityConfig[task.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee}`} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{task.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{task.project}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-sm font-medium", 
                        isOverdue ? "text-destructive" : isDueSoon ? "text-orange-500" : "text-foreground"
                      )}>
                        {task.endDate.toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(task)}
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTasks.length)} of {filteredAndSortedTasks.length} tasks
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
                if (totalPages <= 5) {
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
                }
                return null;
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