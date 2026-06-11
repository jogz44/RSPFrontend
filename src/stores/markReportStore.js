import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useMarkReportStore = defineStore('markReport', {
  state: () => ({
    markData: null,
    loading: false,
    error: null,
  }),

  actions: {
    // ============================================================================
    // YELLOW MARK REPORT
    // Fetches applicants with yellow mark for a specific date
    // ============================================================================
    async fetchYellowMarkReport(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/qualified/yellow/${date}`);
        this.markData = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error fetching yellow mark report:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ============================================================================
    // GREEN MARK REPORT
    // Fetches applicants with green mark for a specific date
    // ============================================================================
    async fetchGreenMarkReport(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/green/${date}`);
        this.markData = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error fetching green mark report:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
