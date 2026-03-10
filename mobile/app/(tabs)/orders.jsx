import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { ShoppingBag, Clock, CheckCircle2, Package, ListTodo } from 'lucide-react-native';
import { useOrders } from '../../src/hooks/useCafeteria';

export default function OrdersScreen() {
    const { orders, loading, refreshing, onRefresh } = useOrders();

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#F59E0B';
            case 'PREPARING': return '#3B82F6';
            case 'READY': return '#10B981';
            case 'COMPLETED': return '#6B7280';
            case 'CANCELLED': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{item.id.slice(-4)}</Text>
                    <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.itemsList}>
                {item.items?.map((orderItem, idx) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemQty}>{orderItem.quantity}x</Text>
                        <Text style={styles.itemName}>{orderItem.name || 'Item'}</Text>
                        <Text style={styles.itemPrice}>{parseFloat(orderItem.subtotal).toFixed(2)} DH</Text>
                    </View>
                ))}
            </View>

            <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalPrice}>{parseFloat(item.total_amount).toFixed(2)} DH</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Order History</Text>
                <Text style={styles.headerSubtitle}>Track your cafeteria orders</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#111827" /></View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <ListTodo size={48} color="#E5E7EB" />
                            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    orderCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, marginBottom: 16, shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    orderId: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
    orderDate: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    itemsList: { paddingVertical: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12 },
    itemQty: { fontSize: 12, fontWeight: '800', color: '#3B82F6', width: 30 },
    itemName: { fontSize: 14, color: '#1e293b', fontWeight: '600', flex: 1 },
    itemPrice: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16, marginTop: 8 },
    totalLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    totalPrice: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { marginTop: 80, alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { color: '#94a3b8', fontSize: 15, marginTop: 16, textAlign: 'center', lineHeight: 22 },
});

