<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">Work Experience</div>
      <div class="row q-gutter-x-sm" v-if="!isEditMode && !isReadOnly">
        <q-btn flat round icon="edit" color="primary" size="sm" @click="enterEdit" title="Edit" />
      </div>
      <div class="row q-gutter-x-sm" v-else-if="isEditMode">
        <q-btn
          unelevated
          rounded
          label="Add Row"
          icon="add"
          color="primary"
          size="sm"
          @click="addRow"
        />
        <q-btn
          unelevated
          rounded
          label="Save"
          icon="save"
          color="positive"
          size="sm"
          :loading="editStore.isSaving"
          @click="save"
        />
        <q-btn flat rounded label="Cancel" icon="close" color="grey-7" size="sm" @click="cancel" />
      </div>
    </div>

    <!-- Read-only notice for ControlNo applicants -->
    <q-banner v-if="isReadOnly && !isEditMode" class="bg-grey-2 text-grey-8 q-mb-md" rounded>
      <div class="row items-center">
        <q-icon name="info" size="sm" class="q-mr-sm" />
        <span>Work experience records are read-only for this applicant.</span>
      </div>
    </q-banner>

    <!-- Error banner -->
    <q-banner
      v-if="editStore.saveError && isEditMode"
      class="bg-negative text-white q-mb-md"
      rounded
    >
      {{ editStore.saveError }}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="editStore.saveError = null" />
      </template>
    </q-banner>

    <!-- VIEW MODE -->
    <q-table
      v-if="!isEditMode"
      :rows="experienceData"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-fromDate="props">
        <q-td :props="props">{{ formatDate(props.row.work_date_from) }}</q-td>
      </template>
      <template v-slot:body-cell-toDate="props">
        <q-td :props="props">{{ formatDate(props.row.work_date_to) }}</q-td>
      </template>
      <template v-slot:body-cell-monthlySalary="props">
        <q-td :props="props">{{ formatCurrency(props.row.monthly_salary) }}</q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey">No Work Experience Available</div>
      </template>
    </q-table>

    <!-- EDIT MODE -->
    <div v-else>
      <!-- Existing rows -->
      <q-card
        v-for="(row, idx) in editStore.draftData.work"
        :key="row.id ?? idx"
        flat
        bordered
        class="q-mb-md"
      >
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-bold text-grey-7">Row #{{ idx + 1 }}</div>
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="markForDelete(row.id)"
            />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.work_date_from" label="From (MM/DD/YYYY)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.work_date_to"
                label="To (MM/DD/YYYY)"
                outlined
                dense
                hint="Leave blank if present"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.position_title" label="Position Title *" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.department" label="Department / Office *" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.monthly_salary"
                label="Monthly Salary"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.salary_grade" label="Salary Grade" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="row.status_of_appointment"
                label="Status of Appointment"
                :options="appointmentOptions"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="row.government_service"
                label="Gov't Service?"
                :options="['Yes', 'No']"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- New rows -->
      <q-card
        v-for="(row, idx) in editStore.addedRows.work"
        :key="`new-${idx}`"
        flat
        bordered
        class="q-mb-md bg-blue-1"
      >
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-bold text-blue-8">New Row #{{ idx + 1 }}</div>
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="editStore.removeAddedRow('work', idx)"
            />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.work_date_from" label="From (MM/DD/YYYY)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.work_date_to"
                label="To (MM/DD/YYYY)"
                outlined
                dense
                hint="Leave blank if present"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.position_title" label="Position Title *" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.department" label="Department / Office *" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.monthly_salary"
                label="Monthly Salary"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.salary_grade" label="Salary Grade" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="row.status_of_appointment"
                label="Status of Appointment"
                :options="appointmentOptions"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="row.government_service"
                label="Gov't Service?"
                :options="['Yes', 'No']"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="!editStore.draftData.work.length && !editStore.addedRows.work.length"
        class="text-grey-7"
      >
        No work experience records. Click "Add Row" to add one.
      </q-banner>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { usePdsEditStore } from 'stores/pdsEditStore';
  import { useQuasar } from 'quasar';

  const $q = useQuasar();
  const editStore = usePdsEditStore();

  const props = defineProps({
    experience: { type: [Array, Object], required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
    controlNo: { type: [String, Number], default: null },
    hasControlNo: { type: Boolean, required: false, default: false },
  });

  const emit = defineEmits(['saved']);

  const isEditMode = computed(() => editStore.activeEditSection === 'work');

  // Compute if we should hide edit button (has ControlNo)
  const isReadOnly = computed(() => {
    return props.hasControlNo || !!props.controlNo;
  });

  const appointmentOptions = ['Permanent', 'Temporary', 'Casual', 'Contractual', 'Co-terminus'];

  // Helper function to format date from DD/MM/YYYY to YYYY-MM-DD
  const formatDateFromDMY = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Helper function to extract salary amount from formatted string (e.g., "₱ 56,390.00" -> 56390)
  const extractSalaryAmount = (salaryStr) => {
    if (!salaryStr) return '';
    if (typeof salaryStr === 'number') return salaryStr;
    // Remove currency symbol, commas, and convert to number
    const amount = salaryStr.toString().replace(/[₱,]/g, '').trim();
    return parseFloat(amount) || '';
  };

  // Helper function to map government_service values
  const mapGovService = (value) => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === 'YES' || value === 'true' || value === 1 || value === '1') return 'Yes';
    if (value === 'NO' || value === 'false' || value === 0 || value === '0') return 'No';
    return value;
  };

  // Helper function to normalize work experience data from either structure
  const normalizeWorkData = (data) => {
    if (!data) return [];

    let workArray = [];
    if (Array.isArray(data)) {
      workArray = data;
    } else if (data.work_experience && Array.isArray(data.work_experience)) {
      workArray = data.work_experience;
    } else {
      return [];
    }

    return workArray.map((item) => {
      // Check if it's the second structure (has WFrom, WTo, WPosition, WCompany fields)
      const isSecondStructure =
        'WFrom' in item || 'WTo' in item || 'WPosition' in item || 'WCompany' in item;

      if (isSecondStructure) {
        // Second structure format (from the JSON with ControlNo)
        return {
          id: item.id || null,
          work_date_from: formatDateFromDMY(item.WFrom) || '',
          work_date_to: item.WTo === 'PRESENT' ? '' : formatDateFromDMY(item.WTo) || '',
          position_title: item.WPosition || '',
          department: item.WCompany || '',
          monthly_salary: extractSalaryAmount(item.WSalary) || '',
          salary_grade: item.WGrade ? item.WGrade.split('-')[0] : '', // Extract grade number from "19-1"
          status_of_appointment: item.Status || '',
          government_service: mapGovService(item.WGov),
          _original: item,
        };
      } else {
        // First structure format
        return {
          id: item.id || null,
          work_date_from: item.work_date_from || '',
          work_date_to: item.work_date_to || '',
          position_title: item.position_title || '',
          department: item.department || '',
          monthly_salary: item.monthly_salary || '',
          salary_grade: item.salary_grade || '',
          status_of_appointment: item.status_of_appointment || '',
          government_service: mapGovService(item.government_service),
          _original: item,
        };
      }
    });
  };

  const experienceData = computed(() => {
    const normalized = normalizeWorkData(props.experience);
    return [...normalized].sort((a, b) => {
      return new Date(b.work_date_from || 0) - new Date(a.work_date_from || 0);
    });
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    try {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
        parseFloat(amount),
      );
    } catch {
      return amount;
    }
  };

  const columns = [
    { name: 'fromDate', label: 'From', field: 'work_date_from', align: 'left', sortable: true },
    { name: 'toDate', label: 'To', field: 'work_date_to', align: 'left', sortable: true },
    {
      name: 'positionTitle',
      label: 'Position Title',
      field: 'position_title',
      align: 'left',
      sortable: true,
    },
    { name: 'department', label: 'Department', field: 'department', align: 'left', sortable: true },
    {
      name: 'monthlySalary',
      label: 'Monthly Salary',
      field: 'monthly_salary',
      align: 'right',
      sortable: true,
    },
    {
      name: 'salaryGrade',
      label: 'Salary Grade',
      field: 'salary_grade',
      align: 'left',
      sortable: true,
    },
    {
      name: 'appointmentStatus',
      label: 'Status of Appointment',
      field: 'status_of_appointment',
      align: 'left',
      sortable: true,
    },
    {
      name: 'govtService',
      label: "Gov't Service",
      field: 'government_service',
      align: 'left',
      sortable: true,
    },
  ];

  function enterEdit() {
    // Pass normalized work data to the store
    const normalizedData = normalizeWorkData(props.experience);
    editStore.startEdit('work', normalizedData, props.personalInfoId);
  }

  function addRow() {
    editStore.addRow('work');
  }

  function markForDelete(id) {
    if (!id) return;
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Remove this work experience record?',
      cancel: true,
      persistent: true,
    }).onOk(() => editStore.markForDelete('work', id));
  }

  function cancel() {
    editStore.cancelEdit('work');
  }

  async function save() {
    const result = await editStore.saveSection('work');
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Work experience updated!' });
      emit('saved', result.data);
    } else {
      $q.notify({ type: 'negative', message: result.error || 'Save failed.' });
    }
  }
</script>

<style scoped>
  .q-table {
    background: white;
  }
</style>
