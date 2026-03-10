import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401, not already retried, and not on the login/refresh routes
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/refresh')
        ) {
            originalRequest._retry = true;
            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (refreshToken) {
                    // Call refresh endpoint directly using axios to avoid loops
                    const refreshResponse = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
                        refreshToken
                    });

                    if (refreshResponse.data.success) {
                        const newAccessToken = refreshResponse.data.accessToken;
                        // Save the new token
                        await SecureStore.setItemAsync('userToken', newAccessToken);

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Clear storage if refresh fails to force re-login
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('refreshToken');
                await SecureStore.deleteItemAsync('userData');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
