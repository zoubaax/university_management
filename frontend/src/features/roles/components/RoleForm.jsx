import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, Shield, Lock } from 'lucide-react';

const PERMISSIONS_LIST = [
    {
        category: 'User Management', items: [
            { id: 'manage_students', label: 'Manage Students' },
            { id: 'manage_staff', label: 'Manage Human Resources' },
            { id: 'manage_departments', label: 'Manage Departments' },
        ]
    },
    {
        category: 'Academic', items: [
            { id: 'manage_specialities', label: 'Manage Specialities' },
            { id: 'manage_classes', label: 'Manage Classes' },
            { id: 'manage_modules', label: 'Manage Modules' },
            { id: 'manage_grades', label: 'Manage Grades' },
            { id: 'manage_certificates', label: 'Manage Certificates' },
            { id: 'request_certificate', label: 'Request Certificates' },
            { id: 'upload_resources', label: 'Manage Course Materials' },
        ]
    },
    {
        category: 'Attendance & Planning', items: [
            { id: 'manage_absences', label: 'Manage Staff Absences' },
            { id: 'manage_student_absences', label: 'Manage Student Absences' },
            { id: 'manage_schedules', label: 'Manage Schedules' },
            { id: 'manage_rooms', label: 'Manage Rooms' },
        ]
    },
    {
        category: 'System & Reports', items: [
            { id: 'manage_roles', label: 'Manage Roles' },
            { id: 'manage_system', label: 'Manage System Settings' },
        ]
    },
    {
        category: 'Finance & Administration', items: [
            { id: 'manage_finance', label: 'Manage Finance & Accounting' },
        ]
    },
    {
        category: 'Clubs & Student Life', items: [
            { id: 'manage_clubs', label: 'Manage Clubs & Societies' },
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

                {/* Permissions Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Lock size={20} className="text-indigo-600" />
                            Role Permissions
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                            <input
                                type="checkbox"
                                id="select-all"
                                className="w-4 h-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        const allIds = PERMISSIONS_LIST.flatMap(c => c.items.map(i => i.id));
                                        setFormData(prev => ({ ...prev, permissions: allIds }));
                                    } else {
                                        setFormData(prev => ({ ...prev, permissions: [] }));
                                    }
                                }}
                                checked={formData.permissions.length === PERMISSIONS_LIST.flatMap(c => c.items.map(i => i.id)).length}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium text-gray-600 cursor-pointer">
                                Select All Permissions
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {PERMISSIONS_LIST.map((category) => (
                            <div key={category.category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                        {category.category}
                                    </h4>
                                </div>
                                <div className="p-5 space-y-4">
                                    {category.items.map((permission) => {
                                        const isSelected = formData.permissions.includes(permission.id);
                                        return (
                                            <div
                                                key={permission.id}
                                                onClick={() => togglePermission(permission.id)}
                                                className="flex items-center gap-3 group cursor-pointer"
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100'
                                                    : 'border-gray-300 bg-white group-hover:border-indigo-300'
                                                    }`}>
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                                                    }`}>
                                                    {permission.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
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
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-lg shadow-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Check size={18} />
                    {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Role')}
                </button>
            </div>
        </form>
    );
};

export default RoleForm;
