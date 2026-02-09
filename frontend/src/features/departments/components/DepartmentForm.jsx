import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Info, Type } from 'lucide-react';

import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';

const departmentSchema = z.object({
    name: z.string()
        .min(2, 'Department name must be at least 2 characters')
        .max(100, 'Department name is too long'),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
});

const DepartmentForm = ({ initialValues, onSubmit, onCancel }) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isValid, isDirty },
        watch,
    } = useForm({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: '',
            description: ''
        },
        mode: 'onChange'
    });

    const nameValue = watch('name');
    const descriptionValue = watch('description');

    useEffect(() => {
        if (initialValues) {
            setValue('name', initialValues.name, { shouldValidate: true });
            setValue('description', initialValues.description || '', { shouldValidate: true });
        } else {
            reset({ name: '', description: '' });
        }
    }, [initialValues, setValue, reset]);

    const handleFormSubmit = (data) => {
        const payload = {
            ...data,
            description: data.description?.trim() || null
        };
        onSubmit(payload);
    };

    const characterCount = descriptionValue?.length || 0;
    const maxDescriptionLength = 500;

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        {initialValues ? 'Edit Department' : 'New Department'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {initialValues ? 'Update department information' : 'Add a new department to your institution'}
                    </p>
                </div>
            </div>

            {/* Department Name */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Department Name
                </label>
                <Input
                    placeholder="Enter department name (e.g., Computer Science)"
                    leftIcon={<Type className="w-4 h-4 text-gray-400" />}
                    {...register('name')}
                    error={errors.name?.message}
                    autoFocus
                />
                {nameValue && !errors.name && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        ✓ Valid department name
                    </p>
                )}
            </div>

            {/* Department Description */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Description
                        <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <span className={`text-xs ${characterCount > maxDescriptionLength ? 'text-red-500' : 'text-gray-400'}`}>
                        {characterCount}/{maxDescriptionLength}
                    </span>
                </div>
                <Textarea
                    placeholder="Describe the department's focus, responsibilities, and purpose..."
                    leftIcon={<Info className="w-4 h-4 text-gray-400" />}
                    rows={4}
                    {...register('description')}
                    error={errors.description?.message}
                />
                <p className="text-xs text-gray-500">
                    Provide context about this department's role within the institution.
                </p>
            </div>

            {/* Preview Card */}
            {(nameValue || descriptionValue) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Preview</span>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 truncate">
                            {nameValue || 'Department Name'}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {descriptionValue || 'No description provided'}
                        </p>
                    </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
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
                    disabled={isSubmitting || !isValid || (!isDirty && initialValues)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                >
                    {initialValues ? (
                        isDirty ? 'Save Changes' : 'No Changes'
                    ) : (
                        'Create Department'
                    )}
                </Button>
            </div>

            {/* Form Status */}
            <div className="text-center">
                {isSubmitting && (
                    <p className="text-sm text-gray-500 animate-pulse">
                        {initialValues ? 'Updating department...' : 'Creating department...'}
                    </p>
                )}
            </div>
        </form>
    );
};

export default DepartmentForm;