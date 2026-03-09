import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { Utensils } from 'lucide-react-native';

export default function ExploreScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Utensils size={48} color="#9CA3AF" />
                </View>
                <Text style={styles.title}>Digital Menu</Text>
                <Text style={styles.subtitle}>Our delicious menu will be available here soon. Stay tuned!</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});
