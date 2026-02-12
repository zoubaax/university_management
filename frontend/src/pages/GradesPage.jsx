import React, { useState, useEffect, useMemo } from 'react';
import {
    Save,
    Search,
    Loader2,
    BookOpen,
    GraduationCap,
    TrendingUp,
    FileText,
    CheckCircle2,
    AlertCircle,
    User,
    Calculator,
    ChevronRight,
    ArrowUpDown,
    Download,
    Upload,
    Filter,
    RefreshCw,
    Award,
    Clock,
    Calendar,
    X,
    Edit2,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import gradeService from '../api/services/gradeService';
import classService from '../api/services/classService';
import moduleService from '../api/services/moduleService';
import studentService from '../api/services/studentService';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { cn } from '../utils/cn';
import { getCurrentAcademicYear, getAcademicYearOptions } from '../utils/academicYearUtils';

const GradesPage = () => {
    const { user } = useAuth();
    const isProfessor = user?.role_name === 'PROFESSOR';
    const isStudent = user?.role_name === 'STUDENT';
    const isDeptHead = ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'].includes(user?.role_name);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [modules, setModules] = useState([]);
    const [studentsGrades, setStudentsGrades] = useState([]);
    const [myGrades, setMyGrades] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isGradeModalOpen, setGradeModalOpen] = useState(false);

    // Filters
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('last_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [semester, setSemester] = useState('1');

    useEffect(() => {
        fetchInitialData();
        if (isStudent) {
            fetchMyGrades();
        }
    }, []);

    useEffect(() => {
        if (selectedClass && selectedModule) {
            fetchGrades();
        } else {
            setStudentsGrades([]);
        }
    }, [selectedClass, selectedModule, academicYear, semester]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classesData, modulesData] = await Promise.all([
                classService.getAll(),
                moduleService.getAll()
            ]);
            setClasses(classesData || []);
            setModules(modulesData || []);
        } catch (err) {
            toast.error('Failed to load initial data');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const response = await gradeService.getClassGrades(selectedClass, selectedModule, academicYear, semester);
            setStudentsGrades(response.data || []);
        } catch (err) {
            toast.error('Failed to load grades');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyGrades = async () => {
        try {
            setLoading(true);
            const response = await gradeService.getMyGrades(academicYear);
            setMyGrades(response.data || []);
        } catch (err) {
            toast.error('Failed to load your grades');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (studentId, field, value) => {
        const numericValue = value === '' ? null : parseFloat(value);

        if (numericValue !== null && (numericValue < 0 || numericValue > 20)) {
            toast.error('Grade must be between 0 and 20');
            return;
        }

        setStudentsGrades(prev => prev.map(row => {
            if (row.student_id === studentId || (!row.student_id && row.id === studentId)) {
                return { ...row, [field]: value === '' ? null : value };
            }
            return row;
        }));
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            const gradesToUpsert = studentsGrades.map(sg => ({
                student_id: sg.student_id || sg.id,
                module_id: selectedModule,
                class_id: selectedClass,
                cc1: sg.cc1,
                cc2: sg.cc2,
                exam: sg.exam,
                semester: parseInt(semester),
                academic_year: academicYear
            }));

            await gradeService.upsertGrades(gradesToUpsert);
            toast.success('All grades saved successfully');
            fetchGrades();
        } catch (err) {
            toast.error('Failed to save grades');
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleExportGrades = () => {
        const csvContent = [
            ['Student ID', 'Registration', 'First Name', 'Last Name', 'CC1', 'CC2', 'Exam', 'Average', 'Status'],
            ...filteredStudents.map(sg => [
                sg.student_id || sg.id,
                sg.registration_num,
                sg.first_name,
                sg.last_name,
                sg.cc1 || '',
                sg.cc2 || '',
                sg.exam || '',
                calculateAverage(sg.cc1, sg.cc2, sg.exam),
                parseFloat(calculateAverage(sg.cc1, sg.cc2, sg.exam)) >= 10 ? 'Validated' : 'Failed'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grades_${selectedClass}_${selectedModule}_${academicYear}.csv`;
        a.click();
        toast.success('Grades exported successfully');
    };

    const filteredStudents = useMemo(() => {
        let filtered = studentsGrades.filter(sg =>
            `${sg.first_name} ${sg.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sg.registration_num.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sorting
        filtered.sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';

            if (sortField === 'average') {
                aVal = parseFloat(calculateAverage(a.cc1, a.cc2, a.exam)) || 0;
                bVal = parseFloat(calculateAverage(b.cc1, b.cc2, b.exam)) || 0;
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [studentsGrades, searchQuery, sortField, sortDirection]);

    const calculateAverage = (cc1, cc2, exam) => {
        const v1 = parseFloat(cc1) || 0;
        const v2 = parseFloat(cc2) || 0;
        const vE = parseFloat(exam) || 0;

        const avg = ((v1 + v2) / 2) * 0.4 + vE * 0.6;
        return avg.toFixed(2);
    };

    const calculateClassAverage = () => {
        if (filteredStudents.length === 0) return '0.00';
        const sum = filteredStudents.reduce((acc, sg) => {
            return acc + parseFloat(calculateAverage(sg.cc1, sg.cc2, sg.exam));
        }, 0);
        return (sum / filteredStudents.length).toFixed(2);
    };

    const getPassRate = () => {
        if (filteredStudents.length === 0) return '0';
        const passed = filteredStudents.filter(sg =>
            parseFloat(calculateAverage(sg.cc1, sg.cc2, sg.exam)) >= 10
        ).length;
        return ((passed / filteredStudents.length) * 100).toFixed(0);
    };

    const selectedModuleInfo = modules.find(m => m.id === selectedModule);
    const selectedClassInfo = classes.find(c => c.id === selectedClass);

    // Student View
    if (isStudent) {
        const overallAverage = myGrades.length > 0
            ? (myGrades.reduce((acc, curr) => acc + parseFloat(calculateAverage(curr.cc1, curr.cc2, curr.exam)), 0) / myGrades.length).toFixed(2)
            : '0.00';

        const validatedModules = myGrades.filter(curr =>
            parseFloat(calculateAverage(curr.cc1, curr.cc2, curr.exam)) >= 10
        ).length;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-900 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Academic Performance</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Track your grades and academic progress</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Overall Average</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{overallAverage}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Modules Validated</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{validatedModules}/{myGrades.length}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Current GPA</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {calculateWeightedGPA(myGrades)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Academic Year</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{academicYear}</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-3">
                    <Select
                        label="Academic Year"
                        options={getAcademicYearOptions(5)}
                        value={academicYear}
                        onChange={(e) => {
                            setAcademicYear(e.target.value);
                            fetchMyGrades();
                        }}
                        className="w-40"
                    />
                </div>

                {/* Grades Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Control 1</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Control 2</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Average</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {myGrades.map((grade) => {
                                    const avg = parseFloat(calculateAverage(grade.cc1, grade.cc2, grade.exam));
                                    return (
                                        <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{grade.module_name}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">
                                                        {grade.module_code} • Coef: {grade.coefficient || '1.0'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-700">{grade.cc1 ?? '-'}</td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-700">{grade.cc2 ?? '-'}</td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-700">{grade.exam ?? '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "font-bold",
                                                    avg >= 10 ? "text-green-600" : "text-red-600"
                                                )}>
                                                    {avg.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge
                                                    variant={avg >= 10 ? 'success' : 'danger'}
                                                    className="text-xs"
                                                >
                                                    {avg >= 10 ? 'Validated' : 'Rattrapage'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {myGrades.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No grades recorded yet</p>
                                                <p className="text-sm text-gray-400 mt-1">Check back later for your results</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Professor/Admin View
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-900 rounded-lg">
                        <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Grade Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Record and manage student grades for continuous assessment and exams
                        </p>
                    </div>
                </div>

                {selectedClass && selectedModule && studentsGrades.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExportGrades}
                            icon={Download}
                            className="border-gray-200"
                        >
                            Export CSV
                        </Button>
                        <Button
                            onClick={handleSaveAll}
                            isLoading={saving}
                            icon={Save}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Save All Grades
                        </Button>
                    </div>
                )}
            </div>

            {/* Statistics Cards */}
            {selectedClass && selectedModule && studentsGrades.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Class Average</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{calculateClassAverage()}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pass Rate</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{getPassRate()}%</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{filteredStudents.length}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Highest Score</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {Math.max(...filteredStudents.map(sg =>
                                        parseFloat(calculateAverage(sg.cc1, sg.cc2, sg.exam)) || 0
                                    )).toFixed(2)}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <Award className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Class Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Class
                        </label>
                        <Select
                            placeholder="Select class"
                            options={classes.map(c => ({
                                value: c.id,
                                label: `${c.name} - ${c.level}`,
                                description: c.speciality_name
                            }))}
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        />
                    </div>

                    {/* Module Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            Module
                        </label>
                        <Select
                            placeholder="Select module"
                            disabled={!selectedClass}
                            options={modules
                                .filter(m => !selectedClass || m.speciality_id === selectedClassInfo?.speciality_id)
                                .map(m => ({
                                    value: m.id,
                                    label: `${m.code || ''} ${m.name}`,
                                    description: `Credits: ${m.credits || 'N/A'}`
                                }))}
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                        />
                    </div>

                    {/* Semester Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Semester
                        </label>
                        <Select
                            options={[
                                { value: '1', label: 'Semester 1' },
                                { value: '2', label: 'Semester 2' }
                            ]}
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        />
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Academic Year
                        </label>
                        <Select
                            options={getAcademicYearOptions(5, true)}
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                        />
                    </div>
                </div>

                {/* Search and Filter Bar */}
                {selectedClass && selectedModule && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or registration number..."
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                {filteredStudents.length} students
                            </span>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Clear search"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Module Info Card */}
            {selectedModuleInfo && selectedClassInfo && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-blue-900">{selectedModuleInfo.name}</h3>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                    {selectedModuleInfo.code || 'No Code'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-blue-700">
                                <span>Coefficient: {selectedModuleInfo.coefficient || '1.0'}</span>
                                <span>Credits: {selectedModuleInfo.credits || '3'}</span>
                                <span>Class: {selectedClassInfo.name} - {selectedClassInfo.level}</span>
                            </div>
                        </div>
                        <div className="text-xs text-blue-600">
                            Grading Scale: 0-20
                        </div>
                    </div>
                </div>
            )}

            {/* Grades Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                        <p className="text-sm text-gray-500 font-medium">Loading grades...</p>
                    </div>
                ) : selectedClass && selectedModule ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => {
                                                if (sortField === 'last_name') {
                                                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setSortField('last_name');
                                                    setSortDirection('asc');
                                                }
                                            }}
                                            className="flex items-center gap-1 hover:text-gray-700"
                                        >
                                            Student
                                            <ArrowUpDown size={12} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => {
                                                if (sortField === 'cc1') {
                                                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setSortField('cc1');
                                                    setSortDirection('desc');
                                                }
                                            }}
                                            className="flex items-center gap-1 mx-auto hover:text-gray-700"
                                        >
                                            Control 1 (20%)
                                            <ArrowUpDown size={12} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => {
                                                if (sortField === 'cc2') {
                                                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setSortField('cc2');
                                                    setSortDirection('desc');
                                                }
                                            }}
                                            className="flex items-center gap-1 mx-auto hover:text-gray-700"
                                        >
                                            Control 2 (20%)
                                            <ArrowUpDown size={12} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => {
                                                if (sortField === 'exam') {
                                                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setSortField('exam');
                                                    setSortDirection('desc');
                                                }
                                            }}
                                            className="flex items-center gap-1 mx-auto hover:text-gray-700"
                                        >
                                            Exam (60%)
                                            <ArrowUpDown size={12} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => {
                                                if (sortField === 'average') {
                                                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setSortField('average');
                                                    setSortDirection('desc');
                                                }
                                            }}
                                            className="flex items-center gap-1 mx-auto hover:text-gray-700"
                                        >
                                            Average
                                            <ArrowUpDown size={12} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map((sg) => {
                                    const avg = calculateAverage(sg.cc1, sg.cc2, sg.exam);
                                    const avgNum = parseFloat(avg);
                                    return (
                                        <tr key={sg.student_id || sg.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                                                        {sg.first_name?.[0]}{sg.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {sg.last_name} {sg.first_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {sg.registration_num}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <Input
                                                        type="number"
                                                        step="0.25"
                                                        min="0"
                                                        max="20"
                                                        className="w-20 text-center"
                                                        value={sg.cc1 ?? ''}
                                                        placeholder="-"
                                                        onChange={(e) => handleGradeChange(sg.student_id || sg.id, 'cc1', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <Input
                                                        type="number"
                                                        step="0.25"
                                                        min="0"
                                                        max="20"
                                                        className="w-20 text-center"
                                                        value={sg.cc2 ?? ''}
                                                        placeholder="-"
                                                        onChange={(e) => handleGradeChange(sg.student_id || sg.id, 'cc2', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <Input
                                                        type="number"
                                                        step="0.25"
                                                        min="0"
                                                        max="20"
                                                        className="w-20 text-center"
                                                        value={sg.exam ?? ''}
                                                        placeholder="-"
                                                        onChange={(e) => handleGradeChange(sg.student_id || sg.id, 'exam', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-semibold",
                                                    avgNum >= 10
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                )}>
                                                    {avg}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {avgNum >= 10 ? (
                                                    <div className="flex items-center justify-end gap-1 text-green-600 text-xs font-medium">
                                                        <CheckCircle2 size={14} />
                                                        Validated
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1 text-red-500 text-xs font-medium">
                                                        <AlertCircle size={14} />
                                                        Failed
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(sg);
                                                        setGradeModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="View details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                    <User className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No students found</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {searchQuery ? 'Try adjusting your search' : 'No students enrolled in this class'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Calculator className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Ready to record grades?</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                            Select a class and module from the filters above to load the student roster and start entering marks.
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Mobile */}
            <AnimatePresence>
                {selectedClass && selectedModule && studentsGrades.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        className="fixed bottom-6 right-6 lg:hidden"
                    >
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="bg-green-600 text-white p-4 rounded-full shadow-xl flex items-center gap-2 font-medium"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save All
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Student Grade Details Modal */}
            <Modal
                isOpen={isGradeModalOpen}
                onClose={() => setGradeModalOpen(false)}
                title="Student Grade Details"
                subtitle={`${selectedStudent?.last_name} ${selectedStudent?.first_name} • ${selectedStudent?.registration_num}`}
                size="sm"
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500">Control 1</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {selectedStudent.cc1 ?? '-'}/20
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500">Control 2</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {selectedStudent.cc2 ?? '-'}/20
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500">Exam</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {selectedStudent.exam ?? '-'}/20
                                </span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Final Average</span>
                                    <span className={cn(
                                        "text-xl font-bold",
                                        parseFloat(calculateAverage(selectedStudent.cc1, selectedStudent.cc2, selectedStudent.exam)) >= 10
                                            ? "text-green-600"
                                            : "text-red-600"
                                    )}>
                                        {calculateAverage(selectedStudent.cc1, selectedStudent.cc2, selectedStudent.exam)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setGradeModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// Helper function for weighted GPA calculation
const calculateWeightedGPA = (grades) => {
    if (!grades.length) return '0.00';

    let totalPoints = 0;
    let totalCoefficients = 0;

    grades.forEach(grade => {
        const avg = parseFloat(calculateAverage(grade.cc1, grade.cc2, grade.exam));
        const coefficient = parseFloat(grade.coefficient) || 1;

        if (!isNaN(avg)) {
            totalPoints += avg * coefficient;
            totalCoefficients += coefficient;
        }
    });

    return totalCoefficients > 0
        ? (totalPoints / totalCoefficients).toFixed(2)
        : '0.00';
};

// Helper function for average calculation
const calculateAverage = (cc1, cc2, exam) => {
    const v1 = parseFloat(cc1) || 0;
    const v2 = parseFloat(cc2) || 0;
    const vE = parseFloat(exam) || 0;

    const avg = ((v1 + v2) / 2) * 0.4 + vE * 0.6;
    return avg.toFixed(2);
};

export default GradesPage;