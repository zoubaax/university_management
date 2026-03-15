import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Calendar,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    FileText,
    Download,
    Paperclip,
    ExternalLink
} from 'lucide-react';
import { useAbsences } from '../hooks/useAbsences';
import AbsenceForm from './AbsenceForm';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { getAssetUrl } from '../../../utils/assets';

// API_BASE_URL removed in favor of getAssetUrl utility

const AbsencePage = () => {
    const {
        absences,
        employees,
        loading,
        registerAbsence,
        updateAbsence,
        deleteAbsence,
        refresh
    } = useAbsences();

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(null);

    const filteredAbsences = useMemo(() => {
        if (!filterQuery) return absences;
        const s = filterQuery.toLowerCase();
        return absences.filter(a =>
            `${a.first_name} ${a.last_name}`.toLowerCase().includes(s) ||
            a.type.toLowerCase().includes(s) ||
            (a.department_name && a.department_name.toLowerCase().includes(s))
        );
    }, [absences, filterQuery]);

    const handleEdit = (record) => {
        // Format dates for input field (YYYY-MM-DD)
        const formattedRecord = {
            ...record,
            start_date: new Date(record.start_date).toISOString().split('T')[0],
            end_date: new Date(record.end_date).toISOString().split('T')[0],
        };
        setEditingRecord(formattedRecord);
        setModalOpen(true);
        setMenuOpen(null);
    };

    const handleDeleteClick = (record) => {
        setRecordToDelete(record);
        setMenuOpen(null);
    };

    const handleConfirmDelete = async () => {
        if (!recordToDelete) return;
        setIsDeleting(true);
        const success = await deleteAbsence(recordToDelete.id, `${recordToDelete.first_name} ${recordToDelete.last_name}`);
        setIsDeleting(false);
        if (success) setRecordToDelete(null);
    };

    const handleSubmit = async (data) => {
        let success;
        if (editingRecord) {
            success = await updateAbsence(editingRecord.id, data);
        } else {
            success = await registerAbsence(data);
        }

        if (success) {
            setModalOpen(false);
            setEditingRecord(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return { variant: 'success', icon: CheckCircle2 };
            case 'REJECTED': return { variant: 'danger', icon: XCircle };
            case 'JUSTIFIED': return { variant: 'primary', icon: AlertTriangle };
            case 'PENDING': return { variant: 'outline', icon: Clock };
            default: return { variant: 'outline', icon: Clock };
        }
    };

    const getTypeLabel = (type) => {
        return type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ');
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading absence records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employment Absences</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor and manage staff leave requests and attendance records</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="w-full lg:w-64 pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setEditingRecord(null);
                            setModalOpen(true);
                        }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap"
                    >
                        Record Absence
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Records', value: absences.length, color: 'blue' },
                    { label: 'Pending Review', value: absences.filter(a => a.status === 'PENDING').length, color: 'amber' },
                    { label: 'Sick Leave', value: absences.filter(a => a.type === 'SICK').length, color: 'red' },
                    { label: 'Vacations', value: absences.filter(a => a.type === 'VACATION').length, color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content List */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {filteredAbsences.map((record, index) => {
                                    const { variant, icon: StatusIcon } = getStatusStyles(record.status);
                                    return (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                        {record.first_name[0]}{record.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{record.first_name} {record.last_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                                            {record.employee_type} • {record.department_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {new Date(record.start_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        to {new Date(record.end_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {getTypeLabel(record.type)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <StatusIcon size={14} className={
                                                        record.status === 'APPROVED' ? 'text-green-500' :
                                                            record.status === 'REJECTED' ? 'text-red-500' :
                                                                record.status === 'PENDING' ? 'text-amber-500' : 'text-blue-500'
                                                    } />
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]" title={record.reason}>
                                                        {record.reason || <span className="italic opacity-50">No reason provided</span>}
                                                    </p>
                                                    {record.attachment_url && (
                                                        <a
                                                            href={getAssetUrl(record.attachment_url)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors w-fit bg-blue-50 px-2 py-0.5 rounded-md"
                                                        >
                                                            <Paperclip size={10} />
                                                            View Proof
                                                            <ExternalLink size={8} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(record)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(record)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredAbsences.length === 0 && (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-gray-900 font-bold">No absence records found</h3>
                            <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                                {filterQuery ? "Adjust your search to find what you're looking for." : "Start keeping track by recording your first employee absence."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Create/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingRecord(null);
                }}
                title={editingRecord ? 'Update Absence Record' : 'Record New Absence'}
                subtitle={editingRecord ? 'Modify existing attendance details' : 'Enter details for employee leave or absence'}
                size="md"
            >
                <AbsenceForm
                    isEditing={!!editingRecord}
                    initialValues={editingRecord}
                    employees={employees}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setModalOpen(false);
                        setEditingRecord(null);
                    }}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!recordToDelete}
                onClose={() => setRecordToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Absence Record"
                message={`Are you sure you want to remove the absence record for ${recordToDelete?.first_name} ${recordToDelete?.last_name}? This action cannot be undone.`}
                confirmText="Delete Record"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default AbsencePage;
