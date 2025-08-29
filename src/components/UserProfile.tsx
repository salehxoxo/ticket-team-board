import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Lock, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
// import { toast } from "sonner";
import { User } from "@/types/task";
import { HttpClient } from "@/api/communicator";
// import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/hooks/use-toast";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ user, isOpen, onClose }: ProfileModalProps) {

      const { toast } = useToast();
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  const handleChangePassword = async () => {
  const newErrors: { [key: string]: string } = {};

  if (!passwordData.currentPassword) {
    newErrors.currentPassword = "Current password is required";
  }
  if (!passwordData.newPassword) {
    newErrors.newPassword = "New password is required";
  } else if (passwordData.newPassword.length < 6) {
    newErrors.newPassword = "Password must be at least 6 characters";
  }
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  setIsSaving(true);
  try {
    const ChangePasswordDto = {
      id: user.id,
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    };

    const response = await HttpClient.POST<Boolean>(`/api/User/change-password`, ChangePasswordDto);

    if (!response.isError && response.data) {
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated. Please log in again.",
      });

      // Reset form state
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});


      // Show confirmation prompt before logging out
      const confirmed = window.confirm(
        "Your password has been updated. You will now be logged out for security reasons. Click OK to continue."
      );

      if (confirmed) {
        localStorage.removeItem('token');
    localStorage.removeItem("user");
    window.location.href = '/login';
      }

      return;
    }

    // toast.error("Failed to change password. Please try again.");
    toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
      });
  } catch (error) {
    // toast.error("An unexpected error occurred.");
    toast({
        title: "Error",
        description: "An unexpected error occurred.",
      });
  } finally {
    setIsSaving(false);
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                    <AvatarFallback className="text-lg">
                      {user.full_name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{user.full_name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div>
                    <Label>User ID</Label>
                    <p className="text-sm">{user.id}</p>
                  </div>
                  <div>
                    <Label>Created At</Label>
                    <p className="text-sm">{user.created_at}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PASSWORD TAB (unchanged) */}
          <TabsContent value="password" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password that includes uppercase and lowercase letters, numbers, and special characters.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                  className={cn(errors.currentPassword && "border-destructive")}
                />
                {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                  className={cn(errors.newPassword && "border-destructive")}
                />
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={cn(errors.confirmPassword && "border-destructive")}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={isSaving}>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-current" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
