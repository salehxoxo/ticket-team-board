import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, User, Edit3, AlertTriangle } from "lucide-react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils"; 
import { differenceInDays } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void; 
  canEdit?: boolean;
  statusMeta: { name: string; color: string }; // extend if needed
}

const priorityConfig = {
  low: { 
    label: 'Low', 
    className: 'bg-priority-low text-priority-low-foreground border-priority-low'
  },
  medium: { 
    label: 'Medium', 
    className: 'bg-priority-medium text-priority-medium-foreground border-priority-medium'
  },
  high: { 
    label: 'High', 
    className: 'bg-priority-high text-priority-high-foreground border-priority-high'
  },
  urgent: { 
    label: 'Urgent', 
    className: 'bg-priority-urgent text-priority-urgent-foreground border-priority-urgent animate-pulse'
  }
};

export function TaskCard({ task, onEdit, onView, canEdit = true, statusMeta }: TaskCardProps) {
  const daysUntilDue = differenceInDays(task.endDate, new Date());
  const isOverdue = daysUntilDue < 0 && task.status !== 'done';
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0 && task.status !== 'done';
  console.log("TaskCard rendered", { onView });
  console.log("TaskCard rendered", { onEdit });
  return (
    <Card onClick={() => onView(task)} className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-card via-card to-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{task.name}</h3>
            {/* {(isOverdue || isDueSoon) && (
                <AlertTriangle className={cn("h-3 w-3 flex-shrink-0", 
                  isOverdue ? "text-destructive" : "text-orange-500"
                )} /> 
              )} */}
          </div>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="ml-2 h-5 w-5 p-0 hover:bg-primary/10"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium border",
              // Apply backend color dynamically
            )}
            style={{
              backgroundColor: `${statusMeta.color}20`, // lighter background
              // color: statusMeta.color,                  // text color
              borderColor: statusMeta.color,            // border
            }}
          >
            {statusMeta.name}
          </Badge>

          <Badge variant="outline" className={cn("text-xs font-medium", priorityConfig[task.priority].className)}>
            {priorityConfig[task.priority].label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-xs text-muted-foreground">Project:</span>
            <span className="text-xs font-medium text-foreground truncate">{task.project}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-xs text-muted-foreground">Due Date:</span>
              <span className={cn("text-sm font-medium", 
                                      isOverdue ? "text-destructive" : isDueSoon ? "text-orange-500" : "text-foreground"
                                    )}>
              {task.endDate.toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="text-xs">Reporter:</span>
            <span className="text-xs font-medium text-foreground">{task.assignor}</span>
          </div>
          
          {task.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-4 w-4">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee}`} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {task.assignee.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground">{task.assignee}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}