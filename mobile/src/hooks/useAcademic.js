import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to manage student schedules
 */
export const useSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchSchedules = async () => {
        if (!user?.class_id) return;
        try {
            setLoading(true);
            const response = await api.get(`/schedules/class/${user.class_id}`);
            setSchedules(response.data.data);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [user?.class_id]);

    const getDailySchedule = (dayIndex) => {
        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayName = days[dayIndex];
        return schedules.filter(s => s.day_of_week === dayName).sort((a, b) => a.start_time.localeCompare(b.start_time));
    };

    return { schedules, loading, getDailySchedule, refresh: fetchSchedules };
};

/**
 * Hook to manage student grades
 */
export const useGrades = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const response = await api.get('/grades/my-grades');
            setGrades(response.data.data);
        } catch (error) {
            console.error('Failed to fetch grades:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
    }, []);

    // Group grades by module
    const groupedGrades = grades.reduce((acc, grade) => {
        const moduleName = grade.module_name || 'Unknown Module';
        if (!acc[moduleName]) acc[moduleName] = [];
        acc[moduleName].push(grade);
        return acc;
    }, {});

    return { grades, groupedGrades, loading, refresh: fetchGrades };
};
