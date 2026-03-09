import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    Edit2,
    CheckCircle2,
    Utensils,
    Search,
    Package,
    Flame,
    MoreHorizontal,
    X,
    Save,
    Clock,
    Wallet,
    User,
    ArrowRight,
    Loader2,
    Coffee,
    TrendingUp,
    Award,
    Bell,
    AlertCircle,
    CheckCircle,
    XCircle,
    Users,
    ShoppingBag
} from 'lucide-react';
import cafeteriaService from '../features/cafeteria/services/cafeteriaService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const CafeteriaManagementPage = () => {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { view } = useParams();
    const navigate = useNavigate();
    const activeTab = (view || 'orders').toUpperCase();
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [currentMeal, setCurrentMeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [rechargeAmount, setRechargeAmount] = useState('50');
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchOrders();
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'WALLETS') {
            const timer = setTimeout(() => {
                if (userSearchQuery.trim().length >= 2) {
                    handleSearchUsers();
                } else if (userSearchQuery.trim().length === 0) {
                    setUserSearchResults([]);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [userSearchQuery, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, ordersRes] = await Promise.all([
                cafeteriaService.getItems(),
                cafeteriaService.getOrders({ status: ['PENDING', 'PREPARING', 'READY'] })
            ]);
            setItems(itemsRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            toast.error('Failed to load cafeteria data');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const ordersRes = await cafeteriaService.getOrders({ status: ['PENDING', 'PREPARING', 'READY'] });
            setOrders(ordersRes.data);
        } catch (err) {
            console.error('Failed to poll orders:', err);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await cafeteriaService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update order status');
        }
    };

    const handleSaveMeal = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const isAvailable = formData.get('is_available') === 'on';
        formData.set('is_available', isAvailable);

        try {
            if (currentMeal) {
                await cafeteriaService.updateItem(currentMeal.id, formData);
                toast.success('Meal updated');
            } else {
                await cafeteriaService.createItem(formData);
                toast.success('Meal added to menu');
            }
            setIsMealModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save meal');
        }
    };

    const handleDeleteMeal = async (id) => {
        if (!window.confirm('Are you sure you want to remove this item from the menu?')) return;
        try {
            await cafeteriaService.deleteItem(id);
            toast.success('Meal removed');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete meal');
        }
    };

    const handleSearchUsers = async () => {
        if (!userSearchQuery) return;
        setIsSearchingUsers(true);
        try {
            const res = await cafeteriaService.searchUsers(userSearchQuery);
            setUserSearchResults(res.data || []);
        } catch (err) {
            console.error('User search failed error:', err);
            toast.error('User search failed');
        } finally {
            setIsSearchingUsers(false);
        }
    };

    const handleRechargeUser = async (e) => {
        e.preventDefault();
        try {
            await cafeteriaService.rechargeWallet(selectedUser.id, parseFloat(rechargeAmount));
            toast.success(`Refilled ${rechargeAmount} DH to ${selectedUser.first_name}'s wallet`);
            setIsRechargeModalOpen(false);
            if (activeTab === 'WALLETS') handleSearchUsers();
        } catch (err) {
            toast.error('Recharge failed');
        }
    };

    const orderStats = {
        pending: orders.filter(o => o.status === 'PENDING').length,
        preparing: orders.filter(o => o.status === 'PREPARING').length,
        ready: orders.filter(o => o.status === 'READY').length
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/api/v1')[0] : 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PREPARING':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'READY':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getAvailabilityColor = (isAvailable) => {
        return isAvailable
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-red-100 text-red-700 border-red-200';
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading cafeteria management...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cafeteria Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {activeTab === 'ORDERS' && 'Monitor and update kitchen orders in real-time'}
                        {activeTab === 'WALLETS' && 'Search students and manage prepaid balances'}
                        {activeTab === 'MENU' && 'Add, edit, or remove items from the digital menu'}
                    </p>
                </div>

                {activeTab === 'MENU' && (
                    <Button
                        onClick={() => { setCurrentMeal(null); setIsMealModalOpen(true); }}
                        icon={Plus}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        Add New Meal
                    </Button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px space-x-8">
                    {[
                        { id: 'ORDERS', label: 'Orders', icon: ShoppingBag },
                        { id: 'MENU', label: 'Menu', icon: Utensils },
                        { id: 'WALLETS', label: 'Wallets', icon: Wallet },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => navigate(`/cafeteria-management/${tab.id.toLowerCase()}`)}
                            className={cn(
                                "py-4 px-1 border-b-2 font-medium text-sm transition-colors relative flex items-center gap-2",
                                activeTab === tab.id
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'ORDERS' ? (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">{orderStats.pending}</p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <Package className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">In Preparation</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">{orderStats.preparing}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Flame className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Ready for Pickup</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">{orderStats.ready}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Board */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {orders.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-white border border-gray-200 rounded-xl">
                                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No active orders</p>
                                    <p className="text-xs text-gray-400 mt-1">Kitchen is quiet</p>
                                </div>
                            ) : orders.map(order => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    key={order.id}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                                >
                                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Order #{order.id.slice(-6)}</span>
                                            <Badge className={`text-[10px] ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock size={12} />
                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                                {order.first_name?.[0] || 'U'}{order.last_name?.[0] || ''}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {order.first_name || 'User'} {order.last_name || ''}
                                                </p>
                                                <p className="text-xs text-gray-500">{order.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order Summary</p>
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Total: {parseFloat(order.total_amount).toFixed(2)} DH
                                                </p>
                                                {order.notes && (
                                                    <p className="text-xs text-amber-600 mt-1 font-medium">
                                                        Note: {order.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-2">
                                        {order.status === 'PENDING' && (
                                            <Button
                                                onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                                                size="sm"
                                                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.status === 'PREPARING' && (
                                            <Button
                                                onClick={() => handleUpdateStatus(order.id, 'READY')}
                                                size="sm"
                                                className="col-span-2 bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                Mark as Ready
                                            </Button>
                                        )}
                                        {order.status === 'READY' && (
                                            <Button
                                                onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                                size="sm"
                                                className="col-span-2 bg-gray-900 hover:bg-gray-800 text-white"
                                            >
                                                Complete Order
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ) : activeTab === 'WALLETS' ? (
                <div className="space-y-6">
                    {/* Search Section */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Wallet size={18} className="text-amber-600" />
                            Quick Wallet Recharge
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Search for a student or staff member by name or email to add funds to their cafeteria wallet.
                        </p>

                        <div className="flex gap-3 max-w-xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter student name or email..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                                />
                                {isSearchingUsers && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={handleSearchUsers}
                                disabled={isSearchingUsers}
                                className="bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                {isSearchingUsers ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </div>

                    {/* Search Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userSearchResults.length === 0 && userSearchQuery.trim().length >= 2 && !isSearchingUsers && (
                            <div className="col-span-full py-16 text-center bg-white border border-gray-200 rounded-xl">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No users found</p>
                                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                            </div>
                        )}
                        {userSearchResults.map(u => (
                            <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg border border-gray-200">
                                        {u.first_name?.[0]}{u.last_name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{u.first_name} {u.last_name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                    </div>
                                </div>

                                <Badge className="bg-gray-100 text-gray-700 border-gray-200 mb-4">
                                    {u.role_name}
                                </Badge>

                                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">Balance</p>
                                        <p className="text-lg font-semibold text-gray-900">{parseFloat(u.balance || 0).toFixed(2)} DH</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                        icon={Plus}
                                        onClick={() => { setSelectedUser(u); setIsRechargeModalOpen(true); }}
                                    >
                                        Add Funds
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // MENU Tab
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-gray-200">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                                    {item.image_url ? (
                                                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Utensils size={16} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px]">
                                                {item.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {parseFloat(item.price).toFixed(2)} DH
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`text-[10px] ${getAvailabilityColor(item.is_available)}`}>
                                                {item.is_available ? 'Available' : 'Sold Out'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => { setCurrentMeal(item); setIsMealModalOpen(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMeal(item.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <Utensils className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No menu items found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Meal Modal */}
            <Modal
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                title={currentMeal ? 'Edit Meal' : 'Add New Meal'}
                subtitle={currentMeal ? 'Update meal details' : 'Create a new menu item'}
                size="md"
            >
                <form onSubmit={handleSaveMeal} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Meal Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={currentMeal?.name}
                            required
                            placeholder="e.g. Grilled Chicken Panini"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Price (DH)</label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                min="0"
                                defaultValue={currentMeal?.price}
                                required
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                defaultValue={currentMeal?.category || 'LUNCH'}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                            >
                                <option value="BREAKFAST">Breakfast</option>
                                <option value="LUNCH">Lunch</option>
                                <option value="DRINKS">Drinks</option>
                                <option value="SNACKS">Snacks</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Meal Photo</label>
                        {currentMeal?.image_url && (
                            <div className="mb-2">
                                <img
                                    src={getImageUrl(currentMeal.image_url)}
                                    alt="preview"
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            name="meal_photo"
                            accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            defaultValue={currentMeal?.description}
                            placeholder="Describe the ingredients or details..."
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                        />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_available"
                            defaultChecked={currentMeal ? currentMeal.is_available : true}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700">Available on Menu</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="outline" onClick={() => setIsMealModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                            {currentMeal ? 'Update Meal' : 'Create Meal'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Recharge Modal */}
            <Modal
                isOpen={isRechargeModalOpen}
                onClose={() => setIsRechargeModalOpen(false)}
                title="Recharge Wallet"
                subtitle={`Add funds to ${selectedUser?.first_name}'s wallet`}
                size="md"
            >
                <form onSubmit={handleRechargeUser} className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <User size={16} className="text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-900">{selectedUser?.first_name} {selectedUser?.last_name}</p>
                                <p className="text-xs text-amber-700">{selectedUser?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Amount (DH)</label>
                        <input
                            type="number"
                            min="1"
                            step="10"
                            value={rechargeAmount}
                            onChange={(e) => setRechargeAmount(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="outline" onClick={() => setIsRechargeModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                            Confirm Recharge
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CafeteriaManagementPage;