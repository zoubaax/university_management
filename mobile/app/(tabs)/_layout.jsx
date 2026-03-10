import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Home, Utensils, ShoppingBag, Calendar, GraduationCap, LogOut, User, ListTodo, Mail, Bell, Users, Archive, Sparkles, FileText } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

function CustomDrawerContent(props) {
    const { user, logout } = useAuth();

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
                {/* Drawer Header with Student Profile */}
                <View style={styles.drawerHeader}>
                    <View style={styles.profileContainer}>
                        <View style={styles.avatarContainer}>
                            <User size={30} color="#FFFFFF" />
                        </View>
                        <View style={styles.profileText}>
                            <Text style={styles.userName} numberOfLines={1}>{user?.first_name} {user?.last_name}</Text>
                            <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
                        </View>
                    </View>
                    <View style={styles.headerFooter}>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{user?.role_name?.replace('_', ' ')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.drawerList}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* Logout Section at Footer (Sticky) */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <View style={styles.logoutIconBox}>
                        <LogOut size={20} color="#EF4444" />
                    </View>
                    <Text style={styles.logoutText}>Log Out Account</Text>
                </TouchableOpacity>
            </View>
        </View>
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
                name="ai"
                options={{
                    drawerLabel: 'AI Assistant',
                    title: 'Smart Assistant',
                    drawerIcon: ({ color }) => <Sparkles size={22} color={color} />,
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
            <Drawer.Screen
                name="messages"
                options={{
                    drawerLabel: 'Messages',
                    title: 'Communications',
                    drawerIcon: ({ color }) => <Mail size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="notifications"
                options={{
                    drawerLabel: 'Notifications',
                    title: 'Notifications',
                    drawerIcon: ({ color }) => <Bell size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="clubs"
                options={{
                    drawerLabel: 'University Clubs',
                    title: 'Clubs & Communities',
                    drawerIcon: ({ color }) => <Users size={22} color={color} />,
                }}
            />

            <Drawer.Screen
                name="materials"
                options={{
                    drawerLabel: 'Course Materials',
                    title: 'Resources & Handouts',
                    drawerIcon: ({ color }) => <Archive size={22} color={color} />,
                }}
            />
            <Drawer.Screen
                name="certificates"
                options={{
                    drawerLabel: 'Certificates',
                    title: 'Documents & Certificates',
                    drawerIcon: ({ color }) => <FileText size={22} color={color} />,
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#1a237e',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
        shadowColor: '#1a237e',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatarContainer: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    profileText: {
        flex: 1,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
    },
    userEmail: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    headerFooter: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    roleBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    drawerList: {
        paddingTop: 10,
        paddingHorizontal: 8
    },
    footer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#FEF2F2',
        padding: 14,
        borderRadius: 16,
    },
    logoutIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#EF4444',
    }
});
