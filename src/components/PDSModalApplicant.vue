<template>
  <q-dialog v-model="localShowModal" persistent class="pds-dialog">
    <q-card class="pds-container">
      <q-card-section class="row justify-between text-black q-mb-sm">
        <div class="text-h5 text-bold items-center flex">Personal Data Sheet (PDS)</div>
        <q-btn icon="close" flat round dense class="close-btn" @click="closeModal" />
      </q-card-section>

      <q-card-section class="q-pa-none flex column" style="flex: 1; overflow: hidden">
        <div class="row q-pa-sm q-gutter-x-sm" style="flex: 1; overflow: hidden">
          <!-- Left – tabs -->
          <q-card class="col-3 bg-white q-pa-sm" style="overflow: hidden">
            <q-scroll-area style="height: 100%" class="q-pr-md">
              <q-list>
                <q-item
                  v-for="tab in tabs"
                  :key="tab.name"
                  :clickable="!isLoadingPDS"
                  :active="currentTab === tab.name"
                  @click="!isLoadingPDS && switchTab(tab.name)"
                  active-class="active-tab"
                  class="tab-item q-py-sm"
                  style="border-radius: 5px"
                >
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" v-if="isTabCompleted(tab.name)" />
                    <q-icon name="circle" color="grey" v-else />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ tab.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card>

          <!-- Right – content -->
          <q-card class="col" style="overflow: hidden">
            <q-scroll-area style="height: 100%">
              <div
                v-if="isLoadingPDS"
                style="height: 70vh"
                class="column items-center justify-center"
              >
                <q-spinner-dots size="40px" color="primary" />
                <div class="q-mt-sm text-grey">Loading PDS...</div>
              </div>

              <div
                v-else-if="loadError"
                style="height: 70vh"
                class="column items-center justify-center"
              >
                <q-icon name="error" color="negative" size="40px" />
                <div class="q-mt-sm text-negative">Failed to load PDS data.</div>
                <q-btn color="primary" class="q-mt-md" label="Retry" @click="fetchPDSData" />
              </div>

              <div v-else>
                <div v-if="currentTab === 'personal'" class="q-pa-md">
                  <Personal_Information
                    :personal="applicantData"
                    @saved="onSectionSaved('personal', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'family'" class="q-pa-md">
                  <Family_Background
                    :family="applicantData?.family"
                    :children="applicantData?.children"
                  />
                </div>
                <div v-else-if="currentTab === 'education'" class="q-pa-md">
                  <Educational_Background
                    :educ="applicantData?.education || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('education', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'civilService'" class="q-pa-md">
                  <Civil_Service_Eligibility
                    :eligibility="applicantData?.eligibity || applicantData?.eligibility || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('civilService', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'work'" class="q-pa-md">
                  <Work_Experience
                    :experience="applicantData?.work_experience || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('work', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'voluntary'" class="q-pa-md">
                  <Voluntary_Work
                    :voluntary="applicantData?.voluntary_work || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('voluntary', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'training'" class="q-pa-md">
                  <Training_Interventions
                    :ld-data="applicantData?.training || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('training', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'skills'" class="q-pa-md">
                  <Special_Skills_Hobbies
                    :skills="applicantData?.skills || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('skills', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'nonAcademic'" class="q-pa-md">
                  <Non_Academic
                    :distinctions="applicantData?.skills || []"
                    :academic="applicantData?.Academic || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('nonAcademic', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'membership'" class="q-pa-md">
                  <Membership_Association
                    :memberships="applicantData?.Organization || applicantData?.skills || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('membership', $event)"
                  />
                </div>
                <div v-else-if="currentTab === 'other'" class="q-pa-md">
                  <Other_Information
                    :personal-declarations="applicantData?.personal_declarations || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                  />
                </div>
                <div v-else-if="currentTab === 'references'" class="q-pa-md">
                  <References
                    :references="applicantData?.reference || applicantData?.references || []"
                    :personal-info-id="personalInfoId"
                    :control-no="applicantData?.ControlNo || applicantData?.controlno"
                    :has-control-no="!!(applicantData?.ControlNo || applicantData?.controlno)"
                    @saved="onSectionSaved('references', $event)"
                  />
                </div>
                <div v-else class="q-pa-md">
                  <div class="text-h6 q-mb-md">
                    {{ tabs.find((t) => t.name === currentTab)?.label }}
                  </div>
                  <p>Content for {{ currentTab }} will be displayed here</p>
                </div>
              </div>
            </q-scroll-area>
          </q-card>
        </div>

        <q-card-actions class="justify-end q-pa-md">
          <q-btn rounded label="Close" color="grey-7" @click="closeModal" class="q-mx-sm" />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, watch, computed, onMounted } from 'vue';
  import { useJobPostStore } from 'stores/jobPostStore.js';
  import { usePdsEditStore } from 'stores/pdsEditStore.js';

  import Personal_Information from './Applicant_pds/Personal_Information.vue';
  import Family_Background from './Applicant_pds/Family_Background.vue';
  import Educational_Background from './Applicant_pds/Educational_Background.vue';
  import Civil_Service_Eligibility from './Applicant_pds/Civil_Service_Eligibility.vue';
  import Work_Experience from './Applicant_pds/Work_Experience.vue';
  import Voluntary_Work from './Applicant_pds/Voluntary_Work.vue';
  import Training_Interventions from './Applicant_pds/L_D_Interventions.vue';
  import Special_Skills_Hobbies from './Applicant_pds/Special_Skills_Hobbies.vue';
  import Non_Academic from './Applicant_pds/Non_Academic.vue';
  import Membership_Association from './Applicant_pds/Membership_Association.vue';
  import Other_Information from './Applicant_pds/Other_Information.vue';
  import References from './Applicant_pds/References_User.vue';

  const jobStore = useJobPostStore();
  const editStore = usePdsEditStore();

  const props = defineProps({
    modelValue: Boolean,
    applicant: {
      type: Object,
      default: () => ({
        nPersonalInfo_id: '',
        submission_id: null,
        ControlNo: null,
        controlno: null,
        id: null,
        name: '',
        photo: '',
        position: '',
        status: 'Pending',
      }),
    },
  });

  const emit = defineEmits(['update:modelValue', 'close', 'pds-updated']);

  const localShowModal = ref(props.modelValue);
  const currentTab = ref('personal');
  const isLoadingPDS = ref(false);
  const loadError = ref(false);

  const applicantData = computed(() => {
    if (jobStore.applicantPDS && Object.keys(jobStore.applicantPDS).length > 0) {
      return jobStore.applicantPDS;
    }
    let arr = jobStore.applicants || jobStore.applicant || [];
    if (arr.length && props.applicant?.id) {
      const found = arr.find((a) => a.id === props.applicant.id);
      if (found) return found;
    }
    return props.applicant || {};
  });

  /** Derive the personal_info_id from the loaded PDS or the prop */
  const personalInfoId = computed(
    () =>
      applicantData.value?.nPersonalInfo_id ||
      applicantData.value?.nPersonalInfo?.id ||
      props.applicant?.nPersonalInfo_id ||
      null,
  );

  const tabs = ref([
    { name: 'personal', label: 'Personal Information' },
    { name: 'family', label: 'Family Background' },
    { name: 'education', label: 'Educational Background' },
    { name: 'civilService', label: 'Civil Service Eligibility' },
    { name: 'work', label: 'Work Experience' },
    { name: 'voluntary', label: 'Voluntary Work' },
    { name: 'training', label: 'L&D Interventions' },
    { name: 'skills', label: 'Special Skills & Hobbies' },
    { name: 'nonAcademic', label: 'Non-Academic' },
    { name: 'membership', label: 'Membership Association' },
    { name: 'other', label: 'Other Information' },
    { name: 'references', label: 'References' },
  ]);

  /**
   * Guard tab switching: if a section is in edit mode, ask user to confirm.
   */
  function switchTab(tabName) {
    if (editStore.activeEditSection) {
      // There's an active edit — just switch; the store still holds the draft.
      // Optionally add a confirmation dialog here if you want stricter UX.
      editStore.cancelEdit(editStore.activeEditSection);
    }
    currentTab.value = tabName;
  }

  const fetchPDSData = async () => {
    const submissionId =
      applicantData.value?.submission_id ||
      applicantData.value?.id ||
      props.applicant?.submission_id ||
      props.applicant?.id;

    if (!submissionId) {
      loadError.value = false;
      return;
    }

    isLoadingPDS.value = true;
    loadError.value = false;

    try {
      await jobStore.fetchApplicantPDS(submissionId);
    } catch (error) {
      console.error('Error fetching PDS data:', error);
      loadError.value = true;
    } finally {
      isLoadingPDS.value = false;
    }
  };

  /**
   * Called by child components after a successful save.
   * Re-fetches PDS so the view reflects the saved data.
   */
  async function onSectionSaved(section, responseData) {
    console.log(`Section "${section}" saved`, responseData);
    emit('pds-updated', { section, data: responseData });
    // Refresh PDS data from server
    await fetchPDSData();
  }

  watch(
    () => localShowModal.value,
    (val) => {
      emit('update:modelValue', val);
      if (val) {
        currentTab.value = 'personal';
        fetchPDSData();
      }
    },
  );

  watch(
    () => props.modelValue,
    (val) => {
      localShowModal.value = val;
    },
  );

  const closeModal = () => {
    // Cancel any active edit before closing
    if (editStore.activeEditSection) {
      editStore.cancelEdit(editStore.activeEditSection);
    }
    emit('update:modelValue', false);
    emit('close');
    setTimeout(() => {
      jobStore.applicantPDS = null;
      loadError.value = false;
    }, 300);
  };

  const isTabCompleted = (tabName) => {
    if (!applicantData.value) return false;
    switch (tabName) {
      case 'personal':
        return !!applicantData.value.firstname;
      case 'family':
        return applicantData.value.family || applicantData.value.family?.length > 0;
      case 'education':
        return applicantData.value.education?.length > 0;
      case 'civilService':
        return applicantData.value.eligibity?.length > 0;
      case 'work':
        return applicantData.value.work_experience?.length > 0;
      case 'voluntary':
        return applicantData.value.voluntary_work?.length > 0;
      case 'training':
        return applicantData.value.training?.length > 0;
      case 'skills':
        return applicantData.value.skills?.length > 0;
      case 'nonAcademic':
        return true;
      case 'membership':
        return true;
      case 'other':
        return true;
      case 'references':
        return applicantData.value.reference?.length > 0;
      default:
        return false;
    }
  };

  onMounted(() => {
    if (props.modelValue) fetchPDSData();
  });
</script>

<style lang="scss" scoped>
  .pds-dialog {
    height: 100%;
    width: 100%;
  }
  .pds-container {
    width: 1500px;
    max-width: 95vw;
    height: 90vh;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    display: flex;
    flex-direction: column;
  }
  .tab-item {
    border-left: 3px solid transparent;
    border-radius: 0;
    margin-bottom: 4px;
  }
  .active-tab {
    background-color: #f0f8ff;
    border-left: 7px solid #21ba45;
    font-weight: bolder;
  }
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
  .q-scroll-area {
    background-color: white;
  }

  @media (max-height: 800px) {
    .pds-container {
      height: 95vh;
      max-height: 95vh;
    }
  }
  @media (max-height: 600px) {
    .pds-container {
      height: 98vh;
      max-height: 98vh;
    }
  }
</style>
