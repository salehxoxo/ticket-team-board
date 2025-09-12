import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskModal } from "@/components/TaskModal";
import { UserModal, UserFormData } from "@/components/UserModal";
import { ProjectModal, ProjectFormData } from "@/components/ProjectModal";
import { ProductModal, ProductFormData } from "@/components/ProductModal";
import { Reports } from "@/components/Reports";
import { Task, TaskFormData, User, Project, Product, TaskPriority, UserRole, Holiday, HolidayFormData, Column, Manager } from "@/types/task";
import { HolidayModal } from "@/components/HolidayModal";
import { Plus, BarChart3, Calendar, Users, TrendingUp, UserPlus, Edit, Trash2, FolderPlus, LogOut, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HttpClient } from "@/api/communicator";
import { isDateRangeWithin } from "@/lib/business-days";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { TaskSidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskTable } from "@/components/TaskTable";
import { UserTable } from "@/components/UserTable";
import { ProjectTable } from "@/components/ProjectTable";
import { ProfileModal } from "@/components/UserProfile";
import { StatusFormData, StatusModal } from "@/components/StatusModal";
import { StatusTable } from "@/components/StatusTable";
import { RoleTable } from "@/components/RoleTable";
import { RoleFormData, RoleModal } from "@/components/RoleModal";
import TaskStats from "@/components/TaskStats";
import { ProductTable } from "@/components/ProductTable";
import { HolidayTable } from "@/components/HolidayTable";
import HourlyReport from "@/components/HourlyReport";
import { useDataFetching } from "@/hooks/useDataFetching";
import { start } from "repl";
import FullReport from "@/components/FullReport";



