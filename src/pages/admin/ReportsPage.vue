<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="q-mb-md">
      <h5 class="text-h5 q-ma-none"><b>Rater Management</b></h5>
      <q-breadcrumbs class="q-mt-sm">
        <template v-slot:separator>
          <q-icon size="1.2em" name="arrow_forward" />
        </template>
        <q-breadcrumbs-el icon="assignment_ind" label="Rater Management" />
        <q-breadcrumbs-el icon="assessment" label="Reports" />
      </q-breadcrumbs>
    </div>

    <!-- Main Reports Table -->
    <q-table :rows="reports" :columns="columns" row-key="id" :pagination="pagination">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn round dense color="primary" icon="edit" size="sm" @click="handleAction(props.row)">
            <q-tooltip>Generate Reports</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- ==================== FINAL SUMMARY / APPLICANT PER POSITION / BEI SUMMARY MODAL ==================== -->
    <q-dialog v-model="showReportModal" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">
            {{
              selectedReport?.id === 3
                ? 'Applicant per Position Filters'
                : selectedReport?.id === 6
                  ? 'BEI Summary Report Filters'
                  : 'Final Summary Report Filters'
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingPositions" class="text-center">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm">Loading positions...</div>
          </div>

          <div v-else>
            <!-- Publication Date Filter -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Publication Date Filter</div>
              <q-option-group
                v-model="dateFilterType"
                :options="[
                  { label: 'Single Date', value: 'single' },
                  { label: 'Date Range', value: 'range' },
                  { label: 'All Dates', value: 'all' },
                ]"
                type="radio"
                inline
              />

              <div v-if="dateFilterType === 'single'" class="q-mt-sm">
                <q-input v-model="singleDate" label="Select Publication Date" outlined>
                  <template v-slot:append>
                    <q-icon
                      name="event"
                      class="cursor-pointer"
                      @click="showSingleDatePicker = true"
                    />
                  </template>
                </q-input>
                <q-dialog v-model="showSingleDatePicker">
                  <q-date
                    v-model="singleDate"
                    mask="YYYY-MM-DD"
                    @update:model-value="onSingleDateChange"
                  />
                </q-dialog>
              </div>

              <div v-if="dateFilterType === 'range'" class="q-mt-sm">
                <q-input v-model="dateRange.from" label="From Date" outlined>
                  <template v-slot:append>
                    <q-icon
                      name="event"
                      class="cursor-pointer"
                      @click="showFromDatePicker = true"
                    />
                  </template>
                </q-input>
                <q-dialog v-model="showFromDatePicker">
                  <q-date
                    v-model="dateRange.from"
                    mask="YYYY-MM-DD"
                    @update:model-value="onFromDateChange"
                  />
                </q-dialog>

                <q-input v-model="dateRange.to" label="To Date" class="q-mt-sm" outlined>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" @click="showToDatePicker = true" />
                  </template>
                </q-input>
                <q-dialog v-model="showToDatePicker">
                  <q-date
                    v-model="dateRange.to"
                    mask="YYYY-MM-DD"
                    @update:model-value="onToDateChange"
                  />
                </q-dialog>
              </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Position Filter -->
            <div class="text-subtitle2 q-mb-sm">Select Positions</div>
            <q-select
              v-model="selectedPositions"
              :options="filteredPositionOptions"
              label="Select Positions"
              outlined
              multiple
              use-chips
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :dropdown-icon="'arrow_drop_down'"
              :display-value="displayPositions"
            >
              <template v-slot:option="scope">
                <q-item
                  v-if="scope.opt.value === 'select_all'"
                  clickable
                  @click.stop="toggleSelectAll"
                >
                  <q-item-section>
                    <q-checkbox
                      :model-value="allSelected"
                      label="Select All"
                      @update:model-value="toggleSelectAll"
                    />
                  </q-item-section>
                </q-item>
                <q-item
                  v-else
                  :key="scope.opt.value"
                  clickable
                  @click.stop="togglePosition(scope.opt.value)"
                >
                  <q-item-section>
                    <q-checkbox
                      :label="scope.opt.label"
                      :model-value="isPositionSelected(scope.opt.value)"
                      @update:model-value="togglePosition(scope.opt.value)"
                    />
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No positions found for the selected date(s)
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div v-if="filteredPositionOptions.length <= 1" class="q-mt-sm text-caption text-grey">
              {{
                dateFilterType === 'all'
                  ? 'No positions available'
                  : 'No positions found for the selected date filter. Try selecting a different date or date range.'
              }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeReportModal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="selectedPositions.length === 0"
            @click="openReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 2. Top 5 Ranking Applicants Modal -->
    <q-dialog v-model="showTop5Modal" persistent>
      <q-card style="min-width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Top 5 Ranking Applicants Report Filter</div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingPublicationDates" class="text-center">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm">Loading publication dates...</div>
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-sm">Select Publication Date</div>
            <q-select
              v-model="selectedTop5PublicationDate"
              :options="filteredTop5PublicationDateOptions"
              label="Publication Date"
              outlined
              use-input
              input-debounce="300"
              @filter="filterTop5PublicationDates"
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
                <span v-if="selectedTop5PublicationDate">
                  <q-icon name="event" size="xs" class="q-mr-sm" />
                  {{ selectedTop5PublicationDate }}
                </span>
              </template>
            </q-select>

            <div
              v-if="top5PublicationDateOptions.length === 0"
              class="q-mt-sm text-caption text-grey"
            >
              No publication dates available
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeTop5Modal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="!selectedTop5PublicationDate"
            @click="generateTop5Report"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 3. List of Position Modal -->
    <q-dialog v-model="showListOfPositionModal" persistent>
      <q-card style="min-width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">List of Position Report Filter</div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingListOfPositionDates" class="text-center">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm">Loading publication dates...</div>
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-sm">Select Publication Date</div>
            <q-select
              v-model="selectedListOfPositionPublicationDate"
              :options="filteredListOfPositionDateOptions"
              label="Publication Date"
              outlined
              use-input
              input-debounce="300"
              @filter="filterListOfPositionDates"
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
                <span v-if="selectedListOfPositionPublicationDate">
                  <q-icon name="event" size="xs" class="q-mr-sm" />
                  {{ selectedListOfPositionPublicationDate }}
                </span>
              </template>
            </q-select>

            <div
              v-if="listOfPositionDateOptions.length === 0"
              class="q-mt-sm text-caption text-grey"
            >
              No publication dates available
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeListOfPositionModal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="!selectedListOfPositionPublicationDate"
            @click="generateListOfPositionReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 4. Newly Appointed and Promoted Permanent Employees Modal -->
    <q-dialog v-model="showNewEmployeeModal" persistent>
      <q-card style="min-width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Newly Appointed and Promoted Permanent Employees</div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingNewEmployeeDates" class="text-center">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm">Loading publication dates...</div>
          </div>

          <div v-else>
            <!-- Publication Date -->
            <div class="text-subtitle2 q-mb-sm">Select Publication Date</div>
            <q-select
              v-model="selectedNewEmployeePublicationDate"
              :options="filteredNewEmployeeDateOptions"
              label="Publication Date"
              outlined
              use-input
              input-debounce="300"
              option-value="date"
              option-label="date"
              emit-value
              map-options
              @filter="filterNewEmployeeDates"
              :dropdown-icon="'arrow_drop_down'"
              @update:model-value="onNewEmployeePublicationDateChange"
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
                      {{ scope.opt.date }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:selected>
                <span v-if="selectedNewEmployeePublicationDate">
                  <q-icon name="event" size="xs" class="q-mr-sm" />
                  {{ selectedNewEmployeePublicationDate }}
                </span>
              </template>
            </q-select>

            <!-- Effective Date — only shown when multiple effective dates are available -->
            <div
              v-if="selectedNewEmployeePublicationDate && availableEffectiveDates.length > 1"
              class="q-mt-md"
            >
              <div class="text-subtitle2 q-mb-sm">Select Effective Date</div>
              <q-select
                v-model="selectedNewEmployeeEffectiveDate"
                :options="availableEffectiveDates"
                label="Effective Date"
                outlined
                :dropdown-icon="'arrow_drop_down'"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No effective dates found</q-item-section>
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
                  <span v-if="selectedNewEmployeeEffectiveDate">
                    <q-icon name="event" size="xs" class="q-mr-sm" />
                    {{ selectedNewEmployeeEffectiveDate }}
                  </span>
                </template>
              </q-select>
            </div>

            <!-- Info when only one (or null) effective date — no selector shown -->
            <div
              v-if="
                selectedNewEmployeePublicationDate &&
                availableEffectiveDates.length <= 1 &&
                selectedNewEmployeeEffectiveDate
              "
              class="q-mt-sm"
            >
              <q-chip icon="event" color="primary" text-color="white" size="sm">
                Effective Date: {{ selectedNewEmployeeEffectiveDate }}
              </q-chip>
            </div>

            <div v-if="newEmployeeDateOptions.length === 0" class="q-mt-sm text-caption text-grey">
              No publication dates available
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeNewEmployeeModal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="
              !selectedNewEmployeePublicationDate ||
              (availableEffectiveDates.length > 1 && !selectedNewEmployeeEffectiveDate)
            "
            @click="generateNewEmployeeReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ==================== REPORT VIEWER DIALOGS ==================== -->

    <!-- Final Summary Report Viewer -->
    <q-dialog v-model="showFinalSummaryReportViewer" maximized>
      <FinalSummaryReport :positions="selectedPositions" />
    </q-dialog>

    <!-- Top 5 Ranking Report Viewer -->
    <q-dialog v-model="showTop5ReportViewer" maximized>
      <TopApplicantReport :publicationDate="selectedTop5PublicationDate" />
    </q-dialog>

    <!-- Applicant per Position Report Viewer -->
    <q-dialog v-model="showApplicantReportViewer" maximized>
      <ApplicantPosition :jobpostId="selectedPositions[0]" />
    </q-dialog>

    <!-- List of Position Report Viewer -->
    <q-dialog v-model="showListOfPositionReportViewer" maximized>
      <ListOfPositionReport :publicationDate="selectedListOfPositionPublicationDate" />
    </q-dialog>

    <!-- Newly Appointed Report Viewer -->
    <q-dialog v-model="showNewEmployeeReportViewer" maximized>
      <NewEmployeeReport
        :publicationDate="selectedNewEmployeePublicationDate"
        :effectiveDate="selectedNewEmployeeEffectiveDate"
      />
    </q-dialog>

    <!-- BEI Summary Report Viewer -->
    <q-dialog v-model="showBEISummaryReportViewer" maximized>
      <BEISummaryReport :positions="selectedPositions" />
    </q-dialog>
  </q-page>
</template>

<script>
  import { useSummaryReportStore } from 'stores/summaryReportStore';
  import FinalSummaryReport from 'components/reports/FinalSummaryReport.vue';
  import BEISummaryReport from 'components/reports/BEISummaryReport.vue';
  import TopApplicantReport from 'components/reports/TopApplicantReport.vue';
  import ApplicantPosition from 'components/reports/ApplicantPositionReport.vue';
  import ListOfPositionReport from 'components/reports/ListPositionReport.vue';
  import NewEmployeeReport from 'components/reports/NewEmployeeReport.vue';

  export default {
    name: 'ReportManagementPage',

    components: {
      BEISummaryReport,
      FinalSummaryReport,
      TopApplicantReport,
      ApplicantPosition,
      ListOfPositionReport,
      NewEmployeeReport,
    },

    data() {
      return {
        // ==================== TABLE CONFIGURATION ====================
        columns: [
          { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
          { name: 'name', label: 'Report Name', align: 'left', field: 'name', sortable: true },
          {
            name: 'description',
            label: 'Description',
            align: 'left',
            field: 'description',
            sortable: true,
          },
          { name: 'actions', label: 'Actions', align: 'center', field: 'actions', sortable: false },
        ],

        reports: [
          {
            id: 1,
            name: 'Final Summary of Rating',
            description: 'By Publication Date and Position',
          },
          {
            id: 2,
            name: 'Top 5 Ranking Applicants',
            description: 'By Publication Date',
          },
          {
            id: 3,
            name: 'Applicant per Position',
            description: 'By Publication Date and Position',
          },
          {
            id: 4,
            name: 'Newly Appointed and Promoted Permanent Employees',
            description: 'By Publication Date',
          },
          {
            id: 5,
            name: 'List of Position',
            description: 'By Publication Date',
          },
          {
            id: 6,
            name: 'BEI Summary Report',
            description: 'By Publication Date and Position',
          },
        ],

        pagination: { rowsPerPage: 10 },

        // ==================== MODAL VISIBILITY STATES ====================
        selectedReport: null,
        showReportModal: false,

        // Top 5 Ranking Modal
        showTop5Modal: false,

        // List of Position Modal
        showListOfPositionModal: false,

        // Newly Appointed Modal
        showNewEmployeeModal: false,

        // ==================== REPORT VIEWER VISIBILITY STATES ====================
        showFinalSummaryReportViewer: false,
        showTop5ReportViewer: false,
        showApplicantReportViewer: false,
        showListOfPositionReportViewer: false,
        showNewEmployeeReportViewer: false,
        showBEISummaryReportViewer: false,

        // ==================== POSITIONS DATA ====================
        loadingPositions: false,
        finalSummaryPositionsData: [], // For Final Summary Report (fetchPositionWithRating)
        beiPositionsData: [], // For BEI Summary Report (fetchPositionWithBEI)
        positionOptions: [],
        selectedPositions: [],

        // Date filter
        dateFilterType: 'all',
        singleDate: '',
        dateRange: { from: '', to: '' },
        showSingleDatePicker: false,
        showFromDatePicker: false,
        showToDatePicker: false,

        // ==================== TOP 5 RANKING DATA ====================
        loadingPublicationDates: false,
        top5PublicationDateOptions: [],
        filteredTop5PublicationDateOptions: [],
        selectedTop5PublicationDate: null,

        // ==================== LIST OF POSITION DATA ====================
        loadingListOfPositionDates: false,
        listOfPositionDateOptions: [],
        filteredListOfPositionDateOptions: [],
        selectedListOfPositionPublicationDate: null,

        // ==================== NEWLY APPOINTED DATA ====================
        loadingNewEmployeeDates: false,
        newEmployeeDateOptions: [],
        filteredNewEmployeeDateOptions: [],
        selectedNewEmployeePublicationDate: null,
        selectedNewEmployeeEffectiveDate: null,
      };
    },

    computed: {
      // ==================== POSITION FILTER COMPUTED PROPERTIES ====================
      currentPositionsData() {
        // Return the appropriate data based on selected report type
        if (this.selectedReport?.id === 6) {
          return this.beiPositionsData;
        } else {
          return this.finalSummaryPositionsData;
        }
      },

      allPositions() {
        return this.filteredPositionOptions
          .filter((p) => p.value !== 'select_all')
          .map((p) => p.value);
      },

      allSelected() {
        return (
          this.selectedPositions.length === this.allPositions.length && this.allPositions.length > 0
        );
      },

      displayPositions() {
        if (this.allSelected) return 'All positions selected';
        const selectedLabels = this.filteredPositionOptions
          .filter((opt) => this.selectedPositions.includes(opt.value) && opt.value !== 'select_all')
          .map((opt) => opt.label);
        return selectedLabels.join(', ');
      },

      filteredPositionOptions() {
        if (this.dateFilterType === 'all') {
          return this.positionOptions;
        }

        let filteredPositions = [...this.currentPositionsData];

        if (this.dateFilterType === 'single' && this.singleDate) {
          filteredPositions = filteredPositions.filter((pos) => {
            const postDate = this.normalizeDate(pos.post_date);
            return postDate === this.singleDate;
          });
        } else if (this.dateFilterType === 'range' && this.dateRange.from && this.dateRange.to) {
          filteredPositions = filteredPositions.filter((pos) => {
            const postDate = this.normalizeDate(pos.post_date);
            return postDate >= this.dateRange.from && postDate <= this.dateRange.to;
          });
        }

        // Use jobpostId for Final Summary and id for BEI
        const valueKey = this.selectedReport?.id === 6 ? 'id' : 'jobpostId';
        const labelKey = 'Position';

        return [
          { value: 'select_all', label: 'Select All' },
          ...filteredPositions.map((pos) => ({
            value: pos[valueKey],
            label: `${pos[labelKey]} (${this.formatDate(pos.post_date)})`,
            postDate: pos.post_date,
          })),
        ];
      },

      // ==================== NEWLY APPOINTED COMPUTED PROPERTIES ====================
      availableEffectiveDates() {
        if (!this.selectedNewEmployeePublicationDate) return [];
        const entry = this.newEmployeeDateOptions.find(
          (item) => item.date === this.selectedNewEmployeePublicationDate,
        );
        if (!entry) return [];
        return entry.effective_date_available
          .map((e) => e.effectiveDate)
          .filter((d) => d !== null && d !== undefined);
      },
    },

    watch: {
      dateFilterType(newVal) {
        this.selectedPositions = [];
        if (newVal === 'all') {
          this.singleDate = '';
          this.dateRange.from = '';
          this.dateRange.to = '';
        }
      },

      // Watch for report modal opening to load appropriate data
      showReportModal(newVal) {
        if (newVal && this.selectedReport) {
          if (this.selectedReport.id === 6) {
            this.loadBEIPositions();
          } else {
            this.loadFinalSummaryPositions();
          }
        }
      },
    },

    async mounted() {
      // Removed automatic loading - will load based on modal open
    },

    methods: {
      // ==================== DATA LOADING METHODS ====================

      /**
       * Load positions for Final Summary Report (fetchPositionWithRating)
       */
      async loadFinalSummaryPositions() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingPositions = true;
        try {
          const positions = await summaryReportStore.fetchPositionWithRating();
          this.finalSummaryPositionsData = positions;
          this.updatePositionOptions();
        } catch (error) {
          console.error('Error loading final summary positions:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load positions for Final Summary Report',
            position: 'top',
          });
        } finally {
          this.loadingPositions = false;
        }
      },

      /**
       * Load positions for BEI Summary Report (fetchPositionWithBEI)
       */
      async loadBEIPositions() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingPositions = true;
        try {
          const positions = await summaryReportStore.fetchPositionWithBEI();
          this.beiPositionsData = positions;
          this.updatePositionOptions();
        } catch (error) {
          console.error('Error loading BEI positions:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load positions for BEI Summary Report',
            position: 'top',
          });
        } finally {
          this.loadingPositions = false;
        }
      },

      /**
       * Update position options based on current data source
       */
      updatePositionOptions() {
        const valueKey = this.selectedReport?.id === 6 ? 'id' : 'jobpostId';
        const labelKey = 'Position';

        this.positionOptions = [
          { value: 'select_all', label: 'Select All' },
          ...this.currentPositionsData.map((pos) => ({
            value: pos[valueKey],
            label: `${pos[labelKey]} (${this.formatDate(pos.post_date)})`,
            postDate: pos.post_date,
          })),
        ];
      },

      /**
       * Load publication dates for Top 5 Ranking report
       */
      async loadTop5PublicationDates() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingPublicationDates = true;
        try {
          const response = await summaryReportStore.fetchPublicationDateList();
          this.top5PublicationDateOptions = response.map((item) => item.date);
          this.filteredTop5PublicationDateOptions = [...this.top5PublicationDateOptions];
        } catch (error) {
          console.error('Error loading Top 5 publication dates:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load publication dates',
            position: 'top',
          });
        } finally {
          this.loadingPublicationDates = false;
        }
      },

      /**
       * Load publication dates for List of Position report
       */
      async loadListOfPositionDates() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingListOfPositionDates = true;
        try {
          const response = await summaryReportStore.fetchPublicationDateList();
          this.listOfPositionDateOptions = response.map((item) => item.date);
          this.filteredListOfPositionDateOptions = [...this.listOfPositionDateOptions];
        } catch (error) {
          console.error('Error loading List of Position publication dates:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load publication dates',
            position: 'top',
          });
        } finally {
          this.loadingListOfPositionDates = false;
        }
      },

      /**
       * Load publication dates for Newly Appointed report
       */
      async loadNewEmployeeDates() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingNewEmployeeDates = true;
        try {
          const response = await summaryReportStore.fetchPublicationDateNewEmployee();
          const list = response?.data ?? response;
          this.newEmployeeDateOptions = list;
          this.filteredNewEmployeeDateOptions = [...list];
        } catch (error) {
          console.error('Error loading new employee publication dates:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load publication dates',
            position: 'top',
          });
        } finally {
          this.loadingNewEmployeeDates = false;
        }
      },

      // ==================== ACTION HANDLERS ====================

      /**
       * Handle report action button click
       */
      async handleAction(row) {
        this.selectedReport = row;

        switch (row.id) {
          case 1: // Final Summary of Rating
          case 3: // Applicant per Position
          case 6: // BEI Summary Report
            this.openReportModal();
            break;

          case 2: // Top 5 Ranking Applicants
            this.openTop5Modal();
            break;

          case 4: // Newly Appointed and Promoted Permanent Employees
            this.openNewEmployeeModal();
            break;

          case 5: // List of Position
            this.openListOfPositionModal();
            break;

          default:
            console.warn('Unknown report type:', row.id);
        }
      },

      // ==================== REPORT MODAL METHODS ====================

      openReportModal() {
        this.showReportModal = true;
        this.resetFilters();
      },

      resetFilters() {
        this.selectedPositions = [];
        this.dateFilterType = 'all';
        this.singleDate = '';
        this.dateRange.from = '';
        this.dateRange.to = '';
      },

      closeReportModal() {
        this.showReportModal = false;
        this.resetFilters();
        // Clear data when closing to free memory
        this.finalSummaryPositionsData = [];
        this.beiPositionsData = [];
        this.positionOptions = [];
      },

      toggleSelectAll() {
        if (this.allSelected) {
          this.selectedPositions = [];
        } else {
          this.selectedPositions = [...this.allPositions];
        }
      },

      togglePosition(pos) {
        const index = this.selectedPositions.indexOf(pos);
        if (index > -1) {
          this.selectedPositions = this.selectedPositions.filter((p) => p !== pos);
        } else {
          this.selectedPositions = [...this.selectedPositions, pos];
        }
      },

      isPositionSelected(pos) {
        return this.selectedPositions.includes(pos);
      },

      onSingleDateChange() {
        this.showSingleDatePicker = false;
        this.selectedPositions = [];
      },

      onFromDateChange() {
        this.showFromDatePicker = false;
        this.selectedPositions = [];
      },

      onToDateChange() {
        this.showToDatePicker = false;
        this.selectedPositions = [];
      },

      openReport() {
        this.showReportModal = false;

        if (this.selectedReport?.id === 3) {
          // Applicant per Position
          this.showApplicantReportViewer = true;
        } else if (this.selectedReport?.id === 6) {
          // BEI Summary Report
          this.showBEISummaryReportViewer = true;
        } else {
          // Final Summary of Rating
          this.showFinalSummaryReportViewer = true;
        }
      },

      // ==================== TOP 5 RANKING METHODS ====================

      async openTop5Modal() {
        this.showTop5Modal = true;
        this.resetTop5Filters();
        await this.loadTop5PublicationDates();
      },

      resetTop5Filters() {
        this.selectedTop5PublicationDate = null;
      },

      closeTop5Modal() {
        this.showTop5Modal = false;
        this.resetTop5Filters();
        this.top5PublicationDateOptions = [];
        this.filteredTop5PublicationDateOptions = [];
      },

      filterTop5PublicationDates(val, update) {
        update(() => {
          if (val === '') {
            this.filteredTop5PublicationDateOptions = [...this.top5PublicationDateOptions];
          } else {
            const needle = val.toLowerCase();
            this.filteredTop5PublicationDateOptions = this.top5PublicationDateOptions.filter(
              (date) => date.toLowerCase().includes(needle),
            );
          }
        });
      },

      generateTop5Report() {
        this.showTop5Modal = false;
        this.showTop5ReportViewer = true;
      },

      // ==================== LIST OF POSITION METHODS ====================

      async openListOfPositionModal() {
        this.showListOfPositionModal = true;
        this.resetListOfPositionFilters();
        await this.loadListOfPositionDates();
      },

      resetListOfPositionFilters() {
        this.selectedListOfPositionPublicationDate = null;
      },

      closeListOfPositionModal() {
        this.showListOfPositionModal = false;
        this.resetListOfPositionFilters();
        this.listOfPositionDateOptions = [];
        this.filteredListOfPositionDateOptions = [];
      },

      filterListOfPositionDates(val, update) {
        update(() => {
          if (val === '') {
            this.filteredListOfPositionDateOptions = [...this.listOfPositionDateOptions];
          } else {
            const needle = val.toLowerCase();
            this.filteredListOfPositionDateOptions = this.listOfPositionDateOptions.filter((date) =>
              date.toLowerCase().includes(needle),
            );
          }
        });
      },

      generateListOfPositionReport() {
        this.showListOfPositionModal = false;
        this.showListOfPositionReportViewer = true;
      },

      // ==================== NEWLY APPOINTED METHODS ====================

      async openNewEmployeeModal() {
        this.showNewEmployeeModal = true;
        this.resetNewEmployeeFilters();
        await this.loadNewEmployeeDates();
      },

      resetNewEmployeeFilters() {
        this.selectedNewEmployeePublicationDate = null;
        this.selectedNewEmployeeEffectiveDate = null;
      },

      closeNewEmployeeModal() {
        this.showNewEmployeeModal = false;
        this.resetNewEmployeeFilters();
        this.newEmployeeDateOptions = [];
        this.filteredNewEmployeeDateOptions = [];
      },

      filterNewEmployeeDates(val, update) {
        update(() => {
          if (val === '') {
            this.filteredNewEmployeeDateOptions = [...this.newEmployeeDateOptions];
          } else {
            const needle = val.toLowerCase();
            this.filteredNewEmployeeDateOptions = this.newEmployeeDateOptions.filter((item) =>
              item.date.toLowerCase().includes(needle),
            );
          }
        });
      },

      onNewEmployeePublicationDateChange() {
        this.selectedNewEmployeeEffectiveDate = null;

        const dates = this.availableEffectiveDates;

        if (dates.length === 0) {
          this.selectedNewEmployeeEffectiveDate = null;
        } else if (dates.length === 1) {
          this.selectedNewEmployeeEffectiveDate = dates[0];
        }
      },

      generateNewEmployeeReport() {
        this.showNewEmployeeModal = false;
        this.showNewEmployeeReportViewer = true;
      },

      // ==================== UTILITY METHODS ====================

      normalizeDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },

      formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  };
</script>

<style scoped></style>
