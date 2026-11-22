import axios from 'axios';
import { NoticeItem, DashboardStats, NotificationRecord } from '../types';

export const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach Authorization Bearer token to every request if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'citizen';
  preferred_language: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const apiService = {
  // Authentication Endpoints
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.access_token) {
      localStorage.setItem('civic_auth_token', res.data.access_token);
      localStorage.setItem('civic_auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (data: { email: string; password: string; full_name?: string; role?: string; preferred_language?: string }): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', data);
    if (res.data?.access_token) {
      localStorage.setItem('civic_auth_token', res.data.access_token);
      localStorage.setItem('civic_auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getProfile: async (): Promise<AuthUser> => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_auth_user');
  },

  getStoredUser: (): AuthUser | null => {
    const str = localStorage.getItem('civic_auth_user');
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem('civic_auth_token');
  },
  // Admin Endpoints
  getAdminDashboard: async (): Promise<DashboardStats> => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  verifyNotice: async (id: string, notes?: string): Promise<NoticeItem> => {
    const res = await api.post(`/admin/notices/${id}/verify`, null, {
      params: { notes: notes || 'Verified authentic government circular' }
    });
    return res.data;
  },

  approveNotice: async (id: string, notes?: string): Promise<NoticeItem> => {
    const res = await api.post(`/admin/notices/${id}/approve`, null, {
      params: { notes: notes || 'Approved for publishing by Chief Information Officer' }
    });
    return res.data;
  },

  updateNotice: async (id: string, updates: Partial<NoticeItem>): Promise<NoticeItem> => {
    const res = await api.put(`/notices/${id}`, updates);
    return res.data;
  },

  publishNotice: async (id: string, dispatchAlerts: boolean = true): Promise<NoticeItem> => {
    const res = await api.post(`/admin/notices/${id}/publish`, null, {
      params: { dispatch_alerts: dispatchAlerts }
    });
    return res.data;
  },

  rejectNotice: async (id: string, reason?: string) => {
    const res = await api.post(`/admin/notices/${id}/reject`, null, {
      params: { reason: reason || 'Not authenticated' }
    });
    return res.data;
  },

  deleteNotice: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/notices/${id}`);
    return res.data;
  },

  // Notices
  getNotices: async (filters?: { category?: string; urgency?: string; status?: string; search?: string; location?: string; limit?: number }): Promise<NoticeItem[]> => {
    const res = await api.get('/notices', { params: filters });
    return res.data;
  },

  getNoticeById: async (id: string): Promise<NoticeItem> => {
    const res = await api.get(`/notices/${id}`);
    return res.data;
  },

  uploadNotice: async (formData: FormData): Promise<NoticeItem> => {
    const res = await api.post('/notices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Document Text Extraction
  extractDocumentText: async (file: File): Promise<{ filename: string; file_type: string; extracted_text: string; char_count: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/extract-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // AI & Alerts
  aiExtract: async (text: string) => {
    const res = await api.post('/ai/extract', { text });
    return res.data;
  },

  dispatchAlert: async (noticeId: string, channel: string = 'PUSH') => {
    const res = await api.post('/alerts/generate', { notice_id: noticeId, channel });
    return res.data;
  },

  // Citizen Endpoints
  getCitizenDashboard: async (locality?: string, language: string = 'en') => {
    const res = await api.get('/citizen/dashboard', {
      params: { locality, language }
    });
    return res.data;
  },

  getCitizenNotifications: async (): Promise<NotificationRecord[]> => {
    const res = await api.get('/citizen/notifications');
    return res.data;
  },

  saveUserLocation: async (locality: string) => {
    const res = await api.post('/citizen/locations', { locality });
    return res.data;
  },

  toggleBookmarkNotice: async (noticeId: string) => {
    const res = await api.post(`/citizen/saved-notices/${noticeId}`);
    return res.data;
  },

  getSavedNotices: async (): Promise<NoticeItem[]> => {
    const res = await api.get('/citizen/saved-notices');
    return res.data;
  },

  submitFeedback: async (feedback: { notice_id: string; feedback_type: string; comments: string; rating?: number }) => {
    const res = await api.post('/citizen/feedback', feedback);
    return res.data;
  }
};
