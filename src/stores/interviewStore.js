import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    interviews: [],
    availableApplicants: [],
    details: null,
    batchDetails: null,
    loading: false,
    loadingApplicants: false,
    error: null,

    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  }),

  actions: {
    async fetchInterviews({ page = 1, perPage = 10, search = '' } = {}) {
  try {
    this.loading = true;

    const response = await adminApi.get('/applicant/schedule/list', {
      params: {
        page,
        per_page: perPage,
        search,
      },
    });

    // ✅ MUST be array
    this.interviews = response.data.data ?? [];

    this.currentPage = response.data.current_page;
    this.lastPage = response.data.last_page;
    this.total = response.data.total;
    this.perPage = response.data.per_page;

    this.error = null;
  } catch (err) {
    this.error = err.message;
    console.error('Error fetching interviews:', err);
  } finally {
    this.loading = false;
  }
},


    async fetchAvailableApplicants() {
      try {
        this.loadingApplicants = true;
        const response = await adminApi.get('/applicant/schedule');
        this.availableApplicants = response.data;
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching available applicants:', err);
      } finally {
        this.loadingApplicants = false;
      }
    },

    async fetchScheduleDetails(id) {
      try {
        this.loadingApplicants = true;
        const response = await adminApi.get(`/applicant/schedule/details/${id}`);
        const details = response?.data?.data ?? response?.data ?? null;
        this.details = details;
        this.error = null;
        return details;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching schedule details:', err);
        throw err;
      } finally {
        this.loadingApplicants = false;
      }
    },

    async fetchBatchDetails(date, time = null) {
      try {
        this.loadingApplicants = true;
        let url = `/applicant/schedule/details/${date}`;
        if (time && time !== 'Not Set') {
          const cleanTime = time.replace(/\s*(AM|PM)\s*/i, '').trim();
          url += `/${cleanTime}`;
        }

        const response = await adminApi.get(url);
        this.batchDetails = response.data?.data || response.data || null;
        this.error = null;
        return this.batchDetails;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching batch details:', err);
        throw err;
      } finally {
        this.loadingApplicants = false;
      }
    },

    async scheduleInterview(scheduleData) {
      try {
        this.loading = true;
        const response = await adminApi.post('/email/send/interview', scheduleData, {
          validateStatus: (status) => status < 500,
        });
        this.error = null;
        return response;
      } catch (err) {
        console.error('Error scheduling interview:', err.message || err);
        return { data: { success: false, message: 'An error occurred' } };
      } finally {
        this.loading = false;
      }
    },

    clearBatchDetails() {
      this.batchDetails = null;
      this.details = null;
    },
  },
});
