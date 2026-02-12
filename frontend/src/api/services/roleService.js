import api from '../axios';

const roleService = {
    // Get all roles
    getRoles: async () => {
        const response = await api.get('/roles');
        return response.data.data;
    },

    getAll: async () => {
        const response = await api.get('/roles');
        return response.data.data;
    },

    // Get single role
    getRole: async (id) => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },

    // Create role
    createRole: async (data) => {
        const response = await api.post('/roles', data);
        return response.data;
    },

    // Update role
    updateRole: async (id, data) => {
        const response = await api.put(`/roles/${id}`, data);
        return response.data;
    },

    // Delete role
    deleteRole: async (id) => {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    }
};

export default roleService;
