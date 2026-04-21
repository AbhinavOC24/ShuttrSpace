import axios from "axios";

// Create the centralized axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  withCredentials: true,
});

// Helper to update the Auth header globally
export const setAuthHeader = (token: string | null) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

// Initial state: Load token from localStorage if available
if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  if (token) setAuthHeader(token);
}

api.interceptors.request.use((config) => {
  console.log(`API REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor logic for Silent Refresh & Token Rotation
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token as string);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 or 403, try to refresh the token (ignore for login/signup/refresh)
    const isAuthPath = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/signup") || originalRequest.url?.includes("/auth/refresh");
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isAuthPath) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/u/auth/refresh");
        if (data.token) {
          localStorage.setItem("token", data.token);
          setAuthHeader(data.token);
          originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
          processQueue(null, data.token);
          return api(originalRequest);
        }
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        setAuthHeader(null);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
