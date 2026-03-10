import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, SafeAreaView,
    RefreshControl, ScrollView, Dimensions, Platform
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useAbsences } from '../../src/hooks/useStudent';
import { useGrades } from '../../src/hooks/useAcademic';
import { useClubs } from '../../src/hooks/useClubs';
import { useNotifications } from '../../src/hooks/useNotifications';
import { useMessages } from '../../src/hooks/useMessages';
import { useTasks } from '../../src/hooks/useTasks';
import { BarChart } from 'react-native-gifted-charts';
import {
    Wallet, LogOut, Bell, BellOff, CheckSquare, GraduationCap,
    AlertTriangle, Users, PlusCircle, MessageSquare, ListTodo,
    TrendingUp, BookOpen, Award, ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Small helpers ─────────────────────────────
function greetingText() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning ☀️';
    if (h < 18) return 'Good afternoon 🌤';
    return 'Good evening 🌙';
}

function getGradeColor(g) {
    if (g >= 16) return '#10B981';
    if (g >= 12) return '#3B82F6';
    if (g >= 10) return '#F59E0B';
    return '#EF4444';
}

function gradesAverage(grades) {
    if (!grades.length) return null;
    const withExam = grades.filter(g => g.exam != null);
    if (!withExam.length) return null;
    const avg = withExam.reduce((s, g) => {
        const cc1 = parseFloat(g.cc1) || 0;
        const cc2 = parseFloat(g.cc2) || 0;
        const exam = parseFloat(g.exam) || 0;
        const cc = (cc1 + cc2) / 2;
        return s + (cc * 0.4 + exam * 0.6);
    }, 0) / withExam.length;
    if (isNaN(avg)) return null;
    return avg.toFixed(1);
}

