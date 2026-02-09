import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BadgeCheck, UserPlus, Shield, Mail, Lock, User, Briefcase } from 'lucide-react';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const getStaffSchema = (isEditing) => z.object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    type: z.enum(['ADMINISTRATIVE', 'PROFESSOR', 'CLEANER', 'SECURITY', 'MAINTENANCE']),
    department_id: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    role_id: z.string().optional(),
}).refine((data) => {
    if (isEditing) return true; // Less restrictive on edit
    const NO_LOGIN_TYPES = ['CLEANER', 'SECURITY', 'MAINTENANCE'];
    const requiresLogin = !NO_LOGIN_TYPES.includes(data.type);
    if (requiresLogin) {
        return !!data.email && !!data.password && !!data.role_id;
    }
    return true;
}, {
    message: "Email, Password, and Role are required for new login-enabled accounts",
    path: ["role_id"],
});

const StaffForm = ({ onSubmit, departments, roles, onCancel, initialValues, isEditing }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setValue,
        trigger
    } = useForm({
        resolver: zodResolver(getStaffSchema(isEditing)),
        defaultValues: initialValues || {
            type: 'PROFESSOR'
        }
    });

    const selectedType = watch('type');
    const NO_LOGIN_TYPES = ['CLEANER', 'SECURITY', 'MAINTENANCE'];
    const requiresLogin = !NO_LOGIN_TYPES.includes(selectedType);

    // Effect to handle type changes
    useEffect(() => {
        if (!requiresLogin) {
            setValue('email', '');
            setValue('password', '');
            setValue('role_id', '');
        }
        // Re-trigger validation
        trigger(['email', 'password', 'role_id']);
    }, [selectedType, requiresLogin, setValue, trigger]);

    const handleFormSubmit = (data) => {
        const payload = { ...data };
        if (!payload.department_id) payload.department_id = null;
        onSubmit(payload);
    };

    const typeOptions = [
        { value: 'PROFESSOR', label: 'Professor', description: 'Teaching staff with system access' },
        { value: 'ADMINISTRATIVE', label: 'Administrative', description: 'Office staff with system access' },
        { value: 'CLEANER', label: 'Cleaner', description: 'Maintenance staff without system access' },
        { value: 'SECURITY', label: 'Security', description: 'Security staff without system access' },
        { value: 'MAINTENANCE', label: 'Maintenance', description: 'Technical staff without system access' },
    ];

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        placeholder="Enter first name"
                        leftIcon={<User className="w-4 h-4 text-gray-400" />}
                        {...register('first_name')}
                        error={errors.first_name?.message}
                    />
                    <Input
                        label="Last Name"
                        placeholder="Enter last name"
                        leftIcon={<User className="w-4 h-4 text-gray-400" />}
                        {...register('last_name')}
                        error={errors.last_name?.message}
                    />
                </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Employment Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Employee Type"
                        placeholder="Select employee type"
                        options={typeOptions.map(opt => ({
                            value: opt.value,
                            label: opt.label,
                            description: opt.description
                        }))}
                        {...register('type')}
                        error={errors.type?.message}
                    />
                    <Select
                        label="Department"
                        placeholder="Select department"
                        leftIcon={<Briefcase className="w-4 h-4 text-gray-400" />}
                        options={departments.map(d => ({
                            value: d.id,
                            label: d.name
                        }))}
                        {...register('department_id')}
                        error={errors.department_id?.message}
                    />
                </div>
            </div>

            {/* System Access - Conditional */}
            {requiresLogin && (
                <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">System Access</h3>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BadgeCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-800">System Access Required</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    This role requires access to the institution's systems. Please provide credentials.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Select
                                label="Access Role"
                                placeholder="Select system role"
                                leftIcon={<Shield className="w-4 h-4 text-gray-400" />}
                                options={roles.map(r => ({
                                    value: r.id,
                                    label: r.name
                                }))}
                                {...register('role_id')}
                                error={errors.role_id?.message}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Institutional Email"
                                    type="email"
                                    placeholder="name@institution.edu"
                                    leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                                    {...register('email')}
                                    error={errors.email?.message}
                                />
                                {isEditing && (
                                    <p className="text-[10px] text-blue-500 mt-1 italic">
                                        Leave empty to keep current password
                                    </p>
                                )}
                                <Input
                                    label={isEditing ? "Update Password" : "Temporary Password"}
                                    type="password"
                                    placeholder={isEditing ? "••••••••" : "Enter temporary password"}
                                    leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                                    helperText={isEditing ? "Minimum 6 characters if changing" : "Minimum 6 characters"}
                                    {...register('password')}
                                    error={errors.password?.message}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Access Notice */}
            {!requiresLogin && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Shield className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">No System Access Required</p>
                            <p className="text-xs text-gray-500 mt-1">
                                This employee type does not require access to the institution's systems.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    icon={isEditing ? Briefcase : UserPlus}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                >
                    {isEditing ? 'Update Details' : 'Create Staff'}
                </Button>
            </div>
        </form>
    );
};

export default StaffForm;