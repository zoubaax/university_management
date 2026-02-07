import api from '../../../api/axios';

/**
 * Service layer for Department operations.
 * Isolates API calls from UI components.
 */
const departmentService = {
    /**
     * Fetch all departments
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        const response = await api.get('/departments');
        return response.data.data;
    },

    /**
     * Fetch a single department by ID
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const response = await api.get(`/departments/${id}`);
        return response.data.data;
    },

    /**
     * Create a new department
     * @param {Object} data 
     */
    create: async (data) => {
        const response = await api.post('/departments', data);
        return response.data.data;
    },

    /**
     * Update an existing department
     * @param {string} id 
     * @param {Object} data 
     */
    update: async (id, data) => {
        const response = await api.put(`/departments/${id}`, data);
        return response.data.data;
    },

    /**
     * Soft delete a department
     * @param {string} id 
     */
    delete: async (id) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    },
};

export default departmentService;
