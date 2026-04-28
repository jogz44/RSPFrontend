<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">L&amp;D Interventions</div>
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
        <span>L&amp;D Interventions records are read-only for this applicant.</span>
      </div>
    </q-banner>

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
      :rows="trainingData"
      :columns="columns"
      row-key="id"
      wrap-cells
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-fromDate="props">
        <q-td :props="props">{{ formatDate(props.row.inclusive_date_from) }}</q-td>
      </template>
      <template v-slot:body-cell-toDate="props">
        <q-td :props="props">{{ formatDate(props.row.inclusive_date_to) }}</q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey">
          No L&amp;D Interventions Available
        </div>
      </template>
    </q-table>

    <!-- EDIT MODE -->
    <div v-else>
      <q-card
        v-for="(row, idx) in editStore.draftData.training"
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
            <div class="col-12">
              <q-input
                v-model="row.training_title"
                label="Title of Learning & Development Intervention *"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.inclusive_date_from" label="From (MM/DD/YYYY)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.inclusive_date_to" label="To (MM/DD/YYYY)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-2">
              <q-input
                v-model="row.number_of_hours"
                label="No. of Hours"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="row.type"
                label="Type"
                :options="trainingTypeOptions"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.conducted_by" label="Conducted / Sponsored By" outlined dense />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card
        v-for="(row, idx) in editStore.addedRows.training"
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
              @click="editStore.removeAddedRow('training', idx)"
            />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="row.training_title"
                label="Title of Learning & Development Intervention *"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.inclusive_date_from" label="From (MM/DD/YYYY)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.inclusive_date_to" label="To (MM/DD/YYYY)" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-2">
              <q-input
                v-model="row.number_of_hours"
                label="No. of Hours"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="row.type"
                label="Type"
                :options="trainingTypeOptions"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.conducted_by" label="Conducted / Sponsored By" outlined dense />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="!editStore.draftData.training.length && !editStore.addedRows.training.length"
        class="text-grey-7"
      >
        No training records. Click "Add Row" to add one.
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
    ldData: { type: [Array, Object], required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
    controlNo: { type: [String, Number], default: null },
    hasControlNo: { type: Boolean, required: false, default: false },
  });

  const emit = defineEmits(['saved']);

  const isEditMode = computed(() => editStore.activeEditSection === 'training');

  // Compute if we should hide edit button (has ControlNo)
  const isReadOnly = computed(() => {
    return props.hasControlNo || !!props.controlNo;
  });

  const trainingTypeOptions = [
    'Managerial',
    'Supervisory',
    'Technical',
    'Foundation',
    'Orientation',
  ];

  // Helper function to format date from DD/MM/YYYY to YYYY-MM-DD
  const formatDateFromDMY = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Helper function to normalize training data from either structure
  const normalizeTrainingData = (data) => {
    if (!data) return [];

    let trainingArray = [];
    if (Array.isArray(data)) {
      trainingArray = data;
    } else if (data.training && Array.isArray(data.training)) {
      trainingArray = data.training;
    } else {
      return [];
    }

    return trainingArray.map((item) => {
      // Check if it's the second structure (has Training, Dates, DateFrom, DateTo fields)
      const isSecondStructure =
        'Training' in item || 'Dates' in item || 'DateFrom' in item || 'DateTo' in item;

      if (isSecondStructure) {
        // Second structure format (from the JSON with ControlNo)
        return {
          id: item.id || null,
          training_title: item.Training || '',
          inclusive_date_from: formatDateFromDMY(item.DateFrom) || '',
          inclusive_date_to: formatDateFromDMY(item.DateTo) || '',
          number_of_hours: item.NumHours || '',
          type: item.type || item.Type || '',
          conducted_by: item.Conductor || '',
          _original: item,
        };
      } else {
        // First structure format
        return {
          id: item.id || null,
          training_title: item.training_title || '',
          inclusive_date_from: item.inclusive_date_from || '',
          inclusive_date_to: item.inclusive_date_to || '',
          number_of_hours: item.number_of_hours || '',
          type: item.type || '',
          conducted_by: item.conducted_by || '',
          _original: item,
        };
      }
    });
  };

  const trainingData = computed(() => {
    const normalized = normalizeTrainingData(props.ldData);
    return [...normalized].sort(
      (a, b) => new Date(b.inclusive_date_from || 0) - new Date(a.inclusive_date_from || 0),
    );
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
    { name: 'title', label: 'Title', field: 'training_title', align: 'left', sortable: true },
    {
      name: 'fromDate',
      label: 'From',
      field: 'inclusive_date_from',
      align: 'left',
      sortable: true,
    },
    { name: 'toDate', label: 'To', field: 'inclusive_date_to', align: 'left', sortable: true },
    {
      name: 'hours',
      label: 'No. of Hours',
      field: 'number_of_hours',
      align: 'left',
      sortable: true,
    },
    { name: 'type', label: 'Type', field: 'type', align: 'left', sortable: true },
    {
      name: 'conductor',
      label: 'Conducted By',
      field: 'conducted_by',
      align: 'left',
      sortable: true,
    },
  ];

  function enterEdit() {
    // Pass normalized training data to the store
    const normalizedData = normalizeTrainingData(props.ldData);
    editStore.startEdit('training', normalizedData, props.personalInfoId);
  }

  function addRow() {
    editStore.addRow('training');
  }

  function markForDelete(id) {
    if (!id) return;
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Remove this training record?',
      cancel: true,
      persistent: true,
    }).onOk(() => editStore.markForDelete('training', id));
  }

  function cancel() {
    editStore.cancelEdit('training');
  }

  async function save() {
    const result = await editStore.saveSection('training');
    if (result.success) {
      $q.notify({ type: 'positive', message: 'L&D Interventions updated!' });
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
