import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Fingerprint,
    Lock,
    User,
    Mail,
    BookOpen,
    Calendar,
    Building2,
    Layers,
    FileText,
    Upload,
    CheckCircle,
    XCircle,
    Loader2,
    GraduationCap,
    FileCheck,
    AlertCircle,
    Info,
    CreditCard,
    Plus,
    Save
} from 'lucide-react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const studentSchema = z.object({
    first_name: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name is too long'),
    last_name: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name is too long'),
    cin: z.string()
        .min(4, 'CIN is required')
        .max(20, 'CIN is too long'),
    registration_num: z.string().optional(),
    email: z.string()
        .email('Please enter a valid institutional email address')
        .refine(email => email.includes('@'), 'Email must be a valid institutional address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),
    department_id: z.string().uuid('Please select a department'),
    speciality_id: z.string().uuid('Please select a speciality'),
    class_id: z.string().uuid().optional(),
    birth_date: z.string()
        .optional()
        .refine(date => {
            if (!date) return true;
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return age >= 16 && age <= 65;
        }, 'Student must be between 16 and 65 years old'),
});

const StudentForm = ({
    onSubmit,
    onCancel,
    initialValues,
    isEditing,
    departments = [],
    specialities = [],
    classes = [],
    roles = []
}) => {
    const studentRole = roles.find(r => r.name === 'STUDENT')?.id;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting, isValid, isDirty, touchedFields },
        trigger,
    } = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: initialValues || {
            role_id: studentRole,
            birth_date: '',
        },
        mode: 'onChange'
    });

    const selectedDeptId = watch('department_id');
    const selectedSpecId = watch('speciality_id');
    const firstName = watch('first_name');
    const lastName = watch('last_name');
    const cin = watch('cin');
    const email = watch('email');
    const birthDate = watch('birth_date');

    const filteredSpecs = specialities.filter(s => s.department_id === selectedDeptId);
    const filteredClasses = classes.filter(c => c.speciality_id === selectedSpecId);

    const [bacFile, setBacFile] = useState(null);
    const [cinFile, setCinFile] = useState(null);
    const [bacError, setBacError] = useState('');
    const [cinError, setCinError] = useState('');

    const handleFileChange = (file, setFile, setError, fileType) => {
        if (!file) {
            setFile(null);
            setError('');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

        if (file.size > maxSize) {
            setError(`File size must be less than 5MB`);
            setFile(null);
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            setError('File must be PDF, JPEG, or PNG');
            setFile(null);
            return;
        }

        setFile(file);
        setError('');
    };

    const handleFormSubmit = async (data) => {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if (data[key]) formData.append(key, data[key]);
        });

        if (studentRole) formData.append('role_id', studentRole);

        if (bacFile) formData.append('bac_document', bacFile);
        if (cinFile) formData.append('cin_document', cinFile);

        if (initialValues?.bac_document_url && !bacFile) {
            formData.append('keep_bac_document', 'true');
        }
        if (initialValues?.cin_document_url && !cinFile) {
            formData.append('keep_cin_document', 'true');
        }

        await onSubmit(formData);
    };

    const calculateAge = () => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gray-900 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {isEditing ? 'Edit Student Record' : 'Enroll New Student'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEditing ? 'Update student information and academic details' : 'Complete all required fields to enroll a new student'}
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            placeholder="Enter first name"
                            leftIcon={<User className="w-4 h-4 text-gray-400" />}
                            {...register('first_name', {
                                onChange: () => trigger('first_name')
                            })}
                            error={errors.first_name?.message}
                            autoFocus={!isEditing}
                        />
                        <Input
                            label="Last Name"
                            placeholder="Enter last name"
                            leftIcon={<User className="w-4 h-4 text-gray-400" />}
                            {...register('last_name', {
                                onChange: () => trigger('last_name')
                            })}
                            error={errors.last_name?.message}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Input
                                label="CIN / National ID"
                                placeholder="Enter CIN number"
                                leftIcon={<CreditCard className="w-4 h-4 text-gray-400" />}
                                {...register('cin', {
                                    onChange: () => trigger('cin')
                                })}
                                error={errors.cin?.message}
                            />
                            {cin && !errors.cin && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Valid CIN format
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Input
                                label="Date of Birth"
                                type="date"
                                leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                                {...register('birth_date', {
                                    onChange: () => trigger('birth_date')
                                })}
                                error={errors.birth_date?.message}
                            />
                            {birthDate && !errors.birth_date && (
                                <p className="text-xs text-gray-600">
                                    Age: {calculateAge()} years
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Academic Information Section */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Academic Information</h4>
                    </div>

                    <div className="space-y-4">
                        <Select
                            label="Department"
                            placeholder="Select department"
                            leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
                            options={departments.map(d => ({ 
                                value: d.id, 
                                label: d.name,
                                description: d.description ? d.description.substring(0, 60) + '...' : ''
                            }))}
                            {...register('department_id', {
                                onChange: () => {
                                    setValue('speciality_id', '');
                                    setValue('class_id', '');
                                    trigger(['speciality_id', 'class_id']);
                                }
                            })}
                            error={errors.department_id?.message}
                            disabled={isEditing}
                        />

                        {selectedDeptId && filteredSpecs.length > 0 && (
                            <Select
                                label="Academic Program"
                                placeholder="Select academic program"
                                leftIcon={<Layers className="w-4 h-4 text-gray-400" />}
                                options={filteredSpecs.map(s => ({ 
                                    value: s.id, 
                                    label: s.name 
                                }))}
                                {...register('speciality_id', {
                                    onChange: () => {
                                        setValue('class_id', '');
                                        trigger('class_id');
                                    }
                                })}
                                error={errors.speciality_id?.message}
                            />
                        )}

                        {selectedSpecId && filteredClasses.length > 0 && (
                            <Select
                                label="Class Assignment"
                                placeholder="Select class (optional)"
                                leftIcon={<FileText className="w-4 h-4 text-gray-400" />}
                                options={filteredClasses.map(c => ({ 
                                    value: c.id, 
                                    label: `${c.name} - ${c.academic_year}`,
                                    description: `Level: ${c.level}`
                                }))}
                                {...register('class_id')}
                                error={errors.class_id?.message}
                            />
                        )}
                    </div>
                </div>

                {/* Account Information Section */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Information</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Input
                                label="Institutional Email"
                                type="email"
                                placeholder="student@university.edu"
                                leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                                {...register('email', {
                                    onChange: () => trigger('email')
                                })}
                                error={errors.email?.message}
                            />
                            {email && !errors.email && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Valid email format
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Input
                                label={isEditing ? "Registration Number" : "Registration Number (Auto-generated)"}
                                placeholder={isEditing ? "Enter registration number" : "Will be auto-generated"}
                                leftIcon={<Fingerprint className="w-4 h-4 text-gray-400" />}
                                {...register('registration_num')}
                                error={errors.registration_num?.message}
                                disabled={!isEditing}
                            />
                            {!isEditing && (
                                <p className="text-xs text-gray-500">
                                    A unique registration number will be assigned automatically
                                </p>
                            )}
                        </div>
                    </div>

                    {(!isEditing || initialValues?.password) && (
                        <div className="space-y-2">
                            <Input
                                label={isEditing ? "New Password (Optional)" : "Temporary Password"}
                                type="password"
                                placeholder="Enter temporary password"
                                leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                                {...register('password', {
                                    onChange: () => trigger('password')
                                })}
                                error={errors.password?.message}
                                helperText={isEditing ? "Leave blank to keep current password" : "Minimum 6 characters"}
                            />
                        </div>
                    )}
                </div>

                {/* Documents Section */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <FileCheck className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Required Documents</h4>
                        <span className="text-xs text-gray-400 font-normal">(Max 5MB each)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* BAC Document */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                <FileCheck className="w-4 h-4" />
                                Baccalaureate Certificate
                                <span className="text-xs text-red-500 ml-1">*</span>
                            </label>
                            <div className={cn(
                                "border-2 border-dashed rounded-lg p-4 transition-colors",
                                bacFile ? "border-green-300 bg-green-50" :
                                bacError ? "border-red-300 bg-red-50" :
                                "border-gray-300 hover:border-gray-400"
                            )}>
                                <input
                                    type="file"
                                    className="hidden"
                                    id="bac-file"
                                    onChange={(e) => handleFileChange(e.target.files?.[0], setBacFile, setBacError, 'BAC')}
                                    accept=".pdf,image/jpeg,image/jpg,image/png"
                                />
                                <label htmlFor="bac-file" className="cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded",
                                            bacFile ? "bg-green-100 text-green-600" :
                                            bacError ? "bg-red-100 text-red-600" :
                                            "bg-gray-100 text-gray-400"
                                        )}>
                                            {bacFile ? <CheckCircle size={16} /> : <Upload size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {bacFile?.name || 'Click to upload BAC certificate'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                PDF, JPEG, PNG
                                            </p>
                                        </div>
                                    </div>
                                </label>
                                {bacError && (
                                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {bacError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* CIN Document */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                CIN / National ID Document
                                <span className="text-xs text-red-500 ml-1">*</span>
                            </label>
                            <div className={cn(
                                "border-2 border-dashed rounded-lg p-4 transition-colors",
                                cinFile ? "border-green-300 bg-green-50" :
                                cinError ? "border-red-300 bg-red-50" :
                                "border-gray-300 hover:border-gray-400"
                            )}>
                                <input
                                    type="file"
                                    className="hidden"
                                    id="cin-file"
                                    onChange={(e) => handleFileChange(e.target.files?.[0], setCinFile, setCinError, 'CIN')}
                                    accept=".pdf,image/jpeg,image/jpg,image/png"
                                />
                                <label htmlFor="cin-file" className="cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded",
                                            cinFile ? "bg-green-100 text-green-600" :
                                            cinError ? "bg-red-100 text-red-600" :
                                            "bg-gray-100 text-gray-400"
                                        )}>
                                            {cinFile ? <CheckCircle size={16} /> : <Upload size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {cinFile?.name || 'Click to upload CIN document'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                PDF, JPEG, PNG
                                            </p>
                                        </div>
                                    </div>
                                </label>
                                {cinError && (
                                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {cinError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validation Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-800 mb-1">Please fix the following issues:</p>
                                <ul className="text-xs text-red-700 space-y-1">
                                    {errors.first_name && <li>• First name: {errors.first_name.message}</li>}
                                    {errors.last_name && <li>• Last name: {errors.last_name.message}</li>}
                                    {errors.cin && <li>• CIN: {errors.cin.message}</li>}
                                    {errors.email && <li>• Email: {errors.email.message}</li>}
                                    {errors.department_id && <li>• Department: {errors.department_id.message}</li>}
                                    {errors.speciality_id && <li>• Academic program: {errors.speciality_id.message}</li>}
                                    {errors.password && <li>• Password: {errors.password.message}</li>}
                                    {errors.birth_date && <li>• Date of birth: {errors.birth_date.message}</li>}
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
                    disabled={isSubmitting || !isValid || (isEditing && !isDirty && !bacFile && !cinFile)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    icon={isEditing ? Save : Plus}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isEditing ? 'Saving...' : 'Enrolling...'}
                        </span>
                    ) : isEditing ? (
                        'Save Changes'
                    ) : (
                        'Enroll Student'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default StudentForm;