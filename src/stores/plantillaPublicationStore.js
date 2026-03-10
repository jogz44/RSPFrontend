import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';

export const usePlantillaPublicationStore = defineStore('plantillaPublication', {
  state: () => ({
    loading: false,
    error: null,
    result: null,
  }),

  actions: {
    async generateJobPosition(selectedPositions) {
      this.loading = true;
      this.error = null;
      this.result = null;

      try {
        const ids = selectedPositions.map((p) => Number(p.ID));

        const response = await adminApi.post(
          '/generate/job-position',
          { ids },
          { responseType: 'blob' },
        );

        // Build a temporary object URL and trigger browser download
        const blob = new Blob([response.data], {
          type: 'application/vnd.ms-excel.sheet.macroEnabled.12',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Request for Publication of Vacant Positions.xlsm');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        this.result = true;
        return true;
      } catch (err) {
        // Blob error responses need to be parsed back to text/JSON
        if (err?.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          try {
            const parsed = JSON.parse(text);
            this.error = parsed?.message ?? 'Something went wrong';
          } catch {
            this.error = text || 'Something went wrong';
          }
        } else {
          this.error = err?.response?.data?.message ?? err.message ?? 'Something went wrong';
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.loading = false;
      this.error = null;
      this.result = null;
    },
  },
});
