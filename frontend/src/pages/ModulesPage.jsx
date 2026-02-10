import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    BookOpen,
    Plus,
    Search,
    Edit2,
    Trash2,
    Link as LinkIcon,
    Users,
    Layers,
    Clock,
    ChevronRight,
    Loader2,
    MoreVertical,
    FileText,
    School,
    Building2,
    Calendar,
    Award,
    Filter,
    AlertCircle
} from 'lucide-react';
import moduleService from '../api/services/moduleService';
import specialityService from '../api/services/specialityService';
import classService from '../api/services/classService';
import staffService from '../api/services/staffService';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import Badge from '../components/ui/Badge';
import ModuleForm from '../features/modules/components/ModuleForm';
import AssignmentForm from '../features/modules/components/AssignmentForm';
import { cn } from '../utils/cn';

const ModulesPage = () => {
    const [modules, setModules] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [classes, setClasses] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModuleModalOpen, setModuleModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [moduleToDelete, setModuleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [modulesData, specsData, classesData, staffData] = await Promise.all([
                moduleService.getAll(),
                specialityService.getAll(),
                classService.getAll(),
                staffService.getAll({ type: 'PROFESSOR' })
            ]);
            setModules(modulesData || []);
            setSpecialities(specsData || []);
            setClasses(classesData || []);
            setProfessors(staffData || []);
        } catch (err) {
            toast.error('Failed to load academic modules');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async (data) => {
        try {
            if (editingModule) {
                await moduleService.update(editingModule.id, data);
                toast.success('Module updated successfully');
            } else {
                await moduleService.create(data);
                toast.success('New module created successfully');
            }
            setModuleModalOpen(false);
            setEditingModule(null);
            fetchInitialData();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Operation failed. Please try again.';
            toast.error(errorMsg);
        }
    };

    const handleAssignModule = async (data) => {
        try {
            await moduleService.assignToClass(data);
            toast.success('Module assigned to class successfully');
            setAssignModalOpen(false);
            fetchInitialData();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Assignment failed. Please try again.';
            toast.error(errorMsg);
        }
    };

    const handleDeleteClick = (module) => {
        setModuleToDelete(module);
        setMenuOpen(null);
    };

    const handleConfirmDelete = async () => {
        if (!moduleToDelete) return;
        setIsDeleting(true);
        try {
            await moduleService.delete(moduleToDelete.id);
            toast.success('Module deleted successfully');
            fetchInitialData();
        } catch (err) {
            toast.error('Failed to delete module. It may be assigned to active classes.');
        } finally {
            setIsDeleting(false);
            setModuleToDelete(null);
        }
    };

    const getUniqueSpecialities = () => {
        const specialitiesMap = new Map();
        modules.forEach(module => {
            if (module.speciality_id && module.speciality_name) {
                specialitiesMap.set(module.speciality_id, {
                    id: module.speciality_id,
                    name: module.speciality_name
                });
            }
        });
        return Array.from(specialitiesMap.values());
    };

    const uniqueSpecialities = getUniqueSpecialities();

    const filteredModules = modules.filter(module => {
        const matchesSearch = !searchQuery ||
            module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            module.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (module.description && module.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSpeciality = selectedSpeciality === 'all' || module.speciality_id === selectedSpeciality;
        const matchesStatus = selectedStatus === 'all' || module.status === selectedStatus;

        return matchesSearch && matchesSpeciality && matchesStatus;
    });

    const getModuleAssignmentsCount = (module) => {
        return module.assignments?.length || 0;
    };

    const getCoefficientColor = (coefficient) => {
        const num = parseFloat(coefficient) || 0;
        if (num <= 1) return 'bg-green-100 text-green-700 border-green-200';
        if (num <= 2) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (num <= 3) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Modules</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage course subjects, curriculum, and faculty assignments</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => setAssignModalOpen(true)}
                        icon={LinkIcon}
                        variant="outline"
                        className="order-2 sm:order-1"
                    >
                        Assign to Class
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingModule(null);
                            setModuleModalOpen(true);
                        }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white order-1 sm:order-2"
                    >
                        New Module
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Modules</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{modules.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Assignments</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {modules.reduce((sum, module) => sum + getModuleAssignmentsCount(module), 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <LinkIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Professors</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{professors.length}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg. Coefficient</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {modules.length > 0 
                                    ? (modules.reduce((sum, module) => sum + parseFloat(module.coefficient || 0), 0) / modules.length).toFixed(1)
                                    : '0.0'
                                }
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Award className="w-6 h-6 text-amber-600" />
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
                                placeholder="Search modules by name, code, or description..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedSpeciality}
                            onChange={(e) => setSelectedSpeciality(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                            <option value="all">All Programs</option>
                            {uniqueSpecialities.map(spec => (
                                <option key={spec.id} value={spec.id}>{spec.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading academic modules...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredModules.map((module, index) => (
                                <motion.div
                                    key={module.id}
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
                                                <BookOpen className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">{module.name}</h3>
                                                    <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                                        {module.code}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {module.speciality_name}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpen(menuOpen === module.id ? null : module.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            
                                            {menuOpen === module.id && (
                                                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <button
                                                        onClick={() => {
                                                            setEditingModule(module);
                                                            setModuleModalOpen(true);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit Module
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(module)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Module Details */}
                                    <div className="space-y-3 mb-4">
                                        {module.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">{module.description}</p>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Award size={12} className="text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-500">Coefficient</span>
                                                </div>
                                                <Badge className={`text-xs ${getCoefficientColor(module.coefficient)}`}>
                                                    {module.coefficient}
                                                </Badge>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Users size={12} className="text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-500">Assignments</span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {getModuleAssignmentsCount(module)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignments Preview */}
                                    {module.assignments && module.assignments.length > 0 && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <School size={12} className="text-gray-500" />
                                                <span className="text-xs font-medium text-gray-500">Class Assignments</span>
                                            </div>
                                            <div className="space-y-2">
                                                {module.assignments.slice(0, 2).map((assignment, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            <span className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                                                {assignment.class_name}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-700 font-medium">
                                                                {assignment.professor_first_name?.charAt(0)}. {assignment.professor_last_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{assignment.hours_per_week}h/wk</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {module.assignments.length > 2 && (
                                                    <div className="text-center">
                                                        <span className="text-xs text-gray-500">
                                                            +{module.assignments.length - 2} more assignments
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={12} className="text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    {module.department_name || 'General Department'}
                                                </span>
                                            </div>
                                            <button className="text-xs font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors">
                                                Details
                                                <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {filteredModules.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                {searchQuery || selectedSpeciality !== 'all'
                                    ? 'Try adjusting your search filters'
                                    : 'Get started by creating your first academic module'}
                            </p>
                            {!searchQuery && selectedSpeciality === 'all' && (
                                <Button
                                    onClick={() => {
                                        setEditingModule(null);
                                        setModuleModalOpen(true);
                                    }}
                                    icon={Plus}
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Create First Module
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <Modal
                isOpen={isModuleModalOpen}
                onClose={() => {
                    setModuleModalOpen(false);
                    setEditingModule(null);
                }}
                title={editingModule ? 'Edit Module' : 'Create New Module'}
                subtitle={editingModule ? 'Update module details and configuration' : 'Define a new academic module for your curriculum'}
                size="md"
            >
                <ModuleForm
                    onSubmit={handleCreateModule}
                    onCancel={() => {
                        setModuleModalOpen(false);
                        setEditingModule(null);
                    }}
                    isEditing={!!editingModule}
                    initialValues={editingModule}
                    specialities={specialities}
                />
            </Modal>

            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title="Assign Module to Class"
                subtitle="Link a module to a specific class and assign teaching responsibilities"
                size="md"
            >
                <AssignmentForm
                    onSubmit={handleAssignModule}
                    onCancel={() => setAssignModalOpen(false)}
                    classes={classes}
                    modules={modules}
                    professors={professors}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!moduleToDelete}
                onClose={() => setModuleToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Academic Module"
                message={`Are you sure you want to delete "${moduleToDelete?.name}"? This will permanently remove the module and all associated class assignments. This action cannot be undone.`}
                confirmText="Delete Module"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ModulesPage;