import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    Printer,
    Search,
    Filter,
    AlertCircle,
    RotateCcw,
    Eye,
    Users,
    Calendar,
    Award,
    CheckCheck,
    X,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import certificateService from '../api/services/certificateService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { cn } from '../utils/cn';

const CertificatesPage = () => {
    const { user } = useAuth();
    const isStudent = user?.role_name === 'STUDENT';
    const isManager = ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'].includes(user?.role_name);

    // State Management
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // UI State
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectionModal, setRejectionModal] = useState({ 
        isOpen: false, 
        requestId: null, 
        remarks: '' 
    });

    // Fetch data on mount
    useEffect(() => {
        fetchRequests();
    }, []);

    // API Calls
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const data = isStudent
                ? await certificateService.getMyRequests()
                : await certificateService.getDepartmentRequests();
            setRequests(data || []);
        } catch (err) {
            toast.error('Failed to load certificate requests');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [isStudent]);

    const handleRequest = async () => {
        try {
            setProcessing(true);
            await certificateService.request('ENROLLMENT');
            toast.success('Certificate request submitted successfully', {
                icon: '✅',
                duration: 4000
            });
            setRequestModalOpen(false);
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setProcessing(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            setProcessing(true);
            await certificateService.process(id, {
                status: 'APPROVED',
                remarks: 'Approved by department head',
                processed_by: user?.id,
                processed_at: new Date().toISOString()
            });
            toast.success('Certificate request approved');
            fetchRequests();
        } catch (err) {
            toast.error('Failed to approve request');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionModal.requestId) return;
        
        if (!rejectionModal.remarks.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            setProcessing(true);
            await certificateService.process(rejectionModal.requestId, {
                status: 'REJECTED',
                remarks: rejectionModal.remarks.trim(),
                processed_by: user?.id,
                processed_at: new Date().toISOString()
            });
            toast.success('Certificate request rejected');
            setRejectionModal({ isOpen: false, requestId: null, remarks: '' });
            fetchRequests();
        } catch (err) {
            toast.error('Failed to reject request');
        } finally {
            setProcessing(false);
        }
    };

    const loadCertificateData = async (id) => {
        try {
            setProcessing(true);
            const data = await certificateService.getDetails(id);
            setSelectedRequest(data);
            return data;
        } catch (err) {
            toast.error('Failed to load certificate details');
            return null;
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = async (id) => {
        const data = await loadCertificateData(id);
        if (data) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    };

    // Computed Values
    const filteredRequests = useMemo(() => {
        return requests.filter(request => {
            const matchesSearch = !searchQuery ||
                `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.registration_num?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.id?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchQuery, filterStatus]);

    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length
    }), [requests]);

    // Status Helpers
    const getStatusConfig = (status) => {
        const configs = {
            APPROVED: {
                icon: CheckCircle2,
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200',
                label: 'Approved'
            },
            REJECTED: {
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                label: 'Rejected'
            },
            PENDING: {
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                label: 'Pending'
            }
        };
        return configs[status] || configs.PENDING;
    };

    // Certificate Template Component
    const CertificateTemplate = ({ data }) => {
        if (!data) return null;

        const dateStr = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        return (
            <div className="bg-white max-w-4xl mx-auto" id="certificate-content">
                {/* University Seal */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mx-auto flex items-center justify-center shadow-lg">
                        <Award className="w-12 h-12 text-white" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3 tracking-wide">
                        ENROLLMENT CERTIFICATE
                    </h1>
                    <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-gray-900 to-transparent mx-auto" />
                </div>

                {/* Reference & Date */}
                <div className="flex justify-between mb-12">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Registration Number
                        </p>
                        <p className="text-lg font-bold text-gray-900 font-mono">
                            {data.registration_num}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Date of Issue
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                            {dateStr}
                        </p>
                    </div>
                </div>

                {/* Certificate Body */}
                <div className="space-y-6 text-gray-700 leading-relaxed mb-12">
                    <p className="text-base">
                        This is to certify that{' '}
                        <span className="font-bold text-gray-900 border-b-2 border-gray-300 pb-0.5">
                            {data.first_name} {data.last_name}
                        </span>
                        , holder of student ID{' '}
                        <span className="font-mono font-bold text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded">
                            {data.registration_num}
                        </span>,
                    </p>
                    
                    <p className="text-base">
                        is currently enrolled as a{' '}
                        <span className="font-bold text-gray-900">
                            {data.level} Student
                        </span>{' '}
                        in the Department of{' '}
                        <span className="font-bold text-gray-900">
                            {data.department_name}
                        </span>{' '}
                        at{' '}
                        <span className="font-bold text-gray-900">
                            Université Privée de Fès
                        </span>,
                    </p>

                    <p className="text-base">
                        for the academic year{' '}
                        <span className="font-bold text-gray-900">
                            {data.academic_year}
                        </span>.
                    </p>

                    <p className="text-base italic text-gray-600 leading-relaxed">
                        This certificate is issued upon the student's request for administrative 
                        and official purposes. It serves as proof of active enrollment.
                    </p>
                </div>

                {/* Signatures */}
                <div className="mt-16 flex justify-between items-end">
                    <div className="text-center w-64">
                        <div className="mb-4">
                            <p className="font-serif text-2xl text-gray-800 italic font-light">
                                {data.department_head_name || '_________________'}
                            </p>
                            <div className="w-32 h-px bg-gray-400 mx-auto mt-2" />
                        </div>
                        <div className="border-t-2 border-gray-300 pt-3">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Director of Department
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Official Signature
                            </p>
                        </div>
                    </div>
                    <div className="text-center w-64">
                        <div className="mb-4">
                            <p className="font-serif text-2xl text-gray-800 italic font-light">
                                _________________
                            </p>
                            <div className="w-32 h-px bg-gray-400 mx-auto mt-2" />
                        </div>
                        <div className="border-t-2 border-gray-300 pt-3">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Registrar Office
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Official Stamp
                            </p>
                        </div>
                    </div>
                </div>

                {/* Verification Code */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <Award className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-600 font-mono tracking-wider">
                            VERIFICATION CODE: {data.id?.substring(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center border-t border-gray-200 pt-6">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        Smart UPF • Academic Management System
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                        This document is digitally verified and does not require a physical signature
                    </p>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-gray-200">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-gray-900 rounded-full animate-spin" />
                </div>
                <p className="text-sm text-gray-600 font-medium mt-6">
                    Loading certificate requests...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Please wait while we fetch your data
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Academic Certificates
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isStudent 
                                ? 'Request and track your enrollment certificates' 
                                : 'Manage certificate requests from students'}
                        </p>
                    </div>
                </div>

                {isStudent && (
                    <Button
                        onClick={() => setRequestModalOpen(true)}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                        Request Certificate
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { 
                        label: 'Total Requests', 
                        value: stats.total, 
                        icon: FileText, 
                        color: 'bg-blue-50 text-blue-600',
                        bg: 'bg-blue-500'
                    },
                    { 
                        label: 'Pending', 
                        value: stats.pending, 
                        icon: Clock, 
                        color: 'bg-amber-50 text-amber-600',
                        bg: 'bg-amber-500'
                    },
                    { 
                        label: 'Approved', 
                        value: stats.approved, 
                        icon: CheckCheck, 
                        color: 'bg-green-50 text-green-600',
                        bg: 'bg-green-500'
                    },
                    { 
                        label: 'Rejected', 
                        value: stats.rejected, 
                        icon: XCircle, 
                        color: 'bg-red-50 text-red-600',
                        bg: 'bg-red-500'
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={cn("p-3 rounded-lg", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={isStudent 
                                ? "Search by reference number..." 
                                : "Search by student name or ID..."}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Filter size={16} />
                            <span>Status:</span>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 pr-8 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white appearance-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1rem'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {!isStudent && (
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <Users size={14} />
                                            Student
                                        </div>
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Certificate Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Request Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Academic Year
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode="popLayout">
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((request, index) => {
                                        const statusConfig = getStatusConfig(request.status);
                                        const StatusIcon = statusConfig.icon;
                                        
                                        return (
                                            <motion.tr
                                                key={request.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                {!isStudent && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                                {request.first_name?.[0]}{request.last_name?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {request.first_name} {request.last_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                                                                    {request.registration_num}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="text-xs">
                                                        {request.type === 'ENROLLMENT' 
                                                            ? 'Enrollment Certificate' 
                                                            : request.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">
                                                        {new Date(request.requested_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(request.requested_at).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {request.academic_year}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                            statusConfig.bg,
                                                            statusConfig.color,
                                                            `border ${statusConfig.border}`
                                                        )}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {statusConfig.label}
                                                        </div>
                                                        {request.remarks && request.status === 'REJECTED' && (
                                                            <p className="text-xs text-gray-500 max-w-[200px] truncate" 
                                                               title={request.remarks}>
                                                                Reason: {request.remarks}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {isManager && request.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(request.id)}
                                                                    disabled={processing}
                                                                    className={cn(
                                                                        "p-2 rounded-lg transition-all",
                                                                        "text-green-600 hover:text-white",
                                                                        "hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed",
                                                                        "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                                    )}
                                                                    title="Approve Request"
                                                                >
                                                                    <CheckCircle2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setRejectionModal({
                                                                        isOpen: true,
                                                                        requestId: request.id,
                                                                        remarks: ''
                                                                    })}
                                                                    disabled={processing}
                                                                    className={cn(
                                                                        "p-2 rounded-lg transition-all",
                                                                        "text-red-600 hover:text-white",
                                                                        "hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed",
                                                                        "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                                    )}
                                                                    title="Reject Request"
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {request.status === 'APPROVED' && (
                                                            <button
                                                                onClick={() => handlePrint(request.id)}
                                                                disabled={processing}
                                                                className={cn(
                                                                    "p-2 rounded-lg transition-all",
                                                                    "text-blue-600 hover:text-white",
                                                                    "hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed",
                                                                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                                )}
                                                                title="Print Certificate"
                                                            >
                                                                <Printer size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td 
                                            colSpan={isStudent ? 6 : 6} 
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    No certificate requests found
                                                </h3>
                                                <p className="text-sm text-gray-500 max-w-md mb-6">
                                                    {searchQuery || filterStatus !== 'all'
                                                        ? 'Try adjusting your search filters'
                                                        : isStudent
                                                            ? "You haven't requested any certificates yet."
                                                            : "There are no certificate requests pending for your department."}
                                                </p>
                                                {isStudent && !searchQuery && filterStatus === 'all' && (
                                                    <Button
                                                        onClick={() => setRequestModalOpen(true)}
                                                        icon={Plus}
                                                        className="bg-gray-900 hover:bg-gray-800 text-white"
                                                    >
                                                        Request Certificate
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Certificate Modal */}
            <Modal
                isOpen={isRequestModalOpen}
                onClose={() => setRequestModalOpen(false)}
                title="Request Certificate"
                subtitle="Submit a new certificate request"
                size="sm"
            >
                <div className="space-y-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-blue-800 mb-1">
                                    Processing Time
                                </p>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Certificate requests are typically processed within 24-48 business hours. 
                                    You will receive a notification once your request is approved.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Certificate Type
                        </label>
                        <div className="border-2 border-gray-900 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-900 rounded-lg">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Enrollment Certificate
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Official proof of current academic enrollment
                                        </p>
                                    </div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setRequestModalOpen(false)}
                            className="flex-1"
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequest}
                            isLoading={processing}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={rejectionModal.isOpen}
                onClose={() => setRejectionModal({ isOpen: false, requestId: null, remarks: '' })}
                title="Reject Certificate Request"
                subtitle="Provide a reason for rejection"
                size="sm"
            >
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            Reason for Rejection
                            <span className="text-xs text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-h-[120px] resize-none"
                            placeholder="Please specify why this certificate request is being rejected..."
                            value={rejectionModal.remarks}
                            onChange={(e) => setRejectionModal(prev => ({ 
                                ...prev, 
                                remarks: e.target.value 
                            }))}
                        />
                        <p className="text-xs text-gray-500">
                            This reason will be visible to the student
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setRejectionModal({ 
                                isOpen: false, 
                                requestId: null, 
                                remarks: '' 
                            })}
                            className="flex-1"
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            isLoading={processing}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {processing ? 'Rejecting...' : 'Reject Request'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Hidden Printable Certificate */}
            <div className="hidden print:block">
                <div id="printable-certificate">
                    <CertificateTemplate data={selectedRequest} />
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');

                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        
                        #printable-certificate,
                        #printable-certificate * {
                            visibility: visible !important;
                        }

                        #printable-certificate {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            height: 100% !important;
                            margin: 0 !important;
                            padding: 1.5cm !important;
                            background: white !important;
                            z-index: 9999;
                            border: none !important;
                            box-shadow: none !important;
                        }

                        /* Ensure text is crisp and dark */
                        .text-gray-500, .text-gray-600, .text-gray-700, .text-gray-900 {
                            color: #000000 !important;
                        }

                        .bg-gray-50, .bg-gray-100 {
                            background: white !important;
                        }

                        @page {
                            size: A4;
                            margin: 0;
                        }
                    }
                `
            }} />
        </div>
    );
};

export default CertificatesPage;