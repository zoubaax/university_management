import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, User, FileText, AlertCircle, Save, Upload, Paperclip, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const absenceSchema = z.object({
    employee_id: z.string().uuid('Please select an employee'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    type: z.enum(['SICK', 'VACATION', 'UNEXCUSED', 'PAID_LEAVE', 'OTHER']),
    reason: z.string().max(500, 'Reason must be less than 500 characters').optional().or(z.literal('')),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'JUSTIFIED']),
    attachment: z.any().optional(),
}).refine((data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
}, {
    message: "End date must be after start date",
    path: ["end_date"],
});

const AbsenceForm = ({ onSubmit, employees, onCancel, initialValues, isEditing }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, isDirty },
        setValue,
        watch,
        trigger,
        setError
    } = useForm({
        resolver: zodResolver(absenceSchema),
        defaultValues: initialValues || {
            type: 'UNEXCUSED',
            status: 'PENDING',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
        },
        mode: 'onChange'
    });

    const startDate = watch('start_date');
    const endDate = watch('end_date');
    const selectedEmployeeId = watch('employee_id');
    const attachmentFile = watch('attachment');
    const typeValue = watch('type');

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                setError('end_date', {
                    type: 'manual',
                    message: 'End date must be after start date'
                });
            } else {
                // Clear date error if valid
                if (errors.end_date?.type === 'manual') {
                    setError('end_date', {});
                }
            }
        }
    }, [startDate, endDate, setError, errors.end_date]);

    const selectedEmployee = selectedEmployeeId 
        ? employees.find(e => e.id === selectedEmployeeId)
        : null;

    const typeOptions = [
        { value: 'UNEXCUSED', label: 'Unexcused Absence', description: 'Absence without prior notice', color: 'text-red-600 bg-red-50' },
        { value: 'SICK', label: 'Sick Leave', description: 'Medical leave with documentation', color: 'text-blue-600 bg-blue-50' },
        { value: 'VACATION', label: 'Vacation', description: 'Planned time off', color: 'text-green-600 bg-green-50' },
        { value: 'PAID_LEAVE', label: 'Paid Leave', description: 'Authorized leave with pay', color: 'text-purple-600 bg-purple-50' },
        { value: 'OTHER', label: 'Other / Exceptional', description: 'Special circumstances', color: 'text-gray-600 bg-gray-50' },
    ];

    const statusOptions = [
        { value: 'PENDING', label: 'Pending Review', icon: Clock, color: 'text-amber-600 bg-amber-50' },
        { value: 'APPROVED', label: 'Approved', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        { value: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'text-red-600 bg-red-50' },
        { value: 'JUSTIFIED', label: 'Justified', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
    ];

    const calculateDuration = () => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleFormSubmit = (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'attachment' && data[key] && data[key][0]) {
                formData.append('attachment', data[key][0]);
            } else if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-5">
                {/* Form Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            {isEditing ? 'Edit Absence Record' : 'New Absence Record'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditing ? 'Update absence information' : 'Register a new absence record'}
                        </p>
                    </div>
                </div>

                {/* Employee Selection */}
                <Select
                    label="Employee"
                    placeholder="Select employee..."
                    leftIcon={<User className="w-4 h-4 text-gray-400" />}
                    options={employees.map(e => ({
                        value: e.id,
                        label: `${e.first_name} ${e.last_name}`,
                        description: `${e.type} • ${e.department_name || 'General Department'}`,
                        extra: e.email ? `📧 ${e.email}` : null
                    }))}
                    {...register('employee_id')}
                    error={errors.employee_id?.message}
                    disabled={isEditing}
                    autoFocus={!isEditing}
                />

                {/* Dates Section */}
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Start Date"
                            type="date"
                            leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                            {...register('start_date')}
                            error={errors.start_date?.message}
                        />
                        <Input
                            label="End Date"
                            type="date"
                            leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                            {...register('end_date')}
                            error={errors.end_date?.message}
                        />
                    </div>
                    
                    {/* Duration Display */}
                    {startDate && endDate && !errors.end_date && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Duration</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{calculateDuration()} days</p>
                                    <p className="text-xs text-gray-500">
                                        {startDate} to {endDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type Selection */}
                    <Select
                        label="Absence Type"
                        placeholder="Select type..."
                        options={typeOptions.map(opt => ({
                            value: opt.value,
                            label: opt.label,
                            description: opt.description
                        }))}
                        {...register('type')}
                        error={errors.type?.message}
                    />

                    {/* Status Selection */}
                    <Select
                        label="Status"
                        placeholder="Select status..."
                        options={statusOptions.map(opt => ({
                            value: opt.value,
                            label: opt.label,
                            icon: opt.icon
                        }))}
                        {...register('status')}
                        error={errors.status?.message}
                    />
                </div>

                {/* Employee Preview */}
                {selectedEmployee && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                                </p>
                                <p className="text-xs text-blue-700">
                                    {selectedEmployee.type} • {selectedEmployee.department_name || 'General'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Reason / Notes
                            <span className="text-xs font-normal text-gray-400">(Optional)</span>
                        </label>
                        <span className="text-xs text-gray-400">
                            {watch('reason')?.length || 0}/500
                        </span>
                    </div>
                    <textarea
                        className={cn(
                            "w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                            "placeholder:text-gray-400 min-h-[100px] resize-none",
                            errors.reason 
                                ? "border-red-300 bg-red-50 focus:ring-red-500 focus:ring-opacity-20"
                                : "border-gray-300 focus:ring-gray-900 focus:ring-opacity-20"
                        )}
                        placeholder="Provide details about the absence, context, or supporting information..."
                        {...register('reason')}
                    />
                    {errors.reason && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.reason.message}
                        </p>
                    )}
                </div>

                {/* Attachment */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        Supporting Document
                        <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    
                    <div className="space-y-3">
                        {/* File Upload Area */}
                        <div className="relative">
                            <input
                                type="file"
                                id="attachment"
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                {...register('attachment')}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && file.size > 5 * 1024 * 1024) {
                                        setError('attachment', {
                                            type: 'manual',
                                            message: 'File size must be less than 5MB'
                                        });
                                    } else {
                                        setValue('attachment', e.target.files);
                                        trigger('attachment');
                                    }
                                }}
                            />
                            <label
                                htmlFor="attachment"
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                    attachmentFile?.[0] 
                                        ? "border-green-300 bg-green-50 text-green-700 hover:border-green-400"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded",
                                    attachmentFile?.[0] ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                )}>
                                    <Upload size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium truncate">
                                        {attachmentFile?.[0]?.name || 'Click to upload supporting document'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        PDF, PNG, JPG, DOC (Max 5MB)
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Error & Existing File */}
                        {errors.attachment && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.attachment.message}
                            </p>
                        )}

                        {initialValues?.attachment_url && !attachmentFile?.[0] && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                <Paperclip size={12} className="flex-shrink-0" />
                                <span className="text-xs flex-1 truncate">
                                    Existing file: {initialValues.attachment_url.split('/').pop()}
                                </span>
                            </div>
                        )}

                        {/* File Preview (if uploaded) */}
                        {attachmentFile?.[0] && (
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <Paperclip size={12} className="text-gray-500" />
                                    <span className="text-xs text-gray-700 truncate flex-1">
                                        {attachmentFile[0].name} ({(attachmentFile[0].size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setValue('attachment', null)}
                                    className="text-xs text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
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
                    icon={Save}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    disabled={isSubmitting || !isValid || (isEditing && !isDirty)}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isEditing ? 'Updating...' : 'Creating...'}
                        </span>
                    ) : (
                        isEditing ? 'Update Record' : 'Create Record'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default AbsenceForm;