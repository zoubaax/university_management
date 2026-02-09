import api from '../axios';

const roleService = {
    getAll: async () => {
        const response = await api.get('/roles');
        return response.data.data;
    }
};

export default roleService;
