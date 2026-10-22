import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT from localStorage
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

// Response interceptor — handle errors gracefully without redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Commented out automatic 401 redirect to login for preview/demo mode:
    // if (error.response && error.response.status === 401) { ... }
    return Promise.reject(error);
  }
);

export default api;
