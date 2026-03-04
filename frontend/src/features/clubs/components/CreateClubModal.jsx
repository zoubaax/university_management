import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Users,
    Mail,
    Lock,
    FileText,
    Building2,
    Image,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    X
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import departmentService from '../../../api/services/departmentService';
import clubService from '../../../api/services/clubService';
import { cn } from '../../../utils/cn';

const CreateClubModal = ({ isOpen, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    const watchedFields = watch(['name', 'email', 'department_id', 'category']);
    const formProgress = watchedFields.filter(Boolean).length;

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const clearLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
            reset();
            setError(null);
            setLogoPreview(null);
            setLogoFile(null);
        }
    }, [isOpen, reset]);

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getAll();
            setDepartments(data || []);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError(null);
            // Use FormData to support file upload
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('department_id', data.department_id);
            formData.append('category', data.category || 'Social');
            if (logoFile) {
                formData.append('club_logo', logoFile);
            }
            await clubService.createClub(formData);
            onSuccess();
            onClose();
            reset();
            setLogoPreview(null);
            setLogoFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create club');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Official Club"
            subtitle="Register a new student club with its dedicated login account"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            New Club
                        </Badge>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Complete all required fields</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(formProgress / 3) * 100}%` }}
                                className="h-full bg-gray-900 rounded-full"
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{formProgress}/3</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                    >
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span className="text-xs font-medium">{error}</span>
                    </motion.div>
                )}

                {/* Club Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Club Name
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Users size={18} />
                        </div>
                        <input
                            type="text"
                            {...register('name', { required: 'Club name is required' })}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all",
                                errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                            )}
                            placeholder="e.g., Robotics Club, Debate Society"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Description
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                            <FileText size={18} />
                        </div>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            rows={3}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none transition-all",
                                errors.description ? "border-red-300 bg-red-50" : "border-gray-300"
                            )}
                            placeholder="Brief description of the club's mission and activities..."
                        />
                    </div>
                    {errors.description && (
                        <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
                    )}
                </div>

                {/* Email and Password Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Club Email
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all",
                                    errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                                )}
                                placeholder="club@upf.edu"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Password
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' }
                                })}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all",
                                    errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                                )}
                                placeholder="••••••"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">Minimum 6 characters</p>
                    </div>
                </div>

                {/* Department Selection */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Supervising Department
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                            <Building2 size={18} />
                        </div>
                        <select
                            {...register('department_id', { required: 'Department is required' })}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none bg-white transition-all",
                                errors.department_id ? "border-red-300 bg-red-50" : "border-gray-300"
                            )}
                        >
                            <option value="">Select a department...</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    {errors.department_id && (
                        <p className="text-xs text-red-600 mt-1">{errors.department_id.message}</p>
                    )}
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Club Category
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                            <Users size={18} />
                        </div>
                        <select
                            {...register('category', { required: 'Category is required' })}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none bg-white transition-all",
                                errors.category ? "border-red-300 bg-red-50" : "border-gray-300"
                            )}
                        >
                            <option value="">Select a category...</option>
                            <option value="Academic">Academic</option>
                            <option value="Sports">Sports</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Social">Social</option>
                            <option value="Technology">Technology</option>
                            <option value="Art">Art</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    {errors.category && (
                        <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
                    )}
                </div>

                {/* Logo Upload (Optional) */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Club Logo
                        <span className="text-xs text-gray-400 font-normal">(optional)</span>
                    </label>
                    {logoPreview ? (
                        <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                            />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-700 truncate">{logoFile?.name}</p>
                                <p className="text-[10px] text-gray-400">{(logoFile?.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                                type="button"
                                onClick={clearLogo}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group">
                            <div className="flex flex-col items-center gap-1">
                                <Image size={22} className="text-gray-400 group-hover:text-gray-500" />
                                <span className="text-xs text-gray-500 group-hover:text-gray-600">Click to upload image</span>
                                <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                            </div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </label>
                    )}
                </div>

                {/* Summary Preview */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <CheckCircle size={12} className="text-green-600" />
                        Club Summary
                    </h4>
                    <div className="space-y-1.5 text-xs">
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-700">Name:</span>{' '}
                            {watchedFields[0] || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-700">Email:</span>{' '}
                            {watchedFields[1] || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-700">Department:</span>{' '}
                            {watchedFields[2]
                                ? departments.find(d => d.id === watchedFields[2])?.name
                                : <span className="text-gray-400 italic">Not set</span>}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-700">Category:</span>{' '}
                            {watchedFields[3] || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={loading}
                        className="bg-gray-900 hover:bg-gray-800 text-white min-w-[160px]"
                    >
                        {loading ? 'Creating...' : 'Create Club & Account'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateClubModal;