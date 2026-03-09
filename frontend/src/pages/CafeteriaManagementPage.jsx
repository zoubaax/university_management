import React, { useState, useEffect } from 'react';
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
    Clock
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

const CafeteriaManagementPage = () => {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ORDERS'); // ORDERS or MENU
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [currentMeal, setCurrentMeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
        // Set up interval for orders polling
        const interval = setInterval(() => {
            fetchOrders();
        }, 15000); // 15 seconds
        return () => clearInterval(interval);
    }, []);

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

        // Convert checkbox to proper boolean for the backend if needed, 
        // but FormData.get('is_available') will be 'on' or null.
        // If your backend handles FormData, 'on' is usually fine or you can manual set it.
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

    if (loading) return <div className="flex items-center justify-center h-64">Loading Management...</div>;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-900 text-white rounded-xl">
                        <Utensils size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Cafeteria Hub</h2>
                        <p className="text-gray-500 text-sm">Manage menu items and student orders in real-time.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                        onClick={() => setActiveTab('ORDERS')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'ORDERS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Live Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('MENU')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'MENU' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Menu Editor
                    </button>
                </div>
            </div>

            {activeTab === 'ORDERS' ? (
                <div className="space-y-6">
                    {/* Stats Bricks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Pending', count: orderStats.pending, color: 'text-gray-600', bg: 'bg-gray-50', icon: Package },
                            { label: 'In Preparation', count: orderStats.preparing, color: 'text-blue-600', bg: 'bg-blue-50', icon: Flame },
                            { label: 'Ready for Pickup', count: orderStats.ready, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} p-6 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between`}>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                                    <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
                                </div>
                                <stat.icon className={`opacity-20 ${stat.color}`} size={48} />
                            </div>
                        ))}
                    </div>

                    {/* Orders Board (KDS) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {orders.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-gray-400 font-medium">Kitchen is quiet. No active orders.</p>
                                </div>
                            ) : orders.map(order => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={order.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                                >
                                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-900">#{order.id.slice(-4)}</span>
                                            <Badge variant={order.status === 'READY' ? 'green' : 'blue'}>{order.status}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                                            <Clock size={12} />
                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm">
                                                {order.first_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{order.first_name || 'User'} {order.last_name || ''}</p>
                                                <p className="text-xs text-gray-500">{order.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Content</p>
                                            {/* We should ideally fetch items for each order in the board, or map them if included in response */}
                                            {/* For now, assuming direct order items aren't nested in the list view, but let's assume they are or show total */}
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm font-medium text-gray-700">Total: {parseFloat(order.total_amount).toFixed(2)} DH</p>
                                                {order.notes && <p className="text-xs text-amber-600 mt-1 font-medium">Note: {order.notes}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50/50 grid grid-cols-2 gap-2">
                                        {order.status === 'PENDING' && (
                                            <Button
                                                onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                                                size="sm"
                                                className="col-span-2 bg-blue-600 hover:bg-blue-700"
                                            >
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.status === 'PREPARING' && (
                                            <Button
                                                onClick={() => handleUpdateStatus(order.id, 'READY')}
                                                size="sm"
                                                className="col-span-2 bg-green-600 hover:bg-green-700"
                                            >
                                                Mark as Ready
                                            </Button>
                                        )}
                                        {order.status === 'READY' && (
                                            <Button
                                                onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                                size="sm"
                                                className="col-span-2 bg-gray-900 hover:bg-gray-800"
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
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => { setCurrentMeal(null); setIsMealModalOpen(true); }} className="flex items-center gap-2">
                            <Plus size={20} />
                            Add New Meal
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center text-gray-400">
                                                    {item.image_url ? (
                                                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Utensils size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="gray">{item.category}</Badge>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {parseFloat(item.price).toFixed(2)} DH
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={item.is_available ? 'green' : 'red'}>
                                                {item.is_available ? 'Available' : 'Sold Out'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => { setCurrentMeal(item); setIsMealModalOpen(true); }}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMeal(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
            >
                <form onSubmit={handleSaveMeal} className="space-y-4 pt-4">
                    <Input
                        label="Meal Name"
                        name="name"
                        defaultValue={currentMeal?.name}
                        required
                        placeholder="e.g. Grilled Chicken Panini"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price (DH)"
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={currentMeal?.price}
                            required
                        />
                        <Select
                            label="Category"
                            name="category"
                            defaultValue={currentMeal?.category || 'LUNCH'}
                            options={[
                                { value: 'BREAKFAST', label: 'Breakfast' },
                                { value: 'LUNCH', label: 'Lunch' },
                                { value: 'DRINKS', label: 'Drinks' },
                                { value: 'SNACKS', label: 'Snacks' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Meal Photo</label>
                        {currentMeal?.image_url && (
                            <div className="w-20 h-20 mb-2 rounded-lg overflow-hidden border border-gray-100">
                                <img src={getImageUrl(currentMeal.image_url)} alt="preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <input
                            type="file"
                            name="meal_photo"
                            accept="image/*"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        />
                    </div>

                    <Textarea
                        label="Description"
                        name="description"
                        defaultValue={currentMeal?.description}
                        placeholder="Describe the ingredients or details..."
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_available"
                            defaultChecked={currentMeal ? currentMeal.is_available : true}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm font-medium text-gray-700">Available on Menu</span>
                    </label>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsMealModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gray-900">
                            {currentMeal ? 'Update Meal' : 'Create Meal'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CafeteriaManagementPage;
