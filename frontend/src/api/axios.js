import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
});

// Request interceptor: Attach Bearer Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 (Expire) and 403 (Forbidden)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized (Token Expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (response.status === 200) {
                    const { accessToken } = response.data;
                    localStorage.setItem('token', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('token');
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 Forbidden (RBAC Violation)
        if (error.response?.status === 403) {
            toast.error('Access Denied: You do not have permission for this action.');
            // Optional: Redirect to unauthorized page or dashboard
        }

        // Global Error Notification (except for auth/me checks or validation errors handled by forms)
        const isValidationError = error.response?.status === 400;
        if (error.response?.status >= 500) {
            toast.error(error.response?.data?.error || 'A server error occurred. Please try again later.');
        }

        return Promise.reject(error);
    }
);

export default api;
