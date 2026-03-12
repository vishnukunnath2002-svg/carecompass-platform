/**
 * src/services/caregiverService.ts
 */
import api from './api';

const caregiverService = {
  async list(params?: Record<string, any>) {
    const { data } = await api.get('/api/caregivers/', { params });
    return data;
  },
  async get(id: string) {
    const { data } = await api.get(`/api/caregivers/${id}/`);
    return data;
  },
  async create(payload: Record<string, any>) {
    const { data } = await api.post('/api/caregivers/', payload);
    return data;
  },
  async update(id: string, payload: Record<string, any>) {
    const { data } = await api.patch(`/api/caregivers/${id}/`, payload);
    return data;
  },
  
  // Specializations
  async getSpecializations(params?: Record<string, any>) {
    const { data } = await api.get('/api/caregivers/specializations/', { params });
    return data;
  }
};

export default caregiverService;
