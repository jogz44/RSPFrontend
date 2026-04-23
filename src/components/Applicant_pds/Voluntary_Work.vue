<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">Voluntary Work</div>
      <div class="row q-gutter-x-sm" v-if="!isEditMode">
        <q-btn flat round icon="edit" color="primary" size="sm" @click="enterEdit" title="Edit" />
      </div>
      <div class="row q-gutter-x-sm" v-else>
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
      :rows="voluntaryData"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-fromDate="props">
        <q-td :props="props">{{ formatDate(props.row.inclusive_date_from) }}</q-td>
      </template>
      <template v-slot:body-cell-toDate="props">
        <q-td :props="props">{{ formatDate(props.row.inclusive_date_to) }}</q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey">No Voluntary Work Available</div>
      </template>
    </q-table>

    <!-- EDIT MODE -->
    <div v-else>
      <q-card
        v-for="(row, idx) in editStore.draftData.voluntary"
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
                v-model="row.organization_name"
                label="Organization Name & Address *"
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
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.number_of_hours"
                label="Number of Hours"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.position" label="Position / Nature of Work" outlined dense />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card
        v-for="(row, idx) in editStore.addedRows.voluntary"
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
              @click="editStore.removeAddedRow('voluntary', idx)"
            />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="row.organization_name"
                label="Organization Name & Address *"
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
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="row.number_of_hours"
                label="Number of Hours"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.position" label="Position / Nature of Work" outlined dense />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="!editStore.draftData.voluntary.length && !editStore.addedRows.voluntary.length"
        class="text-grey-7"
      >
        No voluntary work records. Click "Add Row" to add one.
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
    voluntary: { type: Array, required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
  });
  const emit = defineEmits(['saved']);

  const isEditMode = computed(() => editStore.activeEditSection === 'voluntary');

  const voluntaryData = computed(() => {
    if (!Array.isArray(props.voluntary)) return [];
    return [...props.voluntary].sort(
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
    {
      name: 'organization',
      required: true,
      label: 'Organization',
      align: 'left',
      field: 'organization_name',
      sortable: true,
    },
    {
      name: 'fromDate',
      align: 'left',
      label: 'From',
      field: 'inclusive_date_from',
      sortable: true,
    },
    { name: 'toDate', align: 'left', label: 'To', field: 'inclusive_date_to', sortable: true },
    { name: 'hours', align: 'left', label: 'Hours', field: 'number_of_hours', sortable: true },
    { name: 'position', align: 'left', label: 'Position', field: 'position', sortable: true },
  ];

  function enterEdit() {
    editStore.startEdit('voluntary', props.voluntary, props.personalInfoId);
  }
  function addRow() {
    editStore.addRow('voluntary');
  }
  function markForDelete(id) {
    if (!id) return;
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Remove this voluntary work record?',
      cancel: true,
      persistent: true,
    }).onOk(() => editStore.markForDelete('voluntary', id));
  }
  function cancel() {
    editStore.cancelEdit('voluntary');
  }
  async function save() {
    const result = await editStore.saveSection('voluntary');
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Voluntary work updated!' });
      emit('saved', result.data);
    } else {
      $q.notify({ type: 'negative', message: result.error || 'Save failed.' });
    }
  }
</script>
