import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    FileText,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    Loader2,
    Users,
    BookOpen,
    Filter,
    ArrowRight,
    School,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import classService from '../api/services/classService';
import studentAttendanceService from '../api/services/studentAttendanceService';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

const AttendanceReportPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const isDeptHead = ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'].includes(user?.role_name);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(location.state?.classId || '');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [weekOffset, setWeekOffset] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (location.state?.classId) {
            setSelectedClass(location.state.classId);
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedClass) {
            fetchReport();
        } else {
            setReportData([]);
        }
    }, [selectedClass, weekOffset]);

    const fetchClasses = async () => {
        try {
            const data = await classService.getAll();
            setClasses(data || []);
            // Auto-select first class if available
            if (data && data.length > 0 && !selectedClass && !location.state?.classId) {
                // setSelectedClass(data[0].id);
            }
        } catch (err) {
            toast.error('Failed to load classes');
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getWeekRange();
            const response = await studentAttendanceService.getClassWeeklyReport(selectedClass, startDate, endDate);
            setReportData(response.data || []);
        } catch (err) {
            toast.error('Failed to load attendance report');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getWeekRange = () => {
        const today = new Date();
        const currentDay = today.getDay();

        const monday = new Date(today);
        monday.setDate(today.getDate() + (1 - currentDay) + (weekOffset * 7));

        const saturday = new Date(today);
        saturday.setDate(today.getDate() + (6 - currentDay) + (weekOffset * 7));

        return {
            startDate: monday.toISOString().split('T')[0],
            endDate: saturday.toISOString().split('T')[0]
        };
    };

    const formatWeekDisplay = () => {
        const { startDate, endDate } = getWeekRange();
        const options = { month: 'short', day: 'numeric' };
        const start = new Date(startDate).toLocaleDateString(undefined, options);
        const end = new Date(endDate).toLocaleDateString(undefined, options);

        if (weekOffset === 0) return 'This Week';
        if (weekOffset === -1) return 'Last Week';
        if (weekOffset === 1) return 'Next Week';
        return `${start} - ${end}`;
    };

    const filteredReport = useMemo(() => {
        if (!searchQuery) return reportData;
        const q = searchQuery.toLowerCase();
        return reportData.filter(s =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
            s.registration_num.toLowerCase().includes(q)
        );
    }, [reportData, searchQuery]);

    // Extract unique modules from the report data for header
    const modules = useMemo(() => {
        const moduleSet = new Set();
        const moduleMap = {};

        reportData.forEach(student => {
            student.attendances.forEach(att => {
                if (!moduleMap[att.module_code]) {
                    moduleMap[att.module_code] = att.module_name;
                    moduleSet.add(att.module_code);
                }
            });
        });

        return Array.from(moduleSet).map(code => ({
            code,
            name: moduleMap[code]
        })).sort((a, b) => a.code.localeCompare(b.code));
    }, [reportData]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PRESENT': return <div className="w-2 h-2 rounded-full bg-green-500" title="Present" />;
            case 'ABSENT': return <div className="w-2 h-2 rounded-full bg-red-500" title="Absent" />;
            case 'LATE': return <div className="w-2 h-2 rounded-full bg-amber-500" title="Late" />;
            case 'JUSTIFIED': return <div className="w-2 h-2 rounded-full bg-blue-500" title="Justified" />;
            default: return null;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const selectedClassObj = classes.find(c => c.id === selectedClass);

    return (
        <div className="space-y-6">
            <style>
                {`
                    @media print {
                        @page { size: landscape; margin: 1cm; }
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none !important; }
                    }
                `}
            </style>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weekly Attendance Report</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review student absences across all modules for a specific class.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        icon={Download}
                        disabled={!selectedClass || reportData.length === 0}
                    >
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm no-print">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <Select
                            label="Class"
                            placeholder="Select a class"
                            options={classes.map(c => ({
                                value: c.id,
                                label: c.name,
                                description: c.speciality_name
                            }))}
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Select Week</label>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm">
                                <button
                                    onClick={() => setWeekOffset(prev => prev - 1)}
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold text-gray-900 flex-1 text-center whitespace-nowrap px-2">
                                    {formatWeekDisplay()}
                                </span>
                                <button
                                    onClick={() => setWeekOffset(prev => prev + 1)}
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Search Students</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Name or Reg #"
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        {weekOffset !== 0 && (
                            <Button
                                variant="outline"
                                className="w-full text-xs font-bold border-gray-100 hover:border-gray-200"
                                onClick={() => setWeekOffset(0)}
                            >
                                Back to Current Week
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Content */}
            {!selectedClass ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center">
                    <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">No Class Selected</h2>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                        Please select a class from your department to view the weekly attendance report.
                    </p>
                </div>
            ) : loading ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-20 text-center shadow-sm">
                    <Loader2 className="w-10 h-10 text-gray-900 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Generating class report...</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden print-area">
                    {/* Print Only Header */}
                    <div className="hidden print:block p-8 border-b border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">Attendance Report</h1>
                                <p className="text-sm font-bold text-blue-600 mt-1">{selectedClassObj?.name} • {selectedClassObj?.speciality_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase">Week Range</p>
                                <p className="text-sm font-bold text-gray-900">{formatWeekRangeText()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                        Student Info
                                    </th>
                                    {modules.map(mod => (
                                        <th key={mod.code} className="px-4 py-4 text-center border-l border-gray-100 min-w-[120px]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-blue-600 mb-0.5">{mod.code}</span>
                                                <span className="text-[11px] font-bold text-gray-800 line-clamp-1 truncate uppercase" title={mod.name}>
                                                    {mod.name}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-center border-l border-gray-100 bg-red-50/30">
                                        <span className="text-xs font-bold text-red-600 uppercase">Absences</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReport.map((student) => {
                                    const totalAbsences = student.attendances.filter(a => a.status === 'ABSENT').length;
                                    return (
                                        <tr key={student.student_id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-[10px]">
                                                        {student.first_name[0]}{student.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{student.first_name} {student.last_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase">{student.registration_num}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {modules.map(mod => {
                                                const studentModAttendances = student.attendances.filter(a => a.module_code === mod.code);
                                                return (
                                                    <td key={mod.code} className="px-4 py-4 border-l border-gray-50">
                                                        <div className="flex flex-wrap justify-center gap-1.5 min-h-[1.5rem] items-center">
                                                            {studentModAttendances.length > 0 ? (
                                                                studentModAttendances.map((att, idx) => (
                                                                    <div key={idx} className="flex flex-col items-center gap-0.5" title={`${att.date} - ${att.status}`}>
                                                                        {getStatusIcon(att.status)}
                                                                        <span className="text-[8px] text-gray-300 font-medium">
                                                                            {new Date(att.date).getDate()}/{new Date(att.date).getMonth() + 1}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-gray-200 italic">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="px-6 py-4 text-center border-l border-gray-100 bg-red-50/10">
                                                <Badge
                                                    variant={totalAbsences > 0 ? "danger" : "outline"}
                                                    className={cn("px-2.5 py-0.5 font-black text-xs", totalAbsences === 0 && "opacity-30")}
                                                >
                                                    {totalAbsences}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredReport.length === 0 && (
                        <div className="p-20 text-center">
                            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-gray-900 font-bold">No students found</h3>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or selecting a different week.</p>
                        </div>
                    )}

                    {/* Footer / Legend */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 no-print">
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legend:</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-[10px] font-semibold text-gray-600">Present</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-[10px] font-semibold text-gray-600">Absent</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-[10px] font-semibold text-gray-600">Late</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] font-semibold text-gray-600">Justified</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium italic">
                            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    function formatWeekRangeText() {
        const { startDate, endDate } = getWeekRange();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return `${new Date(startDate).toLocaleDateString(undefined, options)} - ${new Date(endDate).toLocaleDateString(undefined, options)}`;
    }
};

export default AttendanceReportPage;
