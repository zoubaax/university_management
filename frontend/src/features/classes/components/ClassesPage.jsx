import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    School,
    Users,
    BookOpen,
    Edit2,
    Trash2,
    Calendar,
    Layers,
    Building2,
    ChevronRight,
    SearchX,
    Filter,
    GraduationCap,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { useClasses } from '../hooks/useClasses';
import ClassForm from './ClassForm';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../../contexts/AuthContext';
import moduleService from '../../../api/services/moduleService';

const ClassesPage = () => {
    const {
        classes,
        specialities,
        loading,
        createClass,
        updateClass,
        deleteClass
    } = useClasses();

    const { user } = useAuth();
    const isProfessor = user?.role_name === 'PROFESSOR';
    const isManager = ['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'].includes(user?.role_name);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [classToDelete, setClassToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('all');
    const [menuOpen, setMenuOpen] = useState(null);
    const [modules, setModules] = useState([]);

    React.useEffect(() => {
        const fetchModules = async () => {
            try {
                const data = await moduleService.getAll();
                setModules(data || []);
            } catch (err) {
                console.error('Failed to fetch modules for assignment check', err);
            }
        };
        fetchModules();
    }, []);

    const professorClassIds = useMemo(() => {
        if (!isProfessor) return [];
        return modules
            .flatMap(m => m.assignments || [])
            .filter(a => a.professor_id === user?.employee_id)
            .map(a => a.class_id);
    }, [modules, isProfessor, user?.employee_id]);

    const visibleClasses = useMemo(() => {
        if (!isProfessor) return classes;
        return classes.filter(c => professorClassIds.includes(c.id));
    }, [classes, isProfessor, professorClassIds]);

    const filteredClasses = useMemo(() => {
        if (!filterQuery && selectedSpeciality === 'all') return visibleClasses;

        return visibleClasses.filter(c => {
            const matchesSearch = !filterQuery ||
                c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                c.speciality_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                c.department_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                c.academic_year.toLowerCase().includes(filterQuery.toLowerCase());

            const matchesSpeciality = selectedSpeciality === 'all' ||
                c.speciality_id === selectedSpeciality;

            return matchesSearch && matchesSpeciality;
        });
    }, [visibleClasses, filterQuery, selectedSpeciality]);

    const handleEdit = (cls) => {
        setEditingClass(cls);
        setModalOpen(true);
        setMenuOpen(null);
    };

    const handleDeleteClick = (cls) => {
        setClassToDelete(cls);
        setMenuOpen(null);
    };

    const handleConfirmDelete = async () => {
        if (!classToDelete) return;
        setIsDeleting(true);
        const success = await deleteClass(classToDelete.id, classToDelete.name);
        setIsDeleting(false);
        if (success) setClassToDelete(null);
    };

    const handleSubmit = async (data) => {
        let success;
        if (editingClass) {
            success = await updateClass(editingClass.id, data);
        } else {
            success = await createClass(data);
        }

        if (success) {
            setModalOpen(false);
            setEditingClass(null);
        }
    };

    const getUniqueSpecialities = () => {
        const specialitiesMap = new Map();
        visibleClasses.forEach(cls => {
            if (cls.speciality_id && cls.speciality_name) {
                specialitiesMap.set(cls.speciality_id, {
                    id: cls.speciality_id,
                    name: cls.speciality_name
                });
            }
        });
        return Array.from(specialitiesMap.values());
    };

    const uniqueSpecialities = getUniqueSpecialities();

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading academic classes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Classes</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isProfessor ? 'Viewing student groups you are currently teaching' : 'Manage student groups, levels, and academic years across programs'}
                    </p>
                </div>
                {isManager && (
                    <Button
                        onClick={() => {
                            setEditingClass(null);
                            setModalOpen(true);
                        }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap"
                    >
                        New Class
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Classes</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{classes.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <School className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Students</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Programs</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{uniqueSpecialities.length}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg. Class Size</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {classes.length > 0
                                    ? Math.round(classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0) / classes.length)
                                    : 0
                                }
                            </p>
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
                                placeholder="Search classes by name, program, or year..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedSpeciality}
                            onChange={(e) => setSelectedSpeciality(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-w-[180px]"
                        >
                            <option value="all">All Programs</option>
                            {uniqueSpecialities.map(spec => (
                                <option key={spec.id} value={spec.id}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredClasses.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                        >
                            {/* Header with Actions */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gray-900 rounded-lg">
                                        <School className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Layers size={12} className="text-gray-400" />
                                            <span className="text-xs text-gray-500">{cls.level}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dropdown Menu */}
                                {isManager && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen(menuOpen === cls.id ? null : cls.id)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {menuOpen === cls.id && (
                                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={() => handleEdit(cls)}
                                                    className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit2 size={14} />
                                                    Edit Class
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(cls)}
                                                    className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Program Info */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                                    <BookOpen size={12} />
                                    Academic Program
                                </div>
                                <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {cls.speciality_name}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users size={12} className="text-gray-500" />
                                        <span className="text-xs font-medium text-gray-500">Students</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{cls.student_count || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar size={12} className="text-gray-500" />
                                        <span className="text-xs font-medium text-gray-500">Year</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{cls.academic_year}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 size={12} className="text-gray-400" />
                                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                        {cls.department_name}
                                    </span>
                                </div>
                                <button className="text-xs font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors">
                                    View details
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredClasses.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <SearchX className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        {filterQuery || selectedSpeciality !== 'all'
                            ? 'Try adjusting your search filters'
                            : 'Get started by creating your first academic class'}
                    </p>
                    {isManager && !filterQuery && selectedSpeciality === 'all' && (
                        <Button
                            onClick={() => {
                                setEditingClass(null);
                                setModalOpen(true);
                            }}
                            icon={Plus}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Create First Class
                        </Button>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingClass(null);
                }}
                title={editingClass ? 'Edit Class' : 'Create New Class'}
                subtitle={editingClass ? 'Update class details and configuration' : 'Add a new academic class to your institution'}
                size="md"
            >
                <ClassForm
                    isEditing={!!editingClass}
                    initialValues={editingClass}
                    specialities={specialities}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setModalOpen(false);
                        setEditingClass(null);
                    }}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!classToDelete}
                onClose={() => setClassToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Academic Class"
                message={`Are you sure you want to delete "${classToDelete?.name}"? This will permanently remove the class and all associated student records. This action cannot be undone.`}
                confirmText="Delete Class"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ClassesPage;