import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    Plus,
    Trash2,
    Clock,
    User,
    BookOpen,
    School,
    Download,
    Filter,
    ArrowRight,
    MapPin,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    Eye,
    FileText,
    Loader2,
    Building2,
    Bell,
    ChevronDown,
    Layers,
    Printer,
    Users,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Settings,
    Grid,
    List,
    RefreshCw,
    X,
    Edit2
} from 'lucide-react';
import classService from '../api/services/classService';
import moduleService from '../api/services/moduleService';
import specialityService from '../api/services/specialityService';
import roomService from '../api/services/roomService';
import scheduleService from '../api/services/scheduleService';
import { useSchedules } from '../features/schedules/hooks/useSchedules';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import StudentAttendanceModal from '../features/absences/components/StudentAttendanceModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOTS = [
    {
        id: 'MORNING',
        label: 'Morning Session',
        time: '8:30 - 12:00',
        hours: 3.5,
        subSlots: [
            { time: '08:30 - 10:00', label: 'Lecture', color: 'bg-blue-500' },
            { time: '10:00 - 10:30', label: 'Break', color: 'bg-amber-400', isBreak: true },
            { time: '10:30 - 12:00', label: 'Lab / Tutorial', color: 'bg-indigo-500' }
        ]
    },
    {
        id: 'AFTERNOON',
        label: 'Afternoon Session',
        time: '14:30 - 18:00',
        hours: 3.5,
        subSlots: [
            { time: '14:30 - 16:00', label: 'Lecture', color: 'bg-blue-500' },
            { time: '16:00 - 16:30', label: 'Break', color: 'bg-amber-400', isBreak: true },
            { time: '16:30 - 18:00', label: 'Tutorial', color: 'bg-indigo-500' }
        ]
    }
];

