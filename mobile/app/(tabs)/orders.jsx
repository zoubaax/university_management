import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react-native';
import api from '../../src/api/api';

export default function OrdersScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/cafeteria/orders');
            setOrders(response.data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: Clock };
            case 'PREPARING':
                return { label: 'Preparing', color: '#3B82F6', bg: '#DBEAFE', icon: Clock };
            case 'READY':
                return { label: 'Ready for Pickup', color: '#10B981', bg: '#D1FAE5', icon: CheckCircle2 };
            default:
                return { label: status, color: '#6B7280', bg: '#F3F4F6', icon: AlertCircle };
        }
    };

    const renderOrder = ({ item }) => {
        const status = getStatusInfo(item.status);
        const date = new Date(item.created_at).toLocaleDateString();
        const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>Order #{item.id.slice(-4)}</Text>
                        <Text style={styles.orderTime}>{date} at {time}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <status.icon size={12} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.itemSummary}>
                    <Text style={styles.totalLabel}>Total Items: {item.items?.length || 0}</Text>
                    <Text style={styles.totalPrice}>{parseFloat(item.total_amount).toFixed(2)} DH</Text>
                </View>

                {item.status === 'READY' && (
                    <View style={styles.readyBanner}>
                        <Text style={styles.readyText}>Please go to the counter for pickup</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#111827" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <ShoppingBag size={48} color="#9CA3AF" />
                            <Text style={styles.emptyTitle}>No orders yet</Text>
                            <Text style={styles.emptySubtitle}>When you place an order, it will appear here for tracking.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 24,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    listContainer: {
        padding: 24,
        paddingTop: 0,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    orderTime: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    itemSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    readyBanner: {
        marginTop: 16,
        backgroundColor: '#D1FAE5',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    readyText: {
        color: '#065F46',
        fontSize: 12,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        marginTop: 80,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
});
