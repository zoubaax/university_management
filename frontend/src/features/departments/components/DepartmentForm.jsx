import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Info, Type, CheckCircle, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const departmentSchema = z.object({
    name: z.string()
        .min(2, 'Department name must be at least 2 characters')
        .max(100, 'Department name is too long'),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    yearly_price: z.preprocess((val) => parseFloat(val), z.number().min(0, 'Price must be 0 or more')),
});

const DepartmentForm = ({ initialValues, onSubmit, onCancel }) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isValid, isDirty, touchedFields },
        watch,
        trigger,
    } = useForm({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: '',
            description: '',
            yearly_price: 0
        },
        mode: 'onChange'
    });

    const nameValue = watch('name');
    const descriptionValue = watch('description');
    const nameTouched = touchedFields.name;
    const descriptionTouched = touchedFields.description;

    useEffect(() => {
        if (initialValues) {
            setValue('name', initialValues.name, { shouldValidate: true });
            setValue('description', initialValues.description || '', { shouldValidate: true });
            setValue('yearly_price', initialValues.yearly_price || 0, { shouldValidate: true });
        } else {
            reset({ name: '', description: '', yearly_price: 0 });
        }
    }, [initialValues, setValue, reset]);

    const handleFormSubmit = (data) => {
        const payload = {
            ...data,
            description: data.description?.trim() || null,
            yearly_price: parseFloat(data.yearly_price)
        };
        onSubmit(payload);
    };

    const characterCount = descriptionValue?.length || 0;
    const maxDescriptionLength = 500;
    const hasChanges = isDirty || !initialValues;
    const isNameValid = nameValue && !errors.name;
    const isDescriptionValid = descriptionValue && !errors.description;

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gray-900 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {initialValues ? 'Edit Department' : 'Create New Department'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {initialValues ? 'Update department details' : 'Add a new academic department'}
                    </p>
                </div>
            </div>

            {/* Department Name */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-gray-500" />
                        Department Name
                        <span className="text-xs text-red-500 ml-1">*</span>
                    </label>
                    {nameTouched && (
                        <span className={cn(
                            "text-xs flex items-center gap-1",
                            isNameValid ? "text-green-600" : "text-red-600"
                        )}>
                            {isNameValid ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    Valid
                                </>
                            ) : errors.name ? (
                                <>
                                    <AlertCircle className="w-3 h-3" />
                                    Required
                                </>
                            ) : null}
                        </span>
                    )}
                </div>
                <Input
                    placeholder="e.g., Computer Science, Business Administration"
                    leftIcon={<Type className="w-4 h-4 text-gray-400" />}
                    {...register('name', {
                        onChange: () => trigger('name')
                    })}
                    error={errors.name?.message}
                    autoFocus
                    className="py-3"
                />
                <p className="text-xs text-gray-500">
                    Enter the official name of the department as it appears in institutional records.
                </p>
            </div>

            {/* Department Yearly Price */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-gray-500" />
                    Base Yearly Tuition (MAD)
                    <span className="text-xs text-red-500 ml-1">*</span>
                </label>
                <Input
                    type="number"
                    placeholder="0.00"
                    leftIcon={<Banknote className="w-4 h-4 text-gray-400" />}
                    {...register('yearly_price')}
                    error={errors.yearly_price?.message}
                />
                <p className="text-xs text-gray-400">
                    This is the default price for all programs in this department.
                </p>
            </div>

            {/* Department Description */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-gray-500" />
                        Description
                        <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-2">
                        {descriptionTouched && isDescriptionValid && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Valid
                            </span>
                        )}
                        <span className={cn(
                            "text-xs",
                            characterCount > maxDescriptionLength ? "text-red-500" : "text-gray-400",
                            characterCount > maxDescriptionLength * 0.9 && "font-medium"
                        )}>
                            {characterCount}/{maxDescriptionLength}
                        </span>
                    </div>
                </div>
                <Textarea
                    placeholder="Describe the department's mission, focus areas, academic programs, and key responsibilities..."
                    leftIcon={<Info className="w-4 h-4 text-gray-400" />}
                    rows={3}
                    {...register('description', {
                        onChange: () => trigger('description')
                    })}
                    error={errors.description?.message}
                    className="py-3"
                />
                <div className="flex items-start justify-between">
                    <p className="text-xs text-gray-500 flex-1">
                        Provide context about the department's academic focus and institutional role.
                    </p>
                    {characterCount > maxDescriptionLength && (
                        <p className="text-xs text-red-600 flex items-center gap-1 ml-2">
                            <AlertCircle className="w-3 h-3" />
                            Too long
                        </p>
                    )}
                </div>
            </div>

            {/* Preview Card */}
            {(nameValue || descriptionValue) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-gray-100 rounded">
                            <Building2 className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Preview</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                                {nameValue || 'Department Name'}
                            </h4>
                            {descriptionValue ? (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {descriptionValue}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 italic mt-1">
                                    No description provided
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500">ID: {initialValues?.id ? `DEPT-${initialValues.id.slice(0, 8).toUpperCase()}` : 'New'}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">Status: Active</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Validation Summary */}
            {(!isValid && (nameTouched || descriptionTouched)) && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-red-800">Please fix the following issues:</p>
                            <ul className="text-xs text-red-700 space-y-0.5">
                                {errors.name && <li className="flex items-center gap-1">• {errors.name.message}</li>}
                                {errors.description && <li className="flex items-center gap-1">• {errors.description.message}</li>}
                            </ul>
                        </div>
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
                    disabled={isSubmitting || !isValid || (initialValues && !hasChanges)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    icon={initialValues ? undefined : Building2}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {initialValues ? 'Saving...' : 'Creating...'}
                        </span>
                    ) : initialValues ? (
                        hasChanges ? 'Save Changes' : 'No Changes'
                    ) : (
                        'Create Department'
                    )}
                </Button>
            </div>

            {/* Form Status */}
            <div className="text-center">
                {isSubmitting && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-gray-900 rounded-full animate-pulse" />
                        <p className="text-xs text-gray-600">
                            {initialValues ? 'Updating department records...' : 'Creating new department...'}
                        </p>
                    </div>
                )}
            </div>
        </form>
    );
};

export default DepartmentForm;