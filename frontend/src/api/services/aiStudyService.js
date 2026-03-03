import api from '../axios';

const aiStudyService = {
    generateQuiz: async (resourceId) => {
        const response = await api.post(`/ai-study/generate-quiz/${resourceId}`);
        return response.data;
    },
    saveResult: async (data) => {
        const response = await api.post('/ai-study/save-result', data);
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/ai-study/history');
        return response.data;
    }
};

export default aiStudyService;
