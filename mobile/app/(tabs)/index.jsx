import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, RefreshControl, ScrollView, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useNotifications, useAbsences } from '../../src/hooks/useStudent';
import { useGrades } from '../../src/hooks/useAcademic';
import { useClubs } from '../../src/hooks/useClubs';
import { Wallet, LogOut, Bell, BellOff, X, CheckSquare, GraduationCap, AlertTriangle, Users, PlusCircle } from 'lucide-react-native';

const StatItem = ({ icon, val, lab, bg }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: bg }]}>{icon}</View>
        <Text style={styles.statVal}>{val}</Text>
        <Text style={styles.statLab}>{lab}</Text>
    </View>
);

const DetailRow = ({ label, value, last }) => (
    <View style={[styles.detailRow, !last && styles.borderBottom]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

export default function HomeScreen() {
    const { user, logout, refreshUser } = useAuth();
    const { notifications, unreadCount, markAsRead, refresh: refreshNotify } = useNotifications();
    const { stats: absenceStats, refresh: refreshAbsence } = useAbsences();
    const { grades, refresh: refreshGrades } = useGrades();
    const { clubs, joinClub, refresh: refreshClubs } = useClubs();

    const [refreshing, setRefreshing] = useState(false);
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refreshUser(),
            refreshNotify(),
            refreshAbsence(),
            refreshGrades(),
            refreshClubs()
        ]);
        setRefreshing(false);
    }, [refreshUser, refreshNotify, refreshAbsence, refreshGrades, refreshClubs]);

    useEffect(() => {
        onRefresh();
    }, []);

    const handleJoinClub = async (clubId) => {
        try {
            await joinClub(clubId);
            alert('Request sent to join club!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to join');
        }
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[styles.notifyItem, !item.is_read && styles.notifyUnread]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={styles.notifyIcon}><Bell size={16} color={item.is_read ? '#9CA3AF' : '#2563EB'} /></View>
            <View style={styles.notifyContent}>
                <Text style={styles.notifyTitle}>{item.title}</Text>
                <Text style={styles.notifyText}>{item.message}</Text>
                <Text style={styles.notifyTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Student Dashboard</Text>
                        <Text style={styles.name}>{user?.first_name || 'Student'}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => setIsNotifyModalOpen(true)} style={styles.actionBtn}>
                            <Bell size={22} color="#111827" />
                            {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={logout} style={[styles.actionBtn, styles.logoutBtn]}>
                            <LogOut size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Wallet Overview */}
                <View style={styles.walletCard}>
                    <View style={styles.walletHeader}>
                        <Wallet size={20} color="#FFFFFF" />
                        <Text style={styles.walletLabel}>University Wallet</Text>
                        <View style={styles.activePill}><Text style={styles.pillText}>ACTIVE</Text></View>
                    </View>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balance}>{parseFloat(user?.balance || 0).toFixed(2)}</Text>
                        <Text style={styles.currency}>DH</Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsGrid}>
                    <StatItem icon={<AlertTriangle size={20} color="#EF4444" />} val={absenceStats.total} lab="Absences" bg="#FEE2E2" />
                    <StatItem icon={<GraduationCap size={20} color="#2563EB" />} val={grades.length} lab="Grades" bg="#DBEAFE" />
                    <StatItem icon={<CheckSquare size={20} color="#10B981" />} val={user?.class_id ? 'OK' : 'ERR'} lab="Enrollment" bg="#D1FAE5" />
                </View>

                {/* Clubs Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>University Clubs</Text>
                        <Users size={20} color="#111827" />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clubScroll}>
                        {clubs.map(club => (
                            <View key={club.id} style={styles.clubCard}>
                                <View style={styles.clubIcon}><Users size={24} color="#111827" /></View>
                                <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                                <Text style={styles.clubMembers}>{club.member_count || 0} Members</Text>
                                <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoinClub(club.id)}>
                                    <PlusCircle size={16} color="#FFFFFF" />
                                    <Text style={styles.joinText}>Join</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Profile Details */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    <View style={styles.detailsCard}>
                        <DetailRow label="Department" value={user?.department_name || 'N/A'} />
                        <DetailRow label="Role" value={user?.role_name} last />
                    </View>
                </View>
            </ScrollView>

            <Modal visible={isNotifyModalOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notifications</Text>
                            <TouchableOpacity onPress={() => setIsNotifyModalOpen(false)}><X size={24} color="#111827" /></TouchableOpacity>
                        </View>
                        <FlatList data={notifications} renderItem={renderNotification} keyExtractor={item => item.id} ListEmptyComponent={<View style={styles.emptyState}><BellOff size={48} color="#E5E7EB" /><Text style={styles.emptyText}>Empty Inbox</Text></View>} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 40 },
    greeting: { fontSize: 13, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' },
    name: { fontSize: 26, fontWeight: '800', color: '#111827' },
    headerActions: { flexDirection: 'row', gap: 12 },
    actionBtn: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    logoutBtn: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
    badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#EF4444', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' },
    walletCard: { margin: 24, backgroundColor: '#111827', borderRadius: 24, padding: 24 },
    walletHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    walletLabel: { color: '#9CA3AF', fontSize: 14 },
    activePill: { backgroundColor: '#059669', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    pillText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },
    balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    balance: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
    currency: { color: '#6B7280', fontSize: 16 },
    statsGrid: { paddingHorizontal: 24, flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    statIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statVal: { fontSize: 16, fontWeight: '800', color: '#111827' },
    statLab: { fontSize: 10, color: '#6B7280' },
    section: { marginTop: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    clubScroll: { paddingHorizontal: 24, gap: 16 },
    clubCard: { width: 140, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    clubIcon: { width: 48, height: 48, backgroundColor: '#F3F4F6', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    clubName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
    clubMembers: { fontSize: 10, color: '#6B7280', marginBottom: 12 },
    joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    joinText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    infoSection: { padding: 24 },
    detailsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    detailLabel: { color: '#6B7280', fontSize: 14 },
    detailValue: { color: '#111827', fontSize: 14, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
    notifyItem: { flexDirection: 'row', padding: 16, borderRadius: 20, marginBottom: 12, gap: 12 },
    notifyUnread: { backgroundColor: '#F0F7FF' },
    notifyIcon: { width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    notifyContent: { flex: 1 },
    notifyTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
    notifyText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    notifyTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#9CA3AF', marginTop: 12 },
});
