import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';
import { toast } from 'src/boot/toast';

export const useMarkingStore = defineStore('marking', {
  state: () => ({
    reports: [],
    loading: false,
  }),

  actions: {
    async fetchQualifiedReports(date) {
      this.loading = true;
      try {
        const response = await adminApi.get(`/report/qualified/${date}`);
        this.reports = response.data.applicants || [];
      } catch {
        toast.error('Failed to load reports');
        this.reports = [];
      } finally {
        this.loading = false;
      }
    },

    // For single or batch update - accepts array of submission IDs
    async updateTagColor(submissionIds, tagColor) {
      this.loading = true;
      try {
        // Ensure submissionIds is always an array
        const ids = Array.isArray(submissionIds) ? submissionIds : [submissionIds];

        const response = await adminApi.post('/applicant/tag/color', {
          submission_id: ids,
          tag_color: tagColor,
        });

        // Update the local state for all affected reports
        ids.forEach((id) => {
          const report = this.reports.find((r) => r.submission_id === id);
          if (report) {
            report.tag_color = tagColor;
          }
        });

        toast.success(`Tag color updated for ${ids.length} applicant(s)`);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update tag color';
        toast.error(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
