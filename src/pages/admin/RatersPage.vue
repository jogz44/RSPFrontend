<template>
  <q-page class="q-pa-md">
    <div class="column items-start justify-center q-mb-md">
      <h5 class="text-h5 q-ma-none"><b>Rater Management</b></h5>
      <div class="q-pa-md q-gutter-sm">
        <q-breadcrumbs class="q-ma-none">
          <template v-slot:separator>
            <q-icon size="1.2em" name="arrow_forward" />
          </template>
          <q-breadcrumbs-el label="Rater Management" icon="assignment_ind" />
          <q-breadcrumbs-el label="Raters" icon="groups" />
        </q-breadcrumbs>
      </div>
    </div>

    <!-- Card -->
    <q-card>
      <q-card-section class="row justify-between items-center">
        <div>
          <q-input
            dense
            outlined
            v-model="globalSearch"
            placeholder="Search all raters..."
            clearable
            :disable="isLoadingTable"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon
                v-if="globalSearch !== ''"
                name="clear"
                class="cursor-pointer"
                @click="globalSearch = ''"
              />
            </template>
          </q-input>
        </div>
        <div v-if="canModifyRater">
          <q-btn
            rounded
            color="primary"
            label="Add Rater"
            @click="showAddModal"
            icon="add"
            :disable="isLoadingTable"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          flat
          bordered
          :rows="filteredRaters"
          :columns="columns"
          row-key="id"
          :loading="isLoadingTable"
          loading-label="Loading raters..."
          no-data-label="No raters found"
        >
          <template v-slot:body-cell-Office="props">
            <q-td :props="props">
              <div style="white-space: normal; overflow-wrap: break-word">
                {{ props.row.office }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-active="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.active ? 'green' : 'red'"
                :label="props.row.active ? 'Active' : 'Inactive'"
                class="q-pa-xs"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                @click="viewRater(props.row)"
                color="info"
                class="bg-blue-1"
                :disable="isLoadingTable"
              >
                <q-tooltip>View</q-tooltip>
              </q-btn>
              <template v-if="canModifyRater">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  @click="editRater(props.row)"
                  class="q-ml-sm bg-teal-1"
                  color="positive"
                  :disable="isLoadingTable"
                >
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <ButtonResetPassword
                  v-if="props.row.id !== authStore.user?.id"
                  :user-id="props.row.id"
                />
              </template>
            </q-td>
          </template>

          <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row flex-center q-gutter-sm text-grey" style="padding: 60px 0">
              <q-icon size="2em" :name="filter ? 'filter_alt_off' : icon || 'inbox'" />
              <span>
                {{
                  filter ? 'No raters match your search criteria' : message || 'No raters available'
                }}
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Rater Modal -->
    <q-dialog v-if="canModifyRater" v-model="showModal" persistent>
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section class="row items-center justify-between bg-primary text-white">
          <div class="text-h4">
            <b>{{ isEditMode ? 'Edit Rater' : 'Add a Rater' }}</b>
          </div>
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>

        <q-card-section>
          <q-banner v-if="showError" class="bg-red-2 text-red-10 q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="error" color="negative" />
            </template>
            Please fill in all required fields: Office, {{ !isEditMode ? 'Rater, ' : '' }}and Role
            are required.
          </q-banner>

          <!-- Select Positions -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-medium">
              Select Job Positions to Rate
              <span class="text-grey-7 text-caption">(optional)</span>
            </div>
            <q-select
              ref="positionSelect"
              v-model="selectedPositions"
              multiple
              :options="positionsWithAllOption"
              option-value="id"
              option-label="name"
              label="Select one or more positions (optional)"
              outlined
              dense
              use-chips
              emit-value
              map-options
              clearable
              @update:model-value="handlePositionSelection"
              @before-show="snapshotPositions"
            >
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  dense
                  @remove="scope.removeAtIndex(scope.index)"
                  color="primary"
                  text-color="white"
                  class="q-mr-xs"
                >
                  {{ getPositionDisplayName(scope.opt) }}
                </q-chip>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      {{ scope.opt.name }}
                      <span class="text-caption text-grey-7" v-if="scope.opt.office_abbr">
                        ({{ scope.opt.office_abbr }})
                      </span>
                    </q-item-label>
                    <q-item-label caption v-if="scope.opt.office_abbr" class="text-grey-6">
                      Office: {{ scope.opt.office_abbr }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox
                      :model-value="isPositionSelected(scope.opt.id)"
                      @update:model-value="(val) => togglePosition(scope.opt.id, val)"
                      @click.stop
                    />
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:after-options>
                <div class="q-pa-sm row q-gutter-sm">
                  <q-btn
                    label="Cancel"
                    color="negative"
                    outlined
                    dense
                    class="col"
                    @click.stop="cancelPositionSelect"
                  />
                  <q-btn
                    label="Confirm"
                    color="primary"
                    unelevated
                    dense
                    class="col"
                    @click.stop="closePositionSelect"
                  />
                </div>
              </template>
            </q-select>
          </div>

          <template v-if="!isEditMode">
            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Office
                <span class="text-negative">*</span>
              </div>
              <q-select
                v-model="selectedOffice"
                :options="offices"
                option-label="label"
                option-value="value"
                label="Select an office"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="handleOfficeChange"
              >
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
              </q-select>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Select Rater
                <span class="text-negative">*</span>
              </div>
              <q-select
                v-model="selectedRater"
                :options="filteredRatersByOffice"
                option-value="id"
                option-label="name"
                label="Search and select rater"
                use-input
                input-debounce="300"
                outlined
                dense
                emit-value
                map-options
                :loading="isLoadingRaters"
                :disable="!selectedOffice"
                @filter="filterRatersByOffice"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No raters found in this office
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Honorific Title
                <span class="text-grey-7 text-caption">(optional)</span>
              </div>
              <q-input
                v-model="selectedPrefix"
                label="Enter honorific title (e.g., Dr., Atty., Engr.)"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="title" />
                </template>
              </q-input>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Post-Nominal
                <span class="text-grey-7 text-caption">(optional)</span>
              </div>
              <q-input
                v-model="selectedSuffix"
                label="Enter post-nominal (e.g., PhD, RN, CPA)"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="verified" />
                </template>
              </q-input>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Representation
                <span class="text-grey-7 text-caption">(optional)</span>
              </div>
              <q-input
                v-model="representative"
                label="Enter representation (optional)"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Role
                <span class="text-negative">*</span>
              </div>
              <q-select
                v-model="selectedRole"
                :options="roleOptions"
                label="Select role"
                outlined
                dense
                emit-value
                map-options
                :error="showError && !selectedRole"
                error-message="Role is required"
              >
                <template v-slot:prepend>
                  <q-icon name="manage_accounts" />
                </template>
              </q-select>
            </div>

            <div class="q-mb-md">
              <q-toggle
                v-model="activeStatus"
                :true-value="true"
                :false-value="false"
                color="green"
                checked-icon="check"
                unchecked-icon="block"
              />
              <span class="text-body1 q-ml-sm" :class="activeStatus ? 'text-green' : 'text-red'">
                {{ activeStatus ? 'Active' : 'Inactive' }}
              </span>
              <q-toggle
                v-model="enable"
                :true-value="true"
                :false-value="false"
                color="green"
                checked-icon="check"
                unchecked-icon="block"
                class="q-ml-md"
              />
              <span class="text-body1 q-ml-sm" :class="enable ? 'text-green' : 'text-red'">
                {{ enable ? 'Enable' : 'Disable' }}
              </span>
            </div>
          </template>

          <template v-else>
            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Select Office
                <span class="text-negative">*</span>
              </div>
              <q-select
                v-model="selectedOffice"
                :options="offices"
                option-label="label"
                option-value="value"
                label="Select an office"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
              </q-select>
            </div>

            <q-separator class="q-mt-md q-mb-md" />

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">Rater</div>
              <q-select
                outlined
                dense
                readonly
                :model-value="currentRaterName"
                :options="currentOfficeRaters"
                option-value="id"
                option-label="name"
                label="Current Rater"
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
                <template v-slot:append>
                  <q-icon name="lock" size="xs" />
                </template>
              </q-select>
              <div class="text-caption text-grey q-mt-sm">
                <q-icon name="info" size="xs" class="q-mr-xs" />
                Rater name cannot be changed
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Honorific Title
                <span class="text-grey-7 text-caption">(optional)</span>
              </div>
              <q-input
                v-model="selectedPrefix"
                label="Enter honorific title (e.g., Dr., Atty., Engr.)"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="title" />
                </template>
              </q-input>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Post-Nominal
                <span class="text-grey-7 text-caption">(optional)</span>
              </div>
              <q-input
                v-model="selectedSuffix"
                label="Enter post-nominal (e.g., PhD, RN, CPA)"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="verified" />
                </template>
              </q-input>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Representation
                <span class="text-grey-7 text-caption">(optional)</span>
              </div>
              <q-input
                v-model="representative"
                label="Enter representation (optional)"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                Role
                <span class="text-negative">*</span>
              </div>
              <q-select
                v-model="selectedRole"
                :options="roleOptions"
                label="Select role"
                outlined
                dense
                emit-value
                map-options
                :error="showError && !selectedRole"
                error-message="Role is required"
              >
                <template v-slot:prepend>
                  <q-icon name="manage_accounts" />
                </template>
              </q-select>
            </div>

            <div class="q-mb-md">
              <q-toggle
                v-model="activeStatus"
                :true-value="true"
                :false-value="false"
                color="green"
                checked-icon="check"
                unchecked-icon="block"
              />
              <span class="text-body1 q-ml-sm" :class="activeStatus ? 'text-green' : 'text-red'">
                {{ activeStatus ? 'Active' : 'Inactive' }}
              </span>
              <q-toggle
                v-model="enable"
                :true-value="true"
                :false-value="false"
                color="green"
                checked-icon="check"
                unchecked-icon="block"
                class="q-ml-md"
              />
              <span class="text-body1 q-ml-sm" :class="enable ? 'text-green' : 'text-red'">
                {{ enable ? 'Enable' : 'Disable' }}
              </span>
            </div>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn rounded flat label="Cancel" color="negative" @click="closeModal" />
          <q-btn
            rounded
            :label="isEditMode ? 'Update Rater' : 'Add Rater'"
            color="primary"
            @click="isEditMode ? updateRater() : addRater()"
            :loading="isSubmitting"
            :disable="isEditMode ? false : !selectedRater || !selectedOffice"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-if="canModifyRater" v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>
        <q-card-section>Are you sure you want to delete this rater?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteRater" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View Rater Dialog -->
    <q-dialog v-model="showViewDialog" persistent>
      <q-card style="width: 800px; max-width: 95vw; display: flex; flex-direction: column">
        <q-card-section class="bg-grey-2 q-px-lg q-py-md sticky-header">
          <div class="text-h6">Jobs to Rate</div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            class="absolute-top-right q-mt-sm q-mr-sm"
          />
        </q-card-section>

        <q-card-section class="q-px-lg sticky-info">
          <div class="row q-col-gutter-md">
            <div class="col">
              <div class="text-subtitle1 q-mb-sm">
                <strong>Rater:</strong>
                {{ formattedRaterName }}
              </div>
              <div class="text-subtitle1 q-mb-sm">
                <strong>Office:</strong>
                {{ currentViewRater.office }}
              </div>
              <div class="text-subtitle1 q-mb-sm" v-if="currentViewRater.prefix">
                <strong>Honorific Title:</strong>
                {{ currentViewRater.prefix }}
              </div>
              <div class="text-subtitle1 q-mb-sm" v-if="currentViewRater.suffix">
                <strong>Post-Nominal:</strong>
                {{ formatSuffixDisplay(currentViewRater.suffix) }}
              </div>
              <div class="text-subtitle1 q-mb-sm">
                <strong>Representation:</strong>
                {{ currentViewRater.representative || '—' }}
              </div>
              <div class="text-subtitle1 q-mb-sm">
                <strong>Role:</strong>
                <q-badge
                  v-if="currentViewRater.role"
                  :color="currentViewRater.role === 'Chairperson' ? 'purple' : 'teal'"
                  text-color="white"
                  class="q-pa-xs q-ml-xs"
                >
                  <q-icon
                    :name="currentViewRater.role === 'Chairperson' ? 'star' : 'group'"
                    size="xs"
                    class="q-mr-xs"
                  />
                  {{ currentViewRater.role }}
                </q-badge>
                <span v-else class="text-grey">—</span>
              </div>
            </div>
            <div class="col-auto">
              <q-input
                outlined
                v-model="jobSearch"
                placeholder="Search jobs..."
                dense
                clearable
                style="width: 250px"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md q-mx-md scrollable-content">
          <div v-if="isLoadingJobs" class="flex flex-center q-py-xl">
            <q-spinner size="50px" color="primary" />
            <div class="q-ml-md">Loading assigned jobs...</div>
          </div>

          <div v-else-if="jobLoadError" class="flex flex-center q-py-xl">
            <q-icon name="error" size="40px" color="negative" />
            <div class="q-ml-md text-negative">{{ jobLoadError }}</div>
          </div>

          <q-table
            v-else
            flat
            bordered
            :rows="filteredJobs"
            :columns="jobColumns"
            row-key="id"
            :pagination="pagination"
            class="sticky-header-table no-horizontal-scroll"
            wrap-cells
            virtual-scroll
          >
            <template v-slot:body-cell-position="props">
              <q-td :props="props" class="position-column">
                <div class="full-position-text" :title="props.row.Position">
                  {{ props.row.Position }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-office="props">
              <q-td :props="props" class="office-column">
                <div class="full-office-text" :title="props.row.Office">
                  {{ props.row.Office }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-applicant="props">
              <q-td :props="props" class="text-center">
                <div class="text-grey-9">
                  {{ props.row.applicant }}
                  <q-icon name="people" size="xs" class="q-ml-xs" />
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  :color="
                    props.row.status === 'pending'
                      ? 'amber'
                      : props.row.status === 'complete'
                        ? 'green'
                        : 'grey'
                  "
                  text-color="white"
                  class="q-pa-sm"
                  outline
                >
                  {{ props.row.status }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="print"
                  color="primary"
                  @click="openRatingFormReport(props.row)"
                  :loading="printingJobId === (props.row.job_batches_rsp_id || props.row.id)"
                  :disable="printingJobId === (props.row.job_batches_rsp_id || props.row.id)"
                >
                  <q-tooltip>Print Rating Form</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="note_add"
                  color="info"
                  class="q-ml-sm"
                  @click="openEmptyRatingFormReport(props.row)"
                  :loading="emptyPrintingJobId === (props.row.job_batches_rsp_id || props.row.id)"
                  :disable="emptyPrintingJobId === (props.row.job_batches_rsp_id || props.row.id)"
                >
                  <q-tooltip>Print Empty Rating Form</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-gutter-sm text-grey">
                <q-icon size="2em" name="inbox" />
                <span>No jobs assigned to this rater</span>
              </div>
            </template>

            <template v-slot:bottom="scope">
              <div class="row items-center justify-between full-width q-px-md">
                <div>Records per page: {{ scope.pagination.rowsPerPage }}</div>
                <div>
                  {{ (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1 }}-{{
                    Math.min(
                      scope.pagination.page * scope.pagination.rowsPerPage,
                      filteredJobs.length,
                    )
                  }}
                  of {{ filteredJobs.length }}
                </div>
              </div>
            </template>
          </q-table>
        </q-card-section>

        <q-card-section class="q-pt-md q-px-lg sticky-footer">
          <div class="row justify-between items-center">
            <div class="text-caption text-grey-7">
              Showing {{ filteredJobs.length }} job{{ filteredJobs.length !== 1 ? 's' : '' }}
            </div>
            <div class="row q-gutter-md">
              <div class="text-primary flex items-center">
                <q-icon name="assignment" size="sm" class="q-mr-xs" />
                Total Jobs: {{ raterJobs.length }}
              </div>
              <div class="text-info flex items-center">
                <q-icon name="people" size="sm" class="q-mr-xs" />
                Total Applicants: {{ totalApplicants }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Rating Form Report (with data) -->
    <RatingFormReport
      v-if="showRatingFormDialog"
      v-model="showRatingFormDialog"
      :job-batches-rsp-id="selectedJobId"
      :rater-id="selectedRaterId"
      :rating-data="ratingFormData"
      @close="handleRatingFormClose"
    />

    <!-- Empty Rating Form Report -->
    <EmptyRatingFormReport
      v-if="showEmptyRatingFormDialog"
      v-model="showEmptyRatingFormDialog"
      :job-batches-rsp-id="selectedJobId"
      :rater-id="selectedRaterId"
      :rating-data="emptyRatingFormData"
      @close="handleEmptyRatingFormClose"
    />
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted, watch, nextTick } from 'vue';
  import { useAuthStore } from 'stores/authStore';
  import { useJobPostStore } from 'stores/jobPostStore';
  import { usePlantillaStore } from 'stores/plantillaStore';
  import { use_rating_form_store } from 'stores/ratingFormStore';
  import ButtonResetPassword from 'components/ButtonResetPassword.vue';
  import RatingFormReport from 'components/Reports/RatingFormReport.vue';
  import EmptyRatingFormReport from 'components/Reports/EmptyRatingFormReport.vue';
  import { toast } from 'boot/toast';
  import { adminApi } from 'boot/axios_admin';

  const jobPostStore = useJobPostStore();
  const authStore = useAuthStore();
  const plantillaStore = usePlantillaStore();
  const ratingFormStore = use_rating_form_store();

  // ==================== PERMISSION CHECK ====================
  const canModifyRater = computed(() => {
    return authStore.user?.permissions?.modifyRater === '1';
  });

  // ==================== SEARCH ====================
  const globalSearch = ref('');
  const jobSearch = ref('');

  // ==================== DATA ====================
  const raters = ref([]);
  const raterJobs = ref([]);
  const isLoadingJobs = ref(false);
  const jobLoadError = ref('');
  const isLoadingTable = ref(false);

  // ==================== PRINTING / REPORT STATE ====================
  const printingJobId = ref(null);
  const emptyPrintingJobId = ref(null);
  const showRatingFormDialog = ref(false);
  const showEmptyRatingFormDialog = ref(false);
  const selectedJobId = ref(null);
  const selectedRaterId = ref(null);
  /**
   * ratingFormData holds the raw API response object.
   * It is passed directly to <RatingFormReport> via the :rating-data prop.
   * The child component reads this prop and generates the PDF — no extra fetch needed.
   */
  const ratingFormData = ref(null);
  const emptyRatingFormData = ref(null);

  // ==================== RATING FORM CACHE ====================
  // Key: `${jobId}_${raterId}` → cached API response object
  const ratingFormCache = ref(new Map());
  const emptyRatingFormCache = ref(new Map());

  // ==================== MODAL STATE ====================
  const showModal = ref(false);
  const showError = ref(false);
  const isSubmitting = ref(false);
  const isEditMode = ref(false);
  const currentRaterId = ref(null);
  const currentRaterName = ref('');
  const currentRaterOffice = ref('');
  const currentOfficeRaters = ref([]);

  // ==================== VIEW DIALOG ====================
  const showViewDialog = ref(false);
  const currentViewRater = ref({
    id: null,
    name: '',
    position: '',
    office: '',
    representative: '',
    role: '',
    prefix: null,
    suffix: null,
  });

  // ==================== PAGINATION ====================
  const pagination = ref({
    sortBy: 'Position',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  // ==================== DELETE DIALOG ====================
  const showDeleteDialog = ref(false);
  const raterToDelete = ref(null);

  // ==================== FORM STATE ====================
  const selectedPositions = ref([]);
  const selectedRater = ref(null);
  const selectedOffice = ref('');
  const activeStatus = ref(true);
  const enable = ref(true);
  const representative = ref('');
  const selectedRole = ref(null);
  const selectedPrefix = ref('');
  const selectedSuffix = ref('');

  // ==================== ROLE OPTIONS ====================
  const roleOptions = [
    { label: 'Chairperson', value: 'Chairperson' },
    { label: 'Member', value: 'Member' },
  ];

  // ==================== OPTIONS DATA ====================
  const offices = ref([]);
  const positions = ref([]);
  const filteredRatersByOffice = ref([]);
  const officeRatersRaw = ref([]);
  const isLoadingRaters = ref(false);
  const positionSelect = ref(null);
  const positionSnapshot = ref([]);

  // ==================== JOB COLUMNS ====================
  const jobColumns = [
    { name: 'position', label: 'Position', field: 'Position', align: 'left', style: 'width: 30%' },
    { name: 'office', label: 'Office', field: 'Office', align: 'left', style: 'width: 30%' },
    {
      name: 'applicant',
      label: 'Applicants',
      field: 'applicant',
      align: 'center',
      style: 'width: 10%',
    },
    { name: 'status', label: 'Status', field: 'status', align: 'center', style: 'width: 15%' },
    { name: 'actions', label: 'Actions', align: 'center', style: 'width: 15%' },
  ];

  // ==================== COLUMNS ====================
  const columns = computed(() => {
    const baseColumns = [
      {
        name: 'name',
        label: 'Rater Name',
        field: 'name',
        align: 'left',
        style: 'width: 15%; word-wrap: break-word; white-space: normal;',
      },
      {
        name: 'office',
        label: 'Office',
        field: 'office',
        align: 'left',
        style: 'width: 20%; word-wrap: break-word; white-space: normal;',
      },
      {
        name: 'pending',
        label: 'Pending',
        field: 'pending',
        align: 'center',
        sortable: false,
        style: 'width: 10%',
      },
      {
        name: 'completed',
        label: 'Completed',
        field: 'completed',
        align: 'center',
        sortable: false,
        style: 'width: 10%',
      },
      {
        name: 'active',
        align: 'left',
        label: 'Status',
        field: 'active',
        sortable: true,
        style: 'width: 10%',
      },
    ];

    if (canModifyRater.value) {
      baseColumns.push({ name: 'actions', label: 'Actions', align: 'center', style: 'width: 5%' });
    }
    return baseColumns;
  });

  // ==================== COMPUTED ====================
  const formattedRaterName = computed(() => {
    let name = currentViewRater.value.name || '';
    const prefix = currentViewRater.value.prefix;
    const suffix = currentViewRater.value.suffix;
    let formatted = name;
    if (prefix && prefix.trim()) formatted = `${prefix.trim()} ${name}`;
    if (suffix && suffix.toString().trim()) {
      const suffixStr = formatSuffixDisplay(suffix);
      if (suffixStr) formatted = `${formatted}, ${suffixStr}`;
    }
    return formatted;
  });

  const processedRaters = computed(() => {
    return raters.value.map((rater) => {
      const jobBatchesArray = Array.isArray(rater.job_batches_rsp) ? rater.job_batches_rsp : [];
      return {
        ...rater,
        job_batches_rsp_array: jobBatchesArray,
        Rater: rater.name || rater.Rater,
        Office: rater.office || rater.Office,
      };
    });
  });

  const filteredRaters = computed(() => {
    if (!globalSearch.value) return processedRaters.value;
    const searchTerm = globalSearch.value.toLowerCase();
    return processedRaters.value.filter((rater) => {
      const positionsText = rater.job_batches_rsp_array
        .map((p) => p.position)
        .join(' ')
        .toLowerCase();
      return (
        String(rater.id).includes(searchTerm) ||
        (rater.name || '').toLowerCase().includes(searchTerm) ||
        positionsText.includes(searchTerm) ||
        (rater.office || '').toLowerCase().includes(searchTerm)
      );
    });
  });

  const filteredJobs = computed(() => {
    if (!jobSearch.value) return raterJobs.value;
    const searchTerm = jobSearch.value.toLowerCase();
    return raterJobs.value.filter(
      (job) =>
        job.Position.toLowerCase().includes(searchTerm) ||
        job.Office.toLowerCase().includes(searchTerm),
    );
  });

  const positionsWithAllOption = computed(() => {
    // Ensure positions.value is an array
    const positionsArray = Array.isArray(positions.value) ? positions.value : [];
    if (!positionsArray.length) return [];
    return [{ id: 'all', name: 'All Positions', office_abbr: 'ALL' }, ...positionsArray];
  });

  const totalApplicants = computed(() => {
    return raterJobs.value.reduce((total, job) => total + parseInt(job.applicant || 0), 0);
  });

  // ==================== HELPER FUNCTIONS ====================
  const getOfficeAbbr = (officeName) => {
    if (!officeName) return '';
    const officeMap = {
      'OFFICE OF THE CITY MAYOR': 'OCM',
      'OFFICE OF THE CITY ACCOUNTANT': 'CACCO',
      'OFFICE OF THE CITY BUDGET OFFICER': 'OCBO',
      'OFFICE OF THE CITY ASSESSOR': 'OCASS',
      'OFFICE OF THE CITY TREASURER': 'OCT',
      'OFFICE OF THE CITY PLANNING AND DEVELOPMENT OFFICER': 'OCPDO',
      'OFFICE OF THE CITY LEGAL OFFICER': 'OCLO',
      'OFFICE OF THE CITY ADMINISTRATOR': 'OCAD',
      'OFFICE OF THE CITY GENERAL SERVICES OFFICER': 'OCGSO',
      'OFFICE OF THE CITY INFORMATION AND COMMUNICATIONS TECHNOLOGY MANAGEMENT OFFICER': 'CICTMO',
      'OFFICE OF THE CITY HUMAN RESOURCE MANAGEMENT OFFICER': 'CHRMO',
      'OFFICE OF THE CITY AGRICULTURIST': 'OCA',
      'OFFICE OF THE CITY VETERINARIAN': 'OCVET',
      'OFFICE OF THE CITY ENGINEER': 'OCE',
      'OFFICE OF THE CITY HEALTH OFFICER': 'OCHO',
      'OFFICE OF THE CITY SOCIAL WELFARE AND DEVELOPMENT OFFICER': 'OCSWDO',
      'OFFICE OF THE CITY TOURISM OFFICER': 'OCTO',
    };
    return officeMap[officeName] || officeName.substring(0, 4).toUpperCase();
  };

  const getPositionDisplayName = (position) => {
    if (!position) return '';
    const abbr = position.office_abbr || getOfficeAbbr(position.office_name || position.name);
    return `${position.name} (${abbr})`;
  };

  const formatSuffixDisplay = (suffix) => {
    if (!suffix) return '';
    if (typeof suffix === 'string') return suffix;
    if (Array.isArray(suffix)) return suffix.join(', ');
    return String(suffix);
  };

  // ==================== POSITION SELECTION ====================
  const isPositionSelected = (id) => {
    const current = Array.isArray(selectedPositions.value) ? selectedPositions.value : [];
    const positionsArray = Array.isArray(positions.value) ? positions.value : [];
    if (id === 'all') {
      return (
        positionsArray.length > 0 &&
        current.filter((p) => p !== 'all').length === positionsArray.length
      );
    }
    return current.includes(id);
  };

  const togglePosition = (id, checked) => {
    const current = Array.isArray(selectedPositions.value) ? selectedPositions.value : [];
    const positionsArray = Array.isArray(positions.value) ? positions.value : [];
    if (id === 'all') {
      selectedPositions.value = checked ? positionsArray.map((p) => p.id) : [];
      return;
    }
    if (checked) {
      if (!current.includes(id)) selectedPositions.value = [...current, id];
    } else {
      selectedPositions.value = current.filter((item) => item !== id);
    }
  };

  const handlePositionSelection = (newSelection) => {
    const safeSelection = Array.isArray(newSelection) ? newSelection : [];
    selectedPositions.value = [...new Set(safeSelection.filter((id) => id !== 'all'))];
  };

  const snapshotPositions = () => {
    positionSnapshot.value = Array.isArray(selectedPositions.value)
      ? [...selectedPositions.value]
      : [];
  };

  const cancelPositionSelect = () => {
    selectedPositions.value = [...positionSnapshot.value];
    positionSelect.value?.hidePopup();
  };

  const closePositionSelect = async () => {
    await nextTick();
    if (positionSelect.value) {
      positionSelect.value.hidePopup?.() ?? positionSelect.value.hide?.();
    }
  };

  // ==================== OFFICE / RATER FETCH ====================
  const fetchEmployeesByOffice = async (officeName) => {
    isLoadingRaters.value = true;
    try {
      const resp = await adminApi.get('/active', { params: { office: officeName } });
      const list = (Array.isArray(resp.data) ? resp.data : [])
        .map((e) => ({
          id: e.ControlNo,
          name: e.Name4,
          Office: e.Office,
          Designation: e.Designation,
          BirthDate: e.BirthDate,
        }))
        .filter((e) => e.id && e.name);
      officeRatersRaw.value = list;
      filteredRatersByOffice.value = list;
      currentOfficeRaters.value = list;
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      toast.error('Failed to load employees for selected office');
    } finally {
      isLoadingRaters.value = false;
    }
  };

  const handleOfficeChange = async (OfficeName) => {
    selectedRater.value = null;
    if (!OfficeName) {
      filteredRatersByOffice.value = [];
      officeRatersRaw.value = [];
      currentOfficeRaters.value = [];
      return;
    }
    await fetchEmployeesByOffice(OfficeName);
  };

  const filterRatersByOffice = (val, update) => {
    if (typeof update !== 'function') return;
    update(() => {
      if (!val) {
        filteredRatersByOffice.value = officeRatersRaw.value;
        return;
      }
      const needle = val.toLowerCase();
      filteredRatersByOffice.value = officeRatersRaw.value.filter((r) =>
        r.name.toLowerCase().includes(needle),
      );
    });
  };

  // ==================== OPEN RATING FORM REPORT ====================
  /**
   * Flow:
   * 1. Check cache by `${jobId}_${raterId}`.
   * 2. On cache hit  → set ratingFormData directly from cache, open dialog.
   * 3. On cache miss → call store.fetchRatingForm(jobId, raterId), cache the result,
   *                    then set ratingFormData and open dialog.
   *
   * The child component <RatingFormReport> receives ratingFormData via :rating-data prop
   * and generates the PDF on its own — the parent never touches pdfmake.
   */
  const openRatingFormReport = async (job) => {
    if (!currentViewRater.value?.id) {
      toast.error('Rater information not available');
      return;
    }

    const jobId = job.job_batches_rsp_id || job.id;
    if (!jobId) {
      toast.error('Job ID not found');
      return;
    }

    const raterId = currentViewRater.value.id;
    const cacheKey = `${jobId}_${raterId}`;
    const cachedData = ratingFormCache.value.get(cacheKey);

    const openWithData = async (data) => {
      selectedJobId.value = jobId;
      selectedRaterId.value = raterId;
      ratingFormData.value = data;
      await nextTick();
      showRatingFormDialog.value = true;
    };

    if (cachedData) {
      await openWithData(cachedData);
      return;
    }

    printingJobId.value = jobId;
    try {
      const data = await ratingFormStore.fetchRatingForm(jobId, raterId);

      // Don't block if no applicants - the report can show "No applicants found"
      if (!data) {
        toast.error('Failed to load rating data');
        return;
      }

      // Cache even if no applicants
      ratingFormCache.value.set(cacheKey, data);
      await openWithData(data);

      // Show info message instead of error
      if (!data?.rating_scores?.length) {
        toast.info('No applicants have been rated for this job yet');
      }
    } catch (error) {
      console.error('Error fetching rating form:', error);
      toast.error(error.response?.data?.message || 'Failed to load rating form');
    } finally {
      printingJobId.value = null;
    }
  };

  // ==================== OPEN EMPTY RATING FORM REPORT ====================
  const openEmptyRatingFormReport = async (job) => {
    if (!currentViewRater.value?.id) {
      toast.error('Rater information not available');
      return;
    }

    const jobId = job.job_batches_rsp_id || job.id;
    if (!jobId) {
      toast.error('Job ID not found');
      return;
    }

    const raterId = currentViewRater.value.id;
    const cacheKey = `${jobId}_${raterId}`;
    const cachedData = emptyRatingFormCache.value.get(cacheKey);

    const openWithData = async (data) => {
      selectedJobId.value = jobId;
      selectedRaterId.value = raterId;
      emptyRatingFormData.value = data;
      await nextTick();
      showEmptyRatingFormDialog.value = true;
    };

    if (cachedData) {
      await openWithData(cachedData);
      return;
    }

    emptyPrintingJobId.value = jobId;
    try {
      const data = await ratingFormStore.fetchEmptyRatingForm(jobId, raterId);

      if (!data) {
        toast.error('Failed to load empty rating form data');
        return;
      }

      emptyRatingFormCache.value.set(cacheKey, data);
      await openWithData(data);
    } catch (error) {
      console.error('Error fetching empty rating form:', error);
      toast.error(error.response?.data?.message || 'Failed to load empty rating form');
    } finally {
      emptyPrintingJobId.value = null;
    }
  };

  const handleRatingFormClose = () => {
    showRatingFormDialog.value = false;
    // ratingFormData is intentionally kept so the cache still works if the dialog reopens
  };

  const handleEmptyRatingFormClose = () => {
    showEmptyRatingFormDialog.value = false;
    // emptyRatingFormData is intentionally kept so the cache still works if the dialog reopens
  };

  // ==================== FORM HELPERS ====================
  const resetForm = () => {
    selectedPositions.value = [];
    selectedRater.value = null;
    selectedOffice.value = '';
    filteredRatersByOffice.value = [];
    officeRatersRaw.value = [];
    currentRaterId.value = null;
    currentRaterName.value = '';
    currentRaterOffice.value = '';
    currentOfficeRaters.value = [];
    showError.value = false;
    activeStatus.value = true;
    enable.value = false;
    representative.value = '';
    selectedRole.value = null;
    selectedPrefix.value = '';
    selectedSuffix.value = '';
  };

  const closeModal = () => {
    showModal.value = false;
    resetForm();
    isEditMode.value = false;
    loadPositions();
  };

  const showAddModal = () => {
    if (!canModifyRater.value) {
      toast.warning('You do not have permission to add raters');
      return;
    }
    isEditMode.value = false;
    showModal.value = true;
    resetForm();
    activeStatus.value = true;
    enable.value = false;
    loadPositions();
  };

  const loadPositions = () => {
    // Safely get jobPosts array - could be array or object
    let jobPostsArray = [];

    if (Array.isArray(jobPostStore.jobPosts)) {
      jobPostsArray = jobPostStore.jobPosts;
    } else if (jobPostStore.jobPosts && typeof jobPostStore.jobPosts === 'object') {
      // If it's an object, try to extract the array from common properties
      jobPostsArray =
        jobPostStore.jobPosts.data ||
        jobPostStore.jobPosts.items ||
        jobPostStore.jobPosts.results ||
        [];
    }

    positions.value = jobPostsArray.map((post) => ({
      id: post.id,
      name: post.Position,
      office_abbr: post.office_abbr || getOfficeAbbr(post.Office),
      office_name: post.Office,
    }));
  };

  // ==================== VIEW RATER ====================
  const viewRater = async (rater) => {
    currentViewRater.value = {
      id: rater.id,
      name: rater.name,
      position: rater.Position || 'N/A',
      office: rater.office,
      status: rater.status,
      representative: rater.representative || rater.representation || '',
      role: rater.role || rater.role_type || '',
      prefix: rater.prefix || '',
      suffix: rater.suffix || '',
    };

    isLoadingJobs.value = true;
    jobLoadError.value = '';
    raterJobs.value = [];
    pagination.value.page = 1;
    showViewDialog.value = true;

    try {
      // Call the API to get jobs for this rater
      const response = await jobPostStore.assign_job_list(rater.id);

      // Check where the data is actually stored
      // Option 1: If the store returns the data directly
      if (response && response.data) {
        raterJobs.value = Array.isArray(response.data) ? response.data : [];
      }
      // Option 2: If the store stores it in a specific property
      else if (jobPostStore.assignedJobs) {
        raterJobs.value = Array.isArray(jobPostStore.assignedJobs) ? jobPostStore.assignedJobs : [];
      }
      // Option 3: If it's stored in jobPosts (your original approach but cleaner)
      else if (jobPostStore.jobPosts) {
        // Handle different possible structures
        if (Array.isArray(jobPostStore.jobPosts)) {
          raterJobs.value = jobPostStore.jobPosts;
        } else if (
          jobPostStore.jobPosts.job_batches_rsp &&
          Array.isArray(jobPostStore.jobPosts.job_batches_rsp)
        ) {
          raterJobs.value = jobPostStore.jobPosts.job_batches_rsp;
        } else {
          raterJobs.value = [];
        }
      } else {
        raterJobs.value = [];
      }

      // Validate we got data
      if (raterJobs.value.length === 0) {
        jobLoadError.value = 'No jobs assigned to this rater';
      }

      pagination.value.rowsNumber = raterJobs.value.length;
    } catch (error) {
      console.error('Error fetching rater jobs:', error);
      jobLoadError.value = error.response?.data?.message || 'Failed to load assigned jobs';
      toast.error('Failed to load assigned jobs for this rater');
      raterJobs.value = [];
    } finally {
      isLoadingJobs.value = false;
    }
  };

  // ==================== EDIT RATER ====================
  const editRater = async (rater) => {
    if (!canModifyRater.value) {
      toast.warning('You do not have permission to edit raters');
      return;
    }

    try {
      isEditMode.value = true;
      currentRaterId.value = rater.id;
      currentRaterName.value = rater.name;
      activeStatus.value = !!rater.active;
      enable.value = !!rater.enable;
      representative.value = rater.representative || rater.representation || '';
      selectedRole.value = rater.role_type || rater.role || '';
      selectedOffice.value = rater.office || '';
      selectedPrefix.value = rater.prefix || '';

      if (rater.suffix) {
        if (Array.isArray(rater.suffix)) {
          selectedSuffix.value = rater.suffix.join(', ');
        } else if (typeof rater.suffix === 'string') {
          selectedSuffix.value = rater.suffix;
        } else {
          selectedSuffix.value = '';
        }
      } else {
        selectedSuffix.value = '';
      }

      if (selectedOffice.value) {
        await fetchEmployeesByOffice(selectedOffice.value);
        currentOfficeRaters.value = officeRatersRaw.value;
      }

      await jobPostStore.fetchJobPostListEdit(rater.id);
      positions.value = (jobPostStore.jobPostListEdit || []).map((post) => ({
        id: post.id,
        name: post.Position,
        office_abbr: post.office_abbr || getOfficeAbbr(post.Office),
        office_name: post.Office,
      }));

      const jobBatchesArray = Array.isArray(rater.job_batches_rsp) ? rater.job_batches_rsp : [];
      selectedPositions.value = jobBatchesArray.map((job) => job.id).filter(Boolean);
      showModal.value = true;
    } catch (error) {
      console.error('Error setting up edit mode:', error);
      toast.error('Failed to prepare edit form');
    }
  };

  // ==================== UPDATE RATER ====================
  const updateRater = async () => {
    if (!selectedOffice.value || !selectedRole.value) {
      showError.value = true;
      return;
    }

    showError.value = false;
    isSubmitting.value = true;

    try {
      const raterId = currentRaterId.value;
      if (!raterId) throw new Error('No rater selected for editing');

      const safePositions = Array.isArray(selectedPositions.value) ? selectedPositions.value : [];
      let processedSuffix = selectedSuffix.value;
      if (typeof selectedSuffix.value === 'string' && selectedSuffix.value.includes(',')) {
        processedSuffix = selectedSuffix.value
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
      }

      const userData = {
        job_batches_rsp_id: safePositions.filter((id) => id !== 'all'),
        Office: selectedOffice.value,
        active: activeStatus.value,
        enable: enable.value,
        representative: representative.value,
        role: selectedRole.value,
        prefix: selectedPrefix.value || null,
        suffix: processedSuffix || null,
      };

      const result = await authStore.rater_edit(raterId, userData);
      if (result.success) {
        await loadRaters();
        closeModal();
        toast.success('Rater updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update rater');
      }
    } catch (error) {
      console.error('Error updating rater:', error);
      toast.error(error.message || 'Failed to update rater');
    } finally {
      isSubmitting.value = false;
    }
  };

  // ==================== ADD RATER ====================
  const addRater = async () => {
    if (!selectedOffice.value || !selectedRater.value || !selectedRole.value) {
      showError.value = true;
      return;
    }

    showError.value = false;
    isSubmitting.value = true;

    try {
      const raterData = officeRatersRaw.value.find((r) => r.id === selectedRater.value);
      if (!raterData) throw new Error('Rater data not found');

      const safePositions = Array.isArray(selectedPositions.value) ? selectedPositions.value : [];
      const jobBatchIds = safePositions.filter((id) => id !== 'all');
      let processedSuffix = selectedSuffix.value;
      if (typeof selectedSuffix.value === 'string' && selectedSuffix.value.includes(',')) {
        processedSuffix = selectedSuffix.value
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
      }

      const userData = {
        name: raterData.name,
        controlNo: raterData.id,
        BirthDate: raterData.BirthDate || '',
        Designation: raterData.Designation || '',
        job_batches_rsp_id: jobBatchIds,
        Office: selectedOffice.value,
        active: activeStatus.value,
        enable: enable.value,
        representative: representative.value,
        role: selectedRole.value,
        prefix: selectedPrefix.value || null,
        suffix: processedSuffix || null,
      };

      const result = await authStore.Rater_register(userData);
      if (result.success) {
        await loadRaters();
        closeModal();
        toast.success('Rater added successfully');
      } else {
        // Error message already shown in store, just log
        console.error('Registration failed:', result.message);
      }
    } catch (error) {
      console.error('Error adding rater:', error);
      // Check if there's a response with a message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add rater';
      const errors = error.response?.data?.errors;

      if (errors && errors.username) {
        toast.error(errors.username[0]);
      } else {
        toast.error(errorMessage);
      }
      showError.value = true;
    } finally {
      isSubmitting.value = false;
    }
  };

  // ==================== LOAD / DELETE ====================
  const loadRaters = async () => {
    isLoadingTable.value = true;
    try {
      await authStore.get_all_raters();
      raters.value = authStore.users || [];
    } catch (error) {
      console.error('Error loading raters:', error);
      toast.error('Failed to load raters');
      raters.value = [];
    } finally {
      isLoadingTable.value = false;
    }
  };

  const deleteRater = () => {
    raters.value = raters.value.filter((r) => r.id !== raterToDelete.value);
    showDeleteDialog.value = false;
    raterToDelete.value = null;
  };

  // ==================== LIFECYCLE ====================
  onMounted(async () => {
    isLoadingTable.value = true;
    try {
      await Promise.all([
        jobPostStore.job_post_list(),
        loadRaters(),
        plantillaStore.fetch_office_rater(),
      ]);
    } catch (error) {
      console.error('Initialization error:', error);
      toast.error('Failed to load initial data');
    } finally {
      isLoadingTable.value = false;
    }

    loadPositions();

    if (Array.isArray(plantillaStore.office) && plantillaStore.office.length > 0) {
      const names = Array.from(
        new Set(
          plantillaStore.office
            .map((row) => (typeof row === 'string' ? row : row?.Office || row?.office || row?.name))
            .filter(Boolean),
        ),
      );
      offices.value = names.map((name) => ({ label: name, value: name }));
    }
  });

  watch(showModal, (val) => {
    if (val && !isEditMode.value) {
      activeStatus.value = true;
      enable.value = false;
    }
  });
</script>

<style scoped>
  .q-table {
    width: 100%;
  }

  .sticky-header-table .q-table__top,
  .sticky-header-table .q-table__bottom,
  .sticky-header-table thead tr:first-child th {
    background-color: white;
  }

  .sticky-header-table thead tr th {
    position: sticky;
    z-index: 1;
  }

  .sticky-header-table thead tr:first-child th {
    top: 0;
  }

  .no-horizontal-scroll {
    table-layout: fixed;
    width: 100%;
  }

  .no-horizontal-scroll th,
  .no-horizontal-scroll td {
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
  }

  .position-column {
    width: 30%;
    max-width: 300px;
  }

  .office-column {
    width: 35%;
    max-width: 350px;
  }

  .full-position-text,
  .full-office-text {
    white-space: normal;
    word-break: break-word;
    line-height: 1.4;
    padding: 2px 0;
    width: 100%;
  }

  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .sticky-info {
    position: sticky;
    top: 65px;
    z-index: 2;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .scrollable-content {
    flex-grow: 1;
    overflow-y: auto;
    max-height: calc(80vh - 200px);
  }

  .sticky-footer {
    position: sticky;
    bottom: 0;
    background: white;
    z-index: 2;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
</style>
