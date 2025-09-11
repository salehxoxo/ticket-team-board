import { useState } from "react";
import { FolderKanban, List, BarChart3, FileBarChart, Users, Folder, Package, Calendar, Activity, Layers } from "lucide-react";
import {
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/types/task";

interface TaskSidebarProps {
  currentUser: { role: string };
  activeTab: string;
  onTabChange: (tab: string) => void;
  roles: UserRole[];
}

export function TaskSidebar({ currentUser, activeTab, onTabChange, roles }: TaskSidebarProps) {
  const baseItems = [
    { title: "Kanban", value: "kanban", icon: FolderKanban },
    { title: "List", value: "list", icon: List },
    // { title: "Stats", value: "stats", icon: BarChart3 },
    { title: "Stats", value: "reports", icon: BarChart3 },
    { title: "Report", value: "hourlyreport", icon: FileBarChart }
  ];

  const managerAdminItems = [
    { title: "Users", value: "users", icon: Users },
    { title: "Projects", value: "projects", icon: Folder },
    { title: "Products", value: "products", icon: Package },
    { title: "Statuses", value: "status", icon: Activity },
    { title: "Roles", value: "roles", icon: Layers },
    { title: "Full Report", value: "fullreport", icon: Layers },
  ];

  const finalItems = [
    { title: "Holidays", value: "holidays", icon: Calendar },
  ];

  const userRole = roles.find(r => r.name === currentUser.role);

  const items = [
    ...baseItems,
    ...(userRole?.isManager ? managerAdminItems : []),
    ...finalItems,
  ];


  const getNavCls = (isActive: boolean) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-primary font-medium"
      : "hover:bg-sidebar-accent/50";

  return (
    <>
      {/* Place trigger anywhere you want (header/top bar) */}
      {/* <div className="p-2 border-b">
        <SidebarTrigger />
      </div> */}

      {/* Sidebar itself */}
      <Sidebar collapsible="icon">
        <div className="p-2 border-b">
          <SidebarTrigger />
        </div>
        <SidebarContent>
          <SidebarGroup>
            {/* <SidebarGroupLabel>Task Management</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.value)}
                      className={getNavCls(activeTab === item.value)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}