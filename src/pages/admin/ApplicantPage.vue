<template>
  <q-page class="q-pa-md">
    <div>
      <h5 class="text-h5 q-ma-none"><b>Applicants</b></h5>
      <div class="row justify-end items-center q-mb-md">
        <q-input
          v-model="globalSearch"
          outlined
          dense
          placeholder="Search applicants..."
          style="max-width: 300px"
          clearable
        >
          <template #prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
        <q-btn
          color="orange"
          icon="article"
          label="Report"
          class="text-white q-ml-sm"
          @click="openReportDialog"
        >
          <q-tooltip>List of Applicant Report</q-tooltip>
        </q-btn>
      </div>

      <q-table
        :rows="filteredApplicants"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="applicantStore.loading"
        class="q-mt-md"
        flat
      >
        <template #body-cell-name="p">
          <q-td :props="p">{{ p.row.firstname }} {{ p.row.lastname }}</q-td>
        </template>
        <template #body-cell-jobpost="p">
          <q-td :props="p">{{ p.row.jobpost || 0 }}</q-td>
        </template>
        <template #body-cell-action="p">
          <q-td :props="p">
            <q-btn
              round
              flat
              color="blue"
              icon="visibility"
              @click="viewApplicant(p.row)"
              class="bg-blue-1"
            >
              <q-tooltip>View Applicant</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width row flex-center q-pa-md text-grey">No Applicants Found</div>
        </template>
      </q-table>
    </div>

    <!-- Report Modal -->
    <q-dialog v-model="showReportModal" persistent>
      <q-card style="min-width: 800px; max-width: 1000px; width: 100%">
        <q-card-section>
          <div class="text-h6">Report Filters</div>
        </q-card-section>
        <q-card-section>
          <q-option-group
            v-model="dateFilterType"
            :options="[
              { label: 'Single Date', value: 'single' },
              { label: 'Date Range', value: 'range' },
            ]"
            type="radio"
            inline
          />
          <div v-if="dateFilterType === 'single'" class="q-mt-sm">
            <q-input v-model="singleDate" label="Select Date" outlined>
              <template #append>
                <q-icon name="event" @click="showDatePicker = true" />
              </template>
            </q-input>
            <q-dialog v-model="showDatePicker">
              <q-date
                v-model="singleDate"
                mask="YYYY-MM-DD"
                @update:model-value="showDatePicker = false"
              />
            </q-dialog>
          </div>
          <div v-if="dateFilterType === 'range'" class="q-mt-sm">
            <q-input v-model="dateRange.from" label="From Date" outlined>
              <template #append>
                <q-icon name="event" @click="showFromPicker = true" />
              </template>
            </q-input>
            <q-dialog v-model="showFromPicker">
              <q-date
                v-model="dateRange.from"
                mask="YYYY-MM-DD"
                @update:model-value="showFromPicker = false"
              />
            </q-dialog>
            <q-input v-model="dateRange.to" label="To Date" outlined class="q-mt-sm">
              <template #append>
                <q-icon name="event" @click="showToPicker = true" />
              </template>
            </q-input>
            <q-dialog v-model="showToPicker">
              <q-date
                v-model="dateRange.to"
                mask="YYYY-MM-DD"
                @update:model-value="showToPicker = false"
              />
            </q-dialog>
          </div>
          <q-separator class="q-my-sm" />
          <q-select
            v-model="selectedPositions"
            :options="positionOptions"
            label="Position"
            outlined
            multiple
            use-chips
            emit-value
            map-options
            option-value="value"
            option-label="label"
          >
            <template #option="scope">
              <!-- Select All Option -->
              <q-item v-if="scope.opt.value === 'select_all'" clickable @click="toggleSelectAll">
                <q-item-section>
                  <q-item-label>Select All</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon v-if="allSelected" name="check" color="primary" />
                </q-item-section>
              </q-item>
              <!-- Individual Position Option -->
              <q-item
                v-else
                :key="scope.opt.value"
                clickable
                @click="togglePosition(scope.opt.value)"
              >
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon
                    v-if="selectedPositions.includes(scope.opt.value)"
                    name="check"
                    color="primary"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Generate" @click="generateReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Report -->
    <q-dialog v-model="showPrintDialog" persistent>
      <!-- Pass the selected report filters (id/s) to ApplicantReport via prop -->
      <ApplicantReport
        :filterType="dateFilterType"
        :singleDate="singleDate"
        :dateRange="dateRange"
        :positions="selectedPositions"
      />
    </q-dialog>
  </q-page>
