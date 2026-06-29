import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15 second timeout to prevent indefinite hanging
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to append the JWT token to every request
api.interceptors.request.use(
    (config) => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user && user.token) {
                    config.headers['Authorization'] = 'Bearer ' + user.token;
                }
            }
        } catch (e) {
            // If localStorage data is corrupt, silently ignore
            console.warn('Failed to parse stored user data:', e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. The server may be starting up — please try again in a moment.';
        } else if (!error.response) {
            error.message = 'Cannot reach the server. Please check if the backend is running.';
        } else if (error.response.status === 401) {
            // If we get a 401 on a protected route (not login/signup), clear session
            const isAuthRoute = error.config.url?.includes('/auth/');
            if (!isAuthRoute) {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
