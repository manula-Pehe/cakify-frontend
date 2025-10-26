import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Base API configuration
export const API_BASE_URL = "http://localhost:9090/api";

// Create axios instance
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10s timeout
});

// Request interceptor (optional)
instance.interceptors.request.use(
  (config) => {
    // Later you can attach tokens here:
    const token = localStorage.getItem("admin-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwraps response.data
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`API Error (${error.response.status}): ${message}`);
    } else if (error.request) {
      throw new Error("No response from server. Please check your connection.");
    } else {
      throw new Error(error.message || "Unexpected error occurred.");
    }
  }
);

// Helper wrapper
export const apiClient = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await instance.get<T, T>(url, config);
    return res;
  },
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const res = await instance.post<T, T>(url, data, config);
    return res;
  },
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const res = await instance.put<T, T>(url, data, config);
    return res;
  },
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await instance.delete<T, T>(url, config);
    return res;
  },
};
