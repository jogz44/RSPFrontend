import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useApplicantStore = defineStore('applicant', {
  state: () => ({
    applicants: [],
    applicantDetails: null,
    loading: false,
    error: null,
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  }),

  actions: {
    async fetchApplicants({ page = 1, perPage = 10, search = '' } = {}) {
      try {
        this.loading = true;
        const res = await adminApi.get('/applicant/list', {
          params: { page, per_page: perPage, search },
        });
        this.applicants = res.data.data;
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
        this.total = res.data.total;
        this.perPage = res.data.per_page;
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

        let detail;

        // Backend returns { success: true, data: [...] }
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const firstEntry = res.data.data[0];

          detail = {
            id: firstEntry.nPersonalInfo_id,
            firstname: firstEntry.n_personal_info?.firstname,
            lastname: firstEntry.n_personal_info?.lastname,
            date_of_birth: firstEntry.n_personal_info?.date_of_birth,
            n_personal_info: firstEntry.n_personal_info,
            personal_info: firstEntry.personal_info,
            // Map ALL job applications from the array with submission ID
            job_post: res.data.data.map((item) => ({
              id: item.id, // submission ID
              Position: item.job_post?.Position,
              Office: item.job_post?.Office,
              SalaryGrade: item.job_post?.SalaryGrade,
              status: item.status,
              job_post_status: item.job_post?.status,
            })),
          };
        } else if (res.data?.data) {
          detail = res.data.data;
        } else if (Array.isArray(res.data)) {
          detail = res.data[0] || {};
        } else {
          detail = res.data || {};
        }

        // Fallback normalization
        if (!detail.job_post && detail.jobpost) {
          detail.job_post = detail.jobpost;
        }
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
