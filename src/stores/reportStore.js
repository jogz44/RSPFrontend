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
    async fetchApplicantList(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/${date}`);
        // The response data is nested: response.data.data.data
        this.report = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching report positions:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchInternalList(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/internal/service/${date}`);
        // The response data is nested: response.data.data.data
        this.report = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching report positions:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchWithdrawnApplicantList(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/withraw/application/${date}`);
        // The response data is nested: response.data.data.data
        this.report = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching report positions:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
