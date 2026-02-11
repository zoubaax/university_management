import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Plus,
    Search,
    Download,
    Trash2,
    Filter,
    Loader2,
    BookOpen,
    Video,
    FileArchive,
    FileCode,
    Clock,
    User,
    ChevronDown,
    MoreVertical,
    CheckCircle2,
    X,
    ExternalLink,
    Paperclip,
    Layers,
    FolderOpen,
    Upload,
    AlertCircle,
    GraduationCap,
    Calendar,
    Tag,
    File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import courseResourceService from '../api/services/courseResourceService';
import classService from '../api/services/classService';
import moduleService from '../api/services/moduleService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ui/ConfirmModal';
import { cn } from '../utils/cn';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CourseResourcesPage = () => {
    const { user } = useAuth();
    const isProfessor = user?.role_name === 'PROFESSOR';
    const isStudent = user?.role_name === 'STUDENT';
    const isDeptHead = ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'].includes(user?.role_name);

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    // Modal states
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [resourceToEdit, setResourceToEdit] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        class_id: '',
        module_id: '',
        type: 'COURSE',
        title: '',
        description: '',
        resourceFile: null
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchResources();
        } else if (isStudent && user?.class_id) {
            setSelectedClass(user.class_id);
        } else if (isProfessor) {
            fetchAllProfessorResources();
        }
    }, [selectedClass]);

    const fetchInitialData = async () => {
        try {
            const [classesData, modulesData] = await Promise.all([
                classService.getAll(),
                moduleService.getAll()
            ]);
            setClasses(classesData || []);
            setModules(modulesData || []);

            if (isStudent && user?.class_id) {
                setSelectedClass(user.class_id);
            }
        } catch (err) {
            toast.error('Failed to load classes or modules');
            console.error('Initial data fetch error:', err);
        }
    };

    const fetchResources = async () => {
        if (!selectedClass) return;
        try {
            setLoading(true);
            const response = await courseResourceService.getClassResources(selectedClass);
            setResources(response.data || []);
        } catch (err) {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProfessorResources = async () => {
        if (!isProfessor) return;
        try {
            setLoading(true);
            const response = await courseResourceService.getProfessorResources(user.employee_id);
            setResources(response.data || []);
        } catch (err) {
            toast.error('Failed to load your resources');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.resourceFile || !formData.class_id || !formData.module_id || !formData.title) {
            return toast.error('Please fill all required fields and select a file');
        }

        const data = new FormData();
        data.append('resource', formData.resourceFile);
        data.append('class_id', formData.class_id);
        data.append('module_id', formData.module_id);
        data.append('type', formData.type);
        data.append('title', formData.title);
        data.append('description', formData.description || '');

        try {
            setIsUploading(true);
            await courseResourceService.createResource(data);
            toast.success('Resource uploaded successfully');
            setUploadModalOpen(false);
            resetForm();
            if (selectedClass === formData.class_id || (!selectedClass && isProfessor)) {
                if (isProfessor && !selectedClass) fetchAllProfessorResources();
                else fetchResources();
            }
        } catch (err) {
            toast.error(err.error || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = async () => {
        if (!resourceToEdit) return;
        try {
            setIsUploading(true);
            await courseResourceService.updateResource(resourceToEdit.id, {
                title: resourceToEdit.title,
                description: resourceToEdit.description
            });
            toast.success('Resource updated successfully');
            setResourceToEdit(null);
            if (selectedClass) fetchResources();
            else if (isProfessor) fetchAllProfessorResources();
        } catch (err) {
            toast.error('Update failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!resourceToDelete) return;
        try {
            setIsDeleting(true);
            await courseResourceService.deleteResource(resourceToDelete.id);
            toast.success('Resource deleted successfully');
            setResourceToDelete(null);
            setResources(prev => prev.filter(r => r.id !== resourceToDelete.id));
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            class_id: '',
            module_id: '',
            type: 'COURSE',
            title: '',
            description: '',
            resourceFile: null
        });
    };

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesSearch = !searchQuery || 
                res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.module_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesType = selectedType === 'ALL' || res.type === selectedType;
            const matchesModule = !selectedModule || res.module_id === selectedModule;
            
            return matchesSearch && matchesType && matchesModule;
        });
    }, [resources, searchQuery, selectedType, selectedModule]);

    const getFileIcon = (fileName, type) => {
        const ext = fileName?.split('.').pop().toLowerCase();
        
        // Document types
        if (['pdf'].includes(ext)) return <FileText className="w-5 h-5 text-red-500" />;
        if (['doc', 'docx'].includes(ext)) return <FileText className="w-5 h-5 text-blue-600" />;
        if (['ppt', 'pptx'].includes(ext)) return <FileText className="w-5 h-5 text-orange-500" />;
        if (['xls', 'xlsx'].includes(ext)) return <FileText className="w-5 h-5 text-green-600" />;
        
        // Media types
        if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return <Video className="w-5 h-5 text-purple-500" />;
        if (['mp3', 'wav'].includes(ext)) return <FileText className="w-5 h-5 text-pink-500" />;
        
        // Archive types
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive className="w-5 h-5 text-amber-500" />;
        
        // Code files
        if (['js', 'py', 'java', 'cpp', 'html', 'css', 'php'].includes(ext)) return <FileCode className="w-5 h-5 text-blue-500" />;
        
        // Default by type
        if (type === 'TP') return <Layers className="w-5 h-5 text-indigo-500" />;
        if (type === 'EXAM') return <FileText className="w-5 h-5 text-amber-500" />;
        
        return <BookOpen className="w-5 h-5 text-blue-500" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getTypeColor = (type) => {
        const colors = {
            COURSE: 'bg-blue-100 text-blue-700 border-blue-200',
            TP: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            EXAM: 'bg-amber-100 text-amber-700 border-amber-200',
            OTHER: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return colors[type] || colors.OTHER;
    };

    const typeOptions = [
        { value: 'ALL', label: 'All Resources', count: resources.length },
        { value: 'COURSE', label: 'Course Content', count: resources.filter(r => r.type === 'COURSE').length },
        { value: 'TP', label: 'Practical Work', count: resources.filter(r => r.type === 'TP').length },
        { value: 'EXAM', label: 'Past Exams', count: resources.filter(r => r.type === 'EXAM').length },
        { value: 'OTHER', label: 'Other', count: resources.filter(r => r.type === 'OTHER').length }
    ];

    const modulesInResources = useMemo(() => {
        const moduleMap = new Map();
        resources.forEach(res => {
            if (res.module_id && res.module_name) {
                moduleMap.set(res.module_id, res.module_name);
            }
        });
        return Array.from(moduleMap.entries()).map(([id, name]) => ({ id, name }));
    }, [resources]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-900 rounded-lg">
                        <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Course Resources</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Access and manage educational materials, documents, and course content
                        </p>
                    </div>
                </div>
                {(isProfessor || isDeptHead) && (
                    <Button
                        onClick={() => {
                            resetForm();
                            setUploadModalOpen(true);
                        }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        Upload Resource
                    </Button>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Resources</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{resources.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Course Materials</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {resources.filter(r => r.type === 'COURSE').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">TP Labs</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {resources.filter(r => r.type === 'TP').length}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <Layers className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Past Exams</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {resources.filter(r => r.type === 'EXAM').length}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <FileText className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, description, or module..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {!isStudent && (
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-w-[180px]"
                            >
                                <option value="">{isProfessor ? "All My Uploads" : "Select Class"}</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} - {c.speciality_name || c.level}
                                    </option>
                                ))}
                            </select>
                        )}
                        
                        {modulesInResources.length > 0 && (
                            <select
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-w-[180px]"
                            >
                                <option value="">All Modules</option>
                                {modulesInResources.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        )}

                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 transition-colors",
                                    viewMode === 'grid' 
                                        ? "bg-gray-900 text-white" 
                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                                    <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                                    <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                                    <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 transition-colors",
                                    viewMode === 'list' 
                                        ? "bg-gray-900 text-white" 
                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="4" y="4" width="16" height="4" strokeWidth="1.5" />
                                    <rect x="4" y="10" width="16" height="4" strokeWidth="1.5" />
                                    <rect x="4" y="16" width="16" height="4" strokeWidth="1.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Type Filters */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    {typeOptions.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                                selectedType === type.value
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            {type.label}
                            <span className={cn(
                                "ml-2 px-1.5 py-0.5 rounded-full text-[10px]",
                                selectedType === type.value
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-200 text-gray-700"
                            )}>
                                {type.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading resources...</p>
                </div>
            ) : filteredResources.length > 0 ? (
                viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredResources.map((res, index) => (
                                <motion.div
                                    key={res.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            {getFileIcon(res.file_name, res.type)}
                                        </div>
                                        
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpen(menuOpen === res.id ? null : res.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            
                                            {menuOpen === res.id && (
                                                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <a
                                                        href={`${API_BASE_URL}${res.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Download size={14} />
                                                        Download
                                                    </a>
                                                    {(isProfessor || isDeptHead) && (
                                                        <>
                                                            <button
                                                                onClick={() => setResourceToEdit(res)}
                                                                className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <FileText size={14} />
                                                                Edit Info
                                                            </button>
                                                            <button
                                                                onClick={() => setResourceToDelete(res)}
                                                                className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Badge className={cn("text-xs", getTypeColor(res.type))}>
                                                {res.type}
                                            </Badge>
                                            <span className="text-xs text-gray-400">
                                                {formatFileSize(res.file_size)}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-medium text-gray-900 line-clamp-2" title={res.title}>
                                            {res.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <BookOpen size={12} className="flex-shrink-0" />
                                            <span className="truncate">{res.module_name}</span>
                                        </div>
                                        
                                        {res.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {res.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                            <Calendar size={10} />
                                            {new Date(res.created_at).toLocaleDateString()}
                                        </div>
                                        <a
                                            href={`${API_BASE_URL}${res.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            <Download size={12} />
                                            Download
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    // List View
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredResources.map((res) => (
                                        <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        {getFileIcon(res.file_name, res.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{res.title}</p>
                                                        {res.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                                                                {res.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">{res.module_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={cn("text-xs", getTypeColor(res.type))}>
                                                    {res.type}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{formatFileSize(res.file_size)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(res.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={`${API_BASE_URL}${res.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                    {(isProfessor || isDeptHead) && (
                                                        <>
                                                            <button
                                                                onClick={() => setResourceToDelete(res)}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                // Empty State
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        {searchQuery || selectedType !== 'ALL' || selectedModule
                            ? 'Try adjusting your search filters'
                            : isProfessor 
                                ? 'Upload your first course resource to share with students'
                                : 'No resources have been uploaded for this class yet'}
                    </p>
                    {isProfessor && !searchQuery && selectedType === 'ALL' && !selectedModule && (
                        <Button
                            onClick={() => {
                                resetForm();
                                setUploadModalOpen(true);
                            }}
                            icon={Plus}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Upload First Resource
                        </Button>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setUploadModalOpen(false);
                    resetForm();
                }}
                title="Upload Course Resource"
                subtitle="Share educational materials with your students"
                size="lg"
            >
                <form onSubmit={handleUpload} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Class"
                            placeholder="Select class"
                            options={classes.map(c => ({ 
                                value: c.id, 
                                label: `${c.name} - ${c.level}`,
                                description: c.speciality_name
                            }))}
                            value={formData.class_id}
                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                            required
                        />
                        <Select
                            label="Module"
                            placeholder="Select module"
                            options={modules
                                .filter(m => !formData.class_id || m.speciality_id === classes.find(c => c.id === formData.class_id)?.speciality_id)
                                .map(m => ({ value: m.id, label: m.name }))
                            }
                            value={formData.module_id}
                            onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Resource Type"
                            options={[
                                { value: 'COURSE', label: 'Course Content', description: 'Lecture notes, slides, presentations' },
                                { value: 'TP', label: 'Practical Work (TP)', description: 'Lab exercises, assignments' },
                                { value: 'EXAM', label: 'Past Exam', description: 'Previous exams, sample tests' },
                                { value: 'OTHER', label: 'Other', description: 'Additional resources' },
                            ]}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Upload className="w-4 h-4" />
                                File
                                <span className="text-xs text-red-500">*</span>
                            </label>
                            <div className={cn(
                                "border-2 border-dashed rounded-lg p-4 transition-colors",
                                formData.resourceFile ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-gray-400"
                            )}>
                                <input
                                    type="file"
                                    id="resource-file"
                                    className="hidden"
                                    onChange={(e) => setFormData({ ...formData, resourceFile: e.target.files[0] })}
                                />
                                <label htmlFor="resource-file" className="cursor-pointer block">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded",
                                            formData.resourceFile ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                        )}>
                                            {formData.resourceFile ? <CheckCircle2 size={16} /> : <Upload size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {formData.resourceFile?.name || 'Click to select file'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                PDF, DOC, PPT, MP4, ZIP (Max 100MB)
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Title"
                        placeholder="Enter descriptive title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            Description
                            <span className="text-xs text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-h-[100px] resize-none"
                            placeholder="Provide a brief description of this resource..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setUploadModalOpen(false);
                                resetForm();
                            }}
                            className="flex-1"
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isUploading}
                            disabled={isUploading || !formData.resourceFile || !formData.class_id || !formData.module_id || !formData.title}
                            className="flex-1 bg-gray-900 hover:bg-gray-800"
                            icon={Upload}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Resource'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!resourceToEdit}
                onClose={() => setResourceToEdit(null)}
                title="Edit Resource Information"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={resourceToEdit?.title || ''}
                        onChange={(e) => setResourceToEdit({ ...resourceToEdit, title: e.target.value })}
                        required
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-h-[100px] resize-none"
                            placeholder="Add a description..."
                            value={resourceToEdit?.description || ''}
                            onChange={(e) => setResourceToEdit({ ...resourceToEdit, description: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setResourceToEdit(null)} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEdit}
                            isLoading={isUploading}
                            className="flex-1 bg-gray-900 hover:bg-gray-800"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!resourceToDelete}
                onClose={() => setResourceToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Resource"
                message={`Are you sure you want to delete "${resourceToDelete?.title}"? This will permanently remove the file and cannot be undone.`}
                confirmText="Delete Resource"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default CourseResourcesPage;