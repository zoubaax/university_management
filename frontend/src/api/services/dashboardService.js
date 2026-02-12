import api from '../axios';

const dashboardService = {
    getAdminStats: async () => {
        const response = await api.get('/dashboard/admin-stats');
        return response.data.data;
    }
};

export default dashboardService;
