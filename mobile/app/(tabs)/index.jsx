import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, RefreshControl, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Wallet, LogOut, User as UserIcon } from 'lucide-react-native';

export default function HomeScreen() {
    const { user, logout, refreshUser } = useAuth();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshUser();
        setRefreshing(false);
    }, [refreshUser]);

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.name}>{user?.first_name || 'Student'}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <LogOut size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View style={styles.walletCard}>
                    <View style={styles.walletHeader}>
                        <Wallet size={24} color="#FFFFFF" />
                        <Text style={styles.walletTitle}>Cafeteria Wallet</Text>
                    </View>
                    <Text style={styles.balance}>
                        {parseFloat(user?.balance || 0).toFixed(2)} <Text style={styles.currency}>DH</Text>
                    </Text>
                    <Text style={styles.infoText}>Ready to use at the cafeteria</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <UserIcon size={24} color="#6B7280" />
                        <Text style={styles.statLabel}>Role</Text>
                        <Text style={styles.statValue}>{user?.role_name}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    greeting: {
        fontSize: 16,
        color: '#6B7280',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
    },
    walletCard: {
        margin: 24,
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    walletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    walletTitle: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '600',
    },
    balance: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 8,
    },
    currency: {
        fontSize: 20,
        fontWeight: '400',
    },
    infoText: {
        color: '#4B5563',
        fontSize: 14,
    },
    statsRow: {
        padding: 24,
    },
    statItem: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statLabel: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 8,
    },
    statValue: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
    },
});
