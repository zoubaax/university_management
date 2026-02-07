import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // Send cookies with requests
});

// Request interceptor to add the access token to headers
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const response = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (response.status === 200) {
                    const { accessToken } = response.data;
                    localStorage.setItem('token', accessToken);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
