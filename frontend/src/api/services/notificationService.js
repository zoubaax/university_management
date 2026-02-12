import API from '../axios';

const notificationService = {
    // Get notifications
    getNotifications: async (params = {}) => {
        try {
            const response = await API.get('/notifications', { params });
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            const response = await API.get('/notifications/unread/count');
            return response.data?.data?.count || 0;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark as read
    markAsRead: async (id) => {
        try {
            const response = await API.put(`/notifications/${id}/read`);
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            const response = await API.put('/notifications/read-all');
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete notification
    delete: async (id) => {
        try {
            const response = await API.delete(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create announcement (admin only)
    createAnnouncement: async (data) => {
        try {
            const response = await API.post('/notifications/announcement', data);
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default notificationService;
