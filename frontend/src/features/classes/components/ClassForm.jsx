import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { School, BookOpen, Calendar, Save, Loader2, Layers, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const classSchema = z.object({
    speciality_id: z.string().uuid('Please select an academic program'),
    name: z.string()
        .min(2, 'Class name must be at least 2 characters')
        .max(50, 'Class name is too long'),
    level: z.string().min(1, 'Level is required'),
    academic_year: z.string()
        .regex(/^\d{4}\/\d{4}$/, 'Format must be YYYY/YYYY (e.g., 2023/2024)')
        .refine((year) => {
            const [start, end] = year.split('/').map(Number);
            return end === start + 1;
        }, 'Academic year must be consecutive (e.g., 2023/2024)'),
});

const ClassForm = ({ onSubmit, specialities, onCancel, initialValues, isEditing }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, isDirty, touchedFields },
        watch,
        setValue,
        trigger,
    } = useForm({
        resolver: zodResolver(classSchema),
        defaultValues: initialValues || {
            academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
        },
        mode: 'onChange'
    });

    const specialityId = watch('speciality_id');
    const className = watch('name');
    const level = watch('level');
    const academicYear = watch('academic_year');
    const nameTouched = touchedFields.name;
    const yearTouched = touchedFields.academic_year;

    const selectedSpeciality = specialityId 
        ? specialities.find(s => s.id === specialityId)
        : null;

    const levelOptions = [
        { value: '1st Year', label: '1st Year', description: 'First academic year' },
        { value: '2nd Year', label: '2nd Year', description: 'Second academic year' },
        { value: '3rd Year', label: '3rd Year', description: 'Third academic year' },
        { value: '4th Year', label: '4th Year', description: 'Fourth academic year' },
        { value: '5th Year', label: '5th Year', description: 'Fifth academic year' },
        { value: 'Master 1', label: 'Master 1', description: 'First year of Master\'s' },
        { value: 'Master 2', label: 'Master 2', description: 'Second year of Master\'s' },
        { value: 'Doctorate', label: 'Doctorate', description: 'Doctoral program' },
    ];

    const generateClassCode = () => {
        if (!selectedSpeciality || !level) return '';
        const programCode = selectedSpeciality.name.substring(0, 3).toUpperCase();
        const levelCode = level.includes('Master') ? 'M' : 
                         level.includes('Doctorate') ? 'D' : 
                         level[0];
        return `${programCode}${levelCode}-A`;
    };

    useEffect(() => {
        if (selectedSpeciality && level && !className && !isEditing) {
            const suggestedName = generateClassCode();
            setValue('name', suggestedName, { shouldValidate: true });
        }
    }, [selectedSpeciality, level, className, setValue, isEditing]);

    const isNameValid = className && !errors.name;
    const isYearValid = academicYear && !errors.academic_year;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gray-900 rounded-lg">
                    <School className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {isEditing ? 'Edit Academic Class' : 'Create New Class'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEditing ? 'Update class details and configuration' : 'Configure a new academic group for students'}
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Academic Program Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        Academic Program
                        <span className="text-xs text-red-500 ml-1">*</span>
                    </label>
                    <Select
                        placeholder="Select an academic program..."
                        leftIcon={<BookOpen className="w-4 h-4 text-gray-400" />}
                        options={specialities.map(s => ({
                            value: s.id,
                            label: s.name,
                            description: s.department_name
                        }))}
                        {...register('speciality_id', {
                            onChange: () => trigger('speciality_id')
                        })}
                        error={errors.speciality_id?.message}
                        disabled={isEditing}
                        autoFocus={!isEditing}
                    />
                </div>

                {/* Selected Program Preview */}
                {selectedSpeciality && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-blue-900 truncate">
                                    {selectedSpeciality.name}
                                </p>
                                <p className="text-xs text-blue-700 mt-0.5">
                                    Department: {selectedSpeciality.department_name}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Level Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-gray-500" />
                            Academic Level
                            <span className="text-xs text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            placeholder="Select academic level..."
                            leftIcon={<Layers className="w-4 h-4 text-gray-400" />}
                            options={levelOptions.map(opt => ({
                                value: opt.value,
                                label: opt.label,
                                description: opt.description
                            }))}
                            {...register('level', {
                                onChange: () => trigger('level')
                            })}
                            error={errors.level?.message}
                        />
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                Academic Year
                                <span className="text-xs text-red-500 ml-1">*</span>
                            </label>
                            {yearTouched && (
                                <span className={cn(
                                    "text-xs flex items-center gap-1",
                                    isYearValid ? "text-green-600" : "text-red-600"
                                )}>
                                    {isYearValid ? (
                                        <>
                                            <CheckCircle className="w-3 h-3" />
                                            Valid
                                        </>
                                    ) : errors.academic_year ? (
                                        <>
                                            <AlertCircle className="w-3 h-3" />
                                            Invalid
                                        </>
                                    ) : null}
                                </span>
                            )}
                        </div>
                        <Input
                            placeholder="YYYY/YYYY (e.g., 2023/2024)"
                            leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                            {...register('academic_year', {
                                onChange: () => trigger('academic_year')
                            })}
                            error={errors.academic_year?.message}
                        />
                        <p className="text-xs text-gray-500">
                            Format: Start Year / End Year
                        </p>
                    </div>
                </div>

                {/* Class Name */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <School className="w-4 h-4 text-gray-500" />
                            Class Name
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
                        placeholder="Enter class name (e.g., GI1-A, M1-DS)"
                        leftIcon={<School className="w-4 h-4 text-gray-400" />}
                        {...register('name', {
                            onChange: () => trigger('name')
                        })}
                        error={errors.name?.message}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Use standard naming convention for your institution
                        </p>
                        {!isEditing && selectedSpeciality && level && (
                            <button
                                type="button"
                                onClick={() => setValue('name', generateClassCode(), { shouldValidate: true })}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Suggest name
                            </button>
                        )}
                    </div>
                </div>

                {/* Class Preview */}
                {(className || level || academicYear) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                        <div className="flex items-center gap-2 mb-3">
                            <School className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Class Preview</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Class:</span>
                                <span className="text-sm font-medium text-gray-900">{className || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Level:</span>
                                <span className="text-sm font-medium text-gray-900">{level || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Academic Year:</span>
                                <span className="text-sm font-medium text-gray-900">{academicYear || '—'}</span>
                            </div>
                            {selectedSpeciality && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Program:</span>
                                    <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                                        {selectedSpeciality.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Validation Summary */}
                {(!isValid && Object.keys(errors).length > 0) && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-red-800">Please fix the following issues:</p>
                                <ul className="text-xs text-red-700 space-y-0.5">
                                    {errors.speciality_id && <li className="flex items-center gap-1">• Select an academic program</li>}
                                    {errors.name && <li className="flex items-center gap-1">• {errors.name.message}</li>}
                                    {errors.level && <li className="flex items-center gap-1">• Select an academic level</li>}
                                    {errors.academic_year && <li className="flex items-center gap-1">• {errors.academic_year.message}</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                    disabled={isSubmitting || !isValid || (isEditing && !isDirty)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    icon={isEditing ? undefined : School}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isEditing ? 'Updating...' : 'Creating...'}
                        </span>
                    ) : isEditing ? (
                        isDirty ? 'Save Changes' : 'No Changes'
                    ) : (
                        'Create Class'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ClassForm;