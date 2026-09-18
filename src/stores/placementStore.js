import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';
import { toast } from 'src/boot/toast';

export const usePlacementStore = defineStore('placement', {
  state: () => ({
    // ============= PLACEMENTS =============
    placements: [],
    officeStructure: null,
    officeEmployees: [],
    reassignments: [],

    // ============= ACTING HEADS =============
    actingHeads: [], // acting heads of an office (for the table)
    actingEmployees: [], // employees eligible to become acting heads (for the modal)

    // ============= SHARED =============
    loading: false,

    // ============= REASSIGNMENT HISTORY =============
    employeeHistory: null,
    historyLoading: false,
  }),

  actions: {
    /* ---------------------------------------------------------------------- */
    /* PLACEMENTS (JO, CASUAL, HONORARIUM)                                    */
    /* ---------------------------------------------------------------------- */

    async fetchPlacements(office) {
      this.loading = true;
      try {
        const res = await adminApi.get(`/assign/${office}`);
        this.placements = res.data?.data || [];
      } catch {
        toast.error('Failed to load placements');
        this.placements = [];
      } finally {
        this.loading = false;
      }
    },

    async storePlacement(data) {
      this.loading = true;
      try {
        const res = await adminApi.post('/assign/store', data);
        await this.fetchPlacements(data.office);
        toast.success('Employee assigned successfully');
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to assign employee';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePlacement(controlNo, data) {
      this.loading = true;
      try {
        const res = await adminApi.put(`/assign/update/${controlNo}`, data);
        if (data.office) {
          await this.fetchPlacements(data.office);
        }
        toast.success('Employee reassigned successfully');
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update assignment';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deletePlacement(controlNo, office) {
      this.loading = true;
      try {
        await adminApi.delete(`/assign/delete/${controlNo}`);
        if (office) {
          await this.fetchPlacements(office);
        }
        toast.success('Employee unassigned successfully');
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete assignment';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /* ---------------------------------------------------------------------- */
    /* REASSIGNMENTS                                                          */
    /* ---------------------------------------------------------------------- */

    async fetchReassignments(office) {
      this.loading = true;
      try {
        const res = await adminApi.get(`/re-assign/${office}`);
        this.reassignments = res.data?.data || [];
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to load reassignments';
        toast.error(errorMessage);
        this.reassignments = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async storeReassignment(data) {
      this.loading = true;
      try {
        const res = await adminApi.post('/re-assign/store', data);
        if (data.office) {
          await this.fetchReassignments(data.office);
        }
        toast.success('Reassignment created successfully');
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to create reassignment';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateReassignment(employeeReAssignId, data) {
      this.loading = true;
      try {
        const res = await adminApi.put(`/re-assign/update/${employeeReAssignId}`, data);
        if (data.office) {
          await this.fetchReassignments(data.office);
        }
        toast.success('Reassignment updated successfully');
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update reassignment';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async returnReassignment(employeeReAssignId) {
      this.loading = true;
      try {
        const res = await adminApi.put(`/re-assign/return/${employeeReAssignId}`, {
          active: '0',
        });
        toast.success('Return status updated successfully');
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update return status';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /* ---------------------------------------------------------------------- */
    /* ACTING HEADS                                                           */
    /* ---------------------------------------------------------------------- */

    // Fetch acting heads belonging to an office (for the table)
    async fetchActingHeads(office) {
      this.loading = true;
      try {
        const res = await adminApi.get(`/acting/head/list/${office}`);
        this.actingHeads = res.data?.data || [];
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to load acting heads';
        toast.error(errorMessage);
        this.actingHeads = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch employees eligible to become acting head (for the Add modal)
    async fetchActingEmployees(office) {
      this.loading = true;
      try {
        const res = await adminApi.get(`/acting/list/office/employee/${office}`);
        this.actingEmployees = res.data?.data || [];
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to load employees';
        toast.error(errorMessage);
        this.actingEmployees = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Store a new acting head
    async storeActingHead(data) {
      this.loading = true;
      try {
        const res = await adminApi.post('/acting/employee/store', data);
        toast.success('Acting head assigned successfully');
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to assign acting head';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Delete an acting head by its ID
    async deleteActingHead(employeeId) {
      this.loading = true;
      try {
        await adminApi.delete(`/acting/delete/${employeeId}`);
        toast.success('Acting head removed successfully');
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to remove acting head';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /* ---------------------------------------------------------------------- */
    /* REASSIGNMENT HISTORY                                                   */
    /* ---------------------------------------------------------------------- */

    async fetchHistory(controlNo) {
      this.historyLoading = true;
      try {
        const res = await adminApi.get(`/assign/history/${controlNo}`);
        this.employeeHistory = res.data?.data || null;
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to load reassignment history';
        toast.error(errorMessage);
        this.employeeHistory = null;
        throw error;
      } finally {
        this.historyLoading = false;
      }
    },

    /* ---------------------------------------------------------------------- */
    /* RESET HELPERS                                                          */
    /* ---------------------------------------------------------------------- */

    resetHistory() {
      this.employeeHistory = null;
      this.historyLoading = false;
    },

    resetOfficeData() {
      this.officeStructure = null;
      this.officeEmployees = [];
      this.reassignments = [];
      this.actingHeads = [];
      this.actingEmployees = [];
    },

    resetAll() {
      this.placements = [];
      this.officeStructure = null;
      this.officeEmployees = [];
      this.reassignments = [];
      this.actingHeads = [];
      this.actingEmployees = [];
      this.employeeHistory = null;
      this.historyLoading = false;
      this.loading = false;
    },
  },
});
