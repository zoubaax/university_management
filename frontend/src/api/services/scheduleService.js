import api from '../axios';

const scheduleService = {
    getByClass: async (classId) => {
        const response = await api.get(`/schedules/class/${classId}`);
        return response.data.data;
    },

    upsert: async (data) => {
        const response = await api.post('/schedules', data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/schedules/${id}`);
        return response.data;
    }
};

export default scheduleService;
