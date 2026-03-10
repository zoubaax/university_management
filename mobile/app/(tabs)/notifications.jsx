import React, { useState, useCallback } from 'react';
import {
    StyleSheet, View, Text, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Alert, RefreshControl, Platform
} from 'react-native';
import { useNotifications } from '../../src/hooks/useNotifications';
import {
    Bell, BellOff, CheckCheck, Trash2, RefreshCw,
    MessageSquare, AlertTriangle, Info, Megaphone, Star, BookOpen
} from 'lucide-react-native';

const NOTIF_COLORS = {
    general: { bg: '#EFF6FF', icon: '#3B82F6', border: '#BFDBFE' },
    message: { bg: '#F0FDF4', icon: '#10B981', border: '#A7F3D0' },
    announcement: { bg: '#FFF7ED', icon: '#F59E0B', border: '#FDE68A' },
    grade: { bg: '#FAF5FF', icon: '#8B5CF6', border: '#DDD6FE' },
    warning: { bg: '#FEF2F2', icon: '#EF4444', border: '#FECACA' },
    default: { bg: '#F8FAFC', icon: '#64748b', border: '#E2E8F0' },
};

function getNotifStyle(type) {
    return NOTIF_COLORS[type] || NOTIF_COLORS.default;
}

function NotifIcon({ type, size = 22 }) {
    const color = getNotifStyle(type).icon;
    switch (type) {
        case 'message': return <MessageSquare size={size} color={color} />;
        case 'announcement': return <Megaphone size={size} color={color} />;
        case 'grade': return <BookOpen size={size} color={color} />;
        case 'warning': return <AlertTriangle size={size} color={color} />;
        default: return <Info size={size} color={color} />;
    }
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function NotificationsScreen() {
    const {
        notifications, unreadCount, loading,
        refreshNotifications, markAsRead, markAllAsRead, deleteNotification
    } = useNotifications();

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshNotifications();
        setRefreshing(false);
    }, [refreshNotifications]);

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Notification',
            'Remove this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(id) }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const style = getNotifStyle(item.type);
        const isUnread = !item.is_read;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    isUnread && { borderLeftWidth: 3, borderLeftColor: style.icon }
                ]}
                onPress={() => { if (isUnread) markAsRead(item.id); }}
                activeOpacity={0.85}
            >
                <View style={[styles.iconBox, { backgroundColor: style.bg, borderColor: style.border, borderWidth: 1 }]}>
                    <NotifIcon type={item.type} />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, isUnread && styles.boldText]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
                    </View>
                    <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
                    {isUnread && (
                        <View style={[styles.unreadDot, { backgroundColor: style.icon }]} />
                    )}
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={16} color="#CBD5E1" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <Text style={styles.headerSub}>{unreadCount} unread</Text>
                    )}
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={20} color="#1a237e" />
                    </TouchableOpacity>
                    {unreadCount > 0 && (
                        <TouchableOpacity style={styles.iconBtn} onPress={markAllAsRead}>
                            <CheckCheck size={20} color="#10B981" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Unread Banner */}
            {unreadCount > 0 && (
                <TouchableOpacity style={styles.unreadBanner} onPress={markAllAsRead}>
                    <Bell size={16} color="#1a237e" />
                    <Text style={styles.unreadBannerText}>Mark all {unreadCount} as read</Text>
                </TouchableOpacity>
            )}

            {/* List */}
            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1a237e" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#1a237e"
                            colors={['#1a237e']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <BellOff size={64} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>All caught up!</Text>
                            <Text style={styles.emptySub}>Pull down to check for new notifications.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
    headerSub: { fontSize: 14, color: '#EF4444', marginTop: 4, fontWeight: '600' },
    headerActions: { flexDirection: 'row', gap: 10 },
    iconBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#C7D2FE'
    },

    unreadBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginHorizontal: 24, marginBottom: 16,
        backgroundColor: '#EEF2FF', paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE'
    },
    unreadBannerText: { fontSize: 14, fontWeight: '600', color: '#1a237e' },

    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },

    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20,
        marginBottom: 12, gap: 14,
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
    },
    iconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', flex: 1, paddingRight: 8 },
    boldText: { fontWeight: '800', color: '#0F172A' },
    cardTime: { fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' },
    cardMessage: { fontSize: 13, color: '#64748b', lineHeight: 18 },
    unreadDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
    deleteBtn: { padding: 6 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