// ─── Sub-components ────────────────────────────
function QuickCard({ icon, label, value, bg, onPress }) {
    return (
        <TouchableOpacity style={[styles.quickCard, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.quickIcon}>{icon}</View>
            <Text style={styles.quickValue}>{value}</Text>
            <Text style={styles.quickLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function SectionHeader({ title, icon, onPress, linkLabel = 'See all' }) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
                {icon}
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {onPress && (
                <TouchableOpacity style={styles.seeAllBtn} onPress={onPress}>
                    <Text style={styles.seeAllText}>{linkLabel}</Text>
                    <ChevronRight size={14} color="#1a237e" />
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Main Screen ───────────────────────────────
export default function HomeScreen() {
    const { user, logout, refreshUser } = useAuth();
    const { stats: absenceStats, refresh: refreshAbsence } = useAbsences();
    const { grades, refresh: refreshGrades } = useGrades();
    const { clubs, joinClub, refresh: refreshClubs } = useClubs();
    const { unreadCount: notifCount, refreshNotifications } = useNotifications();
    const { unreadCount: msgCount, refreshMessages } = useMessages();
    const { tasks, stats: taskStats, refresh: refreshTasks } = useTasks();
    const router = useRouter();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refreshUser(), refreshAbsence(), refreshGrades(),
            refreshClubs(), refreshNotifications(), refreshMessages(), refreshTasks()
        ]);
        setRefreshing(false);
    }, [refreshUser, refreshAbsence, refreshGrades, refreshClubs, refreshNotifications, refreshMessages, refreshTasks]);

    useEffect(() => { onRefresh(); }, []);

    const handleJoinClub = async (clubId) => {
        try { await joinClub(clubId); alert('Request sent!'); }
        catch (e) { alert(e.response?.data?.message || 'Failed to join'); }
    };

    // Build bar chart data from grades
    const barData = grades
        .filter(g => g.exam != null)
        .map(g => {
            const cc1 = parseFloat(g.cc1) || 0;
            const cc2 = parseFloat(g.cc2) || 0;
            const exam = parseFloat(g.exam) || 0;
            const avg = (cc1 + cc2) / 2 * 0.4 + exam * 0.6;
            if (isNaN(avg)) return null;
            return {
                value: parseFloat(avg.toFixed(1)),
                label: (g.module_name || 'Mod').substring(0, 5),
                frontColor: getGradeColor(avg),
                topLabelComponent: () => (
                    <Text style={{ color: '#1e293b', fontSize: 9, fontWeight: '700', marginBottom: 2 }}>
                        {avg.toFixed(0)}
                    </Text>
                )
            };
        }).filter(Boolean);

    const avg = gradesAverage(grades);
    const todoCount = taskStats?.todo_count || 0;
    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a237e" colors={['#1a237e']} />}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{greetingText()}</Text>
                        <Text style={styles.name}>{user?.first_name || 'Student'} {user?.last_name || ''}</Text>
                        <Text style={styles.roleBadge}>{user?.role_name?.replace(/_/g, ' ')}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/notifications')}>
                            <Bell size={22} color="#1a237e" />
                            {notifCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text></View>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.headerBtn, styles.logoutBtn]} onPress={logout}>
                            <LogOut size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── WALLET CARD ── */}
                <View style={styles.walletCard}>
                    <View style={styles.walletGlow} />
                    <View style={styles.walletTop}>
                        <View>
                            <Text style={styles.walletLabel}>University Wallet</Text>
                            <View style={styles.balanceRow}>
                                <Text style={styles.balance}>{parseFloat(user?.balance || 0).toFixed(2)}</Text>
                                <Text style={styles.currency}>DH</Text>
                            </View>
                        </View>
                        <View style={styles.walletIconBox}>
                            <Wallet size={28} color="#FFFFFF" />
                        </View>
                    </View>
                    <View style={styles.walletBottom}>
                        <View style={styles.walletPill}>
                            <View style={styles.dot} /><Text style={styles.pillText}>ACTIVE</Text>
                        </View>
                        <Text style={styles.walletDept}>{user?.department_name || '—'}</Text>
                    </View>
                </View>

                {/* ── QUICK STATS ── */}
                <View style={styles.quickGrid}>
                    <QuickCard
                        icon={<AlertTriangle size={20} color="#EF4444" />}
                        label="Absences" value={absenceStats.total}
                        bg="#FEF2F2"
                        onPress={() => { }}
                    />
                    <QuickCard
                        icon={<GraduationCap size={20} color="#3B82F6" />}
                        label="Avg Grade" value={avg ? `${avg}/20` : '—'}
                        bg="#EFF6FF"
                        onPress={() => router.push('/grades')}
                    />
                    <QuickCard
                        icon={<MessageSquare size={20} color="#10B981" />}
                        label="Messages" value={msgCount > 0 ? msgCount : '✓'}
                        bg="#F0FDF4"
                        onPress={() => router.push('/messages')}
                    />
                    <QuickCard
                        icon={<ListTodo size={20} color="#8B5CF6" />}
                        label="Tasks Due" value={todoCount}
                        bg="#FAF5FF"
                        onPress={() => router.push('/tasks')}
                    />
                </View>

                {/* ── GRADES BAR CHART ── */}
                {barData.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader
                            title="Grade Overview"
                            icon={<TrendingUp size={18} color="#1a237e" />}
                            onPress={() => router.push('/grades')}
                        />
                        <View style={styles.chartCard}>
                            <View style={styles.chartLegend}>
                                {[{ c: '#10B981', l: '≥16 Excellent' }, { c: '#3B82F6', l: '≥12 Good' }, { c: '#F59E0B', l: '≥10 Pass' }, { c: '#EF4444', l: '<10 Fail' }].map(item => (
                                    <View key={item.l} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: item.c }]} />
                                        <Text style={styles.legendText}>{item.l}</Text>
                                    </View>
                                ))}
                            </View>
                            <BarChart
                                data={barData}
                                barWidth={28}
                                spacing={16}
                                roundedTop
                                roundedBottom
                                hideRules
                                xAxisThickness={1}
                                yAxisThickness={0}
                                xAxisColor="#E2E8F0"
                                yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                                noOfSections={4}
                                maxValue={20}
                                width={SCREEN_WIDTH - 100}
                                height={160}
                                isAnimated
                            />
                        </View>
                    </View>
                )}

                {/* ── ABSENCE SUMMARY ── */}
                <View style={styles.section}>
                    <SectionHeader title="Absence Summary" icon={<AlertTriangle size={18} color="#EF4444" />} />
                    <View style={styles.absenceRow}>
                        {[
                            { label: 'Total', value: absenceStats.total, color: '#1e293b', bg: '#F8FAFC', border: '#E2E8F0' },
                            { label: 'Justified', value: absenceStats.justified, color: '#10B981', bg: '#F0FDF4', border: '#A7F3D0' },
                            { label: 'Unjustified', value: absenceStats.unjustified, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
                        ].map(item => (
                            <View key={item.label} style={[styles.absenceCard, { backgroundColor: item.bg, borderColor: item.border }]}>
                                <Text style={[styles.absenceVal, { color: item.color }]}>{item.value}</Text>
                                <Text style={styles.absenceLab}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── PENDING TASKS ── */}
                {pendingTasks.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader
                            title="Upcoming Tasks"
                            icon={<ListTodo size={18} color="#8B5CF6" />}
                            onPress={() => router.push('/tasks')}
                        />
                        <View style={styles.tasksContainer}>
                            {pendingTasks.slice(0, 3).map(task => {
                                const priorityColors = { HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#10B981' };
                                const pc = priorityColors[task.priority] || '#64748b';
                                return (
                                    <View key={task.id} style={styles.taskRow}>
                                        <View style={[styles.taskPriorityDot, { backgroundColor: pc }]} />
                                        <View style={styles.taskInfo}>
                                            <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                            {task.due_date && (
                                                <Text style={styles.taskDue}>
                                                    Due {new Date(task.due_date).toLocaleDateString()}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={[styles.taskBadge, { backgroundColor: pc + '20', borderColor: pc }]}>
                                            <Text style={[styles.taskBadgeText, { color: pc }]}>{task.priority}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* ── CLUBS ── */}
                {clubs.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="University Clubs" icon={<Users size={18} color="#F59E0B" />} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clubScroll}>
                            {clubs.map(club => (
                                <View key={club.id} style={styles.clubCard}>
                                    <View style={styles.clubIconBox}>
                                        <Users size={22} color="#1a237e" />
                                    </View>
                                    <Text style={styles.clubName} numberOfLines={2}>{club.name}</Text>
                                    <Text style={styles.clubMembers}>{club.member_count || 0} members</Text>
                                    <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoinClub(club.id)}>
                                        <PlusCircle size={14} color="#FFFFFF" />
                                        <Text style={styles.joinText}>Join</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* ── PROFILE CARD ── */}
                <View style={styles.section}>
                    <SectionHeader title="My Profile" icon={<Award size={18} color="#64748b" />} />
                    <View style={styles.profileCard}>
                        {[
                            { label: 'Email', value: user?.email },
                            { label: 'Role', value: user?.role_name?.replace(/_/g, ' ') },
                            { label: 'Department', value: user?.department_name || '—' },
                            { label: 'Class', value: user?.class_name || '—' },
                        ].map((row, i, arr) => (
                            <View key={row.label} style={[styles.profileRow, i < arr.length - 1 && styles.profileBorder]}>
                                <Text style={styles.profileLabel}>{row.label}</Text>
                                <Text style={styles.profileValue} numberOfLines={1}>{row.value || '—'}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
    greeting: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 4 },
    name: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    roleBadge: { fontSize: 11, color: '#1a237e', fontWeight: '700', marginTop: 4, textTransform: 'uppercase', backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
    headerActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
    headerBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C7D2FE' },
    logoutBtn: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444', minWidth: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
    badgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

    // Wallet
    walletCard: { marginHorizontal: 24, marginBottom: 24, backgroundColor: '#1a237e', borderRadius: 28, padding: 24, overflow: 'hidden' },
    walletGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#3949ab', top: -80, right: -60, opacity: 0.4 },
    walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    walletLabel: { color: '#9FA8DA', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    balance: { color: '#FFFFFF', fontSize: 38, fontWeight: '800' },
    currency: { color: '#9FA8DA', fontSize: 18, fontWeight: '600' },
    walletIconBox: { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    walletBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    walletPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
    pillText: { color: '#10B981', fontSize: 11, fontWeight: '800' },
    walletDept: { color: '#9FA8DA', fontSize: 12 },

    // Quick stats grid
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12, marginBottom: 8 },
    quickCard: { width: (SCREEN_WIDTH - 60) / 2, padding: 18, borderRadius: 20, alignItems: 'center' },
    quickIcon: { width: 42, height: 42, backgroundColor: '#FFFFFF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    quickValue: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    quickLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },

    // Sections
    section: { marginTop: 8, marginBottom: 4 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 14, marginTop: 16 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seeAllText: { fontSize: 13, color: '#1a237e', fontWeight: '600' },

    // Chart
    chartCard: { marginHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, paddingTop: 20, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
    chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 10, color: '#64748b' },

    // Absence
    absenceRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
    absenceCard: { flex: 1, borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1.5 },
    absenceVal: { fontSize: 28, fontWeight: '800' },
    absenceLab: { fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '600' },

    // Tasks
    tasksContainer: { marginHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
    taskRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    taskPriorityDot: { width: 10, height: 10, borderRadius: 5 },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    taskDue: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    taskBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    taskBadgeText: { fontSize: 10, fontWeight: '700' },

    // Clubs
    clubScroll: { paddingHorizontal: 24, gap: 14 },
    clubCard: { width: 140, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
    clubIconBox: { width: 48, height: 48, backgroundColor: '#EEF2FF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    clubName: { fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 4 },
    clubMembers: { fontSize: 11, color: '#94a3b8', marginBottom: 14 },
    joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1a237e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    joinText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

    // Profile
    profileCard: { marginHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 20, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
    profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15 },
    profileBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    profileLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    profileValue: { fontSize: 14, color: '#1e293b', fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
});
