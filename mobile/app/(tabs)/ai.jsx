import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet, View, Text, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView,
    Platform, ScrollView, Animated, Dimensions
} from 'react-native';
import {
    Send, Bot, User as UserIcon, ChefHat, Layout,
    Calendar, Star, Sparkles, Wand2, BookOpen, Clock,
    ArrowRightCircle, Info, Trash2
} from 'lucide-react-native';
import { useAI } from '../../src/hooks/useAI';
import { useAuth } from '../../src/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUICK_ACTIONS = [
    { id: '1', title: 'Check my schedule', icon: Calendar, color: '#3b82f6', query: 'What is my schedule for today?' },
    { id: '2', title: 'Latest Grades', icon: Star, color: '#f59e0b', query: 'What are my most recent grades?' },
    { id: '3', title: 'Order lunch', icon: ChefHat, color: '#10b981', query: 'What is on the cafeteria menu today and can I order?' },
    { id: '4', title: 'Study Help', icon: BookOpen, color: '#6366f1', query: 'Can you help me summarize my courses?' },
    // { id: '5', title: 'Financial help', icon: Info, color: '#ef4444', query: 'What is my financial status and can I request an enrollment certificate?' },
];

export default function AIScreen() {
    const { messages, loading, sendMessage, setMessages } = useAI();
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef(null);
    const scrollAnimation = useRef(new Animated.Value(0)).current;

    const handleSend = async (customQuery = null) => {
        const query = customQuery || inputText;
        if (!query.trim() || loading) return;

        setInputText('');
        try {
            const res = await sendMessage(query);
            if (res && res.balance_updated) {
                refreshUser();
            }
        } catch (error) {
            // Error managed by hook
        }
    };

    const clearChat = () => {
        setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hello ${user?.first_name || ''}! How can I help you today? I'm connected to your academic and university data.`,
            timestamp: new Date().toISOString()
        }]);
    };

    const renderMessage = ({ item }) => {
        const isAI = item.role === 'assistant';
        return (
            <View style={[
                styles.messageRow,
                isAI ? styles.aiRow : styles.userRow
            ]}>
                {isAI && (
                    <View style={styles.aiAvatar}>
                        <Bot size={16} color="#FFFFFF" />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isAI ? styles.aiBubble : styles.userBubble,
                    item.error && styles.errorBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isAI ? styles.aiMessageText : styles.userMessageText
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.timestamp,
                        isAI ? styles.aiTimestamp : styles.userTimestamp
                    ]}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {!isAI && (
                    <View style={styles.userAvatar}>
                        <UserIcon size={16} color="#FFFFFF" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.botIconMain}>
                            <Sparkles size={24} color="#1a237e" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>AI Personal Assistant</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.onlineText}>Gemini-2.0 Powered</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
                        <Trash2 size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Chat Body */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListHeaderComponent={() => (
                        <View style={styles.introContainer}>
                            <View style={styles.introIcon}>
                                <Wand2 size={40} color="#1a237e" />
                            </View>
                            <Text style={styles.introTitle}>Smart Assistant</Text>
                            <Text style={styles.introSub}>Ask me about your schedule, grades, or place cafeteria orders.</Text>

                            <View style={styles.suggestionGrid}>
                                {QUICK_ACTIONS.map(action => (
                                    <TouchableOpacity
                                        key={action.id}
                                        style={styles.suggestionCard}
                                        onPress={() => handleSend(action.query)}
                                    >
                                        <View style={[styles.sugIcon, { backgroundColor: action.color + '15' }]}>
                                            <action.icon size={18} color={action.color} />
                                        </View>
                                        <Text style={styles.sugText}>{action.title}</Text>
                                        <ArrowRightCircle size={14} color="#94a3b8" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                />

                {/* Input Footer */}
                <View style={styles.inputArea}>
                    {loading && (
                        <View style={styles.thinkingContainer}>
                            <ActivityIndicator size="small" color="#1a237e" />
                            <Text style={styles.thinkingText}>Assistant is thinking...</Text>
                        </View>
                    )}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask me anything..."
                            placeholderTextColor="#94a3b8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                (!inputText.trim() || loading) && styles.sendBtnDisabled
                            ]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || loading}
                        >
                            <Send size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
        backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
    },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    botIconMain: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF2FF',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#1a237e', shadowOpacity: 0.1, shadowRadius: 5
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
    onlineText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
    clearBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 10 },

    chatList: { padding: 20, paddingBottom: 40 },
    introContainer: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
    introIcon: { width: 80, height: 80, borderRadius: 32, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    introTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    introSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 10, paddingHorizontal: 40, lineHeight: 22 },

    suggestionGrid: { width: '100%', marginTop: 32, gap: 12 },
    suggestionCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14,
        borderRadius: 16, borderWide: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1
    },
    sugIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    sugText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1e293b' },

    messageRow: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
    userRow: { alignSelf: 'flex-end', marginLeft: 60 },
    aiRow: { alignSelf: 'flex-start', marginRight: 60 },

    aiAvatar: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#1a237e', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', marginRight: 8 },
    userAvatar: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#64748b', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', marginLeft: 8 },

    messageBubble: { padding: 16, borderRadius: 24 },
    aiBubble: { backgroundColor: '#F1F5F9', borderBottomLeftRadius: 4 },
    userBubble: { backgroundColor: '#1a237e', borderBottomRightRadius: 4 },
    errorBubble: { backgroundColor: '#FEE2E2', borderWide: 1, borderColor: '#EF4444' },

    messageText: { fontSize: 15, lineHeight: 22 },
    aiMessageText: { color: '#1e293b' },
    userMessageText: { color: '#FFFFFF' },

    timestamp: { fontSize: 10, marginTop: 6, opacity: 0.5 },
    aiTimestamp: { color: '#64748b', alignSelf: 'flex-start' },
    userTimestamp: { color: '#FFFFFF', alignSelf: 'flex-end' },

    inputArea: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
    thinkingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginLeft: 4 },
    thinkingText: { fontSize: 13, color: '#1a237e', fontWeight: '500', fontStyle: 'italic' },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    input: {
        flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 16,
        paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 120, color: '#1e293b',
        borderWide: 1, borderColor: '#E2E8F0'
    },
    sendBtn: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a237e',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#1a237e', shadowOpacity: 0.3, shadowRadius: 8
    },
    sendBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 }
});
