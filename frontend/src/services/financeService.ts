/**
 * src/services/financeService.ts
 */
import api from './api';

const financeService = {
  // Invoices
  async listInvoices(params?: Record<string, any>) {
    const { data } = await api.get('/api/finance/invoices/', { params });
    return data;
  },
  async getInvoice(id: string) {
    const { data } = await api.get(`/api/finance/invoices/${id}/`);
    return data;
  },

  // Payouts
  async listPayouts(params?: Record<string, any>) {
    const { data } = await api.get('/api/finance/payouts/', { params });
    return data;
  },
  async createPayout(payload: Record<string, any>) {
    const { data } = await api.post('/api/finance/payouts/', payload);
    return data;
  },

  // Wallet
  async getWalletBalance() {
    const { data } = await api.get('/api/finance/wallet/balance/');
    return data?.balance || 0;
  },
  async listWalletTransactions(params?: Record<string, any>) {
    const { data } = await api.get('/api/finance/wallet/', { params });
    return data;
  },

  // Promos
  async listPromos(params?: Record<string, any>) {
    const { data } = await api.get('/api/finance/promos/', { params });
    return data;
  },
  async validatePromo(code: string) {
    const { data } = await api.get('/api/finance/promos/', { params: { search: code, is_active: true } });
    if (data?.results?.length > 0 || Array.isArray(data) && data.length > 0) {
      const match = data.results ? data.results[0] : data[0];
      if (match.code.toLowerCase() === code.toLowerCase()) return match;
    }
    return null;
  }
};

export default financeService;
