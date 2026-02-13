import API from '../axios';

const taskService = {
    getTasks: async (params = {}) => {
        const response = await API.get('/tasks', { params });
        return response.data.data;
    },
    getStats: async () => {
        const response = await API.get('/tasks/stats');
        return response.data.data;
    },
    createTask: async (taskData) => {
        const response = await API.post('/tasks', taskData);
        return response.data.data;
    },
    updateTask: async (id, taskData) => {
        const response = await API.put(`/tasks/${id}`, taskData);
        return response.data.data;
    },
    deleteTask: async (id) => {
        const response = await API.delete(`/tasks/${id}`);
        return response.data;
    }
};

export default taskService;
