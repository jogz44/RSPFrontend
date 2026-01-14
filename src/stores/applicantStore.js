import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useApplicantStore = defineStore('applicant', {
  state: () => ({
    applicants: [],
    applicantDetails: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchApplicants() {
      try {
        this.loading = true;
        const res = await adminApi.get('/applicant/list');

        const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

        this.applicants = payload;
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching applicants:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchApplicantDetail(firstname, lastname, date_of_birth) {
      try {
        this.loading = true;
        const res = await adminApi.post('/applicant/details', {
          firstname,
          lastname,
          date_of_birth,
        });

        // unwrap
        let detail;
        if (Array.isArray(res.data?.data)) detail = res.data.data[0] || {};
        else if (res.data?.data) detail = res.data.data;
        else if (Array.isArray(res.data)) detail = res.data[0] || {};
        else detail = res.data || {};

        // normalize job_post
        if (!detail.job_post && detail.jobpost) detail.job_post = detail.jobpost;
        if (!detail.job_post && Array.isArray(detail.applications)) {
          detail.job_post = detail.applications.map((a) => a.job_post || a.jobpost).filter(Boolean);
        }

        this.applicantDetails = detail;
        this.error = null;
        return detail;
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
