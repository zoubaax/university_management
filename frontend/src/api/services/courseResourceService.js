import API from '../axios';

const courseResourceService = {
    // Get all resources for a class
    getClassResources: async (classId) => {
        try {
            const response = await API.get(`/course-resources/class/${classId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get resources for a professor
    getProfessorResources: async (professorId) => {
        try {
            const response = await API.get(`/course-resources/professor/${professorId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new resource (Multipart form data for file)
    createResource: async (formData) => {
        try {
            const response = await API.post('/course-resources', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update resource info
    updateResource: async (id, data) => {
        try {
            const response = await API.put(`/course-resources/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a resource
    deleteResource: async (id) => {
        try {
            const response = await API.delete(`/course-resources/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default courseResourceService;
