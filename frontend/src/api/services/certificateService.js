import api from '../axios';

const certificateService = {
    /**
     * Request a new certificate
     */
    request: async (type = 'ENROLLMENT') => {
        const response = await api.post('/certificates/request', { type });
        return response.data.data;
    },

    /**
     * Get student's requests
     */
    getMyRequests: async () => {
        const response = await api.get('/certificates/my-requests');
        return response.data.data;
    },

    /**
     * Get department requests (for managers)
     */
    getDepartmentRequests: async () => {
        const response = await api.get('/certificates/department-requests');
        return response.data.data;
    },

    /**
     * Approve or reject a request
     */
    process: async (id, data) => {
        const response = await api.put(`/certificates/process/${id}`, data);
        return response.data.data;
    },

    /**
     * Get full details for certificate generation
     */
    getDetails: async (id) => {
        const response = await api.get(`/certificates/details/${id}`);
        return response.data.data;
    }
};

export default certificateService;
