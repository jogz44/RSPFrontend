<template>
  <q-dialog v-model="localShow" persistent @show="onModalShow">
    <q-card class="qualification-modal" :style="modalCardStyle">
      <!-- ── Header ── -->
      <q-card-section class="row justify-between items-center header text-black q-px-md q-py-sm">
        <div>
          <div class="text-h5 text-bold">Qualification Standard (QS)</div>
          <div class="text-subtitle1">Application Information</div>
        </div>
        <q-btn icon="close" flat round dense @click="onClose" />
      </q-card-section>

      <!-- ── Loading ── -->
      <q-card-section
        v-if="isLoadingPDS"
        style="height: 70vh"
        class="column items-center justify-center"
      >
        <q-spinner-dots size="40px" color="primary" />
        <div class="q-mt-sm text-grey">Loading PDS data...</div>
      </q-card-section>

      <!-- ── Main Content ── -->
      <q-card-section v-else class="main-content-section">
        <div class="content-layout">
          <!-- ── Left: Applicant Info ── -->
          <q-card class="applicant-card q-mr-md">
            <q-card-section class="column justify-between items-center q-pa-md">
              <q-img
                :src="applicantImageUrl || applicantData?.image_url || 'https://placehold.co/100'"
                class="bg-grey-4 q-mb-md"
                style="width: 100px; height: 100px; border-radius: 10px; flex-shrink: 0"
                alt="Applicant Photo"
              />

              <div class="text-body text-bold text-center q-mb-xs">
                {{ applicantFullName }}
              </div>

              <div class="full-width">
                <div class="text-center q-mb-md">
                  <div class="text-caption text-grey-7 q-mb-xs">Applied Position</div>
                  <div class="text-body2 text-bold">
                    {{ applicantData?.position || 'Office of the ...' }}
                  </div>
                </div>
              </div>

              <q-btn class="q-mt-md" label="View PDS" color="primary" rounded @click="onViewPDS" />
            </q-card-section>
          </q-card>

          <!-- ── Right: Tabs ── -->
          <q-card class="tabs-card">
            <!-- Tabs Header Row -->
            <div class="row justify-between items-center q-px-md tabs-header-row">
              <q-tabs
                v-model="tab"
                dense
                class="text-grey-8"
                active-color="primary"
                indicator-color="primary"
                align="left"
                style="min-height: 40px"
              >
                <q-tab name="education" label="EDUCATION" class="text-weight-medium qs-tab" />
                <q-tab name="experience" label="EXPERIENCE" class="text-weight-medium qs-tab" />
                <q-tab name="training" label="TRAINING" class="text-weight-medium qs-tab" />
                <q-tab name="eligibility" label="ELIGIBILITY" class="text-weight-medium qs-tab" />
              </q-tabs>

              <div class="row q-gutter-sm doc-btn-row">
                <!-- WES button: only show when applicant has a ControlNo -->
                <q-btn
                  v-if="applicantControlNumber"
                  icon="work_history"
                  label="WES"
                  color="green-9"
                  rounded
                  style="font-size: 8pt"
                  @click="showWES"
                />
                <q-btn
                  icon="folder_open"
                  label="Docs"
                  color="orange-9"
                  rounded
                  style="font-size: 8pt"
                  @click="showSupportingDocs"
                />
              </div>
            </div>

            <q-separator />

            <!-- ── Tab Panels ── -->
            <q-tab-panels v-model="tab" class="q-pa-none tab-panels-scroll">
              <!-- ═══════════════════════════════════════════════════════════
                   EDUCATION
              ════════════════════════════════════════════════════════════ -->
              <q-tab-panel
                name="education"
                class="column q-pa-sm no-wrap full-height"
                style="display: flex; flex-direction: column; gap: 8px"
              >
                <div style="flex: 0 0 auto; min-height: 80px">
                  <div class="text-subtitle3 text-bold q-mb-xs">
                    Position Qualification Standard
                  </div>
                  <div class="qs-info-box">
                    <div class="text-bold" v-if="positionQS.length && positionQS[0].Education">
                      {{ positionQS[0].Education }}
                    </div>
                    <div class="text-grey" v-else>No qualification standards available</div>
                  </div>
                </div>

                <div style="flex: 1; overflow: hidden; min-height: 0">
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-subtitle3 text-bold">Applicant Education</div>
                    <q-badge
                      color="primary"
                      class="q-px-sm q-py-xs"
                      :label="`${selectedEducationIds.length} selected`"
                    />
                  </div>
                  <q-scroll-area style="height: calc(100% - 28px); min-height: 100px">
                    <q-table
                      :rows="formattedEducation"
                      :columns="xEduCol"
                      row-key="uniqueId"
                      wrap-cells
                      flat
                      bordered
                      class="bold-table"
                    >
                      <template v-slot:header-cell-select="props">
                        <q-th :props="props">
                          <q-checkbox
                            :model-value="isAllEducationSelected"
                            disable
                            dense
                            indeterminate-value="some"
                          />
                        </q-th>
                      </template>
                      <template v-slot:body-cell-select="props">
                        <q-td :props="props" class="text-center">
                          <q-checkbox
                            :model-value="selectedEducationIds.includes(props.row.uniqueId)"
                            disable
                            dense
                          />
                        </q-td>
                      </template>
                      <template v-slot:no-data>
                        <div class="full-width row flex-center q-pa-md text-grey">
                          <q-icon name="info" size="24px" class="q-mr-sm" />
                          No education records found
                        </div>
                      </template>
                    </q-table>
                  </q-scroll-area>
                </div>

                <!-- EDUCATION REMARK (Readonly) -->
                <div style="flex: 0 0 auto">
                  <q-input
                    v-model="xData.education_remark"
                    label="Remarks"
                    outlined
                    dense
                    readonly
                    bg-color="grey-3"
                    class="modern-input"
                  />
                </div>
              </q-tab-panel>

              <!-- ═══════════════════════════════════════════════════════════
                   EXPERIENCE
              ════════════════════════════════════════════════════════════ -->
              <q-tab-panel
                name="experience"
                class="column q-pa-sm no-wrap full-height"
                style="display: flex; flex-direction: column; gap: 8px"
              >
                <div style="flex: 0 0 auto; min-height: 80px">
                  <div class="text-subtitle3 text-bold q-mb-xs">
                    Position Qualification Standard
                  </div>
                  <div class="qs-info-box">
                    <div class="text-bold" v-if="positionQS.length && positionQS[0].Experience">
                      {{ positionQS[0].Experience }}
                    </div>
                    <div class="text-grey" v-else>No qualification standards available</div>
                  </div>
                </div>

                <div style="flex: 1; overflow: hidden; min-height: 0">
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-subtitle3 text-bold">Applicant Experience</div>
                    <div class="row items-center q-gutter-sm">
                      <q-badge
                        color="green"
                        class="q-px-sm q-py-xs"
                        :label="formatTotalExperience(totalSelectedExperienceMonths)"
                      />
                      <q-tooltip class="bg-white text-dark shadow-4">
                        <div class="q-pa-sm">
                          <div class="text-weight-bold q-mb-xs">
                            Experience Breakdown (Selected Only):
                          </div>
                          <div v-if="experienceWithDuration.length === 0" class="text-grey-6">
                            No experience records found
                          </div>
                          <div v-else>
                            <div
                              v-for="exp in experienceWithDuration"
                              :key="exp.uniqueId"
                              class="text-caption q-mb-xs"
                            >
                              <q-checkbox
                                :model-value="selectedExperienceIds.includes(exp.uniqueId)"
                                disable
                                dense
                                size="sm"
                                class="q-mr-xs"
                              />
                              <span class="text-weight-medium">
                                {{ exp.position_title || 'Untitled Position' }}
                              </span>
                              <div class="text-grey-7">
                                {{ formatDateRange(exp.work_date_from, exp.work_date_to) }}
                              </div>
                              <div
                                v-if="selectedExperienceIds.includes(exp.uniqueId)"
                                class="text-primary"
                              >
                                Duration: {{ exp.durationText }}
                              </div>
                              <q-separator class="q-my-xs" />
                            </div>
                            <div class="text-weight-bold q-mt-sm">
                              Total Experience (Selected):
                              {{ formatTotalExperience(totalSelectedExperienceMonths) }}
                            </div>
                          </div>
                        </div>
                      </q-tooltip>
                    </div>
                  </div>
                  <q-scroll-area style="height: calc(100% - 28px); min-height: 100px">
                    <q-table
                      :rows="experienceWithDuration"
                      :columns="xExperienceCol"
                      row-key="uniqueId"
                      :pagination="{ rowsPerPage: 5 }"
                      wrap-cells
                      class="bold-table"
                    >
                      <template v-slot:header-cell-select="props">
                        <q-th :props="props">
                          <q-checkbox
                            :model-value="isAllExperienceSelected"
                            disable
                            dense
                            indeterminate-value="some"
                          />
                        </q-th>
                      </template>
                      <template v-slot:body-cell-select="props">
                        <q-td :props="props">
                          <q-checkbox
                            :model-value="selectedExperienceIds.includes(props.row.uniqueId)"
                            disable
                            dense
                          />
                        </q-td>
                      </template>
                      <template v-slot:body-cell-work_date_to="props">
                        <q-td :props="props">
                          <span v-if="props.row.work_date_to?.toLowerCase() === 'present'">
                            <q-badge color="primary">Present</q-badge>
                          </span>
                          <span v-else>{{ props.row.work_date_to || '' }}</span>
                        </q-td>
                      </template>
                      <template v-slot:body-cell-monthlySalary="props">
                        <q-td :props="props">{{ formatSalary(props.row.monthly_salary) }}</q-td>
                      </template>
                      <template v-slot:body-cell-duration="props">
                        <q-td :props="props" class="text-center">
                          <q-badge
                            v-if="selectedExperienceIds.includes(props.row.uniqueId)"
                            :color="props.row.durationMonths > 0 ? 'positive' : 'grey'"
                            :label="props.row.durationText"
                            class="q-px-xs"
                          />
                          <q-badge
                            v-else
                            color="grey-7"
                            :label="props.row.durationText"
                            class="q-px-xs"
                          />
                        </q-td>
                      </template>
                      <template v-slot:no-data>
                        <div class="full-width row flex-center q-pa-md text-grey">
                          <q-icon name="info" size="24px" class="q-mr-sm" />
                          No experience records found
                        </div>
                      </template>
                    </q-table>
                  </q-scroll-area>
                </div>

                <!-- EXPERIENCE REMARK (Readonly) -->
                <div style="flex: 0 0 auto">
                  <q-input
                    v-model="xData.experience_remark"
                    label="Remarks"
                    outlined
                    dense
                    readonly
                    bg-color="grey-3"
                    class="modern-input"
                  />
                </div>
              </q-tab-panel>

              <!-- ═══════════════════════════════════════════════════════════
                   TRAINING
              ════════════════════════════════════════════════════════════ -->
              <q-tab-panel
                name="training"
                class="column q-pa-sm no-wrap full-height"
                style="display: flex; flex-direction: column; gap: 8px"
              >
                <div style="flex: 0 0 auto; min-height: 80px">
                  <div class="text-subtitle3 text-bold q-mb-xs">
                    Position Qualification Standard
                  </div>
                  <div class="qs-info-box">
                    <div class="text-bold" v-if="positionQS.length && positionQS[0].Training">
                      {{ positionQS[0].Training }}
                    </div>
                    <div class="text-grey" v-else>No qualification standards available</div>
                  </div>
                </div>

                <div style="flex: 1; overflow: hidden; min-height: 0">
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-subtitle3 text-bold">Applicant Training</div>
                    <div class="row items-center q-gutter-sm">
                      <q-badge
                        color="primary"
                        class="q-px-sm q-py-xs"
                        :label="`Total Hours: ${totalSelectedTrainingHours}`"
                      />
                      <q-tooltip class="bg-white text-dark shadow-4">
                        <div class="q-pa-sm">
                          <div class="text-weight-bold q-mb-xs">
                            Training Hours Breakdown (Selected Only):
                          </div>
                          <div v-if="xTraining.length === 0" class="text-grey-6">
                            No training records found
                          </div>
                          <div v-else>
                            <div
                              v-for="training in xTraining"
                              :key="training.uniqueId"
                              class="text-caption q-mb-xs"
                            >
                              <q-checkbox
                                :model-value="selectedTrainingIds.includes(training.uniqueId)"
                                disable
                                dense
                                size="sm"
                                class="q-mr-xs"
                              />
                              <span class="text-weight-medium">
                                {{ training.training_title || 'Untitled Training' }}:
                              </span>
                              <span
                                v-if="selectedTrainingIds.includes(training.uniqueId)"
                                class="text-primary"
                              >
                                {{ parseTrainingHours(training.number_of_hours) }} hours
                              </span>
                              <span v-else class="text-grey-6">
                                {{ parseTrainingHours(training.number_of_hours) }}
                              </span>
                            </div>
                            <q-separator class="q-my-xs" />
                            <div class="text-weight-bold">
                              Total (Selected): {{ totalSelectedTrainingHours }} hours
                            </div>
                          </div>
                        </div>
                      </q-tooltip>
                    </div>
                  </div>
                  <q-scroll-area style="height: calc(100% - 28px); min-height: 100px">
                    <q-table
                      :rows="xTraining"
                      :columns="xTrainingCol"
                      row-key="uniqueId"
                      :pagination="{ rowsPerPage: 5 }"
                      wrap-cells
                      class="bold-table"
                    >
                      <template v-slot:header-cell-select="props">
                        <q-th :props="props">
                          <q-checkbox
                            :model-value="isAllTrainingSelected"
                            disable
                            dense
                            indeterminate-value="some"
                          />
                        </q-th>
                      </template>
                      <template v-slot:body-cell-select="props">
                        <q-td :props="props">
                          <q-checkbox
                            :model-value="selectedTrainingIds.includes(props.row.uniqueId)"
                            disable
                            dense
                          />
                        </q-td>
                      </template>
                      <template v-slot:body-cell-hours="props">
                        <q-td :props="props" class="text-center">
                          <q-badge
                            v-if="selectedTrainingIds.includes(props.row.uniqueId)"
                            :color="
                              parseTrainingHours(props.row.number_of_hours) > 0
                                ? 'positive'
                                : 'grey'
                            "
                            :label="parseTrainingHours(props.row.number_of_hours)"
                          />
                          <q-badge
                            v-else
                            color="grey-7"
                            :label="parseTrainingHours(props.row.number_of_hours)"
                            class="q-px-xs"
                          />
                        </q-td>
                      </template>
                      <template v-slot:no-data>
                        <div class="full-width row flex-center q-pa-md text-grey">
                          <q-icon name="info" size="24px" class="q-mr-sm" />
                          No training records found
                        </div>
                      </template>
                    </q-table>
                  </q-scroll-area>
                </div>

                <!-- TRAINING REMARK (Readonly) -->
                <div style="flex: 0 0 auto">
                  <q-input
                    v-model="xData.training_remark"
                    label="Remarks"
                    outlined
                    dense
                    readonly
                    bg-color="grey-3"
                    class="modern-input"
                  />
                </div>
              </q-tab-panel>

              <!-- ═══════════════════════════════════════════════════════════
                   ELIGIBILITY
              ════════════════════════════════════════════════════════════ -->
              <q-tab-panel
                name="eligibility"
                class="column q-pa-sm no-wrap full-height"
                style="display: flex; flex-direction: column; gap: 8px"
              >
                <div style="flex: 0 0 auto; min-height: 80px">
                  <div class="text-subtitle3 text-bold q-mb-xs">
                    Position Qualification Standard
                  </div>
                  <div class="qs-info-box">
                    <div class="text-bold" v-if="positionQS.length && positionQS[0].Eligibility">
                      {{ positionQS[0].Eligibility }}
                    </div>
                    <div class="text-grey" v-else>No qualification standards available</div>
                  </div>
                </div>

                <div style="flex: 1; overflow: hidden; min-height: 0">
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-subtitle3 text-bold">Applicant Eligibility</div>
                    <q-badge
                      color="primary"
                      class="q-px-sm q-py-xs"
                      :label="`${selectedEligibilityIds.length} selected`"
                    />
                  </div>
                  <q-scroll-area style="height: calc(100% - 28px); min-height: 100px">
                    <q-table
                      :rows="xEligibility"
                      :columns="xEligibilityCol"
                      row-key="uniqueId"
                      :pagination="{ rowsPerPage: 5 }"
                      wrap-cells
                      class="bold-table"
                    >
                      <template v-slot:header-cell-select="props">
                        <q-th :props="props">
                          <q-checkbox
                            :model-value="isAllEligibilitySelected"
                            disable
                            dense
                            indeterminate-value="some"
                          />
                        </q-th>
                      </template>
                      <template v-slot:body-cell-select="props">
                        <q-td :props="props">
                          <q-checkbox
                            :model-value="selectedEligibilityIds.includes(props.row.uniqueId)"
                            disable
                            dense
                          />
                        </q-td>
                      </template>
                      <template v-slot:body-cell-rating="props">
                        <q-td :props="props" class="text-center">
                          {{ formatRating(props.row.rating) }}
                        </q-td>
                      </template>
                      <template v-slot:no-data>
                        <div class="full-width row flex-center q-pa-md text-grey">
                          <q-icon name="info" size="24px" class="q-mr-sm" />
                          No eligibility records found
                        </div>
                      </template>
                    </q-table>
                  </q-scroll-area>
                </div>

                <!-- ELIGIBILITY REMARK (Readonly) -->
                <div style="flex: 0 0 auto">
                  <q-input
                    v-model="xData.eligibility_remark"
                    label="Remarks"
                    outlined
                    dense
                    readonly
                    bg-color="grey-3"
                    class="modern-input"
                  />
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </q-card-section>

      <!-- ── Sub-Modals ── -->
      <SupportingDocumentsModal
        v-model:show="showSupportingDocsModal"
        :applicant-name="applicantData?.name || 'Unknown Applicant'"
        :supporting-documents="supportingDocuments"
      />

      <WESModal v-model:show="showWESModal" :ControlNo="applicantControlNumber" />

      <!-- ── Footer Actions (Simplified - No Radio buttons) ── -->
      <q-card-section class="footer-actions bg-grey-2 q-py-sm">
        <div class="row justify-end items-center flex-wrap q-gutter-sm">
          <div class="row justify-end">
            <q-btn label="CLOSE" color="grey" @click="onClose" class="q-mx-sm" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <PDSModalApplicant v-model="showPDSModal" :applicant="applicantData" />
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { usePlantillaStore } from 'stores/plantillaStore';
  import { useAuthStore } from 'stores/authStore';
  import { useJobPostStore } from 'stores/jobPostStore';
  import PDSModalApplicant from './PDSModalApplicant.vue';
  import SupportingDocumentsModal from './SuppDocs.vue';
  import WESModal from './WESModal.vue';

  // ── State ────────────────────────────────────────────────────────────────────

  const xData = ref({
    education_remark: '',
    training_remark: '',
    experience_remark: '',
    eligibility_remark: '',
  });
  const xEdu = ref([]);
  const xEligibility = ref([]);
  const xExperience = ref([]);
  const xTraining = ref([]);
  const isLoadingPDS = ref(false);

  const selectedEducationIds = ref([]);
  const selectedExperienceIds = ref([]);
  const selectedTrainingIds = ref([]);
  const selectedEligibilityIds = ref([]);

  const showPDSModal = ref(false);
  const showSupportingDocsModal = ref(false);
  const showWESModal = ref(false);
  const supportingDocuments = ref({
    training_images: [],
    education_images: [],
    eligibility_images: [],
    experience_images: [],
  });

  // ── Stores ────────────────────────────────────────────────────────────────────

  const authStore = useAuthStore();
  const jobPostStore = useJobPostStore();
  const usePlantilla = usePlantillaStore();

  // ── Props / Emits ─────────────────────────────────────────────────────────────

  const props = defineProps({
    show: Boolean,
    isPlantilla: { type: Boolean, default: false },
    variant: {
      type: String,
      default: 'employee',
      validator: (v) => ['employee', 'applicant'].includes(v),
    },
    applicantData: Object,
    positionRequirements: Object,
    isSubmitted: Boolean,
    education: { type: Array, default: () => [] },
  });

  const emit = defineEmits(['update:show', 'view-pds', 'close']);

  // ── Dialog sync ───────────────────────────────────────────────────────────────

  const localShow = ref(props.show);
  watch(
    () => props.show,
    (v) => {
      localShow.value = v;
    },
  );
  watch(localShow, (v) => {
    emit('update:show', v);
  });

  // ── Responsive modal size ──────────────────────────────────────────────────────

  const modalCardStyle = computed(() => ({
    width: '1800px',
    maxWidth: '98vw',
    height: '90vh',
    maxHeight: '96vh',
    display: 'flex',
    flexDirection: 'column',
  }));

  // ── Computed helpers ──────────────────────────────────────────────────────────

  const tab = ref('education');
  const applicantImageUrl = ref('');

  /**
   * ControlNo — only Internal applicants have a control number.
   * The WES button is conditionally rendered based on this value.
   */
  const applicantControlNumber = computed(() => {
    return (
      props.applicantData?.control_number ||
      props.applicantData?.application_number ||
      props.applicantData?.controlNo ||
      props.applicantData?.ControlNo ||
      props.applicantData?.controlno ||
      ''
    );
  });

  // ── Mapping helpers ───────────────────────────────────────────────────────────

  const readSelectionFrom = (source, variants = []) => {
    if (!source) return null;
    for (const key of variants) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const v = source[key];
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') {
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) return parsed;
          } catch {
            const splitted = v
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            if (splitted.length) return splitted;
          }
        }
        if (v === null) return null;
      }
    }
    return undefined;
  };

  const mapServerSelectionToRowIds = (selectionFromServer, rows) => {
    if (!selectionFromServer || !Array.isArray(selectionFromServer) || !rows) return null;
    const serverSet = new Set(selectionFromServer.map((v) => String(v).trim()));
    const result = [];
    const seen = new Set();
    for (const r of rows) {
      const idStr = String(r.id || r.uniqueId).trim();
      const uidStr = String(r.uniqueId || r.id).trim();
      if ((serverSet.has(idStr) || serverSet.has(uidStr)) && !seen.has(uidStr)) {
        result.push(r.uniqueId);
        seen.add(uidStr);
      }
    }
    return result.length ? result : null;
  };

  const mapEducationData = (eduArray) => {
    if (!eduArray || !Array.isArray(eduArray)) return [];
    return eduArray.map((e, index) => {
      const id = e.id || e.uniqueId || `education_${index}`;
      return {
        id,
        uniqueId: id,
        level: e.level || e.Education || '',
        school_name: e.school_name || e.School || '',
        degree: e.degree || e.Degree || '',
        attendance_from: e.attendance_from || e.DateAttend?.split('-')[0]?.trim() || '',
        attendance_to: e.attendance_to || e.DateAttend?.split('-')[1]?.trim() || '',
        highest_units: e.highest_units || e.NumUnits || '',
        year_graduated: e.year_graduated || e.DateAttend?.split('-')[1]?.trim() || '',
        scholarship: e.scholarship || e.Honors || '',
      };
    });
  };

  const mapEligibilityData = (eligArray) => {
    if (!eligArray || !Array.isArray(eligArray)) return [];
    return eligArray.map((e, index) => {
      const id = e.id || e.uniqueId || `eligibility_${index}`;
      return {
        id,
        uniqueId: id,
        eligibility: e.eligibility || e.CivilServe || '',
        rating: e.rating || e.Rates || '',
        date_of_examination: e.date_of_examination || e.Dates || '',
        place_of_examination: e.place_of_examination || e.Place || '',
        license_number: e.license_number || e.LNumber || '',
        date_of_validity: e.date_of_validity || e.LDate || '',
      };
    });
  };

  const mapExperienceData = (expArray) => {
    if (!expArray || !Array.isArray(expArray)) return [];
    return expArray.map((e, index) => {
      const id = e.id || e.uniqueId || `experience_${index}`;
      let salaryValue = '';
      if (e.WSalary) {
        const numericValue = e.WSalary.toString().replace(/[₱,]/g, '').trim();
        salaryValue = parseFloat(numericValue) || '';
      } else if (e.monthly_salary) {
        salaryValue = e.monthly_salary;
      }
      return {
        id,
        uniqueId: id,
        work_date_from: e.work_date_from || e.WFrom || '',
        work_date_to: e.work_date_to || e.WTo || '',
        position_title: e.position_title || e.WPosition || '',
        department: e.department || e.WCompany || '',
        monthly_salary: salaryValue,
        salary_grade: e.salary_grade || e.WGrade || '',
        status_of_appointment: e.status_of_appointment || e.Status || '',
        government_service: e.government_service || e.WGov || '',
      };
    });
  };

  const mapTrainingData = (trainArray) => {
    if (!trainArray || !Array.isArray(trainArray)) return [];
    return trainArray.map((t, index) => {
      const id = t.id || t.uniqueId || `training_${index}_${Date.now()}`;
      return {
        id,
        uniqueId: id,
        training_title: t.training_title || t.Training || '',
        inclusive_date_from: t.inclusive_date_from || t.DateFrom || '',
        inclusive_date_to: t.inclusive_date_to || t.DateTo || '',
        number_of_hours: t.number_of_hours || t.NumHours || '0',
        type: t.type || '',
        conducted_by: t.conducted_by || t.Conductor || '',
      };
    });
  };

  // ── Select all / toggle helpers (kept for display but not used for interaction) ──

  const isAllEducationSelected = computed(
    () =>
      formattedEducation.value.length > 0 &&
      selectedEducationIds.value.length === formattedEducation.value.length,
  );

  const isAllExperienceSelected = computed(
    () =>
      experienceWithDuration.value.length > 0 &&
      selectedExperienceIds.value.length === experienceWithDuration.value.length,
  );

  const isAllTrainingSelected = computed(
    () => xTraining.value.length > 0 && selectedTrainingIds.value.length === xTraining.value.length,
  );

  const isAllEligibilitySelected = computed(
    () =>
      xEligibility.value.length > 0 &&
      selectedEligibilityIds.value.length === xEligibility.value.length,
  );

  // ── Date / Duration helpers ───────────────────────────────────────────────────

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      const dt = new Date(year, month - 1, day);
      if (!isNaN(dt.getTime()) && dt.getDate() === day && dt.getMonth() === month - 1) {
        return dt;
      }
    }
    const dt = new Date(dateString);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const calculateExactDuration = (startDate, endDate, applicationDate = null) => {
    if (!startDate) return { years: 0, months: 0, days: 0 };

    const start = parseDate(startDate);
    if (!start) return { years: 0, months: 0, days: 0 };

    let end;

    if (endDate && typeof endDate === 'string' && endDate.toLowerCase() === 'present') {
      end = applicationDate ? parseDate(applicationDate) : new Date();
    } else {
      end = parseDate(endDate);
    }

    if (!end || start > end) return { years: 0, months: 0, days: 0 };

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    const endMonthLastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    const isEndOfMonth = end.getDate() === endMonthLastDay;

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (start.getDate() === 1 && isEndOfMonth) {
      months += 1;
      days = 0;
    }

    if (months >= 12) {
      years += Math.floor(months / 12);
      months = months % 12;
    }

    return { years, months, days };
  };

  const formatDuration = (duration) => {
    if (!duration) return '0 months';

    const { years = 0, months = 0, days = 0 } = duration;
    const parts = [];

    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

    return parts.length ? parts.join(', ') : '0 months';
  };

  const formatDateRange = (startDate, endDate) => {
    const start = parseDate(startDate);
    const isPresent =
      endDate && typeof endDate === 'string' && endDate.trim().toLowerCase() === 'present';
    if (isPresent) return start ? `${start.toLocaleDateString()} - Present` : 'Present';
    const end = parseDate(endDate);
    if (!start && !end) return 'Date not specified';
    if (!start) return `Until ${end.toLocaleDateString()}`;
    if (!end) return `From ${start.toLocaleDateString()}`;
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const formatTotalExperience = (totalMonths) => {
    if (totalMonths === 0) return 'No Experience';
    return `Total: ${formatDuration(totalMonths)}`;
  };

  const experienceWithDuration = computed(() => {
    if (!xExperience.value?.length) return [];
    const applicationDate =
      props.applicantData?.appliedDate ||
      props.applicantData?.application_date ||
      props.applicantData?.date_applied ||
      null;
    return xExperience.value.map((exp) => {
      const duration = calculateExactDuration(
        exp.work_date_from,
        exp.work_date_to,
        applicationDate,
      );
      return {
        ...exp,
        durationMonths: duration.totalMonths,
        durationYears: duration.years,
        durationMonthsOnly: duration.months,
        durationDays: duration.days,
        durationText: formatDuration(duration),
      };
    });
  });

  const totalSelectedExperienceMonths = computed(() => {
    let totalDays = 0;

    experienceWithDuration.value.forEach((exp) => {
      if (!selectedExperienceIds.value.includes(exp.uniqueId)) return;

      const start = parseDate(exp.work_date_from);
      const end =
        exp.work_date_to?.toLowerCase() === 'present' ? new Date() : parseDate(exp.work_date_to);

      if (!start || !end) return;

      const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      totalDays += diff;
    });

    const years = Math.floor(totalDays / 365);
    totalDays %= 365;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;

    return { years, months, days };
  });

  const parseTrainingHours = (hours) => {
    if (!hours) return 0;
    const s = hours.toString().trim();
    if (!isNaN(s) && s !== '') return parseInt(s) || 0;
    const m = s.match(/(\d+(?:\.\d+)?)/);
    return m ? parseInt(m[1]) || 0 : 0;
  };

  const totalSelectedTrainingHours = computed(() => {
    if (!xTraining.value?.length) return 0;
    return xTraining.value.reduce((sum, t) => {
      return selectedTrainingIds.value.includes(t.uniqueId)
        ? sum + parseTrainingHours(t.number_of_hours)
        : sum;
    }, 0);
  });

  // ── Applicant identity ────────────────────────────────────────────────────────

  const applicantFullName = computed(() => {
    const pds = jobPostStore.applicantPDS;
    if (pds && (pds.firstname || pds.lastname)) {
      return `${pds.firstname || ''} ${pds.lastname || ''}${pds.name_extension ? ' ' + pds.name_extension : ''}`.trim();
    }
    if (props.applicantData?.firstname || props.applicantData?.lastname) {
      return `${props.applicantData.firstname || ''} ${props.applicantData.lastname || ''}${
        props.applicantData.name_extension ? ' ' + props.applicantData.name_extension : ''
      }`.trim();
    }
    return props.applicantData?.name || 'Please wait';
  });

  // ── UI helpers ────────────────────────────────────────────────────────────────

  const getPersonalInfo = (applicantData) => {
    if (!applicantData) return {};
    return (
      applicantData.n_personal_info ||
      applicantData.nPersonalInfo ||
      (applicantData.firstname ? applicantData : null) ||
      {}
    );
  };

  const formattedEducation = computed(() => xEdu.value || []);

  const formatSalary = (val) => {
    if (!val || val === '0' || val === 0) return '';
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
  };

  const formatRating = (val) => {
    if (!val && val !== 0) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toFixed(2);
  };

  // ── Column Definitions ────────────────────────────────────────────────────────

  const xEduCol = [
    { name: 'select', label: '', field: 'select', align: 'center', style: 'width: 50px' },
    { name: 'level', label: 'Level', align: 'left', field: 'level', sortable: true },
    { name: 'school_name', label: 'Name of School', align: 'left', field: 'school_name' },
    { name: 'course', label: 'Degree/Course', align: 'left', field: 'degree' },
    { name: 'fromYear', label: 'From', align: 'left', field: 'attendance_from' },
    { name: 'toYear', label: 'To', align: 'left', field: 'attendance_to' },
    { name: 'highestLevel', label: 'Units Earned', align: 'left', field: 'highest_units' },
    { name: 'yearGraduated', label: 'Year Graduated', align: 'left', field: 'year_graduated' },
    { name: 'honors', label: 'Honors', align: 'left', field: 'scholarship' },
  ];

  const xEligibilityCol = [
    { name: 'select', label: 'Select', field: 'select', align: 'center', style: 'width: 50px' },
    {
      name: 'eligibility',
      label: 'Eligibility',
      field: 'eligibility',
      sortable: true,
      align: 'left',
    },
    { name: 'rating', label: 'Rating', field: 'rating', sortable: true, align: 'center' },
    {
      name: 'examDate',
      label: 'Date of Exam',
      field: 'date_of_examination',
      sortable: true,
      align: 'left',
    },
    {
      name: 'examPlace',
      label: 'Place',
      field: 'place_of_examination',
      sortable: true,
      align: 'left',
    },
    {
      name: 'licenseNumber',
      label: 'License #',
      field: 'license_number',
      sortable: true,
      align: 'left',
    },
    {
      name: 'validityDate',
      label: 'Validity',
      field: 'date_of_validity',
      sortable: true,
      align: 'left',
    },
  ];

  const xExperienceCol = [
    { name: 'select', label: 'Select', field: 'select', align: 'center', style: 'width: 50px' },
    { name: 'fromDate', label: 'From', field: 'work_date_from', align: 'center' },
    { name: 'toDate', label: 'To', field: 'work_date_to', align: 'center' },
    { name: 'positionTitle', label: 'Position Title', field: 'position_title', align: 'left' },
    { name: 'department', label: 'Department', field: 'department', align: 'left' },
    { name: 'monthlySalary', label: 'Monthly Salary', field: 'monthly_salary', align: 'right' },
    { name: 'salaryGrade', label: 'SG', field: 'salary_grade', align: 'center' },
    { name: 'appointmentStatus', label: 'Status', field: 'status_of_appointment', align: 'left' },
    { name: 'govtService', label: "Gov't", field: 'government_service', align: 'center' },
    { name: 'duration', label: 'Duration', field: 'durationText', align: 'center' },
  ];

  const xTrainingCol = [
    { name: 'select', label: 'Select', field: 'select', align: 'center', style: 'width: 50px' },
    { name: 'title', label: 'Title', field: 'training_title', align: 'left' },
    { name: 'fromDate', label: 'From', field: 'inclusive_date_from', align: 'center' },
    { name: 'toDate', label: 'To', field: 'inclusive_date_to', align: 'center' },
    { name: 'hours', label: 'Hours', field: 'number_of_hours', align: 'center' },
    { name: 'type', label: 'Type', field: 'type', align: 'left' },
    { name: 'conductor', label: 'Conducted/Sponsored By', field: 'conducted_by', align: 'left' },
  ];

  const positionQS = ref([]);

  // ── Image loader ──────────────────────────────────────────────────────────────

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
      const token = authStore.token || authStore.user?.token || localStorage.getItem('token');
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

  // ── Data load helpers ─────────────────────────────────────────────────────────

  const populatePDSData = (pdsData) => {
    const source = pdsData || props.applicantData || {};
    xData.value.education_remark = source.education_remark || source.educationRemark || '';
    xData.value.experience_remark = source.experience_remark || source.experienceRemark || '';
    xData.value.training_remark = source.training_remark || source.trainingRemark || '';
    xData.value.eligibility_remark = source.eligibility_remark || source.eligibilityRemark || '';

    xEdu.value = mapEducationData(
      (pdsData && pdsData.education) ||
        props.education ||
        getPersonalInfo(props.applicantData).education ||
        props.applicantData?.education ||
        [],
    );
    xEligibility.value = mapEligibilityData(
      (pdsData && (pdsData.eligibity || pdsData.eligibility)) ||
        getPersonalInfo(props.applicantData)?.eligibility ||
        [],
    );
    xExperience.value = mapExperienceData(
      (pdsData && pdsData.work_experience) ||
        getPersonalInfo(props.applicantData)?.work_experience ||
        [],
    );
    xTraining.value = mapTrainingData(
      (pdsData && pdsData.training) || getPersonalInfo(props.applicantData)?.training || [],
    );
    supportingDocuments.value = {
      training_images:
        (pdsData && pdsData.training_images) || props.applicantData?.training_images || [],
      education_images:
        (pdsData && pdsData.education_images) || props.applicantData?.education_images || [],
      eligibility_images:
        (pdsData && pdsData.eligibility_images) || props.applicantData?.eligibility_images || [],
      experience_images:
        (pdsData && pdsData.experience_images) || props.applicantData?.experience_images || [],
    };
  };

  const refreshQSData = async () => {
    try {
      if (props.applicantData?.submission_id)
        await jobPostStore.fetchApplicantPDSRater(props.applicantData.submission_id);
      if (props.applicantData?.PositionID) {
        await usePlantilla.fetchQsDataRater(props.applicantData.PositionID);
        positionQS.value = usePlantilla.qsData || [];
      }
      const pdsData = jobPostStore.applicantPDS;
      populatePDSData(pdsData);
    } catch (error) {
      console.error('Error refreshing QS data:', error);
    }
  };

  // ── Modal lifecycle ───────────────────────────────────────────────────────────

  const onModalShow = async () => {
    tab.value = 'education';
    selectedExperienceIds.value = [];
    selectedTrainingIds.value = [];
    selectedEducationIds.value = [];
    selectedEligibilityIds.value = [];
    isLoadingPDS.value = true;

    try {
      let pdsData = null;
      if (props.applicantData?.submission_id)
        pdsData = await jobPostStore.fetchApplicantPDSRater(props.applicantData.submission_id);

      if (props.applicantData?.PositionID) {
        await usePlantilla.fetchQsDataRater(props.applicantData.PositionID);
        positionQS.value = usePlantilla.qsData || [];
      }

      if (pdsData?.image_url) await loadApplicantImage(pdsData.image_url);
      else applicantImageUrl.value = '';

      populatePDSData(pdsData);

      // Restore saved selections
      const candidateSources = [
        xData.value,
        pdsData,
        props.applicantData,
        jobPostStore.applicantPDS,
      ];
      const tryReadFirst = (variants) => {
        for (const s of candidateSources) {
          if (!s) continue;
          const found = readSelectionFrom(s, variants);
          if (found !== undefined) return found;
        }
        return undefined;
      };

      const educationSelection = mapServerSelectionToRowIds(
        tryReadFirst(['education_qualification', 'educationQualification']),
        xEdu.value,
      );
      const experienceSelection = mapServerSelectionToRowIds(
        tryReadFirst(['experience_qualification', 'experienceQualification']),
        experienceWithDuration.value,
      );
      const trainingSelection = mapServerSelectionToRowIds(
        tryReadFirst(['training_qualification', 'trainingQualification']),
        xTraining.value,
      );
      const eligibilitySelection = mapServerSelectionToRowIds(
        tryReadFirst(['eligibility_qualification', 'eligibilityQualification']),
        xEligibility.value,
      );

      selectedEducationIds.value = educationSelection ?? [];
      selectedExperienceIds.value = experienceSelection ?? [];
      selectedTrainingIds.value = trainingSelection ?? [];
      selectedEligibilityIds.value = eligibilitySelection ?? [];
    } catch (error) {
      console.error('Error in onModalShow:', error);
    } finally {
      isLoadingPDS.value = false;
    }
  };

  const resetState = () => {
    if (applicantImageUrl.value?.startsWith('blob:')) URL.revokeObjectURL(applicantImageUrl.value);
    applicantImageUrl.value = '';
    positionQS.value = [];
    xData.value = {
      education_remark: '',
      training_remark: '',
      experience_remark: '',
      eligibility_remark: '',
    };
    xEdu.value = [];
    xEligibility.value = [];
    xExperience.value = [];
    xTraining.value = [];
    selectedEducationIds.value = [];
    selectedExperienceIds.value = [];
    selectedTrainingIds.value = [];
    selectedEligibilityIds.value = [];
    jobPostStore.applicantPDS = null;
  };

  const onClose = () => {
    resetState();
    emit('close');
    localShow.value = false;
  };

  // ── Action handlers ───────────────────────────────────────────────────────────

  const showSupportingDocs = () => {
    showSupportingDocsModal.value = true;
  };
  const showWES = () => {
    showWESModal.value = true;
  };

  const onViewPDS = async () => {
    try {
      if (props.applicantData?.submission_id)
        await jobPostStore.fetchApplicantPDSRater(props.applicantData.submission_id);
      showPDSModal.value = true;
      emit('view-pds');
    } catch {
      showPDSModal.value = true;
      emit('view-pds');
    }
  };

  watch(showPDSModal, (nv, ov) => {
    if (ov && !nv) refreshQSData();
  });
</script>

<style scoped>
  /* ── Shell ── */
  .qualification-modal {
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ── */
  .header {
    background-color: #f5f5f5;
    flex-shrink: 0;
  }

  /* ── Main content: flex container, clips overflow ── */
  .main-content-section {
    flex: 1;
    overflow: hidden;
    padding: 12px;
    min-height: 0;
  }

  /* ── Two-column layout: left card + tabs card ── */
  .content-layout {
    display: flex;
    flex-direction: row;
    height: 100%;
    min-height: 0;
  }

  /* ── Left applicant card: fixed width, internal scroll ── */
  .applicant-card {
    width: 200px;
    min-width: 160px;
    max-width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
  }

  /* ── Right tabs card: fills remaining space ── */
  .tabs-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  /* ── Tabs header row ── */
  .tabs-header-row {
    min-height: 40px;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 4px;
  }

  /* ── Panels area: scrollable ── */
  .tab-panels-scroll {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  /* ── Doc buttons row ── */
  .doc-btn-row {
    flex-wrap: wrap;
  }

  /* ── Footer ── */
  .footer-actions {
    flex-shrink: 0;
    border-top: 1px solid #e0e0e0;
  }

  /* ── QS Info Box ── */
  .qs-info-box {
    background-color: #d1f8d9;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    border-left: 4px solid #2e7d32;
  }
  .qs-text {
    margin-top: 4px;
    font-size: 0.85rem;
    line-height: 1.3;
    word-break: break-word;
  }

  /* ── Global table font override and bold text ── */
  :deep(.q-table) {
    font-size: 9pt !important;
  }
  :deep(.q-table .q-table__top),
  :deep(.q-table .q-table__bottom),
  :deep(.q-table .q-td),
  :deep(.q-table .q-th) {
    font-size: 8pt !important;
  }
  :deep(.q-table tbody tr td) {
    font-size: 8pt !important;
    font-weight: 500 !important;
  }
  :deep(.q-table thead tr th) {
    font-size: 8pt !important;
    font-weight: 700 !important;
    background-color: #fafafa;
  }
  .bold-table :deep(td) {
    font-weight: 500 !important;
  }

  /* ── Misc ── */
  .full-height {
    height: 100%;
  }
  .full-width {
    width: 100%;
  }
  .text-positive {
    color: var(--q-positive);
  }
  .text-negative {
    color: var(--q-negative);
  }

  .modern-input :deep(.q-field__control) {
    background-color: #f9f9f9;
  }
  .modern-input[readonly] :deep(.q-field__control) {
    background-color: #e0e0e0;
  }

  /* ── Tab label sizing ── */
  .qs-tab {
    font-size: 0.7rem;
  }

  /* ── Responsive: tablet / mobile ── */
  @media (max-width: 768px) {
    .content-layout {
      flex-direction: column;
      gap: 12px;
    }
    .applicant-card {
      width: 100%;
      max-width: 100%;
      min-width: unset;
    }
    .applicant-card .q-card__section {
      flex-direction: row !important;
      align-items: flex-start !important;
      flex-wrap: wrap;
      gap: 8px;
    }
    .qs-tab {
      font-size: 0.62rem;
    }
    .doc-btn-row .q-btn {
      font-size: 7pt !important;
    }
    .main-content-section {
      padding: 8px;
    }
    .tabs-header-row {
      flex-direction: column;
      align-items: stretch;
    }
    .tabs-header-row .row {
      justify-content: flex-start;
    }
  }

  @media (max-width: 480px) {
    .main-content-section {
      padding: 6px;
    }
    .qs-tab {
      font-size: 0.58rem;
      padding: 0 8px;
      min-width: 70px;
    }
    .tabs-header-row {
      flex-direction: column;
      align-items: flex-start;
    }
    .doc-btn-row {
      margin-top: 4px;
      width: 100%;
      justify-content: flex-start;
    }
    .footer-actions .row {
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .qs-info-box {
      padding: 6px 10px;
    }
    .qs-text {
      font-size: 0.75rem;
    }
  }

  /* Small height adjustment */
  @media (max-height: 700px) {
    .main-content-section {
      padding: 6px;
    }
    :deep(.q-table tbody tr td) {
      padding: 4px 8px;
    }
  }
</style>
