import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ShieldCheck,
    Loader2,
    X,
    Filter,
    Building2
} from 'lucide-react';
import api from '../api/axios';
import { cn } from '../utils/cn';
import useAuthStore from '../store/useAuthStore';

const SpecialitiesPage = () => {
    const [specialities, setSpecialities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentSpec, setCurrentSpec] = useState({ name: '', department_id: '' });
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [specRes, deptRes] = await Promise.all([
                api.get('/specialities'),
                api.get('/departments')
            ]);
            setSpecialities(specRes.data.data);
            setDepartments(deptRes.data.data);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentSpec.id) {
                await api.put(`/specialities/${currentSpec.id}`, currentSpec);
            } else {
                await api.post('/specialities', currentSpec);
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this speciality?')) return;
        try {
            await api.delete(`/specialities/${id}`);
            fetchData();
        } catch (err) {
            setError('Failed to delete speciality');
        }
    };

    // Check if user is Responsable and can only see their department
    const isResponsable = user?.role_name === 'RESPONSABLE_DEPARTMENT';
    const filteredSpecs = isResponsable
        ? specialities.filter(s => s.department_id === user?.department_id)
        : specialities;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Specialities</h1>
                    <p className="text-slate-500 mt-1">Manage academic programs and specializations.</p>
                </div>
                {(isResponsable || user?.role_name === 'RH' || user?.role_name === 'SUPER_ADMIN') && (
                    <button
                        onClick={() => {
                            setCurrentSpec({
                                name: '',
                                department_id: isResponsable ? user.department_id : ''
                            });
                            setModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 self-start"
                    >
                        <Plus size={20} />
                        Add Speciality
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search specialities..."
                        className="input-field pl-10"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={18} />
                    <span>Filters</span>
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredSpecs.map((spec, index) => (
                            <motion.div
                                key={spec.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="glass-card rounded-2xl p-6 relative overflow-hidden group"
                            >
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="p-3 bg-secondary-900 text-white rounded-xl shadow-lg ring-4 ring-slate-50">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setCurrentSpec(spec);
                                                setModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(spec.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 relative z-10">
                                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{spec.name}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-slate-500">
                                        <Building2 size={14} className="text-primary-500" />
                                        <span className="text-sm font-medium">
                                            {departments.find(d => d.id === spec.department_id)?.name || 'Loading Dept...'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-4 relative z-10">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        240 Students
                                    </span>
                                </div>

                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 p-8 text-slate-50/50 group-hover:text-primary-500/10 transition-colors">
                                    <ShieldCheck size={120} />
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {currentSpec.id ? 'Edit Speciality' : 'New Speciality'}
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">Define properties for the academic specialization.</p>
                            </div>

                            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Speciality Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentSpec.name}
                                        onChange={(e) => setCurrentSpec({ ...currentSpec, name: e.target.value })}
                                        placeholder="e.g. Software Engineering"
                                        className="input-field"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Assigned Department</label>
                                    <select
                                        required
                                        disabled={isResponsable}
                                        value={currentSpec.department_id}
                                        onChange={(e) => setCurrentSpec({ ...currentSpec, department_id: e.target.value })}
                                        className="input-field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.75rem_center]"
                                    >
                                        <option value="">Select a department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 btn-primary h-12 flex items-center justify-center gap-2 shadow-primary-600/20 shadow-lg"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : currentSpec.id ? 'Save Changes' : 'Create Speciality'}
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
