import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useSummaryReportStore = defineStore('applicant', {
  state: () => ({
    positions: [],
    positionDetails: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPositionWithRating() {
      try {
        this.loading = true;
        const response = await adminApi.get('/report/job/complete');
        this.positions = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching positions:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchApplicantDetail(jobpostId) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant-final-score/${jobpostId}`);
        this.positionDetails = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching applicant details:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
