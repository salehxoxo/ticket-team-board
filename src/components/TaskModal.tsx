import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task, TaskFormData, TaskPriority, User, UserRole, Project, Holiday, KanbanColumn, Column } from "@/types/task";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Save, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDateRangeWithin, calculateEstimatedHours, calculateBusinessDays } from "@/lib/business-days";
import { Portal } from "@radix-ui/react-portal";


interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  currentUser: User;
  availableUsers: User[];
  availableProjects: Project[];
  holidays: Holiday[];
  isCreating?: boolean;
  isSaving?: boolean;
  columns: Column[]; // pass columns as a prop
}

const statusOptions: { value: string; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' }
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export function TaskModal({
  task,
  isOpen,
  onClose,
  onSave,
  currentUser,
  availableUsers,
  availableProjects,
  holidays,
  isCreating = false,
  isSaving = false,
  columns
}: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    projectId: availableProjects[0]?.id || '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    estimatedHours: 0
  });

  const [errors, setErrors] = useState<Partial<TaskFormData>>({});

  useEffect(() => {
    if (formData.startDate && formData.endDate && formData.endDate >= formData.startDate) {
      const estimatedHours = calculateEstimatedHours(formData.startDate, formData.endDate, holidays);
      setFormData(prev => ({ ...prev, estimatedHours }));
    }
  }, [formData.startDate, formData.endDate, holidays]);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId || null, //giving name rn cz dont hv ID
        projectId: task.projectId,  // Assuming task.project is a string ID even tho its a name ( I DONT HAVE ID),
        startDate: task.startDate,
        endDate: task.endDate,
        estimatedHours: task.estimatedHours
      });
    } else if (isCreating) {
      const defaultStartDate = new Date();
      const defaultEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      setFormData({
        name: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigneeId: null,
        projectId: availableProjects[0]?.id || '',
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        estimatedHours: 8
      });
    }
    setErrors({});
  }, [task, isCreating, isOpen]);

  const canEditAllFields = ['manager', 'admin'].includes(currentUser.role);
  const canEditLimitedFields = currentUser.role === 'developer';

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSave = () => {
  //   if (!validateForm()) return;
  //   onSave(formData);
  //   onClose();
  // };


  const handleSave = () => {
    if (!validateForm()) return;

    // ✅ validate date range before closing
    const selectedProject = availableProjects.find(p => p.id === formData.projectId);
    if (
      selectedProject &&
      !isDateRangeWithin(
        formData.startDate,
        formData.endDate,
        selectedProject.startDate,
        selectedProject.endDate
      )
    ) {
      // you already show a toast elsewhere, so just stop here
      return; // don't close the dialog
    }

    onSave(formData);
    onClose(); // only close if everything is valid
  };


  const canEdit = (field: keyof TaskFormData): boolean => {
    if (canEditAllFields) return true;
    if (canEditLimitedFields && (field === 'status' || field === 'assigneeId')) return true;
    return false;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreating ? 'Create New Task' : 'Edit Task'}
            {task && (
              <Badge variant="outline" className="ml-auto">
                ID: {task.id}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Task Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={!canEdit('name')}
              className={cn(errors.name && "border-destructive")}
              placeholder="Enter task name..."
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={!canEdit('description')}
              className={cn("min-h-[100px]", errors.description && "border-destructive")}
              placeholder="Describe the task in detail..."
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              disabled={!canEdit('projectId')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="space-y-1">
                      <div className="font-medium">{project.name}</div>
                      {/* <div className="text-sm text-muted-foreground">{project.description}</div> */}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
                disabled={!canEdit('status')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* {columns.length === 0 ? (
                  <SelectItem value="loading" disabled>
                    Loading statuses...
                  </SelectItem>
                ) : (
                  columns.map(option => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))
                )} */}

                  {
                    columns.map(option => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))
                  }

                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
                disabled={!canEdit('priority')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          option.value === 'low' && "bg-priority-low",
                          option.value === 'medium' && "bg-priority-medium",
                          option.value === 'high' && "bg-priority-high",
                          option.value === 'urgent' && "bg-priority-urgent"
                        )} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assignee</Label>
            <Select
              value={formData.assigneeId || 'unassigned'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value === 'unassigned' ? null : value }))}
              disabled={!canEdit('assigneeId')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reporter (read-only) */}
          {task && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Reporter</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignor}`} />
                  <AvatarFallback className="text-xs">
                    {task.assignor.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{task.assignor}</span>
                <Badge variant="outline" className="text-xs">
                  {task.assignorRole}
                </Badge>
              </div>
            </div>
          )}

          {/* Date Range and Hours */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                    disabled={!canEdit('startDate')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      if (date) {
                        // Validate against project dates
                        const selectedProject = availableProjects.find(p => p.id === formData.projectId);
                        if (selectedProject) {
                          if (!isDateRangeWithin(date, formData.endDate, selectedProject.startDate, selectedProject.endDate)) {
                            // Show warning but allow the change
                            console.warn('Task dates should be within project range');
                          }
                        }
                        setFormData(prev => ({ ...prev, startDate: date }));
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                    disabled={!canEdit('endDate')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      if (date) {
                        // Validate against project dates
                        const selectedProject = availableProjects.find(p => p.id === formData.projectId);
                        if (selectedProject) {
                          if (!isDateRangeWithin(formData.startDate, date, selectedProject.startDate, selectedProject.endDate)) {
                            // Show warning but allow the change
                            console.warn('Task dates should be within project range');
                          }
                        }
                        setFormData(prev => ({ ...prev, endDate: date }));
                      }
                    }}
                    disabled={(date) => date < formData.startDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="hours" className="text-sm font-medium">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                disabled={!canEdit('estimatedHours')}
                placeholder="Enter hours"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="estimatedHours" className="text-sm font-medium">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                readOnly
                className="bg-muted"
                placeholder="Calculated automatically"
              />
              <span className="text-sm text-muted-foreground">
                Based on {calculateBusinessDays(formData.startDate, formData.endDate, holidays)} working days
              </span>
            </div>
          </div>

          {/* Project date validation warning */}
          {(() => {
            const selectedProject = availableProjects.find(p => p.id === formData.projectId);
            if (selectedProject && !isDateRangeWithin(formData.startDate, formData.endDate, selectedProject.startDate, selectedProject.endDate)) {
              return (
                <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Error:</strong> Task dates should be within project range ({format(selectedProject.startDate, "PPP")} - {format(selectedProject.endDate, "PPP")})
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Role-based permissions notice */}
          {!canEditAllFields && (
            <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Developer Role:</strong> You can only edit Status and Assignee fields.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-current" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : (isCreating ? 'Create Task' : 'Save Changes')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}