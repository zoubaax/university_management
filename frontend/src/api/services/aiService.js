import api from '../axios';

const aiService = {
    chat: async (message) => {
        const response = await api.post('/ai/chat', { message });
        return response.data;
    }
};

export default aiService;
