import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Customers API
export const getCustomers = () => api.get('/customers');
export const addCustomer = (data) => api.post('/customers', data);

// Invoices API
export const getInvoices = () => api.get('/invoices');
export const createInvoice = (data) => api.post('/invoices', data);
export const cancelInvoice = (id) => api.put(`/invoices/${id}/cancel`);

// Shipments API
export const getShipments = () => api.get('/shipments');
export const addShipment = (data) => api.post('/shipments', data);

// Payments API
export const getPayments = () => api.get('/payments');
export const addPayment = (data) => api.post('/payments', data);

// Rate Cards API
export const getRateCards = () => api.get('/ratecards');
export const getRateCardById = (id) => api.get(`/ratecards/${id}`);
export const createRateCard = (data) => api.post('/ratecards', data);
export const updateRateCard = (id, data) => api.put(`/ratecards/${id}`, data);
export const deleteRateCard = (id) => api.delete(`/ratecards/${id}`);

// Dashboard API
export const getDashboardSummary = () => api.get('/dashboard/summary');

export default api;
