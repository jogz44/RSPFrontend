import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';
import { toast } from 'src/boot/toast'; // Import toast instance

export const DashboardStore = defineStore('dashboard', {
  state: () => ({
    fundedData: null,
    summaryByOffice: [],

    vw_active: [],
    vw_status: [],
    totalMale: 0,
    totalFemale: 0,
    countAll: 0,
    loading: false,
    error: null,
    qualified: 0,
    unqualified: 0,
    pending: 0,
    total: 0,
    total_applicant: 0,
    total_positions: 0,
    internal: 0,
    external: 0,
  }),

  actions: {
    async status() {
      if (this.loading) return; // ← guard against duplicate calls

      this.loading = true;
      this.error = null;
      try {
        const response = await adminApi.get('dashboard');
        const data = response.data;

        this.fundedData = {
          total_positions: data.total_positions,
          total_applicant: data.total_applicant,
          funded: data.funded,
          unfunded: data.unfunded,
          occupied: data.occupied,
          unoccupied: data.unoccupied,
          internal: data.internal,
          external: data.external,
        };

        this.total_applicant = data.total_applicant;
        this.qualified = data.qualified;
        this.unqualified = data.unqualified;
        this.pending = data.pending;
        this.external = data.external;
        this.internal = data.internal;

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

    async fetchCountAll() {
      this.loading = true;
      try {
        const response = await adminApi.get('/vw-Active/count');
        this.countAll = response.data.total;
      } catch (error) {
        this.countAll = 0;
        console.log(error.response.data?.message);
        toast.warning(error.response.data?.message);
      }
    },

    async getSexCount() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminApi.get('/vw-Active/Sex');
        this.totalMale = response.data.totalMale;
        this.totalFemale = response.data.totalFemale;
      } catch (error) {
        this.totalMale = 0;
        this.totalFemale = 0;
        const errorMessage = error.response?.data?.message || 'Failed to fetch sex count';
        console.log(errorMessage);
        toast.warning(errorMessage);
      }
    },
  },
});
