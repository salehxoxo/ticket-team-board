import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ChevronDown, ChevronRight, Users } from "lucide-react";
import { Task, User, Project, Product, TimeLog } from "@/types/task";
import { HttpClient } from "@/api/communicator";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx-js-style";

interface ReportsProps {
    tasks: Task[];
    users: User[];
    projects: Project[];
    products: Product[];
}

interface HierarchyNode {
    type: "project" | "member";
    id: string;
    name: string;
    role?: string;
    hours?: number;
    children?: HierarchyNode[];
}

export default function HourlyReport({ tasks, users, projects }: ReportsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [userFilter, setUserFilter] = useState<string>("all");
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());


    useEffect(() => {
        const fetchLogs = async () => {
            if (!tasks || tasks.length === 0) return;

            const taskIds = tasks.map((t) => t.id);
            const response = await HttpClient.POST<TimeLog[]>(
                `/api/TaskLog/GetByTaskIds`,
                taskIds
            );

            if (!response.isError && response.data) {
                const convertedLogs = response.data.map((log) => ({
                    ...log,
                    loggedAt: new Date(log.loggedAt),
                }));
                setTimeLogs(convertedLogs);
            } else {
                console.error("Failed to fetch logs:", response.message);
            }
        };

        fetchLogs();
    }, [tasks]);

    // Build data: Project -> Members (grouped by user, summing hours)
    const hierarchyData = useMemo(() => {
        const projectGroups: { [key: string]: HierarchyNode } = {};

        tasks.forEach((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const user = users.find((u) => u.id === task.assigneeId);
            if (!project || !user) return;

            if (!projectGroups[project.id]) {
                projectGroups[project.id] = {
                    type: "project",
                    id: project.id,
                    name: project.name,
                    children: [],
                };
            }

            const formatDateOnly = (d: Date) => d.toISOString().split("T")[0];
            const taskLogs = timeLogs.filter((log) => {
                const logDate = formatDateOnly(new Date(log.workDate));
                return (
                    log.taskId === task.id &&
                    (!startDate || logDate >= formatDateOnly(startDate)) &&
                    (!endDate || logDate <= formatDateOnly(endDate))
                );
            });

            const totalHours = taskLogs.reduce((sum, l) => sum + l.hours, 0);
            // if (totalHours === 0) return;

            // check if user already exists under this project
            const existingMember = projectGroups[project.id].children!.find(
                (m) => m.id === `${project.id}-${user.id}`
            );

            if (existingMember) {
                existingMember.hours = (existingMember.hours || 0) + totalHours;
            } else {
                projectGroups[project.id].children!.push({
                    type: "member",
                    id: `${project.id}-${user.id}`,
                    name: user.full_name,
                    role: user.role, // assuming role field exists
                    hours: totalHours,
                });
            }
        });

        return Object.values(projectGroups);
    }, [tasks, projects, users, timeLogs, startDate, endDate]);

    // Filter by search & user
    const filteredData = useMemo(() => {
        return hierarchyData.filter((project) => {
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const hasMatch =
                    project.name.toLowerCase().includes(searchLower) ||
                    project.children?.some(
                        (member) =>
                            member.name.toLowerCase().includes(searchLower) ||
                            (member.role || "").toLowerCase().includes(searchLower)
                    );
                if (!hasMatch) return false;
            }

            if (userFilter !== "all") {
                const hasUser = project.children?.some((m) =>
                    m.id.endsWith(userFilter)
                );
                if (!hasUser) return false;
            }

            return true;
        });
    }, [hierarchyData, searchQuery, userFilter]);

    const toggleExpanded = (id: string) => {
        setExpandedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const exportToExcel = () => {
        const rows: any[][] = [];

        // Header row
        rows.push(["Projects", "Member Name", "Role", "Hours"]);

        // Keep track of merges
        const merges: any[] = [];

        filteredData.forEach((project) => {
            const startRow = rows.length + 1; // Excel rows are 1-based

            // Add first member row (project name visible here)
            if (project.children && project.children.length > 0) {
                rows.push([
                    project.name,
                    project.children[0].name,
                    project.children[0].role || "",
                    project.children[0].hours || 0
                ]);

                // Add remaining members with empty project column
                for (let i = 1; i < project.children.length; i++) {
                    const member = project.children[i];
                    rows.push([
                        "",
                        member.name,
                        member.role || "",
                        member.hours || 0
                    ]);
                }

                const endRow = rows.length; // last row for this project

                // Merge the project cell vertically (column A)
                merges.push({
                    s: { r: startRow - 1, c: 0 },
                    e: { r: endRow - 1, c: 0 }
                });
            } else {
                // If no children, just push the project row
                rows.push([project.name, "", "", ""]);
            }
        });

        const worksheet = XLSX.utils.aoa_to_sheet(rows);

        // Apply merges
        worksheet["!merges"] = merges;

        // Set column widths
        worksheet["!cols"] = [
            { wch: 45 }, // Projects
            { wch: 28 }, // Member Name
            { wch: 28 }, // Role
            { wch: 10 }, // Hours
        ];

        // Apply styling
        Object.keys(worksheet).forEach((cell) => {
            if (cell[0] === "!") return;

            const cellRef = XLSX.utils.decode_cell(cell);

            // Header row styling
            if (cellRef.r === 0) {
                worksheet[cell].s = {
                    font: { bold: true, sz: 12 },
                    fill: { fgColor: { rgb: "ffd6d6d6" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "FF000000" } },
                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                        left: { style: "thin", color: { rgb: "FF000000" } },
                        right: { style: "thin", color: { rgb: "FF000000" } }
                    }
                };
            }
            // Project column (merged cell)
            else if (cellRef.c === 0 && worksheet[cell].v && worksheet[cell].v.trim() !== "") {
                worksheet[cell].s = {
                    font: { bold: true, sz: 12 },
                    alignment: { vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "FF000000" } },
                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                        left: { style: "thin", color: { rgb: "FF000000" } },
                        right: { style: "thin", color: { rgb: "FF000000" } }
                    }
                };
            }
            // Normal cells
            else {
                worksheet[cell].s = {
                    border: {
                        top: { style: "thin", color: { rgb: "FF000000" } },
                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                        left: { style: "thin", color: { rgb: "FF000000" } },
                        right: { style: "thin", color: { rgb: "FF000000" } }
                    }
                };
            }
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Resource_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    };




    // Recursive renderer
    const renderNode = (node: HierarchyNode, level = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const indentClass = level === 0 ? "" : "ml-6";

        return (
            <div key={node.id} className={indentClass}>
                <div
                    className={`flex items-center py-2 px-4 hover:bg-muted/50 rounded-md ${level === 0 ? "bg-muted/30 font-semibold" : "bg-muted/10"
                        }`}
                >
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
                            {node.type === "project" && (
                                <Users className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{node.name}</span>
                        </div>

                        <div className="text-center">
                            {node.type === "member" && <span>{node.role}</span>}
                        </div>

                        <div className="text-right">
                            {node.type === "member" && (
                                <span className="font-medium">{node.hours}h</span>
                            )}
                            {node.type === "project" && (
                                <span className="text-muted-foreground">
                                    {/* {node.totalHours}h total */}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {isExpanded &&
                    hasChildren &&
                    node.children!.map((child) => renderNode(child, level + 1))}
            </div>
        );
    };


    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Resource Reports</h1>
                <Button onClick={exportToExcel}>Export to Excel</Button>
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
                                placeholder="Search projects, members, or roles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Filter by User</label>
                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All users</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name}
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
                                    onChange={(e) =>
                                        setStartDate(e.target.value ? new Date(e.target.value) : null)
                                    }
                                />
                                <Input
                                    type="date"
                                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                                    onChange={(e) =>
                                        setEndDate(e.target.value ? new Date(e.target.value) : null)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Resource Allocation Report</CardTitle>
                    <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground mt-4 px-4">
                        <div>Member Name</div>
                        <div className="text-center">Role</div>
                        <div className="text-right">Hours</div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredData.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No data found matching your filters.
                        </div>
                    ) : (
                        filteredData.map((project) => renderNode(project))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
