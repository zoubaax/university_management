import React, { useState } from 'react';
import {
    StyleSheet, View, Text, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Alert, ScrollView, RefreshControl
} from 'react-native';
import {
    FileText, FilePlus, Download, Clock, CheckCircle2,
    XCircle, Info, ChevronRight, GraduationCap, History, Scroll
} from 'lucide-react-native';
import { useCertificates } from '../../src/hooks/useStudent';
import { useAuth } from '../../src/context/AuthContext';
import * as Linking from 'expo-linking';

const CERT_TYPES = [
    {
        id: 'ENROLLMENT',
        name: 'Enrollment Certificate',
        description: 'Prove your current registration status for the academic year.',
        icon: Scroll,
        color: '#3b82f6'
    },
    {
        id: 'TRANSCRIPT',
        name: 'Grade Transcript',
        description: 'Full record of your academic performance and grades.',
        icon: GraduationCap,
        color: '#8b5cf6'
    },
    {
        id: 'STUDENT_CARD',
        name: 'Student Card',
        description: 'Request a digital or physical replacement of your student ID.',
        icon: History,
        color: '#f59e0b'
    }
];

export default function CertificatesScreen() {
    const { requests, loading, requestCertificate, downloadCertificate, refresh } = useCertificates();
    const { user } = useAuth();
    const [requesting, setRequesting] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    const handleRequest = (type) => {
        Alert.alert(
            'Confirm Request',
            `Are you sure you want to request a ${type.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request',
                    onPress: async () => {
                        try {
                            setRequesting(type.id);
                            await requestCertificate(type.id);
                            Alert.alert('Success', 'Your request has been submitted and is processing.');
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to submit request');
                        } finally {
                            setRequesting(null);
                        }
                    }
                }
            ]
        );
    };

    const handleDownload = async (id) => {
        const url = downloadCertificate(id);
        Linking.openURL(url);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'READY': return { label: 'Ready for Pickup', color: '#10B981', icon: CheckCircle2, bg: '#F0FDF4' };
            case 'APPROVED': return { label: 'Approved', color: '#6366F1', icon: CheckCircle2, bg: '#EEF2FF' };
            case 'PENDING': return { label: 'Pending Approval', color: '#F59E0B', icon: Clock, bg: '#FFFBEB' };
            case 'REJECTED': return { label: 'Rejected', color: '#EF4444', icon: XCircle, bg: '#FEF2F2' };
            case 'IN_PROGRESS': return { label: 'In Progress', color: '#6366F1', icon: Info, bg: '#EEF2FF' };
            default: return { label: 'Processing', color: '#64748b', icon: Info, bg: '#F1F5F9' };
        }
    };

    const renderRequestItem = ({ item }) => {
        const s = getStatusInfo(item.status);
        const type = CERT_TYPES.find(t => t.id === item.type);

        return (
            <View style={styles.requestCard}>
                <View style={styles.requestMain}>
                    <View style={[styles.typeIconBox, { backgroundColor: (type?.color || '#64748b') + '15' }]}>
                        {type ? <type.icon size={22} color={type.color} /> : <FileText size={22} color="#64748b" />}
                    </View>
                    <View style={styles.requestInfo}>
                        <Text style={styles.typeName}>{type?.name || item.type}</Text>
                        <Text style={styles.requestDate}>{new Date(item.requested_at).toLocaleDateString()} • {item.academic_year}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                            <s.icon size={12} color={s.color} />
                            <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                        </View>
                    </View>
                    {item.status === 'READY' && (
                        <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item.id)}>
                            <Download size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
                {item.remarks && (
                    <View style={styles.remarksBox}>
                        <Info size={14} color="#64748b" />
                        <Text style={styles.remarksText}>{item.remarks}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={requests}
                renderItem={renderRequestItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.sectionTitle}>New Request</Text>
                        <Text style={styles.sectionSub}>Select a certificate to request from the administration.</Text>

                        <View style={styles.typesGrid}>
                            {CERT_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={styles.typeCard}
                                    onPress={() => handleRequest(type)}
                                    disabled={!!requesting}
                                >
                                    <View style={styles.typeCardTop}>
                                        <View style={[styles.typeLargeIcon, { backgroundColor: type.color + '10' }]}>
                                            <type.icon size={32} color={type.color} />
                                        </View>
                                        {requesting === type.id ? (
                                            <ActivityIndicator size="small" color={type.color} />
                                        ) : (
                                            <FilePlus size={20} color="#94a3b8" />
                                        )}
                                    </View>
                                    <Text style={styles.typeTitle}>{type.name}</Text>
                                    <Text style={styles.typeDesc}>{type.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.historyHeader}>
                            <Text style={styles.sectionTitle}>Request History</Text>
                            <TouchableOpacity onPress={onRefresh}>
                                <History size={18} color="#1a237e" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => !loading && (
                    <View style={styles.emptyState}>
                        <FileText size={50} color="#cbd5e1" strokeWidth={1} />
                        <Text style={styles.emptyText}>No requests found</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    listContent: { padding: 24, paddingBottom: 40 },
    header: { marginBottom: 32 },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
    sectionSub: { fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 20 },

    typesGrid: { gap: 16 },
    typeCard: {
        backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#64748b', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    typeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    typeLargeIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    typeTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
    typeDesc: { fontSize: 13, color: '#64748b', lineHeight: 20 },

    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 16 },

    requestCard: {
        backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 16,
        borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden'
    },
    requestMain: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    typeIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    requestInfo: { flex: 1 },
    typeName: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    requestDate: { fontSize: 12, color: '#94a3b8', marginVertical: 4 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
    statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },

    downloadBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1a237e', justifyContent: 'center', alignItems: 'center', shadowColor: '#1a237e', shadowOpacity: 0.3, shadowRadius: 8 },

    remarksBox: { backgroundColor: '#F8FAFC', padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    remarksText: { flex: 1, fontSize: 12, color: '#64748b', fontStyle: 'italic' },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 12, fontSize: 15, color: '#94a3b8', fontWeight: '500' }
});
