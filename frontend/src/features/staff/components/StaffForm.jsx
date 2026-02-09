import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BadgeCheck, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const staffSchema = z.object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    type: z.enum(['ADMINISTRATIVE', 'PROFESSOR', 'CLEANER', 'SECURITY', 'MAINTENANCE']),
    department_id: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    role_id: z.string().min(36, 'Please select a role').optional(),
}).refine((data) => {
    const NO_LOGIN_TYPES = ['CLEANER', 'SECURITY', 'MAINTENANCE'];
    const requiresLogin = !NO_LOGIN_TYPES.includes(data.type);
    if (requiresLogin) {
        return !!data.email && !!data.password && !!data.role_id;
    }
    return true;
}, {
    message: "Email, Password, and Role are required for this employee type",
    path: ["role_id"],
});

const StaffForm = ({ onSubmit, departments, roles, onCancel, initialValues }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setValue
    } = useForm({
        resolver: zodResolver(staffSchema),
        defaultValues: initialValues || {
            type: 'PROFESSOR'
        }
    });

    const selectedType = watch('type');
    const NO_LOGIN_TYPES = ['CLEANER', 'SECURITY', 'MAINTENANCE'];
    const requiresLogin = !NO_LOGIN_TYPES.includes(selectedType);

    // Effect to pre-select role if needed is handled by passing initialValues

    const handleFormSubmit = (data) => {
        const payload = { ...data };
        if (!payload.department_id) payload.department_id = null;
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
                <Input
                    label="First Name"
                    placeholder="e.g. Jean"
                    {...register('first_name')}
                    error={errors.first_name?.message}
                />
                <Input
                    label="Last Name"
                    placeholder="e.g. Dupont"
                    {...register('last_name')}
                    error={errors.last_name?.message}
                />
            </div>

            <div className="grid grid-cols-2 gap-8">
                <Select
                    label="Function"
                    options={[
                        { value: 'PROFESSOR', label: 'Professor' },
                        { value: 'ADMINISTRATIVE', label: 'Administrative' },
                        { value: 'CLEANER', label: 'Cleaner' },
                        { value: 'SECURITY', label: 'Security' },
                        { value: 'MAINTENANCE', label: 'Maintenance' },
                    ]}
                    {...register('type')}
                    error={errors.type?.message}
                />
                <Select
                    label="Department Assignment"
                    placeholder="General Institution"
                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                    {...register('department_id')}
                    error={errors.department_id?.message}
                />
            </div>

            {requiresLogin && (
                <div className="space-y-4">
                    <Select
                        label="System Role"
                        placeholder="Select Access Role"
                        options={roles.map(r => ({ value: r.id, label: r.name }))}
                        {...register('role_id')}
                        error={errors.role_id?.message}
                    />
                </div>
            )}

            {requiresLogin && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-primary-50/50 rounded-[2rem] border border-primary-100 space-y-6"
                >
                    <div className="flex items-center gap-3 text-primary-700">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <BadgeCheck size={20} />
                        </div>
                        <h3 className="font-black uppercase tracking-widest text-xs">Digital Access Setup</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <Input
                            label="Work Email"
                            type="email"
                            placeholder="staff@upf.edu.ma"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Temporary Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            error={errors.password?.message}
                        />
                    </div>
                </motion.div>
            )}

            <div className="flex gap-4 pt-6">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1 h-14"
                >
                    Discard
                </Button>
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    icon={UserPlus}
                    className="flex-[2] h-14"
                >
                    Register Employee
                </Button>
            </div>
        </form>
    );
};

export default StaffForm;
