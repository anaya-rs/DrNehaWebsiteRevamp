import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/admin/login')
    ) {
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  },
)

export default api

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
}

// ─── Appointments ────────────────────────────────────────────────────────────
export const appointmentsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get('/appointments', { params }),
  patch: (id: string, data: Record<string, unknown>) =>
    api.patch(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
  exportCsv: () =>
    api.get('/appointments/export.csv', { responseType: 'blob' }),
  getAvailability: () => api.get('/availability'),
  setAvailability: (data: unknown) => api.put('/availability', data),
}

// ─── Media ───────────────────────────────────────────────────────────────────
export const mediaApi = {
  list: (params?: Record<string, string | number>) =>
    api.get('/media', { params }),
  upload: (form: FormData) =>
    api.post('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  patch: (id: string, data: Record<string, unknown>) =>
    api.patch(`/media/${id}`, data),
  delete: (id: string) => api.delete(`/media/${id}`),
  getGallerySettings: () => api.get('/gallery/settings'),
  putGallerySettings: (data: unknown) => api.put('/gallery/settings', data),
}

// ─── Posts ───────────────────────────────────────────────────────────────────
export const postsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get('/posts', { params }),
  create: (data: unknown) => api.post('/posts', data),
  get: (id: string) => api.get(`/posts/${id}`),
  update: (id: string, data: unknown) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
}

// ─── Pages ───────────────────────────────────────────────────────────────────
export const pagesApi = {
  get: (section: string) => api.get(`/pages/${section}`),
  update: (section: string, data: unknown) => api.put(`/pages/${section}`, data),
}

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: (section: string) => api.get(`/settings/${section}`),
  update: (section: string, data: unknown) =>
    api.put(`/settings/${section}`, data),
  testEmail: () => api.post('/settings/test-email'),
  testSms: () => api.post('/settings/test-sms'),
}

// ─── Public ──────────────────────────────────────────────────────────────────
export const publicApi = {
  getPageSection: (section: string) =>
    api.get(`/public/pages/${section}`),
  getPosts: (params?: Record<string, string | number>) =>
    api.get('/public/posts', { params }),
  getPost: (slug: string) => api.get(`/public/posts/${slug}`),
  getMedia: (params?: Record<string, string | number>) =>
    api.get('/public/media', { params }),
  getGallerySettings: () => api.get('/public/gallery/settings'),
  getContact: () => api.get('/public/settings/contact'),
  getClinics: () => api.get('/public/settings/clinics'),
  getSocial: () => api.get('/public/settings/social'),
  getEmergency: () => api.get('/public/settings/emergency'),
  getAvailability: () => api.get('/public/availability'),
  submitAppointment: (data: unknown) => api.post('/appointments', data),
}
