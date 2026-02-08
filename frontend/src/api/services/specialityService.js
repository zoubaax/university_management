import api from '../axios';

/**
 * Service for handling Speciality management
 */
const specialityService = {
    /**
     * Fetch all specialities
     */
    getAll: async () => {
        const response = await api.get('/specialities');
        return response.data.data;
    },

    /**
     * Create a speciality
     */
    create: async (data) => {
        const response = await api.post('/specialities', data);
        return response.data.data;
    },

    /**
     * Update speciality
     */
    update: async (id, data) => {
        const response = await api.put(`/specialities/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete speciality
     */
    delete: async (id) => {
        const response = await api.delete(`/specialities/${id}`);
        return response.data;
    }
};

export default specialityService;
