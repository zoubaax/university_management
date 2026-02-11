import axios from '../axios';

const gradeService = {
    // Get grades for a specific class and module
    getClassGrades: async (classId, moduleId, academicYear) => {
        const response = await axios.get(`/grades/class/${classId}/module/${moduleId}`, {
            params: { academicYear }
        });
        return response.data;
    },

    // Upsert grades (bulk update)
    upsertGrades: async (grades) => {
        const response = await axios.post('/grades/upsert-bulk', { grades });
        return response.data;
    },

    // Get my grades (Student view)
    getMyGrades: async (academicYear) => {
        const response = await axios.get('/grades/my-grades', {
            params: { academicYear }
        });
        return response.data;
    }
};

export default gradeService;
