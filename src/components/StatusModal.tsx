import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Column } from "@/types/task";

export interface StatusFormData {
  name: string;
  description: string;
  color: string; // hex color code (#RRGGBB)
}

interface StatusModalProps {
  status: Column | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (statusData: StatusFormData) => void;
  isCreating?: boolean;
  isSaving?: boolean;
}

export function StatusModal({
  status,
  isOpen,
  onClose,
  onSave,
  isCreating,
  isSaving = false,
}: StatusModalProps) {
  const [formData, setFormData] = useState<StatusFormData>({
    name: "",
    description: "",
    color: "#000000", // default black
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (status && !isCreating) {
        setFormData({
          name: status.name,
          description: status.description,
          color: status.color || "#000000",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          color: "#000000",
        });
      }
      setErrors({});
    }
  }, [isOpen, status, isCreating]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Status name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Status description is required";
    }

    if (!formData.color.trim() || !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = "A valid color code is required (e.g. #FF0000)";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Create New Status" : "Edit Status"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Enter the details for the new status."
              : "Update the status details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Status Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter status name"
              disabled={isSaving}
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name}</span>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter status description"
              disabled={isSaving}
              rows={3}
            />
            {errors.description && (
              <span className="text-sm text-destructive">
                {errors.description}
              </span>
            )}
          </div>

          {/* Color */}
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              disabled={isSaving}
              className="h-10 w-16 p-1 cursor-pointer"
            />
            {errors.color && (
              <span className="text-sm text-destructive">{errors.color}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : null}
            {isCreating ? "Create Status" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
