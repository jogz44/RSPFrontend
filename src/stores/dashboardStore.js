import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';
import { toast } from 'src/boot/toast';

export const DashboardStore = defineStore('dashboard', {
  state: () => ({
    // publish_jobpost
    published_position: 0,
    publication_date: null,

    // applicant_application
    qualified: 0,
    for_assessment: 0,
    unqualified: 0,
    total_applicantion: 0,
    internal_applicantion: 0,
    external_application: 0,

    // plantilla_position
    funded: 0,
    unfunded: 0,
    filled: 0,
    vacant: 0,
    total_positions: 0,

    // applicant_actual_application
    internal_applicant: 0,
    external_applicant: 0,
    total_applicant: 0,

    summaryByOffice: [],
    vw_status: [],
    loading: false,
    error: null,
  }),

  actions: {
    async status() {
      if (this.loading) return;

      this.loading = true;
      this.error = null;
      try {
        const response = await adminApi.get('dashboard');
        const data = response.data;

        // publish_jobpost
        this.published_position = data.publish_jobpost.vacant;
        this.publication_date = data.publish_jobpost.post_date;

        // applicant_application
        this.qualified = data.applicant_application.qualified;
        this.for_assessment = data.applicant_application.pending;
        this.unqualified = data.applicant_application.unqualified;
        this.total_application = data.applicant_application.total_applicant;
        this.internal_application = data.applicant_application.internal;
        this.external_application = data.applicant_application.external;

        // plantilla_position
        this.funded = data.plantilla_position.funded;
        this.unfunded = data.plantilla_position.unfunded;
        this.filled = data.plantilla_position.occupied;
        this.vacant = data.plantilla_position.unoccupied;
        this.total_positions = data.plantilla_position.total_positions;

        // applicant_actual_application
        this.internal_applicant = data.applicant_actual_application.internal_actual;
        this.external_applicant = data.applicant_actual_application.external_actual;
        this.total_applicant = data.applicant_actual_application.total_application_actual;

        return data;
      } catch (error) {
        console.error('Error fetching the status:', error);
        this.error = 'Failed to fetch status summary.';
      } finally {
        this.loading = false;
      }
    },

    async fetchSummaryByOffice() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminApi.get('/dashboard/summary-by-office');
        this.summaryByOffice = response.data || [];
        return this.summaryByOffice;
      } catch (error) {
        this.summaryByOffice = [];
        const errorMessage = error.response?.data?.message || 'Failed to fetch summary by office';
        console.log(errorMessage);
        toast.warning(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    async fetch_vwActive() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminApi.get('/vw-Active');
        return response.data.data;
      } catch {
        toast.error('Failed to Load vwactive');
      }
    },

    async fetchStatus(status) {
      this.loading = true;
      const jsonEncode = {
        status: status,
      };
      try {
        const response = await adminApi.post('/vw-Active/status', jsonEncode);
        this.vw_status = response.data.data;
      } catch (error) {
        this.vw_status = [];
        this.loading = false;
        console.log(error.response.data?.message);
        toast.warning(error.response.data?.message);
      }
    },
  },
});
