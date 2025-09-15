import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // import checkbox
import { UserRole } from "@/types/task";

export interface RoleFormData {
  name: string;
  isManager: boolean; // new field
}

interface RoleModalProps {
  role: UserRole | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: RoleFormData) => void;
  isCreating?: boolean;
  isSaving?: boolean;
}

export function RoleModal({
  role,
  isOpen,
  onClose,
  onSave,
  isCreating,
  isSaving = false,
}: RoleModalProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    isManager: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (role && !isCreating) {
        setFormData({
          name: role.name,
          isManager: role.isManager ?? false,
        });
      } else {
        setFormData({
          name: "",
          isManager: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, role, isCreating]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
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
            {isCreating ? "Create New Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Enter the details for the new role."
              : "Update the role details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter role name"
              disabled={isSaving}
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name}</span>
            )}
          </div>

          {/* Is Manager */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isManager"
              checked={formData.isManager}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isManager: checked === true,
                }))
              }
              disabled={isSaving}
            />
            <Label htmlFor="isManager">Is Manager</Label>
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
            {isCreating ? "Create Role" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