const SchedulesPage = () => {
    const { user } = useAuth();
    const isManager = ['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'RH'].includes(user?.role_name);
    const isProfessor = user?.role_name === 'PROFESSOR';

    // State management
    const [selectedClass, setSelectedClass] = useState(null);
    const [classes, setClasses] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedSpeciality, setSelectedSpeciality] = useState('all');
    const [classModules, setClassModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [slotToEdit, setSlotToEdit] = useState(null);
    const [formData, setFormData] = useState({
        module_id: '',
        professor_id: '',
        room: ''
    });
    const [viewMode, setViewMode] = useState(isProfessor ? 'personal' : 'class');
    const [professorSchedules, setProfessorSchedules] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [roomConflict, setRoomConflict] = useState(null);
    const [attendanceSlot, setAttendanceSlot] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [menuOpen, setMenuOpen] = useState(null);

    const {
        schedules,
        loading: schedulesLoading,
        upsertSchedule,
        deleteSchedule
    } = useSchedules(selectedClass);

    // Room availability check
    useEffect(() => {
        if (!formData.room || !selectedSlot) {
            setRoomConflict(null);
            return;
        }

        const checkAvailability = async () => {
            try {
                const result = await scheduleService.checkRoomAvailability(
                    formData.room,
                    selectedSlot.day,
                    selectedSlot.slotType,
                    selectedClass
                );

                setRoomConflict({
                    available: result.available,
                    message: result.available 
                        ? '✓ Room available for this time slot'
                        : `✗ Already reserved for "${result.conflict?.class_name || 'another class'}"`,
                    conflict: result.conflict
                });
            } catch (err) {
                console.error('Error checking room availability:', err);
                setRoomConflict(null);
            }
        };

        const debounce = setTimeout(checkAvailability, 300);
        return () => clearTimeout(debounce);
    }, [formData.room, selectedSlot, selectedClass]);

    // Filter classes based on speciality and professor
    const filteredClasses = useMemo(() => {
        let baseList = classes;
        
        if (isProfessor) {
            const professorClassIds = allModules
                .flatMap(m => m.assignments || [])
                .filter(a => a.professor_id === user?.employee_id)
                .map(a => a.class_id);
            baseList = classes.filter(c => professorClassIds.includes(c.id));
        }

        if (selectedSpeciality === 'all') return baseList;
        return baseList.filter(c => c.speciality_id === selectedSpeciality);
    }, [classes, selectedSpeciality, isProfessor, allModules, user?.employee_id]);

    const selectedClassInfo = classes.find(c => c.id === selectedClass);

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch professor schedule
    useEffect(() => {
        if (isProfessor && viewMode === 'personal' && user?.employee_id) {
            fetchProfessorSchedule();
        }
    }, [isProfessor, viewMode, user?.employee_id, weekOffset]);

    // Fetch class modules when class changes
    useEffect(() => {
        if (selectedClass) {
            fetchClassModules(selectedClass);
        }
    }, [selectedClass]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classesData, specialitiesData, roomsData, modulesData] = await Promise.all([
                classService.getAll(),
                specialityService.getAll(),
                roomService.getAll(),
                moduleService.getAll()
            ]);
            setClasses(classesData || []);
            setSpecialities(specialitiesData || []);
            setRooms(roomsData || []);
            setAllModules(modulesData || []);
        } catch (err) {
            toast.error('Failed to load academic data');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfessorSchedule = async () => {
        try {
            setLoading(true);
            const data = await scheduleService.getByProfessor(user.employee_id, weekOffset);
            setProfessorSchedules(data || []);
        } catch (err) {
            toast.error('Failed to load your personal schedule');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassModules = async (cid) => {
        try {
            setLoading(true);
            const data = await moduleService.getClassModules(cid);
            setClassModules(data || []);
        } catch (err) {
            toast.error('Failed to load modules for this class');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (day, slotType, existingSchedule) => {
        if (!isManager) return;

        if (existingSchedule) {
            setSlotToEdit(existingSchedule);
            setFormData({
                module_id: existingSchedule.module_id || '',
                professor_id: existingSchedule.professor_id || '',
                room: existingSchedule.room || ''
            });
        } else {
            setSlotToEdit(null);
            setFormData({
                module_id: '',
                professor_id: '',
                room: ''
            });
        }

        setSelectedSlot({ day, slotType, existingId: existingSchedule?.id });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await upsertSchedule({
                class_id: selectedClass,
                day_of_week: selectedSlot.day,
                slot_type: selectedSlot.slotType,
                ...formData
            });
            setIsModalOpen(false);
            setSlotToEdit(null);
            toast.success('Schedule updated successfully');
            
            if (isProfessor && viewMode === 'personal') {
                fetchProfessorSchedule();
            }
        } catch (err) {
            toast.error('Failed to update schedule');
        }
    };

    const handleConfirmDelete = async () => {
        if (slotToDelete) {
            const success = await deleteSchedule(slotToDelete.id);
            if (success) {
                toast.success('Schedule slot cleared');
                setSlotToDelete(null);
                
                if (isProfessor && viewMode === 'personal') {
                    fetchProfessorSchedule();
                }
            }
        }
    };

    const getScheduleForSlot = (day, slotType) => {
        const source = (isProfessor && viewMode === 'personal') ? professorSchedules : schedules;
        return source.find(s => s.day_of_week === day && s.slot_type === slotType);
    };

    const calculateWeeklyHours = () => {
        if (!schedules.length || !selectedClassInfo) return 0;
        return schedules.reduce((total, sched) => {
            const slot = SLOTS.find(s => s.id === sched.slot_type);
            return total + (slot?.hours || 0);
        }, 0);
    };

    const handlePrint = () => {
        window.print();
    };

    const getSessionDate = (dayName) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(dayName);
        const today = new Date();
        const currentDay = today.getDay();

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (targetDay - currentDay) + (weekOffset * 7));
        return targetDate.toISOString().split('T')[0];
    };

    const formatWeekRange = () => {
        const today = new Date();
        const currentDay = today.getDay();

        const monday = new Date(today);
        monday.setDate(today.getDate() + (1 - currentDay) + (weekOffset * 7));

        const saturday = new Date(today);
        saturday.setDate(today.getDate() + (6 - currentDay) + (weekOffset * 7));

        const options = { month: 'short', day: 'numeric' };
        return `${monday.toLocaleDateString(undefined, options)} - ${saturday.toLocaleDateString(undefined, options)}`;
    };

    const getRoomOptions = () => {
        const cls = classes.find(c => c.id === selectedClass);
        if (!cls) return [];

        const spec = specialities.find(s => s.id === cls.speciality_id);
        const deptId = spec?.department_id;

        const availableRooms = deptId
            ? rooms.filter(r => r.department_id === deptId)
            : rooms;

        return availableRooms.map(r => ({
            value: r.name,
            label: r.name,
            description: `${r.type} • Capacity: ${r.capacity}`
        }));
    };

    // Class selection view
    if (!selectedClass || isProfessor) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Scheduling</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-500">
                                {isProfessor 
                                    ? 'Manage your teaching schedule and track attendance' 
                                    : 'Select a class to view or configure its weekly timetable'}
                            </p>
                            {isProfessor && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                        <button
                                            onClick={() => setWeekOffset(prev => prev - 1)}
                                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
                                            title="Previous week"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-xs font-medium text-gray-900 min-w-[100px] text-center">
                                            {weekOffset === 0 ? 'This Week' : 
                                             weekOffset === 1 ? 'Next Week' : 
                                             weekOffset === -1 ? 'Last Week' : formatWeekRange()}
                                        </span>
                                        <button
                                            onClick={() => setWeekOffset(prev => prev + 1)}
                                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
                                            title="Next week"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                        {weekOffset !== 0 && (
                                            <button
                                                onClick={() => setWeekOffset(0)}
                                                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-blue-600 border-l border-gray-100 ml-1"
                                                title="Back to current week"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {!isProfessor && (
                            <div className="w-full md:w-64">
                                <Select
                                    placeholder="Filter by speciality"
                                    leftIcon={<Layers className="w-4 h-4 text-gray-400" />}
                                    options={[
                                        { value: 'all', label: 'All Specialities' },
                                        ...specialities.map(s => ({ value: s.id, label: s.name }))
                                    ]}
                                    value={selectedSpeciality}
                                    onChange={(e) => setSelectedSpeciality(e.target.value)}
                                />
                            </div>
                        )}
                        
                        {isProfessor && (
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                icon={Printer}
                                className="border-gray-200"
                            >
                                Print Schedule
                            </Button>
                        )}
                    </div>
                </div>

                {/* Professor Personal Schedule View */}
                {isProfessor ? (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Personal Teaching Schedule</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Week of {formatWeekRange()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {loading || schedulesLoading ? (
                            <div className="h-96 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                                <p className="text-sm text-gray-500">Loading your schedule...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 bg-gray-50 border-b border-r border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                                                Time / Day
                                            </th>
                                            {DAYS.map(day => (
                                                <th key={day} className="px-4 py-3 bg-gray-50 border-b border-r border-gray-200 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                                                    {day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {SLOTS.map(slot => (
                                            <tr key={slot.id}>
                                                <td className="px-4 py-4 border-b border-r border-gray-200 bg-gray-50/30">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">{slot.label}</span>
                                                        <span className="text-xs text-gray-500 flex items-center mt-1">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {slot.time}
                                                        </span>
                                                    </div>
                                                </td>
                                                {DAYS.map(day => {
                                                    const schedule = getScheduleForSlot(day, slot.id);
                                                    return (
                                                        <td key={day} className="p-3 border-b border-r border-gray-200 align-top">
                                                            {schedule ? (
                                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 hover:shadow-sm transition-all">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0.5">
                                                                            {schedule.room}
                                                                        </Badge>
                                                                        <span className="text-[10px] text-blue-500 font-medium">
                                                                            {schedule.class_name}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <h4 className="text-sm font-semibold text-blue-900 mb-2 line-clamp-2">
                                                                        {schedule.module_name}
                                                                    </h4>
                                                                    
                                                                    <div className="flex items-center gap-2 text-xs text-blue-700 mb-2">
                                                                        <School className="w-3 h-3" />
                                                                        <span className="truncate">{schedule.speciality_name}</span>
                                                                    </div>
                                                                    
                                                                    <button
                                                                        onClick={() => setAttendanceSlot(schedule)}
                                                                        className="mt-2 w-full py-1.5 bg-white border border-blue-200 text-blue-600 rounded-md text-[10px] font-medium hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1"
                                                                    >
                                                                        <Users size={12} />
                                                                        Mark Attendance
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="h-28 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                                                                    <span className="text-xs text-gray-400">No class</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Class Selection Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                                <p className="text-sm text-gray-500">Loading classes...</p>
                            </div>
                        ) : filteredClasses.length > 0 ? (
                            filteredClasses.map(cls => (
                                <motion.div
                                    key={cls.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => setSelectedClass(cls.id)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <School className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {cls.academic_year}
                                        </Badge>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{cls.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.speciality_name}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="text-xs font-medium text-gray-400">{cls.level}</span>
                                        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                            View Schedule
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-gray-900 font-medium">No classes found</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {selectedSpeciality !== 'all' 
                                        ? 'No classes in this speciality' 
                                        : 'Try adjusting your filters'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Attendance Modal */}
                <StudentAttendanceModal
                    isOpen={!!attendanceSlot}
                    onClose={() => setAttendanceSlot(null)}
                    schedule={attendanceSlot}
                    date={attendanceSlot ? getSessionDate(attendanceSlot.day_of_week) : null}
                />
            </div>
        );
    }

    // Schedule Grid View
    return (
        <div className="space-y-6">
            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        @page { size: landscape; margin: 1cm; }
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none !important; }
                        .print-header { display: block !important; }
                    }
                    .print-header { display: none; }
                `}
            </style>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedClass(null)}
                        className="p-2 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                        icon={ChevronLeft}
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedClassInfo?.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500">{selectedClassInfo?.speciality_name}</p>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500">{selectedClassInfo?.level}</p>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500">{selectedClassInfo?.academic_year}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isManager && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Settings className="w-3 h-3 mr-1" />
                            Management Mode
                        </Badge>
                    )}
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        icon={Printer}
                    >
                        Print Schedule
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            {selectedClassInfo && (
                <div className="print-header mb-8 text-center border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{selectedClassInfo.name}</h1>
                    <div className="flex justify-center gap-4 mt-2 text-gray-600">
                        <span>{selectedClassInfo.speciality_name}</span>
                        <span>•</span>
                        <span>{selectedClassInfo.academic_year}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Weekly Hours</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{calculateWeeklyHours().toFixed(1)}h</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Classes Scheduled</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{schedules.length}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Modules</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {new Set(schedules.map(s => s.module_id)).size}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Professors</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {new Set(schedules.map(s => s.professor_id)).size}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <User className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Timetable */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-area">
                {/* Grid Header */}
                <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200">
                    <div className="bg-gray-50 p-4 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    {DAYS.map(day => (
                        <div key={day} className="p-4 text-center bg-gray-50/50">
                            <span className="text-sm font-semibold text-gray-700">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Loading State */}
                {(schedulesLoading || loading) && (
                    <div className="h-96 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Loading schedule...</p>
                    </div>
                )}

                {/* Time Slots */}
                {!schedulesLoading && !loading && SLOTS.map(slot => (
                    <div key={slot.id} className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200 last:border-0">
                        {/* Time Slot Info */}
                        <div className="p-4 flex flex-col bg-gray-50/30">
                            <span className="text-sm font-semibold text-gray-900">{slot.label}</span>
                            <span className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {slot.time}
                            </span>
                            <div className="mt-3 space-y-1.5">
                                {slot.subSlots.map((ss, idx) => (
                                    <div key={idx} className={cn(
                                        "flex items-center gap-1.5 p-1.5 rounded text-[10px]",
                                        ss.isBreak ? "bg-amber-50 border border-amber-100" : "bg-gray-50 border border-gray-100"
                                    )}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${ss.color}`} />
                                        <span className="font-medium text-gray-700">{ss.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Day Cells */}
                        {DAYS.map(day => {
                            const schedule = getScheduleForSlot(day, slot.id);
                            return (
                                <div
                                    key={day}
                                    onClick={() => handleSlotClick(day, slot.id, schedule)}
                                    className={cn(
                                        "p-3 min-h-[220px] transition-all relative group",
                                        isManager && "cursor-pointer hover:bg-gray-50",
                                        !schedule && "bg-gray-50/10"
                                    )}
                                >
                                    {schedule ? (
                                        <div className="h-full flex flex-col">
                                            {/* Room Badge */}
                                            {schedule.room && (
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0.5">
                                                        {schedule.room}
                                                    </Badge>
                                                    
                                                    {isManager && (
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setMenuOpen(menuOpen === schedule.id ? null : schedule.id);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                            >
                                                                <MoreVertical size={14} />
                                                            </button>
                                                            
                                                            {menuOpen === schedule.id && (
                                                                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSlotClick(day, slot.id, schedule);
                                                                            setMenuOpen(null);
                                                                        }}
                                                                        className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                                                                    >
                                                                        <Edit2 size={12} />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSlotToDelete(schedule);
                                                                            setMenuOpen(null);
                                                                        }}
                                                                        className="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Module Info */}
                                            <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {schedule.module_name}
                                            </h4>

                                            {/* Professor Info */}
                                            <div className="flex items-start gap-2 mt-auto">
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User size={12} className="text-gray-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-gray-700 truncate">
                                                        {schedule.professor_first_name} {schedule.professor_last_name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 truncate">
                                                        {schedule.professor_email || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center">
                                            {isManager ? (
                                                <>
                                                    <div className="p-2.5 bg-gray-100 rounded-full text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                                                        <Plus size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-400 mt-2">
                                                        Assign module
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">Available</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!schedulesLoading && !loading && schedules.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center no-print">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No schedule configured</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        {isManager
                            ? 'Start building the schedule by clicking on any empty time slot'
                            : 'The schedule for this class has not been configured yet'
                        }
                    </p>
                </div>
            )}

            {/* Schedule Assignment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSlotToEdit(null);
                    setFormData({ module_id: '', professor_id: '', room: '' });
                }}
                title={slotToEdit ? 'Edit Schedule Assignment' : 'Schedule Assignment'}
                subtitle={`${selectedSlot?.day} • ${SLOTS.find(s => s.id === selectedSlot?.slotType)?.label}`}
                size="md"
            >
                <form onSubmit={handleSave} className="space-y-5">
                    <Select
                        label="Module"
                        placeholder="Select module"
                        leftIcon={<BookOpen className="w-4 h-4 text-gray-400" />}
                        options={classModules.map(m => ({
                            value: m.module_id,
                            label: `${m.module_code} - ${m.module_name}`,
                            description: `Credits: ${m.credits || 'N/A'} • Coefficient: ${m.coefficient || '1.0'}`
                        }))}
                        value={formData.module_id}
                        onChange={(e) => {
                            const mod = classModules.find(m => m.module_id === e.target.value);
                            setFormData({
                                ...formData,
                                module_id: e.target.value,
                                professor_id: mod?.professor_id || ''
                            });
                        }}
                        required
                    />

                    {formData.module_id && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white rounded-lg">
                                    <User className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-blue-900">
                                        {classModules.find(m => m.module_id === formData.module_id)?.professor_first_name}{' '}
                                        {classModules.find(m => m.module_id === formData.module_id)?.professor_last_name}
                                    </p>
                                    <p className="text-[10px] text-blue-700">
                                        Assigned professor for this module
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Select
                        label="Room"
                        placeholder="Select room"
                        leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
                        options={getRoomOptions()}
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        required
                    />

                    {/* Room Availability Status */}
                    {formData.room && roomConflict && (
                        <div className={cn(
                            "flex items-center gap-2 p-3 rounded-lg text-sm",
                            roomConflict.available
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-red-50 border border-red-200 text-red-700"
                        )}>
                            {roomConflict.available ? (
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="text-xs font-medium">{roomConflict.message}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setSlotToEdit(null);
                                setFormData({ module_id: '', professor_id: '', room: '' });
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!formData.module_id || !formData.room || roomConflict?.available === false}
                            className="flex-1 bg-gray-900 hover:bg-gray-800"
                        >
                            {slotToEdit ? 'Update Assignment' : 'Assign Schedule'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!slotToDelete}
                onClose={() => setSlotToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Remove Schedule Entry"
                message={`Are you sure you want to remove "${slotToDelete?.module_name}" from the schedule? This action cannot be undone.`}
                confirmText="Remove"
                variant="danger"
            />

            {/* Attendance Modal */}
            <StudentAttendanceModal
                isOpen={!!attendanceSlot}
                onClose={() => setAttendanceSlot(null)}
                schedule={attendanceSlot}
                date={attendanceSlot ? getSessionDate(attendanceSlot.day_of_week) : null}
            />
        </div>
    );
};

export default SchedulesPage;