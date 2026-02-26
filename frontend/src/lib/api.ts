import axios from 'axios';
import { API_ROUTES } from './api-routes';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

export const api = axios.create({
    // baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1`,
    baseURL: '/api/v1',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes(API_ROUTES.AUTH.REFRESH)) {
                if (typeof window !== 'undefined') window.location.href = '/';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post(API_ROUTES.AUTH.REFRESH);
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                if (typeof window !== 'undefined') window.location.href = '/';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);