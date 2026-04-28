<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">Civil Service Eligibility</div>
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
        <span>Civil service eligibility records are read-only for this applicant.</span>
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
      :rows="eligibilityData"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-examDate="props">
        <q-td :props="props">{{ formatDate(props.row.date_of_examination) }}</q-td>
      </template>
      <template v-slot:body-cell-validityDate="props">
        <q-td :props="props">{{ formatDate(props.row.date_of_validity) }}</q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey">
          No Civil Service Eligibility Available
        </div>
      </template>
    </q-table>

    <!-- EDIT MODE -->
    <div v-else>
      <!-- Existing rows -->
      <q-card
        v-for="(row, idx) in editStore.draftData.civilService"
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
            <div class="col-12 col-sm-6">
              <q-input
                v-model="row.eligibility"
                label="Eligibility / Career Service *"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.rating" label="Rating (if applicable)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.date_of_examination"
                label="Date of Exam"
                outlined
                dense
                hint="MM/DD/YYYY"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="row.place_of_examination"
                label="Place of Examination"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-input v-model="row.license_number" label="License Number" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-input
                v-model="row.date_of_validity"
                label="Date of Validity"
                outlined
                dense
                hint="MM/DD/YYYY"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Added (new) rows -->
      <q-card
        v-for="(row, idx) in editStore.addedRows.civilService"
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
              @click="editStore.removeAddedRow('civilService', idx)"
            />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="row.eligibility"
                label="Eligibility / Career Service *"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.rating" label="Rating (if applicable)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.date_of_examination"
                label="Date of Exam"
                outlined
                dense
                hint="MM/DD/YYYY"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="row.place_of_examination"
                label="Place of Examination"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-input v-model="row.license_number" label="License Number" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-input
                v-model="row.date_of_validity"
                label="Date of Validity"
                outlined
                dense
                hint="MM/DD/YYYY"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="!editStore.draftData.civilService.length && !editStore.addedRows.civilService.length"
        class="text-grey-7"
      >
        No eligibility records. Click "Add Row" to add one.
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
    eligibility: { type: [Array, Object], required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
    controlNo: { type: [String, Number], default: null },
    hasControlNo: { type: Boolean, required: false, default: false },
  });

  const emit = defineEmits(['saved']);

  const isEditMode = computed(() => editStore.activeEditSection === 'civilService');

  // Compute if we should hide edit button (has ControlNo)
  const isReadOnly = computed(() => {
    return props.hasControlNo || !!props.controlNo;
  });

  // Helper function to normalize eligibility data from either structure
  const normalizeEligibilityData = (data) => {
    if (!data) return [];

    let eligibilityArray = [];
    if (Array.isArray(data)) {
      eligibilityArray = data;
    } else if (data.eligibility && Array.isArray(data.eligibility)) {
      eligibilityArray = data.eligibility;
    } else if (data.eligibity && Array.isArray(data.eligibity)) {
      eligibilityArray = data.eligibity;
    } else {
      return [];
    }

    return eligibilityArray.map((item) => {
      // Check if it's the second structure (has CivilServe, Rates, Dates, Place fields)
      const isSecondStructure =
        'CivilServe' in item || 'Rates' in item || 'Dates' in item || 'Place' in item;

      if (isSecondStructure) {
        // Helper to format date from DD/MM/YYYY to YYYY-MM-DD
        const formatDateFromDMY = (dateStr) => {
          if (!dateStr || typeof dateStr !== 'string') return '';
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return dateStr;
        };

        // Second structure format (from the JSON with ControlNo)
        return {
          id: item.id || null,
          eligibility: item.CivilServe || item.eligibility || '',
          rating: item.Rates || item.rating || '',
          date_of_examination: formatDateFromDMY(item.Dates) || item.date_of_examination || '',
          place_of_examination: item.Place || item.place_of_examination || '',
          license_number: item.LNumber || item.license_number || '',
          date_of_validity: item.LDate || item.date_of_validity || '',
        };
      } else {
        // First structure format
        return {
          id: item.id || null,
          eligibility: item.eligibility || '',
          rating: item.rating || '',
          date_of_examination: item.date_of_examination || '',
          place_of_examination: item.place_of_examination || '',
          license_number: item.license_number || '',
          date_of_validity: item.date_of_validity || '',
        };
      }
    });
  };

  const eligibilityData = computed(() => {
    const normalized = normalizeEligibilityData(props.eligibility);
    return [...normalized];
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

  const columns = [
    {
      name: 'eligibility',
      label: 'Eligibility',
      field: 'eligibility',
      sortable: true,
      align: 'left',
    },
    { name: 'rating', label: 'Rating', field: 'rating', sortable: true, align: 'left' },
    {
      name: 'examDate',
      label: 'Date of Examination',
      field: 'date_of_examination',
      sortable: true,
      align: 'left',
    },
    {
      name: 'examPlace',
      label: 'Place of Examination',
      field: 'place_of_examination',
      sortable: true,
      align: 'left',
    },
    {
      name: 'licenseNumber',
      label: 'License Number',
      field: 'license_number',
      sortable: true,
      align: 'left',
    },
    {
      name: 'validityDate',
      label: 'Date of Validity',
      field: 'date_of_validity',
      sortable: true,
      align: 'left',
    },
  ];

  function enterEdit() {
    // Pass normalized eligibility data to the store
    const normalizedData = normalizeEligibilityData(props.eligibility);
    editStore.startEdit('civilService', normalizedData, props.personalInfoId);
  }

  function addRow() {
    editStore.addRow('civilService');
  }

  function markForDelete(id) {
    if (!id) return;
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Remove this eligibility record?',
      cancel: true,
      persistent: true,
    }).onOk(() => editStore.markForDelete('civilService', id));
  }

  function cancel() {
    editStore.cancelEdit('civilService');
  }

  async function save() {
    const result = await editStore.saveSection('civilService');
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Civil service eligibility updated!' });
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
