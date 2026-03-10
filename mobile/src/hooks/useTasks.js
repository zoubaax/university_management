import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({
        todo_count: 0,
        in_progress_count: 0,
        completed_count: 0,
        high_priority_count: 0
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tasks');
            if (response.data.success) {
                setTasks(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/tasks/stats');
            if (response.data.success && response.data.data) {
                setStats({
                    todo_count: parseInt(response.data.data.todo_count || 0),
                    in_progress_count: parseInt(response.data.data.in_progress_count || 0),
                    completed_count: parseInt(response.data.data.completed_count || 0),
                    high_priority_count: parseInt(response.data.data.high_priority_count || 0)
                });
            }
        } catch (error) {
            console.error('Failed to fetch task stats:', error);
        }
    };

    const loadData = useCallback(() => {
        fetchTasks();
        fetchStats();
    }, []);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, loadData]);

    const createTask = async (taskData) => {
        try {
            const response = await api.post('/tasks', taskData);
            if (response.data.success) {
                await loadData();
                return { success: true, data: response.data.data };
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to create task' };
        }
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
            // Optimistic update
            setTasks(currentTasks =>
                currentTasks.map(t => t.id === taskId ? { ...t, status } : t)
            );

            const response = await api.put(`/tasks/${taskId}`, { status });
            if (response.data.success) {
                fetchStats(); // Update stats in background
                return true;
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            loadData(); // Revert on failure
            return false;
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const response = await api.delete(`/tasks/${taskId}`);
            if (response.data.success) {
                await loadData();
                return true;
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
            return false;
        }
    };

    return {
        tasks,
        stats,
        loading,
        refresh: loadData,
        createTask,
        updateTaskStatus,
        deleteTask
    };
};
