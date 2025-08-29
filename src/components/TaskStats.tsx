import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, TrendingUp, BarChart3 } from "lucide-react"

type TaskStatsProps = {
    taskStats: {
        total: number
        assigned?: number
        unassigned?: number
        byStatus: Record<string, number>
        byPriority: Record<string, number>
    }
}

export default function TaskStats({ taskStats }: TaskStatsProps) {
    return (
        <div className="space-y-6">
            {/* Top 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{taskStats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{taskStats.assigned}</div>
                        <p className="text-xs text-muted-foreground">
                            {taskStats.unassigned} unassigned
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {taskStats.byStatus["in-progress"] || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {taskStats.byStatus.done || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Distribution Graphs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(taskStats.byStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="capitalize">{status.replace("-", " ")}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-muted rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-primary"
                                            style={{ width: `${(count / taskStats.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8">{count}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Priority Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(taskStats.byPriority).map(([priority, count]) => (
                            <div key={priority} className="flex items-center justify-between">
                                <span className="capitalize">{priority}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-muted rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-primary"
                                            style={{ width: `${(count / taskStats.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8">{count}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