</template>

<script>
  import ApplicantReport from 'src/components/Reports/ApplicantReport.vue';
  import { useApplicantStore } from 'stores/applicantStore';
  import { useReportStore } from 'stores/reportStore';
  import { useQuasar } from 'quasar';

  export default {
    name: 'ApplicantsFixed',
    components: {
      ApplicantReport,
    },
    data() {
      return {
        applicantStore: useApplicantStore(),
        reportStore: useReportStore(),
        $q: null,
        globalSearch: '',
        showReportModal: false,
        showDetailDialog: false,
        selectedApplicant: null,
        pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 10 },
        dateFilterType: 'single',
        singleDate: '',
        dateRange: { from: '', to: '' },
        showDatePicker: false,
        showFromPicker: false,
        showToPicker: false,
        selectedPositions: [],
        showPrintDialog: false, // FIX: ensure reactivity
      };
    },
    computed: {
      columns() {
        return [
          { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
          {
            name: 'jobpost',
            label: 'No. of Applied Position',
            align: 'center',
            field: 'jobpost',
            sortable: true,
          },
          { name: 'action', label: 'Action', align: 'center', field: 'action', sortable: false },
        ];
      },
      filteredApplicants() {
        if (!this.globalSearch) return this.applicantStore.applicants;
        const searchTerm = this.globalSearch.toLowerCase();
        return this.applicantStore.applicants.filter((applicant) => {
          const fullName = `${applicant.firstname} ${applicant.lastname}`.toLowerCase();
          return fullName.includes(searchTerm);
        });
      },
      filteredPositions() {
        let positions = this.reportStore.report || [];
        if (this.dateFilterType === 'single' && this.singleDate) {
          positions = positions.filter((pos) => {
            const p = pos.post_date?.slice(0, 10),
              e = pos.end_date?.slice(0, 10);
            return this.singleDate >= p && this.singleDate <= e;
          });
        } else if (this.dateFilterType === 'range' && this.dateRange.from && this.dateRange.to) {
          positions = positions.filter((pos) => {
            const p = pos.post_date?.slice(0, 10),
              e = pos.end_date?.slice(0, 10);
            return !(this.dateRange.to < p || this.dateRange.from > e);
          });
        }
        return positions.map((pos) => ({ value: pos.id, label: pos.Position }));
      },
      positionOptions() {
        return this.filteredPositions.length
          ? [{ value: 'select_all', label: 'Select All' }, ...this.filteredPositions]
          : [];
      },
      allSelected() {
        const ids = this.filteredPositions.map((o) => o.value);
        return ids.length > 0 && ids.every((id) => this.selectedPositions.includes(id));
      },
    },
    methods: {
      async openReportDialog() {
        await this.reportStore.fetchPositionList();
        this.showReportModal = true;
        this.selectedPositions = [];
      },
      viewApplicant(applicant) {
        this.selectedApplicant = applicant;
        this.showDetailDialog = true;
      },
      toggleSelectAll() {
        const ids = this.filteredPositions.map((o) => o.value);
        this.selectedPositions = this.allSelected ? [] : ids.slice();
      },
      togglePosition(val) {
        if (val === 'select_all') return;
        if (this.selectedPositions.includes(val)) {
          this.selectedPositions = this.selectedPositions.filter((x) => x !== val);
        } else {
          this.selectedPositions = [...this.selectedPositions, val];
        }
      },
      generateReport() {
        this.showReportModal = false;
        // Open the print dialog and pass current filter values to ApplicantReport
        this.showPrintDialog = true;
      },
    },
    async mounted() {
      this.$q = useQuasar();
      await this.applicantStore.fetchApplicants();
    },
  };
</script>
