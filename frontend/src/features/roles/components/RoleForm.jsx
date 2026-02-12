import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, Shield, Lock } from 'lucide-react';

const PERMISSIONS_LIST = [
    {
        category: 'User Management', items: [
            { id: 'manage_students', label: 'Manage Students' },
            { id: 'view_students', label: 'View Students' },
            { id: 'manage_staff', label: 'Manage Human Resources' },
            { id: 'manage_departments', label: 'Manage Departments' },
        ]
    },
    {
        category: 'Academic', items: [
            { id: 'manage_specialities', label: 'Manage Specialities' },
            { id: 'view_specialities', label: 'View Specialities' },
            { id: 'manage_classes', label: 'Manage Classes' },
            { id: 'view_classes', label: 'View Classes' },
            { id: 'manage_modules', label: 'Manage Modules' },
            { id: 'view_modules', label: 'View Modules' },
            { id: 'manage_grades', label: 'Manage Grades' },
            { id: 'view_grades', label: 'View Grades' },
            { id: 'manage_certificates', label: 'Manage Certificates' },
            { id: 'request_certificate', label: 'Request Certificates' },
            { id: 'upload_resources', label: 'Upload Course Materials' },
            { id: 'view_resources', label: 'View Course Materials' },
        ]
    },
    {
        category: 'Attendance & Planning', items: [
            { id: 'manage_absences', label: 'Manage Staff Absences' },
            { id: 'view_absences', label: 'View Staff Absences' },
            { id: 'manage_student_absences', label: 'Manage Student Absences' },
            { id: 'view_student_absences', label: 'View Student Absences' },
            { id: 'manage_schedules', label: 'Manage Schedules' },
            { id: 'view_schedules', label: 'View Schedules' },
            { id: 'manage_rooms', label: 'Manage Rooms' },
            { id: 'view_rooms', label: 'View Rooms' },
        ]
    },
    {
        category: 'System & Reports', items: [
            { id: 'manage_roles', label: 'Manage Roles' },
            { id: 'manage_system', label: 'Manage System Settings' },
            { id: 'view_reports', label: 'View Attendance Reports' },
        ]
    }
];

const RoleForm = ({ onSubmit, onCancel, initialValues, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialValues) {
            setFormData({
                name: initialValues.name || '',
                description: initialValues.description || '',
                permissions: Array.isArray(initialValues.permissions) ? initialValues.permissions : []
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const togglePermission = (permissionId) => {
        setFormData(prev => {
            const currentPermissions = prev.permissions;
            if (currentPermissions.includes(permissionId)) {
                return { ...prev, permissions: currentPermissions.filter(p => p !== permissionId) };
            } else {
                return { ...prev, permissions: [...currentPermissions, permissionId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Role name is required');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role Name
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Library Manager"
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                disabled={isEditing && formData.name === 'SUPER_ADMIN'} // Prevent renaming SUPER_ADMIN
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe the role's responsibilities..."
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Permissions */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Lock size={16} className="text-gray-500" />
                        Permissions
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4 h-64 overflow-y-auto">
                        {PERMISSIONS_LIST.map((category) => (
                            <div key={category.category}>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    {category.category}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {category.items.map((permission) => (
                                        <label
                                            key={permission.id}
                                            className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${formData.permissions.includes(permission.id)
                                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.permissions.includes(permission.id)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-gray-300 bg-white'
                                                }`}>
                                                {formData.permissions.includes(permission.id) && (
                                                    <Check size={10} className="text-white" />
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.permissions.includes(permission.id)}
                                                onChange={() => togglePermission(permission.id)}
                                                disabled={isEditing && formData.name === 'SUPER_ADMIN' && permission.id === 'manage_roles'} // Prevent locking out
                                            />
                                            <span className="text-sm font-medium">{permission.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Select the permissions this role needs to access specific features.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
                </button>
            </div>
        </form>
    );
};

export default RoleForm;
