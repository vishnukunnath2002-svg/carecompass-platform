/**
 * src/services/patientService.ts
 */
import api from './api';

const patientService = {
  async listProfiles(params?: Record<string, any>) {
    const { data } = await api.get('/api/patients/', { params });
    return data;
  },
  async getProfile(id: string) {
    const { data } = await api.get(`/api/patients/${id}/`);
    return data;
  },
  async createProfile(payload: Record<string, any>) {
    const { data } = await api.post('/api/patients/', payload);
    return data;
  },
  async updateProfile(id: string, payload: Record<string, any>) {
    const { data } = await api.patch(`/api/patients/${id}/`, payload);
    return data;
  },

  // Addresses
  async listAddresses() {
    const { data } = await api.get('/api/patients/addresses/');
    return data;
  },
  async createAddress(payload: Record<string, any>) {
    const { data } = await api.post('/api/patients/addresses/', payload);
    return data;
  },
  async updateAddress(id: string, payload: Record<string, any>) {
    const { data } = await api.patch(`/api/patients/addresses/${id}/`, payload);
    return data;
  },
  async deleteAddress(id: string) {
    await api.delete(`/api/patients/addresses/${id}/`);
  }
};

export default patientService;
