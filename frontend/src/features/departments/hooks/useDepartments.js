import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axios';

export const useDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/departments');
            setDepartments(response.data.data || []);
        } catch (err) {
            toast.error('Failed to load departments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const createDepartment = async (data) => {
        try {
            await api.post('/departments', data);
            toast.success('Department created successfully');
            fetchDepartments();
            return true;
        } catch (err) {
            handleError(err);
            return false;
        }
    };

    const updateDepartment = async (id, data) => {
        try {
            await api.put(`/departments/${id}`, data);
            toast.success('Department updated successfully');
            fetchDepartments();
            return true;
        } catch (err) {
            handleError(err);
            return false;
        }
    };

    const deleteDepartment = async (id) => {
        try {
            await api.delete(`/departments/${id}`);
            toast.success('Department deleted');
            fetchDepartments();
            return true;
        } catch (err) {
            toast.error('Failed to delete department');
            return false;
        }
    };

    const handleError = (err) => {
        const backendError = err.response?.data?.error;
        if (backendError && typeof backendError === 'string') {
            toast.error(backendError);
        } else {
            toast.error('Something went wrong. Please try again.');
        }
    };

    return {
        departments,
        loading,
        createDepartment,
        updateDepartment,
        deleteDepartment
    };
};
