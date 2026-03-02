import api from '../axios';

const payrollService = {
    /**
     * Get payroll for a specific month
     * @param {string} month YYYY-MM
     */
    getPayroll: async (month) => {
        const response = await api.get(`/payroll?month=${month}`);
        return response.data;
    },

    /**
     * Generate or Refresh payroll for a month
     * @param {string} month YYYY-MM
     */
    generatePayroll: async (month) => {
        const response = await api.post('/payroll/generate', { month });
        return response.data;
    },

    /**
     * Update payroll status (APPROVE, PAID)
     */
    updateStatus: async (id, status) => {
        const response = await api.put(`/payroll/${id}/status`, { status });
        return response.data;
    }
};

export default payrollService;
