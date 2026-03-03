import api from '../axios';

const aiStudyService = {
    generateQuiz: async (resourceId) => {
        const response = await api.post(`/ai-study/generate-quiz/${resourceId}`);
        return response.data;
    }
};

export default aiStudyService;
