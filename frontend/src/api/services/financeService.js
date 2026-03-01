import api from '../axios';

/**
 * Service for handling Private School Finance Management
 */
const financeService = {
    /**
     * Get financial overview statistics
     */
    getStats: async () => {
        const response = await api.get('/finance/stats');
        return response.data.data;
    },

    /**
     * Get all students with their finance profiles and balances
     */
    getStudents: async (params = {}) => {
        const response = await api.get('/finance/students', { params });
        return response.data;
    },

    /**
     * Get recent payments (inbox/history)
     */
    getPayments: async () => {
        const response = await api.get('/finance/payments');
        return response.data.data;
    },

    /**
     * Record a new payment (Cash, Check, Transfer)
     */
    createPayment: async (data) => {
        const response = await api.post('/finance/payments', data);
        return response.data.data;
    },

    /**
     * Verify a pending payment (Check/Transfer)
     */
    verifyPayment: async (id) => {
        const response = await api.put(`/finance/payments/${id}/verify`);
        return response.data.data;
    },

    /**
     * Get all active partnerships/companies
     */
    getPartnerships: async () => {
        const response = await api.get('/finance/partnerships');
        return response.data.data;
    },

    /**
     * Update a student's finance plan or partnership
     */
    updateStudentProfile: async (studentId, data) => {
        const response = await api.put(`/finance/students/${studentId}/profile`, data);
        return response.data.data;
    },

    /**
     * Create a new corporate partnership
     */
    createPartnership: async (data) => {
        const response = await api.post('/finance/partnerships', data);
        return response.data.data;
    }
};

export default financeService;
