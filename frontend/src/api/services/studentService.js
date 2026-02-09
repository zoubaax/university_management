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
        const isFormData = data instanceof FormData;
        const response = await api.post('/students', data, {
            headers: {
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            }
        });
        return response.data.data;
    },

    /**
     * Update student academic info
     */
    update: async (id, data) => {
        const isFormData = data instanceof FormData;
        const response = await api.put(`/students/${id}`, data, {
            headers: {
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            }
        });
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
