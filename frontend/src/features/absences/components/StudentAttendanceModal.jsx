import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Save,
    Search,
    Loader2
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import studentAttendanceService from '../../../api/services/studentAttendanceService';
import { cn } from '../../../utils/cn';

const StudentAttendanceModal = ({ isOpen, onClose, schedule, date }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen && schedule && date) {
            fetchAttendance();
        }
    }, [isOpen, schedule, date]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await studentAttendanceService.getSessionAttendance(schedule.id, date);
            setStudents(response.data.students || []);
        } catch (err) {
            toast.error('Failed to load students list');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const handleRemarksChange = (studentId, remarks) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, remarks } : s
        ));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const attendanceData = students.map(s => ({
                student_id: s.id,
                status: s.status,
                remarks: s.remarks
            }));

            await studentAttendanceService.recordSessionAttendance(schedule.id, date, attendanceData);
            toast.success('Attendance recorded successfully');
            onClose();
        } catch (err) {
            toast.error('Failed to save attendance');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registration_num.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        present: students.filter(s => s.status === 'PRESENT').length,
        absent: students.filter(s => s.status === 'ABSENT').length,
        late: students.filter(s => s.status === 'LATE').length,
        justified: students.filter(s => s.status === 'JUSTIFIED').length
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Mark Attendance"
            subtitle={`${schedule?.module_name} - ${schedule?.class_name} (${date})`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Stats & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                            <span className="text-sm font-bold text-gray-900">{students.length} Students</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 mx-1 hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs font-semibold text-gray-600">{stats.present} Present</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-xs font-semibold text-gray-600">{stats.absent} Absent</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find student..."
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Students List */}
                <div className="max-h-[50vh] overflow-y-auto border border-gray-100 rounded-xl">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading class list...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white shadow-sm z-10">
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                                                    {student.first_name[0]}{student.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{student.first_name} {student.last_name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase">{student.registration_num}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex p-0.5 bg-gray-100 rounded-lg w-fit">
                                                {[
                                                    { id: 'PRESENT', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-white' },
                                                    { id: 'ABSENT', icon: XCircle, color: 'text-red-600', bg: 'bg-white' },
                                                    { id: 'LATE', icon: Clock, color: 'text-amber-600', bg: 'bg-white' },
                                                    { id: 'JUSTIFIED', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-white' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleStatusChange(student.id, opt.id)}
                                                        className={cn(
                                                            "p-1.5 rounded-md transition-all",
                                                            student.status === opt.id
                                                                ? `${opt.bg} ${opt.color} shadow-sm`
                                                                : "text-gray-400 hover:text-gray-600"
                                                        )}
                                                        title={opt.id}
                                                    >
                                                        <opt.icon size={16} />
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-l border-gray-50">
                                            <input
                                                type="text"
                                                placeholder="Note..."
                                                className="w-full bg-transparent text-xs border-none focus:ring-0 p-0 text-gray-600 placeholder:text-gray-300 italic"
                                                value={student.remarks || ''}
                                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-[10px] text-gray-400 font-medium italic">
                        All changes are saved only when you click "Record Attendance"
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            isLoading={saving}
                            icon={Save}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Record Attendance
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default StudentAttendanceModal;
