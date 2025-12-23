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
                <!-- Select All Entry at the top -->
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
                <!-- Regular Position Options -->
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
  </q-page>
</template>

<script>
  export default {
    name: 'ReportManagementPage',
    data() {
      return {
        columns: [
          {
            name: 'id',
            label: 'ID',
            align: 'left',
            field: 'id',
            sortable: true,
          },
          {
            name: 'name',
            label: 'Report Name',
            align: 'left',
            field: 'name',
            sortable: true,
          },
          {
            name: 'description',
            label: 'Description',
            align: 'left',
            field: 'description',
            sortable: true,
          },
          {
            name: 'actions',
            label: 'Actions',
            align: 'center',
            field: 'actions',
            sortable: false,
          },
        ],

        reports: [
          {
            id: 1,
            name: 'Applicant',
            description: 'Reports for all the applicant',
          },
          {
            id: 2,
            name: 'Schedule ',
            description: 'Reports for scheduled interview',
          },
        ],

        pagination: {
          rowsPerPage: 10,
        },

        showModal: false,
        selectedReport: null,

        // Position multi-select
        positionOptions: [
          { value: 'select_all', label: 'Select All' }, // For slot logic
          { value: 'developer', label: 'Developer' },
          { value: 'designer', label: 'Designer' },
          { value: 'manager', label: 'Manager' },
          // Add more positions as needed
        ],
        selectedPositions: [],

        // Date filter logic
        dateFilterType: 'single',
        singleDate: '',

        dateRange: {
          from: '',
          to: '',
        },
        showSingleDatePicker: false,
        showFromDatePicker: false,
        showToDatePicker: false,
      };
    },

    computed: {
      allPositions() {
        // Exclude 'select_all'
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
    },

    methods: {
      handleAction(row) {
        this.selectedReport = row;
        this.showModal = true;
      },

      onPositionInput(val) {
        // If user interact directly with select, handle select all!
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
        // Implement logic to generate report using this.selectedReport, this.selectedPositions, and date filters
        this.showModal = false;
        alert(
          `Report: ${this.selectedReport?.name}\nPositions: ${this.selectedPositions.join(', ')}\nDate: ${
            this.dateFilterType === 'single'
              ? this.singleDate
              : `From ${this.dateRange.from} To ${this.dateRange.to}`
          }`,
        );
      },
    },
  };
</script>

<style scoped></style>
