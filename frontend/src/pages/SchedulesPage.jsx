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
    Printer
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOTS = [
    {
        id: 'MORNING',
        label: 'Morning Session',
        time: '8:30 - 12:00',
        subSlots: [
            { time: '08:30 - 10:00', label: 'Lecture', color: 'bg-blue-500' },
            { time: '10:00 - 10:30', label: 'Break', color: 'bg-amber-400', isBreak: true },
            { time: '10:30 - 12:00', label: 'Lab', color: 'bg-blue-500' }
        ]
    },
    {
        id: 'AFTERNOON',
        label: 'Afternoon Session',
        time: '14:30 - 18:00',
        subSlots: [
            { time: '14:30 - 16:00', label: 'Lecture', color: 'bg-blue-500' },
            { time: '16:00 - 16:30', label: 'Break', color: 'bg-amber-400', isBreak: true },
            { time: '16:30 - 18:00', label: 'Tutorial', color: 'bg-blue-500' }
        ]
    }
];

const SchedulesPage = () => {
    const { user } = useAuth();
    const isManager = ['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'RH'].includes(user?.role_name);
    const isProfessor = user?.role_name === 'PROFESSOR';

    const [selectedClass, setSelectedClass] = useState(null);
    const [classes, setClasses] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedSpeciality, setSelectedSpeciality] = useState('all');
    const [classModules, setClassModules] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [formData, setFormData] = useState({
        module_id: '',
        professor_id: '',
        room: ''
    });
    const [viewMode, setViewMode] = useState(isProfessor ? 'personal' : 'class');
    const [professorSchedules, setProfessorSchedules] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [roomConflict, setRoomConflict] = useState(null);

    const {
        schedules,
        loading: schedulesLoading,
        upsertSchedule,
        deleteSchedule
    } = useSchedules(selectedClass);

    // Check for room conflicts when room is selected
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

                if (result.available) {
                    setRoomConflict({
                        hasConflict: false,
                        message: '✓ Room available for this time slot'
                    });
                } else {
                    setRoomConflict({
                        hasConflict: true,
                        message: `✗ Already reserved for "${result.conflict.class_name}"`
                    });
                }
            } catch (err) {
                console.error('Error checking room availability:', err);
                setRoomConflict(null);
            }
        };

        checkAvailability();
    }, [formData.room, selectedSlot, selectedClass]);

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

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (isProfessor && viewMode === 'personal' && user?.employee_id) {
            fetchProfessorSchedule();
        }
    }, [isProfessor, viewMode, user?.employee_id]);

    useEffect(() => {
        if (selectedClass) {
            fetchClassModules(selectedClass);
        }
    }, [selectedClass]);

    const fetchInitialData = async () => {
        try {
            setLoadingData(true);
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
            setLoadingData(false);
        }
    };

    const fetchProfessorSchedule = async () => {
        try {
            setLoadingData(true);
            const data = await scheduleService.getByProfessor(user.employee_id);
            setProfessorSchedules(data || []);
        } catch (err) {
            toast.error('Failed to load your personal schedule');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchClassModules = async (cid) => {
        try {
            setLoadingData(true);
            const data = await moduleService.getClassModules(cid);
            setClassModules(data || []);
        } catch (err) {
            toast.error('Failed to load modules for this class');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSlotClick = (day, slotType, existingSchedule) => {
        if (!isManager) return;

        setSelectedSlot({ day, slotType, existingId: existingSchedule?.id });
        setFormData({
            module_id: existingSchedule?.module_id || '',
            professor_id: existingSchedule?.professor_id || '',
            room: existingSchedule?.room || ''
        });
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
            toast.success('Schedule updated successfully');
        } catch (err) {
            toast.error('Failed to update schedule');
        }
    };

    const handleConfirmDelete = async () => {
        if (slotToDelete) {
            const success = await deleteSchedule(slotToDelete.id);
            if (success) {
                toast.success('Schedule cleared');
                setSlotToDelete(null);
            }
        }
    };

    const handleDeleteClick = (schedule) => {
        setSlotToDelete(schedule);
        setIsModalOpen(false);
    };

    const getScheduleForSlot = (day, slotType) => {
        const source = (isProfessor && viewMode === 'personal') ? professorSchedules : schedules;
        return source.find(s => s.day_of_week === day && s.slot_type === slotType);
    };

    const calculateWeeklyHours = () => {
        if (!schedules.length || !selectedClassInfo) return 0;
        const hoursPerSlot = {
            'MORNING': 3.5,
            'AFTERNOON': 3.5
        };
        return schedules.reduce((total, sched) => total + (hoursPerSlot[sched.slot_type] || 0), 0);
    };

    const handlePrint = () => {
        window.print();
    };

    // For professors, always show the "Class List View" which contains their Personal Schedule
    // This effectively hides the individual class schedule management for them
    if (!selectedClass || isProfessor) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Schedule Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isProfessor ? 'Viewing your personal academic teaching schedule' : 'Select a class to view or manage its weekly schedule'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isProfessor && (
                            <div className="w-full md:w-[300px]">
                                <Select
                                    placeholder="Filter by Speciality"
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
                    </div>
                </div>

                {isProfessor ? (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <h2 className="font-semibold text-gray-900">Personal Weekly Schedule</h2>
                            </div>
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                size="sm"
                                icon={Printer}
                                className="text-gray-600 border-gray-200 hover:bg-gray-100"
                            >
                                Print My Schedule
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-50 border-b border-r border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                                            Time / Day
                                        </th>
                                        {DAYS.map(day => (
                                            <th key={day} className="px-4 py-3 bg-gray-50 border-b border-r border-gray-200 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {SLOTS.map(slot => (
                                        <tr key={slot.id}>
                                            <td className="px-4 py-6 border-b border-r border-gray-200 bg-gray-50/30">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{slot.label}</span>
                                                    <span className="text-xs text-gray-500 flex items-center mt-1">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {slot.time}
                                                    </span>
                                                </div>
                                            </td>
                                            {DAYS.map(day => {
                                                const schedule = getScheduleForSlot(day, slot.id);
                                                return (
                                                    <td key={day} className="p-2 border-b border-r border-gray-200 min-w-[200px]">
                                                        {schedule ? (
                                                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 hover:bg-blue-100 transition-colors shadow-sm">
                                                                <div className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center justify-between">
                                                                    {!isProfessor && <span>{schedule.module_code}</span>}
                                                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-bold px-1.5 py-0">
                                                                        {schedule.room}
                                                                    </Badge>
                                                                </div>
                                                                <h4 className="text-sm font-bold text-blue-900 mb-1 leading-tight">
                                                                    {schedule.module_name}
                                                                </h4>
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="text-xs text-blue-700 flex items-center">
                                                                        <School className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                        <span className="font-semibold">{schedule.class_name}</span>
                                                                    </div>
                                                                    <div className="text-[10px] text-blue-500 italic">
                                                                        {schedule.speciality_name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-24 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                                                                <span className="text-xs text-gray-400 font-medium">No Class</span>
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
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredClasses.length > 0 ? (
                            filteredClasses.map(cls => (
                                <div
                                    key={cls.id}
                                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer hover:border-gray-300"
                                    onClick={() => setSelectedClass(cls.id)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <School className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {cls.academic_year}
                                        </Badge>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{cls.speciality_name}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                        <span className="text-xs font-medium text-gray-400">
                                            {cls.level}
                                        </span>
                                        <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                            {isManager ? 'Manage' : 'View Schedule'}
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-gray-900 font-medium">No classes found</h3>
                                <p className="text-gray-500 text-sm mt-1">Try adjusting your speciality filter</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Schedule Grid View
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
                        .print-header { display: block !important; }
                    }
                    .print-header { display: none; }
                `}
            </style>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedClass(null)}
                        className="p-2 hover:bg-white border border-transparent hover:border-gray-200"
                    >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedClassInfo?.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {selectedClassInfo?.speciality_name} • {selectedClassInfo?.level}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isManager && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hidden xl:flex">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Management Enabled
                        </Badge>
                    )}
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        icon={Printer}
                    >
                        Print PDF
                    </Button>
                </div>
            </div>

            {/* Print Header - Only visible when printing */}
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
                            <p className="text-sm text-gray-500">Total Weekly Hours</p>
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
                            <p className="text-sm text-gray-500">Scheduled Classes</p>
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
                            <p className="text-sm text-gray-500">Assigned Modules</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {[...new Set(schedules.map(s => s.module_id))].length}
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
                                {[...new Set(schedules.map(s => s.professor_id))].length}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <User className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-area">
                {/* Header */}
                <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200">
                    <div className="bg-gray-50 p-4 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    {DAYS.map(day => (
                        <div key={day} className="p-4 text-center">
                            <span className="text-sm font-semibold text-gray-700">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Loading State */}
                {(schedulesLoading || loadingData) && (
                    <div className="h-96 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Loading schedule...</p>
                    </div>
                )}

                {/* Time Slots */}
                {!schedulesLoading && !loadingData && SLOTS.map(slot => (
                    <div key={slot.id} className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200 last:border-0 hover:bg-gray-50/30 transition-colors">
                        {/* Time Slot Header */}
                        <div className="p-4 flex flex-col items-center justify-center bg-gray-50/30">
                            <div className="text-center mb-3">
                                <span className="text-sm font-semibold text-gray-900 block">{slot.label}</span>
                                <span className="text-xs text-gray-500 mt-0.5">{slot.time}</span>
                            </div>
                            <div className="space-y-1.5 w-full">
                                {slot.subSlots.map((ss, idx) => (
                                    <div key={idx} className={cn(
                                        "flex items-center gap-2 p-1.5 rounded text-xs",
                                        ss.isBreak ? "bg-amber-50 border border-amber-100" : "bg-gray-50 border border-gray-100"
                                    )}>
                                        <div className={`w-2 h-2 rounded-full ${ss.color}`} />
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-700">{ss.label}</span>
                                            <span className="text-gray-500 block text-[10px]">{ss.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Days Content */}
                        {DAYS.map(day => {
                            const schedule = getScheduleForSlot(day, slot.id);
                            return (
                                <div
                                    key={day}
                                    onClick={() => handleSlotClick(day, slot.id, schedule)}
                                    className={cn(
                                        "p-3 min-h-[180px] transition-all relative group",
                                        isManager && "cursor-pointer hover:bg-gray-50 hover:z-10",
                                        !schedule && "bg-gray-50/10"
                                    )}
                                >
                                    {schedule ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="h-full flex flex-col"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                {schedule.room && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin size={12} />
                                                        <span className="font-medium">{schedule.room}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 flex-1">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-0.5">
                                                        {schedule.module_name}
                                                    </h4>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <User size={12} className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-700">
                                                            {schedule.professor_first_name} {schedule.professor_last_name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {schedule.professor_email || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {isManager && (
                                                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(schedule);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete schedule"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center">
                                            {isManager ? (
                                                <>
                                                    <div className="p-3 bg-gray-100 rounded-full text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                                                        <Plus size={20} />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-400 mt-2">
                                                        Assign module
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-300 italic">Free slot</span>
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
            {!schedulesLoading && !loadingData && schedules.length === 0 && selectedClass && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center no-print">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No schedule configured</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        {isManager
                            ? 'Start building the schedule by clicking on any time slot'
                            : 'Schedule has not been configured for this class yet'
                        }
                    </p>
                </div>
            )}

            {/* Schedule Management Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Schedule Assignment"
                subtitle={`${selectedSlot?.day} • ${SLOTS.find(s => s.id === selectedSlot?.slotType)?.label}`}
                size="md"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
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
                            error={!formData.module_id ? 'Please select a module' : ''}
                        />

                        {formData.module_id && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            {classModules.find(m => m.module_id === formData.module_id)?.professor_first_name}{' '}
                                            {classModules.find(m => m.module_id === formData.module_id)?.professor_last_name}
                                        </p>
                                        <p className="text-xs text-blue-700 mt-0.5">
                                            Primary professor for this module
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Select
                                label="Room"
                                placeholder="Select a room"
                                leftIcon={<Building2 className="w-4 h-4 text-gray-400" />}
                                options={(() => {
                                    const cls = classes.find(c => c.id === selectedClass);
                                    if (!cls) return [];
                                    // Try to find department from speciality
                                    const spec = specialities.find(s => s.id === cls.speciality_id);
                                    const deptId = spec?.department_id;

                                    // If we can identify the department, filter rooms. Otherwise show all (or none).
                                    // As a fallback for Super Admins who might want to assign any room, maybe show all?
                                    // But user asked for department-specific rooms.
                                    const availableRooms = deptId
                                        ? rooms.filter(r => r.department_id === deptId)
                                        : rooms;

                                    return availableRooms.map(r => ({
                                        value: r.name, // Storing name as schema uses name string. Ideally should be ID.
                                        label: `${r.name} (${r.type})`,
                                        description: `Capacity: ${r.capacity}`
                                    }));
                                })()}
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                            />

                            {/* Room Availability Status */}
                            {formData.room && roomConflict && (
                                <div className={cn(
                                    "flex items-center gap-2 p-3 rounded-lg text-sm",
                                    roomConflict.hasConflict
                                        ? "bg-red-50 border border-red-200 text-red-700"
                                        : "bg-green-50 border border-green-200 text-green-700"
                                )}>
                                    {roomConflict.hasConflict ? (
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    )}
                                    <span className="font-medium">{roomConflict.message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!formData.module_id || roomConflict?.hasConflict}
                            className="flex-1 bg-gray-900 hover:bg-gray-800"
                        >
                            Save Assignment
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!slotToDelete}
                onClose={() => setSlotToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Clear Schedule Slot"
                message={`Are you sure you want to remove ${slotToDelete?.module_name} from the schedule? This action cannot be undone.`}
                confirmText="Clear Slot"
                variant="danger"
            />
        </div>
    );
};

export default SchedulesPage;