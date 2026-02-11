import API from '../axios';

const studentAttendanceService = {
    // Get attendance for a session
    getSessionAttendance: async (scheduleId, date) => {
        try {
            const response = await API.get(`/student-attendance/session/${scheduleId}`, {
                params: { date }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Record attendance for a session
    recordSessionAttendance: async (scheduleId, date, students) => {
        try {
            const response = await API.post(`/student-attendance/session/${scheduleId}`, {
                date,
                students
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get student attendance history
    getStudentAttendance: async (studentId) => {
        try {
            const response = await API.get(`/student-attendance/student/${studentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default studentAttendanceService;
