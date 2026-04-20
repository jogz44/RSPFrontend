<template>
  <q-page class="q-pa-md">
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

    <q-table :rows="reports" :columns="columns" row-key="id" :pagination="pagination">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn round dense color="primary" icon="edit" size="sm" @click="handleAction(props.row)">
            <q-tooltip>Generate Reports</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Filter Modal for Schedule Report -->
    <q-dialog v-model="showModal" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Report Filters</div>
        </q-card-section>

        <q-card-section>
          <!-- Date Filter -->
          <div class="q-mb-sm">
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
                <template v-slot:append>
                  <q-icon name="event" @click="showSingleDatePicker = true" />
                </template>
              </q-input>
              <q-dialog v-model="showSingleDatePicker">
                <q-date
                  v-model="singleDate"
                  mask="YYYY-MM-DD"
                  @update:model-value="showSingleDatePicker = false"
                />
              </q-dialog>
            </div>
            <div v-if="dateFilterType === 'range'" class="q-mt-sm">
              <q-input v-model="dateRange.from" label="From Date" outlined>
                <template v-slot:append>
                  <q-icon name="event" @click="showFromDatePicker = true" />
                </template>
              </q-input>
              <q-dialog v-model="showFromDatePicker">
                <q-date
                  v-model="dateRange.from"
                  mask="YYYY-MM-DD"
                  @update:model-value="showFromDatePicker = false"
                />
              </q-dialog>
              <q-input v-model="dateRange.to" label="To Date" class="q-mt-sm" outlined>
                <template v-slot:append>
                  <q-icon name="event" @click="showToDatePicker = true" />
                </template>
              </q-input>
              <q-dialog v-model="showToDatePicker">
                <q-date
                  v-model="dateRange.to"
                  mask="YYYY-MM-DD"
                  @update:model-value="showToDatePicker = false"
                />
              </q-dialog>
            </div>
          </div>

          <q-separator />

          <!-- Position Filter -->
          <div class="q-mt-sm">
            <q-select
              v-model="selectedPositions"
              :options="positionOptions"
              label="Position"
              outlined
              multiple
              use-chips
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :dropdown-icon="'arrow_drop_down'"
              :display-value="displayPositions"
              @input="onPositionInput"
            >
              <template v-slot:option="scope">
                <q-item
                  v-if="scope.opt.value === 'select_all'"
                  clickable
                  @click.stop="toggleSelectAll"
                >
                  <q-item-section>
                    <q-checkbox
                      v-model="allSelected"
                      label="Select All"
                      :checked="allSelected"
                      :indeterminate="false"
                      @click.stop.prevent="toggleSelectAll"
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
                      :value="isPositionSelected(scope.opt.value)"
                      @click.stop.prevent="togglePosition(scope.opt.value)"
                      :model-value="isPositionSelected(scope.opt.value)"
                      :checked="isPositionSelected(scope.opt.value)"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Generate" @click="generateReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Top 5 Ranking Applicants Modal -->
    <q-dialog v-model="showTop5Modal" persistent>
      <q-card style="min-width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Top 5 Ranking Applicants Report</div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingPublicationDates" class="text-center">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm">Loading publication dates...</div>
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-sm">Select Publication Date</div>
            <q-select
              v-model="selectedPublicationDate"
              :options="filteredPublicationDateOptions"
              label="Publication Date"
              outlined
              use-input
              input-debounce="300"
              @filter="filterPublicationDates"
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
                <span v-if="selectedPublicationDate">
                  <q-icon name="event" size="xs" class="q-mr-sm" />
                  {{ selectedPublicationDate }}
                </span>
              </template>
            </q-select>

            <div v-if="publicationDateOptions.length === 0" class="q-mt-sm text-caption text-grey">
              No publication dates available
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeTop5Modal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="!selectedPublicationDate"
            @click="generateTop5Report"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Final Summary / Applicant per Position Modal (shared) -->
    <q-dialog v-model="showFinalSummaryModal" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">
            {{
              selectedReport?.id === 3
                ? 'Applicant per Position Filters'
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
                v-model="finalSummaryDateFilterType"
                :options="[
                  { label: 'Single Date', value: 'single' },
                  { label: 'Date Range', value: 'range' },
                  { label: 'All Dates', value: 'all' },
                ]"
                type="radio"
                inline
              />

              <div v-if="finalSummaryDateFilterType === 'single'" class="q-mt-sm">
                <q-input v-model="finalSummarySingleDate" label="Select Publication Date" outlined>
                  <template v-slot:append>
                    <q-icon
                      name="event"
                      class="cursor-pointer"
                      @click="showFinalSummarySingleDatePicker = true"
                    />
                  </template>
                </q-input>
                <q-dialog v-model="showFinalSummarySingleDatePicker">
                  <q-date
                    v-model="finalSummarySingleDate"
                    mask="YYYY-MM-DD"
                    @update:model-value="onFinalSummarySingleDateChange"
                  />
                </q-dialog>
              </div>

              <div v-if="finalSummaryDateFilterType === 'range'" class="q-mt-sm">
                <q-input v-model="finalSummaryDateRange.from" label="From Date" outlined>
                  <template v-slot:append>
                    <q-icon
                      name="event"
                      class="cursor-pointer"
                      @click="showFinalSummaryFromDatePicker = true"
                    />
                  </template>
                </q-input>
                <q-dialog v-model="showFinalSummaryFromDatePicker">
                  <q-date
                    v-model="finalSummaryDateRange.from"
                    mask="YYYY-MM-DD"
                    @update:model-value="onFinalSummaryFromDateChange"
                  />
                </q-dialog>

                <q-input
                  v-model="finalSummaryDateRange.to"
                  label="To Date"
                  class="q-mt-sm"
                  outlined
                >
                  <template v-slot:append>
                    <q-icon
                      name="event"
                      class="cursor-pointer"
                      @click="showFinalSummaryToDatePicker = true"
                    />
                  </template>
                </q-input>
                <q-dialog v-model="showFinalSummaryToDatePicker">
                  <q-date
                    v-model="finalSummaryDateRange.to"
                    mask="YYYY-MM-DD"
                    @update:model-value="onFinalSummaryToDateChange"
                  />
                </q-dialog>
              </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Position Filter -->
            <div class="text-subtitle2 q-mb-sm">Select Positions</div>
            <q-select
              v-model="selectedFinalSummaryPositions"
              :options="filteredFinalSummaryPositionOptions"
              label="Select Positions"
              outlined
              multiple
              use-chips
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :dropdown-icon="'arrow_drop_down'"
              :display-value="displayFinalSummaryPositions"
            >
              <template v-slot:option="scope">
                <q-item
                  v-if="scope.opt.value === 'select_all'"
                  clickable
                  @click.stop="toggleFinalSummarySelectAll"
                >
                  <q-item-section>
                    <q-checkbox
                      :model-value="allFinalSummarySelected"
                      label="Select All"
                      @update:model-value="toggleFinalSummarySelectAll"
                    />
                  </q-item-section>
                </q-item>
                <q-item
                  v-else
                  :key="scope.opt.value"
                  clickable
                  @click.stop="toggleFinalSummaryPosition(scope.opt.value)"
                >
                  <q-item-section>
                    <q-checkbox
                      :label="scope.opt.label"
                      :model-value="isFinalSummaryPositionSelected(scope.opt.value)"
                      @update:model-value="toggleFinalSummaryPosition(scope.opt.value)"
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

            <div
              v-if="filteredFinalSummaryPositionOptions.length <= 1"
              class="q-mt-sm text-caption text-grey"
            >
              {{
                finalSummaryDateFilterType === 'all'
                  ? 'No positions available'
                  : 'No positions found for the selected date filter. Try selecting a different date or date range.'
              }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeFinalSummaryModal" />
          <q-btn
            color="primary"
            label="Generate Report"
            :disable="selectedFinalSummaryPositions.length === 0"
            @click="openFinalSummaryReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Newly Appointed and Promoted Permanent Employees Modal -->
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

    <!-- Final Summary Report Component Dialog -->
    <q-dialog v-model="showReportViewer" maximized>
      <FinalSummaryReport :positions="selectedFinalSummaryPositions" />
    </q-dialog>

    <!-- Top 5 Ranking Report Component Dialog -->
    <q-dialog v-model="showTop5ReportViewer" maximized>
      <TopApplicantReport :publicationDate="selectedPublicationDate" />
    </q-dialog>

    <!-- Applicant per Position Report Component Dialog -->
    <q-dialog v-model="showApplicantReportViewer" maximized>
      <ApplicantPosition :jobpostId="selectedApplicantJobpostId" />
    </q-dialog>

    <!-- Newly Appointed Report Component Dialog -->
    <q-dialog v-model="showNewEmployeeReportViewer" maximized>
      <NewEmployeeReport
        :publicationDate="selectedNewEmployeePublicationDate"
        :effectiveDate="selectedNewEmployeeEffectiveDate"
      />
    </q-dialog>
  </q-page>
</template>

<script>
  import { useSummaryReportStore } from 'stores/summaryReportStore';
  import FinalSummaryReport from 'components/reports/FinalSummaryReport.vue';
  import TopApplicantReport from 'components/reports/TopApplicantReport.vue';
  import ApplicantPosition from 'components/reports/ApplicantPositionReport.vue';
  import NewEmployeeReport from 'components/reports/NewEmployeeReport.vue';

  export default {
    name: 'ReportManagementPage',
    components: {
      FinalSummaryReport,
      TopApplicantReport,
      ApplicantPosition,
      NewEmployeeReport,
    },
    data() {
      return {
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
          { id: 2, name: 'Top 5 Ranking Applicants', description: 'By Publication Date' },
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
        ],

        pagination: { rowsPerPage: 10 },

        showModal: false,
        showTop5ReportViewer: false,
        selectedReport: null,

        selectedPositions: [],

        dateFilterType: 'single',
        singleDate: '',
        dateRange: { from: '', to: '' },
        showSingleDatePicker: false,
        showFromDatePicker: false,
        showToDatePicker: false,

        // Top 5 modal
        showTop5Modal: false,
        loadingPublicationDates: false,
        publicationDateOptions: [],
        filteredPublicationDateOptions: [],
        selectedPublicationDate: null,

        // Final Summary / Applicant per Position modal
        showFinalSummaryModal: false,
        showReportViewer: false,
        showApplicantReportViewer: false,
        selectedApplicantJobpostId: null,
        loadingPositions: false,
        allPositionsData: [],
        finalSummaryPositionOptions: [],
        selectedFinalSummaryPositions: [],
        finalSummaryDateFilterType: 'all',
        finalSummarySingleDate: '',
        finalSummaryDateRange: { from: '', to: '' },
        showFinalSummarySingleDatePicker: false,
        showFinalSummaryFromDatePicker: false,
        showFinalSummaryToDatePicker: false,

        // Newly Appointed modal
        showNewEmployeeModal: false,
        showNewEmployeeReportViewer: false,
        loadingNewEmployeeDates: false,
        newEmployeeDateOptions: [],
        filteredNewEmployeeDateOptions: [],
        selectedNewEmployeePublicationDate: null,
        selectedNewEmployeeEffectiveDate: null,
      };
    },

    computed: {
      allPositions() {
        return this.positionOptions.filter((p) => p.value !== 'select_all').map((p) => p.value);
      },
      allSelected() {
        return this.selectedPositions.length === this.allPositions.length;
      },
      displayPositions() {
        if (this.allSelected) return 'All positions selected';
        const selectedLabels = this.positionOptions
          .filter((opt) => this.selectedPositions.includes(opt.value) && opt.value !== 'select_all')
          .map((opt) => opt.label);
        return selectedLabels.join(', ');
      },

      filteredFinalSummaryPositionOptions() {
        if (this.finalSummaryDateFilterType === 'all') {
          return this.finalSummaryPositionOptions;
        }

        let filteredPositions = [...this.allPositionsData];

        if (this.finalSummaryDateFilterType === 'single' && this.finalSummarySingleDate) {
          filteredPositions = filteredPositions.filter((pos) => {
            const postDate = this.normalizeDate(pos.post_date);
            return postDate === this.finalSummarySingleDate;
          });
        } else if (
          this.finalSummaryDateFilterType === 'range' &&
          this.finalSummaryDateRange.from &&
          this.finalSummaryDateRange.to
        ) {
          filteredPositions = filteredPositions.filter((pos) => {
            const postDate = this.normalizeDate(pos.post_date);
            return (
              postDate >= this.finalSummaryDateRange.from &&
              postDate <= this.finalSummaryDateRange.to
            );
          });
        }

        return [
          { value: 'select_all', label: 'Select All' },
          ...filteredPositions.map((pos) => ({
            value: pos.jobpostId,
            label: `${pos.Position} (${this.formatDate(pos.post_date)})`,
            postDate: pos.post_date,
          })),
        ];
      },

      allFinalSummaryPositions() {
        return this.filteredFinalSummaryPositionOptions
          .filter((p) => p.value !== 'select_all')
          .map((p) => p.value);
      },
      allFinalSummarySelected() {
        return (
          this.selectedFinalSummaryPositions.length === this.allFinalSummaryPositions.length &&
          this.allFinalSummaryPositions.length > 0
        );
      },
      displayFinalSummaryPositions() {
        if (this.allFinalSummarySelected) return 'All positions selected';
        const selectedLabels = this.filteredFinalSummaryPositionOptions
          .filter(
            (opt) =>
              this.selectedFinalSummaryPositions.includes(opt.value) && opt.value !== 'select_all',
          )
          .map((opt) => opt.label);
        return selectedLabels.join(', ');
      },

      // Returns the effective dates for the currently selected publication date
      availableEffectiveDates() {
        if (!this.selectedNewEmployeePublicationDate) return [];
        const entry = this.newEmployeeDateOptions.find(
          (item) => item.date === this.selectedNewEmployeePublicationDate,
        );
        if (!entry) return [];
        // Filter out null values and return only valid dates
        return entry.effective_date_available
          .map((e) => e.effectiveDate)
          .filter((d) => d !== null && d !== undefined);
      },
    },

    watch: {
      finalSummaryDateFilterType(newVal) {
        this.selectedFinalSummaryPositions = [];
        if (newVal === 'all') {
          this.finalSummarySingleDate = '';
          this.finalSummaryDateRange.from = '';
          this.finalSummaryDateRange.to = '';
        }
      },
    },

    async mounted() {
      await this.loadPositions();
    },

    methods: {
      async loadPositions() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingPositions = true;
        try {
          const positions = await summaryReportStore.fetchPositionWithRating();
          this.allPositionsData = positions;
          this.finalSummaryPositionOptions = [
            { value: 'select_all', label: 'Select All' },
            ...positions.map((pos) => ({
              value: pos.jobpostId,
              label: `${pos.Position} (${this.formatDate(pos.post_date)})`,
              postDate: pos.post_date,
            })),
          ];
        } catch (error) {
          console.error('Error loading positions:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load positions',
            position: 'top',
          });
        } finally {
          this.loadingPositions = false;
        }
      },

      async loadPublicationDates() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingPublicationDates = true;
        try {
          const response = await summaryReportStore.fetchPublicationDateList();
          this.publicationDateOptions = response.map((item) => item.date);
          this.filteredPublicationDateOptions = [...this.publicationDateOptions];
        } catch (error) {
          console.error('Error loading publication dates:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load publication dates',
            position: 'top',
          });
        } finally {
          this.loadingPublicationDates = false;
        }
      },

      async loadNewEmployeeDates() {
        const summaryReportStore = useSummaryReportStore();
        this.loadingNewEmployeeDates = true;
        try {
          const response = await summaryReportStore.fetchPublicationDateNewEmployee();
          // response.data is the array from the API: [{ date, effective_date_available: [...] }]
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

      filterPublicationDates(val, update) {
        update(() => {
          if (val === '') {
            this.filteredPublicationDateOptions = [...this.publicationDateOptions];
          } else {
            const needle = val.toLowerCase();
            this.filteredPublicationDateOptions = this.publicationDateOptions.filter(
              (date) => date.toLowerCase().indexOf(needle) > -1,
            );
          }
        });
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

      // Called when the user picks a publication date in the new employee modal
      onNewEmployeePublicationDateChange() {
        // Reset effective date selection whenever the publication date changes
        this.selectedNewEmployeeEffectiveDate = null;

        const dates = this.availableEffectiveDates;

        if (dates.length === 0) {
          // No valid effective dates — keep null (pass null to the report)
          this.selectedNewEmployeeEffectiveDate = null;
        } else if (dates.length === 1) {
          // Only one valid effective date — auto-select it silently
          this.selectedNewEmployeeEffectiveDate = dates[0];
        }
        // If > 1: leave null so the user must pick via the selector
      },

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

      filterPositionsByDate() {
        this.selectedFinalSummaryPositions = [];
      },

      onFinalSummarySingleDateChange() {
        this.showFinalSummarySingleDatePicker = false;
        this.filterPositionsByDate();
      },
      onFinalSummaryFromDateChange() {
        this.showFinalSummaryFromDatePicker = false;
        this.filterPositionsByDate();
      },
      onFinalSummaryToDateChange() {
        this.showFinalSummaryToDatePicker = false;
        this.filterPositionsByDate();
      },

      async handleAction(row) {
        this.selectedReport = row;

        if (row.id === 1 || row.id === 3) {
          this.showFinalSummaryModal = true;
          this.selectedFinalSummaryPositions = [];
          this.finalSummaryDateFilterType = 'all';
          this.finalSummarySingleDate = '';
          this.finalSummaryDateRange.from = '';
          this.finalSummaryDateRange.to = '';
        } else if (row.id === 2) {
          this.showTop5Modal = true;
          this.selectedPublicationDate = null;
          await this.loadPublicationDates();
        } else if (row.id === 4) {
          this.showNewEmployeeModal = true;
          this.selectedNewEmployeePublicationDate = null;
          this.selectedNewEmployeeEffectiveDate = null;
          await this.loadNewEmployeeDates();
        } else {
          this.showModal = true;
        }
      },

      onPositionInput(val) {
        if (val.includes('select_all')) {
          this.toggleSelectAll();
        }
      },
      toggleSelectAll() {
        if (this.allSelected) {
          this.selectedPositions = [];
        } else {
          this.selectedPositions = [...this.allPositions];
        }
      },
      togglePosition(pos) {
        if (this.selectedPositions.includes(pos)) {
          this.selectedPositions = this.selectedPositions.filter((p) => p !== pos);
        } else {
          this.selectedPositions = [...this.selectedPositions, pos];
        }
      },
      isPositionSelected(pos) {
        return this.selectedPositions.includes(pos);
      },

      generateReport() {
        this.showModal = false;
        alert(
          `Report: ${this.selectedReport?.name}\nPositions: ${this.selectedPositions.join(', ')}\nDate: ${
            this.dateFilterType === 'single'
              ? this.singleDate
              : `From ${this.dateRange.from} To ${this.dateRange.to}`
          }`,
        );
      },

      closeTop5Modal() {
        this.showTop5Modal = false;
        this.selectedPublicationDate = null;
        this.publicationDateOptions = [];
        this.filteredPublicationDateOptions = [];
      },

      generateTop5Report() {
        this.showTop5Modal = false;
        this.showTop5ReportViewer = true;
      },

      toggleFinalSummarySelectAll() {
        if (this.allFinalSummarySelected) {
          this.selectedFinalSummaryPositions = [];
        } else {
          this.selectedFinalSummaryPositions = [...this.allFinalSummaryPositions];
        }
      },

      toggleFinalSummaryPosition(pos) {
        const index = this.selectedFinalSummaryPositions.indexOf(pos);
        if (index > -1) {
          this.selectedFinalSummaryPositions = this.selectedFinalSummaryPositions.filter(
            (p) => p !== pos,
          );
        } else {
          this.selectedFinalSummaryPositions = [...this.selectedFinalSummaryPositions, pos];
        }
      },

      isFinalSummaryPositionSelected(pos) {
        return this.selectedFinalSummaryPositions.includes(pos);
      },

      closeFinalSummaryModal() {
        this.showFinalSummaryModal = false;
        this.selectedFinalSummaryPositions = [];
        this.finalSummaryDateFilterType = 'all';
        this.finalSummarySingleDate = '';
        this.finalSummaryDateRange.from = '';
        this.finalSummaryDateRange.to = '';
      },

      openFinalSummaryReport() {
        this.showFinalSummaryModal = false;

        if (this.selectedReport?.id === 3) {
          this.selectedApplicantJobpostId = this.selectedFinalSummaryPositions[0];
          this.showApplicantReportViewer = true;
          return;
        }

        this.showReportViewer = true;
      },

      closeNewEmployeeModal() {
        this.showNewEmployeeModal = false;
        this.selectedNewEmployeePublicationDate = null;
        this.selectedNewEmployeeEffectiveDate = null;
        this.newEmployeeDateOptions = [];
        this.filteredNewEmployeeDateOptions = [];
      },

      generateNewEmployeeReport() {
        this.showNewEmployeeModal = false;
        this.showNewEmployeeReportViewer = true;
      },
    },
  };
</script>

<style scoped></style>
