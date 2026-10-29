import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';

/**
 * Extracts the employee array from an API response body.
 * The backend wraps lists under different keys depending on the endpoint
 * (e.g. { success, message, applicant: [...] } or { data: [...] }),
 * so we normalize all of them here.
 */
function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.applicant)) return payload.applicant;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.employees)) return payload.employees;
  return [];
}

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

        this.employeeList = extractList(response.data);
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

    async fetchTempEmployeeList() {
      try {
        this.loading = true;
        const response = await adminApi.get('/hire/list/temporary/applicant');

        // Backend shape: { success: true, message: "...", applicant: [...] }
        this.employeeList = extractList(response.data);
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
