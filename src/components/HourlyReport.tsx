import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';
import { Task, User, Project, Product, TimeLog } from '@/types/task';
import { HttpClient } from '@/api/communicator';

interface ReportsProps {
    tasks: Task[];
    users: User[];
    projects: Project[];
    products: Product[];
}

interface HierarchyNode {
    type: 'product' | 'project' | 'task';
    id: string;
    name: string;
    data: Product | Project | Task;
    children?: HierarchyNode[];
    user?: User;
    hours?: number;
    totalHours?: number;
}

export default function HourlyReport({ tasks, users, projects, products }: ReportsProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState<string>('all');
    const [productFilter, setProductFilter] = useState<string>('all');
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);



    useEffect(() => {
        const fetchLogs = async () => {
            // if (!taskId) return;

            const response = await HttpClient.GET<TimeLog[]>(`/api/TaskLog/GetAll`);

            if (!response.isError && response.data) {
                const convertedLogs = response.data.map(log => ({
                    ...log,
                    loggedAt: new Date(log.loggedAt)
                }));
                setTimeLogs(convertedLogs);
            } else {
                console.error("Failed to fetch logs:", response.message);
            }
        };

        fetchLogs();

    }, [tasks, users, projects, products]);

    // Build hierarchical data structure
    // Build hierarchical data structure
    const hierarchyData = useMemo(() => {
        const hierarchy: HierarchyNode[] = [];

        products.forEach(product => {
            const productProjects = projects.filter(project => project.productId === product.id);
            const productNode: HierarchyNode = {
                type: 'product',
                id: product.id,
                name: product.name,
                data: product,
                children: [],
                totalHours: 0
            };

            productProjects.forEach(project => {
                const projectTasks = tasks.filter(task => task.projectId === project.id);
                const projectNode: HierarchyNode = {
                    type: 'project',
                    id: project.id,
                    name: project.name,
                    data: project,
                    children: [],
                    totalHours: 0
                };

                projectTasks.forEach(task => {
                    const taskUser = users.find(u => u.id === task.assigneeId);

                    // 🔹 Get actual logged hours from timeLogs
                    // const taskLogs = timeLogs.filter(log => log.taskId === task.id);
                    // 🔹 Apply date filter here
                    const formatDateOnly = (d: Date) => d.toISOString().split("T")[0];

                    const taskLogs = timeLogs.filter(log => {
                        const logDate = formatDateOnly(new Date(log.workDate));

                        return (
                            log.taskId === task.id &&
                            (!startDate || logDate >= formatDateOnly(startDate)) &&
                            (!endDate || logDate <= formatDateOnly(endDate))
                        );
                    });

                    const actualHours = taskLogs.reduce((sum, log) => sum + log.hours, 0);

                    if (actualHours === 0) return;


                    const taskNode: HierarchyNode = {
                        type: 'task',
                        id: task.id,
                        name: task.name,
                        data: task,
                        user: taskUser,
                        hours: actualHours
                    };

                    projectNode.children!.push(taskNode);
                    projectNode.totalHours! += actualHours;
                });

                if (projectNode.children!.length > 0) {
                    productNode.children!.push(projectNode);
                    productNode.totalHours! += projectNode.totalHours!;
                }
            });

            if (productNode.children!.length > 0) {
                hierarchy.push(productNode);
            }
        });

        return hierarchy;
    }, [tasks, users, projects, products, timeLogs, startDate, endDate]);


    // Filter data based on search and filters
    const filteredData = useMemo(() => {
        return hierarchyData.filter(product => {
            if (productFilter !== 'all' && product.id !== productFilter) return false;

            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const hasMatch = product.name.toLowerCase().includes(searchLower) ||
                    product.children?.some(project =>
                        project.name.toLowerCase().includes(searchLower) ||
                        project.children?.some(task =>
                            task.name.toLowerCase().includes(searchLower) ||
                            task.user?.full_name.toLowerCase().includes(searchLower)
                        )
                    );
                if (!hasMatch) return false;
            }

            if (userFilter !== 'all') {
                const hasUserTasks = product.children?.some(project =>
                    project.children?.some(task => task.user?.id === userFilter)
                );
                if (!hasUserTasks) return false;
            }

            return true;
        });
    }, [hierarchyData, searchQuery, userFilter, productFilter]);

    const toggleExpanded = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const renderNode = (node: HierarchyNode, level: number = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const indentClass = level === 0 ? '' : level === 1 ? 'ml-6' : 'ml-12';

        return (
            <div key={node.id} className={indentClass}>
                <div className={`flex items-center py-2 px-4 hover:bg-muted/50 rounded-md ${level === 0 ? 'bg-muted/30 font-semibold' :
                    level === 1 ? 'bg-muted/20 font-medium' : ''
                    }`}>
                    {hasChildren && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 mr-2"
                            onClick={() => toggleExpanded(node.id)}
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </Button>
                    )}
                    {!hasChildren && <div className="w-6" />}

                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                        <div className="flex items-center gap-2">
                            {node.type === 'product' && (
                                <Badge variant="outline" className="text-xs">Product</Badge>
                            )}
                            {node.type === 'project' && (
                                <Badge variant="secondary" className="text-xs">Project</Badge>
                            )}
                            <span className={node.type === 'task' ? 'text-sm' : ''}>{node.name}</span>
                        </div>

                        <div className="text-center">
                            {node.type === 'task' && node.user && (
                                <span className="text-sm">{node.user.full_name || node.user.name}</span>
                            )}
                        </div>

                        <div className="text-right">
                            {node.type === 'task' && (
                                <span className="text-sm font-medium">{node.hours}h</span>
                            )}
                            {(node.type === 'product' || node.type === 'project') && (
                                <span className="text-sm font-medium text-muted-foreground">
                                    {node.totalHours}h total
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="mt-1">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Resource Reports</h1>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products, projects, tasks, or users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Filter by User</label>
                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All users</SelectItem>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name || user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Filter by Product</label>
                            <Select value={productFilter} onValueChange={setProductFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All products" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All products</SelectItem>
                                    {products.map(product => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={startDate ? startDate.toISOString().split("T")[0] : ""}
                                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                                />
                                <Input
                                    type="date"
                                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                                />
                            </div>
                        </div>
                    </div>



                </CardContent>
            </Card>

            {/* Hierarchy Report */}
            <Card>
                <CardHeader>
                    <CardTitle>Resource Allocation Report</CardTitle>
                    <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground mt-4 px-4">
                        <div>Product / Project / Task</div>
                        <div className="text-center">Resource</div>
                        <div className="text-right">Hours</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No data found matching your filters.
                            </div>
                        ) : (
                            filteredData.map(node => renderNode(node))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredData.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredData.reduce((sum, product) => sum + (product.children?.length || 0), 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Total Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredData.reduce((sum, product) => sum + (product.totalHours || 0), 0)}h
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
