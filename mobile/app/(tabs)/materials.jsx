import React, { useState, useCallback } from 'react';
import {
    StyleSheet, View, Text, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, ScrollView, RefreshControl,
    Linking, Alert, Platform
} from 'react-native';
import {
    FileText, Download, BookOpen, Clock,
    Search, Filter, ChevronRight, File as FileIcon,
    Layers, GraduationCap, Archive
} from 'lucide-react-native';
import { useCourseMaterials } from '../../src/hooks/useAcademic';

const RESOURCE_TYPES = [
    { id: 'ALL', label: 'All', icon: Layers, color: '#6366f1' },
    { id: 'COURSE', label: 'Courses', icon: BookOpen, color: '#3b82f6' },
    { id: 'TD', label: 'Tutorials (TD)', icon: FileText, color: '#10b981' },
    { id: 'TP', label: 'Practice (TP)', icon: FileIcon, color: '#f59e0b' },
    { id: 'EXAM', label: 'Exams', icon: GraduationCap, color: '#ef4444' },
];

export default function MaterialsScreen() {
    const { materials, loading, refresh } = useCourseMaterials();
    const [selectedType, setSelectedType] = useState('ALL');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    }, [refresh]);

    const filteredMaterials = materials.filter(m =>
        selectedType === 'ALL' || m.type === selectedType
    );

    const handleDownload = (item) => {
        const fullUrl = `${process.env.EXPO_PUBLIC_API_URL}${item.file_path}`;
        Linking.openURL(fullUrl).catch(err => {
            Alert.alert('Error', 'Could not open the document. Please try again later.');
        });
    };

    const getFileExt = (filename) => {
        if (!filename) return 'DOC';
        return filename.split('.').pop().toUpperCase();
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 KB';
        const kb = bytes / 1024;
        if (kb > 1024) return (kb / 1024).toFixed(1) + ' MB';
        return kb.toFixed(0) + ' KB';
    };

    const renderMaterialItem = ({ item }) => (
        <TouchableOpacity
            style={styles.materialCard}
            onPress={() => handleDownload(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.fileIconBox, { backgroundColor: getResourceColor(item.type) + '15' }]}>
                <FileText size={24} color={getResourceColor(item.type)} />
                <View style={[styles.extBadge, { backgroundColor: getResourceColor(item.type) }]}>
                    <Text style={styles.extText}>{getFileExt(item.file_name)}</Text>
                </View>
            </View>

            <View style={styles.materialInfo}>
                <Text style={styles.materialTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.moduleName}>{item.module_name}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Clock size={12} color="#94a3b8" />
                        <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Layers size={12} color="#94a3b8" />
                        <Text style={styles.metaText}>{formatSize(item.file_size)}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item)}>
                <Download size={20} color="#1a237e" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const getResourceColor = (type) => {
        const found = RESOURCE_TYPES.find(r => r.id === type);
        return found ? found.color : '#64748b';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Course Materials</Text>
                    <Text style={styles.headerSubtitle}>Study resources and documents</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Archive size={28} color="#1a237e" />
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {RESOURCE_TYPES.map(type => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.filterBtn,
                                selectedType === type.id && styles.filterBtnActive
                            ]}
                            onPress={() => setSelectedType(type.id)}
                        >
                            <type.icon
                                size={16}
                                color={selectedType === type.id ? '#FFFFFF' : type.color}
                            />
                            <Text style={[
                                styles.filterText,
                                selectedType === type.id && styles.filterTextActive
                            ]}>{type.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !isRefreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1a237e" />
                </View>
            ) : (
                <FlatList
                    data={filteredMaterials}
                    renderItem={renderMaterialItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Layers size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No materials yet</Text>
                            <Text style={styles.emptySub}>Materials shared by your professors will appear here.</Text>
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
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    headerIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', shadowColor: '#1a237e', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },

    filterSection: { marginBottom: 16 },
    filterScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 4 },
    filterBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
        backgroundColor: '#FFFFFF', borderWide: 1, borderColor: '#F1F5F9',
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
    },
    filterBtnActive: { backgroundColor: '#1a237e', borderColor: '#1a237e' },
    filterText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    filterTextActive: { color: '#FFFFFF' },

    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    materialCard: {
        flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 24,
        padding: 16, marginBottom: 16, alignItems: 'center',
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
        borderWidth: 1, borderColor: '#F1F5F9'
    },
    fileIconBox: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    extBadge: { position: 'absolute', bottom: -5, right: -5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF' },
    extText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900' },

    materialInfo: { flex: 1, marginLeft: 16 },
    materialTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
    moduleName: { fontSize: 12, color: '#1a237e', fontWeight: '700', marginBottom: 8, opacity: 0.8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },

    downloadBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginTop: 24 },
    emptySub: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 12, lineHeight: 22 }
});
