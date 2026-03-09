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
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 24, paddingTop: 40 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
    headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    orderCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    orderId: { fontSize: 16, fontWeight: '700', color: '#111827' },
    orderDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '800' },
    itemsList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', paddingVertical: 12, marginBottom: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    itemQty: { fontSize: 12, fontWeight: '700', color: '#6B7280', width: 25 },
    itemName: { fontSize: 14, color: '#4B5563', flex: 1 },
    itemPrice: { fontSize: 14, fontWeight: '600', color: '#111827' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 14, color: '#6B7280' },
    totalPrice: { fontSize: 18, fontWeight: '800', color: '#111827' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { marginTop: 60, alignItems: 'center' },
    emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 12 },
});
