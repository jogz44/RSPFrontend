import { defineStore } from 'pinia';
import { raterApi } from 'boot/axios_rater';

export const useApplicantsStore = defineStore('applicantRater', {
  state: () => ({
    rows: [],
    details: [],
    total: 0,
  }),

  actions: {
    async fetchApplicants({ page = 1, per_page = 10, search = '' } = {}) {
      const params = { page, per_page };
      if (search) params.search = search;

      const { data } = await raterApi.get('/rater/applicants', { params });
      const pagination = data?.data;
      const list = Array.isArray(pagination?.data) ? pagination.data : [];

      this.rows = list.map((item) => ({
        id: item.nPersonal_id,
        nPersonal_id: item.nPersonal_id,
        firstname: item.firstname,
        lastname: item.lastname,
        date_of_birth: item.date_of_birth,
        applicant_type: item.applicant_type,
        appliedCount: item.applied_job,
      }));

      this.total = pagination?.total ?? 0;
    },

    async fetchApplicantDetails(payload) {
      const { data } = await raterApi.post('/rater/applicant-details', payload);
      const list = Array.isArray(data?.data) ? data.data : [];

      this.details = list.map((item) => ({
        submission_id: item.submission_id,
        position: item.job_post?.position || '-',
        office: item.job_post?.office || '-',
        salary_grade: item.job_post?.salary_grade || '-',
        job_post_id: item.job_post?.id || item.job_post_id,
      }));

      return this.details;
    },

    clearDetails() {
      this.details = [];
    },
  },
});
