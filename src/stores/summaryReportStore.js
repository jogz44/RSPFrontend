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

    async fetchPositionWithBEI() {
      try {
        this.loading = true;
        const response = await adminApi.get('/report/job-bei');
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
        const response = await adminApi.get('/report/list-date/publication');
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

    async fetchPostingPublicationDateList() {
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

    async fetchPublicationDateNewEmployee() {
      try {
        this.loading = true;
        const response = await adminApi.get('/report/job-publication');
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

    async fetchNewEmployeeReport(publicationDate, effectiveDate) {
      try {
        this.loading = true;
        const response = await adminApi.post('/report/list-of-appointed', {
          publication_date: publicationDate,
          effective_date: effectiveDate,
        });
        this.positionDetails = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error fetching new employee report:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchListPositionReport(publicationDate) {
      try {
        this.loading = true;
        const response = await adminApi.post('/report/publication-job', {
          post_date: publicationDate,
        });
        this.positionDetails = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error fetching new employee report:', err);
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

    // ==================== EXCEL REPORT GENERATION METHODS ====================

    /**
     * Format date to YYYY-MM-DD
     * @param {string} date - Date string in any format
     * @returns {string} Formatted date in YYYY-MM-DD
     */
    formatDateToYYYYMMDD(date) {
      if (!date) return '';

      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }

      try {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.warn('Invalid date:', date);
          return date;
        }

        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Error formatting date:', error);
        return date;
      }
    },

    /**
     * Generate List of Position Excel Report
     * @param {string} publicationDate - Publication date (will be formatted to YYYY-MM-DD)
     * @returns {Promise<Blob>} Excel file blob
     */
    async generateListOfPositionExcel(publicationDate) {
      try {
        this.loading = true;
        const formattedDate = this.formatDateToYYYYMMDD(publicationDate);
        const response = await adminApi.post(
          '/generate/list/jobPost',
          { post_date: formattedDate },
          { responseType: 'blob' },
        );
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error generating List of Position Excel:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Generate Prequalified Applicant Excel Report
     * @param {string} publicationDate - Publication date (will be formatted to YYYY-MM-DD)
     * @returns {Promise<Blob>} Excel file blob
     */
    async generatePrequalifiedApplicantExcel(publicationDate) {
      try {
        this.loading = true;
        const formattedDate = this.formatDateToYYYYMMDD(publicationDate);
        const response = await adminApi.post(
          '/generate/applicant/qualified',
          { post_date: formattedDate },
          { responseType: 'blob' },
        );
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error generating Prequalified Applicant Excel:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Generate Unqualified (For QS Validation) Applicant Excel Report
     * @param {string} publicationDate - Publication date (will be formatted to YYYY-MM-DD)
     * @returns {Promise<Blob>} Excel file blob
     */
    async generateUnqualifiedApplicantExcel(publicationDate) {
      try {
        this.loading = true;
        const formattedDate = this.formatDateToYYYYMMDD(publicationDate);
        const response = await adminApi.post(
          '/generate/applicant/unqualified',
          { post_date: formattedDate },
          { responseType: 'blob' },
        );
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error generating Unqualified Applicant Excel:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Generate All Applicant with Demographics Excel Report
     * @param {string} publicationDate - Publication date (will be formatted to YYYY-MM-DD)
     * @returns {Promise<Blob>} Excel file blob
     */
    async generateAllApplicantExcel(publicationDate) {
      try {
        this.loading = true;
        const formattedDate = this.formatDateToYYYYMMDD(publicationDate);
        const response = await adminApi.post(
          '/generate/applicant',
          { post_date: formattedDate },
          { responseType: 'blob' },
        );
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error generating All Applicant Excel:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Delete application by submission ID
    async deleteApplication({ id }) {
      this.loading = true;
      try {
        await adminApi.delete(`/applicant/delete/submission/${id}`);
        this.error = null;
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error deleting application:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Fetch image with auth token via adminApi and return base64
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
