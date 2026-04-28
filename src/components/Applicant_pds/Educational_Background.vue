<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">Education Background</div>
      <div class="row q-gutter-x-sm" v-if="!isEditMode && !hasControlNo">
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
    <q-banner v-if="hasControlNo" class="bg-grey-2 text-grey-8 q-mb-md" rounded>
      <div class="row items-center">
        <q-icon name="info" size="sm" class="q-mr-sm" />
        <span>Education records are read-only for this applicant.</span>
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
      :rows="educationData"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey">No Education Data Available</div>
      </template>
    </q-table>

    <!-- EDIT MODE -->
    <div v-else>
      <!-- Existing rows -->
      <q-card
        v-for="(row, idx) in editStore.draftData.education"
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
              title="Remove"
            />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="row.level"
                label="Level *"
                :options="levelOptions"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-6 col-md-8">
              <q-input v-model="row.school_name" label="School Name *" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.degree" label="Degree / Course" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.attendance_from" label="From" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.attendance_to" label="To" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.highest_units" label="Highest Units Earned" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.year_graduated" label="Year Graduated" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.scholarship" label="Scholarship / Honors" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="row.graduated"
                label="Graduated?"
                :options="['Yes', 'No']"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Added (new) rows -->
      <q-card
        v-for="(row, idx) in editStore.addedRows.education"
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
              @click="editStore.removeAddedRow('education', idx)"
            />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="row.level"
                label="Level *"
                :options="levelOptions"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-6 col-md-8">
              <q-input v-model="row.school_name" label="School Name *" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.degree" label="Degree / Course" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.attendance_from" label="From" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.attendance_to" label="To" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.highest_units" label="Highest Units Earned" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="row.year_graduated" label="Year Graduated" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="row.scholarship" label="Scholarship / Honors" outlined dense />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="row.graduated"
                label="Graduated?"
                :options="['Yes', 'No']"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="!editStore.draftData.education.length && !editStore.addedRows.education.length"
        class="text-grey-7"
      >
        No education records. Click "Add Row" to add one.
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
    educ: { type: [Array, Object], required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
    controlNo: { type: [String, Number], default: null },
    hasControlNo: { type: Boolean, required: false, default: false },
  });

  const emit = defineEmits(['saved']);

  const isEditMode = computed(() => editStore.activeEditSection === 'education');

  const levelOptions = [
    'Elementary',
    'Secondary',
    'Vocational / Trade Course',
    'College',
    'Graduate Studies',
  ];

  // Helper to normalize education data from either structure
  const normalizeEducationData = (data) => {
    if (!data) return [];

    let educationArray = [];
    if (Array.isArray(data)) {
      educationArray = data;
    } else if (data.education && Array.isArray(data.education)) {
      educationArray = data.education;
    } else {
      return [];
    }

    return educationArray.map((item) => {
      // Check if it's the second structure (has Education, School, Degree fields)
      const isSecondStructure = 'Education' in item || 'School' in item || 'DateAttend' in item;

      if (isSecondStructure) {
        // Helper to extract from year from "1996 - 2002" format
        const extractFromYear = (dateAttend) => {
          if (!dateAttend || typeof dateAttend !== 'string') return '';
          const match = dateAttend.match(/^(\d{4})/);
          return match ? match[1] : '';
        };

        const extractToYear = (dateAttend) => {
          if (!dateAttend || typeof dateAttend !== 'string') return '';
          const match = dateAttend.match(/(\d{4})$/);
          return match ? match[1] : '';
        };

        // Second structure format
        return {
          id: item.id || null,
          level: item.Education || '',
          school_name: item.School || '',
          degree: item.Degree || '',
          attendance_from: extractFromYear(item.DateAttend) || '',
          attendance_to: extractToYear(item.DateAttend) || '',
          highest_units: item.NumUnits || '',
          year_graduated: item.year_graduated || '',
          scholarship: item.Honors || '',
          graduated: item.Graduated || '',
        };
      } else {
        // First structure format
        return {
          id: item.id || null,
          level: item.level || '',
          school_name: item.school_name || '',
          degree: item.degree || '',
          attendance_from: item.attendance_from || '',
          attendance_to: item.attendance_to || '',
          highest_units: item.highest_units || '',
          year_graduated: item.year_graduated || '',
          scholarship: item.scholarship || '',
          graduated: item.graduated || '',
        };
      }
    });
  };

  const getLevelPriority = (level) => {
    if (!level) return 999;
    const l = level.toLowerCase();
    if (l.includes('elementary')) return 1;
    if (l.includes('secondary')) return 2;
    if (l.includes('vocational')) return 3;
    if (l.includes('college')) return 4;
    if (l.includes('graduate')) return 5;
    return 999;
  };

  const educationData = computed(() => {
    const normalized = normalizeEducationData(props.educ);
    return [...normalized].sort((a, b) => getLevelPriority(a.level) - getLevelPriority(b.level));
  });

  const columns = [
    { name: 'level', label: 'Level', align: 'left', field: (r) => r.level, sortable: true },
    {
      name: 'schoolName',
      label: 'School Name',
      align: 'left',
      field: (r) => r.school_name,
      sortable: true,
    },
    {
      name: 'course',
      label: 'Degree / Course',
      align: 'left',
      field: (r) => r.degree,
      sortable: true,
    },
    {
      name: 'fromYear',
      label: 'From',
      align: 'left',
      field: (r) => r.attendance_from,
      sortable: true,
    },
    { name: 'toYear', label: 'To', align: 'left', field: (r) => r.attendance_to, sortable: true },
    {
      name: 'highestLevel',
      label: 'Highest Units',
      align: 'left',
      field: (r) => r.highest_units,
      sortable: true,
    },
    {
      name: 'yearGraduated',
      label: 'Year Graduated',
      align: 'left',
      field: (r) => r.year_graduated,
      sortable: true,
    },
    {
      name: 'honors',
      label: 'Scholarship / Honors',
      align: 'left',
      field: (r) => r.scholarship,
      sortable: true,
    },
  ];

  function enterEdit() {
    // Pass normalized education data to the store
    const normalizedData = normalizeEducationData(props.educ);
    editStore.startEdit('education', normalizedData, props.personalInfoId);
  }

  function addRow() {
    editStore.addRow('education');
  }

  function markForDelete(id) {
    if (!id) return;
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Remove this education record?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      editStore.markForDelete('education', id);
    });
  }

  function cancel() {
    editStore.cancelEdit('education');
  }

  async function save() {
    const result = await editStore.saveSection('education');
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Education records updated!' });
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
