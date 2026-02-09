// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import {
//     BookOpen,
//     Layers,
//     Hash,
//     Dna,
//     FileText,
//     Plus,
//     Save
// } from 'lucide-react';
// import Input from '../../../components/ui/Input';
// import Select from '../../../components/ui/Select';
// import Button from '../../../components/ui/Button';
// import Textarea from '../../../components/ui/Textarea';

// const moduleSchema = z.object({
//     name: z.string().min(2, 'Module name must be at least 2 characters').max(100),
//     code: z.string().max(20).optional(),
//     speciality_id: z.string().uuid('Please select a speciality'),
//     coefficient: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number'),
//     description: z.string().max(500).optional(),
// });

// const ModuleForm = ({
//     onSubmit,
//     onCancel,
//     initialValues,
//     isEditing,
//     specialities = []
// }) => {
//     const {
//         register,
//         handleSubmit,
//         formState: { errors, isSubmitting }
//     } = useForm({
//         resolver: zodResolver(moduleSchema),
//         defaultValues: initialValues || {
//             coefficient: '1.0'
//         }
//     });

//     return (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input
//                     label="Module Name"
//                     placeholder="e.g., Advanced Mathematics"
//                     leftIcon={<BookOpen size={16} className="text-gray-400" />}
//                     {...register('name')}
//                     error={errors.name?.message}
//                 />
//                 <Input
//                     label="Module Code"
//                     placeholder={isEditing ? "e.g., MATH-101" : "Auto-generated"}
//                     readOnly={!isEditing}
//                     className={!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}
//                     leftIcon={<Hash size={16} className="text-gray-400" />}
//                     {...register('code')}
//                     error={errors.code?.message}
//                     helperText={!isEditing ? "Code will be generated automatically" : ""}
//                 />
//             </div>

//             <Select
//                 label="Speciality (Academic Program)"
//                 placeholder="Select program..."
//                 leftIcon={<Layers size={16} className="text-gray-400" />}
//                 options={specialities.map(s => ({ value: s.id, label: s.name }))}
//                 {...register('speciality_id')}
//                 error={errors.speciality_id?.message}
//             />

//             <Input
//                 label="Coefficient (Weight)"
//                 type="number"
//                 step="0.25"
//                 placeholder="1.0"
//                 leftIcon={<Dna size={16} className="text-gray-400" />}
//                 {...register('coefficient')}
//                 error={errors.coefficient?.message}
//             />

//             <Textarea
//                 label="Description"
//                 placeholder="Write a brief overview of the module contents..."
//                 rows={3}
//                 {...register('description')}
//                 error={errors.description?.message}
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
//                     icon={isEditing ? Save : Plus}
//                 >
//                     {isEditing ? 'Save Changes' : 'Create Module'}
//                 </Button>
//             </div>
//         </form>
//     );
// };

// export default ModuleForm;




import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    BookOpen,
    Layers,
    Hash,
    Scale,
    FileText,
    Plus,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Award,
    Clock,
    GraduationCap,
    Info
} from 'lucide-react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Textarea from '../../../components/ui/Textarea';
import Badge from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';

const moduleSchema = z.object({
    name: z.string()
        .min(2, 'Module name must be at least 2 characters')
        .max(100, 'Module name is too long'),
    code: z.string()
        .max(20, 'Code is too long')
        .regex(/^[A-Z]{3,4}-\d{3}$/, 'Format must be like: MATH-101, CS-201')
        .optional()
        .or(z.literal('')),
    speciality_id: z.string().uuid('Please select an academic program'),
    coefficient: z.string()
        .refine(val => !isNaN(parseFloat(val)), 'Must be a valid number')
        .refine(val => parseFloat(val) > 0, 'Coefficient must be greater than 0')
        .refine(val => parseFloat(val) <= 5, 'Coefficient cannot exceed 5'),
    credits: z.string()
        .refine(val => !isNaN(parseInt(val)), 'Must be a valid number')
        .refine(val => parseInt(val) > 0, 'Credits must be greater than 0')
        .refine(val => parseInt(val) <= 10, 'Credits cannot exceed 10')
        .optional()
        .or(z.literal('')),
    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
});

