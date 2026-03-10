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
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[dayIndex];
        return schedules
            .filter(s => s.day_of_week === dayName)
            .map(s => ({
                ...s,
                professor_name: s.professor_name || (s.professor_first_name ? `${s.professor_first_name} ${s.professor_last_name}` : 'Professor')
            }))
            .sort((a, b) => {
                // If specific times exist, use them
                if (a.start_time && b.start_time) {
                    return a.start_time.localeCompare(b.start_time);
                }
                // Otherwise sort by slot_type (MORNING < AFTERNOON)
                const slotOrder = { 'MORNING': 1, 'AFTERNOON': 2 };
                return (slotOrder[a.slot_type] || 3) - (slotOrder[b.slot_type] || 3);
            });
    };

    return { schedules, loading, getDailySchedule, refresh: fetchSchedules };
};

/**
 * Hook to manage student grades
 */
export const useGrades = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const response = await api.get('/grades/my-grades');
            setGrades(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch grades:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchGrades();
        }
    }, [user]);

    // Group grades by module
    const groupedGrades = grades.reduce((acc, row) => {
        const moduleName = row.module_name || 'Unknown Module';
        if (!acc[moduleName]) acc[moduleName] = [];

        if (row.cc1 !== null && row.cc1 !== undefined) {
            acc[moduleName].push({ type: 'Continuous Assessment 1', value: row.cc1, weight: 0.2 });
        }
        if (row.cc2 !== null && row.cc2 !== undefined) {
            acc[moduleName].push({ type: 'Continuous Assessment 2', value: row.cc2, weight: 0.2 });
        }
        if (row.exam !== null && row.exam !== undefined) {
            acc[moduleName].push({ type: 'Final Exam', value: row.exam, weight: 0.6 });
        }

        return acc;
    }, {});

    return { grades, groupedGrades, loading, refresh: fetchGrades };
};

/**
 * Hook to manage course materials (PDF, Slides, etc)
 */
export const useCourseMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchMaterials = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await api.get('/course-resources/my-resources');
            setMaterials(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [user]);

    // Group materials by category or module
    const groupedMaterials = materials.reduce((acc, resource) => {
        const category = resource.type || 'COURSE';
        if (!acc[category]) acc[category] = [];
        acc[category].push(resource);
        return acc;
    }, {});

    return { materials, groupedMaterials, loading, refresh: fetchMaterials };
};
