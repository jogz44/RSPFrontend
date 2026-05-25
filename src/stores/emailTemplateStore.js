// stores/emailTemplateStore.js
import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useEmailTemplateStore = defineStore('emailTemplate', {
  state: () => ({
    unqualifiedApplicants: [],
    qualificationRemarks: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUnqualifiedApplicants(jobPostId) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/job-batches-rsp/applicant/unqualified/${jobPostId}`);
        this.unqualifiedApplicants = response.data?.data || response.data || [];
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching unqualified applicants:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchQualificationRemarks(jobPostId, submissionId) {
      try {
        this.loading = true;
        const response = await adminApi.get(
          `/job-batches-rsp/applicant/qualification/remarks/${jobPostId}/${submissionId}`,
        );
        this.qualificationRemarks = response.data?.data || response.data || null;
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching qualification remarks:', err);
      } finally {
        this.loading = false;
      }
    },
  },
});
