import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import staffService from '../../../api/services/staffService';
import departmentService from '../../../api/services/departmentService';
import roleService from '../../../api/services/roleService';

export const useStaff = (filterRoleName = null) => {
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]); // System roles (for RBAC)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [staffData, deptData, rolesData] = await Promise.all([
                staffService.getAll(),
                departmentService.getAll(),
                roleService.getAll()
            ]);
            setStaff(staffData || []);
            setDepartments(deptData || []);
            setRoles(rolesData || []);
        } catch (err) {
            setError(err);
            toast.error('Failed to load staff data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createStaff = async (data) => {
        try {
            await staffService.create(data);
            toast.success('Staff member registered successfully');
            fetchData(); // Refresh list
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed';
            toast.error(msg);
            return false;
        }
    };

    const updateStaff = async (id, data) => {
        try {
            await staffService.update(id, data);
            toast.success('Staff details updated');
            fetchData();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || 'Update failed';
            toast.error(msg);
            return false;
        }
    };

    const deleteStaff = async (id, name = 'this employee') => {
        try {
            await staffService.delete(id);
            toast.success(
                (t) => (
                    <span>
                        <b>{name}</b> has been successfully removed.
                    </span>
                ),
                { icon: '🗑️', duration: 4000 }
            );
            fetchData();
            return true;
        } catch (err) {
            toast.error('Action failed: ' + (err.response?.data?.error || 'Unknown error'));
            return false;
        }
    };

    // Filter logic
    const getFilteredStaff = (filterText) => {
        return staff.filter(s => {
            // Role Filtering (for specialized pages like RH Management)
            if (filterRoleName && s.role_name !== filterRoleName) return false;

            // Search Filtering
            if (!filterText) return true;

            const search = filterText.toLowerCase();
            return (
                `${s.first_name} ${s.last_name}`.toLowerCase().includes(search) ||
                s.email?.toLowerCase().includes(search) ||
                s.type.toLowerCase().includes(search) ||
                (s.role_name && s.role_name.toLowerCase().includes(search))
            );
        });
    };

    return {
        staff,
        departments,
        roles,
        loading,
        createStaff,
        updateStaff,
        deleteStaff,
        getFilteredStaff
    };
};