export default function Index() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "kanban";
  });

  // const [tasks, setTasks] = useState<Task[]>([]);
  // const [users, setUsers] = useState<User[]>([]);
  // const [projects, setProjects] = useState<Project[]>([]);
  // const [statuses, setStatuses] = useState<Column[]>([]);
  // const [products, setProducts] = useState<Product[]>([]);
  // const [roles, setRoles] = useState<UserRole[]>([]);
  // const [holidays, setHolidays] = useState<Holiday[]>([]);
  // const [managers, setManagers] = useState<Manager[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Column | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingStatus, setIsCreatingStatus] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCreatingHoliday, setIsCreatingHoliday] = useState(false);

  // Use the custom hook for data fetching
  const {
    tasks, setTasks,
    users, setUsers,
    projects, setProjects,
    statuses, setStatuses,
    products, setProducts,
    roles, setRoles,
    holidays, setHolidays,
    managers, setManagers,
    loading,
    error,
    refetch
  } = useDataFetching()

  // const [taskSearch, setTaskSearch] = useState("");
  // const [userSearch, setUserSearch] = useState("");
  // const [projectSearch, setProjectSearch] = useState("");
  // const [productSearch, setProductSearch] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);



  // whenever tab changes, save it
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  // Set current user on component mount
  useEffect(() => {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      setCurrentUser(JSON.parse(userString));
    }
  }, []);

  // const userRole = roles.find(r => r.name === currentUser.role);

  // useEffect(() => {

  //   const fetchData = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const userString = localStorage.getItem('user');

  //       if (!token || !userString) {
  //         console.warn("User not logged in");
  //         return;
  //       }

  //       const user = JSON.parse(userString);
  //       setCurrentUser(user);


  //       // Fetch tasks by user ID
  //       const taskResponse = await HttpClient.GET<Task[]>(`/api/Tasks/user/${user.id}`);
  //       if (!taskResponse.isError && taskResponse.data) {
  //         const convertedTasks = taskResponse.data.map(task => ({
  //           ...task,
  //           startDate: new Date(task.startDate),
  //           endDate: new Date(task.endDate),
  //           created_at: new Date(task.created_at),
  //           updated_at: new Date(task.updated_at),
  //           project_start: new Date(task.project_start),
  //           project_end: new Date(task.project_end)
  //         }));
  //         setTasks(convertedTasks);
  //       } else {
  //         console.error("Failed to fetch tasks:", taskResponse.message);
  //       }


  //       // Fetch all users
  //       const userResponse = await HttpClient.GET<User[]>('/api/User');
  //       if (!userResponse.isError && userResponse.data) {
  //         setUsers(userResponse.data);
  //       } else {
  //         console.error("Failed to fetch users:", userResponse.message);
  //       }


  //       // Fetch all projects
  //       const projectResponse = await HttpClient.GET<Project[]>('/api/Project');
  //       if (!projectResponse.isError && projectResponse.data) {
  //         const convertedProjects = projectResponse.data.map(project => ({
  //           ...project,
  //           startDate: new Date(project.startDate),
  //           endDate: new Date(project.endDate),
  //           createdAt: new Date(project.createdAt)
  //         }));
  //         setProjects(convertedProjects);
  //       } else {
  //         console.error("Failed to fetch projects:", projectResponse.message);
  //       }

  //       // Fetch all roles
  //       const roleResponse = await HttpClient.GET<UserRole[]>('/api/Role');
  //       if (!roleResponse.isError && roleResponse.data) {
  //         setRoles(roleResponse.data);
  //       } else {
  //         console.error("Failed to fetch roles:", roleResponse.message);
  //       }

  //       // Fetch all holidays
  //       const holidayResponse = await HttpClient.GET<Holiday[]>('/api/Holiday');
  //       if (!holidayResponse.isError && holidayResponse.data) {
  //         const convertedHolidays = holidayResponse.data.map(holiday => ({
  //           ...holiday,
  //           date: new Date(holiday.date),
  //         }));
  //         setHolidays(convertedHolidays);
  //       } else {
  //         console.error("Failed to fetch holidays:", holidayResponse.message);
  //       }


  //       // Fetch all products
  //       const productResponse = await HttpClient.GET<Product[]>('/api/Product');
  //       if (!productResponse.isError && productResponse.data) {
  //         setProducts(productResponse.data);
  //       } else {
  //         console.error("Failed to fetch products:", productResponse.message);
  //       }


  //       //fetch all statuses
  //       const statusResponse = await HttpClient.GET<Column[]>("/api/TasksStatus");
  //       if (!statusResponse.isError && statusResponse.data) {
  //         setStatuses(statusResponse.data);
  //       } else {
  //         console.error("Failed to fetch task statuses:", statusResponse.message);
  //       }

  //       //fetch managers
  //       const managerResponse = await HttpClient.GET<Manager[]>("/api/User/managers");
  //       if (!managerResponse.isError && managerResponse.data) {
  //         setManagers(managerResponse.data);
  //       } else {
  //         console.error("Failed to fetch managers:", managerResponse.message);
  //       }

  //     } catch (err) {
  //       console.error("Error fetching data:", err);
  //     }
  //   };

  //   fetchData();
  // }, [refreshKey]);


  // const taskStats = useMemo(() => {
  //   const total = tasks.length;
  //   const byStatus = tasks.reduce((acc, task) => {
  //     acc[task.status] = (acc[task.status] || 0) + 1;
  //     return acc;
  //   }, {} as Record<string, number>);

  //   const byPriority = tasks.reduce((acc, task) => {
  //     acc[task.priority] = (acc[task.priority] || 0) + 1;
  //     return acc;
  //   }, {} as Record<string, number>);

  //   return {
  //     total,
  //     byStatus,
  //     byPriority,
  //     assigned: tasks.filter(t => t.assignee).length,
  //     unassigned: tasks.filter(t => !t.assignee).length
  //   };
  // }, [tasks]);

  const priorityMap: Record<TaskPriority, number> = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'urgent': 4
  };

  //FOR TASK

  const handleCreateTask = () => {
    if (currentUser?.isManager === false) {
      toast({
        title: "Access Denied",
        description: "Only managers and admins can create new tasks.",
        variant: "destructive"
      });
      return;
    }

    setSelectedTask(null);
    setIsCreatingTask(true);
    setIsTaskModalOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {

    const draggedTask = tasks.find(t => t.id === taskId);

    const updatedTask = {
      id: draggedTask.id,
      title: draggedTask.name,
      description: draggedTask.description,
      status_Id: statuses.find((col) => col.name === newStatus)?.id,
      priority_Id: priorityMap[draggedTask.priority],
      project_Id: draggedTask.projectId,
      assignee_Id: draggedTask.assigneeId,
      startDate: draggedTask.startDate,
      endDate: draggedTask.endDate,
      estimatedHours: draggedTask.estimatedHours,
    };
    const response = await HttpClient.PUT<Task>(`/api/Tasks/${taskId}`, updatedTask);

    if (!response.isError && response.data) {
      const updateTask = {
        ...response.data,
        startDate: new Date(response.data.startDate),
        endDate: new Date(response.data.endDate),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        project_start: new Date(response.data.project_start),
        project_end: new Date(response.data.project_end)
      };
      setTasks(prev =>
        prev.map(task => task.id === updateTask.id ? updateTask : task)
      );
      toast({
        title: "Task updated successfully",
        description: `"${updateTask.name}" has been updated.`,
      });
    }
  };


  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsCreatingTask(false);
    setIsTaskModalOpen(true);
  };

  // const handleViewTask = (task: Task) => {
  //   const column = statuses.find(c => c.name === task.status);
  //   navigate(`/task/${task.id}`, { state: { task, column, holidays } }); // Your intended behavior
  // };

  const handleViewTask = (
    task: Task,
    search?: string,
    statusFilter?: string | "all",
    priorityFilter?: TaskPriority | "all"
  ) => {
    // stash filters before navigating
    // if(search || statusFilter || !priorityFilter) {
    if (search !== undefined) {
      sessionStorage.setItem("taskSearch", search);
      sessionStorage.setItem("taskStatusFilter", statusFilter);
      sessionStorage.setItem("taskPriorityFilter", priorityFilter);
    }

    // }
    const column = statuses.find(c => c.name === task.status);
    navigate(`/task/${task.id}`, { state: { task, column, holidays } });
  };



  const handleSaveTask = async (taskData: TaskFormData) => {

    console.log("handleSaveTask");

    // Date validation
    const selectedProject = projects.find(p => p.id === taskData.projectId);
    if (
      selectedProject &&
      !isDateRangeWithin(
        taskData.startDate,
        taskData.endDate,
        selectedProject.startDate,
        selectedProject.endDate
      )
    ) {
      toast({
        title: "Invalid task dates",
        description: `Task dates must be within project range (${format(selectedProject.startDate, "PPP")} - ${format(selectedProject.endDate, "PPP")})`,
        variant: "destructive",
      });
      return;
    }

    if (isCreatingTask) {
      // Creating a new task

      const newTask = {
        title: taskData.name,
        description: taskData.description,
        status_Id: statuses.find((col) => col.name === taskData.status)?.id,
        priority_Id: priorityMap[taskData.priority],
        project_Id: taskData.projectId,
        assignor_Id: currentUser.id, // the one creating the task
        assignee_Id: taskData.assigneeId,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        estimatedHours: taskData.estimatedHours,
      };


      const response = await HttpClient.POST<Task>('/api/Tasks', newTask);

      if (!response.isError && response.data) {
        const createdTask = {
          ...response.data,
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
          created_at: new Date(response.data.created_at),
          updated_at: new Date(response.data.updated_at),
          project_start: new Date(response.data.project_start),
          project_end: new Date(response.data.project_end)
        };

        setTasks(prev => [...prev, createdTask]); // No TS error here
        toast({
          title: "Task created successfully",
          description: `"${newTask.title}" has been created.`,
        })
      };
    } else if (selectedTask) {
      console.log("Editing existing task");


      const updatedTask = {
        id: selectedTask.id,
        title: taskData.name,
        description: taskData.description,
        status_Id: statuses.find((col) => col.name === taskData.status)?.id,
        priority_Id: priorityMap[taskData.priority],
        project_Id: taskData.projectId,
        assignee_Id: taskData.assigneeId,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        estimatedHours: taskData.estimatedHours,
      };
      const response = await HttpClient.PUT<Task>(`/api/Tasks/${selectedTask.id}`, updatedTask);

      if (!response.isError && response.data) {
        const updateTask = {
          ...response.data,
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
          created_at: new Date(response.data.created_at),
          updated_at: new Date(response.data.updated_at),
          project_start: new Date(response.data.project_start),
          project_end: new Date(response.data.project_end)
        };
        setTasks(prev =>
          prev.map(task => task.id === updateTask.id ? updateTask : task)
        );
        toast({
          title: "Task updated successfully",
          description: `"${updatedTask.title}" has been updated.`,
        });
      }
    }
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setIsCreatingTask(false);
  };


  //FOR USER
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreatingUser(true);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsCreatingUser(false);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    console.log("handleDeleteUser");
    if (user.id === currentUser.id) {
      toast({
        title: "Cannot delete current user",
        description: "You cannot delete the user you are currently logged in as.",
        variant: "destructive",
      });
      return;
    }

    const response = await HttpClient.DELETE<Project>(`/api/User/${user.id}`);

    if (!response.isError && response.data) {
      const deletedUser = response.data;
      setUsers(prev => prev.filter(p => p.id !== deletedUser.id));

      toast({
        title: "User deleted successfully",
        description: `"${deletedUser.name}" has been deleted.`,
      });
    }
  };

  const confirmDeleteUser = (user: User) => {
    handleDeleteUser(user);
  };

  const handleSaveUser = async (userData: UserFormData) => {

    const userPayload = {
      user_Name: userData.name,
      full_Name: userData.full_name,
      email: userData.email,
      password: userData.password,
      role_Id: roles.find(r => r.name === userData.role)?.id ?? null,
      managerId: userData.managerId === "0" ? null : userData.managerId
    };

    if (isCreatingUser) {
      console.log("creatingUser");

      // Create user
      const response = await HttpClient.POST<User>('/api/User', userPayload);

      if (!response.isError && response.data) {
        const createdUser = response.data;
        setUsers(prev => [...prev, createdUser]);
        toast({
          title: "User created successfully",
          description: `"${createdUser.name || userPayload.user_Name}" has been created.`,
        });
      }
    } else if (selectedUser) {
      console.log("updatingUser");
      //  Update user
      const response = await HttpClient.PUT<User>(`/api/User/${selectedUser.id}`, userPayload);

      if (!response.isError && response.data) {
        const updatedUser = response.data;
        setUsers(prev =>
          prev.map(user => user.id === updatedUser.id ? updatedUser : user)
        );
        toast({
          title: "User updated successfully",
          description: `"${updatedUser.name || userPayload.user_Name}" has been updated.`,
        });
      }
    }

    setRefreshKey(old => old + 1); // Trigger data refresh
    refetch() // Refetch data to get updated users

    // Cleanup
    setIsUserModalOpen(false);
    setSelectedUser(null);
    setIsCreatingUser(false);
  };


  //FOR PROJECT
  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsCreatingProject(true);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsCreatingProject(false);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = async (project: Project) => {

    console.log("handleDeleteProject");
    // Check if project has tasks
    // const projectTasks = tasks.filter(task => task.projectId === project.id);
    // if (projectTasks.length > 0) {
    //   toast({
    //     title: "Cannot delete project",
    //     description: `This project has ${projectTasks.length} task(s). Please reassign or delete them first.`,
    //     variant: "destructive",
    //   });
    //   return;
    // }


    const response = await HttpClient.DELETE<Project>(`/api/Project/${project.id}`);

    if (!response.isError && response.data) {
      const deletedProject = response.data;
      setProjects(prev => prev.filter(p => p.id !== deletedProject.id));

      toast({
        title: "Project deleted successfully",
        description: `"${deletedProject.name || project.name}" has been deleted.`,
      });
    } else {
      toast({
        title: "Error deleting project",
        description: response.message,
        variant: "destructive",
      });
    }

  };

  const confirmDeleteProject = (project: Project) => {
    handleDeleteProject(project);
  };

  const handleSaveProject = async (projectData: ProjectFormData) => {
    console.log("handleSaveProject");

    const projectPayload = {
      project_Name: projectData.name,
      description: projectData.description,
      productId: projectData.productId,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      estimatedHours: projectData.estimatedHours,
    };

    if (isCreatingProject) {

      console.log("creatingProject");

      // Create project
      const response = await HttpClient.POST<Project>('/api/Project', projectPayload);

      if (!response.isError && response.data) {
        const createdProject = {
          ...response.data,
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
          createdAt: new Date(response.data.createdAt),
        };
        setProjects(prev => [...prev, createdProject]);

        toast({
          title: "Project created successfully",
          description: `"${createdProject.name || projectPayload.project_Name}" has been created.`,
        });
      }

    } else if (selectedProject) {
      // Editing existing project

      console.log("updatingProject");

      // Update project
      const response = await HttpClient.PUT<Project>(`/api/Project/${selectedProject.id}`, projectPayload);

      if (!response.isError && response.data) {
        const updatedProject = {
          ...response.data,
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
          createdAt: new Date(response.data.createdAt),
        };
        setProjects(prev =>
          prev.map(project => project.id === updatedProject.id ? updatedProject : project)
        );

        toast({
          title: "Project updated successfully",
          description: `"${updatedProject.name || projectPayload.project_Name}" has been updated.`,
        });
      }

    }
    setIsProjectModalOpen(false);
    setSelectedProject(null);
    setIsCreatingProject(false);
  };




  // PRODUCT STUFF

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsCreatingProduct(true);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsCreatingProduct(false);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {

    console.log("handleDeleteProduct");
    // Check if project has tasks
    const Productprojects = projects.filter(project => project.productId === product.id);
    if (Productprojects.length > 0) {
      toast({
        title: "Cannot delete product",
        description: `This product has ${Productprojects.length} task(s). Please reassign or delete them first.`,
        variant: "destructive",
      });
      return;
    }


    const response = await HttpClient.DELETE<Product>(`/api/Product/${product.id}`);

    if (!response.isError && response.data) {
      const deletedProduct = response.data;
      setProducts(prev => prev.filter(p => p.id !== deletedProduct.id));

      toast({
        title: "Product deleted successfully",
        description: `"${deletedProduct.name || product.name}" has been deleted.`,
      });
    }

  };

  const confirmDeleteProduct = (product: Product) => {
    handleDeleteProduct(product);
  };

  const handleSaveProduct = async (productData: ProductFormData) => {
    console.log("handleSaveProduct");

    const productPayload = {
      name: productData.name,
      description: productData.description
    };

    if (isCreatingProduct) {

      console.log("creatingProduct");

      // Create project
      const response = await HttpClient.POST<Product>('/api/Product', productPayload);

      if (!response.isError && response.data) {
        const createdProduct = response.data;
        setProducts(prev => [...prev, createdProduct]);

        toast({
          title: "Project created successfully",
          description: `"${createdProduct.name}" has been created.`,
        });
      }

    } else if (selectedProduct) {
      // Editing existing project

      console.log("updatingProduct");

      // Update project
      const response = await HttpClient.PUT<Product>(`/api/Product/${selectedProduct.id}`, productPayload);

      if (!response.isError && response.data) {
        const updatedProduct = response.data;
        setProducts(prev =>
          prev.map(product => product.id === updatedProduct.id ? updatedProduct : product)
        );

        toast({
          title: "Product updated successfully",
          description: `"${updatedProduct.name}" has been updated.`,
        });
      }

    }
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    setIsCreatingProduct(false);
  };





  //FOR STATUS
  const handleCreateStatus = () => {
    setSelectedStatus(null);
    setIsCreatingStatus(true);
    setIsStatusModalOpen(true);
  };

  const handleEditStatus = (status: Column) => {
    setSelectedStatus(status);
    setIsCreatingStatus(false);
    setIsStatusModalOpen(true);
  };

  const handleDeleteStatus = async (status: Column) => {
    console.log("handleDeleteStatus");

    // Check if status has tasks
    const statusTasks = tasks.filter(task => task.status === status.name);
    if (statusTasks.length > 0) {
      toast({
        title: "Cannot delete status",
        description: `This status has ${statusTasks.length} task(s). Please reassign or delete them first.`,
        variant: "destructive",
      });
      return;
    }

    const response = await HttpClient.DELETE<Column>(`/api/TasksStatus/${status.id}`);

    if (!response.isError && response.data) {
      const deletedStatus = response.data;
      setStatuses(prev => prev.filter(s => s.id !== deletedStatus.id));

      toast({
        title: "Status deleted successfully",
        description: `"${deletedStatus.name || status.name}" has been deleted.`,
      });
    }
  };

  const confirmDeleteStatus = (status: Column) => {
    handleDeleteStatus(status);
  };

  const handleSaveStatus = async (statusData: StatusFormData) => {
    console.log("handleSaveStatus");

    const exists = statuses.some(
      s => s.name.toLowerCase() === statusData.name.toLowerCase()
    );

    if (exists) {
      toast({
        title: "Duplicate name",
        description: "A status with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    const statusPayload = {
      name: statusData.name,
      description: statusData.description,
      color: statusData.color
    };

    if (isCreatingStatus) {
      console.log("creatingStatus");

      // Create status
      const response = await HttpClient.POST<Column>('/api/TasksStatus', statusPayload);

      if (!response.isError && response.data) {
        const createdStatus = {
          ...response.data
        };
        setStatuses(prev => [...prev, createdStatus]);

        toast({
          title: "Status created successfully",
          description: `"${createdStatus.name || statusPayload.name}" has been created.`,
        });
      }
    } else if (selectedStatus) {
      console.log("updatingStatus");

      // Update status
      const response = await HttpClient.PUT<Column>(`/api/TasksStatus/${selectedStatus.id}`, statusPayload);

      if (!response.isError && response.data) {
        const updatedStatus = {
          ...response.data
        };
        // setStatuses(prev =>
        //   prev.map(status => status.id === updatedStatus.id ? updatedStatus : status)
        // );



        // setRefreshKey(old => old + 1); // Trigger data refresh
        refetch() // Refetch data to get updated statuses

        toast({
          title: "Status updated successfully",
          description: `"${updatedStatus.name || statusPayload.name}" has been updated.`,
        });
      }
    }

    setIsStatusModalOpen(false);
    setSelectedStatus(null);
    setIsCreatingStatus(false);
  };

  const handleReorderStatuses = async (newStatuses: Column[]) => {
    console.log("handleReorderStatuses");

    const payload = newStatuses.map(s => ({
      id: s.id,
      sortOrder: s.sortOrder,
    }));

    const response = await HttpClient.PUT<Column[]>(
      "/api/TasksStatus/reorder",
      payload
    );

    if (!response.isError && response.data) {
      setStatuses(response.data); // backend returns new ordered list
      toast({
        title: "Statuses reordered",
        description: "The order of statuses has been updated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update statuses order.",
        variant: "destructive",
      });
    }
    // setStatuses(newStatuses);
  }


  //FOR ROLES
  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsCreatingRole(true);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsCreatingRole(false);
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = async (role: UserRole) => {
    console.log("handleDeleteRole");

    const roleUsers = users.filter(user => user.role === role.name);
    if (roleUsers.length > 0) {
      toast({
        title: "Cannot delete role",
        description: `This role has ${roleUsers.length} user(s). Please reassign or remove them first.`,
        variant: "destructive",
      });
      return;
    }


    const response = await HttpClient.DELETE<UserRole>(`/api/Role/${role.id}`);

    if (!response.isError && response.data) {
      const deletedRole = response.data;
      setRoles(prev => prev.filter(r => r.id !== deletedRole.id));

      toast({
        title: "Role deleted successfully",
        description: `"${deletedRole.name || role.name}" has been deleted.`,
      });
    }


  };

  const confirmDeleteRole = (role: UserRole) => {
    handleDeleteRole(role);
  };

  const handleSaveRole = async (roleData: RoleFormData) => {
    console.log("handleSaveRole");

    const rolePayload = {
      name: roleData.name,
      isManager: roleData.isManager
    };

    if (isCreatingRole) {
      console.log("creatingRole");

      // Create role
      const response = await HttpClient.POST<UserRole>('/api/Role', rolePayload);

      if (!response.isError && response.data) {
        const createdRole = response.data;
        setRoles(prev => [...prev, createdRole]);

        toast({
          title: "Role created successfully",
          description: `"${createdRole.name}" has been created.`,
        });
      }
    } else if (selectedRole) {
      console.log("updatingRole");

      // Update role
      const response = await HttpClient.PUT<UserRole>(`/api/Role/${selectedRole.id}`, rolePayload);

      if (!response.isError && response.data) {
        const updatedRole = response.data;
        setRoles(prev =>
          prev.map(role => role.id === updatedRole.id ? updatedRole : role)
        );

        toast({
          title: "Role updated successfully",
          description: `"${updatedRole.name}" has been updated.`,
        });
      }
    }

    setIsRoleModalOpen(false);
    setSelectedRole(null);
    setIsCreatingRole(false);
  };

  //FOR HOLIDAYS

  const handleCreateHoliday = () => {
    setSelectedHoliday(null);
    setIsCreatingHoliday(true);
    setIsHolidayModalOpen(true);
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsCreatingHoliday(false);
    setIsHolidayModalOpen(true);
  };

  const handleDeleteHoliday = async (holiday: Holiday) => {
    console.log("handleDeleteHoliday");

    const response = await HttpClient.DELETE<Holiday>(`/api/Holiday/${holiday.id}`);

    if (!response.isError && response.data) {
      const deletedHoliday = response.data;
      setHolidays(prev => prev.filter(h => h.id !== deletedHoliday.id));

      toast({
        title: "Holiday deleted successfully",
        description: `"${deletedHoliday.name || holiday.name}" has been deleted.`,
      });
    } else {
      toast({
        title: "Failed to delete holiday",
        description: "Something went wrong while deleting this holiday.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteHoliday = (holiday: Holiday) => {
    handleDeleteHoliday(holiday);
  };


  const handleSaveHoliday = async (holidayData: HolidayFormData) => {
    setSavingHoliday(true);

    const holidayPayload = {
      name: holidayData.name,
      // date: holidayData.date,
      startDate: holidayData.startDate,
      endDate: holidayData.endDate
    };

    if (isCreatingHoliday) {


      // Create project
      const response = await HttpClient.POST<Holiday>('/api/Holiday', holidayPayload);

      if (!response.isError && response.data) {
        const createdHoliday = {
          ...response.data,
          // date: new Date(response.data.date),
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
        };
        setHolidays(prev => [...prev, createdHoliday]);

        toast({
          title: "Holiday created successfully",
          description: `"${createdHoliday.name}" has been created.`,
        });
      }



    } else if (selectedHoliday) {


      // Update project
      const response = await HttpClient.PUT<Holiday>(`/api/Holiday/${selectedHoliday.id}`, holidayPayload);

      if (!response.isError && response.data) {
        const updatedHoliday = {
          ...response.data,
          // date: new Date(response.data.date),
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
        };
        setHolidays(prev =>
          prev.map(holiday => holiday.id === updatedHoliday.id ? updatedHoliday : holiday)
        );

        toast({
          title: "Holiday updated successfully",
          description: `"${updatedHoliday.name}" has been updated.`,
        });
      }


    }

    setSavingHoliday(false);
    setIsHolidayModalOpen(false);
    setSelectedHoliday(null);
    setIsCreatingHoliday(false);
  };

  if (!currentUser || !projects) {
    return <p>Loading...</p>; // Or return a spinner / skeleton
  }

  return (

    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 pl-10">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Task Management</h1>
            </div>
            <div className="flex items-center gap-4">


              <div
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 w-full px-3 py-2 border rounded-md cursor-pointer hover:bg-muted/50 transition"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {currentUser.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{currentUser.full_name}</span>
                <Badge
                  variant="outline"
                  className={`text-xs ml-auto ${currentUser.role === "manager"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                    }`}
                >
                  {currentUser.role}
                </Badge>
              </div>

              {/* Profile Modal */}
              <ProfileModal
                user={currentUser}
                isOpen={open}
                onClose={() => setOpen(false)}
              />

              {currentUser?.isManager && (
                <Button onClick={handleCreateTask} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              )}


              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem("user");
                  window.location.href = '/login';
                }}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <SidebarProvider>
        <main className="container mx-auto px-4 py-1">
          <div className="flex">

            {/* Sidebar */}
            <TaskSidebar
              currentUser={currentUser}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              roles={roles}
            />
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

                <TabsContent value="kanban" className="space-y-4">
                  {tasks.length > 0 ? (
                    <KanbanBoard
                      tasks={tasks}
                      currentUser={currentUser}
                      onEditTask={handleEditTask}
                      onView={handleViewTask}
                      onStatusChange={handleStatusChange}
                      columns={statuses}
                    />
                  ) : (
                    <p>No tasks found.</p>
                  )}
                </TabsContent>


                <TabsContent value="list" className="space-y-6">

                  <TaskTable
                    tasks={tasks}
                    onEditTask={handleEditTask}
                    onView={handleViewTask}
                    canEdit={true}
                    columns={statuses}
                  />
                </TabsContent>


                {/* <TabsContent value="stats" className="space-y-4">
                  <TaskStats taskStats={taskStats} />
                </TabsContent> */}

                <TabsContent value="reports" className="space-y-4">
                  <Reports
                    tasks={tasks}
                    users={users}
                  />
                </TabsContent>

                <TabsContent value="hourlyreport" className="space-y-4">
                  <HourlyReport
                    tasks={tasks}
                    users={users}
                    projects={projects}
                    products={products}
                  />
                </TabsContent>

                <TabsContent value="fullreport" className="space-y-4">
                  <FullReport
                    tasks={tasks}
                    users={users}
                    projects={projects}
                    products={products}
                  />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <Button onClick={handleCreateUser} className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add User
                    </Button>
                  </div>

                  <UserTable
                    users={users}
                    onEditUser={handleEditUser}
                    onDeleteUser={confirmDeleteUser}
                    roles={roles}
                  />

                </TabsContent>

                <TabsContent value="projects" className="space-y-4">

                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Project Management</h2>
                    <Button onClick={handleCreateProject} className="gap-2">
                      <FolderPlus className="h-4 w-4" />
                      Add Project
                    </Button>
                  </div>

                  <ProjectTable
                    projects={projects}
                    onEditProject={handleEditProject}
                    onDeleteProject={confirmDeleteProject}
                    products={products}
                  />


                </TabsContent>

                <TabsContent value="products" className="space-y-4">

                  <ProductTable
                    products={products}
                    onCreateProduct={handleCreateProduct}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={confirmDeleteProduct}
                  />
                </TabsContent>

                <TabsContent value="status" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Task Statuses</h2>
                    <Button onClick={handleCreateStatus} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Status
                    </Button>
                  </div>

                  <StatusTable
                    statuses={statuses}
                    onEditStatus={handleEditStatus}
                    onDeleteStatus={confirmDeleteStatus}
                    onReorderStatuses={handleReorderStatuses}
                  />

                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">User Roles</h2>
                    <Button onClick={handleCreateRole} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Role
                    </Button>
                  </div>

                  <RoleTable
                    roles={roles}
                    onEditRole={handleEditRole}
                    onDeleteRole={confirmDeleteRole}
                  />


                </TabsContent>


                <TabsContent value="holidays" className="space-y-4">
                  <HolidayTable
                    holidays={holidays}
                    onCreateHoliday={handleCreateHoliday}
                    onEditHoliday={handleEditHoliday}
                    onDeleteHoliday={confirmDeleteHoliday}
                    currentUser={currentUser}
                  />

                </TabsContent>


              </Tabs>
            </div>
          </div>
        </main>
      </SidebarProvider>

      {currentUser && (
        <TaskModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => {
            if (!savingTask) {
              setIsTaskModalOpen(false);
              setSelectedTask(null);
              setIsCreatingTask(false);
            }
          }}
          onSave={handleSaveTask}
          currentUser={currentUser}
          availableUsers={users.filter(u => u.managerId === currentUser.id || u.id === currentUser.id)}
          availableProjects={projects}
          holidays={holidays}
          isCreating={isCreatingTask}
          isSaving={savingTask}
          columns={statuses}
          roles={roles}
        />
      )}

      <UserModal
        user={selectedUser}
        roles={roles}
        managers={managers}
        isOpen={isUserModalOpen}
        onClose={() => {
          if (!savingUser) {
            setIsUserModalOpen(false);
            setSelectedUser(null);
            setIsCreatingUser(false);
          }
        }}
        onSave={handleSaveUser}
        isCreating={isCreatingUser}
        isSaving={savingUser}
      />

      <ProjectModal
        project={selectedProject}
        isOpen={isProjectModalOpen}
        availableProducts={products}
        onClose={() => {
          if (!savingProject) {
            setIsProjectModalOpen(false);
            setSelectedProject(null);
            setIsCreatingProject(false);
          }
        }}
        onSave={handleSaveProject}
        holidays={holidays}
        isCreating={isCreatingProject}
        isSaving={savingProject}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          if (!savingProduct) {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
            setIsCreatingProduct(false);
          }
        }}
        onSave={handleSaveProduct}
        holidays={holidays}
        isCreating={isCreatingProduct}
        isSaving={savingProduct}
      />


      <StatusModal
        status={selectedStatus}
        isOpen={isStatusModalOpen}
        onClose={() => {
          if (!savingStatus) {
            setIsStatusModalOpen(false);
            setSelectedStatus(null);
            setIsCreatingStatus(false);
          }
        }}
        onSave={handleSaveStatus}
        isCreating={isCreatingStatus}
        isSaving={savingStatus}
      />

      <RoleModal
        role={selectedRole}
        isOpen={isRoleModalOpen}
        onClose={() => {
          if (!savingRole) {
            setIsRoleModalOpen(false);
            setSelectedRole(null);
            setIsCreatingRole(false);
          }
        }}
        onSave={handleSaveRole}
        isCreating={isCreatingRole}
        isSaving={savingRole}
      />



      <HolidayModal
        holiday={selectedHoliday}
        isOpen={isHolidayModalOpen}
        onClose={() => {
          if (!savingHoliday) {
            setIsHolidayModalOpen(false);
            setSelectedHoliday(null);
            setIsCreatingHoliday(false);
          }
        }}
        onSave={handleSaveHoliday}
        isCreating={isCreatingHoliday}
        isSaving={savingHoliday}
      />

    </div>
  );
}