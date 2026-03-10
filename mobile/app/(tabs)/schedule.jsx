import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useSchedules } from '../../src/hooks/useAcademic';
import { Clock, Book, User as UserIcon, MapPin, ChevronLeft, ChevronRight, Calendar, Layout, Grid } from 'lucide-react-native';

const DAYS = [
    { label: 'Mon', full: 'Monday' },
    { label: 'Tue', full: 'Tuesday' },
    { label: 'Wed', full: 'Wednesday' },
    { label: 'Thu', full: 'Thursday' },
    { label: 'Fri', full: 'Friday' },
    { label: 'Sat', full: 'Saturday' },
];

const SLOTS = ['MORNING', 'AFTERNOON'];

export default function ScheduleScreen() {
    const { schedules, loading, getDailySchedule, refresh } = useSchedules();
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 0 : new Date().getDay() - 1);

    const dailySchedule = useMemo(() => getDailySchedule(selectedDayIndex), [schedules, selectedDayIndex]);

    // Pre-calculate weekly grid
    const weeklyGrid = useMemo(() => {
        const grid = { MORNING: {}, AFTERNOON: {} };
        DAYS.forEach(day => {
            grid.MORNING[day.full] = schedules.find(s => s.day_of_week === day.full && s.slot_type === 'MORNING');
            grid.AFTERNOON[day.full] = schedules.find(s => s.day_of_week === day.full && s.slot_type === 'AFTERNOON');
        });
        return grid;
    }, [schedules]);

    const renderScheduleItem = ({ item }) => (
        <View style={styles.scheduleCard}>
            <View style={styles.timeSection}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.timeText}>
                    {item.start_time ? `${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}` :
                        item.slot_type === 'MORNING' ? '08:30 - 12:00' : '14:30 - 18:00'}
                </Text>
            </View>
            <View style={styles.courseInfo}>
                <Text style={styles.courseName}>{item.module_name}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <UserIcon size={14} color="#9CA3AF" />
                        <Text style={styles.metaText}>{item.professor_name}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <MapPin size={14} color="#9CA3AF" />
                        <Text style={styles.metaText}>{item.room_name || item.room || 'TBD'}</Text>
                    </View>
                </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'LECTURE' ? '#DBEAFE' : '#D1FAE5' }]}>
                <Text style={[styles.typeText, { color: item.type === 'LECTURE' ? '#1E40AF' : '#065F46' }]}>
                    {item.type || 'CLASS'}
                </Text>
            </View>
        </View>
    );

    const WeeklyTable = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableContainer}>
                {/* Header Row */}
                <View style={styles.tableRow}>
                    <View style={[styles.cell, styles.headerCell, styles.cornerCell]} />
                    {DAYS.map(day => (
                        <View key={day.full} style={[styles.cell, styles.headerCell]}>
                            <Text style={styles.headerCellText}>{day.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Data Rows */}
                {SLOTS.map(slot => (
                    <View key={slot} style={styles.tableRow}>
                        <View style={[styles.cell, styles.sideHeader]}>
                            <Text style={styles.sideHeaderText}>{slot === 'MORNING' ? 'AM' : 'PM'}</Text>
                            <Text style={styles.slotTime}>{slot === 'MORNING' ? '08:30' : '14:30'}</Text>
                        </View>
                        {DAYS.map(day => {
                            const entry = weeklyGrid[slot][day.full];
                            return (
                                <View key={`${slot}-${day.full}`} style={[styles.cell, entry && styles.activeCell]}>
                                    {entry ? (
                                        <View style={styles.cellContent}>
                                            <Text style={styles.cellModule} numberOfLines={2}>{entry.module_name}</Text>
                                            <Text style={styles.cellRoom} numberOfLines={1}>{entry.room_name || entry.room || 'TBD'}</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.emptyCell} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Timetable</Text>
                        <Text style={styles.headerSubtitle}>Weekly Schedule</Text>
                    </View>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            onPress={() => setViewMode('daily')}
                            style={[styles.toggleBtn, viewMode === 'daily' && styles.toggleBtnActive]}
                        >
                            <Layout size={18} color={viewMode === 'daily' ? '#FFFFFF' : '#6B7280'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setViewMode('weekly')}
                            style={[styles.toggleBtn, viewMode === 'weekly' && styles.toggleBtnActive]}
                        >
                            <Grid size={18} color={viewMode === 'weekly' ? '#FFFFFF' : '#6B7280'} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#111827" />
                </View>
            ) : viewMode === 'daily' ? (
                <>
                    <View style={styles.daySelectorContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
                            {DAYS.map((day, index) => (
                                <TouchableOpacity
                                    key={day.full}
                                    onPress={() => setSelectedDayIndex(index)}
                                    style={[
                                        styles.dayButton,
                                        selectedDayIndex === index && styles.dayButtonActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.dayLabel,
                                        selectedDayIndex === index && styles.dayLabelActive
                                    ]}>
                                        {day.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <FlatList
                        data={dailySchedule}
                        renderItem={renderScheduleItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Calendar size={48} color="#E5E7EB" />
                                <Text style={styles.emptyText}>No classes scheduled for this day.</Text>
                                <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
                                    <Text style={styles.refreshBtnText}>Check for updates</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                </>
            ) : (
                <View style={styles.weeklyWrapper}>
                    <WeeklyTable />
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: '#DBEAFE' }]} />
                            <Text style={styles.legendText}>Busy Slot</Text>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
    headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '600' },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#C7D2FE' },
    toggleBtn: { padding: 8, borderRadius: 10, width: 40, alignItems: 'center' },
    toggleBtnActive: { backgroundColor: '#1a237e', shadowColor: '#1a237e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    daySelectorContainer: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 16 },
    daySelector: { paddingHorizontal: 24, gap: 12, height: 44, alignItems: 'center' },
    dayButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    dayButtonActive: { backgroundColor: '#1a237e', borderColor: '#1a237e', shadowColor: '#1a237e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    dayLabel: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    dayLabelActive: { color: '#FFFFFF' },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    scheduleCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 16, shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', gap: 16 },
    timeSection: { width: 85, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#F1F5F9', paddingRight: 10 },
    timeText: { fontSize: 12, fontWeight: '800', color: '#1a237e', marginTop: 6, textAlign: 'center' },
    courseInfo: { flex: 1, justifyContent: 'center' },
    courseName: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
    metaRow: { gap: 6 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    typeBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    typeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { marginTop: 80, alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { color: '#94a3b8', fontSize: 15, marginTop: 16, textAlign: 'center', fontWeight: '500' },
    refreshBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#1a237e', borderRadius: 14, shadowColor: '#1a237e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    refreshBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },

    // Table Styles
    weeklyWrapper: { flex: 1, padding: 24 },
    tableContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9' },
    tableRow: { flexDirection: 'row' },
    sideHeaderText: { fontSize: 12, fontWeight: '800', color: '#111827' },
    slotTime: { fontSize: 9, color: '#9CA3AF', marginTop: 2 },
    cornerCell: { width: 60 },
    activeCell: { backgroundColor: '#EFF6FF' },
    cellContent: { width: '100%', height: '100%', justifyContent: 'center' },
    cellModule: { fontSize: 10, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },
    cellRoom: { fontSize: 9, color: '#60A5FA', textAlign: 'center', marginTop: 4, fontWeight: '600' },
    emptyCell: { width: '100%', height: '100%' },
    legend: { flexDirection: 'row', marginTop: 16, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: '#6B7280' }
});
