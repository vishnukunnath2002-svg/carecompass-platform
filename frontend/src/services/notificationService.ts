/**
 * src/services/notificationService.ts
 */
import api from './api';

const notificationService = {
  async list(params?: Record<string, any>) {
    const { data } = await api.get('/api/notifications/', { params });
    return data;
  },
  
  async markRead(id: string) {
    const { data } = await api.patch(`/api/notifications/${id}/mark-read/`);
    return data;
  },

  async markAllRead() {
    const { data } = await api.post('/api/notifications/mark-all-read/');
    return data;
  },

  async delete(id: string) {
    await api.delete(`/api/notifications/${id}/`);
  }
};

export default notificationService;
