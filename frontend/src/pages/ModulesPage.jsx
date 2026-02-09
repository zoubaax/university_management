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
    User,
    ChevronRight,
    Loader2,
    MoreVertical,
    FileText,
    School
} from 'lucide-react';
import { cn } from '../utils/cn';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('all');

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
            toast.error('Failed to load academic data');
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
                toast.success('New module created');
            }
            setModuleModalOpen(false);
            setEditingModule(null);
            fetchInitialData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleAssignModule = async (data) => {
        try {
            await moduleService.assignToClass(data);
            toast.success('Module assigned to class successfully');
            setAssignModalOpen(false);
            fetchInitialData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Assignment failed');
        }
    };

    const handleDeleteModule = async () => {
        if (!moduleToDelete) return;
        try {
            await moduleService.delete(moduleToDelete.id);
            toast.success('Module removed');
            fetchInitialData();
        } catch (err) {
            toast.error('Failed to delete module');
        } finally {
            setModuleToDelete(null);
        }
    };

    const filteredModules = modules.filter(m => {
        const matchesSearch = !searchQuery ||
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpec = selectedSpeciality === 'all' || m.speciality_id === selectedSpeciality;
        return matchesSearch && matchesSpec;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Modules</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage course subjects and assign them to classes and faculty</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => {
                            setEditingModule(null);
                            setModuleModalOpen(true);
                        }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        New Module
                    </Button>
                    <Button
                        onClick={() => setAssignModalOpen(true)}
                        icon={LinkIcon}
                        variant="outline"
                    >
                        Assign to Class
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Modules</p>
                        <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Specialities</p>
                        <p className="text-2xl font-bold text-gray-900">{specialities.length}</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                        <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Professors</p>
                        <p className="text-2xl font-bold text-gray-900">{professors.length}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    value={selectedSpeciality}
                    onChange={(e) => setSelectedSpeciality(e.target.value)}
                >
                    <option value="all">All Specialities</option>
                    {specialities.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Retrieving academic modules...</p>
                </div>
            ) : filteredModules.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
                    <p className="text-sm text-gray-500">No academic modules entries found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredModules.map((module) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">{module.name}</h3>
                                            <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 bg-gray-50">
                                                {module.code}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{module.speciality_name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingModule(module);
                                            setModuleModalOpen(true);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setModuleToDelete(module)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Layers size={14} className="text-gray-400" />
                                    <span>Weight: {module.coefficient}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FileText size={14} className="text-gray-400" />
                                    <span className="truncate max-w-[200px]">{module.description || 'No description'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isModuleModalOpen}
                onClose={() => {
                    setModuleModalOpen(false);
                    setEditingModule(null);
                }}
                title={editingModule ? 'Edit Module' : 'Create New Module'}
                subtitle="Define academic subjects and their characteristics"
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
                subtitle="Link a module to a specific class and assign a professor"
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

            <ConfirmModal
                isOpen={!!moduleToDelete}
                onClose={() => setModuleToDelete(null)}
                onConfirm={handleDeleteModule}
                title="Delete Module"
                message={`Are you sure you want to delete "${moduleToDelete?.name}"? This will also remove it from all assigned classes.`}
                confirmText="Delete Module"
                variant="danger"
            />
        </div>
    );
};

export default ModulesPage;
