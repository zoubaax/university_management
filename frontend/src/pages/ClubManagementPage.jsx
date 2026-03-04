import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    Settings,
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
    Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clubService from '../api/services/clubService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const ClubManagementPage = () => {
    const { user } = useAuth();
    const [club, setClub] = useState(null);
    const [members, setMembers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchClubData();
    }, []);

    const fetchClubData = async () => {
        try {
            setLoading(true);
            const clubRes = await clubService.getMyClub();
            if (clubRes.success) {
                setClub(clubRes.data);

                // Fetch members and events
                const [membersRes, eventsRes] = await Promise.all([
                    clubService.getClubMembers(clubRes.data.id),
                    clubService.getClubEvents(clubRes.data.id)
                ]);

                setMembers(membersRes.data || []);
                setEvents(eventsRes.data || []);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">No Club Assigned</h2>
                <p className="text-gray-500 mt-2">You don't seem to be managing any club at the moment.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'members', name: 'Members', icon: Users, badge: members.filter(m => m.status === 'pending').length },
        { id: 'events', name: 'Events', icon: Calendar },
        { id: 'settings', name: 'Settings', icon: Settings },
    ];

    return (
        <div className="space-y-6">
            {/* Club Header */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-700 relative">
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        {club.logo_url ? (
                            <img
                                src={club.logo_url}
                                alt={club.name}
                                className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-md object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gray-100 shadow-md flex items-center justify-center text-3xl font-bold text-gray-400">
                                {club.name[0].toUpperCase()}
                            </div>
                        )}
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge className="bg-blue-50 text-blue-600 border-blue-100">{club.category || 'Social'}</Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                                    <Building2 size={14} />
                                    {club.department_name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-16 pb-6 px-8 flex justify-end gap-3">
                    <Button variant="outline" size="sm" icon={Mail}>Contact Members</Button>
                    <Button variant="outline" size="sm" icon={Plus}>New Event</Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative",
                            activeTab === tab.id
                                ? "text-gray-900"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <tab.icon size={18} />
                        {tab.name}
                        {tab.badge > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                                {tab.badge}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Members</p>
                                    <p className="text-2xl font-bold text-gray-900">{members.filter(m => m.status === 'approved').length}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-green-600 font-medium">
                                <Activity size={14} />
                                <span>+{members.filter(m => m.status === 'pending').length} pending requests</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Events</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
                                <Clock size={14} />
                                <span>Upcoming events: {events.filter(e => new Date(e.start_time) > new Date()).length}</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Club Status</p>
                                    <p className="text-2xl font-bold text-gray-900">{club.status.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
                                <Target size={14} />
                                <span>Active since {new Date(club.created_at).getFullYear()}</span>
                            </div>
                        </div>

                        {/* Recent Activity or Quick View */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">About the Club</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {club.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Requests</h3>
                                <div className="space-y-4">
                                    {members.filter(m => m.status === 'pending').length > 0 ? (
                                        members.filter(m => m.status === 'pending').slice(0, 3).map(m => (
                                            <div key={m.student_user_id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                                                        {m.student_name?.[0] || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-900">{m.student_name}</p>
                                                        <p className="text-[10px] text-gray-500">{m.student_email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleUpdateMemberStatus(m.student_user_id, 'approved')}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateMemberStatus(m.student_user_id, 'rejected')}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 text-center py-4">No pending requests</p>
                                    )}
                                </div>
                                {members.filter(m => m.status === 'pending').length > 3 && (
                                    <button
                                        onClick={() => setActiveTab('members')}
                                        className="w-full mt-4 text-xs text-blue-600 font-medium hover:underline"
                                    >
                                        View all requests
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined At</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {members.map(member => (
                                    <tr key={member.student_user_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                                                    {member.student_name?.[0] || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{member.student_name}</p>
                                                    <p className="text-xs text-gray-500">{member.student_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 capitalize">{member.club_role || 'Member'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={cn(
                                                member.status === 'approved' ? "bg-green-50 text-green-700 border-green-100" :
                                                    member.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                        "bg-red-50 text-red-700 border-red-100"
                                            )}>
                                                {member.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(member.joined_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {member.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="xs" color="green" onClick={() => handleUpdateMemberStatus(member.student_user_id, 'approved')}>Approve</Button>
                                                    <Button size="xs" variant="outline" color="red" onClick={() => handleUpdateMemberStatus(member.student_user_id, 'rejected')}>Reject</Button>
                                                </div>
                                            ) : (
                                                <button className="text-gray-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {members.length === 0 && (
                            <div className="py-12 text-center">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No members yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Manage Events</h3>
                            <Button icon={Plus} size="sm">Create Event</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {events.map(event => (
                                <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                <span>{new Date(event.start_time).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <MapPin size={14} />
                                            <span>{event.location}</span>
                                        </div>
                                        <Badge className="bg-gray-100 text-gray-600">8 RSVPs</Badge>
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <div className="md:col-span-2 py-12 text-center bg-white border border-gray-200 rounded-xl">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h4 className="text-gray-900 font-medium">No events scheduled</h4>
                                    <p className="text-gray-500 mt-1">Share activities with your club members.</p>
                                    <Button className="mt-4" size="sm" icon={Plus}>Schedule First Event</Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Club Profile Settings</h3>
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Club Name</label>
                                <input
                                    type="text"
                                    defaultValue={club.name}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    rows={4}
                                    defaultValue={club.description}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button>Save Changes</Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClubManagementPage;
