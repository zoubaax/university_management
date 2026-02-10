// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import {
//     School,
//     User,
//     Clock,
//     Link as LinkIcon
// } from 'lucide-react';
// import Select from '../../../components/ui/Select';
// import Input from '../../../components/ui/Input';
// import Button from '../../../components/ui/Button';

// const assignmentSchema = z.object({
//     class_id: z.string().uuid('Please select a class'),
//     module_id: z.string().uuid('Please select a module'),
//     professor_id: z.string().uuid('Please select a professor'),
//     hours_per_week: z.string().optional().refine(val => !val || !isNaN(parseInt(val)), 'Must be a number'),
// });

// const AssignmentForm = ({
//     onSubmit,
//     onCancel,
//     classes = [],
//     modules = [],
//     professors = [],
//     initialValues
// }) => {
//     const {
//         register,
//         handleSubmit,
//         formState: { errors, isSubmitting }
//     } = useForm({
//         resolver: zodResolver(assignmentSchema),
//         defaultValues: initialValues || {
//             hours_per_week: '4'
//         }
//     });

//     return (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <Select
//                 label="Class"
//                 placeholder="Select class..."
//                 leftIcon={<School size={16} className="text-gray-400" />}
//                 options={classes.map(c => ({ value: c.id, label: `${c.name} (${c.academic_year})` }))}
//                 {...register('class_id')}
//                 error={errors.class_id?.message}
//             />

//             <Select
//                 label="Module"
//                 placeholder="Select module..."
//                 leftIcon={<LinkIcon size={16} className="text-gray-400" />}
//                 options={modules.map(m => ({ value: m.id, label: `${m.name} (${m.code})` }))}
//                 {...register('module_id')}
//                 error={errors.module_id?.message}
//             />

//             <Select
//                 label="Professor In Charge"
//                 placeholder="Select professor..."
//                 leftIcon={<User size={16} className="text-gray-400" />}
//                 options={professors.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name}` }))}
//                 {...register('professor_id')}
//                 error={errors.professor_id?.message}
//             />

//             <Input
//                 label="Weekly Hours"
//                 type="number"
//                 placeholder="4"
//                 leftIcon={<Clock size={16} className="text-gray-400" />}
//                 {...register('hours_per_week')}
//                 error={errors.hours_per_week?.message}
//             />

//             <div className="flex gap-3 pt-6 border-t border-gray-100">
//                 <Button variant="outline" type="button" onClick={onCancel} className="flex-1">
//                     Cancel
//                 </Button>
//                 <Button
//                     variant="primary"
//                     type="submit"
//                     isLoading={isSubmitting}
//                     className="flex-1 bg-gray-900 border-gray-900 hover:bg-gray-800"
//                     icon={LinkIcon}
//                 >
//                     Assign Module
//                 </Button>
//             </div>
//         </form>
//     );
// };

// export default AssignmentForm;


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    School,
    User,
    Clock,
    BookOpen,
    Calendar,
    Building2,
    CheckCircle,
    AlertCircle,
    Users,
    Award,
    Loader2,
    Save,
    Plus
} from 'lucide-react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';

const assignmentSchema = z.object({
    class_id: z.string().uuid('Please select a class'),
    module_id: z.string().uuid('Please select a module'),
    professor_id: z.string().uuid('Please select a professor'),
    hours_per_week: z.string()
        .min(1, 'Weekly hours are required')
        .refine(val => !isNaN(parseInt(val)), 'Must be a valid number')
        .refine(val => parseInt(val) > 0, 'Hours must be greater than 0')
        .refine(val => parseInt(val) <= 40, 'Hours cannot exceed 40 per week'),
    semester: z.string().refine(val => ['1', '2'].includes(val), 'Please select a semester'),
});

const AssignmentForm = ({
    onSubmit,
    onCancel,
    classes = [],
    modules = [],
    professors = [],
    initialValues,
    isEditing
}) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting, isValid, isDirty, touchedFields },
        trigger,
    } = useForm({
        resolver: zodResolver(assignmentSchema),
        defaultValues: initialValues || {
            hours_per_week: '4',
            semester: '1'
        },
        mode: 'onChange'
    });

    const classId = watch('class_id');
    const moduleId = watch('module_id');
    const professorId = watch('professor_id');
    const hours = watch('hours_per_week');
    const semester = watch('semester');

    const selectedClass = classId ? classes.find(c => c.id === classId) : null;
    const selectedModule = moduleId ? modules.find(m => m.id === moduleId) : null;
    const selectedProfessor = professorId ? professors.find(p => p.id === professorId) : null;

    const getWorkloadColor = (hours) => {
        const hrs = parseInt(hours) || 0;
        if (hrs <= 4) return 'bg-green-100 text-green-700 border-green-200';
        if (hrs <= 8) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (hrs <= 12) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const calculateTotalHours = () => {
        const hrs = parseInt(hours) || 0;
        const weeks = 15; // Standard academic semester
        return hrs * weeks;
    };

    const semesterOptions = [
        { value: '1', label: 'Semester 1', description: 'Fall Semester' },
        { value: '2', label: 'Semester 2', description: 'Spring Semester' },
    ];

    const filteredModules = modules.filter(m => m.semester?.toString() === semester);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gray-900 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {isEditing ? 'Edit Module Assignment' : 'Assign Module to Class'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEditing ? 'Update teaching assignment details' : 'Link an academic module to a class with a professor'}
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Class Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-gray-500" />
                        Academic Class
                        <span className="text-xs text-red-500 ml-1">*</span>
                    </label>
                    <Select
                        placeholder="Select a class..."
                        leftIcon={<School className="w-4 h-4 text-gray-400" />}
                        options={classes.map(c => ({
                            value: c.id,
                            label: `${c.name} - ${c.level}`,
                            description: `${c.academic_year} • ${c.speciality_name}`
                        }))}
                        {...register('class_id', {
                            onChange: () => trigger('class_id')
                        })}
                        error={errors.class_id?.message}
                        disabled={isEditing}
                    />
                </div>

                {/* Semester & Module Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            Target Semester
                            <span className="text-xs text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            placeholder="Select semester..."
                            leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                            options={semesterOptions}
                            {...register('semester', {
                                onChange: () => {
                                    setValue('module_id', ''); // Reset module on semester change
                                    trigger('semester');
                                }
                            })}
                            error={errors.semester?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            Academic Module
                            <span className="text-xs text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            placeholder={semester ? `Select S${semester} module...` : "Select a module..."}
                            leftIcon={<BookOpen className="w-4 h-4 text-gray-400" />}
                            options={filteredModules.map(m => ({
                                value: m.id,
                                label: `${m.code} - ${m.name}`,
                                description: `S${m.semester} • ${m.credits || 3} credits`
                            }))}
                            {...register('module_id', {
                                onChange: () => trigger('module_id')
                            })}
                            error={errors.module_id?.message}
                            disabled={!semester}
                        />
                    </div>
                </div>

                {/* Professor Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-500" />
                        Professor In Charge
                        <span className="text-xs text-red-500 ml-1">*</span>
                    </label>
                    <Select
                        placeholder="Select a professor..."
                        leftIcon={<User className="w-4 h-4 text-gray-400" />}
                        options={professors.map(p => ({
                            value: p.id,
                            label: `${p.title || 'Dr.'} ${p.first_name} ${p.last_name}`,
                            description: p.email || 'No email provided'
                        }))}
                        {...register('professor_id', {
                            onChange: () => trigger('professor_id')
                        })}
                        error={errors.professor_id?.message}
                    />
                </div>

                {/* Weekly Hours */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-500" />
                            Weekly Hours
                            <span className="text-xs text-red-500 ml-1">*</span>
                        </label>
                        {hours && !errors.hours_per_week && (
                            <Badge className={`text-xs ${getWorkloadColor(hours)}`}>
                                {parseInt(hours) <= 4 ? 'Light' :
                                    parseInt(hours) <= 8 ? 'Moderate' :
                                        parseInt(hours) <= 12 ? 'Heavy' : 'Very Heavy'}
                            </Badge>
                        )}
                    </div>
                    <Input
                        type="number"
                        placeholder="Enter weekly hours (e.g., 4)"
                        leftIcon={<Clock className="w-4 h-4 text-gray-400" />}
                        min="1"
                        max="40"
                        step="0.5"
                        {...register('hours_per_week', {
                            onChange: () => trigger('hours_per_week')
                        })}
                        error={errors.hours_per_week?.message}
                    />
                    {hours && !errors.hours_per_week && (
                        <p className="text-xs text-gray-600">
                            Total semester hours: {calculateTotalHours()} hours
                        </p>
                    )}
                </div>

                {/* Preview Section */}
                {(selectedClass || selectedModule || selectedProfessor || hours) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Assignment Preview</span>
                        </div>
                        <div className="space-y-3">
                            {selectedClass && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Class:</span>
                                    <span className="text-sm font-medium text-gray-900">{selectedClass.name} ({selectedClass.level})</span>
                                </div>
                            )}
                            {selectedModule && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Module:</span>
                                    <span className="text-sm font-medium text-gray-900">{selectedModule.code} - {selectedModule.name}</span>
                                </div>
                            )}
                            {selectedProfessor && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Professor:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedProfessor.first_name} {selectedProfessor.last_name}
                                    </span>
                                </div>
                            )}
                            {hours && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Workload:</span>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{hours} hours/week</p>
                                        <p className="text-xs text-gray-500">≈ {calculateTotalHours()} hours/semester</p>
                                    </div>
                                </div>
                            )}
                            {semester && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Semester:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {semesterOptions.find(s => s.value === semester)?.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Validation Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-800 mb-1">Please fix the following issues:</p>
                                <ul className="text-xs text-red-700 space-y-1">
                                    {errors.class_id && <li>• Select an academic class</li>}
                                    {errors.module_id && <li>• Select an academic module</li>}
                                    {errors.professor_id && <li>• Select a professor</li>}
                                    {errors.hours_per_week && <li>• Weekly hours: {errors.hours_per_week.message}</li>}
                                    {errors.semester && <li>• Semester: {errors.semester.message}</li>}
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
                    icon={isEditing ? Save : Plus}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isEditing ? 'Saving...' : 'Assigning...'}
                        </span>
                    ) : isEditing ? (
                        'Save Changes'
                    ) : (
                        'Assign Module'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default AssignmentForm;