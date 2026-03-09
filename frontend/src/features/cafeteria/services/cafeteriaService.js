import api from '../../../api/axios';

const cafeteriaService = {
    // Menu Items
    getItems: async (params) => {
        const response = await api.get('/cafeteria/items', { params });
        return response.data;
    },

    getItem: async (id) => {
        const response = await api.get(`/cafeteria/items/${id}`);
        return response.data;
    },

    createItem: async (data) => {
        const response = await api.post('/cafeteria/items', data);
        return response.data;
    },

    updateItem: async (id, data) => {
        const response = await api.put(`/cafeteria/items/${id}`, data);
        return response.data;
    },

    deleteItem: async (id) => {
        const response = await api.delete(`/cafeteria/items/${id}`);
        return response.data;
    },

    // Wallet
    getWallet: async () => {
        const response = await api.get('/cafeteria/wallet');
        return response.data;
    },

    // Orders
    placeOrder: async (orderData) => {
        const response = await api.post('/cafeteria/orders', orderData);
        return response.data;
    },

    getOrders: async (params) => {
        const response = await api.get('/cafeteria/orders', { params });
        return response.data;
    },

    updateOrderStatus: async (id, status) => {
        const response = await api.patch(`/cafeteria/orders/${id}/status`, { status });
        return response.data;
    }
};

export default cafeteriaService;
