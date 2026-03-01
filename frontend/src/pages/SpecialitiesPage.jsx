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
    BookOpen,
    Building2,
    Users,
    GraduationCap,
    Filter,
    MoreVertical,
    X,
    CheckCircle,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import specialityService from '../api/services/specialityService';
import departmentService from '../api/services/departmentService';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Badge from '../components/ui/Badge';

const specialitySchema = z.object({
    name: z.string()
        .min(2, 'Speciality name must be at least 2 characters')
        .max(100, 'Name is too long'),
    department_id: z.string().min(36, 'Please select a department'),
    yearly_price: z.preprocess((val) => parseFloat(val || 0), z.number().min(0, 'Price must be 0 or more')),
});

const SpecialitiesPage = () => {
    const [specialities, setSpecialities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [programToDelete, setProgramToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');

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
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await specialityService.update(editingId, data);
                toast.success('Program updated successfully');
            } else {
                await specialityService.create(data);
                toast.success('New program created');
            }
            setModalOpen(false);
            reset();
            setEditingId(null);
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Operation failed. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleEdit = (spec) => {
        setEditingId(spec.id);
        setValue('name', spec.name);
        setValue('department_id', spec.department_id);
        setValue('yearly_price', spec.yearly_price || 0);
        setModalOpen(true);
        setMenuOpen(null);
    };

    const handleDeleteClick = (spec) => {
        setProgramToDelete(spec);
        setMenuOpen(null);
    };

    const handleConfirmDelete = async () => {
        if (!programToDelete) return;
        setIsDeleting(true);
        try {
            await specialityService.delete(programToDelete.id);
            toast.success('Program deleted');
            fetchData();
        } catch (err) {
            toast.error('Cannot delete: This program may have active enrollments.');
        } finally {
            setIsDeleting(false);
            setProgramToDelete(null);
        }
    };

    const isResponsable = user?.role_name === 'RESPONSABLE_DEPARTMENT';

    // Filter specialities
    const filteredSpecs = specialities.filter(s => {
        const matchesRole = isResponsable ? s.department_id === user?.department_id : true;
        const search = filterQuery.toLowerCase();
        const matchesSearch = s.name.toLowerCase().includes(search) ||
            s.department_name?.toLowerCase().includes(search);
        const matchesDept = selectedDepartment === 'all' || s.department_id === selectedDepartment;
        return matchesRole && matchesSearch && matchesDept;
    });

    const getDepartmentName = (departmentId) => {
        return departments.find(d => d.id === departmentId)?.name || 'Unknown Department';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Programs</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage specialities and academic pathways across departments</p>
                </div>
                {(isResponsable || ['RH', 'SUPER_ADMIN'].includes(user?.role_name)) && (
                    <Button
                        onClick={() => {
                            reset();
                            setEditingId(null);
                            if (isResponsable) setValue('department_id', user.department_id);
                            setModalOpen(true);
                        }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        New Program
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Programs</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{specialities.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Departments</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{departments.length}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Students</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">1,240</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Faculty</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">68</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search programs..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Programs Grid */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-sm text-gray-500">Loading programs...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredSpecs.map((spec, index) => (
                                <motion.div
                                    key={spec.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <BookOpen className="w-6 h-6 text-gray-600" />
                                        </div>

                                        {/* Dropdown Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpen(menuOpen === spec.id ? null : spec.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {menuOpen === spec.id && (
                                                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <button
                                                        onClick={() => handleEdit(spec)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit Program
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(spec)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{spec.name}</h3>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                        <Building2 size={14} className="text-gray-400" />
                                        <span>{getDepartmentName(spec.department_id)}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500">
                                                {spec.student_count || 0} students enrolled
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
                    {filteredSpecs.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                {filterQuery || selectedDepartment !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating your first academic program'}
                            </p>
                            {!filterQuery && selectedDepartment === 'all' && (isResponsable || ['RH', 'SUPER_ADMIN'].includes(user?.role_name)) && (
                                <Button
                                    onClick={() => {
                                        reset();
                                        setEditingId(null);
                                        if (isResponsable) setValue('department_id', user.department_id);
                                        setModalOpen(true);
                                    }}
                                    icon={Plus}
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Create First Program
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingId(null);
                    reset();
                }}
                title={editingId ? 'Edit Program' : 'Create New Program'}
                subtitle={editingId ? 'Update academic program details' : 'Add a new academic program to your institution'}
                size="md"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Program Name"
                        placeholder="Enter program name (e.g., Computer Science)"
                        leftIcon={<BookOpen className="w-4 h-4 text-gray-400" />}
                        {...register('name')}
                        error={errors.name?.message}
                        autoFocus
                    />

                    <Select
                        label="Department"
                        placeholder="Select department"
                        leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
                        disabled={isResponsable}
                        options={departments.map(d => ({
                            value: d.id,
                            label: d.name
                        }))}
                        {...register('department_id')}
                        error={errors.department_id?.message}
                    />

                    <Input
                        label="Yearly Tuition (MAD)"
                        type="number"
                        placeholder="0.00"
                        leftIcon={<Banknote className="w-4 h-4 text-gray-400" />}
                        {...register('yearly_price')}
                        error={errors.yearly_price?.message}
                    />
                    <p className="text-[10px] text-gray-400 -mt-4">
                        Set to 0 to inherit department price.
                    </p>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setModalOpen(false);
                                setEditingId(null);
                                reset();
                            }}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            className="flex-1 bg-gray-900 hover:bg-gray-800"
                            icon={editingId ? CheckCircle : Plus}
                        >
                            {editingId ? 'Update Program' : 'Create Program'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={!!programToDelete}
                onClose={() => setProgramToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Program"
                message={`Are you sure you want to delete the ${programToDelete?.name} program? This action will remove it from all course listings.`}
                confirmText="Delete Program"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default SpecialitiesPage;