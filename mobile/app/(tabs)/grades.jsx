import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useGrades } from '../../src/hooks/useAcademic';
import { GraduationCap, Award, FileText, ChevronRight } from 'lucide-react-native';

export default function GradesScreen() {
    const { groupedGrades, loading, refresh } = useGrades();

    const renderModuleGrades = ([moduleName, grades]) => (
        <View key={moduleName} style={styles.moduleSection}>
            <View style={styles.moduleHeader}>
                <Book size={20} color="#111827" />
                <Text style={styles.moduleName}>{moduleName}</Text>
            </View>
            <View style={styles.gradesContainer}>
                {grades.map((grade, index) => (
                    <View key={index} style={styles.gradeItem}>
                        <View style={styles.gradeHeader}>
                            <Text style={styles.gradeType}>{grade.type.replace('_', ' ')}</Text>
                            <Text style={[
                                styles.gradeValue,
                                { color: parseFloat(grade.value) >= 10 ? '#059669' : '#DC2626' }
                            ]}>
                                {parseFloat(grade.value).toFixed(2)}
                            </Text>
                        </View>
                        <Text style={styles.gradeWeight}>Weight: {Math.round(grade.weight * 100)}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Academic Results</Text>
                <Text style={styles.headerSubtitle}>Grades & Assessments</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#111827" />
                </View>
            ) : (
                <FlatList
                    data={Object.entries(groupedGrades)}
                    renderItem={renderModuleGrades}
                    keyExtractor={item => item[0]}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Award size={48} color="#E5E7EB" />
                            <Text style={styles.emptyText}>No grades published yet for this year.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

// Simple Helper Component
function Book({ size, color }) {
    return <FileText size={size} color={color} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        marginBottom: 8,
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
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    moduleSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 12,
    },
    moduleName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    gradesContainer: {
        gap: 12,
    },
    gradeItem: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    gradeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    gradeType: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    gradeValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    gradeWeight: {
        fontSize: 10,
        color: '#9CA3AF',
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
});
