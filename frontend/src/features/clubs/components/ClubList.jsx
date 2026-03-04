import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Plus,
    Building,
    Mail,
    Calendar,
    MapPin,
    MoreVertical,
    Edit2,
    Trash2,
    Loader2,
    UserPlus,
    Flag,
    Award,
    Heart,
    MessageSquare,
    Eye,
    FileText,
    Image,
    Layout
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import clubService from '../../../api/services/clubService';
import CreateClubModal from './CreateClubModal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { cn } from '../../../utils/cn';
import { toast } from 'react-hot-toast';

const ClubList = () => {
    const { user } = useAuth();
    const [clubs, setClubs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [menuOpen, setMenuOpen] = useState(null);
    const [viewingClub, setViewingClub] = useState(null);
    const [clubBroadcasts, setClubBroadcasts] = useState([]);
    const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);

    const handleJoin = async (clubId) => {
        try {
            const res = await clubService.joinClub(clubId);
            if (res.success) {
                toast.success('Application sent! Waiting for approval.');
                // Refresh to show pending status
                fetchClubs();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to join club');
        }
    };

    const handleViewClub = async (club) => {
        setViewingClub(club);
        setLoadingBroadcasts(true);
        try {
            const res = await clubService.getClubBroadcasts(club.id);
            setClubBroadcasts(res.data || []);
        } catch (err) {
            console.error('Failed to fetch broadcasts:', err);
            toast.error('Could not load announcements');
        } finally {
            setLoadingBroadcasts(false);
        }
    };

    // Can this user create new clubs?
    const canCreateClub = user?.role_name === 'SUPER_ADMIN' || user?.role_name === 'RESPONSABLE_DEPARTMENT';
    const canManageClub = user?.role_name === 'SUPER_ADMIN' || user?.role_name === 'RESPONSABLE_DEPARTMENT';

    const fetchClubs = async () => {
        try {
            setLoading(true);
            const data = await clubService.getClubs();
            setClubs(data.data || []);
        } catch (error) {
            console.error('Failed to fetch clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    // Get unique departments for filter
    const departments = [...new Set(clubs.map(club => club.department_name).filter(Boolean))];

    const filteredClubs = clubs.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (club.department_name && club.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesDepartment = selectedDepartment === 'all' || club.department_name === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'INACTIVE':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Club Directory</h1>
                    <p className="text-sm text-gray-500 mt-1">Discover and join student organizations on campus</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search clubs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                    </div>

                    {canCreateClub && (
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            icon={Plus}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Create Club
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            {departments.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 mr-2">Filter by department:</span>
                        <button
                            onClick={() => setSelectedDepartment('all')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                                selectedDepartment === 'all'
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            All
                        </button>
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDepartment(dept)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                                    selectedDepartment === dept
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading clubs...</p>
                </div>
            ) : filteredClubs.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        {searchQuery || selectedDepartment !== 'all'
                            ? 'Try adjusting your search filters'
                            : 'Get started by creating your first student club'}
                    </p>
                    {!searchQuery && selectedDepartment === 'all' && canCreateClub && (
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            icon={Plus}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Create First Club
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredClubs.map((club, index) => (
                            <motion.div
                                key={club.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group"
                            >
                                {/* Club Header with Gradient */}
                                <div className="h-24 bg-gradient-to-r from-gray-900 to-gray-700 relative">
                                    {club.logo_url ? (
                                        <div className="absolute -bottom-8 left-5 w-16 h-16 rounded-lg border-2 border-white bg-white overflow-hidden shadow-md">
                                            <img
                                                src={club.logo_url}
                                                alt={club.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="absolute -bottom-8 left-5 w-16 h-16 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 shadow-md">
                                            {club.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <Badge className={`text-[10px] ${getStatusColor(club.status)}`}>
                                            {club.status || 'ACTIVE'}
                                        </Badge>
                                    </div>

                                    {/* Action Menu */}
                                    {canManageClub && (
                                        <div className="absolute top-3 left-3">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === club.id ? null : club.id)}
                                                    className="p-1.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
                                                >
                                                    <MoreVertical size={14} />
                                                </button>

                                                {menuOpen === club.id && (
                                                    <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                        <button
                                                            className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                                                        >
                                                            <Edit2 size={12} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                                                        >
                                                            <Trash2 size={12} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Club Info */}
                                <div className="pt-10 p-5">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{club.name}</h3>
                                        {club.department_name && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Building size={12} />
                                                <span>{club.department_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {club.description || "No description provided."}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-100">
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-gray-500">Members</p>
                                            <p className="text-sm font-semibold text-gray-900">{club.member_count || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-gray-500">Events</p>
                                            <p className="text-sm font-semibold text-gray-900">{club.event_count || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-gray-500">Since</p>
                                            <p className="text-sm font-semibold text-gray-900">{new Date(club.created_at).getFullYear()}</p>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 mb-4">
                                        {club.contact_email && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Mail size={12} className="text-gray-400" />
                                                <a href={`mailto:${club.contact_email}`} className="hover:text-gray-900 truncate">
                                                    {club.contact_email}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {club.membership_status === 'approved' ? (
                                            <Button
                                                onClick={() => handleViewClub(club)}
                                                className="flex-1 bg-gray-900 border-gray-900 text-white hover:bg-gray-800"
                                                icon={Eye}
                                                size="sm"
                                            >
                                                View Announcements
                                            </Button>
                                        ) : club.membership_status === 'pending' ? (
                                            <Button
                                                disabled
                                                className="flex-1 bg-amber-50 border-amber-200 text-amber-600 cursor-not-allowed"
                                                icon={Clock}
                                                size="sm"
                                            >
                                                Pending Approval
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => handleJoin(club.id)}
                                                disabled={!club.registration_open}
                                                className={cn(
                                                    "flex-1",
                                                    club.registration_open
                                                        ? "bg-gray-900 text-white hover:bg-gray-800"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                                )}
                                                icon={club.registration_open ? UserPlus : XCircle}
                                                size="sm"
                                            >
                                                {club.registration_open ? 'Join Club' : 'Registration Closed'}
                                            </Button>
                                        )}

                                        <button
                                            onClick={() => window.location.href = `mailto:${club.contact_email}`}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                                            title="Contact President"
                                        >
                                            <MessageSquare size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Club Modal */}
            <CreateClubModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchClubs();
                    setIsCreateModalOpen(false);
                }}
            />

            {/* Club Hub Modal (Student View) */}
            <Modal
                isOpen={!!viewingClub}
                onClose={() => setViewingClub(null)}
                title={viewingClub?.name}
            >
                {viewingClub && (
                    <div className="space-y-6">
                        {/* Club Header in Modal */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            {viewingClub.logo_url ? (
                                <img src={viewingClub.logo_url} alt="" className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                    {viewingClub.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{viewingClub.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Badge className="bg-green-50 text-green-700 border-green-100">Member</Badge>
                                    <span>•</span>
                                    <span>{viewingClub.department_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs content (Mostly Announcements for now) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Mail size={16} className="text-blue-500" />
                                    Latest Announcements
                                </h4>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">History</span>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {loadingBroadcasts ? (
                                    <div className="py-12 flex flex-col items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-2" />
                                        <p className="text-xs text-gray-400">Loading announcements...</p>
                                    </div>
                                ) : clubBroadcasts.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No announcements yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Stay tuned for updates from the club!</p>
                                    </div>
                                ) : (
                                    clubBroadcasts.map((broadcast) => (
                                        <motion.div
                                            key={broadcast.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="text-sm font-bold text-gray-900">{broadcast.subject}</h5>
                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                                    {new Date(broadcast.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {broadcast.body}
                                            </p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Future Features Placeholders */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                            <button className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed">
                                <Image size={20} className="text-gray-400" />
                                <span className="text-[10px] font-medium text-gray-500">Gallery (Coming)</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed">
                                <FileText size={20} className="text-gray-400" />
                                <span className="text-[10px] font-medium text-gray-500">Resources (Coming)</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClubList;