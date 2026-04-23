<template>
  <div>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">Family Background</div>
      <div class="row q-gutter-x-sm" v-if="!isEditMode">
        <q-btn
          flat
          round
          icon="edit"
          color="primary"
          size="sm"
          @click="enterEdit"
          title="Edit Family Background"
        />
      </div>
      <div class="row q-gutter-x-sm" v-else>
        <q-btn
          unelevated
          rounded
          label="Save"
          icon="save"
          color="positive"
          size="sm"
          :loading="isSaving"
          @click="save"
        />
        <q-btn flat rounded label="Cancel" icon="close" color="grey-7" size="sm" @click="cancel" />
      </div>
    </div>

    <q-banner v-if="saveError && isEditMode" class="bg-negative text-white q-mb-md" rounded>
      {{ saveError }}
      <template v-slot:action><q-btn flat label="Dismiss" @click="saveError = null" /></template>
    </q-banner>

    <!-- ════════════════ VIEW MODE ════════════════ -->
    <template v-if="!isEditMode">
      <div class="text-h6 text-bold q-mb-sm">Spouse's Information</div>
      <div class="row q-col-gutter-md q-px-sm">
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12 row justify-between q-gutter-x-sm">
              <div class="col-5">
                <div class="field-label">Spouse's Firstname:</div>
                <div class="field-value">{{ familyRow.spouse_firstname || 'None' }}</div>
              </div>
              <div class="col-5">
                <div class="field-label">Spouse's Surname:</div>
                <div class="field-value">{{ familyRow.spouse_name || 'None' }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="field-label">Occupation:</div>
              <div class="field-value">{{ familyRow.spouse_occupation || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Employers/Business Name:</div>
              <div class="field-value">{{ familyRow.spouse_employer || 'None' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Spouse's Middlename:</div>
              <div class="field-value">{{ familyRow.spouse_middlename || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Business Address:</div>
              <div class="field-value">{{ familyRow.spouse_employer_address || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Business Telephone:</div>
              <div class="field-value">{{ familyRow.spouse_employer_telephone || 'None' }}</div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-h6 text-bold q-mb-sm">Parent's Information</div>
      <div class="row q-col-gutter-md q-px-sm">
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12 row justify-between q-gutter-x-sm">
              <div class="col-5">
                <div class="field-label">Father's Firstname:</div>
                <div class="field-value">{{ familyRow.father_firstname || 'None' }}</div>
              </div>
              <div class="col-5">
                <div class="field-label">Father's Surname:</div>
                <div class="field-value">{{ familyRow.father_lastname || 'None' }}</div>
              </div>
            </div>
            <div class="col-12 row justify-between q-gutter-x-sm">
              <div class="col-5">
                <div class="field-label">Mother's Firstname:</div>
                <div class="field-value">{{ familyRow.mother_firstname || 'None' }}</div>
              </div>
              <div class="col-5">
                <div class="field-label">Mother's Surname:</div>
                <div class="field-value">{{ familyRow.mother_lastname || 'None' }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Father's Middlename:</div>
              <div class="field-value">{{ familyRow.father_middlename || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Mother's Middlename:</div>
              <div class="field-value">{{ familyRow.mother_middlename || 'None' }}</div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-h6 text-bold q-mb-sm">Children's Information</div>
      <div class="q-pa-md">
        <q-table
          :rows="childrenData"
          :columns="childrenColumns"
          row-key="id"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-birth_date="slotProps">
            <q-td :props="slotProps">{{ formatDate(slotProps.row.birth_date) }}</q-td>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey">No Children Available</div>
          </template>
        </q-table>
      </div>
    </template>

    <!-- ════════════════ EDIT MODE ════════════════ -->
    <template v-else>
      <!-- Spouse -->
      <div class="text-subtitle1 text-bold text-grey-8 q-mb-sm">Spouse's Information</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.spouse_firstname" label="Spouse's Firstname" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.spouse_name" label="Spouse's Surname" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.spouse_middlename" label="Spouse's Middlename" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.spouse_occupation" label="Occupation" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.spouse_employer" label="Employer/Business Name" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="draft.spouse_employer_address"
            label="Business Address"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="draft.spouse_employer_telephone"
            label="Business Telephone"
            outlined
            dense
          />
        </div>
      </div>

      <q-separator class="q-my-md" />
      <!-- Parents -->
      <div class="text-subtitle1 text-bold text-grey-8 q-mb-sm">Parent's Information</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.father_firstname" label="Father's Firstname" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.father_lastname" label="Father's Surname" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.father_middlename" label="Father's Middlename" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.mother_firstname" label="Mother's Firstname" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.mother_lastname" label="Mother's Surname" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.mother_middlename" label="Mother's Middlename" outlined dense />
        </div>
      </div>

      <q-separator class="q-my-md" />
      <!-- Children -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle1 text-bold text-grey-8">Children's Information</div>
        <q-btn
          unelevated
          rounded
          label="Add Child"
          icon="add"
          color="primary"
          size="sm"
          @click="addChild"
        />
      </div>

      <q-card
        v-for="(child, idx) in draftChildren"
        :key="child.id ?? `c-${idx}`"
        flat
        bordered
        class="q-mb-sm"
      >
        <q-card-section class="row items-center q-gutter-x-md q-py-sm">
          <div class="text-grey-7 text-caption col-auto">#{{ idx + 1 }}</div>
          <div class="col">
            <q-input v-model="child.child_name" label="Full Name" outlined dense />
          </div>
          <div class="col-4">
            <q-input v-model="child.birth_date" label="Birth Date (MM/DD/YYYY)" outlined dense />
          </div>
          <q-btn flat round icon="delete" color="negative" size="sm" @click="removeChild(idx)" />
        </q-card-section>
      </q-card>

      <q-banner v-if="!draftChildren.length" class="text-grey-7">
        No children. Click "Add Child" to add one.
      </q-banner>
    </template>
  </div>
</template>

<script setup>
  import { computed, ref, reactive } from 'vue';
  import { useAuthStore } from 'stores/authStore';
  import { useQuasar } from 'quasar';

  const authStore = useAuthStore();
  const $q = useQuasar();
  const API_BASE = 'http://192.168.8.182:9000/api';

  const props = defineProps({
    family: { type: [Object, Array], required: false, default: () => ({}) },
    children: { type: [Object, Array], required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
  });
  const emit = defineEmits(['saved']);

  // ── Source helpers ───────────────────────────────────────────
  const familyRow = computed(() => {
    if (Array.isArray(props.family) && props.family.length > 0) return props.family[0];
    if (props.family?.family && props.family.family.length > 0) return props.family.family[0];
    if (props.family && !Array.isArray(props.family)) return props.family;
    return {};
  });

  const familyId = computed(() => familyRow.value?.id || familyRow.value?.family_id || null);

  const childrenData = computed(() => {
    if (Array.isArray(props.children)) return props.children;
    if (Array.isArray(props.family?.children)) return props.family.children;
    return [];
  });

  const childrenColumns = [
    { name: 'name', label: 'Full Name', field: 'child_name', align: 'left', sortable: true },
    {
      name: 'birth_date',
      label: 'Date of Birth',
      field: 'birth_date',
      align: 'left',
      sortable: true,
    },
  ];

  // ── Edit state ───────────────────────────────────────────────
  const isEditMode = ref(false);
  const isSaving = ref(false);
  const saveError = ref(null);

  const draft = reactive({});
  const draftChildren = ref([]);

  function enterEdit() {
    const src = familyRow.value;
    Object.assign(draft, {
      spouse_firstname: src.spouse_firstname || '',
      spouse_name: src.spouse_name || '',
      spouse_middlename: src.spouse_middlename || '',
      spouse_occupation: src.spouse_occupation || '',
      spouse_employer: src.spouse_employer || '',
      spouse_employer_address: src.spouse_employer_address || '',
      spouse_employer_telephone: src.spouse_employer_telephone || '',
      father_firstname: src.father_firstname || '',
      father_lastname: src.father_lastname || '',
      father_middlename: src.father_middlename || '',
      mother_firstname: src.mother_firstname || '',
      mother_lastname: src.mother_lastname || '',
      mother_middlename: src.mother_middlename || '',
    });
    draftChildren.value = JSON.parse(JSON.stringify(childrenData.value));
    saveError.value = null;
    isEditMode.value = true;
  }

  function cancel() {
    isEditMode.value = false;
    saveError.value = null;
  }

  function addChild() {
    draftChildren.value.push({ child_name: '', birth_date: '' });
  }
  function removeChild(idx) {
    draftChildren.value.splice(idx, 1);
  }

  function getToken() {
    return authStore.token || authStore.user?.token || localStorage.getItem('token');
  }

  async function save() {
    isSaving.value = true;
    saveError.value = null;
    try {
      const payload = {
        personal_info_id: props.personalInfoId,
        family_id: familyId.value,
        ...draft,
        children: draftChildren.value,
      };

      const response = await fetch(`${API_BASE}/applicant/qs/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      isEditMode.value = false;
      $q.notify({ type: 'positive', message: 'Family background updated!' });
      emit('saved', data);
    } catch (err) {
      saveError.value = err.message;
      $q.notify({ type: 'negative', message: err.message || 'Save failed.' });
    } finally {
      isSaving.value = false;
    }
  }

  // ── Date formatter ───────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return 'None';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };
</script>

<style scoped>
  .field-label {
    color: #666;
    font-size: 12px;
    margin-bottom: 4px;
  }
  .field-value {
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
</style>
