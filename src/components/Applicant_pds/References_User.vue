<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">References</div>
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
        <span>References are read-only for this applicant.</span>
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
      :rows="referencesData"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
    >
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey-7">No references available</div>
      </template>
    </q-table>

    <!-- EDIT MODE -->
    <div v-else>
      <!-- Existing rows -->
      <q-card
        v-for="(row, idx) in editStore.draftData.references"
        :key="row.id ?? idx"
        flat
        bordered
        class="q-mb-sm"
      >
        <q-card-section class="row items-center q-gutter-x-md q-py-sm">
          <div class="text-grey-7 text-caption col-auto">#{{ idx + 1 }}</div>
          <div class="col">
            <q-input v-model="row.full_name" label="Full Name *" outlined dense />
          </div>
          <div class="col">
            <q-input v-model="row.address" label="Address" outlined dense />
          </div>
          <div class="col-3">
            <q-input v-model="row.contact_number" label="Contact Number" outlined dense />
          </div>
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="markForDelete(row.id)"
          />
        </q-card-section>
      </q-card>

      <!-- New rows -->
      <q-card
        v-for="(row, idx) in editStore.addedRows.references"
        :key="`new-${idx}`"
        flat
        bordered
        class="q-mb-sm bg-blue-1"
      >
        <q-card-section class="row items-center q-gutter-x-md q-py-sm">
          <div class="text-blue-8 text-caption col-auto">New</div>
          <div class="col">
            <q-input v-model="row.full_name" label="Full Name *" outlined dense />
          </div>
          <div class="col">
            <q-input v-model="row.address" label="Address" outlined dense />
          </div>
          <div class="col-3">
            <q-input v-model="row.contact_number" label="Contact Number" outlined dense />
          </div>
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="editStore.removeAddedRow('references', idx)"
          />
        </q-card-section>
      </q-card>

      <q-banner
        v-if="!editStore.draftData.references.length && !editStore.addedRows.references.length"
        class="text-grey-7"
      >
        No references. Click "Add Row" to add one.
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
    references: { type: [Array, Object], required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
    controlNo: { type: [String, Number], default: null },
    hasControlNo: { type: Boolean, required: false, default: false },
  });

  const emit = defineEmits(['saved']);

  const isEditMode = computed(() => editStore.activeEditSection === 'references');

  // Compute if we should hide edit button (has ControlNo)
  const isReadOnly = computed(() => {
    return props.hasControlNo || !!props.controlNo;
  });

  // Helper function to normalize references data from either structure
  const normalizeReferencesData = (data) => {
    if (!data) return [];

    let referencesArray = [];
    if (Array.isArray(data)) {
      referencesArray = data;
    } else if (data.reference && Array.isArray(data.reference)) {
      referencesArray = data.reference;
    } else if (data.references && Array.isArray(data.references)) {
      referencesArray = data.references;
    } else {
      return [];
    }

    return referencesArray.map((item) => {
      // Check if it's the second structure (has Names, Address, TelNo fields)
      const isSecondStructure = 'Names' in item || 'TelNo' in item;

      if (isSecondStructure) {
        // Second structure format (from the JSON with ControlNo)
        return {
          id: item.id || item.PMID || null,
          full_name: item.Names || '',
          address: item.Address || '',
          contact_number: item.TelNo || '',
          _original: item,
        };
      } else {
        // First structure format
        return {
          id: item.id || null,
          full_name: item.full_name || item.fullName || '',
          address: item.address || '',
          contact_number: item.contact_number || item.contactNumber || item.contactNo || '',
          _original: item,
        };
      }
    });
  };

  const referencesData = computed(() => {
    const normalized = normalizeReferencesData(props.references);
    return normalized;
  });

  const columns = [
    {
      name: 'fullName',
      required: true,
      label: 'Full Name',
      align: 'left',
      field: 'full_name',
      sortable: true,
    },
    { name: 'address', align: 'left', label: 'Address', field: 'address', sortable: true },
    {
      name: 'contactNumber',
      align: 'left',
      label: 'Contact Number',
      field: 'contact_number',
      sortable: true,
    },
  ];

  function enterEdit() {
    // Pass normalized references data to the store
    const normalizedData = normalizeReferencesData(props.references);
    editStore.startEdit('references', normalizedData, props.personalInfoId);
  }

  function addRow() {
    editStore.addRow('references');
  }

  function markForDelete(id) {
    if (!id) return;
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Remove this reference?',
      cancel: true,
      persistent: true,
    }).onOk(() => editStore.markForDelete('references', id));
  }

  function cancel() {
    editStore.cancelEdit('references');
  }

  async function save() {
    const result = await editStore.saveSection('references');
    if (result.success) {
      $q.notify({ type: 'positive', message: 'References updated!' });
      emit('saved', result.data);
    } else {
      $q.notify({ type: 'negative', message: result.error || 'Save failed.' });
    }
  }
</script>

<style scoped>
  .my-sticky-header-table {
    max-height: 400px;
  }
</style>
