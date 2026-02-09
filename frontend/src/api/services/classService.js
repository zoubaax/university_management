import api from '../axios';

const classService = {
    getAll: async () => {
        const response = await api.get('/classes');
        return response.data.data;
    },

    getById: async (id) => {
        const response = await api.get(`/classes/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await api.post('/classes', data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/classes/${id}`, data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/classes/${id}`);
        return response.data;
    }
};

export default classService;
