import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const authDataSerialized = await SecureStore.getItemAsync('userToken');
            const userDataSerialized = await SecureStore.getItemAsync('userData');

            if (authDataSerialized && userDataSerialized) {
                setUser(JSON.parse(userDataSerialized));
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, accessToken } = response.data;

            await SecureStore.setItemAsync('userToken', accessToken);
            await SecureStore.setItemAsync('userData', JSON.stringify(user));

            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
