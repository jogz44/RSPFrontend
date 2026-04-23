import { defineStore } from 'pinia';
import { raterApi } from 'src/boot/axios_rater';
import { getApplicantScore, raterListWithJob } from 'src/service/raterService';

export const use_rating_form_store = defineStore('rating_form_store', {
  state: () => ({
    data: null,
    loading: false,
    error: null,
    rater: null,
    raterApplicants: [], 
  }),

  getters: {
    ratingScores: (state) => state.data?.rating_scores || [],
    hasApplicants: (state) =>
      Array.isArray(state.data?.rating_scores) && state.data.rating_scores.length > 0,
  },

  actions: {
    async fetchRatingForm(job_batches_rsp_id) {
      this.loading = true;
      this.error = null;
      this.data = null;


      try {
        const { data } = await raterApi.post('/report/rating-form', {
          job_batches_rsp_id,
        });

        this.data = data;
        return data;
      } catch (err) {
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async raterListWithJob(jobPostId) {
      try {
        const response = await raterListWithJob(jobPostId);
        this.rater = response.data.data; // saves the array to state
        return response.data;
      } catch (error) {
        console.error('Error fetching rater list:', error);
        return null;
      }
    },

  async getApplicantScore(payload) {
  this.loading = true;
  try {
    const response = await getApplicantScore(payload);
    this.raterApplicants = response.data.applicants; // ✅ save to state
    return response.data;
  } finally {
    this.loading = false;
  }
},
  },
});
