import api from '../axios';

const scheduleService = {
    getByClass: async (classId) => {
        const response = await api.get(`/schedules/class/${classId}`);
        return response.data.data;
    },

    getByProfessor: async (professorId, weekOffset = 0) => {
        const response = await api.get(`/schedules/professor/${professorId}`, {
            params: { weekOffset }
        });
        return response.data.data;
    },

    upsert: async (data) => {
        const response = await api.post('/schedules', data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/schedules/${id}`);
        return response.data;
    },

    checkRoomAvailability: async (room, day, slot, classId = null) => {
        const params = new URLSearchParams({ room, day, slot });
        if (classId) params.append('classId', classId);
        const response = await api.get(`/schedules/check-room?${params.toString()}`);
        return response.data.data;
    },

    generate: async (classId, apply = false) => {
        const response = await api.post(`/schedules/generate/${classId}`, { apply });
        return response.data;
    }
};

export default scheduleService;
