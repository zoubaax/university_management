import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    BookOpen
} from 'lucide-react';
import api from '../api/axios';
import { cn } from '../utils/cn';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role_id: '', // Will be set to Student role
        speciality_id: '',
        registration_num: '',
        birth_date: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentRes, specRes] = await Promise.all([
                api.get('/students'),
                api.get('/specialities')
            ]);
            setStudents(studentRes.data.data);
            setSpecialities(specRes.data.data);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // In a real scenario, you'd fetch the role_id for 'STUDENT'
            // For this demo, we assume the backend handles it if role_id is omitted or matched.
            await api.post('/students', formData);
            setModalOpen(false);
            fetchData();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to enroll student');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            role_id: '',
            speciality_id: '',
            registration_num: '',
            birth_date: ''
        });
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
                        Student Enrollment
                    </h1>
                    <p className="text-slate-500 mt-1">Manage student admissions and academic records.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2 self-start"
                >
                    <UserPlus size={20} />
                    Enroll New Student
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, reg number or email..."
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {students.map((student, index) => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-primary-200 transition-all group"
                        >
                            <div className="w-24 h-24 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <GraduationCap size={48} />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                            {student.email.split('@')[0].toUpperCase()}
                                        </h3>
                                        <p className="text-sm text-slate-500">{student.email}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Active
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Fingerprint size={16} className="text-primary-500" />
                                        <span className="text-xs font-bold leading-none">{student.registration_num}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <BookOpen size={16} className="text-primary-500" />
                                        <span className="text-xs font-bold leading-none truncate">
                                            {specialities.find(s => s.id === student.speciality_id)?.name || 'Loading...'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <button className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">
                                        Academic File
                                    </button>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Enrollment Modal */}
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
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Sidebar Decoration */}
                            <div className="hidden md:flex w-64 bg-primary-600 p-8 flex-col justify-between text-white">
                                <div>
                                    <GraduationCap size={40} className="mb-6" />
                                    <h2 className="text-2xl font-black leading-tight uppercase">Student Enrollment</h2>
                                    <p className="text-primary-100 mt-4 text-sm font-medium leading-relaxed">
                                        Verify all legal documents before completing the registration process.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        ID Verified
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Payment Confirmed
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-center mb-8 md:hidden">
                                    <h2 className="text-xl font-bold">Enroll Student</h2>
                                    <button onClick={() => setModalOpen(false)}><X /></button>
                                </div>

                                {error && (
                                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 shadow-sm">
                                        <X size={20} className="bg-red-200 rounded-full p-0.5" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Academic Info */}
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Academic Details</h3>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Registration Number</label>
                                                <div className="relative">
                                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        required type="text"
                                                        placeholder="UPF-2024-XXXX"
                                                        value={formData.registration_num}
                                                        onChange={(e) => setFormData({ ...formData, registration_num: e.target.value })}
                                                        className="input-field pl-10 h-12"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Choose Speciality</label>
                                                <div className="relative">
                                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <select
                                                        required
                                                        value={formData.speciality_id}
                                                        onChange={(e) => setFormData({ ...formData, speciality_id: e.target.value })}
                                                        className="input-field pl-10 h-12 appearance-none"
                                                    >
                                                        <option value="">Select Speciality</option>
                                                        {specialities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        required type="date"
                                                        value={formData.birth_date}
                                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                        className="input-field pl-10 h-12"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Info */}
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Login Credentials</h3>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Institutional Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        required type="email"
                                                        placeholder="student@upf.edu.ma"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="input-field pl-10 h-12"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Student Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        required type="password"
                                                        placeholder="••••••••"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className="input-field pl-10 h-12"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 italic mt-1">* Should be changed on first login</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setModalOpen(false)}
                                            className="hidden md:block px-8 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 btn-primary h-14 flex items-center justify-center gap-3 shadow-xl shadow-primary-600/30 rounded-2xl"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                                            <span className="font-black uppercase tracking-widest">Complete Registration</span>
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
