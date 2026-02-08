import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    Loader2,
    X,
    UserPlus,
    Mail,
    Lock,
    BadgeCheck,
    ShieldAlert,
    Briefcase
} from 'lucide-react';
import { cn } from '../utils/cn';
import staffService from '../api/services/staffService';
import departmentService from '../api/services/departmentService';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';

const staffSchema = z.object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    type: z.enum(['ADMINISTRATIVE', 'PROFESSOR', 'CLEANER', 'SECURITY', 'MAINTENANCE']),
    department_id: z.string().min(36, 'Please select a department'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
        setError
    } = useForm({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            type: 'PROFESSOR'
        }
    });

    const selectedType = watch('type');
    const NO_LOGIN_TYPES = ['CLEANER', 'SECURITY', 'MAINTENANCE'];
    const requiresLogin = !NO_LOGIN_TYPES.includes(selectedType);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffData, deptData] = await Promise.all([
                staffService.getAll(),
                departmentService.getAll()
            ]);
            setStaff(staffData);
            setDepartments(deptData);
        } catch (err) {
            toast.error('Failed to load institution data');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Basic validation for login-required types
            if (requiresLogin && (!data.email || !data.password)) {
                toast.error('Email and Password are required for this employee type');
                return;
            }

            await staffService.create(data);
            toast.success('Staff member registered successfully');
            setModalOpen(false);
            reset();
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed';
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this employment record?')) return;
        try {
            await staffService.delete(id);
            toast.success('Employment record terminated');
            fetchData();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const filteredStaff = staff.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(filter.toLowerCase()) ||
        s.email?.toLowerCase().includes(filter.toLowerCase()) ||
        s.type.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">Staff Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage faculty, administration, and support services.</p>
                </div>
                <button
                    onClick={() => {
                        reset();
                        setModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2 self-start shadow-xl shadow-primary-600/20"
                >
                    <UserPlus size={20} />
                    Register Staff
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Filter by name, role, or department..."
                    className="input-field pl-12 h-14 bg-white border-slate-200 shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Function</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStaff.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-sm border-2 border-white shadow-sm group-hover:from-primary-600 group-hover:to-primary-700 group-hover:text-white transition-all">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{member.email || 'No institutional email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                            member.type === 'PROFESSOR' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                member.type === 'ADMINISTRATIVE' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                    "bg-slate-50 text-slate-600 border-slate-100"
                                        )}>
                                            {member.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={14} className="text-slate-300" />
                                            <p className="text-sm font-bold text-slate-600">
                                                {departments.find(d => d.id === member.department_id)?.name || 'General Services'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {member.user_id ? (
                                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                                                <BadgeCheck size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active Access</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                                                <ShieldAlert size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Offline</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-slate-100">
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-2.5 hover:bg-red-50 hover:shadow-md rounded-xl text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Hire Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-white"
                        >
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hire Professional</h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Onboard a new member to the institution.</p>
                                </div>
                                <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 px-4 py-4 border border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] btn-primary h-16 flex items-center justify-center gap-3 shadow-2xl shadow-primary-600/30 text-xs font-black uppercase tracking-widest"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                                        {isSubmitting ? 'Finalizing Enrollment...' : 'Register Employee'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffPage;
