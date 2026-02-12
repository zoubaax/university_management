import React, { useState, useEffect } from 'react';
import {
    Mail,
    Send,
    Inbox,
    Star,
    Trash2,
    Search,
    Plus,
    Loader2,
    MailOpen,
    Clock,
    User,
    X,
    Check,
    Paperclip,
    Reply,
    Archive,
    AlertCircle,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    FileText,
    Download,
    UserCircle,
    Building2,
    Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import messageService from '../api/services/messageService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const MessagesPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showCompose, setShowCompose] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [filterUnread, setFilterUnread] = useState(false);
    const [filterStarred, setFilterStarred] = useState(false);

    useEffect(() => {
        fetchMessages();
        fetchUnreadCount();
    }, [activeTab]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = activeTab === 'inbox'
                ? await messageService.getInbox()
                : await messageService.getSent();
            setMessages(data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await messageService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMessageClick = async (message) => {
        setSelectedMessage(message);

        if (activeTab === 'inbox' && !message.is_read) {
            try {
                await messageService.markAsRead(message.id);
                setMessages(prev => prev.map(m =>
                    m.id === message.id ? { ...m, is_read: true } : m
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDelete = async (messageId, e) => {
        e.stopPropagation();

        try {
            await messageService.delete(messageId);
            setMessages(prev => prev.filter(m => m.id !== messageId));
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(null);
            }
            toast.success('Message deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete message');
        }
    };

    const handleStar = async (messageId, e) => {
        e.stopPropagation();

        try {
            const msg = messages.find(m => m.id === messageId);
            await messageService.toggleStar(messageId);
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, is_starred: !m.is_starred } : m
            ));
            toast.success(msg?.is_starred ? 'Message unstarred' : 'Message starred');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update message');
        }
    };

    const filteredMessages = messages.filter(msg => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const name = activeTab === 'inbox' ? msg.sender_name : msg.recipient_name;
            const matches =
                name?.toLowerCase().includes(query) ||
                msg.subject?.toLowerCase().includes(query) ||
                msg.body?.toLowerCase().includes(query);
            if (!matches) return false;
        }

        // Unread filter
        if (filterUnread && activeTab === 'inbox' && msg.is_read) {
            return false;
        }

        // Starred filter
        if (filterStarred && !msg.is_starred) {
            return false;
        }

        return true;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: diffDays > 365 ? 'numeric' : undefined
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Communicate with students, professors, and staff
                    </p>
                </div>
                <Button
                    onClick={() => setShowCompose(true)}
                    icon={Plus}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                    Compose Message
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50">
                    <div className="p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                activeTab === 'inbox'
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <Inbox size={18} />
                            <span className="flex-1 text-left">Inbox</span>
                            {unreadCount > 0 && (
                                <Badge className={cn(
                                    "px-2 py-0.5 text-xs",
                                    activeTab === 'inbox'
                                        ? "bg-white text-gray-900"
                                        : "bg-gray-900 text-white"
                                )}>
                                    {unreadCount}
                                </Badge>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('sent')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                activeTab === 'sent'
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <Send size={18} />
                            <span className="flex-1 text-left">Sent</span>
                        </button>

                        <button
                            onClick={() => {
                                setFilterStarred(!filterStarred);
                                setFilterUnread(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                filterStarred
                                    ? "bg-amber-50 text-amber-700"
                                    : "text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <Star size={18} className={filterStarred ? "fill-amber-500 text-amber-500" : ""} />
                            <span className="flex-1 text-left">Starred</span>
                        </button>
                    </div>

                    <div className="mt-auto p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserCircle className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.first_name || user?.email}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.role_name?.replace('_', ' ') || 'User'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message List */}
                <div className="flex-1 flex flex-col">
                    {/* Search & Filters */}
                    <div className="p-4 border-b border-gray-200 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search messages by sender, subject, or content..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilterUnread(!filterUnread)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5",
                                        filterUnread
                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    <Mail size={14} />
                                    Unread only
                                </button>
                                {filterUnread && (
                                    <button
                                        onClick={() => setFilterUnread(false)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                <p className="text-sm">Loading messages...</p>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                <Mail className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium text-gray-500">No messages</p>
                                <p className="text-sm text-gray-400 mt-1 max-w-sm text-center">
                                    {searchQuery || filterUnread || filterStarred
                                        ? 'Try adjusting your filters'
                                        : activeTab === 'inbox'
                                            ? 'Your inbox is empty. Start a conversation!'
                                            : 'No sent messages yet'}
                                </p>
                                {!searchQuery && !filterUnread && !filterStarred && (
                                    <Button
                                        onClick={() => setShowCompose(true)}
                                        variant="outline"
                                        className="mt-6"
                                        icon={Plus}
                                    >
                                        Compose First Message
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredMessages.map((message) => {
                                    const displayName = activeTab === 'inbox'
                                        ? message.sender_name
                                        : message.recipient_name;
                                    const displayRole = activeTab === 'inbox'
                                        ? message.sender_role
                                        : message.recipient_role;
                                    const isUnread = activeTab === 'inbox' && !message.is_read;

                                    return (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={() => handleMessageClick(message)}
                                            className={cn(
                                                "p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group",
                                                isUnread && "bg-blue-50/30 hover:bg-blue-50"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-medium",
                                                    isUnread
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-600"
                                                )}>
                                                    {getInitials(displayName)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={cn(
                                                            "text-sm truncate",
                                                            isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                                                        )}>
                                                            {displayName}
                                                        </p>
                                                        {displayRole && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                                                {displayRole}
                                                            </Badge>
                                                        )}
                                                        {message.is_starred && (
                                                            <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                                        )}
                                                    </div>

                                                    <p className={cn(
                                                        "text-sm mb-1 truncate",
                                                        isUnread ? "font-medium text-gray-900" : "text-gray-600"
                                                    )}>
                                                        {message.subject}
                                                    </p>

                                                    <p className="text-xs text-gray-500 truncate">
                                                        {message.body}
                                                    </p>
                                                </div>

                                                {/* Date & Actions */}
                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatDate(message.created_at)}
                                                    </span>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => handleStar(message.id, e)}
                                                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                                            title={message.is_starred ? "Unstar" : "Star"}
                                                        >
                                                            <Star
                                                                size={14}
                                                                className={message.is_starred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(message.id, e)}
                                                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} className="text-gray-400 hover:text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <MessageDetailModal
                        message={selectedMessage}
                        onClose={() => setSelectedMessage(null)}
                        onReply={() => {
                            setShowCompose(true);
                            setSelectedMessage(null);
                        }}
                        onDelete={() => handleDelete(selectedMessage.id, { stopPropagation: () => { } })}
                        onStar={() => handleStar(selectedMessage.id, { stopPropagation: () => { } })}
                        activeTab={activeTab}
                    />
                )}
            </AnimatePresence>

            {/* Compose Modal */}
            <AnimatePresence>
                {showCompose && (
                    <ComposeMessageModal
                        onClose={() => setShowCompose(false)}
                        onSent={() => {
                            setShowCompose(false);
                            if (activeTab === 'sent') {
                                fetchMessages();
                            }
                            toast.success('Message sent successfully');
                        }}
                        replyTo={selectedMessage}
                        userRole={user?.role_name}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Message Detail Modal Component
const MessageDetailModal = ({ message, onClose, onReply, onDelete, onStar, activeTab }) => {
    const displayName = activeTab === 'inbox' ? message.sender_name : message.recipient_name;
    const displayEmail = activeTab === 'inbox' ? message.sender_email : message.recipient_email;
    const displayRole = activeTab === 'inbox' ? message.sender_role : message.recipient_role;

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {message.subject}
                        </h2>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onStar}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={message.is_starred ? "Unstar" : "Star"}
                        >
                            <Star
                                size={18}
                                className={message.is_starred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                            />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} className="text-gray-400 hover:text-red-600" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Sender Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-medium text-blue-700">
                            {getInitials(displayName)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                                {displayRole && (
                                    <Badge variant="outline" className="text-xs">
                                        {displayRole}
                                    </Badge>
                                )}
                                {message.is_starred && (
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="prose prose-sm max-w-none">
                        {message.body.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {/* Attachments Placeholder */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                            Attachments
                        </p>
                        <div className="flex items-center gap-3 text-gray-400">
                            <Paperclip size={16} />
                            <span className="text-sm">No attachments</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                {activeTab === 'inbox' && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            onClick={onReply}
                            icon={Reply}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Reply
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// Compose Message Modal Component
const ComposeMessageModal = ({ onClose, onSent, replyTo, userRole }) => {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [formData, setFormData] = useState({
        recipient_id: replyTo?.sender_id || '',
        recipient_type: replyTo?.sender_type || '',
        recipient_name: replyTo?.sender_name || '',
        subject: replyTo ? `Re: ${replyTo.subject}` : '',
        body: replyTo ? `\n\n--- Original Message ---\nFrom: ${replyTo.sender_name}\nDate: ${new Date(replyTo.created_at).toLocaleString()}\n\n${replyTo.body}` : ''
    });

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const results = await messageService.searchUsers(query);
            setSearchResults(results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const selectRecipient = (user) => {
        setFormData(prev => ({
            ...prev,
            recipient_id: user.id,
            recipient_type: user.user_type,
            recipient_name: user.name
        }));
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.recipient_id) {
            toast.error('Please select a recipient');
            return;
        }

        if (!formData.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        if (!formData.body.trim()) {
            toast.error('Please enter a message');
            return;
        }

        try {
            setLoading(true);
            await messageService.send({
                recipient_id: formData.recipient_id,
                recipient_type: formData.recipient_type,
                subject: formData.subject.trim(),
                body: formData.body.trim()
            });
            onSent();
        } catch (err) {
            console.error(err);
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {replyTo ? 'Reply to Message' : 'New Message'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Recipient */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            To <span className="text-red-500">*</span>
                        </label>
                        {formData.recipient_id ? (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <User size={16} className="text-blue-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-blue-900 truncate">{formData.recipient_name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        recipient_id: '',
                                        recipient_type: '',
                                        recipient_name: ''
                                    }))}
                                    className="p-1.5 hover:bg-blue-200 rounded-lg transition-colors"
                                >
                                    <X size={14} className="text-blue-700" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search for users by name, email, or role..."
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    {searching && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                                        {searchResults.map((user) => (
                                            <button
                                                key={`${user.user_type}-${user.id}`}
                                                type="button"
                                                onClick={() => selectRecipient(user)}
                                                className="w-full p-3 hover:bg-gray-50 text-left flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User size={14} className="text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email} • {user.role}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {user.user_type}
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter message subject..."
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        />
                    </div>

                    {/* Message Body */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
                            rows={12}
                            placeholder="Type your message here..."
                            value={formData.body}
                            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                        />
                        <p className="text-xs text-gray-500 text-right">
                            {formData.body.length} characters
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        icon={Send}
                        disabled={loading || !formData.recipient_id || !formData.subject.trim() || !formData.body.trim()}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </span>
                        ) : (
                            'Send Message'
                        )}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MessagesPage;