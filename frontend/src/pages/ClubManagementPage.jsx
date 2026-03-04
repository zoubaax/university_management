import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Calendar,
    LayoutDashboard,
    UserPlus,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    Edit2,
    Trash2,
    Mail,
    Building2,
    Trophy,
    Target,
    Activity,
    MoreVertical,
    ChevronRight,
    Loader2,
    MapPin,
    Award,
    BookOpen,
    Link as LinkIcon,
    FileText,
    Eye,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clubService from '../api/services/clubService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const ClubManagementPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [menuOpen, setMenuOpen] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['overview', 'members', 'gallery', 'resources'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    useEffect(() => {
        fetchClubData();
    }, []);

    const fetchClubData = async () => {
        try {
            setLoading(true);
            const clubRes = await clubService.getMyClub();
            if (clubRes.success) {
                setClub(clubRes.data);

                // Fetch members
                const membersRes = await clubService.getClubMembers(clubRes.data.id);
                setMembers(membersRes.data || []);
            }
        } catch (err) {
            console.error('Error fetching club data:', err);
            toast.error('Failed to load club details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMemberStatus = async (studentId, status) => {
        try {
            await clubService.updateMemberStatus(club.id, studentId, status);
            toast.success(`Member ${status === 'approved' ? 'approved' : 'rejected'}`);
            fetchClubData(); // Refresh
        } catch (err) {
            toast.error('Failed to update member status');
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        setIsRemoving(true);
        try {
            await clubService.removeMember(club.id, memberToRemove.student_user_id);
            toast.success('Member removed successfully');
            setMemberToRemove(null);
            fetchClubData();
        } catch (err) {
            toast.error('Failed to remove member');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleToggleRegistration = async () => {
        try {
            const newStatus = !club.registration_open;
            await clubService.updateClub(club.id, { registration_open: newStatus });
            setClub({ ...club, registration_open: newStatus });
            toast.success(`Registration is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
        } catch (err) {
            toast.error('Failed to update registration status');
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading club details...</p>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Club Assigned</h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                    You don't seem to be managing any club at the moment.
                </p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'members', name: 'Members', icon: Users, badge: members.filter(m => m.status === 'pending').length },
        { id: 'gallery', name: 'Gallery', icon: Eye },
        { id: 'resources', name: 'Resources', icon: BookOpen },
    ];

    const pendingRequests = members.filter(m => m.status === 'pending');
    const approvedMembers = members.filter(m => m.status === 'approved');

    return (
        <div className="space-y-6">
            {/* Club Header */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-700 relative">
                    <div className="absolute -bottom-12 left-6 flex items-end gap-4">
                        {club.logo_url ? (
                            <img
                                src={club.logo_url}
                                alt={club.name}
                                className="w-20 h-20 rounded-lg border-2 border-white bg-white shadow-md object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg border-2 border-white bg-gray-100 shadow-md flex items-center justify-center text-2xl font-bold text-gray-500">
                                {club.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Action Menu */}
                    <div className="absolute top-3 right-3">
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(menuOpen === 'header' ? null : 'header')}
                                className="p-1.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <MoreVertical size={16} />
                            </button>

                            {menuOpen === 'header' && (
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(true);
                                            setMenuOpen(null);
                                        }}
                                        className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                                    >
                                        <Edit2 size={12} />
                                        Edit Club
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Handle invite
                                            setMenuOpen(null);
                                        }}
                                        className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                                    >
                                        <Mail size={12} />
                                        Invite Members
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-12 pb-6 px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                    {club.category || 'Student Club'}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Building2 size={14} />
                                    <span>{club.department_name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Users size={14} />
                                    <span>{approvedMembers.length} members</span>
                                </div>
                                <Badge className={cn(
                                    "border-2",
                                    club.registration_open
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                )}>
                                    {club.registration_open ? 'Registration Open' : 'Registration Closed'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleToggleRegistration}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                    club.registration_open
                                        ? "bg-white text-red-600 border-red-200 hover:bg-red-50"
                                        : "bg-white text-green-600 border-green-200 hover:bg-green-50"
                                )}
                            >
                                {club.registration_open ? (
                                    <>
                                        <ToggleRight size={16} />
                                        Close Registration
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft size={16} />
                                        Open Registration
                                    </>
                                )}
                            </button>
                            <div className="h-6 w-px bg-gray-200 mx-1" />
                            <Button variant="outline" icon={Mail} size="sm">
                                Contact Members
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "py-4 px-1 border-b-2 font-medium text-sm transition-colors relative",
                                activeTab === tab.id
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <tab.icon size={18} />
                                {tab.name}
                                {tab.badge > 0 && (
                                    <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5">
                                        {tab.badge}
                                    </Badge>
                                )}
                            </div>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {/* Stats Cards */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Members</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">{approvedMembers.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                {pendingRequests.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setActiveTab('members')}
                                            className="flex items-center justify-between w-full text-xs text-amber-600 hover:text-amber-700"
                                        >
                                            <span>{pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}</span>
                                            <ChevronRight size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Events This Month</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">3</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={12} />
                                        <span>Next event: Nov 15, 2024</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Club Status</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1 capitalize">{club.status}</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <Trophy className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Award size={12} />
                                        <span>Active since {new Date(club.created_at).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">About the Club</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {club.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                        <UserPlus size={16} className="text-gray-400" />
                                        Invite Members
                                    </button>
                                    <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                        <Calendar size={16} className="text-gray-400" />
                                        Schedule Event
                                    </button>
                                    <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                        <FileText size={16} className="text-gray-400" />
                                        Upload Resource
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'members' && (
                        <motion.div
                            key="members"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {members.map((member, index) => (
                                            <motion.tr
                                                key={member.student_user_id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                                            {member.student_name?.[0] || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{member.student_name}</p>
                                                            <p className="text-xs text-gray-500">{member.student_email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700 capitalize">
                                                        {member.club_role || 'Member'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn(
                                                        "text-xs",
                                                        member.status === 'approved' ? "bg-green-100 text-green-700 border-green-200" :
                                                            member.status === 'pending' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                                "bg-red-100 text-red-700 border-red-200"
                                                    )}>
                                                        {member.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(member.joined_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {member.status === 'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleUpdateMemberStatus(member.student_user_id, 'approved')}
                                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateMemberStatus(member.student_user_id, 'rejected')}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setMemberToRemove(member)}
                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {members.length === 0 && (
                                <div className="p-12 text-center">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No members yet</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'gallery' && (
                        <motion.div
                            key="gallery"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white border border-gray-200 rounded-xl p-8 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Eye className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Gallery Coming Soon</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Share photos and moments from your club activities.
                            </p>
                            <Button className="mt-6" icon={Plus}>
                                Add First Photo
                            </Button>
                        </motion.div>
                    )}

                    {activeTab === 'resources' && (
                        <motion.div
                            key="resources"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white border border-gray-200 rounded-xl p-8 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Yet</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Share study materials, documents, and resources with your members.
                            </p>
                            <Button className="mt-6" icon={Plus}>
                                Upload Resource
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Edit Club Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Club"
                subtitle="Update your club information"
                size="md"
            >
                <form className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Club Name</label>
                        <input
                            type="text"
                            defaultValue={club.name}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            rows={4}
                            defaultValue={club.description}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Logo URL</label>
                        <input
                            type="url"
                            defaultValue={club.logo_url}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Remove Member Confirmation */}
            <ConfirmModal
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                message={`Are you sure you want to remove ${memberToRemove?.student_name} from the club?`}
                confirmText="Remove"
                variant="danger"
                isLoading={isRemoving}
            />
        </div>
    );
};

export default ClubManagementPage;