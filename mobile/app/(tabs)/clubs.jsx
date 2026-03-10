import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, View, Text, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, TextInput, Modal,
    KeyboardAvoidingView, Platform, Alert, ScrollView,
    Image, Dimensions, RefreshControl
} from 'react-native';
import { useClubs } from '../../src/hooks/useClubs';
import {
    Users, Search, X, MapPin, Calendar, Image as ImageIcon,
    ChevronRight, PlusCircle, CheckCircle2, Megaphone,
    Info, Globe, Mail, Phone, Clock
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ClubsScreen() {
    const { clubs, loading, joinClub, getClubDetails, rsvpToEvent, refresh } = useClubs();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Club Detail Modal
    const [selectedClub, setSelectedClub] = useState(null);
    const [clubDetails, setClubDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState('about'); // 'about', 'events', 'gallery'

    const categories = ['All', 'Academic', 'Sports', 'Cultural', 'Social', 'Tech', 'Art'];

    const filteredClubs = clubs.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    }, [refresh]);

    const handleOpenClub = async (club) => {
        setSelectedClub(club);
        setDetailsLoading(true);
        setActiveDetailTab('about');
        try {
            const details = await getClubDetails(club.id);
            setClubDetails(details);
        } catch (error) {
            Alert.alert('Error', 'Failed to load club details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleJoin = async (clubId) => {
        try {
            await joinClub(clubId);
            Alert.alert('Success', 'Your join request has been sent! Awaiting approval from the club president.');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to join club');
        }
    };

    const renderClubCard = ({ item }) => (
        <TouchableOpacity
            style={styles.clubCard}
            onPress={() => handleOpenClub(item)}
            activeOpacity={0.7}
        >
            <View style={styles.clubCardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>{item.category || 'General'}</Text>
                </View>
                <TouchableOpacity onPress={() => item.membership_status === 'not_joined' && handleJoin(item.id)}>
                    {item.membership_status === 'approved' ? (
                        <CheckCircle2 size={24} color="#10B981" />
                    ) : item.membership_status === 'pending' ? (
                        <Clock size={24} color="#F59E0B" />
                    ) : (
                        <PlusCircle size={24} color="#1a237e" />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.clubInfoMain}>
                <View style={styles.clubLogoContainer}>
                    <Users size={32} color="#1a237e" />
                </View>
                <View style={styles.clubTextContent}>
                    <Text style={styles.clubName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.clubDescription} numberOfLines={2}>
                        {item.description || 'No description provided.'}
                    </Text>
                </View>
            </View>

            <View style={styles.clubCardFooter}>
                <View style={styles.statItem}>
                    <Users size={14} color="#64748b" />
                    <Text style={styles.statText}>{item.member_count || 0} Members</Text>
                </View>
                <View style={styles.statItem}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.statText}>{item.event_count || 0} Events</Text>
                </View>
                <View style={styles.goBtn}>
                    <ChevronRight size={16} color="#1a237e" />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEvents = () => {
        if (!clubDetails?.events || clubDetails.events.length === 0) {
            return (
                <View style={styles.emptyTab}>
                    <Calendar size={48} color="#cbd5e1" />
                    <Text style={styles.emptyTabText}>No upcoming events</Text>
                </View>
            );
        }

        return clubDetails.events.map(event => (
            <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventDateBox}>
                    <Text style={styles.eventDay}>{new Date(event.start_date).getDate()}</Text>
                    <Text style={styles.eventMonth}>{new Date(event.start_date).toLocaleString('default', { month: 'short' })}</Text>
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventMeta}>
                        <MapPin size={12} color="#64748b" />
                        <Text style={styles.eventMetaText}>{event.location || 'Campus'}</Text>
                    </View>
                    <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
                </View>
                <TouchableOpacity
                    style={styles.rsvpBtn}
                    onPress={async () => {
                        try {
                            await rsvpToEvent(event.id);
                            Alert.alert('RSVP Success', 'Successfully registered for this event!');
                        } catch (e) {
                            Alert.alert('Info', 'You have already RSVP\'d or registration is closed.');
                        }
                    }}
                >
                    <PlusCircle size={20} color="#FFFFFF" />
                    <Text style={styles.rsvpBtnText}>RSVP</Text>
                </TouchableOpacity>
            </View>
        ));
    };

    const renderGallery = () => {
        if (!clubDetails?.gallery || clubDetails.gallery.length === 0) {
            return (
                <View style={styles.emptyTab}>
                    <ImageIcon size={48} color="#cbd5e1" />
                    <Text style={styles.emptyTabText}>No photos in gallery</Text>
                </View>
            );
        }

        return (
            <View style={styles.galleryGrid}>
                {clubDetails.gallery.map(item => (
                    <View key={item.id} style={styles.galleryItem}>
                        <Image
                            source={{ uri: process.env.EXPO_PUBLIC_API_URL + item.image_url }}
                            style={styles.galleryImage}
                            resizeMode="cover"
                        />
                        {item.caption && (
                            <View style={styles.galleryCaption}>
                                <Text style={styles.galleryCaptionText} numberOfLines={1}>{item.caption}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Student Clubs</Text>
                    <Text style={styles.headerSubtitle}>Discover your community</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Users size={28} color="#1a237e" />
                </View>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search clubs..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryBtn,
                                selectedCategory === cat && styles.categoryBtnActive
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryBtnText,
                                selectedCategory === cat && styles.categoryBtnTextActive
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Club List */}
            {loading && !isRefreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1a237e" />
                </View>
            ) : (
                <FlatList
                    data={filteredClubs}
                    renderItem={renderClubCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Users size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No clubs found</Text>
                            <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
                        </View>
                    }
                />
            )}

            {/* Club Detail Modal */}
            <Modal
                visible={!!selectedClub}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.modalCloseBtn}
                                onPress={() => {
                                    setSelectedClub(null);
                                    setClubDetails(null);
                                }}
                            >
                                <X size={24} color="#1e293b" />
                            </TouchableOpacity>
                            <Text style={styles.modalHeaderTitle}>Club Profile</Text>
                            <TouchableOpacity onPress={() => selectedClub.membership_status === 'not_joined' && handleJoin(selectedClub.id)}>
                                {selectedClub?.membership_status === 'approved' ? (
                                    <CheckCircle2 size={24} color="#10B981" />
                                ) : selectedClub?.membership_status === 'pending' ? (
                                    <Clock size={24} color="#F59E0B" />
                                ) : (
                                    <PlusCircle size={24} color="#1a237e" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Club Hero */}
                            <View style={styles.clubHero}>
                                <View style={styles.heroLogoContainer}>
                                    <Users size={48} color="#1a237e" />
                                </View>
                                <Text style={styles.heroName}>{selectedClub?.name}</Text>
                                <View style={[styles.heroBadge, { backgroundColor: getCategoryColor(selectedClub?.category) + '20' }]}>
                                    <Text style={[styles.heroBadgeText, { color: getCategoryColor(selectedClub?.category) }]}>
                                        {selectedClub?.category}
                                    </Text>
                                </View>
                            </View>

                            {/* Tabs Navigation */}
                            <View style={styles.modalTabs}>
                                {['about', 'events', 'gallery'].map(tab => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[styles.modalTab, activeDetailTab === tab && styles.modalTabActive]}
                                        onPress={() => setActiveDetailTab(tab)}
                                    >
                                        <Text style={[styles.modalTabText, activeDetailTab === tab && styles.modalTabTextActive]}>
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.tabContent}>
                                {detailsLoading ? (
                                    <ActivityIndicator style={{ padding: 40 }} color="#1a237e" />
                                ) : (
                                    <>
                                        {activeDetailTab === 'about' && (
                                            <View>
                                                <View style={styles.detailSection}>
                                                    <View style={styles.sectionLabelRow}>
                                                        <Info size={16} color="#64748b" />
                                                        <Text style={styles.sectionLabel}>About the Club</Text>
                                                    </View>
                                                    <Text style={styles.detailAboutText}>
                                                        {selectedClub?.description || 'This club is a dedicated space for students to explore their interests, collaborate on projects, and build lasting communities at UPF.'}
                                                    </Text>
                                                </View>

                                                <View style={styles.detailSection}>
                                                    <View style={styles.sectionLabelRow}>
                                                        <Globe size={16} color="#64748b" />
                                                        <Text style={styles.sectionLabel}>Quick Links</Text>
                                                    </View>
                                                    <View style={styles.contactRow}>
                                                        <Mail size={14} color="#1a237e" />
                                                        <Text style={styles.contactText}>{selectedClub?.email || 'contact@upf-club.ma'}</Text>
                                                    </View>
                                                    <View style={styles.contactRow}>
                                                        <Phone size={14} color="#1a237e" />
                                                        <Text style={styles.contactText}>+212 5XX-XXXXXX</Text>
                                                    </View>
                                                </View>

                                                {clubDetails?.broadcasts?.length > 0 && (
                                                    <View style={styles.detailSection}>
                                                        <View style={styles.sectionLabelRow}>
                                                            <Megaphone size={16} color="#64748b" />
                                                            <Text style={styles.sectionLabel}>Recent Announcements</Text>
                                                        </View>
                                                        {clubDetails.broadcasts.slice(0, 2).map(b => (
                                                            <View key={b.id} style={styles.broadcastMiniCard}>
                                                                <Text style={styles.broadcastTitle}>{b.subject}</Text>
                                                                <Text style={styles.broadcastDate}>{new Date(b.created_at).toLocaleDateString()}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {activeDetailTab === 'events' && renderEvents()}
                                        {activeDetailTab === 'gallery' && renderGallery()}
                                    </>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[
                                styles.modalJoinBtn,
                                selectedClub?.membership_status !== 'not_joined' && styles.modalJoinBtnDisabled
                            ]}
                            onPress={() => selectedClub?.membership_status === 'not_joined' && handleJoin(selectedClub.id)}
                            disabled={selectedClub?.membership_status !== 'not_joined'}
                        >
                            {selectedClub?.membership_status === 'approved' ? (
                                <>
                                    <CheckCircle2 size={20} color="#FFFFFF" />
                                    <Text style={styles.modalJoinBtnText}>Joined</Text>
                                </>
                            ) : selectedClub?.membership_status === 'pending' ? (
                                <>
                                    <Clock size={20} color="#FFFFFF" />
                                    <Text style={styles.modalJoinBtnText}>Pending Approval</Text>
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={20} color="#FFFFFF" />
                                    <Text style={styles.modalJoinBtnText}>Join this Club</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const getCategoryColor = (cat) => {
    switch (cat) {
        case 'Academic': return '#3B82F6';
        case 'Sports': return '#EF4444';
        case 'Cultural': return '#8B5CF6';
        case 'Social': return '#10B981';
        case 'Tech': return '#0F172A';
        case 'Art': return '#EC4899';
        default: return '#64748B';
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 32 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    headerIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },

    searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        marginBottom: 16
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1e293b' },
    categoryScroll: { gap: 10, paddingBottom: 4 },
    categoryBtn: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#FFFFFF', borderWide: 1, borderColor: '#E2E8F0'
    },
    categoryBtnActive: { backgroundColor: '#1a237e', borderColor: '#1a237e' },
    categoryBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    categoryBtnTextActive: { color: '#FFFFFF' },

    listContainer: { padding: 24, paddingTop: 0, paddingBottom: 40 },
    clubCard: {
        backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16,
        shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
        borderWidth: 1, borderColor: '#F1F5F9'
    },
    clubCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    clubInfoMain: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    clubLogoContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
    clubTextContent: { flex: 1 },
    clubName: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
    clubDescription: { fontSize: 13, color: '#64748b', lineHeight: 18 },
    clubCardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16, gap: 16 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    goBtn: { marginLeft: 'auto', width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingTop: 16, maxHeight: '92%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalCloseBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
    modalHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#64748b' },

    clubHero: { alignItems: 'center', marginBottom: 24 },
    heroLogoContainer: { width: 100, height: 100, borderRadius: 30, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    heroName: { fontSize: 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
    heroBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    heroBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

    modalTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 20 },
    modalTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    modalTabActive: { borderBottomWidth: 3, borderBottomColor: '#1a237e' },
    modalTabText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
    modalTabTextActive: { color: '#1a237e' },

    tabContent: { minHeight: 200 },
    detailSection: { marginBottom: 24 },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionLabel: { fontSize: 14, fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 },
    detailAboutText: { fontSize: 15, color: '#475569', lineHeight: 24 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    contactText: { fontSize: 14, color: '#1a237e', fontWeight: '500' },
    broadcastMiniCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEF2FF' },
    broadcastTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    broadcastDate: { fontSize: 10, color: '#94a3b8', marginTop: 4 },

    eventCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', gap: 12 },
    eventDateBox: { width: 50, height: 56, borderRadius: 12, backgroundColor: '#1a237e', justifyContent: 'center', alignItems: 'center' },
    eventDay: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    eventMonth: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    eventInfo: { flex: 1 },
    eventTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    eventMetaText: { fontSize: 10, color: '#64748b' },
    eventDesc: { fontSize: 11, color: '#94a3b8' },
    rsvpBtn: { backgroundColor: '#1a237e', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 4 },
    rsvpBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    galleryItem: { width: (SCREEN_WIDTH - 68) / 2, borderRadius: 16, overflow: 'hidden', height: 120 },
    galleryImage: { width: '100%', height: '100%' },
    galleryCaption: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6 },
    galleryCaptionText: { color: '#FFFFFF', fontSize: 10, fontWeight: '500' },
    emptyTab: { padding: 40, alignItems: 'center' },
    emptyTabText: { marginTop: 12, color: '#94a3b8', fontSize: 14 },

    modalJoinBtn: {
        flexDirection: 'row', backgroundColor: '#1a237e', paddingVertical: 16,
        borderRadius: 20, alignItems: 'center', justifyContent: 'center',
        gap: 12, marginTop: 10, shadowColor: '#1a237e',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
    },
    modalJoinBtnDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0
    },
    modalJoinBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
