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
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [menuOpen, setMenuOpen] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastData, setBroadcastData] = useState({ subject: '', body: '' });
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [updatingMemberRole, setUpdatingMemberRole] = useState(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [events, setEvents] = useState([]);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventData, setEventData] = useState({ title: '', description: '', start_time: '', end_time: '', location: '' });
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
    const [rsvpList, setRSVPList] = useState([]);
    const [loadingRSVPs, setLoadingRSVPs] = useState(false);
    const [selectedEventName, setSelectedEventName] = useState('');
    const [gallery, setGallery] = useState([]);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [galleryData, setGalleryData] = useState({ image: null, caption: '' });
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const CLUB_ROLES = [
        'Member',
        'Vice President',
        'Treasurer',
        'Secretary',
        'Technical Lead',
        'Media Lead',
        'Event Coordinator'
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['overview', 'members', 'gallery', 'resources', 'events', 'settings'].includes(tab)) {
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

                // Fetch members, broadcasts, events, and gallery
                const [membersRes, broadcastsRes, eventsRes, galleryRes] = await Promise.all([
                    clubService.getClubMembers(clubRes.data.id),
                    clubService.getClubBroadcasts(clubRes.data.id),
                    clubService.getClubEvents(clubRes.data.id),
                    clubService.getClubGallery(clubRes.data.id)
                ]);
                setMembers(membersRes.data || []);
                setBroadcasts(broadcastsRes.data || []);
                setEvents(eventsRes.data || []);
                setGallery(galleryRes.data || []);
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

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastData.subject || !broadcastData.body) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsBroadcasting(true);
        try {
            await clubService.broadcastMessage(club.id, broadcastData.subject, broadcastData.body);
            toast.success('Broadcast sent successfully!');
            setIsBroadcastModalOpen(false);
            setBroadcastData({ subject: '', body: '' });
            fetchClubData(); // Refresh history
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send broadcast');
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleUpdateRole = async (newRole) => {
        setIsUpdatingRole(true);
        try {
            await clubService.updateMemberRole(club.id, updatingMemberRole.student_user_id, newRole);
            toast.success(`${updatingMemberRole.student_name} promoted to ${newRole}`);
            setUpdatingMemberRole(null);
            fetchClubData();
        } catch (err) {
            toast.error('Failed to update member role');
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        setIsCreatingEvent(true);
        try {
            if (editingEvent) {
                await clubService.updateClubEvent(club.id, editingEvent.id, eventData);
                toast.success('Event updated successfully');
            } else {
                await clubService.createClubEvent(club.id, eventData);
                toast.success('Event scheduled successfully');
            }
            setIsEventModalOpen(false);
            setEditingEvent(null);
            setEventData({ title: '', description: '', start_time: '', end_time: '', location: '' });
            fetchClubData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save event');
        } finally {
            setIsCreatingEvent(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await clubService.deleteClubEvent(club.id, eventId);
            toast.success('Event deleted');
            fetchClubData();
        } catch (err) {
            toast.error('Failed to delete event');
        }
    };

    const handleViewRSVPs = async (event) => {
        setSelectedEventName(event.title);
        setIsRSVPModalOpen(true);
        setLoadingRSVPs(true);
        try {
            const res = await clubService.getEventRSVPs(event.id);
            setRSVPList(res.data || []);
        } catch (err) {
            toast.error('Failed to load RSVPs');
        } finally {
            setLoadingRSVPs(false);
        }
    };

    const openEditEvent = (event) => {
        setEditingEvent(event);
        setEventData({
            title: event.title,
            description: event.description,
            start_time: event.start_time.substring(0, 16), // Format for datetime-local
            end_time: event.end_time.substring(0, 16),
            location: event.location
        });
        setIsEventModalOpen(true);
    };

    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        if (!galleryData.image) {
            toast.error('Please select an image');
            return;
        }

        const formData = new FormData();
        formData.append('image', galleryData.image);
        formData.append('caption', galleryData.caption);

        setIsUploadingPhoto(true);
        try {
            await clubService.addGalleryPhoto(club.id, formData);
            toast.success('Photo added to gallery!');
            setIsGalleryModalOpen(false);
            setGalleryData({ image: null, caption: '' });
            fetchClubData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to upload photo');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Delete this photo?')) return;
        try {
            await clubService.deleteGalleryPhoto(club.id, photoId);
            toast.success('Photo removed');
            fetchClubData();
        } catch (err) {
            toast.error('Failed to remove photo');
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
                                src={`${import.meta.env.VITE_API_URL}${club.logo_url}`}
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
                            <Button
                                variant="outline"
                                icon={Mail}
                                size="sm"
                                onClick={() => setIsBroadcastModalOpen(true)}
                            >
                                Send Broadcast
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs - Hidden because they are now in the sidebar */}
            {/* 
            <div className="border-b border-gray-200">
                ... 
            </div>
            */}

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
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">About the Club</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {club.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Broadcast History */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        Recent Broadcasts
                                    </h3>
                                    <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                        {broadcasts.length}
                                    </Badge>
                                </div>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {broadcasts.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            <p className="text-xs text-gray-500">No broadcast history yet</p>
                                        </div>
                                    ) : (
                                        broadcasts.map((b, i) => (
                                            <div key={b.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{b.subject}</h4>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                        {new Date(b.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2">{b.body}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
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
                                                    <Badge className={cn(
                                                        "text-[10px] font-medium uppercase tracking-wider",
                                                        member.club_role === 'President' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                            member.club_role === 'member' ? "bg-gray-50 text-gray-600 border-gray-200" :
                                                                "bg-blue-50 text-blue-700 border-blue-200"
                                                    )}>
                                                        {member.club_role || 'Member'}
                                                    </Badge>
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
                                                    <div className="flex justify-end gap-2">
                                                        {member.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateMemberStatus(member.student_user_id, 'approved')}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateMemberStatus(member.student_user_id, 'rejected')}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => setUpdatingMemberRole(member)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Manage Role"
                                                                >
                                                                    <Award size={16} />
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
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

                    {activeTab === 'events' && (
                        <motion.div
                            key="events"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                                <Button
                                    size="sm"
                                    icon={Plus}
                                    onClick={() => {
                                        setEditingEvent(null);
                                        setEventData({ title: '', description: '', start_time: '', end_time: '', location: '' });
                                        setIsEventModalOpen(true);
                                    }}
                                >
                                    Schedule Event
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {events.length === 0 ? (
                                    <div className="bg-white border border-gray-200 border-dashed rounded-xl p-12 text-center">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No events scheduled yet</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={() => setIsEventModalOpen(true)}
                                        >
                                            Create your first event
                                        </Button>
                                    </div>
                                ) : (
                                    events.map((event) => (
                                        <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-lg border border-gray-100">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                            {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                                                        </span>
                                                        <span className="text-xl font-bold text-gray-900 leading-none">
                                                            {new Date(event.start_time).getDate()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock size={14} />
                                                                {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin size={14} />
                                                                {event.location}
                                                            </div>
                                                            <button
                                                                onClick={() => handleViewRSVPs(event)}
                                                                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                                                            >
                                                                <Users size={14} />
                                                                {event.rsvp_count || 0} RSVP'd
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEditEvent(event)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'gallery' && (
                        <motion.div
                            key="gallery"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Club Gallery</h3>
                                <Button
                                    size="sm"
                                    icon={Plus}
                                    onClick={() => setIsGalleryModalOpen(true)}
                                >
                                    Upload Photo
                                </Button>
                            </div>

                            {gallery.length === 0 ? (
                                <div className="bg-white border border-gray-200 border-dashed rounded-xl p-12 text-center">
                                    <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No photos in the gallery yet</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => setIsGalleryModalOpen(true)}
                                    >
                                        Upload your first photo
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {gallery.map((photo) => (
                                        <div key={photo.id} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}${photo.image_url}`}
                                                alt={photo.caption}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <p className="text-white text-[10px] line-clamp-2 mb-2">{photo.caption}</p>
                                                <button
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Trash2 size={12} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white border border-gray-200 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Club Settings</h3>
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Registration Status</label>
                                    <p className="text-xs text-gray-500 mb-4">Control whether new students can find and join your club.</p>
                                    <Button
                                        variant="outline"
                                        onClick={handleToggleRegistration}
                                        className={cn(
                                            "w-full justify-between",
                                            club.registration_open ? "border-green-200 text-green-700 bg-green-50/50" : "border-red-200 text-red-700 bg-red-50/50"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {club.registration_open ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            Registration is {club.registration_open ? 'OPEN' : 'CLOSED'}
                                        </span>
                                        {club.registration_open ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                    </Button>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">Danger Zone</h4>
                                    <p className="text-xs text-gray-500 mb-4">Once you dissolve a club, all data including member history and events will be archived.</p>
                                    <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50" icon={Trash2}>
                                        Request Club Dissolution
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Event Scheduling Modal */}
            <Modal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                }}
                title={editingEvent ? "Edit Event" : "Schedule New Event"}
                subtitle="Create a workshop, meeting, or social gathering"
            >
                <form onSubmit={handleEventSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Event Title</label>
                        <input
                            type="text"
                            required
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            placeholder="e.g. Weekly Workshop v1.0"
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Start Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={eventData.start_time}
                                onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">End Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={eventData.end_time}
                                onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            required
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                            placeholder="e.g. Room 204 or online link"
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            rows={3}
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            placeholder="Tell members what to expect..."
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEventModalOpen(false);
                                setEditingEvent(null);
                            }}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isCreatingEvent}>
                            {editingEvent ? "Update Event" : "Create Event"}
                        </Button>
                    </div>
                </form>
            </Modal>

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

            {/* Promote Member Modal */}
            <Modal
                isOpen={!!updatingMemberRole}
                onClose={() => setUpdatingMemberRole(null)}
                title="Manage Member Role"
                subtitle={`Assign a new leadership role to ${updatingMemberRole?.student_name}`}
            >
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 mb-2">
                        Leadership roles allow students to build their official university profile and CV.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {CLUB_ROLES.map((role) => (
                            <button
                                key={role}
                                onClick={() => handleUpdateRole(role)}
                                disabled={isUpdatingRole}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left",
                                    updatingMemberRole?.club_role?.toLowerCase() === role.toLowerCase()
                                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                        : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700"
                                )}
                            >
                                <span>{role}</span>
                                {updatingMemberRole?.club_role?.toLowerCase() === role.toLowerCase() && (
                                    <CheckCircle size={14} className="text-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
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

            {/* Broadcast Modal */}
            <Modal
                isOpen={isBroadcastModalOpen}
                onClose={() => setIsBroadcastModalOpen(false)}
                title="Send Broadcast Message"
            >
                <form onSubmit={handleBroadcast} className="space-y-4">
                    <p className="text-sm text-gray-500">
                        This message will be sent to all {members.filter(m => m.status === 'approved').length} approved members of your club.
                    </p>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            required
                            value={broadcastData.subject}
                            onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                            placeholder="e.g. Weekly Meeting Update"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Message Body</label>
                        <textarea
                            rows={6}
                            required
                            value={broadcastData.body}
                            onChange={(e) => setBroadcastData({ ...broadcastData, body: e.target.value })}
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
                            placeholder="Type your message here..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsBroadcastModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                            isLoading={isBroadcasting}
                            disabled={isBroadcasting}
                        >
                            Send to All Members
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* RSVP Guest List Modal */}
            <Modal
                isOpen={isRSVPModalOpen}
                onClose={() => setIsRSVPModalOpen(false)}
                title="Guest List"
                subtitle={`RSVPs for: ${selectedEventName}`}
            >
                <div className="space-y-4">
                    {loadingRSVPs ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                            <p className="text-sm text-gray-500">Fetching attendees...</p>
                        </div>
                    ) : rsvpList.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No RSVPs yet</p>
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {rsvpList.map((rsvp) => (
                                <div key={rsvp.student_user_id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {rsvp.avatar_url ? (
                                            <img src={rsvp.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm">
                                                {rsvp.first_name[0]}{rsvp.last_name[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{rsvp.first_name} {rsvp.last_name}</p>
                                            <p className="text-[10px] text-gray-500">{rsvp.email}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-50 text-green-700 border-green-100 text-[10px]">Attending</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <Button className="bg-gray-900 text-white" onClick={() => setIsRSVPModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Upload Photo Modal */}
            <Modal
                isOpen={isGalleryModalOpen}
                onClose={() => setIsGalleryModalOpen(false)}
                title="Upload Photo"
                subtitle="Share a moment from your club activities"
            >
                <form onSubmit={handlePhotoUpload} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={(e) => setGalleryData({ ...galleryData, image: e.target.files[0] })}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Caption (Optional)</label>
                        <input
                            type="text"
                            value={galleryData.caption}
                            onChange={(e) => setGalleryData({ ...galleryData, caption: e.target.value })}
                            placeholder="e.g. Workshop highlight!"
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsGalleryModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gray-900 text-white"
                            isLoading={isUploadingPhoto}
                            disabled={isUploadingPhoto}
                        >
                            Upload to Gallery
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ClubManagementPage;