import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { BackupSettings } from '../types/backups';

type QueryParams = Record<string, string | number | boolean | undefined>;

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url || '';
    const shouldHandle401 =
      error.response?.status === 401 &&
      !requestUrl.includes('/auth/login');

    if (shouldHandle401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  setUserPassword: (userId: number, newPassword: string) =>
    api.post('/auth/admin/set-user-password', { userId, newPassword }),
  resetAllUserPasswords: () =>
    api.post('/auth/admin/reset-all-passwords'),
  me: () => api.get('/auth/me')
};

export const usersApi = {
  getAll: (params?: QueryParams) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: <T extends object>(data: T) => api.post('/users', data),
  update: <T extends object>(id: number, data: T) => api.put(`/users/${id}`, data),
  getByShift: (shiftId: number, date: string) => api.get(`/users/by-shift/${shiftId}/${date}`),
  getPerformance: (id: number, params?: QueryParams) => api.get(`/users/${id}/performance`, { params })
};

export const shiftsApi = {
  getAll: () => api.get('/shifts'),
  getById: (id: number) => api.get(`/shifts/${id}`),
  create: <T extends object>(data: T) => api.post('/shifts', data),
  update: <T extends object>(id: number, data: T) => api.put(`/shifts/${id}`, data)
};

export const shiftSchedulesApi = {
  getAll: (params?: QueryParams) => api.get('/shift-schedules', { params }),
  getByDate: (date: string) => api.get(`/shift-schedules/by-date/${date}`),
  saveBulk: (schedules: Array<object>) => api.post('/shift-schedules/bulk', { schedules }),
  update: <T extends object>(id: number, data: T) => api.put(`/shift-schedules/${id}`, data),
  delete: (id: number) => api.delete(`/shift-schedules/${id}`)
};

export const equipmentApi = {
  getAll: (params?: QueryParams) => api.get('/equipment', { params }),
  getById: (id: number) => api.get(`/equipment/${id}`),
  create: <T extends object>(data: T) => api.post('/equipment', data),
  update: <T extends object>(id: number, data: T) => api.put(`/equipment/${id}`, data),
  getCategories: () => api.get('/equipment/meta/categories')
};

export const workOrdersApi = {
  getAll: (params?: QueryParams) => api.get('/work-orders', { params }),
  getById: (id: number) => api.get(`/work-orders/${id}`),
  create: <T extends object>(data: T) => api.post('/work-orders', data),
  update: <T extends object>(id: number, data: T) => api.put(`/work-orders/${id}`, data),
  delete: (id: number) => api.delete(`/work-orders/${id}`),
  clearReport: async (id: number, currentStatus?: string) => {
    try {
      return await api.patch(`/work-orders/${id}/clear-report`);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status !== 404) throw error;

      if (currentStatus === 'ONAY_BEKLIYOR' || currentStatus === 'TAMAMLANDI') {
        try {
          await api.patch(`/work-orders/${id}/status`, {
            durum: 'DEVAM_EDIYOR',
            aciklama: 'Is emri formu temizlendigi icin geri yollandi'
          });
        } catch {
          // Durum gecisi eski sunucu kurallarinda engellenebilir; en azindan formu temizleyelim.
        }
      }

      const updateResponse = await api.put(`/work-orders/${id}`, { tamamlanmaNotlari: null });
      return {
        ...updateResponse,
        data: {
          ...updateResponse.data,
          message: 'Form silindi'
        }
      };
    }
  },
  updateStatus: (id: number, durum: string, aciklama?: string) =>
    api.patch(`/work-orders/${id}/status`, { durum, aciklama }),
  submitForApproval: (id: number, reportContent: string) =>
    api.patch(`/work-orders/${id}/submit-for-approval`, { reportContent }),
  approveCompletion: (id: number) =>
    api.patch(`/work-orders/${id}/approve-completion`),
  getByShift: (shiftId: number, date: string) => api.get(`/work-orders/by-shift/${shiftId}/${date}`),
  getStats: () => api.get('/work-orders/stats/summary')
};

export const preventiveMaintenanceApi = {
  getAll: (params?: QueryParams) => api.get('/preventive-maintenance', { params }),
  getById: (id: number) => api.get(`/preventive-maintenance/${id}`),
  create: <T extends object>(data: T) => api.post('/preventive-maintenance', data),
  update: <T extends object>(id: number, data: T) => api.put(`/preventive-maintenance/${id}`, data),
  getUpcoming: (days?: number) => api.get('/preventive-maintenance/upcoming', { params: { days } }),
  generateWorkOrder: <T extends object>(id: number, data: T) =>
    api.post(`/preventive-maintenance/${id}/generate-work-order`, data),
  getCalendar: (year: number, month: number) =>
    api.get(`/preventive-maintenance/calendar/${year}/${month}`)
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getShiftCompletion: (date?: string) => api.get('/dashboard/shift-completion', { params: { date } }),
  getActivities: (limit?: number) => api.get('/dashboard/activities', { params: { limit } }),
  getKPIs: (period?: string) => api.get('/dashboard/kpis', { params: { period } })
};

export const appStateApi = {
  get: (key: string) => api.get(`/app-state/${encodeURIComponent(key)}`),
  getMany: (keys: string[]) => api.get('/app-state', { params: { keys: keys.join(',') } }),
  set: <T>(key: string, value: T) =>
    api.put(`/app-state/${encodeURIComponent(key)}`, { value })
};

export const backupsApi = {
  getSettings: () => api.get('/backups/settings'),
  updateSettings: (data: Partial<BackupSettings>) => api.put('/backups/settings', data),
  runNow: () => api.post('/backups/run')
};

export const jobEntriesApi = {
  getPlanned: () => api.get('/job-entries/planned'),
  createPlanned: <T extends object>(data: T) => api.post('/job-entries/planned', data),
  updatePlanned: <T extends object>(recordId: string, data: T) =>
    api.put(`/job-entries/planned/${encodeURIComponent(recordId)}`, data),
  deletePlanned: (recordId: string) =>
    api.delete(`/job-entries/planned/${encodeURIComponent(recordId)}`),
  getCompleted: (params?: QueryParams) => api.get('/job-entries/completed', { params }),
  createCompleted: <T extends object>(data: T) => api.post('/job-entries/completed', data),
  updateCompleted: <T extends object>(recordId: string, data: T) =>
    api.put(`/job-entries/completed/${encodeURIComponent(recordId)}`, data),
  updateCompletedAnalysis: <T extends object>(recordId: string, data: T) =>
    api.patch(`/job-entries/completed/${encodeURIComponent(recordId)}/analysis-assignment`, data),
  deleteCompleted: (recordId: string) =>
    api.delete(`/job-entries/completed/${encodeURIComponent(recordId)}`)
};

export default api;
