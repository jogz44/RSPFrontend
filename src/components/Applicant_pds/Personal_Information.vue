<template>
  <div class="row">
    <div class="col-3 flex justify-center items-center">
      <!-- <img
        :src="props.personal.image_url || 'https://placehold.co/140'"
        class="bg-grey-4"
        style="width: 140px; height: 140px; border-radius: 10px; object-fit: cover"
        alt="Applicant Photo"
      /> -->

      <q-img
        :src="applicantImageUrl || props.personal?.image_url || 'https://placehold.co/100'"
        class="bg-grey-4 q-mb-md"
        style="width: 100px; height: 100px; border-radius: 10px"
        alt="Applicant Photo"
      />
    </div>
    <div class="col">
      <div class="form-title-container">
        <div class="text-h6 text-bold q-px-sm flex items-center q-gutter-x-sm">Employee's Name</div>
      </div>

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
    </div>
  </div>

  <q-separator class="q-my-md" />
  <div class="q-mb-sm">
    <div class="text-h6 text-bold">Additional Information</div>
  </div>
  <!-- 1 -->
  <div class="row q-col-gutter-md q-px-sm">
    <div class="col-6">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="field-label">Date of Birth:</div>
          <div class="field-value">
            {{ formatDate(personalInfo.date_of_birth) || 'None' }}
          </div>
        </div>
        <div class="col-12 row justify-between q-gutter-x-sm">
          <div class="col-5">
            <div class="field-label">Gender Preference:</div>
            <div class="field-value">
              {{ personalInfo.gender_preference || personalInfo.gender_preference || 'None' }}
            </div>
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
            <div class="field-value">
              {{ formatHeight(personalInfo.height) || 'None' }}
            </div>
          </div>
          <div class="col-5">
            <div class="field-label">Weight:</div>
            <div class="field-value">
              {{ formatWeight(personalInfo.weight) || 'None' }}
            </div>
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
  <div class="q-mb-sm">
    <div class="text-h6 text-bold">Government IDs</div>
  </div>

  <!-- 2 -->
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
  <div class="q-mb-sm">
    <div class="text-h6 text-bold">Residential Address</div>
  </div>

  <!-- 3 -->
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
  <div class="q-mb-sm">
    <div class="text-h6 text-bold q-px-sm flex items-center q-gutter-x-sm">Permanent Address</div>
  </div>

  <!-- 4 -->
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
  <div class="q-mb-sm">
    <div class="text-h6 text-bold">Other Information</div>
  </div>

  <!-- 5 -->
  <div class="row q-col-gutter-md q-px-sm">
    <div class="col-6">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="field-label">Citizenship:</div>
          <div class="field-value">{{ personalInfo.citizenship }}</div>
        </div>
      </div>
    </div>

    <div class="col-6">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="field-label">Religious Affiliation:</div>
          <div class="field-value">{{ personalInfo.religion }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="row q-col-gutter-md q-px-sm q-mt-md">
    <div class="col-6">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="field-label">Application Date:</div>
          <div class="field-value">
            {{ formatDate(props.personal?.application_date) }}
          </div>
        </div>
      </div>
    </div>

    <div class="col-6">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="field-label">Status:</div>
          <div class="field-value">{{ props.personal?.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, watch, onUnmounted } from 'vue';
  import { useAuthStore } from 'stores/authStore';

  const authStore = useAuthStore();

  const props = defineProps({
    personal: {
      type: Object,
      default: () => ({}),
    },
  });

  // Extract personal information from the nested nPersonalInfo object if available
  const personalInfo = computed(() => {
    // Check if nPersonalInfo is available
    if (props.personal?.nPersonalInfo) {
      return props.personal.nPersonalInfo;
    }
    // Otherwise return the personal object itself (fallback)
    return props.personal || {};
  });

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatHeight = (height) => {
    if (!height) return 'None';
    const numHeight = Number(height);
    return isNaN(numHeight) ? height : `${numHeight} m`;
  };

  const formatWeight = (weight) => {
    if (!weight) return 'None';
    const numWeight = Number(weight);
    return isNaN(numWeight) ? weight : `${numWeight} kg`;
  };

  //image
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
        const token =
      authStore.token ||
      authStore.user?.token ||
      localStorage.getItem('token');

    const response = await fetch(imageUrl, {
         headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'image/*',
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      // Revoke previous blob URL to avoid memory leaks
      if (applicantImageUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(applicantImageUrl.value);
      }
      applicantImageUrl.value = URL.createObjectURL(blob);
    } else {
      applicantImageUrl.value = '';
    }
  } catch (err) {
    console.error('Error loading proxy image:', err);
    applicantImageUrl.value = '';
  }
};

// ✅ Watch for the image URL and call the loader
const imageSource = computed(() => props.personal?.image_url || props.personal?.photo || '');

watch(imageSource, (newUrl) => {
  loadApplicantImage(newUrl);
}, { immediate: true }); // immediate: true handles the initial load too

// ✅ Cleanup blob URL on unmount
onUnmounted(() => {
  if (applicantImageUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(applicantImageUrl.value);
  }
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

  .form-title-container {
    padding: 8px 0;
    margin-bottom: 10px;
  }
</style>
