import api from '../axios';

/**
 * Service for handling Department management
 */
const departmentService = {
    /**
     * Fetch all departments
     */
    getAll: async () => {
        const response = await api.get('/departments');
        return response.data.data;
    },

    /**
     * Create a new department
     */
    create: async (data) => {
        const response = await api.post('/departments', data);
        return response.data.data;
    },

    /**
     * Update department
     */
    update: async (id, data) => {
        const response = await api.put(`/departments/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete department
     */
    delete: async (id) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    }
};

export default departmentService;
