import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export const useMessages = () => {
    const [inbox, setInbox] = useState([]);
    const [sent, setSent] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const [inboxRes, sentRes, unreadRes] = await Promise.all([
                api.get('/messages/inbox'),
                api.get('/messages/sent'),
                api.get('/messages/unread/count')
            ]);
            setInbox(inboxRes.data.data || []);
            setSent(sentRes.data.data || []);
            setUnreadCount(unreadRes.data.data.count || 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err.response?.data?.error || 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user, fetchMessages]);

    const sendMessage = async (messageData) => {
        try {
            const response = await api.post('/messages', messageData);

            // Refresh messages to get full populated user data (names, roles) from the database joins
            await fetchMessages();

            return { success: true, data: response.data.data };
        } catch (err) {
            console.error('Error sending message:', err);
            return {
                success: false,
                message: err.response?.data?.error || 'Failed to send message',
            };
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await api.put(`/messages/${messageId}/read`);
            setInbox(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, is_read: true } : msg
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            return { success: true };
        } catch (err) {
            console.error('Error marking message as read:', err);
            return { success: false, message: 'Failed to mark as read' };
        }
    };

    const toggleStar = async (messageId) => {
        try {
            const res = await api.put(`/messages/${messageId}/star`);
            const updatedMessage = res.data.data;
            setInbox(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
            setSent(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
            return { success: true };
        } catch (err) {
            console.error('Error toggling priority/star:', err);
            return { success: false, message: 'Failed to toggle star' };
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await api.delete(`/messages/${messageId}`);
            setInbox(prev => prev.filter(msg => msg.id !== messageId));
            setSent(prev => prev.filter(msg => msg.id !== messageId));
            return { success: true };
        } catch (err) {
            console.error('Error deleting message:', err);
            return { success: false, message: 'Failed to delete message' };
        }
    };

    const searchUsers = async (query) => {
        if (!query || query.length < 2) return [];
        try {
            const res = await api.get(`/messages/users/search?q=${query}`);
            return res.data.data || [];
        } catch (err) {
            console.error('Error searching users:', err);
            return [];
        }
    };

    return {
        inbox,
        sent,
        unreadCount,
        loading,
        error,
        refreshMessages: fetchMessages,
        sendMessage,
        markAsRead,
        toggleStar,
        deleteMessage,
        searchUsers
    };
};
