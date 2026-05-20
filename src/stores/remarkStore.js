import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';

export const useRemarkStore = defineStore('remark', {
  state: () => ({
    remarks: [],
    loading: false,
    pagination: {
      total: 0,
      page: 1,
      perPage: 10,
    },
  }),

  getters: {
    allRemarks: (state) => state.remarks,
  },

  actions: {
    async fetchRemarks() {
      this.loading = true;
      try {
        const response = await adminApi.get('/library/remark/index');
        this.remarks = response.data?.data ?? response.data ?? [];
        this.pagination.total = this.remarks.length;
      } catch (error) {
        console.error('Failed to fetch remarks:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async storeRemark(payload) {
      this.loading = true;
      try {
        const response = await adminApi.post('/library/remark/store', payload);
        await this.fetchRemarks();
        return response.data;
      } catch (error) {
        console.error('Failed to store remark:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateRemark(remarksId, payload) {
      this.loading = true;
      try {
        const response = await adminApi.post(`/library/remark/update/${remarksId}`, payload);
        await this.fetchRemarks();
        return response.data;
      } catch (error) {
        console.error('Failed to update remark:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteRemark(remarksId) {
      this.loading = true;
      try {
        const response = await adminApi.delete(`/library/remark/delete/${remarksId}`);
        await this.fetchRemarks();
        return response.data;
      } catch (error) {
        console.error('Failed to delete remark:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
