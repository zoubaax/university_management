import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import classService from '../../../api/services/classService';
import specialityService from '../../../api/services/specialityService';

export const useClasses = () => {
    const [classes, setClasses] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [classesData, specialitiesData] = await Promise.all([
                classService.getAll(),
                specialityService.getAll()
            ]);
            setClasses(classesData || []);
            setSpecialities(specialitiesData || []);
        } catch (err) {
            setError(err);
            toast.error('Failed to load class data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createClass = async (data) => {
        try {
            await classService.create(data);
            toast.success('Class created successfully');
            fetchData();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to create class';
            toast.error(msg);
            return false;
        }
    };

    const updateClass = async (id, data) => {
        try {
            await classService.update(id, data);
            toast.success('Class updated successfully');
            fetchData();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || 'Update failed';
            toast.error(msg);
            return false;
        }
    };

    const deleteClass = async (id, className) => {
        try {
            await classService.delete(id);
            toast.success(
                <span>
                    Class <b>{className}</b> deleted
                </span>,
                { icon: '🗑️' }
            );
            fetchData();
            return true;
        } catch (err) {
            toast.error('Failed to delete class');
            return false;
        }
    };

    return {
        classes,
        specialities,
        loading,
        error,
        createClass,
        updateClass,
        deleteClass,
        refresh: fetchData
    };
};
