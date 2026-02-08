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
    ShieldCheck,
    Loader2,
    X,
    Filter,
    Building2,
    BookOpen
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import specialityService from '../api/services/specialityService';
import departmentService from '../api/services/departmentService';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';

const specialitySchema = z.object({
    name: z.string().min(2, 'Speciality name must be at least 2 characters'),
    department_id: z.string().min(36, 'Please select a department'),
});

const SpecialitiesPage = () => {
    const [specialities, setSpecialities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filterQuery, setFilterQuery] = useState('');

    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(specialitySchema),
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [specData, deptData] = await Promise.all([
                specialityService.getAll(),
                departmentService.getAll()
            ]);
            setSpecialities(specData || []);
            setDepartments(deptData || []);
        } catch (err) {
            toast.error('Failed to load academic programs');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await specialityService.update(editingId, data);
                toast.success('Program updated');
            } else {
                await specialityService.create(data);
                toast.success('New program created');
            }
            setModalOpen(false);
            reset();
            setEditingId(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleEdit = (spec) => {
        setEditingId(spec.id);
        setValue('name', spec.name);
        setValue('department_id', spec.department_id);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this speciality? This might affect enrolled students.')) return;
        try {
            await specialityService.delete(id);
            toast.success('Program removed');
            fetchData();
        } catch (err) {
            toast.error('Cannot delete: This program may have active enrollments.');
        }
    };

    const isResponsable = user?.role_name === 'RESPONSABLE_DEPARTMENT';

    const filteredSpecs = specialities.filter(s => {
        const matchesRole = isResponsable ? s.department_id === user?.department_id : true;
        const matchesSearch = s.name.toLowerCase().includes(filterQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Specialities</h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg italic">Curriculum management and academic pathways.</p>
                </div>
                {(isResponsable || ['RH', 'SUPER_ADMIN'].includes(user?.role_name)) && (
                    <button
                        onClick={() => {
                            reset();
                            setEditingId(null);
                            if (isResponsable) setValue('department_id', user.department_id);
                            setModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-3 px-8 py-4 shadow-2xl shadow-primary-600/20 rounded-2xl"
                    >
                        <Plus size={24} />
                        <span className="font-black uppercase tracking-widest text-sm">Add Program</span>
                    </button>
                )}
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search academic programs..."
                        className="input-field pl-12 h-14 bg-white border-slate-200 shadow-sm"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredSpecs.map((spec, index) => (
                            <motion.div
                                key={spec.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="glass-card rounded-[2rem] p-8 relative overflow-hidden group hover:border-primary-400 hover:shadow-2xl hover:shadow-primary-600/10 transition-all border-2 border-transparent"
                            >
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl transition-all duration-500 group-hover:bg-primary-600 group-hover:scale-110">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleEdit(spec)}
                                            className="p-3 bg-white hover:shadow-lg rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-slate-100"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(spec.id)}
                                            className="p-3 bg-white hover:shadow-lg rounded-xl text-slate-400 hover:text-red-600 transition-all border border-slate-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 relative z-10">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary-700 transition-colors uppercase">
                                        {spec.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-4 text-slate-400">
                                        <Building2 size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest leading-none">
                                            {departments.find(d => d.id === spec.department_id)?.name || 'General Faculty'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:border-primary-50 transition-all">
                                                U
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] bg-primary-50 px-3 py-1.5 rounded-full">
                                        240 Students
                                    </span>
                                </div>

                                <div className="absolute -bottom-12 -right-12 text-slate-50 opacity-20 group-hover:text-primary-100 group-hover:opacity-40 transition-all duration-700 pointer-events-none">
                                    <ShieldCheck size={200} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border-4 border-white"
                        >
                            <div className="p-10 border-b border-slate-50 bg-slate-50/50">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                    {editingId ? 'Modify Program' : 'New Program'}
                                </h2>
                                <p className="text-slate-500 font-medium text-sm mt-3 italic">Configure institutional academic specialization.</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
                                <Input
                                    label="Title of Speciality"
                                    placeholder="e.g. Artificial Intelligence & Data Science"
                                    {...register('name')}
                                    error={errors.name?.message}
                                />

                                <Select
                                    label="Assigned Faculty/Dept"
                                    placeholder="Select institutional parent..."
                                    disabled={isResponsable}
                                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                                    {...register('department_id')}
                                    error={errors.department_id?.message}
                                />

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] btn-primary h-16 flex items-center justify-center gap-3 shadow-2xl shadow-primary-600/30 text-xs font-black uppercase tracking-widest"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck size={20} />}
                                        {isSubmitting ? 'Finalizing...' : editingId ? 'Update Program' : 'Launch Program'}
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

export default SpecialitiesPage;
