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
    Layout,
    Clock,
    XCircle,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Star,
    BookOpen,
    Camera,
    Volume2,
    Megaphone,
    Sparkles
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
    const [viewMode, setViewMode] = useState('announcements');
    const [clubBroadcasts, setClubBroadcasts] = useState([]);
    const [clubEvents, setClubEvents] = useState([]);
    const [clubGallery, setClubGallery] = useState([]);
    const [loadingClubData, setLoadingClubData] = useState(false);

    const handleJoin = async (clubId) => {
        try {
            const res = await clubService.joinClub(clubId);
            if (res.success) {
                toast.success('Application sent! Waiting for approval.');
                fetchClubs();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to join club');
        }
    };

    const handleViewClub = async (club, mode = 'announcements') => {
        setViewingClub(club);
        setViewMode(mode);
        try {
            setLoadingClubData(true);
            const [broadcastsRes, eventsRes, galleryRes] = await Promise.all([
                clubService.getClubBroadcasts(club.id),
                clubService.getClubEvents(club.id),
                clubService.getClubGallery(club.id)
            ]);
            setClubBroadcasts(broadcastsRes.data || []);
            setClubEvents(eventsRes.data || []);
            setClubGallery(galleryRes.data || []);
        } catch (err) {
            console.error('Error fetching hub data:', err);
            toast.error('Failed to load club information');
        } finally {
            setLoadingClubData(false);
        }
    };

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

    const getMembershipStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return { label: 'Member', color: 'bg-green-100 text-green-700 border-green-200' };
            case 'pending':
                return { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' };
            default:
                return null;
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
                        {filteredClubs.map((club, index) => {
                            const membershipBadge = getMembershipStatusBadge(club.membership_status);
                            return (
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
                                                    src={`${import.meta.env.VITE_API_URL}${club.logo_url}`}
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

                                        {/* Membership Badge (if user is a member) */}
                                        {membershipBadge && (
                                            <div className="absolute top-3 left-3">
                                                <Badge className={`text-[10px] ${membershipBadge.color}`}>
                                                    {membershipBadge.label}
                                                </Badge>
                                            </div>
                                        )}

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

                                                    <AnimatePresence>
                                                        {menuOpen === club.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                                                            >
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
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
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
                                                <>
                                                    <Button
                                                        onClick={() => handleViewClub(club, 'announcements')}
                                                        className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                                                        icon={Megaphone}
                                                        size="sm"
                                                    >
                                                        Updates
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleViewClub(club, 'schedule')}
                                                        className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                                        icon={Calendar}
                                                        size="sm"
                                                    >
                                                        Events
                                                    </Button>
                                                </>
                                            ) : club.membership_status === 'pending' ? (
                                                <Button
                                                    disabled
                                                    className="flex-1 bg-amber-50 border border-amber-200 text-amber-600 cursor-not-allowed"
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
                                                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                                    )}
                                                    icon={club.registration_open ? UserPlus : XCircle}
                                                    size="sm"
                                                >
                                                    {club.registration_open ? 'Join Club' : 'Closed'}
                                                </Button>
                                            )}

                                            {club.contact_email && (
                                                <a
                                                    href={`mailto:${club.contact_email}`}
                                                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                                                    title="Contact Club"
                                                >
                                                    <MessageSquare size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
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

            {/* Club Hub Modal */}
            <Modal
                isOpen={!!viewingClub}
                onClose={() => setViewingClub(null)}
                title={viewingClub?.name}
                size="lg"
            >
                {viewingClub && (
                    <div className="space-y-5">
                        {/* Club Header */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            {viewingClub.logo_url ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${viewingClub.logo_url}`}
                                    alt=""
                                    className="w-16 h-16 rounded-lg object-cover shadow-sm border border-gray-200"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xl border border-gray-300">
                                    {viewingClub.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{viewingClub.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                        <CheckCircle size={10} className="mr-1" />
                                        Member
                                    </Badge>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{viewingClub.department_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-1 border-b border-gray-200">
                            {[
                                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                                { id: 'schedule', label: 'Events', icon: Calendar },
                                { id: 'gallery', label: 'Gallery', icon: Image }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
                                        viewMode === tab.id
                                            ? "text-gray-900"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {viewMode === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px] max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                            {loadingClubData ? (
                                <div className="h-64 flex flex-col items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                                    <p className="text-sm text-gray-500">Loading content...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Announcements */}
                                    {viewMode === 'announcements' && (
                                        <div className="space-y-4">
                                            {clubBroadcasts.length === 0 ? (
                                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500">No announcements yet</p>
                                                    <p className="text-xs text-gray-400 mt-1">Stay tuned for updates!</p>
                                                </div>
                                            ) : (
                                                clubBroadcasts.map((broadcast) => (
                                                    <motion.div
                                                        key={broadcast.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="text-sm font-semibold text-gray-900">{broadcast.subject}</h4>
                                                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                                                {new Date(broadcast.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                                            {broadcast.body}
                                                        </p>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* Events */}
                                    {viewMode === 'schedule' && (
                                        <div className="space-y-4">
                                            {clubEvents.length === 0 ? (
                                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500">No events scheduled</p>
                                                    <p className="text-xs text-gray-400 mt-1">Check back soon!</p>
                                                </div>
                                            ) : (
                                                clubEvents.map((event) => (
                                                    <motion.div
                                                        key={event.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                                                    >
                                                        <div className="flex gap-4">
                                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-lg border border-blue-200">
                                                                <span className="text-[10px] font-bold text-blue-600 uppercase">
                                                                    {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                                                                </span>
                                                                <span className="text-xl font-bold text-blue-700 leading-none">
                                                                    {new Date(event.start_time).getDate()}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                                                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock size={12} />
                                                                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin size={12} />
                                                                        {event.location}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Users size={12} />
                                                                        {event.rsvp_count || 0} attending
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="xs"
                                                                    className="mt-3"
                                                                    onClick={() => clubService.rsvpToEvent(event.id).then(() => toast.success('RSVP confirmed!'))}
                                                                >
                                                                    RSVP
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* Gallery */}
                                    {viewMode === 'gallery' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {clubGallery.length === 0 ? (
                                                <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500">No photos yet</p>
                                                    <p className="text-xs text-gray-400 mt-1">Check back for club memories!</p>
                                                </div>
                                            ) : (
                                                clubGallery.map((photo) => (
                                                    <motion.div
                                                        key={photo.id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                                                    >
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}${photo.image_url}`}
                                                            alt={photo.caption}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                        {photo.caption && (
                                                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                                <p className="text-[10px] text-white truncate">{photo.caption}</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Coming Soon Feature */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={16} className="text-gray-400" />
                                    <span className="text-xs text-gray-600">Resources Library</span>
                                </div>
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                                    <Sparkles size={10} className="mr-1" />
                                    Coming Soon
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClubList;