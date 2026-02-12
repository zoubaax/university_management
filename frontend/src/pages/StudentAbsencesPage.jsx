import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Search,
    Filter,
    Clock,
    User,
    BookOpen,
    School,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import studentAttendanceService from '../api/services/studentAttendanceService';
import classService from '../api/services/classService';
import moduleService from '../api/services/moduleService';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const StudentAbsencesPage = () => {
    const { user } = useAuth();
    const isProfessor = user?.role_name === 'PROFESSOR';

    // Only fetch records for the logged-in professor
    const professorId = isProfessor ? user?.employee_id : null;

    const [loading, setLoading] = useState(false);
    const [absences, setAbsences] = useState([]);

    // Filters
    const [classes, setClasses] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [studentName, setStudentName] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchAbsences();
    }, [selectedClass, selectedModule, dateRange, studentName]);

    const fetchInitialData = async () => {
        try {
            const [classesData, modulesData] = await Promise.all([
                classService.getAll(),
                moduleService.getAll()
            ]);
            setClasses(classesData || []);
            setModules(modulesData || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load filter options');
        }
    };

    const fetchAbsences = async () => {
        try {
            setLoading(true);
            const filters = {
                classId: selectedClass,
                moduleId: selectedModule,
                startDate: dateRange.start,
                endDate: dateRange.end,
                studentName: studentName
            };

            // Clean empty filters
            Object.keys(filters).forEach(key => !filters[key] && delete filters[key]);

            const data = await studentAttendanceService.getAll(filters);
            setAbsences(data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PRESENT': return { color: 'success', icon: CheckCircle2, label: 'Present' };
            case 'ABSENT': return { color: 'danger', icon: XCircle, label: 'Absent' };
            case 'LATE': return { color: 'warning', icon: Clock, label: 'Late' };
            case 'JUSTIFIED': return { color: 'info', icon: AlertCircle, label: 'Justified' };
            default: return { color: 'secondary', icon: User, label: status };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Attendance History</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and filter student attendance records across all sessions.
                    </p>
                </div>
                <div>
                    <Button
                        variant="outline"
                        icon={Download}
                        onClick={() => window.print()}
                    >
                        Export / Print
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                    label="Class"
                    placeholder="All Classes"
                    options={classes.map(c => ({ value: c.id, label: c.name }))}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                />
                <Select
                    label="Module"
                    placeholder="All Modules"
                    options={modules.map(m => ({ value: m.id, label: `${m.code} - ${m.name}` }))}
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                />
                <Input
                    label="Student Name / ID"
                    placeholder="Search student..."
                    icon={Search}
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="date"
                        label="From"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <Input
                        type="date"
                        label="To"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p>Loading records...</p>
                    </div>
                ) : absences.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                        <Calendar className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium text-gray-500">No attendance records found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {absences.map((record) => {
                                    const statusConfig = getStatusConfig(record.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr key={`${record.id}-${record.student_id}`} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                        <Calendar size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {new Date(record.date).toLocaleDateString(undefined, {
                                                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {record.slot_type === 'MORNING' ? '8:30 - 12:00' : '14:30 - 18:00'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {record.first_name?.[0]}{record.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {record.first_name} {record.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {record.registration_num}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <School size={12} className="text-gray-400" />
                                                        <span className="text-sm text-gray-700">{record.class_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen size={12} className="text-gray-400" />
                                                        <span className="text-xs text-gray-500">{record.module_name} ({record.module_code})</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={statusConfig.color}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1"
                                                >
                                                    <StatusIcon size={12} />
                                                    {statusConfig.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.remarks ? (
                                                    <span className="text-sm text-gray-600 italic">"{record.remarks}"</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAbsencesPage;
