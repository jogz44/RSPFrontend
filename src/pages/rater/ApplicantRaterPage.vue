<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="column items-start justify-center q-mb-md">
      <h5 class="text-h5 q-ma-none"><b>Applicants</b></h5>
      <div class="q-pa-md q-gutter-sm">
        <q-breadcrumbs class="q-ma-none">
          <template #separator>
            <q-icon size="1.2em" name="arrow_forward" />
          </template>
          <q-breadcrumbs-el icon="group" label="Applicants" />
        </q-breadcrumbs>
      </div>
    </div>

    <!-- Table Toolbar -->
    <div class="row justify-between items-center q-mb-md">
      <q-input
        v-model="globalSearch"
        outlined
        dense
        placeholder="Search applicants..."
        style="max-width: 300px"
        clearable
      >
        <template #prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </div>

    <!-- Main Table -->
    <q-table
      :rows="store.rows"
      :columns="columns"
      row-key="nPersonal_id"
      v-model:pagination="pagination"
      :rows-number="store.total"
      :loading="loading"
      @request="onRequest"
      :rows-per-page-options="[10, 20, 50, 100, 200]"
      flat
    >
      <template #body-cell-applicant_type="p">
        <q-td :props="p">
          <q-badge
            :color="p.row.applicant_type === 'internal' ? 'blue-7' : 'green-7'"
            :label="p.row.applicant_type === 'internal' ? 'Internal' : 'External'"
          />
        </q-td>
      </template>

      <template #body-cell-action="p">
        <q-td :props="p">
          <q-btn
            round
            flat
            color="blue"
            icon="visibility"
            class="bg-blue-1"
            @click="openView(p.row)"
          >
            <q-tooltip>View Applicant</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center q-pa-md text-grey">No Applicants Found</div>
      </template>
    </q-table>

    <!-- ================================================================ -->
    <!-- Applicant Details Dialog                                         -->
    <!-- ================================================================ -->
    <q-dialog v-model="showDetailDialog" persistent maximized-mobile>
      <q-card class="detail-dialog-card">
        <q-card-section class="dialog-header header-view">
          <div class="row items-center no-wrap">
            <q-icon name="assignment_ind" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-h6 text-bold">Applicant Applied Position</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" class="close-btn" v-close-popup color="white" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="detailsLoading" class="text-center q-pa-xl">
          <q-spinner color="primary" size="48px" />
          <div class="q-mt-sm text-body2 text-grey-6">Loading applicant details...</div>
        </q-card-section>

        <template v-else>
          <q-card-section class="dialog-body q-pa-lg" style="overflow-y: auto; max-height: 65vh">
            <!-- Applied Positions -->
            <div class="section-label q-mb-md">
              <q-icon name="work" size="16px" class="q-mr-xs" />
              Job Applications
              <q-badge
                color="orange"
                :label="`${store.details.length} Position(s)`"
                class="q-ml-sm"
              />
            </div>

            <q-table
              :rows="store.details"
              :columns="detailColumns"
              row-key="submission_id"
              flat
              bordered
              wrap-cells
              hide-bottom
              no-data-label="No job applications found"
            >
              <template #body-cell-action="p">
                <q-td :props="p">
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    class="bg-blue-1"
                    icon="rate_review"
                    @click="openRatingForm(p.row)"
                  >
                    <q-tooltip>Rate Applicant</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>

          <q-separator />
          <div class="dialog-footer row justify-end items-center q-pa-md">
            <q-btn rounded flat label="Close" color="grey-7" v-close-popup />
          </div>
        </template>
      </q-card>
    </q-dialog>

    <!-- Rating Form -->
    <RatingFormApplicant
      v-model="ratingOpen"
      :position="ratingPosition"
      :criteria="ratingCriteria"
      :raw-criteria="ratingRawCriteria"
      :applicants="ratingApplicants"
      :loading="ratingLoading"
      :filter-submission-id="selectedSubmissionId"
      @save-draft="onSaveDraft"
      @close="ratingOpen = false"
    />
  </q-page>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useApplicantsStore } from 'src/stores/applicantRater';
  import { use_rater_store } from 'stores/rater_store';
  import RatingFormApplicant from 'src/components/RatingFormApplicant.vue';

  let searchTimeout = null;

  const store = useApplicantsStore();
  const raterStore = use_rater_store();

  // ============================================================================
  // STATE
  // ============================================================================

  const globalSearch = ref('');
  const loading = ref(false);
  const showDetailDialog = ref(false);
  const detailsLoading = ref(false);
  const selected = ref({});

  const pagination = ref({
    sortBy: 'lastname',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  // ============================================================================
  // RATING FORM STATE
  // ============================================================================

  const ratingOpen = ref(false);
  const ratingLoading = ref(false);
  const ratingPosition = ref({});
  const ratingCriteria = ref({});
  const ratingRawCriteria = ref(null);
  const ratingApplicants = ref([]);
  const selectedSubmissionId = ref(null);

  // ============================================================================
  // COLUMNS
  // ============================================================================

  const columns = [
    { name: 'lastname', label: 'Last Name', field: 'lastname', align: 'left', sortable: true },
    { name: 'firstname', label: 'First Name', field: 'firstname', align: 'left', sortable: true },
    {
      name: 'applicant_type',
      label: 'Type',
      align: 'center',
      field: 'applicant_type',
      sortable: true,
    },
    { name: 'action', label: 'Action', align: 'center', field: 'action', sortable: false },
  ];

  const detailColumns = [
    { name: 'position', label: 'Position', field: 'position', align: 'left', sortable: true },
    { name: 'office', label: 'Office', field: 'office', align: 'left', sortable: true },
    {
      name: 'salary_grade',
      label: 'Salary Grade',
      field: 'salary_grade',
      align: 'center',
      sortable: true,
    },
    { name: 'action', label: 'Action', field: 'action', align: 'center', sortable: false },
  ];

  // ============================================================================
  // TABLE REQUEST
  // ============================================================================

  const onRequest = async (props) => {
    const { page, rowsPerPage } = props.pagination;
    loading.value = true;
    await store.fetchApplicants({
      page,
      per_page: rowsPerPage,
      search: globalSearch.value,
    });
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.rowsNumber = store.total;
    loading.value = false;
  };

  // ============================================================================
  // SEARCH WATCHER
  // ============================================================================

  watch(globalSearch, (val) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      pagination.value.page = 1;
      loading.value = true;
      await store.fetchApplicants({
        page: 1,
        per_page: pagination.value.rowsPerPage,
        search: val,
      });
      pagination.value.rowsNumber = store.total;
      loading.value = false;
    }, 500);
  });

  // ============================================================================
  // VIEW APPLICANT
  // ============================================================================

  const openView = async (row) => {
    selected.value = row;
    showDetailDialog.value = true;
    detailsLoading.value = true;
    await store.fetchApplicantDetails({
      firstname: row.firstname,
      lastname: row.lastname,
      date_of_birth: row.date_of_birth,
    });
    detailsLoading.value = false;
  };

  // ============================================================================
  // RATING FORM
  // ============================================================================

  const openRatingForm = async (row) => {
    selectedSubmissionId.value = row.submission_id || null;
    ratingLoading.value = true;
    ratingOpen.value = true;

    const result = await raterStore.fetch_criteria_applicant(row.job_post_id);

    if (result?.criteria?.length > 0) {
      const criteriaData = result.criteria[0];
      ratingRawCriteria.value = criteriaData;
      ratingCriteria.value = transformCriteriaData(criteriaData);
    } else {
      ratingRawCriteria.value = null;
      ratingCriteria.value = {};
    }

    ratingApplicants.value = result?.applicants || [];
    ratingPosition.value = {
      id: row.job_post_id,
      position: row.position,
      office: row.office,
    };
    ratingLoading.value = false;
  };

  const transformCriteriaData = (criteriaData) => {
    if (!criteriaData) return {};
    return {
      education: {
        Rate: criteriaData.educations?.[0]?.weight || '20',
        items: (criteriaData.educations || []).map((i) => ({
          percentage: i.percentage,
          description: i.description,
        })),
      },
      experience: {
        Rate: criteriaData.experiences?.[0]?.weight || '20',
        items: (criteriaData.experiences || []).map((i) => ({
          percentage: i.percentage,
          description: i.description,
        })),
      },
      training: {
        Rate: criteriaData.trainings?.[0]?.weight || '15',
        items: (criteriaData.trainings || []).map((i) => ({
          percentage: i.percentage,
          description: i.description,
        })),
      },
      performance: {
        Rate: criteriaData.performances?.[0]?.weight || '15',
        items: (criteriaData.performances || []).map((i) => ({
          percentage: i.percentage,
          description: i.description,
        })),
      },
      behavioral: {
        Rate: criteriaData.behaviorals?.[0]?.weight || '30',
        items: (criteriaData.behaviorals || []).map((i) => ({
          percentage: i.percentage,
          description: i.description,
        })),
      },
    };
  };

  const onSaveDraft = async (payload) => {
    await raterStore.saveDraft(payload.applicants, payload.positionId);
    ratingOpen.value = false;
  };

  // ============================================================================
  // MOUNT
  // ============================================================================

  onMounted(async () => {
    await store.fetchApplicants({
      page: 1,
      per_page: pagination.value.rowsPerPage,
      search: '',
    });
    pagination.value.rowsNumber = store.total;
  });
</script>

<style scoped>
  .detail-dialog-card {
    width: 90vw;
    max-width: 960px;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    color: white;
    flex-shrink: 0;
  }

  .header-view {
    background: #00631d;
  }

  .close-btn {
    color: rgba(255, 255, 255, 0.8);
  }
  .close-btn:hover {
    color: white;
  }

  .dialog-body {
    flex: 1;
    overflow-y: auto;
  }

  .dialog-footer {
    flex-shrink: 0;
    background: #fafafa;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9e9e9e;
    display: flex;
    align-items: center;
  }

  .info-group {
    border: 1px solid #eeeeee;
    border-radius: 8px;
    padding: 16px;
    background: #fafafa;
  }

  .info-field {
    padding: 4px 0;
  }

  .info-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #9e9e9e;
    margin-bottom: 2px;
  }

  .info-value {
    font-size: 14px;
    font-weight: 500;
    color: #212121;
  }

  @media (max-width: 600px) {
    :deep(.q-table th),
    :deep(.q-table td) {
      padding: 6px 8px;
      font-size: 11px;
    }
  }
</style>
