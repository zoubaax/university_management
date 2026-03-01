import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    CreditCard,
    Users,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Plus,
    Search,
    Filter,
    DollarSign,
    Building2,
    FileCheck,
    Check,
    ChevronDown,
    X,
    MoreVertical,
    Loader2,
    Calendar,
    Award,
    Clock,
    ChevronRight,
    FileText,
    Percent,
    Banknote,
    Receipt,
    Mail
} from 'lucide-react';
import financeService from '../api/services/financeService';
import departmentService from '../api/services/departmentService';
import specialityService from '../api/services/specialityService';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

const FinancePage = ({ defaultTab = 'students' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isFinanceAdmin = ['SUPER_ADMIN', 'FINANCIER'].includes(user?.role_name);
    const isManager = ['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'].includes(user?.role_name);

    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [partnerships, setPartnerships] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [menuOpen, setMenuOpen] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPartner, setSelectedPartner] = useState('all');

    // Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedPriceItem, setSelectedPriceItem] = useState(null);
    const [paymentToVerify, setPaymentToVerify] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

    // New Payment Form state
    const [paymentForm, setPaymentForm] = useState({
        student_id: '',
        amount: '',
        payment_method: 'CASH',
        check_number: '',
        bank_name: '',
        notes: ''
    });

    // Profile Form state
    const [profileForm, setProfileForm] = useState({
        payment_plan: 'MONTHLY',
        partnership_id: ''
    });

    const [priceForm, setPriceForm] = useState({
        yearly_price: ''
    });

    const [partnerForm, setPartnerForm] = useState({
        company_name: '',
        discount_percentage: '20',
        contact_info: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, studentsData, paymentsData, partnersData, deptsData, specsData] = await Promise.all([
                financeService.getStats(),
                financeService.getStudents(),
                financeService.getPayments(),
                financeService.getPartnerships(),
                departmentService.getAll(),
                specialityService.getAll()
            ]);
            setStats(statsData);
            setStudents(studentsData.data || []);
            setPayments(paymentsData || []);
            setPartnerships(partnersData || []);
            setDepartments(deptsData || []);
            setSpecialities(specsData || []);
        } catch (err) {
            toast.error('Failed to load finance data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        try {
            if (selectedPriceItem.type === 'department') {
                await departmentService.update(selectedPriceItem.id, {
                    yearly_price: priceForm.yearly_price
                });
            } else {
                await specialityService.update(selectedPriceItem.id, {
                    yearly_price: priceForm.yearly_price
                });
            }
            toast.success('Price updated and students synced');
            setIsPriceModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to update price');
        }
    };

    const handleVerifyPayment = async () => {
        if (!paymentToVerify) return;
        setIsVerifying(true);
        try {
            await financeService.verifyPayment(paymentToVerify.id);
            toast.success('Payment verified successfully');
            setPaymentToVerify(null);
            fetchData();
        } catch (err) {
            toast.error('Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            await financeService.createPayment(paymentForm);
            toast.success('Payment recorded successfully');
            setIsPaymentModalOpen(false);
            setPaymentForm({
                student_id: '',
                amount: '',
                payment_method: 'CASH',
                check_number: '',
                bank_name: '',
                notes: ''
            });
            fetchData();
        } catch (err) {
            toast.error('Failed to record payment');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await financeService.updateStudentProfile(selectedStudent.student_id, profileForm);

            // Helpful toast for three parts plan
            if (profileForm.payment_plan === 'THREE_PARTS') {
                toast.success('Plan set: 3 parts (Sep, Jan, Apr)');
            } else {
                toast.success('Finance profile updated');
            }

            setIsProfileModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    const handleCreatePartner = async (e) => {
        e.preventDefault();
        try {
            await financeService.createPartnership(partnerForm);
            toast.success('New partner registered');
            setIsPartnerModalOpen(false);
            setPartnerForm({ company_name: '', discount_percentage: '20', contact_info: '' });
            fetchData();
        } catch (err) {
            toast.error('Failed to add partner');
        }
    };

    const openProfileModal = (student) => {
        setSelectedStudent(student);
        setProfileForm({
            payment_plan: student.payment_plan || 'MONTHLY',
            partnership_id: student.partnership_id || ''
        });
        setIsProfileModalOpen(true);
    };

    const openPaymentModal = (student = null) => {
        let suggestedAmount = '';
        if (student) {
            const total = parseFloat(student.total_amount_due) || 0;
            const remaining = parseFloat(student.remaining_balance) || 0;
            if (student.payment_plan === 'THREE_PARTS') {
                suggestedAmount = (total / 3).toFixed(2);
            } else if (student.payment_plan === 'MONTHLY') {
                suggestedAmount = (total / 10).toFixed(2);
            } else {
                suggestedAmount = remaining.toFixed(2);
            }
            if (parseFloat(suggestedAmount) > remaining) {
                suggestedAmount = remaining.toFixed(2);
            }
        } else {
            // If opening fresh, clear any remnants 
            suggestedAmount = '';
        }

        setPaymentForm({
            student_id: student?.student_id || '',
            amount: suggestedAmount,
            payment_method: 'CASH',
            check_number: '',
            bank_name: '',
            notes: ''
        });
        setIsPaymentModalOpen(true);
    };

    const getPartnerships = () => {
        const partnersMap = new Map();
        students.forEach(student => {
            if (student.partnership_id && student.partnership_name) {
                partnersMap.set(student.partnership_id, {
                    id: student.partnership_id,
                    name: student.partnership_name
                });
            }
        });
        return Array.from(partnersMap.values());
    };

    const uniquePartners = getPartnerships();

    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchQuery ||
            student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.speciality_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'paid' && student.is_fully_paid) ||
            (selectedStatus === 'pending' && !student.is_fully_paid);

        const matchesPartner = selectedPartner === 'all' || student.partnership_id === selectedPartner;

        return matchesSearch && matchesStatus && matchesPartner;
    });

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = !searchQuery ||
            payment.student_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.student_last_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus.toUpperCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'VERIFIED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getBalanceColor = (balance) => {
        const num = parseFloat(balance) || 0;
        if (num <= 0) return 'text-green-600';
        if (num < 1000) return 'text-amber-600';
        return 'text-red-600';
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'CASH':
                return <Banknote className="w-4 h-4 text-green-600" />;
            case 'CHECK':
                return <FileCheck className="w-4 h-4 text-blue-600" />;
            case 'BANK_TRANSFER':
                return <Building2 className="w-4 h-4 text-purple-600" />;
            default:
                return <DollarSign className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage tuition, corporate partnerships, and payment status</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {isFinanceAdmin && (
                        <>
                            <Button
                                onClick={() => setIsPartnerModalOpen(true)}
                                icon={Building2}
                                variant="outline"
                            >
                                Add Partner
                            </Button>
                            {defaultTab !== 'pricing' && (
                                <>
                                    <Button
                                        onClick={() => setIsFilterModalOpen(true)}
                                        icon={Filter}
                                        variant="outline"
                                        className="order-2 sm:order-1"
                                    >
                                        Filters
                                    </Button>
                                    <Button
                                        onClick={() => openPaymentModal()}
                                        icon={Plus}
                                        className="bg-gray-900 hover:bg-gray-800 text-white order-1 sm:order-2"
                                    >
                                        New Payment
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            {defaultTab !== 'pricing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Expected</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {stats?.total_expected?.toLocaleString() || '0'} MAD
                                </p>
                                <p className="text-xs text-gray-400 mt-1">+12% from last month</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Collected Revenue</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {stats?.total_collected?.toLocaleString() || '0'} MAD
                                </p>
                                <p className="text-xs text-gray-400 mt-1">82% collection rate</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Outstanding Debt</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {stats?.total_outstanding?.toLocaleString() || '0'} MAD
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{stats?.students_with_debt || 0} students pending</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active Partnerships</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {partnerships?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">3 new companies added</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <Building2 className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px space-x-8">
                    {defaultTab !== 'pricing' && (
                        <>
                            <button
                                onClick={() => setActiveTab('students')}
                                className={cn(
                                    "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                    activeTab === 'students'
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                Students & Balances
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={cn(
                                    "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                    activeTab === 'payments'
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                Recent Payments
                            </button>
                        </>
                    )}
                    {isFinanceAdmin && (
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={cn(
                                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                activeTab === 'pricing'
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            Program Pricing
                        </button>
                    )}
                </nav>
            </div>

            {/* Search Bar (for Students & Payments tabs) */}
            {(activeTab === 'students' || activeTab === 'payments') && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab === 'students' ? 'students by name, email, or program' : 'payments by student name...'}`}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        {activeTab === 'students' && (
                            <div className="flex items-center gap-3">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <select
                                    value={selectedPartner}
                                    onChange={(e) => setSelectedPartner(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                >
                                    <option value="all">All Partners</option>
                                    {uniquePartners.map(partner => (
                                        <option key={partner.id} value={partner.id}>{partner.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {activeTab === 'payments' && (
                            <div className="flex items-center gap-3">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading financial data...</p>
                </div>
            ) : (
                <>
                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Partner</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Due</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Balance</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {filteredStudents.map((student, index) => (
                                                <motion.tr
                                                    key={student.student_id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {student.first_name} {student.last_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {student.speciality_name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge className="text-xs bg-gray-100 text-gray-700">
                                                            {student.payment_plan?.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.partnership_name ? (
                                                            <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                                                                {student.partnership_name}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                                                        {parseFloat(student.total_amount_due).toLocaleString()} MAD
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`font-mono font-semibold ${getBalanceColor(student.remaining_balance)}`}>
                                                            {parseFloat(student.remaining_balance).toLocaleString()} MAD
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.is_fully_paid ? (
                                                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                                                <CheckCircle2 size={12} className="inline mr-1" />
                                                                Paid
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                                                                <AlertCircle size={12} className="inline mr-1" />
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {isFinanceAdmin && (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => openPaymentModal(student)}
                                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                                    title="Record payment"
                                                                >
                                                                    <Receipt size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => openProfileModal(student)}
                                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                    title="Edit finance profile"
                                                                >
                                                                    <CreditCard size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate('/messages')}
                                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                    title="Message student"
                                                                >
                                                                    <Mail size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {filteredStudents.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                        {searchQuery || selectedStatus !== 'all' || selectedPartner !== 'all'
                                            ? 'Try adjusting your search filters'
                                            : 'No students with finance records available'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {filteredPayments.map((payment, index) => (
                                                <motion.tr
                                                    key={payment.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {payment.student_first_name} {payment.student_last_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {getPaymentMethodIcon(payment.payment_method)}
                                                            <span className="text-sm text-gray-700">{payment.payment_method}</span>
                                                        </div>
                                                        {payment.check_number && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Check #{payment.check_number}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-semibold text-gray-900">
                                                        {parseFloat(payment.amount).toLocaleString()} MAD
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge className={`text-xs ${getStatusColor(payment.status)}`}>
                                                            {payment.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {payment.status === 'PENDING' && isFinanceAdmin && (
                                                            <Button
                                                                onClick={() => setPaymentToVerify(payment)}
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                                            >
                                                                Verify
                                                            </Button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {filteredPayments.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <Receipt className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                        {searchQuery || selectedStatus !== 'all'
                                            ? 'Try adjusting your search filters'
                                            : 'No payment records available'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* New Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Record New Payment"
                subtitle="Accept cash, checks, or verify bank transfers"
                size="md"
            >
                <form onSubmit={handleCreatePayment} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Select Student</label>
                        <select
                            required
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                            value={paymentForm.student_id}
                            onChange={(e) => {
                                const studentId = e.target.value;
                                const student = students.find(s => s.student_id === studentId);
                                let suggestedAmount = '';

                                if (student) {
                                    const total = parseFloat(student.total_amount_due) || 0;
                                    const remaining = parseFloat(student.remaining_balance) || 0;

                                    if (student.payment_plan === 'THREE_PARTS') {
                                        suggestedAmount = (total / 3).toFixed(2);
                                    } else if (student.payment_plan === 'MONTHLY') {
                                        suggestedAmount = (total / 10).toFixed(2);
                                    } else {
                                        suggestedAmount = Math.max(0, remaining).toFixed(2);
                                    }

                                    // Cap at remaining balance and prevent negatives
                                    if (parseFloat(suggestedAmount) > remaining) {
                                        suggestedAmount = Math.max(0, remaining).toFixed(2);
                                    }
                                }

                                setPaymentForm({
                                    ...paymentForm,
                                    student_id: studentId,
                                    amount: suggestedAmount
                                });
                            }}
                        >
                            <option value="">Choose a student...</option>
                            {students.map(s => (
                                <option key={s.student_id} value={s.student_id}>
                                    {s.first_name} {s.last_name} ({s.speciality_name})
                                </option>
                            ))}
                        </select>

                        {paymentForm.student_id && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Financial Status</p>
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500">Total Due</p>
                                            <p className="text-xs font-bold text-gray-900">
                                                {parseFloat(students.find(s => s.student_id === paymentForm.student_id)?.total_amount_due || 0).toLocaleString()} MAD
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500">Paid</p>
                                            <p className="text-xs font-bold text-green-600">
                                                {(parseFloat(students.find(s => s.student_id === paymentForm.student_id)?.total_amount_due || 0) -
                                                    parseFloat(students.find(s => s.student_id === paymentForm.student_id)?.remaining_balance || 0)).toLocaleString()} MAD
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500">Remaining</p>
                                            <p className={`text-xs font-bold ${getBalanceColor(students.find(s => s.student_id === paymentForm.student_id)?.remaining_balance)}`}>
                                                {parseFloat(students.find(s => s.student_id === paymentForm.student_id)?.remaining_balance || 0).toLocaleString()} MAD
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-[10px] h-auto p-0 font-bold"
                                    onClick={() => {
                                        const s = students.find(s => s.student_id === paymentForm.student_id);
                                        if (s) setPaymentForm({ ...paymentForm, amount: Math.max(0, parseFloat(s.remaining_balance)).toFixed(2) });
                                    }}
                                >
                                    Pay Balance
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Amount (MAD)</label>
                            <input
                                type="number"
                                required
                                min="0.00"
                                step="0.01"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none font-bold text-gray-900"
                                placeholder="0.00"
                            />
                            {paymentForm.student_id && (
                                <p className="text-[8px] text-gray-400 italic">
                                    Suggested installment based on {students.find(s => s.student_id === paymentForm.student_id)?.payment_plan?.replace('_', ' ')} plan.
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Method</label>
                            <select
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={paymentForm.payment_method}
                                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                            >
                                <option value="CASH">Cash</option>
                                <option value="CHECK">Check</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    {paymentForm.payment_method === 'CHECK' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 gap-4 overflow-hidden"
                        >
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Check Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                    value={paymentForm.check_number}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, check_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                    value={paymentForm.bank_name}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none h-20 resize-none"
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                            placeholder="Add any additional notes..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPaymentModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Record Payment
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Profile Update Modal */}
            <Modal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                title="Update Finance Plan"
                subtitle={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ""}
                size="md"
            >
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Payment Plan</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['MONTHLY', 'THREE_PARTS', 'FULL'].map(plan => (
                                <button
                                    key={plan}
                                    type="button"
                                    onClick={() => setProfileForm({ ...profileForm, payment_plan: plan })}
                                    className={cn(
                                        "relative py-4 px-2 text-[10px] font-bold rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1",
                                        profileForm.payment_plan === plan
                                            ? "bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-900/20"
                                            : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50/50"
                                    )}
                                >
                                    <span className="uppercase tracking-widest">{plan.replace('_', ' ')}</span>
                                    {plan === 'FULL' && (
                                        <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] px-1.5 py-0">-5% Discount</Badge>
                                    )}
                                    {plan === 'THREE_PARTS' && (
                                        <span className="text-[8px] opacity-70 font-medium">Sep, Jan, Apr</span>
                                    )}
                                    {plan === 'MONTHLY' && (
                                        <span className="text-[8px] opacity-70 font-medium">10 Installments</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Corporate Partnership (-20%)</label>
                        <select
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                            value={profileForm.partnership_id || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, partnership_id: e.target.value })}
                        >
                            <option value="">No Partnership</option>
                            {partnerships.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.company_name} ({p.discount_percentage}% off)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                                <span className="font-semibold">Note:</span> Changing the payment plan or partnership will recalculate the student's total due and remaining balance based on their speciality price.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsProfileModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add Partner Modal */}
            <Modal
                isOpen={isPartnerModalOpen}
                onClose={() => setIsPartnerModalOpen(false)}
                title="Register University Partner"
                subtitle="Add a new company for corporate discounts"
                size="md"
            >
                <form onSubmit={handleCreatePartner} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Company Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={partnerForm.company_name}
                                onChange={(e) => setPartnerForm({ ...partnerForm, company_name: e.target.value })}
                                placeholder="e.g., Global Tech Corp"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                min="0"
                                max="100"
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={partnerForm.discount_percentage}
                                onChange={(e) => setPartnerForm({ ...partnerForm, discount_percentage: e.target.value })}
                                placeholder="Default is 20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Contact / Notes</label>
                        <textarea
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none h-20 resize-none"
                            value={partnerForm.contact_info}
                            onChange={(e) => setPartnerForm({ ...partnerForm, contact_info: e.target.value })}
                            placeholder="HR Contact email, phone, or partnership terms..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsPartnerModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/10">Register Partner</Button>
                    </div>
                </form>
            </Modal>

            {/* Verify Payment Confirmation Modal */}
            <ConfirmModal
                isOpen={!!paymentToVerify}
                onClose={() => setPaymentToVerify(null)}
                onConfirm={handleVerifyPayment}
                title="Verify Payment"
                message={`Are you sure you want to verify this payment of ${paymentToVerify?.amount} MAD from ${paymentToVerify?.student_first_name} ${paymentToVerify?.student_last_name}?`}
                confirmText="Verify Payment"
                variant="success"
                isLoading={isVerifying}
            />

            {/* Pricing Tab Content */}
            {activeTab === 'pricing' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Departmental Pricing */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-gray-400" />
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Departmental Pricing (Base)</h3>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-gray-500 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Base Tuition</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {departments.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{dept.name}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-gray-700">
                                                {parseFloat(dept.yearly_price || 0).toLocaleString()} MAD
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPriceItem({ ...dept, type: 'department' });
                                                        setPriceForm({ yearly_price: dept.yearly_price });
                                                        setIsPriceModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Speciality Overrides */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-gray-400" />
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Program Overrides (Specific)</h3>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-gray-500 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Program</th>
                                        <th className="px-6 py-4">Tuition</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {specialities.map((spec) => (
                                        <tr key={spec.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{spec.name}</div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Building2 size={10} /> {spec.department_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {parseFloat(spec.yearly_price || 0) > 0 ? (
                                                    <div className="font-mono font-bold text-indigo-600">
                                                        {parseFloat(spec.yearly_price).toLocaleString()} MAD
                                                        <span className="block text-[8px] uppercase tracking-tighter opacity-70">Custom Price</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-400 italic">Inherited from Dept</span>
                                                        <span className="font-mono text-xs font-medium text-gray-500">
                                                            {parseFloat(departments.find(d => d.id === spec.department_id)?.yearly_price || 0).toLocaleString()} MAD
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPriceItem({ ...spec, type: 'speciality' });
                                                        setPriceForm({ yearly_price: spec.yearly_price });
                                                        setIsPriceModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Price Setup Modal */}
            <Modal
                isOpen={isPriceModalOpen}
                onClose={() => setIsPriceModalOpen(false)}
                title={`Update Pricing`}
                subtitle={`Setting price for ${selectedPriceItem?.name}`}
                size="sm"
            >
                <form onSubmit={handleUpdatePrice} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Yearly Tuition (MAD)</label>
                        <div className="relative">
                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="number"
                                required
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none font-bold"
                                value={priceForm.yearly_price}
                                onChange={(e) => setPriceForm({ yearly_price: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        {selectedPriceItem?.type === 'speciality' && (
                            <p className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-md mt-2 flex gap-1.5 items-start">
                                <AlertCircle size={10} className="mt-0.5" />
                                Set to 0 to automatically follow the departmental base price.
                            </p>
                        )}
                        {selectedPriceItem?.type === 'department' && (
                            <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-md mt-2 flex gap-1.5 items-start">
                                <AlertCircle size={10} className="mt-0.5" />
                                Updating this will re-calculate balances for ALL students in this department (unless overridden).
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsPriceModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/10">Apply Price</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FinancePage;