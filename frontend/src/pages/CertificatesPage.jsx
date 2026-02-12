import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    Plus, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Download, 
    Printer, 
    Search,
    Filter,
    MoreVertical,
    AlertCircle,
    RotateCcw,
    Eye,
    Users,
    Calendar,
    Award,
    ChevronRight,
    CheckCheck,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import certificateService from '../api/services/certificateService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { cn } from '../utils/cn';

const CertificatesPage = () => {
    const { user } = useAuth();
    const isStudent = user?.role_name === 'STUDENT';
    const isManager = ['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'].includes(user?.role_name);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(null);
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, requestId: null, remarks: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
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
    };

    const handleRequest = async () => {
        try {
            setProcessing(true);
            await certificateService.request('ENROLLMENT');
            toast.success('Certificate request submitted successfully');
            setRequestModalOpen(false);
            fetchRequests();
        } catch (err) {
            toast.error('Failed to submit request. Please try again.');
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
            setMenuOpen(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionModal.requestId) return;
        try {
            setProcessing(true);
            await certificateService.process(rejectionModal.requestId, { 
                status: 'REJECTED', 
                remarks: rejectionModal.remarks || 'Request rejected',
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
            setMenuOpen(null);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch = !searchQuery ||
            request.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.registration_num?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
    const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

    // Certificate Template Component
    const CertificateTemplate = ({ data }) => {
        if (!data) return null;
        
        const dateStr = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        return (
            <div className="bg-white p-10 max-w-4xl mx-auto" id="certificate-content">
                <div className="text-center mb-10">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-gray-900 rounded-full mx-auto flex items-center justify-center">
                            <Award className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">ENROLLMENT CERTIFICATE</h1>
                    <div className="w-24 h-1 bg-gray-900 mx-auto"></div>
                </div>

                <div className="flex justify-between mb-12">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Number</p>
                        <p className="text-lg font-bold text-gray-900 font-mono mt-1">{data.registration_num}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Issue</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{dateStr}</p>
                    </div>
                </div>

                <div className="space-y-6 text-gray-700 leading-relaxed mb-12">
                    <p className="text-base">
                        This is to certify that <span className="font-bold text-gray-900">{data.first_name} {data.last_name}</span>, 
                        holder of student ID <span className="font-mono font-bold text-gray-900">{data.registration_num}</span>,
                    </p>
                    
                    <p className="text-base">
                        is currently enrolled as a <span className="font-bold text-gray-900">{data.level} Student</span> in the 
                        Department of <span className="font-bold text-gray-900">{data.department_name}</span> at 
                        <span className="font-bold text-gray-900"> Université Privée de Fès</span>,
                    </p>

                    <p className="text-base">
                        for the academic year <span className="font-bold text-gray-900">{data.academic_year}</span>.
                    </p>

                    <p className="text-base italic text-gray-600">
                        This certificate is issued upon the student's request for administrative and official purposes.
                    </p>
                </div>

                <div className="mt-16 flex justify-between items-end">
                    <div className="text-center w-48">
                        <div className="border-t-2 border-gray-300 pt-2">
                            <p className="text-sm font-bold text-gray-900">Department Head</p>
                            <p className="text-xs text-gray-500 mt-1">{data.department_head_name || '_________________'}</p>
                        </div>
                    </div>
                    <div className="text-center w-48">
                        <div className="border-t-2 border-gray-300 pt-2">
                            <p className="text-sm font-bold text-gray-900">Registrar</p>
                            <p className="text-xs text-gray-500 mt-1">_________________</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <div className="inline-block px-4 py-1 bg-gray-100 rounded-full">
                        <p className="text-xs text-gray-600 font-mono tracking-wider">
                            VERIFICATION CODE: {data.id?.substring(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-wider border-t border-gray-200 pt-6">
                    Smart UPF • Academic Management System • This document is digitally verified
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl border border-gray-200">
                <RotateCcw className="w-8 h-8 text-gray-400 animate-spin mb-4" />
                <p className="text-sm text-gray-500 font-medium">Loading certificate requests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-900 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Certificates</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isStudent ? 'Request and track your enrollment certificates' : 'Manage certificate requests from students'}
                        </p>
                    </div>
                </div>

                {isStudent && (
                    <Button 
                        onClick={() => setRequestModalOpen(true)}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        Request Certificate
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Requests</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{requests.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{pendingCount}</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Approved</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{approvedCount}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Rejected</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{rejectedCount}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-600" />
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
                                placeholder={isStudent ? "Search by reference..." : "Search by student name or ID..."}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
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
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {!isStudent && (
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} />
                                            Student
                                        </div>
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificate Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Year</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredRequests.map((request, index) => (
                                    <motion.tr
                                        key={request.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.02 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        {!isStudent && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                                                        {request.first_name?.[0]}{request.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {request.first_name} {request.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {request.registration_num}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="text-xs">
                                                {request.type === 'ENROLLMENT' ? 'Enrollment Certificate' : request.type}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                {new Date(request.requested_at).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
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
                                            <p className="text-sm font-medium text-gray-900">{request.academic_year}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                getStatusColor(request.status)
                                            )}>
                                                {getStatusIcon(request.status)}
                                                {request.status}
                                            </div>
                                            {request.remarks && request.status === 'REJECTED' && (
                                                <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={request.remarks}>
                                                    Reason: {request.remarks}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {isManager && request.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectionModal({ 
                                                                isOpen: true, 
                                                                requestId: request.id, 
                                                                remarks: '' 
                                                            })}
                                                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setPreviewOpen(true);
                                                        }}
                                                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                                                        title="View Certificate"
                                                    >
                                                        <Eye size={16} />
                                                        <span className="text-xs">Preview</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No certificate requests found</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
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
                )}
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
                                <p className="text-sm font-medium text-blue-800 mb-1">Processing Time</p>
                                <p className="text-xs text-blue-700">
                                    Certificate requests are typically processed within 24-48 business hours. 
                                    You will receive a notification once your request is approved.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Certificate Type</label>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-900 rounded-lg">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Enrollment Certificate</p>
                                        <p className="text-xs text-gray-500">Official proof of current enrollment</p>
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
                            Submit Request
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
                        </label>
                        <textarea
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-h-[100px] resize-none"
                            placeholder="Please specify why this certificate request is being rejected..."
                            value={rejectionModal.remarks}
                            onChange={(e) => setRejectionModal(prev => ({ ...prev, remarks: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setRejectionModal({ isOpen: false, requestId: null, remarks: '' })}
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
                            Reject Request
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Certificate Preview Modal */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={() => setPreviewOpen(false)}
                title="Certificate Preview"
                subtitle="Review and print enrollment certificate"
                size="xl"
            >
                <div className="space-y-5">
                    <div id="printable-certificate" className="bg-white border border-gray-200 rounded-lg overflow-auto max-h-[70vh] p-6">
                        <CertificateTemplate data={selectedRequest} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 print:hidden">
                        <Button
                            variant="ghost"
                            onClick={() => setPreviewOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                            icon={Printer}
                            onClick={handlePrint}
                        >
                            Print Certificate
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-certificate, #printable-certificate * {
                        visibility: visible;
                    }
                    #printable-certificate {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        max-height: none !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        border: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 2cm;
                    }
                }
            `}} />
        </div>
    );
};

export default CertificatesPage;