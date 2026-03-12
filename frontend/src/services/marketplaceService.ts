/**
 * src/services/marketplaceService.ts
 */
import api from './api';

const marketplaceService = {
  // Products
  async listProducts(params?: Record<string, any>) {
    const { data } = await api.get('/api/marketplace/products/', { params });
    return data;
  },
  async getProduct(id: string) {
    const { data } = await api.get(`/api/marketplace/products/${id}/`);
    return data;
  },

  // Categories
  async getCategories() {
    const { data } = await api.get('/api/marketplace/product-categories/');
    return data;
  },

  // Orders
  async listOrders(params?: Record<string, any>) {
    const { data } = await api.get('/api/marketplace/orders/', { params });
    return data;
  },
  async createOrder(payload: Record<string, any>) {
    const { data } = await api.post('/api/marketplace/orders/', payload);
    return data;
  },
  async updateOrder(id: string, payload: Record<string, any>) {
    const { data } = await api.patch(`/api/marketplace/orders/${id}/`, payload);
    return data;
  },

  // Medical Stores
  async listStores(params?: Record<string, any>) {
    const { data } = await api.get('/api/marketplace/stores/', { params });
    return data;
  },
  async getStore(id: string) {
    const { data } = await api.get(`/api/marketplace/stores/${id}/`);
    return data;
  },

  // Store Inventory
  async listStoreInventory(storeId: string, params?: Record<string, any>) {
    const { data } = await api.get('/api/marketplace/store-inventory/', { params: { ...params, store_id: storeId } });
    return data;
  },

  // Store Orders
  async listStoreOrders(params?: Record<string, any>) {
    const { data } = await api.get('/api/marketplace/store-orders/', { params });
    return data;
  },
  async createStoreOrder(payload: Record<string, any>) {
    const { data } = await api.post('/api/marketplace/store-orders/', payload);
    return data;
  },
};

export default marketplaceService;
