import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useApplicantStore = defineStore('applicant', {
  state: () => ({
    applicants: [],
    applicantDetails: null,
    loading: false,
    error: null,

        // pagination meta
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
          params: {
            page,
            per_page: perPage,
            search,
          },
        });

        // Laravel paginator
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

    // async fetchApplicantDetail(firstname, lastname, date_of_birth) {
    //   try {
    //     this.loading = true;
    //     const res = await adminApi.post('/applicant/details', {
    //       firstname,
    //       lastname,
    //       date_of_birth,
    //     });

    //     // unwrap
    //     let detail;
    //     if (Array.isArray(res.data?.data)) detail = res.data.data[0] || {};
    //     else if (res.data?.data) detail = res.data.data;
    //     else if (Array.isArray(res.data)) detail = res.data[0] || {};
    //     else detail = res.data || {};

    //     // normalize job_post
    //     if (!detail.job_post && detail.jobpost) detail.job_post = detail.jobpost;
    //     if (!detail.job_post && Array.isArray(detail.applications)) {
    //       detail.job_post = detail.applications.map((a) => a.job_post || a.jobpost).filter(Boolean);
    //     }

    //     this.applicantDetails = detail;
    //     this.error = null;
    //     return detail;
    //   } catch (err) {
    //     this.error = err.message;
    //     console.error('Error fetching applicant details:', err);
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    async fetchApplicantDetail(firstname, lastname, date_of_birth) {
  try {
    this.loading = true;
    const res = await adminApi.post('/applicant/details', {
      firstname,
      lastname,
      date_of_birth,
    });

    // ✅ Handle the response properly - keep the full array
    let detail;

    // Backend returns { data: [...] }
    if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
      // ✅ Get the first item for personal info, but keep ALL job_post entries
      const firstEntry = res.data.data[0];

      detail = {
        id: firstEntry.nPersonalInfo_id,
        firstname: firstEntry.n_personal_info?.firstname,
        lastname: firstEntry.n_personal_info?.lastname,
        date_of_birth: firstEntry.n_personal_info?.date_of_birth,
        n_personal_info: firstEntry.n_personal_info,
        // ✅ Map ALL job applications from the array
        job_post: res.data.data.map(item => ({
          id: item.job_post?.id || item.id,
          Position: item.job_post?.Position,
          Office: item.job_post?.Office,
          // SalaryGrade: item.job_post?.SalaryGrade,
          status: item.status, // Get status from submission, not job_post
          job_post_status: item.job_post?.status // Original job_post status
        }))
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
      detail.job_post = detail.applications
        .map((a) => a.job_post || a.jobpost)
        .filter(Boolean);
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
