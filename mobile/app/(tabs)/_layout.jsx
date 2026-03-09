import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Utensils, User } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#111827',
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 10,
                }
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ color }) => <Utensils size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
