import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useSummaryReportStore = defineStore('summaryReport', {
  state: () => ({
    positions: [],
    publicationDates: [],
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
        const response = await adminApi.get(`/report/final-summary-rating/${jobpostId}`);

        if (response.data.message && !response.data.applicants) {
          console.warn(`No ratings for job post ${jobpostId}:`, response.data.message);
          this.error = response.data.message;
          return null;
        }

        this.positionDetails = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error fetching applicant details:', err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchApplicantPosition(jobpostId) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/per-position/${jobpostId}`);

        if (response.data.message && !response.data.applicants) {
          console.warn(`No ratings for job post ${jobpostId}:`, response.data.message);
          this.error = response.data.message;
          return null;
        }

        this.positionDetails = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error fetching applicant details:', err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchPublicationDateList() {
      try {
        this.loading = true;
        const response = await adminApi.get('/job-batches-rsp/postdate');
        this.publicationDates = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching publication dates:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchTopApplicantReport(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/ranking/applicant/${date}`);
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

    async fetchQualifiedReport(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/qualified/${date}`);
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching qualified report:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUnqualifiedReport(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/applicant/unqualified/${date}`);
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching unqualified report:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchTopQualifiedReport(date) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/report/ranking/applicant/${date}`);
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

    // ✅ NEW: Fetch image with auth token via adminApi and return base64
    async fetchImageBase64(imageUrl) {
      try {
        const response = await adminApi.get(imageUrl, { responseType: 'blob' });
        const blob = response.data;

        if (!blob || blob.size === 0) return null;

        // only allow png/jpg/jpeg
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(blob.type)) return null;

        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error('Error fetching image:', imageUrl, err);
        return null;
      }
    },
  },
});
