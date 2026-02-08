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
    GraduationCap,
    Loader2,
    X,
    UserPlus,
    Mail,
    Lock,
    Calendar,
    Layers,
    Fingerprint,
    BookOpen,
    Filter
} from 'lucide-react';
import { cn } from '../utils/cn';
import studentService from '../api/services/studentService';
import specialityService from '../api/services/specialityService';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';

const studentSchema = z.object({
    registration_num: z.string().min(5, 'Registration number is required'),
    speciality_id: z.string().min(36, 'Please select a speciality'),
    birth_date: z.string().min(1, 'Date of birth is required'),
    email: z.string().email('Valid institutional email is required'),
    password: z.string().min(6, 'Temporary password is required'),
});

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(studentSchema),
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentData, specData] = await Promise.all([
                studentService.getAll(),
                specialityService.getAll()
            ]);
            setStudents(studentData || []);
            setSpecialities(specData || []);
        } catch (err) {
            toast.error('Failed to load student dashboard');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await studentService.create(data);
            toast.success('Student enrolled successfully');
            setModalOpen(false);
            reset();
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Enrollment failed';
            toast.error(msg);
        }
    };

    const filteredStudents = (students || []).filter(s =>
        s.registration_num.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Student Enrollment
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        Manage academic records and institutional admissions.
                    </p>
                </div>
                <button
                    onClick={() => {
                        reset();
                        setModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-3 self-start px-8 py-4 shadow-2xl shadow-primary-600/30 rounded-2xl"
                >
                    <UserPlus size={24} />
                    <span className="font-black uppercase tracking-wider text-sm">Enroll New Student</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by registration number or email..."
                        className="input-field pl-12 h-14 bg-white border-slate-200 shadow-sm focus:shadow-xl focus:shadow-primary-600/5 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="h-14 px-6 bg-white border border-slate-200 rounded-2xl text-slate-500 flex items-center gap-3 hover:bg-slate-50 transition-all font-bold">
                    <Filter size={20} />
                    Filters
                </button>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Accessing Records...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="glass-card rounded-[2.5rem] p-8 flex flex-col gap-6 hover:border-primary-400 hover:shadow-2xl hover:shadow-primary-600/10 transition-all border-2 border-transparent group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                        <GraduationCap size={40} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                            Enrolled
                                        </span>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Batch 2024</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 group-hover:text-primary-700 transition-colors">
                                        {student.registration_num}
                                    </h3>
                                    <p className="text-sm text-slate-400 font-bold truncate lowercase">{student.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                                    <div className="space-y-1 border-r border-slate-100 pr-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Speciality</p>
                                        <p className="text-sm font-black text-slate-700 truncate">
                                            {specialities.find(s => s.id === student.speciality_id)?.name || 'Unassigned'}
                                        </p>
                                    </div>
                                    <div className="space-y-1 pl-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joined</p>
                                        <p className="text-sm font-black text-slate-700">
                                            {new Date(student.enrollment_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button className="text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-800 transition-all underline underline-offset-4 decoration-2">
                                        Academic File
                                    </button>
                                    <div className="flex gap-3">
                                        <button className="p-3 bg-slate-50 hover:bg-white hover:shadow-xl rounded-2xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-slate-100">
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="p-3 bg-slate-50 hover:bg-red-50 hover:shadow-xl rounded-2xl text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Enrollment Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 50 }}
                            className="bg-white rounded-[3rem] shadow-[0_35px_100px_-15px_rgba(0,0,0,0.3)] w-full max-w-5xl relative z-10 overflow-hidden flex flex-col xl:flex-row min-h-[600px] border border-white"
                        >
                            {/* Sidebar Decoration */}
                            <div className="hidden xl:flex w-80 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-primary-600/50">
                                        <GraduationCap size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black leading-tight uppercase tracking-tight">
                                        Student<br />Enrollment
                                    </h2>
                                    <p className="text-slate-400 mt-6 text-sm font-medium leading-relaxed">
                                        Standardize student admissions by verifying all academic and legal prerequisites.
                                    </p>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {['Institutional Email', 'Academic Record', 'Birth Certificate'].map((step, i) => (
                                        <div key={i} className="flex items-center gap-4 group cursor-default">
                                            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                0{i + 1}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-all">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 p-10 xl:p-16 overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-center mb-12 xl:hidden">
                                    <h2 className="text-2xl font-black text-slate-900">Admit Student</h2>
                                    <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Academic Info */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3 pb-2 border-b-4 border-slate-900 w-fit">
                                                <Fingerprint size={20} className="text-primary-600" />
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Identification</h3>
                                            </div>

                                            <Input
                                                label="Registration Number"
                                                placeholder="UPF-2024-XXXX"
                                                {...register('registration_num')}
                                                error={errors.registration_num?.message}
                                            />

                                            <Select
                                                label="Assigned Speciality"
                                                placeholder="Choose academic path..."
                                                options={specialities.map(s => ({ value: s.id, label: s.name }))}
                                                {...register('speciality_id')}
                                                error={errors.speciality_id?.message}
                                            />

                                            <Input
                                                label="Date of Birth"
                                                type="date"
                                                {...register('birth_date')}
                                                error={errors.birth_date?.message}
                                            />
                                        </div>

                                        {/* Account Info */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3 pb-2 border-b-4 border-primary-600 w-fit">
                                                <Lock size={20} className="text-primary-600" />
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Access Rights</h3>
                                            </div>

                                            <Input
                                                label="Institutional Email"
                                                type="email"
                                                placeholder="student@upf.edu.ma"
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
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1 animate-pulse italic">
                                                * Required for first time portal access
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 pt-10">
                                        <button
                                            type="button"
                                            onClick={() => setModalOpen(false)}
                                            className="hidden md:block px-10 py-5 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:text-slate-900 transition-all"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 btn-primary h-20 flex items-center justify-center gap-4 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.4)] rounded-[1.5rem]"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <UserPlus size={24} />
                                            )}
                                            <span className="font-black uppercase tracking-widest text-sm">
                                                {isSubmitting ? 'Finalizing Enrollment...' : 'Register Student'}
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentsPage;
