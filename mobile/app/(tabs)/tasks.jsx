import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, Alert, ScrollView, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from '../../src/hooks/useTasks';
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, X, ListTodo, Calendar as CalendarIcon } from 'lucide-react-native';

export default function TasksScreen() {
    const { tasks, stats, loading, updateTaskStatus, createTask, deleteTask } = useTasks();
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    // Form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setNewTaskDueDate(selectedDate);
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        await updateTaskStatus(taskId, newStatus);
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        const result = await createTask({
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            priority: newTaskPriority,
            status: 'TODO',
            due_date: newTaskDueDate.toISOString()
        });

        if (result.success) {
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskDueDate(new Date());
            setShowDatePicker(false);
            setNewTaskPriority('MEDIUM');
            setAddModalVisible(false);
        } else {
            Alert.alert('Error', result.message || 'Failed to create task');
        }
    };

    const confirmDelete = (taskId) => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteTask(taskId) }
            ]
        );
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return '#EF4444';
            case 'MEDIUM': return '#F59E0B';
            case 'LOW': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const renderTaskCard = ({ item }) => {
        const isCompleted = item.status === 'COMPLETED';

        return (
            <TouchableOpacity
                style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
                onPress={() => handleToggleTask(item.id, item.status)}
                onLongPress={() => confirmDelete(item.id)}
            >
                <View style={styles.taskContent}>
                    {isCompleted ? (
                        <CheckCircle2 size={24} color="#10B981" />
                    ) : (
                        <Circle size={24} color="#D1D5DB" />
                    )}
                    <View style={styles.taskDetails}>
                        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                            {item.title}
                        </Text>
                        {item.description ? (
                            <Text style={styles.taskDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        ) : null}
                        <View style={styles.taskMeta}>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                                    {item.priority}
                                </Text>
                            </View>
                            <View style={styles.dateContainer}>
                                <Clock size={12} color="#94a3b8" />
                                <Text style={styles.dateText}>
                                    {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderStatsHeader = () => (
        <View style={styles.statsContainer}>
            <View style={[styles.statBox, styles.statBoxActive]}>
                <Clock size={20} color="#3B82F6" />
                <Text style={styles.statCount}>{stats.todo_count || 0}</Text>
                <Text style={styles.statLabel}>To Do</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxDone]}>
                <CheckCircle2 size={20} color="#10B981" />
                <Text style={styles.statCount}>{stats.completed_count || 0}</Text>
                <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxHigh]}>
                <AlertTriangle size={20} color="#EF4444" />
                <Text style={styles.statCount}>{stats.high_priority_count || 0}</Text>
                <Text style={styles.statLabel}>High Priority</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Content */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Tasks</Text>
                    <Text style={styles.headerSubtitle}>Stay on top of your work!</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
                    <Plus size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1a237e" />
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={renderStatsHeader}
                    renderItem={renderTaskCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <ListTodo size={64} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>All caught up!</Text>
                            <Text style={styles.emptySubtitle}>You don't have any pending tasks right now.</Text>
                        </View>
                    }
                />
            )}

            {/* Add Task Modal */}
            <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Create New Task</Text>
                                <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeButton}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                                <Text style={styles.label}>Task Title <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Study for Software Engineering Exam"
                                    value={newTaskTitle}
                                    onChangeText={setNewTaskTitle}
                                />

                                <Text style={styles.label}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Add details about this task..."
                                    value={newTaskDescription}
                                    onChangeText={setNewTaskDescription}
                                    multiline
                                    numberOfLines={3}
                                />

                                <Text style={styles.label}>Due Date</Text>
                                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => { Keyboard.dismiss(); setShowDatePicker(true); }}>
                                    <CalendarIcon size={20} color="#64748b" />
                                    <Text style={styles.dateSelectorText}>
                                        {newTaskDueDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={newTaskDueDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}

                                <Text style={styles.label}>Priority Level</Text>
                                <View style={styles.prioritySelector}>
                                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                                        <TouchableOpacity
                                            key={p}
                                            style={[
                                                styles.priorityOption,
                                                newTaskPriority === p && { backgroundColor: getPriorityColor(p) + '20', borderColor: getPriorityColor(p) }
                                            ]}
                                            onPress={() => { Keyboard.dismiss(); setNewTaskPriority(p); }}
                                        >
                                            <Text style={[styles.priorityOptionText, newTaskPriority === p && { color: getPriorityColor(p), fontWeight: '700' }]}>
                                                {p}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTask}>
                                    <Text style={styles.submitBtnText}>Create Task</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 20,
    },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    addButton: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#1a237e',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#1a237e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
    },
    statsContainer: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12
    },
    statBox: {
        flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9'
    },
    statBoxActive: { backgroundColor: '#EFF6FF' },
    statBoxDone: { backgroundColor: '#ECFDF5' },
    statBoxHigh: { backgroundColor: '#FEF2F2' },
    statCount: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginVertical: 4 },
    statLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    taskCard: {
        backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12,
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    taskCardCompleted: { opacity: 0.6 },
    taskContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    taskDetails: { flex: 1 },
    taskTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
    taskTitleCompleted: { textDecorationLine: 'line-through', color: '#94a3b8' },
    taskDescription: { fontSize: 13, color: '#64748b', marginBottom: 8, lineHeight: 18 },
    taskMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    priorityText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dateText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 22 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    closeButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, fontSize: 15, color: '#1e293b' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    dateSelectorBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, gap: 12 },
    dateSelectorText: { fontSize: 16, color: '#1e293b' },
    prioritySelector: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    priorityOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    priorityOptionText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    submitBtn: { backgroundColor: '#1a237e', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
