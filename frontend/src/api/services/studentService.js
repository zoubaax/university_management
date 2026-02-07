import api from '../axios';

/**
 * Service for handling Student management
 */
const studentService = {
    /**
     * Fetch all students with optional search/filter
     */
    getAll: async (params = {}) => {
        const response = await api.get('/students', { params });
        return response.data.data;
    },

    /**
     * Enroll a new student
     */
    create: async (data) => {
        const response = await api.post('/students', data);
        return response.data.data;
    },

    /**
     * Update student academic info
     */
    update: async (id, data) => {
        const response = await api.put(`/students/${id}`, data);
        return response.data.data;
    },

    /**
     * Get student full academic record
     */
    getProfile: async (id) => {
        const response = await api.get(`/students/${id}`);
        return response.data.data;
    }
};

export default studentService;
