import api from '../axios';

/**
 * Service for handling User and Staff management
 */
const staffService = {
    /**
     * Fetch all staff members with optional filtering
     * @param {Object} params - Search and filter params
     */
    getAll: async (params = {}) => {
        const response = await api.get('/employees', { params });
        return response.data.data;
    },

    /**
     * Fetch a single employee by ID
     */
    getById: async (id) => {
        const response = await api.get(`/employees/${id}`);
        return response.data.data;
    },

    /**
     * Register a new staff member (Hiring process)
     */
    create: async (data) => {
        const response = await api.post('/employees', data);
        return response.data.data;
    },

    /**
     * Update staff details
     */
    update: async (id, data) => {
        const response = await api.put(`/employees/${id}`, data);
        return response.data.data;
    },

    /**
     * Terminate/Delete employee record
     */
    delete: async (id) => {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    }
};

export default staffService;
