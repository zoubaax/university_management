import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Shield,
    Building2,
    Calendar,
    Award,
    FileText,
    Settings,
    Camera,
    MapPin,
    Phone,
    Briefcase,
    GraduationCap,
    Clock,
    CheckCircle2,
    Lock,
    ExternalLink,
    CreditCard,
    BookOpen,
    Receipt,
    Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import studentService from '../api/services/studentService';
import staffService from '../api/services/staffService';
import financeService from '../api/services/financeService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';
import { getCurrentAcademicYear } from '../utils/academicYearUtils';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const isStudent = user?.role_name === 'STUDENT';
    const isProfessor = user?.role_name === 'PROFESSOR';

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            let data;
            if (isStudent && user?.student_id) {
                const [profData, payData] = await Promise.all([
                    studentService.getProfile(user.student_id),
                    financeService.getMyPayments().catch(() => [])
                ]);
                data = profData;
                setPayments(payData || []);
            } else if (user?.employee_id) {
                // Assuming staffService has getById
                data = await staffService.getById(user.employee_id);
            }
            setProfileData(data || user);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setProfileData(user);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (paymentId) => {
        try {
            toast.loading('Downloading receipt...', { id: 'receipt' });
            await financeService.downloadReceipt(paymentId);
            toast.success('Receipt downloaded', { id: 'receipt' });
        } catch (err) {
            toast.error('Failed to download receipt', { id: 'receipt' });
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header / Banner */}
            <div className="relative">
                <div className="h-48 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-lg overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-white rounded-2xl p-1.5 shadow-xl">
                            <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-3xl font-bold text-gray-400">
                                {initials}
                            </div>
                        </div>
                        <button className="absolute -right-2 -bottom-2 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {user?.first_name} {user?.last_name}
                            </h1>
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                                {user?.role_name?.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                        <p className="text-gray-300 mt-1 flex items-center gap-2">
                            <Mail size={16} /> {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <User size={18} className="text-gray-400" />
                            Overview
                        </h3>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Building2 size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Department</p>
                                    <p className="text-sm font-medium text-gray-900">{profileData?.department_name || 'General Administration'}</p>
                                </div>
                            </div>

                            {isStudent && (
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <GraduationCap size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Academic Program</p>
                                        <p className="text-sm font-medium text-gray-900">{profileData?.speciality_name}</p>
                                    </div>
                                </div>
                            )}

                            {isStudent && (
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Registration Number</p>
                                        <p className="text-sm font-medium text-gray-900 font-mono">{profileData?.registration_num}</p>
                                    </div>
                                </div>
                            )}

                            {!isStudent && (
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <Briefcase size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Staff Category</p>
                                        <p className="text-sm font-medium text-gray-900">{profileData?.type || 'Faculty'}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Member Since</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                                <span className="text-sm font-bold text-blue-600">85%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full w-[85%] shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl shadow-gray-200"
                    >
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-blue-400" />
                            Security Status
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 italic">Account Status</span>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                            </li>
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 italic">2FA Status</span>
                                <span className="text-red-400 flex items-center gap-1 font-medium">Inactive <Settings size={12} /></span>
                            </li>
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 italic">Last Password Change</span>
                                <span className="font-medium text-gray-200">3 months ago</span>
                            </li>
                        </ul>
                        <button className="w-full mt-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10">
                            Update Security Settings
                        </button>
                    </motion.div>
                </div>

                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio / Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-gray-900 pl-4">Personal Details</h2>
                            <Button variant="outline" size="sm" icon={Settings}>Edit Profile</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">First Name</label>
                                <p className="text-base font-semibold text-gray-900">{profileData?.first_name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Last Name</label>
                                <p className="text-base font-semibold text-gray-900">{profileData?.last_name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Institutional Email</label>
                                <p className="text-base font-semibold text-gray-900">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Phone Number</label>
                                <p className="text-base font-semibold text-gray-900">+212 6XX-XXXXXX</p>
                            </div>

                            {isStudent && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Date of Birth</label>
                                    <p className="text-base font-semibold text-gray-900">
                                        {profileData?.birth_date ? new Date(profileData.birth_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">National ID (CIN)</label>
                                <p className="text-base font-semibold text-gray-900">{profileData?.cin || 'Confidential'}</p>
                            </div>
                        </div>

                        {isStudent && profileData?.class_name && (
                            <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    Active Enrollment
                                </h4>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{profileData.class_name}</p>
                                        <p className="text-sm text-blue-600 font-medium">{profileData.speciality_name}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">Semester 2</span>
                                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">Academic Year {getCurrentAcademicYear()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Documents & Files */}
                    {isStudent && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-gray-900 pl-4">Verified Documents</h2>
                                <Badge className="bg-green-100 text-green-700">Verified by Admin</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Baccalaureate Certificate</p>
                                            <p className="text-xs text-gray-400">PDF Document • 1.2 MB</p>
                                        </div>
                                    </div>
                                    {profileData?.bac_document_url && (
                                        <a
                                            href={profileData.bac_document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-blue-100"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>

                                <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">National ID Card (CIN)</p>
                                            <p className="text-xs text-gray-400">Image Scan • 800 KB</p>
                                        </div>
                                    </div>
                                    {profileData?.cin_document_url && (
                                        <a
                                            href={profileData.cin_document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-purple-100"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Payment History Section */}
                    {isStudent && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-gray-900 pl-4">Payment History</h2>
                                <Badge className="bg-blue-100 text-blue-700">{payments.length} Payments</Badge>
                            </div>

                            {payments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No payment history found.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {payments.map(payment => (
                                        <div key={payment.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                                    <Receipt size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{parseFloat(payment.amount).toLocaleString()} MAD</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(payment.created_at).toLocaleDateString()} • {payment.payment_method}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={
                                                    payment.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                        payment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                }>
                                                    {payment.status}
                                                </Badge>
                                                {payment.status === 'VERIFIED' && (
                                                    <button
                                                        onClick={() => handleDownloadReceipt(payment.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-blue-100"
                                                        title="Download Receipt"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
