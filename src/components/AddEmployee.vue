<template>
  <q-card
    class="q-pa-none"
    style="width: 900px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column"
  >
    <q-card-section class="q-pa-md" style="position: sticky; top: 0; z-index: 2; background: white">
      <div class="row justify-between items-start">
        <div style="flex: 1">
          <div class="text-h5 text-bold">Add Employee to Position</div>
          <div class="text-body text-grey-8 text-bold q-mt-xs">
            {{ employeeDetails.Position }}
          </div>
          <q-chip dense class="q-mt-xs">
            Position Level:
            <q-badge rounded dense color="green" class="text-white q-ml-sm">
              {{ employeeDetails.level }}
            </q-badge>
          </q-chip>

          <!-- Step Indicator -->
          <q-stepper
            v-model="step"
            ref="stepper"
            flat
            animated
            header-nav
            class="q-mt-md"
            style="box-shadow: none; padding: 0 !important"
          >
            <q-step :name="1" title="Select Employee" icon="person_search" :done="step > 1" />
            <q-step :name="2" title="Appointment Details" icon="assignment" :done="step > 2" />
          </q-stepper>
        </div>
        <div>
          <q-btn icon="close" rounded flat @click="closeModal" />
        </div>
      </div>
    </q-card-section>

    <q-scroll-area class="q-px-md" style="height: 1000px">
      <!-- Step 1: Employee Selection -->
      <q-card-section v-show="step === 1">
        <div class="text-h6 text-bold q-mb-md">Select Employee</div>

        <!-- Selected Employee Display -->
        <div v-if="selectedEmployee" class="q-mb-md">
          <div class="text-caption text-grey-7">Selected Employee</div>
          <div class="text-h6 text-primary text-bold">
            {{ getEmployeeFullName(selectedEmployee) }}
          </div>
          <div class="text-caption text-grey-8">Control No: {{ selectedEmployee.ControlNo }}</div>
        </div>

        <!-- Search Bar -->
        <q-input
          outlined
          dense
          placeholder="Search by name or control number..."
          class="q-mb-md"
          v-model="globalSearch"
          clearable
          @clear="onSearchClear"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Employee Table -->
        <q-table
          flat
          bordered
          :rows="filteredEmployees"
          :columns="employeeColumns"
          row-key="ControlNo"
          :loading="loadingEmployees"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              @click="selectEmployee(props.row)"
              class="cursor-pointer"
              :class="{ 'bg-blue-1 text-bold': isEmployeeSelected(props.row) }"
            >
              <q-td key="ControlNo" :props="props">
                {{ props.row.ControlNo }}
              </q-td>
              <q-td key="Firstname" :props="props">
                {{ props.row.Firstname }}
              </q-td>
              <q-td key="Surname" :props="props">
                {{ props.row.Surname }}
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm q-pa-md">
              <q-icon size="2em" name="people_outline" color="grey-5" />
              <span class="text-grey-7">No employees found</span>
            </div>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>

      <!-- Step 2: Appointment Details -->
      <q-card-section v-show="step === 2" class="q-pb-lg">
        <!-- Selected Employee Header -->
        <div class="q-mb-md q-pa-md bg-grey-2 rounded-borders">
          <div class="row items-center">
            <q-icon name="person" size="sm" color="primary" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Assigning to Position</div>
              <div class="text-body1 text-bold">{{ getEmployeeFullName(selectedEmployee) }}</div>
              <div class="text-caption text-grey-8">
                Control No: {{ selectedEmployee?.ControlNo }}
              </div>
            </div>
          </div>
        </div>

        <!-- Position Information -->
        <div class="text-subtitle1 text-bold q-mb-md">Position Information</div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-input v-model="employeeDetails.Office" label="Office" outlined dense disable />
          </div>
          <div class="col-6">
            <q-input v-model="employeeDetails.Office2" label="Sub-Office" outlined dense disable />
          </div>
          <div class="col-6">
            <q-input v-model="employeeDetails.Group" label="Group" outlined dense disable />
          </div>
          <div class="col-6">
            <q-input v-model="employeeDetails.Division" label="Division" outlined dense disable />
          </div>
          <div class="col-6">
            <q-input v-model="employeeDetails.Section" label="Section" outlined dense disable />
          </div>
          <div class="col-6">
            <q-input v-model="employeeDetails.Unit" label="Unit" outlined dense disable />
          </div>
        </div>

        <!-- Page No and Item No -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-input
              v-model="employeeDetails.PageNo"
              label="Page No *"
              outlined
              dense
              :rules="[(val) => !!val || 'Page No is required']"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </div>
          <div class="col-6">
            <q-input v-model="employeeDetails.ItemNo" label="Item No *" outlined dense readonly>
              <template v-slot:prepend>
                <q-icon name="confirmation_number" />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <!-- Appointment Details -->
        <div class="text-subtitle1 text-bold q-mb-md">Appointment Details</div>
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-6">
            <q-input
              v-model="employeeDetails.Status"
              label="Employment Status"
              outlined
              dense
              disable
              hint="From position designation status"
            >
              <template v-slot:prepend>
                <q-icon name="work" />
              </template>
            </q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model="employeeDetails.Renew"
              label="Nature of Appointment *"
              outlined
              dense
              :rules="[(val) => !!val || 'Required']"
            >
              <template v-slot:prepend>
                <q-icon name="refresh" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Service Dates -->
        <div class="text-subtitle1 text-bold q-mb-md">Service Period</div>
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-6">
            <q-input
              v-model="employeeDetails.FromDate"
              label="From Date *"
              outlined
              dense
              mask="date"
              :rules="[(val) => !!val || 'Required']"
              @blur="updateToDate"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="employeeDetails.FromDate" @update:model-value="updateToDate">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model="employeeDetails.ToDate"
              label="To Date"
              outlined
              dense
              disable
              :hint="getToDateHint()"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Posting Dates (Only show if NOT CO-TERMINOUS or ELECTIVE) -->
        <template v-if="!isCoterminousOrElective">
          <div class="text-subtitle1 text-bold q-mb-md">Posting Period</div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <q-input
                v-model="employeeDetails.post_date"
                label="Post Date *"
                outlined
                dense
                mask="date"
                :rules="[(val) => !!val || 'Required']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="employeeDetails.post_date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="employeeDetails.end_date"
                label="End Date *"
                outlined
                dense
                mask="date"
                :rules="[
                  (val) => !!val || 'Required',
                  (val) => val >= employeeDetails.post_date || 'Must be after Post date',
                ]"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="employeeDetails.end_date"
                        :options="(date) => date >= employeeDetails.post_date"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <q-separator class="q-my-lg" />
        </template>

        <!-- Vice Details -->
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-bold">Vice Details</div>
          <q-btn
            outline
            color="primary"
            label="Load Previous Employee"
            icon="history"
            size="sm"
            @click="loadViceDetails"
            :loading="loadingVice"
            :disable="loadingVice || !employeeDetails.Status"
          >
            <q-tooltip v-if="!employeeDetails.Status">
              Employment status is required to load previous employee
            </q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <!--
              Searchable Vice Select:
              - use-input: enables the text input inside the dropdown
              - input-debounce="0": filter fires immediately on each keystroke
              - @filter: runs our case-insensitive filterViceOptions function
              - hide-selected + fill-input: keeps typed text visible while searching
            -->
            <q-select
              v-model="selectedVice"
              :options="filteredViceOptions"
              option-label="label"
              option-value="value"
              label="Vice Name"
              outlined
              dense
              clearable
              emit-value
              map-options
              use-input
              input-debounce="0"
              hide-selected
              fill-input
              :loading="loadingVice"
              :disable="viceOptions.length === 0"
              @filter="filterViceOptions"
              @update:model-value="handleViceSelection"
              @clear="clearViceSelection"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{
                      viceOptions.length === 0
                        ? 'Click "Load Previous Employee" to fetch data'
                        : 'No match found'
                    }}
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="person" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>Cause: {{ scope.opt.cause }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-6">
            <q-input
              v-model="employeeDetails.vicecause"
              label="Vice Cause"
              outlined
              dense
              disable
              hint="Auto-populated from selected vice"
            >
              <template v-slot:prepend>
                <q-icon name="info" />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <!-- Qualification Standards -->
        <div class="text-subtitle1 text-bold q-mb-md">Qualification Standard</div>
        <q-table
          :rows="qsDataLoad"
          :columns="qsColumns"
          row-key="id"
          :loading="loading"
          hide-bottom
          flat
          bordered
          class="q-mb-md"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td style="white-space: pre-line; word-break: break-word">
                {{ props.row.Education }}
              </q-td>
              <q-td style="white-space: pre-line; word-break: break-word">
                {{ props.row.Experience }}
              </q-td>
              <q-td style="white-space: pre-line; word-break: break-word">
                {{ props.row.Training }}
              </q-td>
              <q-td style="white-space: pre-line; word-break: break-word">
                {{ props.row.Eligibility }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-scroll-area>

    <!-- Footer Actions -->
    <q-card-actions
      align="center"
      class="q-pa-md row justify-between items-center"
      style="
        position: sticky;
        bottom: 0;
        z-index: 2;
        background: white;
        border-top: 1px solid #e0e0e0;
      "
    >
      <!-- Step 1 Actions -->
      <template v-if="step === 1">
        <q-btn flat label="Cancel" color="grey-8" @click="closeModal" size="md" rounded />
        <q-btn
          color="primary"
          :disabled="!selectedEmployee"
          label="Next: Appointment Details"
          @click="goToStep2"
          size="md"
          icon-right="arrow_forward"
          rounded
        />
      </template>

      <!-- Step 2 Actions -->
      <template v-if="step === 2">
        <q-btn
          flat
          label="Back"
          color="grey-8"
          @click="step = 1"
          size="md"
          icon="arrow_back"
          rounded
        />
        <q-btn
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting || !isFormValid"
          label="Add Employee"
          @click="submitEmployee"
          size="md"
          style="width: 200px"
          rounded
        />
      </template>
    </q-card-actions>
  </q-card>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { usePlantillaStore } from 'stores/plantillaStore';
  import { toast } from 'src/boot/toast';
  import { useQuasar } from 'quasar';

  // Props & Emits
  const props = defineProps({
    show: {
      type: Boolean,
      required: true,
    },
    positionData: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['update:show', 'employee-added', 'close']);

  // Store instances
  const usePlantilla = usePlantillaStore();
  const $q = useQuasar();

  // Refs
  const step = ref(1);
  const isSubmitting = ref(false);
  const loading = ref(false);
  const loadingEmployees = ref(false);
  const loadingVice = ref(false);
  const qsDataLoad = ref([]);
  const employeeSearch = ref('');
  const selectedEmployee = ref(null);
  const viceList = ref([]);
  const selectedVice = ref(null);
  const positionDesignation = ref('');
  const globalSearch = ref('');

  // ✅ Holds the currently filtered vice options shown in the dropdown
  const filteredViceOptions = ref([]);

  let searchTimeout = null;

  // Constants
  const employeeColumns = [
    { name: 'ControlNo', label: 'Control No', field: 'ControlNo', align: 'left', sortable: true },
    { name: 'Firstname', label: 'First Name', field: 'Firstname', align: 'left', sortable: true },
    { name: 'Surname', label: 'Surname', field: 'Surname', align: 'left', sortable: true },
  ];

  const qsColumns = [
    { name: 'education', label: 'Education', field: 'Education', align: 'left' },
    { name: 'experience', label: 'Experience', field: 'Experience', align: 'left' },
    { name: 'training', label: 'Training', field: 'Training', align: 'left' },
    { name: 'eligibility', label: 'Eligibility', field: 'Eligibility', align: 'left' },
  ];

  const employeeDetails = ref({
    Office: '',
    Office2: '',
    Group: '',
    Division: '',
    Section: '',
    Unit: '',
    Position: '',
    PositionID: '',
    PageNo: '',
    ItemNo: '',
    SalaryGrade: '',
    salaryMin: '',
    salaryMax: '',
    level: '',
    tblStructureDetails_ID: '',
    FromDate: '',
    ToDate: '',
    Status: '',
    post_date: '',
    end_date: '',
    Renew: '',
    vicename: '',
    vicecause: '',
    controlNo: '',
  });

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------
  const pagination = ref({
    sortBy: 'ControlNo',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  const onRequest = async (props) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;

    await usePlantilla.fetchAllEmployee({
      page,
      perPage: rowsPerPage,
      // Pass search as-is; the API should be case-insensitive on the backend.
      // Client-side filtering via filteredEmployees handles the display layer.
      search: globalSearch.value,
    });

    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.rowsNumber = usePlantilla.total;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;
  };

  // ---------------------------------------------------------------------------
  // ✅ Case-insensitive client-side filter for the employee table.
  //    The store already returns the page from the server, so this is a
  //    secondary filter that normalises casing on whatever the server sends back.
  // ---------------------------------------------------------------------------
  const filteredEmployees = computed(() => {
    const raw = usePlantilla.employee;
    if (!Array.isArray(raw)) return [];

    const term = globalSearch.value.trim().toLowerCase();
    if (!term) return raw;

    return raw.filter((emp) => {
      const firstname = (emp.Firstname || '').toLowerCase();
      const surname = (emp.Surname || '').toLowerCase();
      const controlNo = (emp.ControlNo || '').toLowerCase();
      return (
        firstname.includes(term) ||
        surname.includes(term) ||
        // Also match "firstname surname" or "surname firstname" combos
        `${firstname} ${surname}`.includes(term) ||
        `${surname} ${firstname}`.includes(term) ||
        controlNo.includes(term)
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Vice options — full list derived from viceList
  // ---------------------------------------------------------------------------
  const viceOptions = computed(() => {
    return viceList.value.map((vice) => ({
      label: `${vice.Firstname || ''} ${vice.Surname || ''}`.trim(),
      value: vice.ControlNo,
      controlNo: vice.ControlNo,
      name: `${vice.Firstname || ''} ${vice.Surname || ''}`.trim(),
      cause: vice.SepCause || 'N/A',
    }));
  });

  // Keep filteredViceOptions in sync whenever viceList changes (e.g. after load)
  watch(viceOptions, (newOpts) => {
    filteredViceOptions.value = newOpts;
  });

  // ---------------------------------------------------------------------------
  // ✅ filterViceOptions — called by q-select's @filter event.
  //    Performs case-insensitive substring search on the label (name).
  // ---------------------------------------------------------------------------
  const filterViceOptions = (val, update) => {
    update(() => {
      if (!val || val.trim() === '') {
        filteredViceOptions.value = viceOptions.value;
      } else {
        const term = val.trim().toLowerCase();
        filteredViceOptions.value = viceOptions.value.filter((opt) =>
          opt.label.toLowerCase().includes(term),
        );
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Computed Helpers
  // ---------------------------------------------------------------------------
  const isCoterminousOrElective = computed(() => {
    const status = employeeDetails.value.Status?.toUpperCase();
    return status === 'CO-TERMINOUS' || status === 'ELECTIVE';
  });

  const isFormValid = computed(() => {
    const baseValid =
      selectedEmployee.value &&
      employeeDetails.value.Status &&
      employeeDetails.value.FromDate &&
      employeeDetails.value.ToDate &&
      employeeDetails.value.PageNo &&
      employeeDetails.value.ItemNo &&
      employeeDetails.value.Renew;

    if (isCoterminousOrElective.value) return baseValid;
    return baseValid && employeeDetails.value.post_date && employeeDetails.value.end_date;
  });

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------
  const getEmployeeFullName = (employee) => {
    if (!employee) return '';
    return `${employee.Firstname || ''} ${employee.Surname || ''}`.trim();
  };

  const isEmployeeSelected = (employee) => {
    return selectedEmployee.value?.ControlNo === employee.ControlNo;
  };

  const selectEmployee = (employee) => {
    selectedEmployee.value = employee;
  };

  const onSearchClear = () => {
    globalSearch.value = '';
  };

  const getToDateHint = () => {
    const status = employeeDetails.value.Status?.toUpperCase();
    if (status === 'CO-TERMINOUS' || status === 'ELECTIVE') return '3 years from From Date';
    if (status === 'REGULAR') return 'End of month, Dec 31, 50 years from From Date';
    return 'Calculated based on employment status';
  };

  const calculateToDate = (fromDate, status) => {
    if (!fromDate) return '';
    let baseDate;
    try {
      const dateStr = fromDate.replace(/\//g, '-');
      baseDate = new Date(dateStr);
      if (isNaN(baseDate.getTime())) return '';
    } catch {
      return '';
    }

    const statusUpper = status?.toUpperCase();
    if (statusUpper === 'CO-TERMINOUS' || statusUpper === 'ELECTIVE') {
      const d = new Date(baseDate);
      d.setFullYear(d.getFullYear() + 3);
      return formatDate(d);
    } else if (statusUpper === 'REGULAR') {
      const d = new Date(baseDate);
      d.setFullYear(d.getFullYear() + 50);
      d.setMonth(11);
      d.setDate(31);
      return formatDate(d);
    }
    return formatDate(baseDate);
  };

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  };

  const getCurrentDate = () => formatDate(new Date());

  const updateToDate = () => {
    employeeDetails.value.ToDate = calculateToDate(
      employeeDetails.value.FromDate,
      employeeDetails.value.Status,
    );
  };

  // ---------------------------------------------------------------------------
  // Vice Details Functions
  // ---------------------------------------------------------------------------
  const loadViceDetails = async () => {
    if (!positionDesignation.value || !employeeDetails.value.Status) {
      toast.error('Position designation and employment status are required');
      return;
    }
    try {
      loadingVice.value = true;
      const viceData = await usePlantilla.fetchVice(
        positionDesignation.value,
        employeeDetails.value.Status,
      );
      viceList.value = viceData || [];
      // Reset filtered list to full list after fresh load
      filteredViceOptions.value = viceOptions.value;

      if (viceList.value.length === 0) {
        toast.info('No previous employees found for this position and status');
      } else {
        toast.success(`Found ${viceList.value.length} previous employee(s)`);
      }
    } catch (error) {
      console.error('Error loading vice details:', error);
      toast.error('Failed to load previous employee data');
      viceList.value = [];
      filteredViceOptions.value = [];
    } finally {
      loadingVice.value = false;
    }
  };

  const handleViceSelection = (controlNo) => {
    if (!controlNo) {
      employeeDetails.value.vicename = '';
      employeeDetails.value.vicecause = '';
      return;
    }
    const selected = viceOptions.value.find((opt) => opt.value === controlNo);
    if (selected) {
      employeeDetails.value.vicename = selected.name;
      employeeDetails.value.vicecause = selected.cause;
    }
  };

  const clearViceSelection = () => {
    employeeDetails.value.vicename = '';
    employeeDetails.value.vicecause = '';
    selectedVice.value = null;
  };

  // ---------------------------------------------------------------------------
  // Data Loading
  // ---------------------------------------------------------------------------
  const loadPositionData = async () => {
    if (!props.positionData?.PositionID) {
      console.error('Invalid position data:', props.positionData);
      toast.error('Invalid position data');
      return;
    }

    const today = getCurrentDate();
    const status = props.positionData.designationStatus || '';
    const toDate = calculateToDate(today, status);

    positionDesignation.value = props.positionData.Designation || props.positionData.position || '';

    employeeDetails.value = {
      Office: props.positionData.office || '',
      Office2: props.positionData.office2 || '',
      Group: props.positionData.group || '',
      Division: props.positionData.division || '',
      Section: props.positionData.section || '',
      Unit: props.positionData.unit || '',
      Position: props.positionData.position || '',
      PositionID: props.positionData.PositionID || '',
      PageNo: props.positionData.PageNo || '',
      ItemNo: props.positionData.ItemNo || '',
      SalaryGrade: props.positionData.SG || '',
      salaryMin: '',
      salaryMax: '',
      level: props.positionData.level || '',
      tblStructureDetails_ID: props.positionData.ID || '',
      FromDate: today,
      ToDate: toDate,
      Status: status,
      post_date: today,
      end_date: today,
      Renew: '',
      vicename: '',
      vicecause: '',
      controlNo: '',
    };

    try {
      loading.value = true;
      await usePlantilla.fetchQsData(props.positionData.PositionID);
      qsDataLoad.value = usePlantilla.qsData || [];
    } catch (error) {
      console.error('Error loading qualification standards:', error);
      toast.error('Failed to load qualification standards');
    } finally {
      loading.value = false;
    }
  };

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const goToStep2 = () => {
    if (!selectedEmployee.value) {
      toast.error('Please select an employee first');
      return;
    }
    employeeDetails.value.controlNo = selectedEmployee.value.ControlNo;
    step.value = 2;
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const submitEmployee = async () => {
    if (isSubmitting.value) return;
    if (!isFormValid.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    isSubmitting.value = true;
    try {
      const postDate = isCoterminousOrElective.value
        ? 'N/A'
        : employeeDetails.value.post_date.replace(/\//g, '-');
      const endDate = isCoterminousOrElective.value
        ? 'N/A'
        : employeeDetails.value.end_date.replace(/\//g, '-');

      const payload = {
        Office: employeeDetails.value.Office,
        Office2: employeeDetails.value.Office2,
        Group: employeeDetails.value.Group,
        Division: employeeDetails.value.Division,
        Section: employeeDetails.value.Section,
        Unit: employeeDetails.value.Unit,
        Position: employeeDetails.value.Position,
        PositionID: parseInt(employeeDetails.value.PositionID),
        isOpen: false,
        PageNo: employeeDetails.value.PageNo,
        ItemNo: employeeDetails.value.ItemNo,
        SalaryGrade: employeeDetails.value.SalaryGrade,
        salaryMin: employeeDetails.value.salaryMin || null,
        salaryMax: employeeDetails.value.salaryMax || null,
        level: employeeDetails.value.level,
        tblStructureDetails_ID: employeeDetails.value.tblStructureDetails_ID,
        FromDate: employeeDetails.value.FromDate.replace(/\//g, '-'),
        ToDate: employeeDetails.value.ToDate.replace(/\//g, '-'),
        Status: employeeDetails.value.Status,
        post_date: postDate,
        end_date: endDate,
        sepdate: employeeDetails.value.ToDate.replace(/\//g, '-'),
        sepcause: 'N/A',
        vicename: employeeDetails.value.vicename,
        vicecause: employeeDetails.value.vicecause,
        Renew: employeeDetails.value.Renew,
        controlNo: employeeDetails.value.controlNo,
      };

      console.log('Submitting payload:', payload);
      const response = await usePlantilla.addEmployee(payload);
      console.log('Response:', response);

      if (response?.data?.success) {
        $q.notify({
          type: 'positive',
          message: response.data.message || 'Employee added successfully!',
          position: 'top',
          timeout: 2000,
        });
        emit('employee-added');
        closeModal();
      } else {
        $q.notify({
          type: 'negative',
          message: response?.data?.message || 'Failed to add employee. Please try again.',
          position: 'top',
          timeout: 4000,
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      $q.notify({
        type: 'negative',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to add employee. Please try again.',
        position: 'top',
        timeout: 4000,
      });
    } finally {
      isSubmitting.value = false;
    }
  };

  // ---------------------------------------------------------------------------
  // Close Modal
  // ---------------------------------------------------------------------------
  const closeModal = () => {
    step.value = 1;
    selectedEmployee.value = null;
    selectedVice.value = null;
    viceList.value = [];
    filteredViceOptions.value = [];
    employeeSearch.value = '';
    globalSearch.value = '';
    positionDesignation.value = '';
    employeeDetails.value = {
      Office: '',
      Office2: '',
      Group: '',
      Division: '',
      Section: '',
      Unit: '',
      Position: '',
      PositionID: '',
      PageNo: '',
      ItemNo: '',
      SalaryGrade: '',
      salaryMin: '',
      salaryMax: '',
      level: '',
      tblStructureDetails_ID: '',
      FromDate: '',
      ToDate: '',
      Status: '',
      post_date: '',
      end_date: '',
      Renew: '',
      vicename: '',
      vicecause: '',
      controlNo: '',
    };
    qsDataLoad.value = [];
    emit('update:show', false);
    emit('close');
  };

  // ---------------------------------------------------------------------------
  // Watchers
  // ---------------------------------------------------------------------------
  watch(
    () => props.show,
    async (newVal) => {
      if (newVal) await loadPositionData();
    },
  );

  watch(
    () => props.positionData,
    async (newVal) => {
      if (newVal && props.show) await loadPositionData();
    },
    { deep: true },
  );

  watch(
    () => employeeDetails.value.FromDate,
    (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) updateToDate();
    },
  );

  // ✅ Debounced search watcher — passes the raw string to the API
  //    (backend should handle case-insensitivity), and the computed
  //    filteredEmployees handles it client-side as a safety net.
  watch(globalSearch, (newValue) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      pagination.value.page = 1;
      await usePlantilla.fetchAllEmployee({
        page: 1,
        perPage: pagination.value.rowsPerPage,
        search: newValue, // raw value; backend should be case-insensitive
      });
      pagination.value.rowsNumber = usePlantilla.total;
    }, 500);
  });

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  onMounted(async () => {
    if (props.show && props.positionData) loadPositionData();

    await usePlantilla.fetchAllEmployee({
      page: 1,
      perPage: pagination.value.rowsPerPage,
      search: '',
    });
    pagination.value.rowsNumber = usePlantilla.total;
  });
</script>

<style lang="scss" scoped>
  :deep(.q-stepper--horizontal .q-stepper__step-inner) {
    padding: 0%;
  }
  :deep(.q-field--outlined) {
    padding: 0;
  }
  :deep(.q-table) {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }
  :deep(.q-stepper) {
    background: transparent;
  }

  .cursor-pointer {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .cursor-pointer:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  .rounded-borders {
    border-radius: 8px;
  }
</style>
