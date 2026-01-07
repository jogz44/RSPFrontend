//Applicant Page 
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
          label="Qualified Report"
          class="text-white q-ml-sm"
          @click="openQualifiedReportDialog"
          size="md"
        >
          <q-tooltip>List of Qualified Applicants</q-tooltip>
        </q-btn>

        <q-btn
          color="orange"
          icon="article"
          label="Unqualified Report"
          class="text-white q-ml-sm"
          @click="openUnqualifiedReportDialog"
          size="md"
        >
          <q-tooltip>List of Unqualified Applicants</q-tooltip>
        </q-btn>

        <q-btn
          color="orange"
          icon="article"
          label="Report"
          class="text-white q-ml-sm"
          @click="openReportDialog"
          size="md"
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

    <!-- Qualified Report Modal -->
    <q-dialog v-model="showQualifiedModal" persistent>
      <q-card style="min-width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Qualified Applicants Report</div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingPublicationDates" class="text-center">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm">Loading publication dates...</div>
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-sm">Select Publication Date</div>
            <q-select
              v-model="selectedQualifiedPublicationDate"
              :options="filteredQualifiedPublicationDateOptions"
              label="Publication Date"
              outlined
              use-input
              input-debounce="300"
              @filter="filterQualifiedPublicationDates"
              :dropdown-icon="'arrow_drop_down'"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No publication dates found</q-item-section>
                </q-item>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      <q-icon name="event" size="xs" class="q-mr-sm" />
                      {{ scope.opt }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:selected>
                <span v-if="selectedQualifiedPublicationDate">
                  <q-icon name="event" size="xs" class="q-mr-sm" />
                  {{ selectedQualifiedPublicationDate }}
                </span>
              </template>
            </q-select>

            <div v-if="publicationDateOptions.length === 0" class="q-mt-sm text-caption text-grey">
              No publication dates available
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeQualifiedModal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="!selectedQualifiedPublicationDate"
            @click="generateQualifiedReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Unqualified Report Modal -->
    <q-dialog v-model="showUnqualifiedModal" persistent>
      <q-card style="min-width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Unqualified Applicants Report</div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingPublicationDates" class="text-center">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm">Loading publication dates...</div>
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-sm">Select Publication Date</div>
            <q-select
              v-model="selectedUnqualifiedPublicationDate"
              :options="filteredUnqualifiedPublicationDateOptions"
              label="Publication Date"
              outlined
              use-input
              input-debounce="300"
              @filter="filterUnqualifiedPublicationDates"
              :dropdown-icon="'arrow_drop_down'"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      <q-icon name="event" size="xs" class="q-mr-sm" />
                      {{ scope.opt }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:selected>
                <span v-if="selectedUnqualifiedPublicationDate">
                  <q-icon name="event" size="xs" class="q-mr-sm" />
                  {{ selectedUnqualifiedPublicationDate }}
                </span>
              </template>
            </q-select>

            <div v-if="publicationDateOptions.length === 0" class="q-mt-sm text-caption text-grey">
              No publication dates available
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeUnqualifiedModal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="!selectedUnqualifiedPublicationDate"
            @click="generateUnqualifiedReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- General Report Modal -->
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

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import ApplicantReport from 'src/components/Reports/QualifiedReport.vue';
  import { useApplicantStore } from 'stores/applicantStore';
  import { useReportStore } from 'stores/reportStore';
  import { useSummaryReportStore } from 'stores/summaryReportStore';
  import { useQuasar } from 'quasar';

  const applicantStore = useApplicantStore();
  const reportStore = useReportStore();
  const summaryReportStore = useSummaryReportStore();
  const $q = useQuasar();

  // Reactive variables
  const globalSearch = ref('');
  const showReportModal = ref(false);
  const showDetailDialog = ref(false);
  const selectedApplicant = ref(null);
  const pagination = ref({ sortBy: 'name', descending: false, page: 1, rowsPerPage: 10 });
  const dateFilterType = ref('single');
  const singleDate = ref('');
  const dateRange = ref({ from: '', to: '' });
  const showDatePicker = ref(false);
  const showFromPicker = ref(false);
  const showToPicker = ref(false);
  const selectedPositions = ref([]);
  const showPrintDialog = ref(false);

  // Qualified Report Modal
  const showQualifiedModal = ref(false);
  const selectedQualifiedPublicationDate = ref(null);
  const filteredQualifiedPublicationDateOptions = ref([]);

  // Unqualified Report Modal
  const showUnqualifiedModal = ref(false);
  const selectedUnqualifiedPublicationDate = ref(null);
  const filteredUnqualifiedPublicationDateOptions = ref([]);

  // Shared
  const loadingPublicationDates = ref(false);
  const publicationDateOptions = ref([]);

  // Computed properties
  const columns = computed(() => [
    { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
    {
      name: 'jobpost',
      label: 'No.  of Applied Position',
      align: 'center',
      field: 'jobpost',
      sortable: true,
    },
    { name: 'action', label: 'Action', align: 'center', field: 'action', sortable: false },
  ]);

  const filteredApplicants = computed(() => {
    if (!globalSearch.value) return applicantStore.applicants;
    const searchTerm = globalSearch.value.toLowerCase();
    return applicantStore.applicants.filter((applicant) => {
      const fullName = `${applicant.firstname} ${applicant.lastname}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  });

  const filteredPositions = computed(() => {
    let positions = reportStore.report || [];
    if (dateFilterType.value === 'single' && singleDate.value) {
      positions = positions.filter((pos) => {
        const p = pos.post_date?.slice(0, 10);
        const e = pos.end_date?.slice(0, 10);
        return singleDate.value >= p && singleDate.value <= e;
      });
    } else if (dateFilterType.value === 'range' && dateRange.value.from && dateRange.value.to) {
      positions = positions.filter((pos) => {
        const p = pos.post_date?.slice(0, 10);
        const e = pos.end_date?.slice(0, 10);
        return !(dateRange.value.to < p || dateRange.value.from > e);
      });
    }
    return positions.map((pos) => ({ value: pos.id, label: pos.Position }));
  });

  const positionOptions = computed(() =>
    filteredPositions.value.length
      ? [{ value: 'select_all', label: 'Select All' }, ...filteredPositions.value]
      : [],
  );

  const allSelected = computed(() => {
    const ids = filteredPositions.value.map((o) => o.value);
    return ids.length > 0 && ids.every((id) => selectedPositions.value.includes(id));
  });

  // Methods
  const openReportDialog = async () => {
    await reportStore.fetchPositionList();
    showReportModal.value = true;
    selectedPositions.value = [];
  };

  const openQualifiedReportDialog = async () => {
    showQualifiedModal.value = true;
    selectedQualifiedPublicationDate.value = null;
    await fetchPublicationDates();
  };

  const openUnqualifiedReportDialog = async () => {
    showUnqualifiedModal.value = true;
    selectedUnqualifiedPublicationDate.value = null;
    await fetchPublicationDates();
  };

  const fetchPublicationDates = async () => {
    loadingPublicationDates.value = true;
    try {
      console.log('Fetching publication dates...');
      const response = await summaryReportStore.fetchPublicationDateList();
      console.log('Publication dates response:', response);

      // Extract date values from the response array
      // Response format: [{"date":"Nov 07, 2025"},{"date":"Nov 04, 2025"}]
      if (Array.isArray(response)) {
        publicationDateOptions.value = response.map((item) => item.date);
      } else {
        publicationDateOptions.value = [];
      }

      filteredQualifiedPublicationDateOptions.value = [...publicationDateOptions.value];
      filteredUnqualifiedPublicationDateOptions.value = [...publicationDateOptions.value];

      console.log('Publication date options:', publicationDateOptions.value);
    } catch (error) {
      console.error('Error fetching publication dates:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to load publication dates',
      });
      publicationDateOptions.value = [];
      filteredQualifiedPublicationDateOptions.value = [];
      filteredUnqualifiedPublicationDateOptions.value = [];
    } finally {
      loadingPublicationDates.value = false;
    }
  };

  const filterQualifiedPublicationDates = (val, update) => {
    update(() => {
      const needle = val.toLowerCase();
      filteredQualifiedPublicationDateOptions.value = publicationDateOptions.value.filter(
        (v) => v.toLowerCase().indexOf(needle) > -1,
      );
    });
  };

  const filterUnqualifiedPublicationDates = (val, update) => {
    update(() => {
      const needle = val.toLowerCase();
      filteredUnqualifiedPublicationDateOptions.value = publicationDateOptions.value.filter(
        (v) => v.toLowerCase().indexOf(needle) > -1,
      );
    });
  };

  const closeQualifiedModal = () => {
    showQualifiedModal.value = false;
    selectedQualifiedPublicationDate.value = null;
  };

  const closeUnqualifiedModal = () => {
    showUnqualifiedModal.value = false;
    selectedUnqualifiedPublicationDate.value = null;
  };

  const generateQualifiedReport = () => {
    console.log('Generating qualified report for:', selectedQualifiedPublicationDate.value);

    // TODO: Implement your qualified report generation logic
    // You can call your API or store method here

    closeQualifiedModal();

    $q.notify({
      type: 'positive',
      message: `Generating qualified applicants report for ${selectedQualifiedPublicationDate.value}`,
    });
  };

  const generateUnqualifiedReport = () => {
    console.log('Generating unqualified report for:', selectedUnqualifiedPublicationDate.value);

    // TODO: Implement your unqualified report generation logic
    // You can call your API or store method here

    closeUnqualifiedModal();

    $q.notify({
      type: 'positive',
      message: `Generating unqualified applicants report for ${selectedUnqualifiedPublicationDate.value}`,
    });
  };

  const viewApplicant = (applicant) => {
    selectedApplicant.value = applicant;
    showDetailDialog.value = true;
  };

  const toggleSelectAll = () => {
    const ids = filteredPositions.value.map((o) => o.value);
    selectedPositions.value = allSelected.value ? [] : ids.slice();
  };

  const togglePosition = (val) => {
    if (val === 'select_all') return;
    if (selectedPositions.value.includes(val)) {
      selectedPositions.value = selectedPositions.value.filter((x) => x !== val);
    } else {
      selectedPositions.value = [...selectedPositions.value, val];
    }
  };

  const generateReport = () => {
    showReportModal.value = false;
    showPrintDialog.value = true;
  };

  // Lifecycle
  onMounted(async () => {
    await applicantStore.fetchApplicants();
  });
</script>
