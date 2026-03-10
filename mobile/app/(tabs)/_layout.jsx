import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Home, Utensils, ShoppingBag, Calendar, GraduationCap, LogOut, User, ListTodo } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

function CustomDrawerContent(props) {
    const { user, logout } = useAuth();

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            {/* Drawer Header with Student Profile */}
            <View style={styles.drawerHeader}>
                <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                        <User size={32} color="#FFFFFF" />
                    </View>
                    <View style={styles.profileText}>
                        <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{user?.role_name?.replace('_', ' ')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.drawerList}>
                <DrawerItemList {...props} />
            </View>

            {/* Logout Section at Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
}

export default function TabLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: true,
                headerTitleStyle: { fontWeight: '800', color: '#111827' },
                drawerActiveBackgroundColor: '#F3F4F6',
                drawerActiveTintColor: '#111827',
                drawerInactiveTintColor: '#6B7280',
                drawerLabelStyle: { marginLeft: -10, fontWeight: '600' },
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 },
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    drawerLabel: 'Dashboard',
                    title: 'University Hub',
                    drawerIcon: ({ color }) => <Home size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="explore"
                options={{
                    drawerLabel: 'Cafeteria Menu',
                    title: 'Cafeteria',
                    drawerIcon: ({ color }) => <Utensils size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="orders"
                options={{
                    drawerLabel: 'Order History',
                    title: 'My Orders',
                    drawerIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="schedule"
                options={{
                    drawerLabel: 'Weekly Timetable',
                    title: 'My Schedule',
                    drawerIcon: ({ color }) => <Calendar size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="grades"
                options={{
                    drawerLabel: 'Academic Results',
                    title: 'My Grades',
                    drawerIcon: ({ color }) => <GraduationCap size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="tasks"
                options={{
                    drawerLabel: 'My Tasks',
                    title: 'Task Manager',
                    drawerIcon: ({ color }) => <ListTodo size={22} color={color} />,
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: '#111827',
        marginBottom: 8,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    profileText: {
        flex: 1,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    userEmail: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 2,
    },
    roleBadge: {
        backgroundColor: '#059669',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    roleText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    drawerList: {
        flex: 1,
        paddingTop: 8,
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#EF4444',
    }
});
