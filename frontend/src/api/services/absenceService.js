import api from '../axios';

/**
 * Service for handling Absence management
 */
const absenceService = {
    /**
     * Fetch all absences
     */
    getAll: async () => {
        const response = await api.get('/absences');
        return response.data.data;
    },

    /**
     * Fetch a single absence
     */
    getById: async (id) => {
        const response = await api.get(`/absences/${id}`);
        return response.data.data;
    },

    /**
     * Fetch absences for a specific employee
     */
    getByEmployee: async (employeeId) => {
        const response = await api.get(`/absences/employee/${employeeId}`);
        return response.data.data;
    },

    /**
     * Create an absence record
     */
    create: async (data) => {
        const response = await api.post('/absences', data, {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
            }
        });
        return response.data.data;
    },

    /**
     * Update an absence record
     */
    update: async (id, data) => {
        const response = await api.put(`/absences/${id}`, data, {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
            }
        });
        return response.data.data;
    },

    /**
     * Delete an absence record
     */
    delete: async (id) => {
        const response = await api.delete(`/absences/${id}`);
        return response.data;
    }
};

export default absenceService;
