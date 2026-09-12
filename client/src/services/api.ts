import axios from 'axios';

const rawEnvApiUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL;

// Normalize API base url to include /api path safely
export const API_BASE_URL = rawEnvApiUrl
  ? (rawEnvApiUrl.replace(/\/+$/, '').endsWith('/api')
      ? rawEnvApiUrl.replace(/\/+$/, '')
      : `${rawEnvApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

export const SERVER_ORIGIN = rawEnvApiUrl
  ? rawEnvApiUrl.replace(/\/+$/, '').replace(/\/api$/, '')
  : '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pfis_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle unauthenticated or token expiration
api.interceptors.response.use(
  (response) => {
    // If an API request unexpectedly returns HTML (like index.html from SPA catch-all when backend is unreachable),
    // treat it as a failed API response instead of successful JSON data
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype html') || response.data.trim().startsWith('<html'))
    ) {
      const err: any = new Error(
        'Backend returned HTML instead of JSON. Ensure your live backend server is deployed and VITE_API_URL is configured in production.'
      );
      err.response = {
        status: 502,
        data: { success: false, message: err.message },
      };
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('pfis_auth_token');
      const isLoginRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      // If unauthorized on protected route, clean up local state (unless running offline demo token)
      if (!isLoginRoute && token && !token.startsWith('demo_offline_token_')) {
        localStorage.removeItem('pfis_auth_token');
        localStorage.removeItem('pfis_auth_user');
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);
