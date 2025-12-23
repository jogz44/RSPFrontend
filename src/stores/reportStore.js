// stores/reportStore.js
import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useReportStore = defineStore('report', {
  state: () => ({
    report: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPositionList() {
      try {
        this.loading = true;
        const response = await adminApi.get('/report/job-post');
        this.report = response.data;
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching report positions:', err);
      } finally {
        this.loading = false;
      }
    },
    async fetchApplicantList(id) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/job-post/${id}`);
        this.report = response.data;
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching report positions:', err);
      } finally {
        this.loading = false;
      }
    },
  },
});
