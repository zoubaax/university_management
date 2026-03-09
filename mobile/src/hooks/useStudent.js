import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

/**
 * Hook to manage system notifications
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data);

            const countRes = await api.get('/notifications/unread/count');
            setUnreadCount(countRes.data.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        fetchNotifications();
    };

    return { notifications, unreadCount, loading, markAsRead, refresh: fetchNotifications };
};

/**
 * Hook to manage absences
 */
export const useAbsences = () => {
    const [absences, setAbsences] = useState([]);
    const [stats, setStats] = useState({ total: 0, justified: 0, unjustified: 0 });
    const [loading, setLoading] = useState(true);

    const fetchAbsences = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student-attendance/my-absences');
            const data = response.data.data;
            setAbsences(data);

            // Calc stats
            const total = data.length;
            const justified = data.filter(a => a.is_justified).length;
            setStats({ total, justified, unjustified: total - justified });
        } catch (error) {
            console.error('Failed to fetch absences:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAbsences();
    }, []);

    return { absences, stats, loading, refresh: fetchAbsences };
};
