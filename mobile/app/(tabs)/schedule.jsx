import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useSchedules } from '../../src/hooks/useAcademic';
import { Clock, Book, User as UserIcon, MapPin, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';

const DAYS = [
    { label: 'Mon', full: 'MONDAY' },
    { label: 'Tue', full: 'TUESDAY' },
    { label: 'Wed', full: 'WEDNESDAY' },
    { label: 'Thu', full: 'THURSDAY' },
    { label: 'Fri', full: 'FRIDAY' },
    { label: 'Sat', full: 'SATURDAY' },
];

export default function ScheduleScreen() {
    const { loading, getDailySchedule, refresh } = useSchedules();
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 0 : new Date().getDay() - 1);

    const dailySchedule = getDailySchedule(selectedDayIndex);

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
                        <Text style={styles.metaText}>{item.room_name || 'TBD'}</Text>
                    </View>
                </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'LECTURE' ? '#DBEAFE' : '#D1FAE5' }]}>
                <Text style={[styles.typeText, { color: item.type === 'LECTURE' ? '#1E40AF' : '#065F46' }]}>
                    {item.type}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Schedule</Text>
                <Text style={styles.headerSubtitle}>Weekly Class Timetable</Text>
            </View>

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

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#111827" />
                </View>
            ) : (
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
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    daySelectorContainer: {
        marginBottom: 16,
    },
    daySelector: {
        paddingHorizontal: 24,
        gap: 12,
        height: 50,
        alignItems: 'center',
    },
    dayButton: {
        width: 60,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dayButtonActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    dayLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    dayLabelActive: {
        color: '#FFFFFF',
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    scheduleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        position: 'relative',
        flexDirection: 'row',
        gap: 16,
    },
    timeSection: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#F3F4F6',
        paddingRight: 10,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    courseName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    metaRow: {
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    typeBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    refreshBtn: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
    },
    refreshBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
});
