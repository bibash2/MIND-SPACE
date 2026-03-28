import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mindspace_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("mindspace_token");
      localStorage.removeItem("mindspace_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post("/api/auth/register", { name, email, password }),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  me: () => api.get("/api/auth/me"),
};

// ─── Journal ─────────────────────────────────────────────────────────────────
export const journalApi = {
  list: (skip = 0, limit = 20) =>
    api.get(`/api/journal/?skip=${skip}&limit=${limit}`),
  get: (id: string) => api.get(`/api/journal/${id}`),
  create: (title: string, content: string, mood_label?: string) =>
    api.post("/api/journal/", { title, content, mood_label }),
  update: (id: string, data: Partial<{ title: string; content: string; mood_label: string }>) =>
    api.patch(`/api/journal/${id}`, data),
  delete: (id: string) => api.delete(`/api/journal/${id}`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  summary: () => api.get("/api/analytics/summary"),
};
