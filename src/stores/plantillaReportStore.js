import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';

export const usePlantillaReportStore = defineStore('plantillaReport', {
  state: () => ({
    loading: false,
    error: null,
    data: null, // Will hold the fetched report data
  }),
  actions: {
    async fetchReport() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminApi.get('/generate'); // Assuming this endpoint returns your report data
        this.data = response.data; // Store the data from the response
      } catch (err) {
        this.error = err;
        this.data = null;
      } finally {
        this.loading = false;
      }
    },
  },
});
