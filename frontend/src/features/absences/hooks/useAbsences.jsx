import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import absenceService from '../../../api/services/absenceService';
import staffService from '../../../api/services/staffService';

export const useAbsences = () => {
    const [absences, setAbsences] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [absencesData, employeesData] = await Promise.all([
                absenceService.getAll(),
                staffService.getAll()
            ]);
            setAbsences(absencesData || []);
            setEmployees(employeesData || []);
        } catch (err) {
            setError(err);
            toast.error('Failed to load absence data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const registerAbsence = async (data) => {
        try {
            await absenceService.create(data);
            toast.success('Absence recorded successfully');
            fetchData();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to record absence';
            toast.error(msg);
            return false;
        }
    };

    const updateAbsence = async (id, data) => {
        try {
            await absenceService.update(id, data);
            toast.success('Absence record updated');
            fetchData();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || 'Update failed';
            toast.error(msg);
            return false;
        }
    };

    const deleteAbsence = async (id, employeeName) => {
        try {
            await absenceService.delete(id);
            toast.success(
                <span>
                    Absence for <b>{employeeName}</b> removed
                </span>,
                { icon: '🗑️' }
            );
            fetchData();
            return true;
        } catch (err) {
            toast.error('Failed to remove record');
            return false;
        }
    };

    const getFilteredAbsences = (filterText) => {
        if (!filterText) return absences;
        const search = filterText.toLowerCase();
        return absences.filter(a =>
            `${a.first_name} ${a.last_name}`.toLowerCase().includes(search) ||
            a.type.toLowerCase().includes(search) ||
            (a.department_name && a.department_name.toLowerCase().includes(search))
        );
    };

    return {
        absences,
        employees,
        loading,
        error,
        registerAbsence,
        updateAbsence,
        deleteAbsence,
        getFilteredAbsences,
        refresh: fetchData
    };
};
