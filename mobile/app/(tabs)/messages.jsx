import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, Alert, ScrollView, Keyboard, RefreshControl } from 'react-native';
import { useMessages } from '../../src/hooks/useMessages';
import { Inbox, Send, Star, StarOff, Trash2, X, Search, Mail, RefreshCw } from 'lucide-react-native';

export default function MessagesScreen() {
    const { inbox, sent, loading, unreadCount, markAsRead, toggleStar, deleteMessage, sendMessage, searchUsers, refreshMessages } = useMessages();
    const [activeTab, setActiveTab] = useState('inbox');
    const [isComposeVisible, setIsComposeVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshMessages();
        setRefreshing(false);
    }, [refreshMessages]);

    // Compose Form State
    const [recipientQuery, setRecipientQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [viewMessage, setViewMessage] = useState(null); // Selected message to view

    const handleSearch = async (text) => {
        setRecipientQuery(text);
        if (text.length >= 2) {
            setIsSearching(true);
            const results = await searchUsers(text);
            setSearchResults(results);
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectRecipient = (user) => {
        setSelectedRecipient(user);
        setRecipientQuery('');
        setSearchResults([]);
        Keyboard.dismiss();
    };

    const handleSend = async () => {
        if (!selectedRecipient) {
            Alert.alert('Error', 'Please select a recipient.');
            return;
        }
        if (!subject.trim() || !body.trim()) {
            Alert.alert('Error', 'Please enter a subject and a message body.');
            return;
        }

        const res = await sendMessage({
            recipient_id: selectedRecipient.id,
            recipient_type: selectedRecipient.user_type,
            subject: subject.trim(),
            body: body.trim()
        });

        if (res.success) {
            setIsComposeVisible(false);
            setSelectedRecipient(null);
            setSubject('');
            setBody('');
            setActiveTab('sent');
        } else {
            Alert.alert('Error', res.message || 'Failed to send message');
        }
    };

    const handleOpenMessage = (item) => {
        setViewMessage(item);
        if (activeTab === 'inbox' && !item.is_read) {
            markAsRead(item.id);
        }
    };

    const handleToggleStar = async (item) => {
        await toggleStar(item.id);
        if (viewMessage?.id === item.id) {
            setViewMessage(prev => ({ ...prev, is_starred: !prev.is_starred }));
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Message",
            "Are you sure you want to delete this message?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteMessage(id);
                        if (viewMessage?.id === id) setViewMessage(null);
                    }
                }
            ]
        );
    };

    const renderMessageCard = ({ item }) => {
        const isUnread = activeTab === 'inbox' && !item.is_read;
        const nameLines = (activeTab === 'inbox' ? item.sender_name : item.recipient_name) || 'Unknown';
        const roleText = (activeTab === 'inbox' ? item.sender_role : 'Recipient') || '';

        return (
            <TouchableOpacity
                style={[styles.messageCard, isUnread && styles.messageCardUnread]}
                onPress={() => handleOpenMessage(item)}
            >
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{nameLines.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                        <Text style={[styles.senderName, isUnread && styles.boldText]} numberOfLines={1}>
                            {nameLines}
                        </Text>
                        <Text style={styles.timeText}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>

                    <Text style={[styles.messageSubject, isUnread && styles.boldText]} numberOfLines={1}>
                        {item.subject}
                    </Text>
                    <Text style={styles.messagePreview} numberOfLines={1}>
                        {item.body}
                    </Text>
                </View>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleStar(item)}>
                    {item.is_starred ? (
                        <Star size={20} color="#F59E0B" fill="#F59E0B" />
                    ) : (
                        <StarOff size={20} color="#CBD5E1" />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderComposeModal = () => (
        <Modal visible={isComposeVisible} animationType="slide" transparent={true}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Message</Text>
                            <TouchableOpacity onPress={() => setIsComposeVisible(false)} style={styles.closeButton}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {!selectedRecipient ? (
                                <>
                                    <Text style={styles.label}>To:</Text>
                                    <View style={styles.searchBox}>
                                        <Search size={18} color="#94a3b8" />
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Search name or email..."
                                            value={recipientQuery}
                                            onChangeText={handleSearch}
                                            autoFocus
                                        />
                                    </View>

                                    {isSearching && <ActivityIndicator style={{ marginTop: 10 }} />}

                                    {searchResults.length > 0 && (
                                        <View style={styles.resultsContainer}>
                                            {searchResults.map(user => (
                                                <TouchableOpacity key={`${user.user_type}-${user.id}`} style={styles.resultItem} onPress={() => handleSelectRecipient(user)}>
                                                    <View>
                                                        <Text style={styles.resultName}>{user.name}</Text>
                                                        <Text style={styles.resultEmail}>{user.email} • {user.role}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.selectedRecipientBadge}>
                                    <Text style={styles.selectedRecipientText}>To: {selectedRecipient.name}</Text>
                                    <TouchableOpacity onPress={() => setSelectedRecipient(null)}>
                                        <X size={16} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Text style={styles.label}>Subject</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Message Subject"
                                value={subject}
                                onChangeText={setSubject}
                            />

                            <Text style={styles.label}>Message</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Type your message here..."
                                value={body}
                                onChangeText={setBody}
                                multiline
                                numberOfLines={6}
                            />

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSend}>
                                <Send size={20} color="#FFFFFF" />
                                <Text style={styles.submitBtnText}>Send Message</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </TouchableOpacity>
        </Modal>
    );

    const renderViewMessageModal = () => {
        if (!viewMessage) return null;

        const nameLines = (activeTab === 'inbox' ? viewMessage.sender_name : viewMessage.recipient_name) || 'Unknown';
        const emailLines = (activeTab === 'inbox' ? viewMessage.sender_email : viewMessage.recipient_email) || '';

        return (
            <Modal visible={!!viewMessage} animationType="fade" transparent={true}>
                <View style={styles.viewModalOverlay}>
                    <View style={styles.viewMessageContainer}>
                        <View style={styles.viewHeader}>
                            <TouchableOpacity onPress={() => setViewMessage(null)} style={styles.backBtn}>
                                <X size={24} color="#1e293b" />
                            </TouchableOpacity>
                            <View style={styles.viewHeaderActions}>
                                <TouchableOpacity onPress={() => handleToggleStar(viewMessage)} style={styles.actionIconBtn}>
                                    {viewMessage.is_starred ? (
                                        <Star size={22} color="#F59E0B" fill="#F59E0B" />
                                    ) : (
                                        <StarOff size={22} color="#64748b" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(viewMessage.id)} style={styles.actionIconBtn}>
                                    <Trash2 size={22} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.viewContent}>
                            <Text style={styles.viewSubject}>{viewMessage.subject}</Text>

                            <View style={styles.viewSenderInfo}>
                                <View style={styles.avatarCircleSmall}>
                                    <Text style={styles.avatarTextSmall}>{nameLines.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={styles.viewSenderText}>
                                    <Text style={styles.viewSenderName}>
                                        {activeTab === 'inbox' ? 'From: ' : 'To: '}{nameLines}
                                    </Text>
                                    <Text style={styles.viewSenderEmail}>{emailLines}</Text>
                                </View>
                                <Text style={styles.viewDate}>
                                    {new Date(viewMessage.created_at).toLocaleDateString()}{'\n'}
                                    {new Date(viewMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>

                            <View style={styles.viewDivider} />

                            <Text style={styles.viewBody}>{viewMessage.body}</Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    const currentData = activeTab === 'inbox' ? inbox : sent;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Messages</Text>
                    {unreadCount > 0 && activeTab === 'inbox' && (
                        <Text style={styles.headerSubtitle}>You have {unreadCount} unread messages</Text>
                    )}
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={20} color="#1a237e" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.composeBtn} onPress={() => setIsComposeVisible(true)}>
                        <Send size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'inbox' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('inbox')}
                >
                    <Inbox size={20} color={activeTab === 'inbox' ? '#1a237e' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'inbox' && styles.tabTextActive]}>Inbox</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'sent' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('sent')}
                >
                    <Send size={20} color={activeTab === 'sent' ? '#1a237e' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>Sent</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1a237e" />
                </View>
            ) : (
                <FlatList
                    data={currentData}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderMessageCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#1a237e"
                            colors={['#1a237e']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Mail size={64} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>Nothing here yet!</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeTab === 'inbox' ? "Pull down to refresh and check for new messages." : "You haven't sent any messages."}
                            </Text>
                        </View>
                    }
                />
            )}

            {renderComposeModal()}
            {renderViewMessageModal()}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
    headerSubtitle: { fontSize: 14, color: '#059669', marginTop: 4, fontWeight: '600' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    refreshBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C7D2FE' },
    composeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a237e', justifyContent: 'center', alignItems: 'center', shadowColor: '#1a237e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

    tabContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 12 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    tabBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
    tabText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    tabTextActive: { color: '#1a237e' },
    badge: { backgroundColor: '#EF4444', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    messageCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, gap: 14, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    messageCardUnread: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1 },
    avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1a237e20', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: '700', color: '#1a237e' },
    messageContent: { flex: 1, justifyContent: 'center' },
    messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    senderName: { fontSize: 15, fontWeight: '600', color: '#1e293b', flex: 1, paddingRight: 8 },
    timeText: { fontSize: 12, color: '#94a3b8' },
    messageSubject: { fontSize: 14, color: '#475569', marginBottom: 4 },
    messagePreview: { fontSize: 13, color: '#94a3b8' },
    boldText: { fontWeight: '800', color: '#0F172A' },
    actionBtn: { justifyContent: 'center', padding: 4 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 22 },

    // Compose Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    closeButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, fontSize: 15, color: '#1e293b' },
    textArea: { minHeight: 120, textAlignVertical: 'top' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 14 },
    searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' },
    resultsContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, marginTop: 8, maxHeight: 200, overflow: 'hidden' },
    resultItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    resultName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    resultEmail: { fontSize: 12, color: '#64748b', marginTop: 2 },
    selectedRecipientBadge: { flexDirection: 'row', backgroundColor: '#1a237e', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    selectedRecipientText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
    submitBtn: { flexDirection: 'row', backgroundColor: '#1a237e', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // View Modal
    viewModalOverlay: { flex: 1, backgroundColor: '#FFFFFF' },
    viewMessageContainer: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
    viewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    backBtn: { padding: 8 },
    viewHeaderActions: { flexDirection: 'row', gap: 8 },
    actionIconBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
    viewContent: { padding: 24 },
    viewSubject: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 24 },
    viewSenderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircleSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a237e20', justifyContent: 'center', alignItems: 'center' },
    avatarTextSmall: { fontSize: 16, fontWeight: '700', color: '#1a237e' },
    viewSenderText: { flex: 1 },
    viewSenderName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    viewSenderEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
    viewDate: { fontSize: 12, color: '#94a3b8', textAlign: 'right' },
    viewDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 24 },
    viewBody: { fontSize: 16, color: '#334155', lineHeight: 26 }
});
