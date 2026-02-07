import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, accessToken } = response.data;

            localStorage.setItem('token', accessToken);
            set({ user, isAuthenticated: true, loading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.error || 'Login failed',
                loading: false
            });
            return false;
        }
    },

    logout: async () => {
        try {
            await api.get('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false });
        }
    },

    getMe: async () => {
        if (!localStorage.getItem('token')) return;

        set({ loading: true });
        try {
            const response = await api.get('/auth/me');
            set({ user: response.data.data, isAuthenticated: true, loading: false });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },
}));

export default useAuthStore;
