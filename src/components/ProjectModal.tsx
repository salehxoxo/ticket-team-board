import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Project, Holiday, Product } from "@/types/task";
import { calculateBusinessDays, calculateEstimatedHours } from "@/lib/business-days";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ProjectFormData {
  name: string;
  description: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  estimatedHours: number;
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  availableProducts: Product[];
  onClose: () => void;
  onSave: (projectData: ProjectFormData) => void;
  holidays: Holiday[];
  isCreating?: boolean;
  isSaving?: boolean;
}

export function ProjectModal({ project, isOpen, availableProducts, onClose, onSave, holidays, isCreating, isSaving = false }: ProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    productId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    estimatedHours: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (project && !isCreating) {
        setFormData({
          name: project.name,
          description: project.description,
          productId: project.productId,
          startDate: project.startDate,
          endDate: project.endDate,
          estimatedHours: project.estimatedHours
        });
      } else {
        setFormData({
          name: '',
          description: '',
          productId: '',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          estimatedHours: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, project, isCreating]);

  useEffect(() => {
    if (formData.startDate && formData.endDate && formData.endDate >= formData.startDate) {
      const estimatedHours = calculateEstimatedHours(formData.startDate, formData.endDate, holidays);
      setFormData(prev => ({ ...prev, estimatedHours }));
    }
  }, [formData.startDate, formData.endDate, holidays]);

  type ProjectFormErrors = {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    productId?: string;
  };

  const validateForm = (): boolean => {
    const newErrors: ProjectFormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Project description is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      if (formData.endDate <= formData.startDate) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (!formData.productId) {
      newErrors.productId = "Product selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Enter the details for the new project. The estimated hours will be calculated automatically based on working days.'
              : 'Update the project details. The estimated hours will be recalculated automatically.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Product */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Product *</Label>
          <Select
            value={formData.productId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
          // disabled={!canEdit('projectId')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product..." />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="space-y-1">
                    <div className="font-medium">{product.name}</div>
                    {/* <div className="text-sm text-muted-foreground">{product.description}</div> */}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.productId && <span className="text-sm text-destructive">{errors.productId}</span>}
        </div>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
              disabled={isSaving}
            />
            {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description"
              disabled={isSaving}
              rows={3}
            />
            {errors.description && <span className="text-sm text-destructive">{errors.description}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                disabled={isSaving}
              />
              {errors.startDate && (
                <span className="text-sm text-destructive">{errors.startDate}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate ? format(formData.endDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                disabled={isSaving}
                min={formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : undefined}
              />
              {errors.endDate && (
                <span className="text-sm text-destructive">{errors.endDate}</span>
              )}
            </div>

          </div>

          <div className="grid gap-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              value={formData.estimatedHours}
              readOnly
              className="bg-muted"
              placeholder="Will be calculated automatically"
            />
            <span className="text-sm text-muted-foreground">
              Based on {calculateBusinessDays(formData.startDate, formData.endDate, holidays)} working days
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : null}
            {isCreating ? 'Create Project' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}