const ModuleForm = ({
    onSubmit,
    onCancel,
    initialValues,
    isEditing,
    specialities = []
}) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting, isValid, isDirty, touchedFields },
        trigger,
    } = useForm({
        resolver: zodResolver(moduleSchema),
        defaultValues: initialValues || {
            coefficient: '1.0',
            credits: '3',
            code: '',
        },
        mode: 'onChange'
    });

    const name = watch('name');
    const code = watch('code');
    const specialityId = watch('speciality_id');
    const coefficient = watch('coefficient');
    const credits = watch('credits');
    const description = watch('description');

    const nameTouched = touchedFields.name;
    const codeTouched = touchedFields.code;
    const coeffTouched = touchedFields.coefficient;

    const selectedSpeciality = specialityId 
        ? specialities.find(s => s.id === specialityId)
        : null;

    const [suggestedCode, setSuggestedCode] = useState('');

    useEffect(() => {
        if (name && !isEditing && !code) {
            // Generate suggested code from first 3-4 letters of module name
            const words = name.split(' ');
            let suggestion = '';
            
            if (words.length === 1) {
                suggestion = words[0].substring(0, 4).toUpperCase();
            } else {
                suggestion = words.map(word => word[0]).join('').toUpperCase();
            }
            
            if (suggestion.length > 4) suggestion = suggestion.substring(0, 4);
            setSuggestedCode(`${suggestion}-101`);
        }
    }, [name, isEditing, code]);

    const handleUseSuggestedCode = () => {
        if (suggestedCode) {
            setValue('code', suggestedCode, { shouldValidate: true });
        }
    };

    const getCoefficientColor = (coeff) => {
        const num = parseFloat(coeff) || 0;
        if (num <= 1) return 'bg-green-100 text-green-700 border-green-200';
        if (num <= 2) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (num <= 3) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const isNameValid = name && !errors.name;
    const isCodeValid = code && !errors.code;
    const isCoefficientValid = coefficient && !errors.coefficient;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gray-900 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {isEditing ? 'Edit Academic Module' : 'Create New Module'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEditing ? 'Update module details and configuration' : 'Define a new academic module for your curriculum'}
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Module Name */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                    Module Name
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
                                placeholder="Enter module name (e.g., Advanced Mathematics)"
                                leftIcon={<BookOpen className="w-4 h-4 text-gray-400" />}
                                {...register('name', {
                                    onChange: () => trigger('name')
                                })}
                                error={errors.name?.message}
                                autoFocus={!isEditing}
                            />
                        </div>

                        {/* Module Code */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Hash className="w-4 h-4 text-gray-500" />
                                    Module Code
                                    <span className="text-xs text-gray-400 ml-1">(Optional)</span>
                                </label>
                                {codeTouched && code && (
                                    <span className={cn(
                                        "text-xs flex items-center gap-1",
                                        isCodeValid ? "text-green-600" : "text-red-600"
                                    )}>
                                        {isCodeValid ? (
                                            <>
                                                <CheckCircle className="w-3 h-3" />
                                                Valid
                                            </>
                                        ) : errors.code ? (
                                            <>
                                                <AlertCircle className="w-3 h-3" />
                                                Invalid
                                            </>
                                        ) : null}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    placeholder={isEditing ? "MATH-101" : "Auto-generate or enter"}
                                    leftIcon={<Hash className="w-4 h-4 text-gray-400" />}
                                    {...register('code', {
                                        onChange: () => trigger('code')
                                    })}
                                    error={errors.code?.message}
                                />
                                {!isEditing && suggestedCode && !code && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <button
                                            type="button"
                                            onClick={handleUseSuggestedCode}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Use: {suggestedCode}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Format: DEPARTMENT-CODE (e.g., MATH-101, CS-201)
                            </p>
                        </div>
                    </div>

                    {/* Speciality Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-gray-500" />
                            Academic Program
                            <span className="text-xs text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            placeholder="Select academic program..."
                            leftIcon={<Layers className="w-4 h-4 text-gray-400" />}
                            options={specialities.map(s => ({
                                value: s.id,
                                label: s.name,
                                description: s.department_name || 'General'
                            }))}
                            {...register('speciality_id', {
                                onChange: () => trigger('speciality_id')
                            })}
                            error={errors.speciality_id?.message}
                            disabled={isEditing}
                        />
                    </div>

                    {/* Selected Program Preview */}
                    {selectedSpeciality && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">{selectedSpeciality.name}</p>
                                    <p className="text-xs text-blue-700">Department: {selectedSpeciality.department_name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Academic Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Coefficient */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Scale className="w-4 h-4 text-gray-500" />
                                    Coefficient (Weight)
                                    <span className="text-xs text-red-500 ml-1">*</span>
                                </label>
                                {coeffTouched && coefficient && (
                                    <Badge className={`text-xs ${getCoefficientColor(coefficient)}`}>
                                        {parseFloat(coefficient) <= 1 ? 'Light' : 
                                         parseFloat(coefficient) <= 2 ? 'Standard' : 
                                         parseFloat(coefficient) <= 3 ? 'Heavy' : 'Very Heavy'}
                                    </Badge>
                                )}
                            </div>
                            <Input
                                type="number"
                                placeholder="1.0"
                                leftIcon={<Scale className="w-4 h-4 text-gray-400" />}
                                step="0.25"
                                min="0.25"
                                max="5"
                                {...register('coefficient', {
                                    onChange: () => trigger('coefficient')
                                })}
                                error={errors.coefficient?.message}
                            />
                            <p className="text-xs text-gray-500">
                                Weight of this module in GPA calculation
                            </p>
                        </div>

                        {/* Credits */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-gray-500" />
                                Credit Hours
                                <span className="text-xs text-gray-400 ml-1">(Optional)</span>
                            </label>
                            <Input
                                type="number"
                                placeholder="3"
                                leftIcon={<Award className="w-4 h-4 text-gray-400" />}
                                min="1"
                                max="10"
                                {...register('credits', {
                                    onChange: () => trigger('credits')
                                })}
                                error={errors.credits?.message}
                            />
                            <p className="text-xs text-gray-500">
                                ECTS or credit hour value
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-gray-500" />
                                Description
                                <span className="text-xs text-gray-400 ml-1">(Optional)</span>
                            </label>
                            <span className="text-xs text-gray-400">
                                {description?.length || 0}/500
                            </span>
                        </div>
                        <Textarea
                            placeholder="Describe the module's objectives, content, and learning outcomes..."
                            rows={3}
                            {...register('description', {
                                onChange: () => trigger('description')
                            })}
                            error={errors.description?.message}
                        />
                        <p className="text-xs text-gray-500">
                            Provide an overview of what students will learn in this module
                        </p>
                    </div>

                    {/* Module Preview */}
                    {(name || code || selectedSpeciality || coefficient) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Module Preview</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Name:</span>
                                    <span className="text-sm font-medium text-gray-900">{name || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Code:</span>
                                    <span className="text-sm font-medium text-gray-900">{code || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Program:</span>
                                    <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                                        {selectedSpeciality?.name || '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Coefficient:</span>
                                    <span className="text-sm font-medium text-gray-900">{coefficient || '—'}</span>
                                </div>
                                {credits && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Credits:</span>
                                        <span className="text-sm font-medium text-gray-900">{credits}</span>
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
                                        {errors.name && <li>• Module name: {errors.name.message}</li>}
                                        {errors.code && <li>• Module code: {errors.code.message}</li>}
                                        {errors.speciality_id && <li>• Select an academic program</li>}
                                        {errors.coefficient && <li>• Coefficient: {errors.coefficient.message}</li>}
                                        {errors.credits && <li>• Credits: {errors.credits.message}</li>}
                                        {errors.description && <li>• Description: {errors.description.message}</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
                            {isEditing ? 'Saving...' : 'Creating...'}
                        </span>
                    ) : isEditing ? (
                        'Save Changes'
                    ) : (
                        'Create Module'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ModuleForm;