import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { Search, ShoppingBag, Plus, Minus, Coffee, Flame, Star, Utensils, X, Wallet, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMenu, useOrders } from '../../src/hooks/useCafeteria';
import { useAuth } from '../../src/context/AuthContext';

const CATEGORIES = [
    { id: 'ALL', label: 'All', icon: Utensils },
    { id: 'BREAKFAST', label: 'Breakfast', icon: Coffee },
    { id: 'LUNCH', label: 'Lunch', icon: Flame },
    { id: 'DRINKS', label: 'Drinks', icon: Coffee },
    { id: 'SNACKS', label: 'Snacks', icon: Star },
];

export default function ExploreScreen() {
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState({});
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const { user, refreshUser } = useAuth();
    const { items, filteredItems, loading } = useMenu(activeCategory);
    const { placeOrder } = useOrders();
    const router = useRouter();

    const handleCheckout = async () => {
        if (totalPrice > parseFloat(user?.balance || 0)) {
            Alert.alert('Insufficient Balance', 'Please top up your wallet at the finance office.');
            return;
        }

        try {
            setIsPlacingOrder(true);
            const orderItems = Object.entries(cart).map(([id, quantity]) => {
                const item = items.find(i => i.id === id);
                return {
                    id,
                    quantity,
                    unit_price: parseFloat(item.price),
                    subtotal: parseFloat(item.price) * quantity
                };
            });

            await placeOrder({
                items: orderItems,
                total_amount: totalPrice,
                notes: ''
            });

            Alert.alert(
                'Order Success!',
                'Your order has been placed successfully.',
                [{
                    text: 'Great!', onPress: () => {
                        setCart({});
                        refreshUser();
                        setIsCheckoutModalOpen(false);
                        router.push('/orders');
                    }
                }]
            );
        } catch (error) {
            console.error('Checkout failed:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const updateCart = (itemId, delta) => {
        setCart(prev => {
            const newQty = (prev[itemId] || 0) + delta;
            if (newQty <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newQty };
        });
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.EXPO_PUBLIC_API_URL?.split('/api/v1')[0] || 'http://192.168.100.9:5000';
        return `${baseUrl}${url}`;
    };

    const finalFilteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = items.find(i => i.id === id);
        return sum + (item ? parseFloat(item.price) * qty : 0);
    }, 0);

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <Image
                source={item.image_url ? { uri: getImageUrl(item.image_url) } : require('../../assets/images/icon.png')}
                style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>{parseFloat(item.price).toFixed(2)} DH</Text>
                    <View style={styles.quantityControls}>
                        {cart[item.id] > 0 && (
                            <>
                                <TouchableOpacity onPress={() => updateCart(item.id, -1)} style={styles.qtyBtn}>
                                    <Minus size={16} color="#4B5563" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{cart[item.id]}</Text>
                            </>
                        )}
                        <TouchableOpacity onPress={() => updateCart(item.id, 1)} style={styles.qtyBtnPrimary}>
                            <Plus size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Digital Menu</Text>
                <TouchableOpacity style={styles.cartButton}>
                    <ShoppingBag size={24} color="#111827" />
                    {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Search size={20} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={{ height: 60, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryBtn, activeCategory === cat.id && styles.categoryBtnActive]}
                            onPress={() => setActiveCategory(cat.id)}
                        >
                            <cat.icon size={16} color={activeCategory === cat.id ? '#FFFFFF' : '#6B7280'} />
                            <Text style={[styles.categoryText, activeCategory === cat.id && styles.categoryTextActive]}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#111827" /></View>
            ) : (
                <FlatList
                    data={finalFilteredItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {cartCount > 0 && (
                <View style={styles.checkoutBar}>
                    <View>
                        <Text style={styles.checkoutTotalLabel}>Total Amount</Text>
                        <Text style={styles.checkoutTotalPrice}>{totalPrice.toFixed(2)} DH</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={() => setIsCheckoutModalOpen(true)}>
                        <Text style={styles.checkoutButtonText}>View Order</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={isCheckoutModalOpen} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Order Summary</Text>
                            <TouchableOpacity onPress={() => setIsCheckoutModalOpen(false)}>
                                <X size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalOrderList}>
                            {Object.entries(cart).map(([id, qty]) => {
                                const item = items.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <View key={id} style={styles.modalOrderItem}>
                                        <View style={styles.modalItemInfo}>
                                            <Text style={styles.modalItemName}>{item.name}</Text>
                                            <Text style={styles.modalItemQty}>x{qty}</Text>
                                        </View>
                                        <Text style={styles.modalItemPrice}>{(parseFloat(item.price) * qty).toFixed(2)} DH</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <View style={styles.walletStatus}>
                                <Wallet size={16} color="#6B7280" />
                                <Text style={styles.walletText}>Your Balance: {parseFloat(user?.balance || 0).toFixed(2)} DH</Text>
                            </View>
                            <View style={styles.modalTotalRow}>
                                <Text style={styles.modalTotalLabel}>Total Amount</Text>
                                <Text style={styles.modalTotalPrice}>{totalPrice.toFixed(2)} DH</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.confirmButton, totalPrice > parseFloat(user?.balance || 0) && styles.confirmButtonError]}
                                onPress={handleCheckout}
                                disabled={isPlacingOrder}
                            >
                                {isPlacingOrder ? <ActivityIndicator color="#FFFFFF" /> : (
                                    <>
                                        <CheckCircle2 size={20} color="#FFFFFF" />
                                        <Text style={styles.confirmButtonText}>
                                            {totalPrice > parseFloat(user?.balance || 0) ? 'Insufficient Funds' : 'Confirm & Pay'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
    cartButton: { width: 46, height: 46, backgroundColor: '#111827', borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    cartBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#EF4444', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
    cartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 24, paddingHorizontal: 16, height: 52, borderRadius: 16, borderWide: 1, borderColor: '#F1F5F9', marginBottom: 16, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1e293b' },
    categoryScroll: { paddingHorizontal: 24, gap: 10, alignItems: 'center' },
    categoryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    categoryBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
    categoryText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    categoryTextActive: { color: '#FFFFFF' },
    listContainer: { paddingHorizontal: 24, paddingBottom: 120 },
    itemCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 12, marginBottom: 16, shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
    itemImage: { width: 100, height: 100, borderRadius: 20, backgroundColor: '#F8FAFC' },
    itemInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 2 },
    itemName: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
    itemDescription: { fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 18 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    itemPrice: { fontSize: 18, fontWeight: '900', color: '#111827' },
    quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    qtyBtn: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    qtyBtnPrimary: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    qtyText: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    checkoutBar: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#111827', borderRadius: 24, padding: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
    checkoutTotalLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    checkoutTotalPrice: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
    checkoutButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    checkoutButtonText: { color: '#111827', fontWeight: '800', fontSize: 15 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
    modalOrderList: { marginBottom: 24 },
    modalOrderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalItemInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    modalItemName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    modalItemQty: { fontSize: 14, color: '#3B82F6', fontWeight: '800', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    modalItemPrice: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    modalFooter: { gap: 16 },
    walletStatus: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    walletText: { fontSize: 13, color: '#64748b', fontWeight: '700' },
    modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    modalTotalLabel: { fontSize: 18, color: '#64748b', fontWeight: '600' },
    modalTotalPrice: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
    confirmButton: { backgroundColor: '#111827', height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    confirmButtonError: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
    confirmButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});

