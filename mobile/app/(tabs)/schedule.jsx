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
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#111827' },
    headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4 },
    toggleBtn: { padding: 8, borderRadius: 10 },
    toggleBtnActive: { backgroundColor: '#111827' },
    daySelectorContainer: { marginBottom: 16 },
    daySelector: { paddingHorizontal: 24, gap: 10, height: 48, alignItems: 'center' },
    dayButton: { width: 56, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
    dayButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
    dayLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    dayLabelActive: { color: '#FFFFFF' },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    scheduleCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', gap: 16 },
    timeSection: { width: 90, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#F3F4F6', paddingRight: 10 },
    timeText: { fontSize: 11, fontWeight: '700', color: '#111827', marginTop: 4, textAlign: 'center' },
    courseInfo: { flex: 1, justifyContent: 'center' },
    courseName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 },
    metaRow: { gap: 4 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 12, color: '#6B7280' },
    typeBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    typeText: { fontSize: 9, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { marginTop: 60, alignItems: 'center' },
    emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 12 },
    refreshBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F3F4F6', borderRadius: 10 },
    refreshBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },

    // Table Styles
    weeklyWrapper: { flex: 1, padding: 16 },
    tableContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
    tableRow: { flexDirection: 'row' },
    cell: { width: 100, height: 80, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 8 },
    headerCell: { height: 40, backgroundColor: '#F9FAFB' },
    headerCellText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
    sideHeader: { width: 60, backgroundColor: '#F9FAFB', borderRightColor: '#E5E7EB' },
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
