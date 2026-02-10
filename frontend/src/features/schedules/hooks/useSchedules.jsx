import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import scheduleService from '../../../api/services/scheduleService';

export const useSchedules = (classId) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSchedules = useCallback(async () => {
        if (!classId) return;
        setLoading(true);
        try {
            const data = await scheduleService.getByClass(classId);
            setSchedules(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch schedules');
        } finally {
            setLoading(false);
        }
    }, [classId]);

    const upsertSchedule = async (data) => {
        try {
            const result = await scheduleService.upsert(data);
            toast.success('Schedule updated successfully');
            fetchSchedules();
            return result;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update schedule';
            toast.error(msg);
            throw err;
        }
    };

    const deleteSchedule = async (id) => {
        try {
            await scheduleService.delete(id);
            toast.success('Schedule slot cleared');
            fetchSchedules();
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to clear schedule';
            toast.error(msg);
            return false;
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    return {
        schedules,
        loading,
        error,
        upsertSchedule,
        deleteSchedule,
        refresh: fetchSchedules
    };
};
