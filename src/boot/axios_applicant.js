// src/boot/axios_applicant.js
import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { LocalStorage } from 'quasar';

const applicantApi = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor - add applicant token if available
applicantApi.interceptors.request.use((config) => {
  // For applicants, you might use a different token or no token at all
  // since they authenticate via email + OTP
  const token = LocalStorage.getItem('applicant_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor - handle auth errors
applicantApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear applicant session on unauthorized
      LocalStorage.remove('applicant_token');
      LocalStorage.remove('applicant_email');
      // You might want to redirect to login
    }
    return Promise.reject(error);
  },
);

export default boot(({ app }) => {
  app.config.globalProperties.$applicantApi = applicantApi;
});

export { applicantApi };
