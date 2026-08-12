import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('jt_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jt_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login:         (d) => api.post('/auth/login', d),
  register:      (d) => api.post('/auth/register', d),
  logout:        ()  => api.post('/auth/logout'),
  me:            ()  => api.get('/auth/me'),
  forgotPass:    (e) => api.post('/auth/forgot-password', { email: e }),
  resetPass:     (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// Users (profile)
export const userAPI = {
  getProfile:    ()  => api.get('/users/profile'),
  updateProfile: (d) => api.put('/users/profile', d),
  changePass:    (d) => api.put('/users/change-password', d),
};

// Jobs
export const jobAPI = {
  getAll:  (params) => api.get('/jobs', { params }),
  getOne:  (id)     => api.get(`/jobs/${id}`),
  create:  (d)      => api.post('/jobs', d),
  update:  (id, d)  => api.put(`/jobs/${id}`, d),
  delete:  (id)     => api.delete(`/jobs/${id}`),
};

// Applications
export const appAPI = {
  getAll:  (params) => api.get('/applications', { params }),
  getStats:()       => api.get('/applications/stats'),
  getOne:  (id)     => api.get(`/applications/${id}`),
  create:  (d)      => api.post('/applications', d),
  update:  (id, d)  => api.put(`/applications/${id}`, d),
  delete:  (id)     => api.delete(`/applications/${id}`),
};

// Documents
export const docAPI = {
  getAll:  ()       => api.get('/documents'),
  upload:  (form)   => api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id)     => api.delete(`/documents/${id}`),
  download:(id)     => api.get(`/documents/download/${id}`, { responseType: 'blob' }),
};

// Reminders
export const reminderAPI = {
  getAll:  ()       => api.get('/reminders'),
  create:  (d)      => api.post('/reminders', d),
  update:  (id, d)  => api.put(`/reminders/${id}`, d),
  delete:  (id)     => api.delete(`/reminders/${id}`),
};

// Admin
export const adminAPI = {
  getStats:     ()      => api.get('/admin/stats'),
  getUsers:     (params)=> api.get('/admin/users', { params }),
  toggleUser:   (id)    => api.put(`/admin/users/${id}/toggle`),
  deleteUser:   (id)    => api.delete(`/admin/users/${id}`),
  getApps:      ()      => api.get('/admin/applications'),
  deleteApp:    (id)    => api.delete(`/admin/applications/${id}`),
};

export default api;