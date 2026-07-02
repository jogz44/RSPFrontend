import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

export const useAdvanceAppointmentStore = defineStore('advanceAppointment', {
  state: () => ({
    employeeList: [],
    appointmentDetails: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchEmployeeList() {
      try {
        this.loading = true;
        const response = await adminApi.get('/appointment/advance/list');

        this.employeeList = response.data?.data ?? [];
        this.error = null;
        return this.employeeList;
      } catch (err) {
        this.error = err.message || 'Error fetching employee list';
        console.error('Error fetching employee list:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchAppointmentDetails(controlNo) {
      try {
        this.loading = true;
        const response = await adminApi.get(`/plantilla/appointment/${controlNo}`);
        this.appointmentDetails = response.data;
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.message || 'Error fetching appointment details';
        console.error('Error fetching appointment details:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetStore() {
      this.employeeList = [];
      this.appointmentDetails = null;
      this.loading = false;
      this.error = null;
    },
  },
});
