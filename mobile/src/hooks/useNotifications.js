import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const [notifRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread/count')
            ]);
            setNotifications(notifRes.data.data || []);
            setUnreadCount(countRes.data.data?.count || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            const wasUnread = notifications.find(n => n.id === id && !n.is_read);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };
};
