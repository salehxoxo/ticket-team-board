import { useState, useEffect } from "react";
import { HttpClient } from "@/api/communicator";
import { Task, User, Project, Product, UserRole, Holiday, Column, Manager } from "@/types/task";

export const useDataFetching = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [statuses, setStatuses] = useState<Column[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');

            if (!token || !userString) {
                throw new Error("User not logged in");
            }

            const user = JSON.parse(userString);

            // Fetch all data in parallel
            const [
                taskResponse,
                userResponse,
                projectResponse,
                roleResponse,
                holidayResponse,
                productResponse,
                statusResponse,
                managerResponse
            ] = await Promise.all([
                HttpClient.GET<Task[]>(`/api/Tasks/user/${user.id}`),
                HttpClient.GET<User[]>('/api/User'),
                HttpClient.GET<Project[]>('/api/Project'),
                HttpClient.GET<UserRole[]>('/api/Role'),
                HttpClient.GET<Holiday[]>('/api/Holiday'),
                HttpClient.GET<Product[]>('/api/Product'),
                HttpClient.GET<Column[]>("/api/TasksStatus"),
                HttpClient.GET<Manager[]>("/api/User/managers")
            ]);

            // Process responses
            if (!taskResponse.isError && taskResponse.data) {
                setTasks(taskResponse.data.map(task => ({
                    ...task,
                    startDate: new Date(task.startDate),
                    endDate: new Date(task.endDate),
                    created_at: new Date(task.created_at),
                    updated_at: new Date(task.updated_at),
                    project_start: new Date(task.project_start),
                    project_end: new Date(task.project_end)
                })));
            } else {
                console.error("Failed to fetch tasks:", taskResponse.message);
            }

            if (!userResponse.isError && userResponse.data) {
                setUsers(userResponse.data);
            } else {
                console.error("Failed to fetch users:", userResponse.message);
            }

            if (!projectResponse.isError && projectResponse.data) {
                const convertedProjects = projectResponse.data.map(project => ({
                    ...project,
                    startDate: new Date(project.startDate),
                    endDate: new Date(project.endDate),
                    createdAt: new Date(project.createdAt)
                }));
                setProjects(convertedProjects);
            } else {
                console.error("Failed to fetch projects:", projectResponse.message);
            }

            if (!roleResponse.isError && roleResponse.data) {
                setRoles(roleResponse.data);
            } else {
                console.error("Failed to fetch roles:", roleResponse.message);
            }

            if (!holidayResponse.isError && holidayResponse.data) {
                const convertedHolidays = holidayResponse.data.map(holiday => ({
                    ...holiday,
                    date: new Date(holiday.date),
                }));
                setHolidays(convertedHolidays);
            } else {
                console.error("Failed to fetch holidays:", holidayResponse.message);
            }

            if (!productResponse.isError && productResponse.data) {
                setProducts(productResponse.data);
            } else {
                console.error("Failed to fetch products:", productResponse.message);
            }

            if (!statusResponse.isError && statusResponse.data) {
                setStatuses(statusResponse.data);
            } else {
                console.error("Failed to fetch task statuses:", statusResponse.message);
            }

            if (!managerResponse.isError && managerResponse.data) {
                setManagers(managerResponse.data);
            } else {
                console.error("Failed to fetch managers:", managerResponse.message);
            }

            // ... process other responses similarly

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    return {
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
        refetch: fetchAllData
    };
};