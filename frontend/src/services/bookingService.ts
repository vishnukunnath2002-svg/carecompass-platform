/**
 * src/services/bookingService.ts
 * Replaces supabase.from('bookings').select() etc.
 */

import api from './api';

const bookingService = {
  async list(params?: Record<string, any>) {
    const { data } = await api.get('/api/bookings/', { params });
    return data;
  },
  async get(id: string) {
    const { data } = await api.get(`/api/bookings/${id}/`);
    return data;
  },
  async create(payload: Record<string, any>) {
    const { data } = await api.post('/api/bookings/', payload);
    return data;
  },
  async update(id: string, payload: Record<string, any>) {
    const { data } = await api.patch(`/api/bookings/${id}/`, payload);
    return data;
  },
  async delete(id: string) {
    await api.delete(`/api/bookings/${id}/`);
  },
  async updateStatus(id: string, status: string, notes?: string) {
    const { data } = await api.post(`/api/bookings/${id}/update-status/`, { status, notes });
    return data;
  },
  async getStatusHistory(id: string) {
    const { data } = await api.get(`/api/bookings/${id}/history/`);
    return data;
  },

  // Service Requests
  async listServiceRequests(params?: Record<string, any>) {
    const { data } = await api.get('/api/bookings/service-requests/', { params });
    return data;
  },
  async createServiceRequest(payload: Record<string, any>) {
    const { data } = await api.post('/api/bookings/service-requests/', payload);
    return data;
  },
  async updateServiceRequest(id: string, payload: Record<string, any>) {
    const { data } = await api.patch(`/api/bookings/service-requests/${id}/`, payload);
    return data;
  },
};

export default bookingService;
