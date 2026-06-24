import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ⚠️ REQUIRED
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for mustChangePassword handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.error;
      if (errorCode === 'MUST_CHANGE_PASSWORD') {
        window.location.href = '/change-password';
      }
    }
    return Promise.reject(error);
  }
);
