import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    GraduationCap,
    Loader2,
    X,
    UserPlus,
    Filter,
    School,
    Building2,
    BookOpen,
    CreditCard,
    FileCheck,
    Download,
    Users,
    Calendar,
    Award,
    MoreVertical,
    Eye,
    Mail
} from 'lucide-react';
import { cn } from '../utils/cn';
import studentService from '../api/services/studentService';
import specialityService from '../api/services/specialityService';
import departmentService from '../api/services/departmentService';
import classService from '../api/services/classService';
import roleService from '../api/services/roleService';
import StudentForm from '../features/students/components/StudentForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import Badge from '../components/ui/Badge';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [classes, setClasses] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedProgram, setSelectedProgram] = useState('all');
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentData, deptData, specData, classData, roleData] = await Promise.all([
                studentService.getAll(),
                departmentService.getAll(),
                specialityService.getAll(),
                classService.getAll(),
                roleService.getAll()
            ]);
            setStudents(studentData || []);
            setDepartments(deptData || []);
            setSpecialities(specData || []);
            setClasses(classData || []);
            setRoles(roleData || []);
        } catch (err) {
            toast.error('Failed to load student data');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingStudent) {
                await studentService.update(editingStudent.id, formData);
                toast.success('Student record updated successfully');
            } else {
                await studentService.create(formData);
                toast.success('Student enrolled successfully');
            }
            setModalOpen(false);
            setEditingStudent(null);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Operation failed. Please try again.';
            toast.error(msg);
        }
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setMenuOpen(null);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;
        setIsDeleting(true);
        try {
            await studentService.delete(studentToDelete.id);
            toast.success('Student record removed');
            fetchData();
        } catch (err) {
            toast.error('Failed to remove student record');
        } finally {
            setIsDeleting(false);
            setStudentToDelete(null);
        }
    };

    // Get unique programs for filter
    const uniquePrograms = [...new Set(students.map(s => s.speciality_name).filter(Boolean))];

    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchQuery ||
            student.registration_num.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.cin && student.cin.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesProgram = selectedProgram === 'all' || student.speciality_name === selectedProgram;
        const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

        return matchesSearch && matchesProgram && matchesStatus;
    });

    const getStudentInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Enroll and manage student records across academic programs</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingStudent(null);
                        setModalOpen(true);
                    }}
                    icon={UserPlus}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                    Enroll Student
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{students.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active This Year</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {students.filter(s => s.status === 'active').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Academic Programs</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{uniquePrograms.length}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg. GPA</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">3.4</p>
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
                                placeholder="Search students by name, registration, email, or CIN..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                            <option value="all">All Programs</option>
                            {uniquePrograms.map(program => (
                                <option key={program} value={program}>{program}</option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Grid */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading student data...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredStudents.map((student, index) => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                                >
                                    {/* Header with Actions */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                {getStudentInitials(student.first_name, student.last_name)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {student.first_name} {student.last_name}
                                                    </h3>
                                                    <Badge 
                                                        className={cn(
                                                            "text-xs",
                                                            student.status === 'active' && "bg-green-100 text-green-700 border-green-200",
                                                            student.status === 'inactive' && "bg-gray-100 text-gray-700 border-gray-200",
                                                            student.status === 'graduated' && "bg-blue-100 text-blue-700 border-blue-200"
                                                        )}
                                                    >
                                                        {student.status || 'Active'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{student.registration_num}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpen(menuOpen === student.id ? null : student.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            
                                            {menuOpen === student.id && (
                                                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <button
                                                        onClick={() => {
                                                            setEditingStudent(student);
                                                            setModalOpen(true);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit Student
                                                    </button>
                                                    <button className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <Eye size={14} />
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(student)}
                                                        className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Student Info */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail size={14} className="text-gray-400" />
                                            <span className="truncate">{student.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CreditCard size={14} className="text-gray-400" />
                                            <span>CIN: {student.cin || 'Not provided'}</span>
                                        </div>
                                    </div>

                                    {/* Academic Details */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <BookOpen size={12} className="text-gray-500" />
                                                <span className="text-xs font-medium text-gray-500">Program</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {student.speciality_name || 'Not assigned'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <School size={12} className="text-gray-500" />
                                                <span className="text-xs font-medium text-gray-500">Class</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {student.class_name || 'Not assigned'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    {(student.bac_document_url || student.cin_document_url) && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Documents</p>
                                            <div className="flex gap-2">
                                                {student.bac_document_url && (
                                                    <a
                                                        href={`${import.meta.env.VITE_STORAGE_URL}${student.bac_document_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        <FileCheck size={12} />
                                                        BAC
                                                    </a>
                                                )}
                                                {student.cin_document_url && (
                                                    <a
                                                        href={`${import.meta.env.VITE_STORAGE_URL}${student.cin_document_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        <CreditCard size={12} />
                                                        CIN
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {filteredStudents.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <GraduationCap className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                {searchQuery || selectedProgram !== 'all' || selectedStatus !== 'all'
                                    ? 'Try adjusting your search filters'
                                    : 'Get started by enrolling your first student'}
                            </p>
                            {!searchQuery && selectedProgram === 'all' && selectedStatus === 'all' && (
                                <Button
                                    onClick={() => {
                                        setEditingStudent(null);
                                        setModalOpen(true);
                                    }}
                                    icon={UserPlus}
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Enroll First Student
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Student Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingStudent(null);
                }}
                title={editingStudent ? 'Edit Student Record' : 'Enroll New Student'}
                subtitle={editingStudent ? 'Update student information and academic details' : 'Complete the enrollment form to add a new student'}
                size="xl"
            >
                <StudentForm
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setModalOpen(false);
                        setEditingStudent(null);
                    }}
                    isEditing={!!editingStudent}
                    initialValues={editingStudent}
                    departments={departments}
                    specialities={specialities}
                    classes={classes}
                    roles={roles}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!studentToDelete}
                onClose={() => setStudentToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Student Record"
                message={`Are you sure you want to delete ${studentToDelete?.first_name} ${studentToDelete?.last_name}? This will permanently remove all academic records and associated data. This action cannot be undone.`}
                confirmText="Delete Student"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default StudentsPage;