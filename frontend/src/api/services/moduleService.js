import api from '../axios';

const moduleService = {
    getAll: async () => {
        const response = await api.get('/modules');
        return response.data.data;
    },

    getById: async (id) => {
        const response = await api.get(`/modules/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await api.post('/modules', data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/modules/${id}`, data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/modules/${id}`);
        return response.data;
    },

    assignToClass: async (data) => {
        const response = await api.post('/modules/assign', data);
        return response.data.data;
    },

    getClassModules: async (classId) => {
        const response = await api.get(`/modules/class/${classId}`);
        return response.data.data;
    },

    removeFromClass: async (classId, moduleId) => {
        const response = await api.delete(`/modules/class/${classId}/module/${moduleId}`);
        return response.data;
    }
};

export default moduleService;
