import axios from 'axios';

/**
 * Reusable Axios Client Instance for Landmark Developers API
 * Configured with `withCredentials: true` to handle HTTP-only authentication cookies automatically.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response Interceptor (handles global API response formatting and auth errors)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors || null,
      status: error.response?.status || 500
    };
    return Promise.reject(customError);
  }
);

export default api;
