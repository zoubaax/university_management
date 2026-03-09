import React, { useState, useEffect } from 'react';
import {
    Coffee,
    Search,
    Filter,
    ShoppingCart,
    Wallet,
    Clock,
    CheckCircle2,
    ChevronRight,
    Plus,
    Minus,
    X,
    Loader2,
    TrendingUp,
    Award,
    Bell,
    Zap,
    Tag,
    Star,
    Flame,
    Coffee as CoffeeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import cafeteriaService from '../features/cafeteria/services/cafeteriaService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const CafeteriaPage = () => {
    const [items, setItems] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth();

    const categories = [
        { id: 'ALL', label: 'All Items', icon: Coffee },
        { id: 'BREAKFAST', label: 'Breakfast', icon: CoffeeIcon },
        { id: 'LUNCH', label: 'Lunch', icon: Flame },
        { id: 'DRINKS', label: 'Drinks', icon: CoffeeIcon },
        { id: 'SNACKS', label: 'Snacks', icon: Star }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [itemsRes, walletRes, ordersRes] = await Promise.all([
                cafeteriaService.getItems(),
                cafeteriaService.getWallet(),
                cafeteriaService.getOrders({ limit: 5 })
            ]);
            setItems(itemsRes.data);
            setWallet(walletRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            toast.error('Failed to load cafeteria data');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success(`${item.name} added to cart`);
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const handleCheckout = async () => {
        if (parseFloat(wallet?.balance) < total) {
            toast.error('Insufficient wallet balance');
            return;
        }

        try {
            const orderData = {
                items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
                notes: ''
            };
            await cafeteriaService.placeOrder(orderData);
            toast.success('Order placed successfully!');
            setCart([]);
            setIsCartOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed');
        }
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch && item.is_available;
    });

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/api/v1')[0] : 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'READY':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PREPARING':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading cafeteria menu...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Wallet Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cafeteria</h1>
                    <p className="text-sm text-gray-500 mt-1">Order your meals and pick them up when ready</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Wallet className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Wallet Balance</p>
                        <p className="text-xl font-semibold text-gray-900">{parseFloat(wallet?.balance || 0).toFixed(2)} DH</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Available Items</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{items.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Coffee className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Orders</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {orders.filter(o => o.status !== 'READY').length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Cart Items</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{cart.length}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <ShoppingCart className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Today</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)} DH
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Award className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Menu Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters & Search */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search food, drinks..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                {categories.map(cat => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                                activeCategory === cat.id
                                                    ? "bg-gray-900 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )}
                                        >
                                            <Icon size={16} />
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Menu Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Coffee className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {filteredItems.map(item => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        key={item.id}
                                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                {item.image_url ? (
                                                    <img
                                                        src={getImageUrl(item.image_url)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Coffee size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                                    <Badge className="text-[10px] bg-gray-100 text-gray-700 border-gray-200">
                                                        {item.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg font-bold text-gray-900">{parseFloat(item.price).toFixed(2)}</span>
                                                        <span className="text-xs text-gray-500">DH</span>
                                                    </div>
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Sidebar: Cart & Recent Orders */}
                <div className="space-y-6">
                    {/* Cart Section */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-6">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <ShoppingCart size={18} />
                                    Your Cart
                                </h3>
                                <Badge className="bg-gray-900 text-white border-gray-900">
                                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <ShoppingCart size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">Your cart is empty</p>
                                    <p className="text-xs text-gray-400 mt-1">Add items from the menu to get started</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                                            <Coffee size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="p-0.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="p-0.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {(parseFloat(item.price) * item.quantity).toFixed(2)} DH
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-gray-600">Total</span>
                                    <span className="font-semibold text-gray-900">{total.toFixed(2)} DH</span>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Checkout ({total.toFixed(2)} DH)
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Clock size={18} />
                                Recent Orders
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No orders yet</p>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(order.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <Badge className={`text-[10px] ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">{order.items?.length || 0} items</span>
                                            <span className="font-semibold text-gray-900">
                                                {parseFloat(order.total_amount).toFixed(2)} DH
                                            </span>
                                        </div>
                                        {order.status === 'READY' && (
                                            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle2 size={12} />
                                                Ready for pickup
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CafeteriaPage;