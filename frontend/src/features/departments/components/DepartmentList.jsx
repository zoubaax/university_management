import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { useDepartments } from '../hooks/useDepartments';
import DepartmentForm from './DepartmentForm';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const DepartmentList = () => {
    const { departments, loading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [filter, setFilter] = useState('');

    const handleEdit = (dept) => {
        setEditingDepartment(dept);
        setModalOpen(true);
    };

    const handleDelete = (id) => {
        // We could use a proper confirmation modal here, but for now simple confirm
        if (window.confirm("Are you sure you want to delete this department?")) {
            deleteDepartment(id);
        }
    };

    const handleSubmit = async (data) => {
        let success;
        if (editingDepartment) {
            success = await updateDepartment(editingDepartment.id, data);
        } else {
            success = await createDepartment(data);
        }

        if (success) {
            setModalOpen(false);
            setEditingDepartment(null);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingDepartment(null);
    };

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(filter.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Departments</h1>
                    <p className="text-slate-500 mt-1">Manage institutional departments and faculty headers.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingDepartment(null);
                        setModalOpen(true);
                    }}
                    icon={Plus}
                >
                    Create Department
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filter departments..."
                        className="input-field pl-10"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
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
                        {filteredDepartments.map((dept, index) => (
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
                                            onClick={() => handleEdit(dept)}
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
                                <p className="text-slate-500 mt-2 text-sm line-clamp-2 leading-relaxed h-10">
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

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingDepartment ? 'Update Department' : 'Create New Department'}
            >
                <DepartmentForm
                    initialValues={editingDepartment}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default DepartmentList;
