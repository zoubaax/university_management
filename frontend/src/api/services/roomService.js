import api from '../axios';

const roomService = {
    getAll: async () => {
        const response = await api.get('/rooms');
        return response.data.data;
    },

    getById: async (id) => {
        const response = await api.get(`/rooms/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await api.post('/rooms', data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/rooms/${id}`, data);
        return response.data.data;
    },

    delete: async (id) => {
        await api.delete(`/rooms/${id}`);
        return true;
    }
};

export default roomService;
