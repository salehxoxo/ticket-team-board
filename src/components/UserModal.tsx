import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Manager, User, UserRole } from "@/types/task";
import { Save, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserFormData {
  name: string;
  full_name: string;
  email: string;
  password: string;
  role: string;
  managerId: string | null;
}

interface UserModalProps {
  user: User | null;
  roles: UserRole[];
  managers: Manager[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  isCreating?: boolean;
  isSaving?: boolean;
}

// const roleOptions: { value: UserRole; label: string }[] = [
//   { value: 'manager', label: 'Manager' },
//   { value: 'developer', label: 'Developer' },
//   { value: 'admin', label: 'Admin' }
// ];

export function UserModal({
  user,
  roles,
  managers,
  isOpen,
  onClose,
  onSave,
  isCreating = false,
  isSaving = false
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    name: '',
    email: '',
    password: '',
    role: 'developer',
    managerId: null
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        name: user.name,
        email: user.email,
        password: '', // Password should not be pre-filled
        role: user.role,
        managerId: user.managerId || null
      });
    } else if (isCreating) {
      setFormData({
        full_name: '',
        name: '',
        email: '',
        password: '',
        role: 'developer',
        managerId: null
      });
    }
    setErrors({});
  }, [user, isCreating, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }


    // Manager validation
    if (!formData.managerId) {
      newErrors.managerId = 'Please select a manager (or choose None explicitly)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreating ? 'Create New User' : 'Edit User'}
            {user && (
              <Badge variant="outline" className="ml-auto">
                ID: {user.id}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Preview */}
          {user && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                <AvatarFallback className="text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="outline">
                {user.role}
              </Badge>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className={cn(errors.full_name && "border-destructive")}
              placeholder="Enter full name..."
            />
            {errors.full_name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.full_name}
              </p>
            )}
          </div>

          {/* UserName */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Username *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={cn(errors.name && "border-destructive")}
              placeholder="Enter username..."
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>


          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={cn(errors.email && "border-destructive")}
              placeholder="Enter email address..."
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password *
            </Label>
            <Input
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={cn(errors.password && "border-destructive")}
              placeholder="Enter password..."
            />
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.name}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        role.name === 'manager' ? "bg-blue-500" :
                          role.name === 'admin' ? "bg-green-500" :
                            "bg-gray-500"
                      )} />
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>

            </Select>
          </div>

          {/* Manager */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Manager *</Label>
            <Select
              value={formData.managerId ?? ""}
              onValueChange={(value: string) =>
                setFormData(prev => ({ ...prev, managerId: value }))
              }
            >
              <SelectTrigger className={cn(errors.managerId && "border-destructive")}>
                <SelectValue placeholder="Select a manager..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {/* Explicit "None" option */}
                <SelectItem value="0">None</SelectItem>

                {managers.map(m => (
                  <SelectItem key={m.managerId} value={m.managerId}>
                    {m.managerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Error for not selecting anything */}
            {errors.managerId && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.managerId}
              </p>
            )}

            {/* Warning if 'None' is selected */}
            {/* {formData.managerId === "0" && (
              <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                User with no manager will be considered a manager themselves.
              </p>
            )} */}
          </div>







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
            {isSaving ? 'Saving...' : (isCreating ? 'Create User' : 'Save Changes')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}