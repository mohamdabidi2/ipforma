import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/', // Replace with your server's base URL
  timeout: 10000, // Request timeout (in milliseconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Get the auth token from storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized. Redirecting to login...');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
