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

      <!-- Report Buttons -->
      <div class="row q-gutter-sm">
        <q-btn
          v-if="canReportApplicant"
          rounded
          unelevated
          color="orange"
          icon="article"
          label="Qualified Report"
          @click="openQualifiedReportDialog"
        >
          <q-tooltip>List of Qualified Applicants</q-tooltip>
        </q-btn>
        <q-btn
          v-if="canReportApplicant"
          rounded
          unelevated
          color="orange"
          icon="article"
          label="Unqualified Report"
          @click="openUnqualifiedReportDialog"
        >
          <q-tooltip>List of Unqualified Applicants</q-tooltip>
        </q-btn>
        <q-btn
          v-if="canReportApplicant"
          rounded
          unelevated
          color="orange"
          icon="article"
          label="All Applicants Report"
          @click="openAllApplicantsReportDialog"
        >
          <q-tooltip>List of All Applicants</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Main Table -->
    <q-table
      :rows="applicantStore.applicants"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :rows-number="applicantStore.total"
      :loading="applicantStore.loading"
      @request="onRequest"
      :rows-per-page-options="[10, 20, 50, 100, 200]"
      flat
    >
      <template #body-cell-name="p">
        <q-td :props="p">
          {{
            p.row.n_personal_info?.firstname ||
            p.row.personal_info?.firstname ||
            p.row.firstname ||
            ''
          }}
          {{
            p.row.n_personal_info?.lastname || p.row.personal_info?.lastname || p.row.lastname || ''
          }}
        </q-td>
      </template>

      <template #body-cell-jobpost="p">
        <q-td :props="p">{{ getJobPostCount(p.row) }}</q-td>
      </template>

      <template #body-cell-action="p">
        <q-td :props="p">
          <q-btn
            round
            flat
            color="blue"
            icon="visibility"
            @click="viewApplicant(p.row)"
            class="bg-blue-1"
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
            <q-icon name="person" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-h6 text-bold">Applicant Details</div>
              <div class="text-caption opacity-80">Viewing full applicant information</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" class="close-btn" v-close-popup color="white" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="loadingApplicantDetails" class="text-center q-pa-xl">
          <q-spinner color="primary" size="48px" />
          <div class="q-mt-sm text-body2 text-grey-6">Loading applicant details...</div>
        </q-card-section>

        <q-card-section
          v-else-if="selectedApplicant"
          class="dialog-body q-pa-lg"
          style="overflow-y: auto; max-height: 65vh"
        >
          <!-- Personal Information -->
          <div class="section-label q-mb-md">
            <q-icon name="person" size="16px" class="q-mr-xs" />
            Personal Information
          </div>

          <div class="info-group q-mb-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="info-field">
                  <div class="info-label">First Name</div>
                  <div class="info-value">
                    {{
                      selectedApplicant.n_personal_info?.firstname ||
                      selectedApplicant.personal_info?.firstname ||
                      selectedApplicant.firstname ||
                      'N/A'
                    }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="info-field">
                  <div class="info-label">Last Name</div>
                  <div class="info-value">
                    {{
                      selectedApplicant.n_personal_info?.lastname ||
                      selectedApplicant.personal_info?.lastname ||
                      selectedApplicant.lastname ||
                      'N/A'
                    }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="info-field">
                  <div class="info-label">Date of Birth</div>
                  <div class="info-value">
                    {{
                      selectedApplicant.n_personal_info?.date_of_birth ||
                      selectedApplicant.personal_info?.date_of_birth ||
                      selectedApplicant.date_of_birth ||
                      'N/A'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div
            v-if="selectedApplicant.email || selectedApplicant.phone || selectedApplicant.address"
          >
            <div class="section-label q-mb-md">
              <q-icon name="contact_mail" size="16px" class="q-mr-xs" />
              Contact Information
            </div>
            <div class="info-group q-mb-lg">
              <div class="row q-col-gutter-md">
                <div v-if="selectedApplicant.email" class="col-12 col-md-4">
                  <div class="info-field">
                    <div class="info-label">Email</div>
                    <div class="info-value">
                      <q-icon name="email" size="xs" class="q-mr-xs" />
                      {{ selectedApplicant.email }}
                    </div>
                  </div>
                </div>
                <div v-if="selectedApplicant.phone" class="col-12 col-md-4">
                  <div class="info-field">
                    <div class="info-label">Phone</div>
                    <div class="info-value">
                      <q-icon name="phone" size="xs" class="q-mr-xs" />
                      {{ selectedApplicant.phone }}
                    </div>
                  </div>
                </div>
                <div v-if="selectedApplicant.address" class="col-12 col-md-4">
                  <div class="info-field">
                    <div class="info-label">Address</div>
                    <div class="info-value">
                      <q-icon name="home" size="xs" class="q-mr-xs" />
                      {{ selectedApplicant.address }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Job Applications -->
          <div class="section-label q-mb-md">
            <q-icon name="work" size="16px" class="q-mr-xs" />
            Job Applications
            <q-badge
              color="orange"
              :label="`${applicantJobRows.length} Position(s)`"
              class="q-ml-sm"
            />
          </div>

          <q-table
            :rows="applicantJobRows"
            :columns="jobColumns"
            row-key="submission_id"
            flat
            wrap-cells
            bordered
            hide-bottom
            no-data-label="No job applications found"
          >
            <template #body-cell-status="p">
              <q-td :props="p">
                <q-badge
                  :color="getJobStatusColor(p.row.status)"
                  :label="p.row.status ? p.row.status.toUpperCase() : 'N/A'"
                />
              </q-td>
            </template>

            <template #body-cell-action="p">
              <q-td :props="p">
                <q-btn
                  v-if="canModifyApplicant"
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDeleteApplication(p.row)"
                  :loading="deletingSubmissionId === p.row.submission_id"
                  :disable="p.row.status?.toLowerCase() === 'hired'"
                >
                  <q-tooltip>
                    {{
                      p.row.status?.toLowerCase() === 'hired'
                        ? 'Cannot delete hired application'
                        : 'Delete Application'
                    }}
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />
        <div class="dialog-footer row justify-end items-center q-pa-md">
          <q-btn rounded flat label="Close" color="grey-7" v-close-popup />
        </div>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-if="canModifyApplicant" v-model="showDeleteConfirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="24px" class="q-mr-sm" />
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>
        <q-card-section>
          <p class="q-mb-sm">Are you sure you want to delete this application?</p>
          <div v-if="deletingApplicationInfo" class="bg-grey-2 rounded-borders q-pa-md">
            <div class="text-caption text-grey-7">Submission Details:</div>
            <div class="q-mt-xs">
              <strong>Submission ID:</strong>
              {{ deletingApplicationInfo.submission_id }}
            </div>
            <div>
              <strong>Position:</strong>
              {{ deletingApplicationInfo.position }}
            </div>
            <div>
              <strong>Office:</strong>
              {{ deletingApplicationInfo.office }}
            </div>
            <div>
              <strong>Status:</strong>
              <q-badge
                :color="getJobStatusColor(deletingApplicationInfo.status)"
                :label="deletingApplicationInfo.status?.toUpperCase()"
                class="q-ml-sm"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Delete"
            color="negative"
            icon="delete"
            @click="deleteApplication"
            :loading="summaryReportStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ================================================================ -->
    <!-- QUALIFIED REPORT MODAL                                           -->
    <!-- ================================================================ -->
    <q-dialog v-if="canReportApplicant" v-model="showQualifiedModal" persistent>
      <q-card class="report-select-card">
        <q-card-section class="dialog-header header-add">
          <div class="row items-center no-wrap">
            <q-icon name="article" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-h6 text-bold">Qualified Applicants Report</div>
              <div class="text-caption opacity-80">Select options to generate</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" class="close-btn" @click="closeQualifiedModal" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="loadingPublicationDates" class="text-center q-pa-md">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm text-grey-6">Loading publication dates...</div>
          </div>
          <div v-else class="q-gutter-md">
            <!-- Publication Date -->
            <div>
              <div class="section-label q-mb-sm">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                Publication Date
              </div>
              <q-select
                v-model="selectedQualifiedPublicationDate"
                :options="filteredQualifiedPublicationDateOptions"
                label="Select Publication Date"
                outlined
                dense
                use-input
                input-debounce="300"
                @filter="filterQualifiedPublicationDates"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No dates found</q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>
                        <q-icon name="event" size="xs" class="q-mr-sm" />
                        {{ scope.opt }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected>
                  <span v-if="selectedQualifiedPublicationDate">
                    <q-icon name="event" size="xs" class="q-mr-sm" />
                    {{ selectedQualifiedPublicationDate }}
                  </span>
                </template>
              </q-select>
              <div
                v-if="publicationDateOptions.length === 0"
                class="q-mt-sm text-caption text-grey"
              >
                No publication dates available
              </div>
            </div>

            <!-- Applicant Type -->
            <div>
              <div class="section-label q-mb-sm">
                <q-icon name="people" size="16px" class="q-mr-xs" />
                Applicant Type
              </div>
              <q-btn-toggle
                v-model="selectedQualifiedApplicantType"
                spread
                no-caps
                unelevated
                rounded
                toggle-color="primary"
                color="grey-2"
                text-color="grey-8"
                :options="applicantTypeOptions"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <div class="dialog-footer row justify-end items-center q-pa-md q-gutter-sm">
          <q-btn rounded flat label="Cancel" color="grey-7" @click="closeQualifiedModal" />
          <q-btn
            rounded
            unelevated
            color="primary"
            label="Generate Report"
            icon="print"
            :disable="!selectedQualifiedPublicationDate"
            @click="generateQualifiedReport"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- ================================================================ -->
    <!-- UNQUALIFIED REPORT MODAL                                         -->
    <!-- ================================================================ -->
    <q-dialog v-if="canReportApplicant" v-model="showUnqualifiedModal" persistent>
      <q-card class="report-select-card">
        <q-card-section class="dialog-header header-edit">
          <div class="row items-center no-wrap">
            <q-icon name="article" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-h6 text-bold">Unqualified Applicants Report</div>
              <div class="text-caption opacity-80">Select options to generate</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" class="close-btn" @click="closeUnqualifiedModal" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="loadingPublicationDates" class="text-center q-pa-md">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm text-grey-6">Loading publication dates...</div>
          </div>
          <div v-else class="q-gutter-md">
            <!-- Publication Date -->
            <div>
              <div class="section-label q-mb-sm">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                Publication Date
              </div>
              <q-select
                v-model="selectedUnqualifiedPublicationDate"
                :options="filteredUnqualifiedPublicationDateOptions"
                label="Select Publication Date"
                outlined
                dense
                use-input
                input-debounce="300"
                @filter="filterUnqualifiedPublicationDates"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No dates found</q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>
                        <q-icon name="event" size="xs" class="q-mr-sm" />
                        {{ scope.opt }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected>
                  <span v-if="selectedUnqualifiedPublicationDate">
                    <q-icon name="event" size="xs" class="q-mr-sm" />
                    {{ selectedUnqualifiedPublicationDate }}
                  </span>
                </template>
              </q-select>
              <div
                v-if="publicationDateOptions.length === 0"
                class="q-mt-sm text-caption text-grey"
              >
                No publication dates available
              </div>
            </div>

            <!-- Applicant Type -->
            <div>
              <div class="section-label q-mb-sm">
                <q-icon name="people" size="16px" class="q-mr-xs" />
                Applicant Type
              </div>
              <q-btn-toggle
                v-model="selectedUnqualifiedApplicantType"
                spread
                no-caps
                unelevated
                rounded
                toggle-color="primary"
                color="grey-2"
                text-color="grey-8"
                :options="applicantTypeOptions"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <div class="dialog-footer row justify-end items-center q-pa-md q-gutter-sm">
          <q-btn rounded flat label="Cancel" color="grey-7" @click="closeUnqualifiedModal" />
          <q-btn
            rounded
            unelevated
            color="primary"
            label="Generate Report"
            icon="print"
            :disable="!selectedUnqualifiedPublicationDate"
            @click="generateUnqualifiedReport"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- ================================================================ -->
    <!-- ALL APPLICANTS REPORT MODAL (with Applicant Type)                -->
    <!-- ================================================================ -->
    <q-dialog v-if="canReportApplicant" v-model="showAllApplicantsModal" persistent>
      <q-card class="report-select-card">
        <q-card-section class="dialog-header header-all">
          <div class="row items-center no-wrap">
            <q-icon name="article" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-h6 text-bold">All Applicants Report</div>
              <div class="text-caption opacity-80">Select options to generate</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" class="close-btn" @click="closeAllApplicantsModal" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div v-if="loadingPublicationDates" class="text-center q-pa-md">
            <q-spinner color="primary" size="32px" />
            <div class="q-mt-sm text-grey-6">Loading publication dates...</div>
          </div>
          <div v-else class="q-gutter-md">
            <!-- Publication Date -->
            <div>
              <div class="section-label q-mb-sm">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                Publication Date
              </div>
              <q-select
                v-model="selectedAllApplicantsPublicationDate"
                :options="filteredAllApplicantsPublicationDateOptions"
                label="Select Publication Date"
                outlined
                dense
                use-input
                input-debounce="300"
                @filter="filterAllApplicantsPublicationDates"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No dates found</q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>
                        <q-icon name="event" size="xs" class="q-mr-sm" />
                        {{ scope.opt }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected>
                  <span v-if="selectedAllApplicantsPublicationDate">
                    <q-icon name="event" size="xs" class="q-mr-sm" />
                    {{ selectedAllApplicantsPublicationDate }}
                  </span>
                </template>
              </q-select>
              <div
                v-if="publicationDateOptions.length === 0"
                class="q-mt-sm text-caption text-grey"
              >
                No publication dates available
              </div>
            </div>

            <!-- Applicant Type -->
            <div>
              <div class="section-label q-mb-sm">
                <q-icon name="people" size="16px" class="q-mr-xs" />
                Applicant Type
              </div>
              <q-btn-toggle
                v-model="selectedAllApplicantsApplicantType"
                spread
                no-caps
                unelevated
                rounded
                toggle-color="primary"
                color="grey-2"
                text-color="grey-8"
                :options="applicantTypeOptions"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <div class="dialog-footer row justify-end items-center q-pa-md q-gutter-sm">
          <q-btn rounded flat label="Cancel" color="grey-7" @click="closeAllApplicantsModal" />
          <q-btn
            rounded
            unelevated
            color="primary"
            label="Generate Report"
            icon="print"
            :disable="!selectedAllApplicantsPublicationDate"
            @click="generateAllApplicantsReport"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- ================================================================ -->
    <!-- Report Sub-Dialogs                                               -->
    <!-- ================================================================ -->

    <!-- Qualified: Both -->
    <q-dialog v-if="canReportApplicant" v-model="showQualifiedReportDialog" persistent>
      <QualifiedReport :publicationDate="selectedQualifiedPublicationDate" />
    </q-dialog>

    <!-- Qualified: Internal only -->
    <q-dialog v-if="canReportApplicant" v-model="showInternalQualifiedReportDialog" persistent>
      <InternalQualifiedReport
        :publicationDate="selectedQualifiedPublicationDate"
        applicantType="internal"
      />
    </q-dialog>

    <!-- Qualified: External only -->
    <q-dialog v-if="canReportApplicant" v-model="showExternalQualifiedReportDialog" persistent>
      <ExternalQualifiedReport
        :publicationDate="selectedQualifiedPublicationDate"
        applicantType="external"
      />
    </q-dialog>

    <!-- Unqualified: Both -->
    <q-dialog v-if="canReportApplicant" v-model="showUnqualifiedReportDialog" persistent>
      <UnqualifiedReport :publicationDate="selectedUnqualifiedPublicationDate" />
    </q-dialog>

    <!-- Unqualified: Internal only -->
    <q-dialog v-if="canReportApplicant" v-model="showInternalUnqualifiedReportDialog" persistent>
      <InternalUnqualifiedReport
        :publicationDate="selectedUnqualifiedPublicationDate"
        applicantType="internal"
      />
    </q-dialog>

    <!-- Unqualified: External only -->
    <q-dialog v-if="canReportApplicant" v-model="showExternalUnqualifiedReportDialog" persistent>
      <ExternalUnqualifiedReport
        :publicationDate="selectedUnqualifiedPublicationDate"
        applicantType="external"
      />
    </q-dialog>

    <!-- All Applicants Report Display -->
    <q-dialog v-if="canReportApplicant" v-model="showAllApplicantsReportDialog" persistent>
      <ApplicantReport
        :publicationDate="selectedAllApplicantsPublicationDate"
        :applicantType="selectedAllApplicantsApplicantType"
      />
    </q-dialog>

    <q-dialog v-model="showPrintDialog" persistent>
      <ApplicantReport
        :filterType="dateFilterType"
        :singleDate="singleDate"
        :dateRange="dateRange"
        :positions="selectedPositions"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import ApplicantReport from 'src/components/Reports/ApplicantReport.vue';
  import QualifiedReport from 'src/components/Reports/QualifiedReport.vue';
  import InternalQualifiedReport from 'src/components/Reports/InternalQualifiedReport.vue';
  import ExternalQualifiedReport from 'src/components/Reports/ExternalQualifiedReport.vue';
  import UnqualifiedReport from 'src/components/Reports/UnqualifiedReport.vue';
  import InternalUnqualifiedReport from 'src/components/Reports/InternalUnqualifiedReport.vue';
  import ExternalUnqualifiedReport from 'src/components/Reports/ExternalUnqualifiedReport.vue';
  import { useApplicantStore } from 'stores/applicantStore';
  import { useSummaryReportStore } from 'stores/summaryReportStore';
  import { useAuthStore } from 'stores/authStore';
  import { useQuasar } from 'quasar';

  let searchTimeout = null;
  const applicantStore = useApplicantStore();
  const summaryReportStore = useSummaryReportStore();
  const authStore = useAuthStore();
  const $q = useQuasar();

  // ============================================================================
  // PERMISSION CHECKS
  // ============================================================================

  const canModifyApplicant = computed(
    () => authStore.user?.permissions?.modifyApplicantAccess === '1',
  );

  const canReportApplicant = computed(
    () => authStore.user?.permissions?.reportApplicantAccess === '1',
  );

  // ============================================================================
  // APPLICANT TYPE OPTIONS (shared by Qualified & Unqualified modals)
  // ============================================================================

  const applicantTypeOptions = [
    { label: 'Both', value: 'both' },
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
  ];

  // ============================================================================
  // GENERAL STATE
  // ============================================================================

  const globalSearch = ref('');
  const showDetailDialog = ref(false);
  const selectedApplicant = ref(null);
  const loadingApplicantDetails = ref(false);
  const dateFilterType = ref('single');
  const singleDate = ref('');
  const dateRange = ref({ from: '', to: '' });
  const selectedPositions = ref([]);
  const showPrintDialog = ref(false);

  // ============================================================================
  // QUALIFIED REPORT STATE
  // ============================================================================

  const showQualifiedModal = ref(false);
  const selectedQualifiedPublicationDate = ref(null);
  const selectedQualifiedApplicantType = ref('both');
  const filteredQualifiedPublicationDateOptions = ref([]);

  // Sub-dialogs — one per type
  const showQualifiedReportDialog = ref(false);
  const showInternalQualifiedReportDialog = ref(false);
  const showExternalQualifiedReportDialog = ref(false);

  // ============================================================================
  // UNQUALIFIED REPORT STATE
  // ============================================================================

  const showUnqualifiedModal = ref(false);
  const selectedUnqualifiedPublicationDate = ref(null);
  const selectedUnqualifiedApplicantType = ref('both');
  const filteredUnqualifiedPublicationDateOptions = ref([]);

  // Sub-dialogs — one per type
  const showUnqualifiedReportDialog = ref(false);
  const showInternalUnqualifiedReportDialog = ref(false);
  const showExternalUnqualifiedReportDialog = ref(false);

  // ============================================================================
  // ALL APPLICANTS REPORT STATE
  // ============================================================================

  const showAllApplicantsModal = ref(false);
  const selectedAllApplicantsPublicationDate = ref(null);
  const selectedAllApplicantsApplicantType = ref('both');
  const filteredAllApplicantsPublicationDateOptions = ref([]);
  const showAllApplicantsReportDialog = ref(false);

  // ============================================================================
  // SHARED PUBLICATION DATES
  // ============================================================================

  const loadingPublicationDates = ref(false);
  const publicationDateOptions = ref([]);

  // ============================================================================
  // DELETE STATE
  // ============================================================================

  const showDeleteConfirmDialog = ref(false);
  const deletingApplicationInfo = ref(null);
  const deletingSubmissionId = ref(null);

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const pagination = ref({
    sortBy: 'name',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getJobPostCount = (applicant) => {
    if (Array.isArray(applicant.job_post)) return applicant.job_post.length;
    if (applicant.job_post) return 1;
    if (applicant.jobpost !== undefined) return applicant.jobpost;
    return 0;
  };

  const getJobStatusColor = (status) => {
    if (!status) return 'grey';
    const s = status.toLowerCase();
    if (s === 'unqualified') return 'deep-orange';
    if (s === 'qualified') return 'green';
    if (s === 'hired') return 'blue';
    if (s === 'not started') return 'grey';
    if (s === 'ongoing') return 'orange';
    if (s === 'completed' || s === 'finished') return 'teal';
    return 'grey';
  };

  // ============================================================================
  // COLUMNS
  // ============================================================================

  const columns = computed(() => [
    { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
    {
      name: 'jobpost',
      label: 'No. of Applied Position',
      align: 'center',
      field: 'jobpost',
      sortable: true,
    },
    { name: 'action', label: 'Action', align: 'center', field: 'action', sortable: false },
  ]);

  const jobColumns = computed(() => {
    const cols = [
      { name: 'submission_id', label: 'Submission ID', field: 'submission_id', align: 'left' },
      { name: 'PageNo', label: 'Page No.', field: 'PageNo', align: 'center' },
      { name: 'ItemNo', label: 'Item No.', field: 'ItemNo', align: 'center' },
      { name: 'position', label: 'Position', field: 'position', align: 'left' },
      { name: 'office', label: 'Office', field: 'office', align: 'left' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
    ];
    if (canModifyApplicant.value) {
      cols.push({
        name: 'action',
        label: 'Action',
        align: 'center',
        field: 'action',
        sortable: false,
      });
    }
    return cols;
  });

  const applicantJobRows = computed(() => {
    if (!selectedApplicant.value) return [];
    const jobPosts = selectedApplicant.value.job_post;
    if (Array.isArray(jobPosts) && jobPosts.length > 0) {
      return jobPosts.map((job, idx) => ({
        submission_id: job.id || idx + 1,
        PageNo: job.PageNo || 'N/A',
        ItemNo: job.ItemNo || 'N/A',
        position: job.Position || 'N/A',
        office: job.Office || 'N/A',
        status: job.status || 'N/A',
      }));
    }
    if (jobPosts && typeof jobPosts === 'object' && !Array.isArray(jobPosts)) {
      return [
        {
          submission_id: jobPosts.id || 1,
          PageNo: jobPosts.PageNo || 'N/A',
          ItemNo: jobPosts.ItemNo || 'N/A',
          position: jobPosts.Position || 'N/A',
          office: jobPosts.Office || 'N/A',
          status: jobPosts.status || selectedApplicant.value.status || 'N/A',
        },
      ];
    }
    return [];
  });

  // ============================================================================
  // TABLE REQUEST / SEARCH
  // ============================================================================

  const onRequest = async (props) => {
    const { page, rowsPerPage } = props.pagination;
    await applicantStore.fetchApplicants({
      page,
      perPage: rowsPerPage,
      search: globalSearch.value,
    });
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.rowsNumber = applicantStore.total;
  };

  watch(globalSearch, (newValue) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      pagination.value.page = 1;
      await applicantStore.fetchApplicants({
        page: 1,
        perPage: pagination.value.rowsPerPage,
        search: newValue,
      });
      pagination.value.rowsNumber = applicantStore.total;
    }, 500);
  });

  // ============================================================================
  // SHARED: Fetch publication dates
  // ============================================================================

  const fetchPublicationDates = async () => {
    loadingPublicationDates.value = true;
    try {
      const response = await summaryReportStore.fetchPublicationDateList();
      publicationDateOptions.value = Array.isArray(response) ? response.map((i) => i.date) : [];
      filteredQualifiedPublicationDateOptions.value = [...publicationDateOptions.value];
      filteredUnqualifiedPublicationDateOptions.value = [...publicationDateOptions.value];
      filteredAllApplicantsPublicationDateOptions.value = [...publicationDateOptions.value];
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to load publication dates' });
      publicationDateOptions.value = [];
      filteredQualifiedPublicationDateOptions.value = [];
      filteredUnqualifiedPublicationDateOptions.value = [];
      filteredAllApplicantsPublicationDateOptions.value = [];
    } finally {
      loadingPublicationDates.value = false;
    }
  };

  // ============================================================================
  // QUALIFIED REPORT ACTIONS
  // ============================================================================

  const openQualifiedReportDialog = async () => {
    if (!canReportApplicant.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to view reports',
        position: 'top',
      });
      return;
    }
    selectedQualifiedPublicationDate.value = null;
    selectedQualifiedApplicantType.value = 'both';
    showQualifiedModal.value = true;
    await fetchPublicationDates();
  };

  const filterQualifiedPublicationDates = (val, update) => {
    update(() => {
      const needle = val.toLowerCase();
      filteredQualifiedPublicationDateOptions.value = publicationDateOptions.value.filter((v) =>
        v.toLowerCase().includes(needle),
      );
    });
  };

  const closeQualifiedModal = () => {
    showQualifiedModal.value = false;
    selectedQualifiedPublicationDate.value = null;
    selectedQualifiedApplicantType.value = 'both';
  };

  const generateQualifiedReport = () => {
    showQualifiedModal.value = false;
    if (selectedQualifiedApplicantType.value === 'internal') {
      showInternalQualifiedReportDialog.value = true;
    } else if (selectedQualifiedApplicantType.value === 'external') {
      showExternalQualifiedReportDialog.value = true;
    } else {
      showQualifiedReportDialog.value = true;
    }
  };

  // ============================================================================
  // UNQUALIFIED REPORT ACTIONS
  // ============================================================================

  const openUnqualifiedReportDialog = async () => {
    if (!canReportApplicant.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to view reports',
        position: 'top',
      });
      return;
    }
    selectedUnqualifiedPublicationDate.value = null;
    selectedUnqualifiedApplicantType.value = 'both';
    showUnqualifiedModal.value = true;
    await fetchPublicationDates();
  };

  const filterUnqualifiedPublicationDates = (val, update) => {
    update(() => {
      const needle = val.toLowerCase();
      filteredUnqualifiedPublicationDateOptions.value = publicationDateOptions.value.filter((v) =>
        v.toLowerCase().includes(needle),
      );
    });
  };

  const closeUnqualifiedModal = () => {
    showUnqualifiedModal.value = false;
    selectedUnqualifiedPublicationDate.value = null;
    selectedUnqualifiedApplicantType.value = 'both';
  };

  const generateUnqualifiedReport = () => {
    showUnqualifiedModal.value = false;
    if (selectedUnqualifiedApplicantType.value === 'internal') {
      showInternalUnqualifiedReportDialog.value = true;
    } else if (selectedUnqualifiedApplicantType.value === 'external') {
      showExternalUnqualifiedReportDialog.value = true;
    } else {
      showUnqualifiedReportDialog.value = true;
    }
  };

  // ============================================================================
  // ALL APPLICANTS REPORT ACTIONS
  // ============================================================================

  const openAllApplicantsReportDialog = async () => {
    if (!canReportApplicant.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to view reports',
        position: 'top',
      });
      return;
    }
    selectedAllApplicantsPublicationDate.value = null;
    selectedAllApplicantsApplicantType.value = 'both';
    showAllApplicantsModal.value = true;
    await fetchPublicationDates();
  };

  const filterAllApplicantsPublicationDates = (val, update) => {
    update(() => {
      const needle = val.toLowerCase();
      filteredAllApplicantsPublicationDateOptions.value = publicationDateOptions.value.filter((v) =>
        v.toLowerCase().includes(needle),
      );
    });
  };

  const closeAllApplicantsModal = () => {
    showAllApplicantsModal.value = false;
    selectedAllApplicantsPublicationDate.value = null;
    selectedAllApplicantsApplicantType.value = 'both';
  };

  const generateAllApplicantsReport = () => {
    showAllApplicantsModal.value = false;
    showAllApplicantsReportDialog.value = true;
  };

  // ============================================================================
  // VIEW APPLICANT
  // ============================================================================

  const viewApplicant = async (applicant) => {
    selectedApplicant.value = applicant;
    showDetailDialog.value = true;
    loadingApplicantDetails.value = true;
    try {
      const firstname =
        applicant.n_personal_info?.firstname ||
        applicant.personal_info?.firstname ||
        applicant.firstname;
      const lastname =
        applicant.n_personal_info?.lastname ||
        applicant.personal_info?.lastname ||
        applicant.lastname;
      const dob =
        applicant.n_personal_info?.date_of_birth ||
        applicant.personal_info?.date_of_birth ||
        applicant.date_of_birth;

      const details = await applicantStore.fetchApplicantDetail(firstname, lastname, dob);
      if (details) {
        selectedApplicant.value = {
          ...selectedApplicant.value,
          ...details,
          job_post: details.job_post || selectedApplicant.value.job_post,
        };
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
      $q.notify({ type: 'negative', message: 'Failed to load applicant details' });
    } finally {
      loadingApplicantDetails.value = false;
    }
  };

  // ============================================================================
  // DELETE APPLICATION
  // ============================================================================

  const confirmDeleteApplication = (jobRow) => {
    if (!canModifyApplicant.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to delete applications',
        position: 'top',
      });
      return;
    }
    deletingApplicationInfo.value = jobRow;
    showDeleteConfirmDialog.value = true;
  };

  const deleteApplication = async () => {
    if (!deletingApplicationInfo.value) return;
    const submissionId = deletingApplicationInfo.value.submission_id;
    if (!submissionId) {
      $q.notify({ type: 'negative', message: 'Invalid submission ID', position: 'top' });
      return;
    }
    deletingSubmissionId.value = submissionId;
    try {
      await summaryReportStore.deleteApplication({ id: submissionId });
      $q.notify({
        type: 'positive',
        message: `Application #${submissionId} deleted successfully`,
        position: 'top',
      });

      showDeleteConfirmDialog.value = false;
      deletingApplicationInfo.value = null;

      if (selectedApplicant.value) {
        const firstname =
          selectedApplicant.value.n_personal_info?.firstname ||
          selectedApplicant.value.personal_info?.firstname ||
          selectedApplicant.value.firstname;
        const lastname =
          selectedApplicant.value.n_personal_info?.lastname ||
          selectedApplicant.value.personal_info?.lastname ||
          selectedApplicant.value.lastname;
        const dob =
          selectedApplicant.value.n_personal_info?.date_of_birth ||
          selectedApplicant.value.personal_info?.date_of_birth ||
          selectedApplicant.value.date_of_birth;

        const details = await applicantStore.fetchApplicantDetail(firstname, lastname, dob);
        if (details) {
          selectedApplicant.value = {
            ...selectedApplicant.value,
            ...details,
            job_post: details.job_post || selectedApplicant.value.job_post,
          };
        }
      }

      await applicantStore.fetchApplicants({
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
        search: globalSearch.value,
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to delete application',
        position: 'top',
      });
    } finally {
      deletingSubmissionId.value = null;
    }
  };

  // ============================================================================
  // MOUNT
  // ============================================================================

  onMounted(async () => {
    await applicantStore.fetchApplicants({
      page: 1,
      perPage: pagination.value.rowsPerPage,
      search: '',
    });
    pagination.value.rowsNumber = applicantStore.total;
  });
</script>

<style scoped>
  .detail-dialog-card,
  .report-select-card {
    width: 90vw;
    max-width: 960px;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }
  .report-select-card {
    max-width: 480px;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    color: white;
    flex-shrink: 0;
  }
  .header-add {
    background: #00b034;
  }
  .header-edit {
    background: #1976d2;
  }
  .header-view {
    background: #1565c0;
  }
  .header-all {
    background: #6a1b9a;
  }

  .close-btn {
    color: rgba(255, 255, 255, 0.8);
  }
  .close-btn:hover {
    color: white;
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

  .dialog-footer {
    flex-shrink: 0;
    background: #fafafa;
  }
</style>
