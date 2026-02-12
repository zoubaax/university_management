import API from '../axios';

const messageService = {
    // Get inbox messages
    getInbox: async (params = {}) => {
        try {
            const response = await API.get('/messages/inbox', { params });
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get sent messages
    getSent: async (params = {}) => {
        try {
            const response = await API.get('/messages/sent', { params });
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get single message
    getMessage: async (id) => {
        try {
            const response = await API.get(`/messages/${id}`);
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Send a message
    send: async (data) => {
        try {
            const response = await API.post('/messages', data);
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark as read
    markAsRead: async (id) => {
        try {
            const response = await API.put(`/messages/${id}/read`);
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Toggle star
    toggleStar: async (id) => {
        try {
            const response = await API.put(`/messages/${id}/star`);
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete message
    delete: async (id) => {
        try {
            const response = await API.delete(`/messages/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            const response = await API.get('/messages/unread/count');
            return response.data?.data?.count || 0;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Search users
    searchUsers: async (query, limit = 20) => {
        try {
            const response = await API.get('/messages/users/search', {
                params: { q: query, limit }
            });
            return response.data?.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default messageService;
