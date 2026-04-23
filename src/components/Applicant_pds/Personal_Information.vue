<template>
  <div>
    <!-- ── Header row with Edit / Save / Cancel ── -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-x-sm">
        <q-img
          :src="applicantImageUrl || props.personal?.image_url || 'https://placehold.co/100'"
          class="bg-grey-4"
          style="width: 80px; height: 80px; border-radius: 10px"
          alt="Applicant Photo"
        />
        <div>
          <div class="text-h6 text-bold">
            {{ fullName }}
          </div>
          <div class="text-caption text-grey-7">{{ props.personal?.status }}</div>
        </div>
      </div>

      <div class="row q-gutter-x-sm" v-if="!isEditMode">
        <q-btn
          flat
          round
          icon="edit"
          color="primary"
          size="sm"
          @click="enterEdit"
          title="Edit Personal Info"
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
      <!-- Employee Name -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-3">
          <div class="field-label">First Name</div>
          <div class="field-value">{{ props.personal?.firstname || 'None' }}</div>
        </div>
        <div class="col-3">
          <div class="field-label">Last Name</div>
          <div class="field-value">{{ props.personal?.lastname || 'None' }}</div>
        </div>
        <div class="col-3">
          <div class="field-label">Middle Name</div>
          <div class="field-value">{{ personalInfo.middlename || 'None' }}</div>
        </div>
        <div class="col-3">
          <div class="field-label">Name Extension</div>
          <div class="field-value">{{ props.personal?.name_extension || 'None' }}</div>
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-h6 text-bold q-mb-sm">Additional Information</div>
      <div class="row q-col-gutter-md q-px-sm">
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Date of Birth:</div>
              <div class="field-value">{{ formatDate(personalInfo.date_of_birth) || 'None' }}</div>
            </div>
            <div class="col-12 row justify-between q-gutter-x-sm">
              <div class="col-5">
                <div class="field-label">Gender Preference:</div>
                <div class="field-value">{{ personalInfo.gender_preference || 'None' }}</div>
              </div>
              <div class="col-5">
                <div class="field-label">Sex:</div>
                <div class="field-value">{{ personalInfo.sex || 'None' }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="field-label">Blood Type:</div>
              <div class="field-value">{{ personalInfo.blood_type || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Cellphone Number:</div>
              <div class="field-value">{{ personalInfo.cellphone_number || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Email:</div>
              <div class="field-value">{{ personalInfo.email_address || 'None' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Place of Birth:</div>
              <div class="field-value">{{ personalInfo.place_of_birth || 'None' }}</div>
            </div>
            <div class="col-12 row justify-between q-gutter-x-sm">
              <div class="col-5">
                <div class="field-label">Height:</div>
                <div class="field-value">{{ formatHeight(personalInfo.height) }}</div>
              </div>
              <div class="col-5">
                <div class="field-label">Weight:</div>
                <div class="field-value">{{ formatWeight(personalInfo.weight) }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="field-label">Civil Status:</div>
              <div class="field-value">{{ personalInfo.civil_status || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Telephone Number:</div>
              <div class="field-value">{{ personalInfo.telephone_number || 'None' }}</div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-h6 text-bold q-mb-sm">Government IDs</div>
      <div class="row q-col-gutter-md q-px-sm">
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">GSIS ID No.:</div>
              <div class="field-value">{{ personalInfo.gsis_no || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">PHILHEALTH ID No.:</div>
              <div class="field-value">{{ personalInfo.philhealth_no || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">TIN No.:</div>
              <div class="field-value">{{ personalInfo.tin_no || 'None' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">PAGIBIG ID No.:</div>
              <div class="field-value">{{ personalInfo.pagibig_no || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">SSS No.:</div>
              <div class="field-value">{{ personalInfo.sss_no || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Agency Employee No.:</div>
              <div class="field-value">
                {{ personalInfo.agency_employee_no || props.personal?.controlno || 'None' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-h6 text-bold q-mb-sm">Residential Address</div>
      <div class="row q-col-gutter-md q-px-sm">
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Region:</div>
              <div class="field-value">{{ personalInfo.residential_region || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">City/Municipality:</div>
              <div class="field-value">{{ personalInfo.residential_city || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Subdivision/Village:</div>
              <div class="field-value">{{ personalInfo.residential_subdivision || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">House/Block/Lot No.:</div>
              <div class="field-value">{{ personalInfo.residential_house || 'None' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Province:</div>
              <div class="field-value">{{ personalInfo.residential_province || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Barangay:</div>
              <div class="field-value">{{ personalInfo.residential_barangay || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Street/Purok:</div>
              <div class="field-value">{{ personalInfo.residential_street || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Zip Code:</div>
              <div class="field-value">{{ personalInfo.residential_zip || 'None' }}</div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-h6 text-bold q-mb-sm">Permanent Address</div>
      <div class="row q-col-gutter-md q-px-sm">
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Region:</div>
              <div class="field-value">{{ personalInfo.permanent_region || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">City/Municipality:</div>
              <div class="field-value">{{ personalInfo.permanent_city || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Subdivision/Village:</div>
              <div class="field-value">{{ personalInfo.permanent_subdivision || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">House/Block/Lot No.:</div>
              <div class="field-value">{{ personalInfo.permanent_house || 'None' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Province:</div>
              <div class="field-value">{{ personalInfo.permanent_province || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Barangay:</div>
              <div class="field-value">{{ personalInfo.permanent_barangay || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Street/Purok:</div>
              <div class="field-value">{{ personalInfo.permanent_street || 'None' }}</div>
            </div>
            <div class="col-12">
              <div class="field-label">Zip Code:</div>
              <div class="field-value">{{ personalInfo.permanent_zip || 'None' }}</div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-h6 text-bold q-mb-sm">Other Information</div>
      <div class="row q-col-gutter-md q-px-sm">
        <div class="col-6">
          <div class="field-label">Citizenship:</div>
          <div class="field-value">{{ personalInfo.citizenship || 'None' }}</div>
        </div>
        <div class="col-6">
          <div class="field-label">Religious Affiliation:</div>
          <div class="field-value">{{ personalInfo.religion || 'None' }}</div>
        </div>
      </div>
    </template>

    <!-- ════════════════ EDIT MODE ════════════════ -->
    <template v-else>
      <!-- Name -->
      <div class="text-subtitle1 text-bold text-grey-8 q-mb-sm">Employee's Name</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.firstname" label="First Name *" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.lastname" label="Last Name *" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.middlename" label="Middle Name" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="draft.name_extension"
            label="Name Extension (Jr., Sr., etc.)"
            outlined
            dense
          />
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-subtitle1 text-bold text-grey-8 q-mb-sm">Additional Information</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="draft.date_of_birth"
            label="Date of Birth (MM/DD/YYYY)"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.place_of_birth" label="Place of Birth" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select v-model="draft.sex" label="Sex" :options="['Male', 'Female']" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="draft.civil_status"
            label="Civil Status"
            :options="civilStatusOptions"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="draft.blood_type"
            label="Blood Type"
            :options="bloodTypeOptions"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model="draft.height" label="Height (m)" outlined dense type="number" />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model="draft.weight" label="Weight (kg)" outlined dense type="number" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.cellphone_number" label="Cellphone Number" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.telephone_number" label="Telephone Number" outlined dense />
        </div>
        <div class="col-12 col-sm-6">
          <q-input
            v-model="draft.email_address"
            label="Email Address"
            outlined
            dense
            type="email"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.gender_preference" label="Gender Preference" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.citizenship" label="Citizenship" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.religion" label="Religious Affiliation" outlined dense />
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-subtitle1 text-bold text-grey-8 q-mb-sm">Government IDs</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.gsis_no" label="GSIS ID No." outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.pagibig_no" label="PAGIBIG ID No." outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.philhealth_no" label="PHILHEALTH ID No." outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.sss_no" label="SSS No." outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.tin_no" label="TIN No." outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-input v-model="draft.agency_employee_no" label="Agency Employee No." outlined dense />
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-subtitle1 text-bold text-grey-8 q-mb-sm">Residential Address</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.residential_house" label="House/Block/Lot No." outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.residential_street" label="Street/Purok" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="draft.residential_subdivision"
            label="Subdivision/Village"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.residential_barangay" label="Barangay" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.residential_city" label="City/Municipality" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.residential_province" label="Province" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.residential_region" label="Region" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.residential_zip" label="Zip Code" outlined dense />
        </div>
      </div>

      <q-separator class="q-my-md" />
      <div class="text-subtitle1 text-bold text-grey-8 q-mb-sm">Permanent Address</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.permanent_house" label="House/Block/Lot No." outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.permanent_street" label="Street/Purok" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="draft.permanent_subdivision"
            label="Subdivision/Village"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.permanent_barangay" label="Barangay" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.permanent_city" label="City/Municipality" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.permanent_province" label="Province" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.permanent_region" label="Region" outlined dense />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="draft.permanent_zip" label="Zip Code" outlined dense />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, watch, onUnmounted } from 'vue';
  import { useAuthStore } from 'stores/authStore';
  import { useQuasar } from 'quasar';

  const authStore = useAuthStore();
  const $q = useQuasar();

  const API_BASE = 'http://192.168.8.182:9000/api';

  const props = defineProps({
    personal: { type: Object, default: () => ({}) },
  });
  const emit = defineEmits(['saved']);

  // ── Source data ──────────────────────────────────────────────
  const personalInfo = computed(() => {
    if (props.personal?.nPersonalInfo) return props.personal.nPersonalInfo;
    return props.personal || {};
  });

  const fullName = computed(() => {
    const f = props.personal?.firstname || '';
    const m = personalInfo.value?.middlename ? ` ${personalInfo.value.middlename}` : '';
    const l = props.personal?.lastname ? ` ${props.personal.lastname}` : '';
    const e = props.personal?.name_extension ? ` ${props.personal.name_extension}` : '';
    return (f + m + l + e).trim() || 'No Name';
  });

  // ── Edit state ───────────────────────────────────────────────
  const isEditMode = ref(false);
  const isSaving = ref(false);
  const saveError = ref(null);

  const draft = reactive({});

  function enterEdit() {
    const src = personalInfo.value;
    Object.assign(draft, {
      // name fields come from the top-level personal prop
      firstname: props.personal?.firstname || '',
      lastname: props.personal?.lastname || '',
      middlename: src.middlename || '',
      name_extension: props.personal?.name_extension || '',
      // personal info fields
      date_of_birth: src.date_of_birth || '',
      place_of_birth: src.place_of_birth || '',
      sex: src.sex || '',
      civil_status: src.civil_status || '',
      blood_type: src.blood_type || '',
      height: src.height || '',
      weight: src.weight || '',
      cellphone_number: src.cellphone_number || '',
      telephone_number: src.telephone_number || '',
      email_address: src.email_address || '',
      gender_preference: src.gender_preference || '',
      citizenship: src.citizenship || '',
      religion: src.religion || '',
      // gov IDs
      gsis_no: src.gsis_no || '',
      pagibig_no: src.pagibig_no || '',
      philhealth_no: src.philhealth_no || '',
      sss_no: src.sss_no || '',
      tin_no: src.tin_no || '',
      agency_employee_no: src.agency_employee_no || props.personal?.controlno || '',
      // residential
      residential_house: src.residential_house || '',
      residential_street: src.residential_street || '',
      residential_subdivision: src.residential_subdivision || '',
      residential_barangay: src.residential_barangay || '',
      residential_city: src.residential_city || '',
      residential_province: src.residential_province || '',
      residential_region: src.residential_region || '',
      residential_zip: src.residential_zip || '',
      // permanent
      permanent_house: src.permanent_house || '',
      permanent_street: src.permanent_street || '',
      permanent_subdivision: src.permanent_subdivision || '',
      permanent_barangay: src.permanent_barangay || '',
      permanent_city: src.permanent_city || '',
      permanent_province: src.permanent_province || '',
      permanent_region: src.permanent_region || '',
      permanent_zip: src.permanent_zip || '',
    });
    saveError.value = null;
    isEditMode.value = true;
  }

  function cancel() {
    isEditMode.value = false;
    saveError.value = null;
  }

  function getToken() {
    return authStore.token || authStore.user?.token || localStorage.getItem('token');
  }

  async function save() {
    isSaving.value = true;
    saveError.value = null;

    try {
      const payload = {
        personal_info_id: personalInfo.value?.id || props.personal?.nPersonalInfo_id || null,
        ...draft,
      };

      const response = await fetch(`${API_BASE}/applicant/qs/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      isEditMode.value = false;
      $q.notify({ type: 'positive', message: 'Personal information updated!' });
      emit('saved', data);
    } catch (err) {
      saveError.value = err.message;
      $q.notify({ type: 'negative', message: err.message || 'Save failed.' });
    } finally {
      isSaving.value = false;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated', 'Annulled'];
  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };
  const formatHeight = (h) => {
    if (!h) return 'None';
    const n = Number(h);
    return isNaN(n) ? h : `${n} m`;
  };
  const formatWeight = (w) => {
    if (!w) return 'None';
    const n = Number(w);
    return isNaN(n) ? w : `${n} kg`;
  };

  // ── Image loading ─────────────────────────────────────────────
  const applicantImageUrl = ref('');
  const loadApplicantImage = async (imageUrl) => {
    if (!imageUrl) {
      applicantImageUrl.value = '';
      return;
    }
    if (imageUrl.includes('/storage/')) {
      applicantImageUrl.value = imageUrl;
      return;
    }
    try {
      const token = getToken();
      const response = await fetch(imageUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'image/*' },
      });
      if (response.ok) {
        const blob = await response.blob();
        if (applicantImageUrl.value?.startsWith('blob:'))
          URL.revokeObjectURL(applicantImageUrl.value);
        applicantImageUrl.value = URL.createObjectURL(blob);
      } else {
        applicantImageUrl.value = '';
      }
    } catch {
      applicantImageUrl.value = '';
    }
  };

  const imageSource = computed(() => props.personal?.image_url || props.personal?.photo || '');
  watch(imageSource, (url) => loadApplicantImage(url), { immediate: true });
  onUnmounted(() => {
    if (applicantImageUrl.value?.startsWith('blob:')) URL.revokeObjectURL(applicantImageUrl.value);
  });
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
