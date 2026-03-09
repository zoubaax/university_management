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
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 40 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
    cartButton: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', position: 'relative' },
    cartBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    cartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 24, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' },
    categoryScroll: { paddingHorizontal: 24, gap: 8, alignItems: 'center' },
    categoryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    categoryBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
    categoryText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    categoryTextActive: { color: '#FFFFFF' },
    listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
    itemCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    itemImage: { width: 90, height: 90, borderRadius: 16, backgroundColor: '#F3F4F6' },
    itemInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
    itemName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    itemDescription: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    itemPrice: { fontSize: 16, fontWeight: '800', color: '#111827' },
    quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    qtyBtn: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    qtyBtnPrimary: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
    qtyText: { fontSize: 16, fontWeight: '700', color: '#111827' },
    checkoutBar: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    checkoutTotalLabel: { fontSize: 12, color: '#6B7280' },
    checkoutTotalPrice: { fontSize: 18, fontWeight: '800', color: '#111827' },
    checkoutButton: { backgroundColor: '#111827', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    checkoutButtonText: { color: '#FFFFFF', fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
    modalOrderList: { marginBottom: 24 },
    modalOrderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalItemInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    modalItemName: { fontSize: 16, fontWeight: '600', color: '#111827' },
    modalItemQty: { fontSize: 14, color: '#6B7280', fontWeight: '700' },
    modalItemPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },
    modalFooter: { gap: 16 },
    walletStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    walletText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
    modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTotalLabel: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
    modalTotalPrice: { fontSize: 24, fontWeight: '900', color: '#111827' },
    confirmButton: { backgroundColor: '#111827', height: 60, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    confirmButtonError: { backgroundColor: '#EF4444' },
    confirmButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
