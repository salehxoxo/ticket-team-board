import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Task, User } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, Clock } from 'lucide-react';

interface ReportsProps {
  tasks: Task[];
  users: User[];
}

export const Reports = ({ tasks, users }: ReportsProps) => {
  // Task completion trend (mock data for last 7 days)
  // const completionTrend = [
  //   { day: 'Mon', completed: 3, created: 5 },
  //   { day: 'Tue', completed: 2, created: 3 },
  //   { day: 'Wed', completed: 4, created: 2 },
  //   { day: 'Thu', completed: 1, created: 4 },
  //   { day: 'Fri', completed: 5, created: 3 },
  //   { day: 'Sat', completed: 2, created: 1 },
  //   { day: 'Sun', completed: 3, created: 2 }
  // ];

  // Task completion trend (real data for last 7 days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // oldest → newest
    return d;
  });

  const completionTrend = last7Days.map((date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const dayTasks = tasks.filter((task) => {
      const createdDate = new Date(task.created_at);
      return (
        createdDate.getFullYear() === date.getFullYear() &&
        createdDate.getMonth() === date.getMonth() &&
        createdDate.getDate() === date.getDate()
      );
    });

    return {
      day: dayName,
      created: dayTasks.length,
      completed: dayTasks.filter((t) => t.status.toLowerCase() === "done").length,
    };
  });


  // Tasks by assignee
  const assigneeData = users.map(user => ({
    name: user.name,
    tasks: tasks.filter(task => task.assigneeId === user.id).length,
    completed: tasks.filter(task => task.assigneeId === user.id && task.status === 'done').length
  })).filter(item => item.tasks > 0);

  // Priority distribution for pie chart
  const priorityData = [
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#f97316' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#eab308' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#22c55e' }
  ].filter(item => item.value > 0);

  // Status distribution
  const statusData = [
    { status: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { status: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { status: 'Review', count: tasks.filter(t => t.status === 'review').length },
    { status: 'Done', count: tasks.filter(t => t.status === 'done').length }
  ].filter(item => item.count > 0);

  // Team performance metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgTasksPerUser = Math.round(totalTasks / users.length);

  const chartConfig = {
    completed: {
      label: "Completed",
      color: "hsl(var(--primary))",
    },
    created: {
      label: "Created",
      color: "hsl(var(--muted-foreground))",
    },
    tasks: {
      label: "Tasks",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tasks/User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTasksPerUser}</div>
            <p className="text-xs text-muted-foreground">
              {users.length} team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completionTrend.reduce((sum, day) => sum + day.completed, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionTrend}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={users
                    .map(user => {
                      const total = tasks.filter(task => task.assigneeId === user.id).length;
                      const completed = tasks.filter(
                        task => task.assigneeId === user.id && task.status === "done"
                      ).length;
                      return {
                        name: user.name,
                        completed,
                        remaining: total - completed,
                      };
                    })
                    .filter(item => item.completed + item.remaining > 0)}
                  layout="vertical"
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {/* Remaining tasks (gray background) */}
                  <Bar
                    dataKey="remaining"
                    stackId="a"
                    fill="hsl(var(--muted-foreground))"
                    radius={[0, 4, 4, 0]}
                  />
                  {/* Completed tasks (blue foreground) */}
                  <Bar
                    dataKey="completed"
                    stackId="a"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};