import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Building2, Users, MoreVertical } from 'lucide-react';
import { useDepartments } from '../hooks/useDepartments';
import DepartmentForm from './DepartmentForm';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const DepartmentList = () => {
    const { departments, loading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [filter, setFilter] = useState('');
    const [menuOpen, setMenuOpen] = useState(null);

    const handleEdit = (dept) => {
        setEditingDepartment(dept);
        setModalOpen(true);
        setMenuOpen(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
            await deleteDepartment(id);
        }
        setMenuOpen(null);
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
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Departments</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage institutional departments and faculty organization</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 lg:flex-none lg:w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search departments..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingDepartment(null);
                            setModalOpen(true);
                        }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap"
                    >
                        New Department
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Departments</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{departments.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Faculty</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">42</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">Today, 10:30 AM</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <Building2 className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Departments Grid */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-sm text-gray-500">Loading departments...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredDepartments.map((dept, index) => (
                                <motion.div
                                    key={dept.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <Building2 className="w-6 h-6 text-gray-600" />
                                        </div>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpen(menuOpen === dept.id ? null : dept.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            
                                            {menuOpen === dept.id && (
                                                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <button
                                                        onClick={() => handleEdit(dept)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit Department
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(dept.id)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>
                                    
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                        {dept.description || 'No description available'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500">
                                                8 faculty members
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            Active
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {filteredDepartments.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Building2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                {filter ? 'Try adjusting your search term' : 'Get started by creating your first department'}
                            </p>
                            {!filter && (
                                <Button
                                    onClick={() => {
                                        setEditingDepartment(null);
                                        setModalOpen(true);
                                    }}
                                    icon={Plus}
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Create First Department
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingDepartment ? 'Edit Department' : 'Create New Department'}
                subtitle={editingDepartment ? 'Update department information' : 'Add a new department to your institution'}
                size="md"
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