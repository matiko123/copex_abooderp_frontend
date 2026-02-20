import axios from 'axios';

// Authentication Gateway URL - Central authentication for all systems
export const AUTH_BASE_URL = 'https://auth-gateway.iosuite.org/api/v1';


// API Base URL - Peta API
export const API_BASE_URL = 'https://peta.abooderp.com/api/v1';


//to be used in HRM module
export const GHRM_BASE_URL = 'https://ghrm.abooderp.com/api';


// Create axios instance with default configuration for core Peta API
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Separate axios instance for HRM API (uses GHRM_BASE_URL but same auth token)
export const ghrmClient = axios.create({
  baseURL: GHRM_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Reuse the same auth interceptor for HRM client
ghrmClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/page/login';
          break;
        case 403:
          console.error('Forbidden: You do not have permission to access this resource');
          break;
        case 404:
          console.error('Not Found: The requested resource was not found');
          break;
        case 500:
          console.error('Server Error: Please try again later');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network Error: Please check your internet connection');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Simple pass-through error handler for HRM client (logs but does not redirect)
ghrmClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('HRM API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
