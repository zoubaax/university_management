import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    BookOpen,
    Loader2,
    X,
    AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { cn } from '../utils/cn';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState({ name: '', description: '' });
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data.data);
        } catch (err) {
            setError('Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentDept.id) {
                await api.put(`/departments/${currentDept.id}`, currentDept);
            } else {
                await api.post('/departments', currentDept);
            }
            setModalOpen(false);
            fetchDepartments();
            setCurrentDept({ name: '', description: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            setError('Failed to delete department');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Departments</h1>
                    <p className="text-slate-500 mt-1">Manage institutional departments and faculty headers.</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentDept({ name: '', description: '' });
                        setModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2 self-start"
                >
                    <Plus size={20} />
                    Create Department
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filter departments..."
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {departments.map((dept, index) => (
                            <motion.div
                                key={dept.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="glass-card rounded-2xl p-6 group hover:border-primary-300 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary-100 text-primary-600 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setCurrentDept(dept);
                                                setModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors uppercase tracking-tight">
                                    {dept.name}
                                </h3>
                                <p className="text-slate-500 mt-2 text-sm line-clamp-2 leading-relaxed">
                                    {dept.description || 'No description provided.'}
                                </p>
                                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        8 Faculty Members
                                    </span>
                                    <button className="text-primary-600 text-xs font-black uppercase tracking-wider hover:underline">
                                        View Details
                                    </button>
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
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {currentDept.id ? 'Update Department' : 'Create New Department'}
                                </h2>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Department Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentDept.name}
                                        onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
                                        placeholder="e.g. Computer Science"
                                        className="input-field"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Description</label>
                                    <textarea
                                        rows={4}
                                        value={currentDept.description || ''}
                                        onChange={(e) => setCurrentDept({ ...currentDept, description: e.target.value })}
                                        placeholder="Describe the department's focus..."
                                        className="input-field resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : currentDept.id ? 'Save Changes' : 'Create'}
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

export default DepartmentsPage;
