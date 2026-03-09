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
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import cafeteriaService from '../features/cafeteria/services/cafeteriaService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const CafeteriaPage = () => {
    const [items, setItems] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const categories = ['ALL', 'BREAKFAST', 'LUNCH', 'DRINKS', 'SNACKS'];

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
            fetchData(); // Refresh wallet and orders
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed');
        }
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && item.is_available;
    });

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/api/v1')[0] : 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading Menu...</div>;

    return (
        <div className="space-y-6">
            {/* Header & Wallet Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Coffee className="text-amber-600" />
                        Digital Menu
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Order your meals and pick them up when ready.</p>
                </div>

                <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Cafeteria Wallet</p>
                        <p className="text-xl font-bold text-amber-900">{parseFloat(wallet?.balance || 0).toFixed(2)} DH</p>
                    </div>
                    <Button variant="outline" className="ml-2 border-amber-200 text-amber-700 hover:bg-amber-100">
                        Top Up
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Menu Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search food, drinks..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
                                        }`}
                                >
                                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredItems.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={item.id}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                                        {item.image_url ? (
                                            <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                <Coffee size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                            <Badge variant="gray" className="text-[10px]">{item.category}</Badge>
                                        </div>
                                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">{parseFloat(item.price).toFixed(2)} DH</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Cart & Recent Orders */}
                <div className="space-y-6">
                    {/* Cart Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-fit">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingCart size={18} />
                                Your Tray
                            </h3>
                            <Badge variant="blue">{cart.length} items</Badge>
                        </div>

                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-2">
                                        <ShoppingCart size={24} />
                                    </div>
                                    <p className="text-gray-400 text-sm">Your tray is empty.</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <Coffee size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2 border border-gray-100 rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:bg-gray-50 rounded text-gray-500">
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:bg-gray-50 rounded text-gray-500">
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{(parseFloat(item.price) * item.quantity).toFixed(2)} DH</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-semibold text-gray-900">{total.toFixed(2)} DH</span>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    fullWidth
                                    className="bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-200"
                                >
                                    Confirm Order ({total.toFixed(2)} DH)
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Clock size={18} />
                                Recent Orders
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {orders.length === 0 ? (
                                <p className="p-6 text-center text-gray-400 text-sm">No orders yet.</p>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">#{order.id.slice(-4)}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">{new Date(order.created_at).toLocaleTimeString()}</p>
                                            </div>
                                            <Badge
                                                variant={
                                                    order.status === 'READY' ? 'green' :
                                                        order.status === 'PREPARING' ? 'blue' :
                                                            'gray'
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Total Charged</span>
                                            <span className="font-bold text-gray-900">{parseFloat(order.total_amount).toFixed(2)} DH</span>
                                        </div>
                                        {order.status === 'READY' && (
                                            <div className="mt-2 text-[10px] font-bold text-green-600 flex items-center gap-1 animate-pulse">
                                                <CheckCircle2 size={12} />
                                                Ready for pickup!
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
