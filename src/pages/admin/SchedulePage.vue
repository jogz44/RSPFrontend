<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="column items-start justify-center q-mb-md">
      <h5 class="text-h5 q-ma-none"><b>Schedule</b></h5>
    </div>

    <div class="q-pa-sm">
      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        align="left"
        class="q-mb-md"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="interview" label="Interview Schedule" icon="event" />
        <q-tab name="exam" label="Exam Schedule" icon="assignment" />
      </q-tabs>

      <q-separator class="q-mb-md" />

      <q-tab-panels v-model="activeTab" animated>
        <!-- ======================== INTERVIEW SCHEDULE TAB ======================== -->
        <q-tab-panel name="interview" class="q-pa-none">
          <div class="row justify-between items-center q-mb-md">
            <q-input
              v-model="globalSearch"
              outlined
              dense
              placeholder="Search interviews..."
              class="col-auto"
              style="max-width: 300px"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
            <q-btn
              v-if="canModifySchedule"
              color="primary"
              label="Schedule Interview"
              icon="event"
              rounded
              @click="openScheduleDialog"
            />
          </div>

          <q-table
            :rows="interviewStore.interviews || []"
            :columns="columns"
            row-key="schedule_id"
            v-model:pagination="pagination"
            class="interviews-table q-mt-md"
            :loading="interviewStore.loading"
            table-style="min-width: 100%"
            @request="onRequest"
            :rows-per-page-options="[10, 20, 50, 100, 200]"
          >
            <template v-slot:body-cell-batch_name="props">
              <q-td :props="props" class="batch-column">
                <div class="text-body2 text-weight-medium text-black">
                  {{ props.row.batch_name || `Batch ${props.row.id}` }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-applicant_no="props">
              <q-td :props="props" class="count-column">
                <div class="text-center text-body2">
                  <q-badge color="primary" class="q-px-sm">
                    {{ props.row.applicant_no || 0 }}
                  </q-badge>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-venue_interview="props">
              <q-td :props="props" class="venue-column">
                <div class="text-body2">{{ props.row.venue_interview || 'Not Set' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-date_interview="props">
              <q-td :props="props" class="date-column">
                <q-badge rounded color="blue" class="text-caption q-px-sm">
                  {{ formatDate(props.row.date_interview) }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-time_interview="props">
              <q-td :props="props" class="time-column">
                <div class="text-body2 text-center">{{ formatTime(props.row.time_interview) }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="action-column">
                <div class="row q-gutter-xs justify-center">
                  <q-btn
                    round
                    flat
                    color="blue"
                    size="sm"
                    class="bg-blue-1"
                    icon="visibility"
                    @click="viewInterview(props.row)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canModifySchedule"
                    round
                    flat
                    color="red"
                    size="sm"
                    class="bg-red-1"
                    icon="cancel"
                    @click="openCancelInterviewDialog(props.row)"
                  >
                    <q-tooltip>Cancel</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey">
                <div class="column items-center">
                  <q-icon name="event_busy" size="3em" class="q-mb-sm" />
                  <div class="text-h6">No Scheduled Interviews</div>
                  <div class="text-caption">Click "Schedule Interview" to get started</div>
                </div>
              </div>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ======================== EXAM SCHEDULE TAB ======================== -->
        <q-tab-panel name="exam" class="q-pa-none">
          <div class="row justify-between items-center q-mb-md">
            <q-input
              v-model="examGlobalSearch"
              outlined
              dense
              placeholder="Search exams..."
              class="col-auto"
              style="max-width: 300px"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
            <q-btn
              v-if="canModifySchedule"
              color="primary"
              label="Schedule Exam"
              icon="assignment"
              rounded
              @click="openExamScheduleDialog"
            />
          </div>

          <q-table
            :rows="examStore.exams || []"
            :columns="examColumns"
            row-key="schedule_id"
            v-model:pagination="examPagination"
            class="interviews-table q-mt-md"
            :loading="examStore.loading"
            table-style="min-width: 100%"
            @request="onExamRequest"
            :rows-per-page-options="[10, 20, 50, 100, 200]"
          >
            <template v-slot:body-cell-batch_name="props">
              <q-td :props="props" class="batch-column">
                <div class="text-body2 text-weight-medium text-black">
                  {{ props.row.batch_name || `Batch ${props.row.schedule_id}` }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-applicant_no="props">
              <q-td :props="props" class="count-column">
                <div class="text-center text-body2">
                  <q-badge color="green" class="q-px-sm">{{ props.row.applicant_no || 0 }}</q-badge>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-venue_exam="props">
              <q-td :props="props" class="venue-column">
                <div class="text-body2">{{ props.row.venue_exam || 'Not Set' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-date_exam="props">
              <q-td :props="props" class="date-column">
                <q-badge rounded color="green" class="text-caption q-px-sm">
                  {{ formatDate(props.row.date_exam) }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-time_exam="props">
              <q-td :props="props" class="time-column">
                <div class="text-body2 text-center">{{ formatTime(props.row.time_exam) }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="action-column">
                <div class="row q-gutter-xs justify-center">
                  <q-btn
                    round
                    flat
                    color="green"
                    size="sm"
                    class="bg-green-1"
                    icon="visibility"
                    @click="viewExam(props.row)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canModifySchedule"
                    round
                    flat
                    color="red"
                    size="sm"
                    class="bg-red-1"
                    icon="cancel"
                    @click="openCancelExamDialog(props.row)"
                  >
                    <q-tooltip>Cancel</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey">
                <div class="column items-center">
                  <q-icon name="assignment_late" size="3em" class="q-mb-sm" />
                  <div class="text-h6">No Scheduled Exams</div>
                  <div class="text-caption">Click "Schedule Exam" to get started</div>
                </div>
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- ======================== INTERVIEW: Schedule Dialog ======================== -->
    <q-dialog v-if="canModifySchedule" v-model="showScheduleDialog" persistent>
      <q-card style="min-width: 700px; max-width: 90vw">
        <q-card-section class="q-pa-md">
          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-bold">Schedule Interview</div>
            <q-btn icon="close" flat round dense @click="closeScheduleDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-md">
          <q-input
            v-model="scheduleForm.batch_name"
            label="Batch Name (Optional)"
            outlined
            dense
            class="q-mb-sm"
            placeholder="e.g., Software Engineer Interview - Batch 1"
          />
          <q-input
            v-model="scheduleForm.venue_interview"
            label="Venue (Optional)"
            outlined
            dense
            class="q-mb-sm"
            placeholder="e.g., City Hall Of Tagum - HR Office"
          />
          <q-input
            v-model="scheduleForm.date_interview"
            label="Interview Date *"
            outlined
            dense
            mask="date"
            :rules="['date']"
            class="q-mb-sm"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="scheduleForm.date_interview"
                    :options="dateOptions"
                    mask="YYYY-MM-DD"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-model="scheduleForm.time_interview"
            label="Interview Time (Optional)"
            outlined
            dense
            class="q-mb-sm"
            placeholder="e.g., 10:00 AM"
            mask="time"
          >
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="scheduleForm.time_interview" format24h :mask="'HH:mm'">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="text-subtitle2 q-mb-sm">Select Applicants *</div>
          <q-input
            v-model="applicantSearch"
            outlined
            dense
            placeholder="Search applicants..."
            class="q-mb-md"
            clearable
          >
            <template v-slot:prepend><q-icon name="search" color="primary" /></template>
          </q-input>
          <q-table
            :rows="filteredInterviewApplicantRows"
            :columns="applicantColumns"
            row-key="submission_id"
            :pagination="applicantPagination"
            :loading="loadingInterviewApplicants"
            class="applicant-selection-table"
            selection="multiple"
            v-model:selected="scheduleForm.selected_applicants"
          >
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="text-body2 text-weight-medium">
                  {{ `${props.row.firstname} ${props.row.lastname}` }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-position="props">
              <q-td :props="props">
                <div class="positions-list">
                  <div v-for="(p, i) in props.row.positions" :key="i" class="position-item">
                    {{ p }}
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-office="props">
              <q-td :props="props">
                <div class="positions-list">
                  <div v-for="(o, i) in props.row.offices" :key="i" class="position-item">
                    {{ o }}
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <q-btn
                  round
                  flat
                  color="orange"
                  size="sm"
                  class="bg-orange-1"
                  icon="email"
                  @click="previewInterviewEmailForApplicant(props.row, scheduleForm)"
                >
                  <q-tooltip>Preview Email</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey">
                <div class="column items-center">
                  <q-icon name="info" size="2em" class="q-mb-sm" />
                  <div>Click search to load applicants</div>
                </div>
              </div>
            </template>
          </q-table>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" color="grey" flat @click="closeScheduleDialog" />
          <q-btn
            label="Schedule"
            color="primary"
            @click="submitSchedule"
            :disable="!isFormValid"
            :loading="interviewStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ======================== EXAM: Schedule Dialog ======================== -->
    <q-dialog v-if="canModifySchedule" v-model="showExamScheduleDialog" persistent>
      <q-card style="min-width: 700px; max-width: 90vw">
        <q-card-section class="q-pa-md">
          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-bold">Schedule Exam</div>
            <q-btn icon="close" flat round dense @click="closeExamScheduleDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-md">
          <q-input
            v-model="examScheduleForm.batch_name"
            label="Batch Name (Optional)"
            outlined
            dense
            class="q-mb-sm"
            placeholder="e.g., Civil Service Exam - Batch 1"
          />
          <q-input
            v-model="examScheduleForm.venue_exam"
            label="Venue (Optional)"
            outlined
            dense
            class="q-mb-sm"
            placeholder="e.g., City Hall Of Tagum - Conference Room"
          />
          <q-input
            v-model="examScheduleForm.date_exam"
            label="Exam Date *"
            outlined
            dense
            mask="date"
            :rules="['date']"
            class="q-mb-sm"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="examScheduleForm.date_exam"
                    :options="dateOptions"
                    mask="YYYY-MM-DD"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-model="examScheduleForm.time_exam"
            label="Exam Time (Optional)"
            outlined
            dense
            class="q-mb-sm"
            placeholder="e.g., 09:00 AM"
            mask="time"
          >
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="examScheduleForm.time_exam" format24h :mask="'HH:mm'">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="text-subtitle2 q-mb-sm">Select Applicants *</div>
          <q-input
            v-model="examApplicantSearch"
            outlined
            dense
            placeholder="Search applicants..."
            class="q-mb-md"
            clearable
          >
            <template v-slot:prepend><q-icon name="search" color="primary" /></template>
          </q-input>
          <q-table
            :rows="filteredExamApplicantRows"
            :columns="applicantColumns"
            row-key="submission_id"
            :pagination="applicantPagination"
            :loading="examStore.loadingApplicants"
            class="applicant-selection-table"
            selection="multiple"
            v-model:selected="examScheduleForm.selected_applicants"
          >
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="text-body2 text-weight-medium">
                  {{ `${props.row.firstname} ${props.row.lastname}` }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-position="props">
              <q-td :props="props">
                <div class="positions-list">
                  <div v-for="(p, i) in props.row.positions" :key="i" class="position-item">
                    {{ p }}
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-office="props">
              <q-td :props="props">
                <div class="positions-list">
                  <div v-for="(o, i) in props.row.offices" :key="i" class="position-item">
                    {{ o }}
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <q-btn
                  round
                  flat
                  color="orange"
                  size="sm"
                  class="bg-orange-1"
                  icon="email"
                  @click="previewExamEmailForApplicant(props.row, examScheduleForm)"
                >
                  <q-tooltip>Preview Email</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey">
                <div class="column items-center">
                  <q-icon name="info" size="2em" class="q-mb-sm" />
                  <div>Click search to load applicants</div>
                </div>
              </div>
            </template>
          </q-table>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" color="grey" flat @click="closeExamScheduleDialog" />
          <q-btn
            label="Schedule"
            color="primary"
            @click="submitExamSchedule"
            :disable="!isExamFormValid"
            :loading="examStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ======================== INTERVIEW: Cancel Dialog ======================== -->
    <q-dialog v-model="showCancelInterviewDialog" persistent>
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section class="q-pa-md bg-negative text-white">
          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-bold">Cancel Interview Schedule</div>
            <q-btn
              icon="close"
              flat
              round
              dense
              color="white"
              @click="closeCancelInterviewDialog"
            />
          </div>
        </q-card-section>
        <q-separator />
        <div v-if="cancelInterviewLoading" class="q-pa-xl text-center">
          <q-spinner size="2rem" color="negative" class="q-mb-sm" />
          <div class="text-subtitle2">Loading interview details...</div>
        </div>
        <q-card-section v-else class="q-pa-md">
          <div class="q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Batch Information</div>
            <q-input
              :model-value="cancelInterviewData.batch_name || 'Not specified'"
              label="Batch Name"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="cancelInterviewData.venue_interview || 'Not specified'"
              label="Venue"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatDate(cancelInterviewData.date_interview)"
                  label="Interview Date"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatTime(cancelInterviewData.time_interview)"
                  label="Interview Time"
                  outlined
                  dense
                  readonly
                />
              </div>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              Scheduled Applicants
              <q-badge color="negative" class="q-ml-sm">
                {{ cancelInterviewApplicants.length }}
              </q-badge>
            </div>
            <q-table
              :rows="cancelInterviewApplicants"
              :columns="viewApplicantColumns"
              row-key="submission_id"
              :pagination="viewPagination"
              class="applicant-view-table"
              :rows-per-page-options="[5, 10, 20, 100, 200]"
            >
              <template v-slot:body-cell-applicant_name="props">
                <q-td :props="props">
                  <div class="text-body text-weight-medium">
                    {{ props.row.applicant_name }}
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-position="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.position || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-contact_no="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.contact_no || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn
                    round
                    flat
                    color="orange"
                    size="sm"
                    class="bg-orange-1"
                    icon="email"
                    @click="previewCancelledInterviewEmailForApplicant(props.row)"
                  >
                    <q-tooltip>Preview Cancellation Email</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-md text-grey">
                  <div class="column items-center">
                    <q-icon name="person_off" size="2em" class="q-mb-sm" />
                    <div>No applicants scheduled for this interview</div>
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Close" color="grey" flat @click="closeCancelInterviewDialog" />
          <q-btn
            label="Confirm Cancellation"
            color="negative"
            @click="confirmCancelInterview"
            :loading="cancelling"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ======================== EXAM: Cancel Dialog ======================== -->
    <q-dialog v-model="showCancelExamDialog" persistent>
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section class="q-pa-md bg-negative text-white">
          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-bold">Cancel Exam Schedule</div>
            <q-btn icon="close" flat round dense color="white" @click="closeCancelExamDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <div v-if="cancelExamLoading" class="q-pa-xl text-center">
          <q-spinner size="2rem" color="negative" class="q-mb-sm" />
          <div class="text-subtitle2">Loading exam details...</div>
        </div>
        <q-card-section v-else class="q-pa-md">
          <div class="q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Batch Information</div>
            <q-input
              :model-value="cancelExamData.batch_name || 'Not specified'"
              label="Batch Name"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="cancelExamData.venue_exam || 'Not specified'"
              label="Venue"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatDate(cancelExamData.date_exam)"
                  label="Exam Date"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatTime(cancelExamData.time_exam)"
                  label="Exam Time"
                  outlined
                  dense
                  readonly
                />
              </div>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              Scheduled Applicants
              <q-badge color="negative" class="q-ml-sm">{{ cancelExamApplicants.length }}</q-badge>
            </div>
            <q-table
              :rows="cancelExamApplicants"
              :columns="viewApplicantColumns"
              row-key="submission_id"
              :pagination="viewPagination"
              class="applicant-view-table"
              :rows-per-page-options="[5, 10, 20, 100, 200]"
            >
              <template v-slot:body-cell-applicant_name="props">
                <q-td :props="props">
                  <div class="text-body text-weight-medium">{{ props.row.applicant_name }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-position="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.position || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-contact_no="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.contact_no || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn
                    round
                    flat
                    color="orange"
                    size="sm"
                    class="bg-orange-1"
                    icon="email"
                    @click="previewCancelledExamEmailForApplicant(props.row)"
                  >
                    <q-tooltip>Preview Cancellation Email</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-md text-grey">
                  <div class="column items-center">
                    <q-icon name="person_off" size="2em" class="q-mb-sm" />
                    <div>No applicants scheduled for this exam</div>
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Close" color="grey" flat @click="closeCancelExamDialog" />
          <q-btn
            label="Confirm Cancellation"
            color="negative"
            @click="confirmCancelExam"
            :loading="cancelling"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ======================== INTERVIEW: View Details Dialog ======================== -->
    <q-dialog v-model="showViewDialog" persistent>
      <q-card style="min-width: 1000px; max-width: 90vw">
        <q-card-section class="q-pa-md bg-primary text-white">
          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-bold">Interview Details</div>
            <q-btn icon="close" flat round dense color="white" @click="closeViewDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <div v-if="interviewStore.loadingApplicants" class="q-pa-xl text-center">
          <q-spinner size="2rem" color="primary" class="q-mb-sm" />
          <div class="text-subtitle2">Loading interview details...</div>
        </div>
        <q-card-section v-else class="q-pa-md">
          <div class="q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Batch Information</div>
            <q-input
              :model-value="viewData.batch_name || 'Not specified'"
              label="Batch Name"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="viewData.venue_interview || 'Not specified'"
              label="Venue"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatDate(viewData.date_interview)"
                  label="Interview Date"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatTime(viewData.time_interview)"
                  label="Interview Time"
                  outlined
                  dense
                  readonly
                />
              </div>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              Scheduled Applicants
              <q-badge color="primary" class="q-ml-sm">{{ viewApplicants.length }}</q-badge>
            </div>
            <q-table
              :rows="viewApplicants"
              :columns="viewApplicantColumns"
              row-key="submission_id"
              :pagination="viewPagination"
              class="applicant-view-table"
              :rows-per-page-options="[5, 10, 20, 100, 200]"
            >
              <template v-slot:body-cell-applicant_name="props">
                <q-td :props="props">
                  <div class="text-body text-weight-medium">
                    {{ props.row.applicant_name }}
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-position="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.position || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-contact_no="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.contact_no || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn
                    round
                    flat
                    color="orange"
                    size="sm"
                    class="bg-orange-1"
                    icon="email"
                    @click="previewInterviewEmailForApplicant(props.row, viewData)"
                  >
                    <q-tooltip>Preview Email</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-md text-grey">
                  <div class="column items-center">
                    <q-icon name="person_off" size="2em" class="q-mb-sm" />
                    <div>No applicants scheduled for this interview</div>
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Close" color="primary" flat @click="closeViewDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ======================== EXAM: View Details Dialog ======================== -->
    <q-dialog v-model="showExamViewDialog" persistent>
      <q-card style="min-width: 1000px; max-width: 90vw">
        <q-card-section class="q-pa-md bg-green text-white">
          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-bold">Exam Details</div>
            <q-btn icon="close" flat round dense color="white" @click="closeExamViewDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <div v-if="examStore.loadingApplicants" class="q-pa-xl text-center">
          <q-spinner size="2rem" color="green" class="q-mb-sm" />
          <div class="text-subtitle2">Loading exam details...</div>
        </div>
        <q-card-section v-else class="q-pa-md">
          <div class="q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Batch Information</div>
            <q-input
              :model-value="examViewData.batch_name || 'Not specified'"
              label="Batch Name"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="examViewData.venue_exam || 'Not specified'"
              label="Venue"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatDate(examViewData.date_exam)"
                  label="Exam Date"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formatTime(examViewData.time_exam)"
                  label="Exam Time"
                  outlined
                  dense
                  readonly
                />
              </div>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              Scheduled Applicants
              <q-badge color="green" class="q-ml-sm">{{ examViewApplicants.length }}</q-badge>
            </div>
            <q-table
              :rows="examViewApplicants"
              :columns="viewApplicantColumns"
              row-key="applicant_name"
              :pagination="viewPagination"
              class="applicant-view-table"
              :rows-per-page-options="[5, 10, 20, 100, 200]"
            >
              <template v-slot:body-cell-applicant_name="props">
                <q-td :props="props">
                  <div class="text-body text-weight-medium">{{ props.row.applicant_name }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-position="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.position || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-contact_no="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.contact_no || 'N/A' }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn
                    round
                    flat
                    color="orange"
                    size="sm"
                    class="bg-orange-1"
                    icon="email"
                    @click="previewExamEmailForApplicant(props.row, examViewData)"
                  >
                    <q-tooltip>Preview Email</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-md text-grey">
                  <div class="column items-center">
                    <q-icon name="person_off" size="2em" class="q-mb-sm" />
                    <div>No applicants scheduled for this exam</div>
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Close" color="green" flat @click="closeExamViewDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Email Preview Components -->
    <InterviewEmail
      ref="interviewEmailDialog"
      :show="showInterviewEmail"
      :applicant="selectedApplicant"
      :interview-details="selectedInterviewDetails"
      @close="showInterviewEmail = false"
    />
    <ExamEmail
      ref="examEmailDialog"
      :show="showExamEmail"
      :applicant="selectedApplicant"
      :exam-details="selectedExamDetails"
      @close="showExamEmail = false"
    />

    <!-- Cancelled Email Preview Components -->
    <InterviewCancelled
      ref="interviewCancelledEmailDialog"
      :show="showInterviewCancelledEmail"
      :applicant="selectedApplicant"
      :interview-details="selectedInterviewDetails"
      @close="showInterviewCancelledEmail = false"
    />
    <ExamCancelled
      ref="examCancelledEmailDialog"
      :show="showExamCancelledEmail"
      :applicant="selectedApplicant"
      :exam-details="selectedExamDetails"
      @close="showExamCancelledEmail = false"
    />
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useQuasar, date } from 'quasar';
  import { useInterviewStore } from 'stores/interviewStore';
  import { useExamScheduleStore } from 'stores/examScheduleStore';
  import { useAuthStore } from 'stores/authStore';
  import InterviewEmail from 'src/components/Email/InterviewEmail.vue';
  import ExamEmail from 'src/components/Email/ExamEmail.vue';
  import InterviewCancelled from 'src/components/Email/InterviewCancelled.vue';
  import ExamCancelled from 'src/components/Email/ExamCancelled.vue';

  let searchTimeout = null;
  let examSearchTimeout = null;

  const $q = useQuasar();
  const interviewStore = useInterviewStore();
  const examStore = useExamScheduleStore();
  const authStore = useAuthStore();
  const { formatDate: qFormatDate } = date;

  // ─── Email dialog state ───────────────────────────────────────────────────────
  const showInterviewEmail = ref(false);
  const showExamEmail = ref(false);
  const showInterviewCancelledEmail = ref(false);
  const showExamCancelledEmail = ref(false);
  const selectedApplicant = ref(null);
  const selectedInterviewDetails = ref(null);
  const selectedExamDetails = ref(null);

  // ─── Cancel dialog state ──────────────────────────────────────────────────────
  const showCancelInterviewDialog = ref(false);
  const showCancelExamDialog = ref(false);
  const cancelInterviewData = ref({});
  const cancelInterviewApplicants = ref([]);
  const cancelExamData = ref({});
  const cancelExamApplicants = ref([]);
  const cancelInterviewLoading = ref(false);
  const cancelExamLoading = ref(false);
  const cancelling = ref(false);
  const pendingCancelScheduleId = ref(null);
  const pendingCancelExamId = ref(null);

  // ─── Permission ───────────────────────────────────────────────────────────────
  const canModifySchedule = computed(() => {
    return authStore.user?.permissions?.modifySchedule === '1';
  });

  // ─── Tab ──────────────────────────────────────────────────────────────────────
  const activeTab = ref('interview');

  // ─── Interview state ──────────────────────────────────────────────────────────
  const globalSearch = ref('');
  const showScheduleDialog = ref(false);
  const showViewDialog = ref(false);
  const applicantSearch = ref('');
  const loadingInterviewApplicants = ref(false);
  const viewData = ref({});
  const viewApplicants = ref([]);

  const scheduleForm = ref({
    batch_name: '',
    venue_interview: '',
    date_interview: '',
    time_interview: '',
    selected_applicants: [],
  });

  const pagination = ref({
    sortBy: 'date_interview',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  // ─── Exam state ───────────────────────────────────────────────────────────────
  const examGlobalSearch = ref('');
  const showExamScheduleDialog = ref(false);
  const showExamViewDialog = ref(false);
  const examApplicantSearch = ref('');
  const examViewData = ref({});
  const examViewApplicants = ref([]);

  const examScheduleForm = ref({
    batch_name: '',
    venue_exam: '',
    date_exam: '',
    time_exam: '',
    selected_applicants: [],
  });

  const examPagination = ref({
    sortBy: 'date_exam',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  // ─── Shared ───────────────────────────────────────────────────────────────────
  const applicantPagination = ref({ page: 1, rowsPerPage: 10 });
  const viewPagination = ref({ page: 1, rowsPerPage: 10 });

  // ─── Columns ──────────────────────────────────────────────────────────────────
  const columns = computed(() => [
    {
      name: 'batch_name',
      label: 'Batch Name',
      align: 'left',
      field: 'batch_name',
      sortable: true,
      style: 'width: 25%',
    },
    {
      name: 'applicant_no',
      label: 'No. of Applicants',
      align: 'center',
      field: 'applicant_no',
      sortable: true,
      style: 'width: 15%',
    },
    {
      name: 'venue_interview',
      label: 'Venue',
      align: 'left',
      field: 'venue_interview',
      sortable: true,
      style: 'width: 20%',
    },
    {
      name: 'date_interview',
      label: 'Interview Date',
      align: 'center',
      field: 'date_interview',
      sortable: true,
      style: 'width: 15%',
    },
    {
      name: 'time_interview',
      label: 'Time',
      align: 'center',
      field: 'time_interview',
      sortable: true,
      style: 'width: 15%',
    },
    {
      name: 'action',
      label: 'Action',
      align: 'center',
      field: 'action',
      sortable: false,
      style: 'width: 10%',
    },
  ]);

  const examColumns = computed(() => [
    {
      name: 'batch_name',
      label: 'Batch Name',
      align: 'left',
      field: 'batch_name',
      sortable: true,
      style: 'width: 25%',
    },
    {
      name: 'applicant_no',
      label: 'No. of Applicants',
      align: 'center',
      field: 'applicant_no',
      sortable: true,
      style: 'width: 15%',
    },
    {
      name: 'venue_exam',
      label: 'Venue',
      align: 'left',
      field: 'venue_exam',
      sortable: true,
      style: 'width: 20%',
    },
    {
      name: 'date_exam',
      label: 'Exam Date',
      align: 'center',
      field: 'date_exam',
      sortable: true,
      style: 'width: 15%',
    },
    {
      name: 'time_exam',
      label: 'Time',
      align: 'center',
      field: 'time_exam',
      sortable: true,
      style: 'width: 15%',
    },
    {
      name: 'action',
      label: 'Action',
      align: 'center',
      field: 'action',
      sortable: false,
      style: 'width: 10%',
    },
  ]);

  const applicantColumns = [
    {
      name: 'name',
      label: 'Applicant Name',
      align: 'left',
      field: 'name',
      sortable: true,
      style: 'width: 35%',
    },
    {
      name: 'office',
      label: 'Office',
      align: 'left',
      field: 'office',
      sortable: false,
      style: 'width: 25%',
    },
    {
      name: 'position',
      label: 'Positions Applied',
      align: 'left',
      field: 'position',
      sortable: false,
      style: 'width: 30%',
    },
    {
      name: 'action',
      label: 'Action',
      align: 'center',
      field: 'action',
      sortable: false,
      style: 'width: 10%',
    },
  ];

  const viewApplicantColumns = [
    {
      name: 'applicant_name',
      label: 'Applicant Name',
      align: 'left',
      field: 'applicant_name',
      sortable: true,
      style: 'width: 35%; white-space: normal;',
    },
    {
      name: 'position',
      label: 'Position',
      align: 'left',
      field: 'position',
      sortable: false,
      style: 'width: 40%; white-space: normal;',
    },
    {
      name: 'contact_no',
      label: 'Contact No',
      align: 'left',
      field: 'contact_no',
      sortable: false,
      style: 'width: 15%; white-space: normal;',
    },
    {
      name: 'action',
      label: 'Action',
      align: 'center',
      field: 'action',
      sortable: false,
      style: 'width: 10%; white-space: normal;',
    },
  ];

  // ─── Shared applicant mapper — carries ALL address fields ─────────────────────
  /**
   * Maps a raw applicant object from fetchScheduleDetails into a flat shape
   * that carries every address field the email components need.
   */
  const mapApplicant = (applicant, index) => ({
    submission_id: applicant.submission_id || applicant.applicant_id || index,
    applicant_name:
      applicant.applicant_name ||
      `${applicant.firstname || ''} ${applicant.lastname || ''}`.trim() ||
      'Unknown Applicant',
    position: applicant.position || 'N/A',
    office: applicant.office || 'N/A',
    contact_no: applicant.contact_no || applicant.phone || 'N/A',
    itemNo: applicant.itemNo || null,
    ControlNo: applicant.ControlNo || applicant.control_no || 'N/A',
    firstname: applicant.firstname || '',
    lastname: applicant.lastname || '',
    email: applicant.email || null,
    // ── Flat address fields from the API ──────────────────────────────────────
    purok: applicant.purok || null,
    street: applicant.street || null,
    barangay: applicant.barangay || null,
    city: applicant.city || null,
    province: applicant.province || null,
    // ── Also keep a nested address object if the API ever returns one ─────────
    address: applicant.address || null,
    applicant_address: applicant.applicant_address || null,
  });

  // ─── Request handlers ─────────────────────────────────────────────────────────
  const onRequest = async (props) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;
    await interviewStore.fetchInterviews({
      page,
      perPage: rowsPerPage,
      search: globalSearch.value,
    });
    pagination.value = {
      ...pagination.value,
      page,
      rowsPerPage,
      sortBy,
      descending,
      rowsNumber: interviewStore.total,
    };
  };

  const onExamRequest = async (props) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;
    await examStore.fetchExams({ page, perPage: rowsPerPage, search: examGlobalSearch.value });
    examPagination.value = {
      ...examPagination.value,
      page,
      rowsPerPage,
      sortBy,
      descending,
      rowsNumber: examStore.total,
    };
  };

  // ─── Search watchers ──────────────────────────────────────────────────────────
  watch(globalSearch, (val) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      pagination.value.page = 1;
      await interviewStore.fetchInterviews({
        page: 1,
        perPage: pagination.value.rowsPerPage,
        search: val,
      });
      pagination.value.rowsNumber = interviewStore.total;
    }, 500);
  });

  watch(examGlobalSearch, (val) => {
    if (examSearchTimeout) clearTimeout(examSearchTimeout);
    examSearchTimeout = setTimeout(async () => {
      examPagination.value.page = 1;
      await examStore.fetchExams({
        page: 1,
        perPage: examPagination.value.rowsPerPage,
        search: val,
      });
      examPagination.value.rowsNumber = examStore.total;
    }, 500);
  });

  // ─── Transform available applicants (schedule dialogs) ───────────────────────
  const transformApplicants = (raw) =>
    (raw || []).map((s) => ({
      submission_id: s.submission_id,
      nPersonalInfo_id: s.nPersonalInfo_id,
      ControlNo: s.ControlNo,
      firstname: s.firstname,
      lastname: s.lastname,
      offices: s.job_batch_rsp ? [s.job_batch_rsp.Office || 'N/A'] : s.offices || ['N/A'],
      positions: s.job_batch_rsp ? [s.job_batch_rsp.Position || 'N/A'] : s.positions || ['N/A'],
      itemNo: s.job_batch_rsp?.ItemNo || s.itemNo || null,
      salaryGrade: s.job_batch_rsp?.SalaryGrade || s.salaryGrade || null,
      job_batches_rsp_id: s.job_batches_rsp_id,
      email: s.email,
      phone: s.phone,
      job_batch_rsp: s.job_batch_rsp,
      // address fields
      purok: s.purok || null,
      street: s.street || null,
      barangay: s.barangay || null,
      city: s.city || null,
      province: s.province || null,
      address: s.address || null,
      applicant_address: s.applicant_address || null,
    }));

  const transformedInterviewApplicants = computed(() =>
    transformApplicants(interviewStore.availableApplicants),
  );

  const transformedExamApplicants = computed(() =>
    transformApplicants(examStore.availableApplicants),
  );

  const filteredInterviewApplicantRows = computed(() => {
    if (!applicantSearch.value) return transformedInterviewApplicants.value;
    const t = applicantSearch.value.toLowerCase();
    return transformedInterviewApplicants.value.filter(
      (a) =>
        `${a.firstname} ${a.lastname}`.toLowerCase().includes(t) ||
        a.positions.join(' ').toLowerCase().includes(t) ||
        a.offices.join(' ').toLowerCase().includes(t) ||
        (a.ControlNo?.toLowerCase() || '').includes(t),
    );
  });

  const filteredExamApplicantRows = computed(() => {
    if (!examApplicantSearch.value) return transformedExamApplicants.value;
    const t = examApplicantSearch.value.toLowerCase();
    return transformedExamApplicants.value.filter(
      (a) =>
        `${a.firstname} ${a.lastname}`.toLowerCase().includes(t) ||
        a.positions.join(' ').toLowerCase().includes(t) ||
        a.offices.join(' ').toLowerCase().includes(t) ||
        (a.ControlNo?.toLowerCase() || '').includes(t),
    );
  });

  const isFormValid = computed(
    () => scheduleForm.value.date_interview && scheduleForm.value.selected_applicants.length > 0,
  );

  const isExamFormValid = computed(
    () => examScheduleForm.value.date_exam && examScheduleForm.value.selected_applicants.length > 0,
  );

  // ─── Current form data helpers ────────────────────────────────────────────────
  const getCurrentInterviewFormData = () => ({
    date_interview: scheduleForm.value.date_interview || null,
    time_interview: scheduleForm.value.time_interview || null,
    venue_interview: scheduleForm.value.venue_interview || null,
    batch_name: scheduleForm.value.batch_name || null,
  });

  const getCurrentExamFormData = () => ({
    date_exam: examScheduleForm.value.date_exam || null,
    time_exam: examScheduleForm.value.time_exam || null,
    venue_exam: examScheduleForm.value.venue_exam || null,
    batch_name: examScheduleForm.value.batch_name || null,
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Set';
    try {
      return qFormatDate(dateStr, 'MMM D, YYYY');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Not Set';
    if (timeStr === '1900-01-01' || timeStr.startsWith('1900-01-01')) return 'Not Set';
    try {
      let t = timeStr;
      if (t.includes('T')) t = t.split('T')[1].split('.')[0];
      else if (t.includes(' ') && t.split(' ')[0].includes('-')) t = t.split(' ')[1] || t;
      const parts = t.split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0]);
        const m = parts[1];
        if (isNaN(h) || h < 0 || h > 23) return 'Not Set';
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
      }
      return 'Not Set';
    } catch {
      return 'Not Set';
    }
  };

  const formatTimeForApi = (timeStr) => {
    if (!timeStr) return null;
    if (timeStr.match(/^\d{2}:\d{2}$/)) return `${timeStr}:00`;
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) return timeStr;
    return null;
  };

  const dateOptions = (dateVal) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateVal) >= today;
  };

  // ─── Normalize applicant for email preview ────────────────────────────────────
  const normalizeApplicant = (applicant) => {
    if (!applicant) return null;

    let firstname = applicant.firstname || '';
    let lastname = applicant.lastname || '';

    if (!firstname && !lastname && applicant.applicant_name) {
      const parts = applicant.applicant_name.trim().split(' ');
      firstname = parts[0] || '';
      lastname = parts.slice(1).join(' ') || '';
    }

    let position = applicant.position || 'N/A';
    if (position === 'N/A' && Array.isArray(applicant.positions)) {
      position = applicant.positions[0] || 'N/A';
    }
    if (position === 'N/A' && applicant.job_batch_rsp?.Position) {
      position = applicant.job_batch_rsp.Position;
    }

    let office = applicant.office || 'N/A';
    if (office === 'N/A' && Array.isArray(applicant.offices)) {
      office = applicant.offices[0] || 'N/A';
    }
    if (office === 'N/A' && applicant.job_batch_rsp?.Office) {
      office = applicant.job_batch_rsp.Office;
    }

    let itemNo = applicant.itemNo || null;
    if (!itemNo && applicant.job_batch_rsp?.ItemNo) itemNo = applicant.job_batch_rsp.ItemNo;

    let salaryGrade = applicant.salaryGrade || null;
    if (!salaryGrade && applicant.job_batch_rsp?.SalaryGrade)
      salaryGrade = applicant.job_batch_rsp.SalaryGrade;

    // ...applicant spreads all existing fields (including address fields set by mapApplicant)
    return {
      ...applicant,
      firstname,
      lastname,
      position,
      office,
      itemNo,
      salaryGrade,
    };
  };

  // ─── Email preview methods ────────────────────────────────────────────────────
  const previewInterviewEmailForApplicant = (applicant, interviewDetailsSource = null) => {
    if (!applicant) return;
    selectedApplicant.value = normalizeApplicant(applicant);

    if (interviewDetailsSource) {
      if (interviewDetailsSource.value !== undefined) {
        if (interviewDetailsSource.value.date_interview !== undefined) {
          selectedInterviewDetails.value = getCurrentInterviewFormData();
        } else {
          selectedInterviewDetails.value = interviewDetailsSource.value;
        }
      } else if (typeof interviewDetailsSource === 'function') {
        selectedInterviewDetails.value = interviewDetailsSource();
      } else {
        if (
          interviewDetailsSource.date_interview !== undefined &&
          !interviewDetailsSource._isFormRef
        ) {
          selectedInterviewDetails.value = interviewDetailsSource;
        } else {
          selectedInterviewDetails.value = getCurrentInterviewFormData();
        }
      }
    } else if (viewData.value?.schedule_id) {
      selectedInterviewDetails.value = viewData.value;
    } else {
      selectedInterviewDetails.value = null;
    }

    showInterviewEmail.value = true;
  };

  const previewExamEmailForApplicant = (applicant, examDetailsSource = null) => {
    if (!applicant) return;
    selectedApplicant.value = normalizeApplicant(applicant);

    if (examDetailsSource) {
      if (examDetailsSource.value !== undefined) {
        if (examDetailsSource.value.date_exam !== undefined) {
          selectedExamDetails.value = getCurrentExamFormData();
        } else {
          selectedExamDetails.value = examDetailsSource.value;
        }
      } else if (typeof examDetailsSource === 'function') {
        selectedExamDetails.value = examDetailsSource();
      } else {
        if (examDetailsSource.date_exam !== undefined || examDetailsSource.date !== undefined) {
          selectedExamDetails.value = {
            date_exam: examDetailsSource.date_exam || examDetailsSource.date,
            time_exam: examDetailsSource.time_exam || examDetailsSource.time,
            venue_exam: examDetailsSource.venue_exam || examDetailsSource.venue,
            batch_name: examDetailsSource.batch_name,
            itemNo: examDetailsSource.itemNo,
            position: examDetailsSource.position,
            office: examDetailsSource.office,
          };
        } else {
          selectedExamDetails.value = getCurrentExamFormData();
        }
      }
    } else if (examViewData.value?.schedule_id) {
      selectedExamDetails.value = {
        date_exam: examViewData.value.date_exam || examViewData.value.date,
        time_exam: examViewData.value.time_exam || examViewData.value.time,
        venue_exam: examViewData.value.venue_exam || examViewData.value.venue,
        batch_name: examViewData.value.batch_name,
      };
    } else {
      selectedExamDetails.value = null;
    }

    showExamEmail.value = true;
  };

  // ─── Cancelled email preview methods ─────────────────────────────────────────
  const previewCancelledInterviewEmailForApplicant = (applicant) => {
    if (!applicant) return;
    selectedApplicant.value = normalizeApplicant(applicant);
    selectedInterviewDetails.value = cancelInterviewData.value;
    showInterviewCancelledEmail.value = true;
  };

  const previewCancelledExamEmailForApplicant = (applicant) => {
    if (!applicant) return;
    selectedApplicant.value = normalizeApplicant(applicant);
    selectedExamDetails.value = cancelExamData.value;
    showExamCancelledEmail.value = true;
  };

  // ─── Cancel interview dialog ──────────────────────────────────────────────────
  const openCancelInterviewDialog = async (interview) => {
    if (!canModifySchedule.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to cancel interviews',
        position: 'top',
      });
      return;
    }

    showCancelInterviewDialog.value = true;
    cancelInterviewLoading.value = true;
    pendingCancelScheduleId.value = interview.schedule_id;

    try {
      const detail = await interviewStore.fetchScheduleDetails(interview.schedule_id);

      let scheduleData = {};
      let applicants = [];

      if (detail) {
        if (detail.schedule_id !== undefined || detail.date || detail.time || detail.venue) {
          scheduleData = {
            schedule_id: detail.schedule_id || interview.schedule_id,
            batch_name: detail.batch_name || interview.batch_name,
            venue_interview: detail.venue || interview.venue_interview,
            date_interview: detail.date || interview.date_interview,
            time_interview: detail.time || interview.time_interview,
          };
          applicants = detail.applicants || [];
        } else if (detail.schedule) {
          scheduleData = {
            schedule_id: detail.schedule.schedule_id,
            batch_name: detail.schedule.batch_name,
            venue_interview: detail.schedule.venue,
            date_interview: detail.schedule.date,
            time_interview: detail.schedule.time,
          };
          applicants = detail.applicants || [];
        } else if (Array.isArray(detail)) {
          applicants = detail;
          scheduleData = { ...interview };
        } else {
          scheduleData = interview;
        }
      } else {
        scheduleData = interview;
      }

      cancelInterviewData.value = scheduleData;
      cancelInterviewApplicants.value = Array.isArray(applicants)
        ? applicants.map(mapApplicant)
        : [];
    } catch (e) {
      console.error('Error loading interview details for cancellation:', e);
      $q.notify({
        type: 'negative',
        message: e?.message || 'Failed to load interview details',
        position: 'top',
      });
      closeCancelInterviewDialog();
    } finally {
      cancelInterviewLoading.value = false;
    }
  };

  const closeCancelInterviewDialog = () => {
    showCancelInterviewDialog.value = false;
    cancelInterviewData.value = {};
    cancelInterviewApplicants.value = [];
    pendingCancelScheduleId.value = null;
  };

  const confirmCancelInterview = async () => {
    if (!pendingCancelScheduleId.value) return;
    cancelling.value = true;
    try {
      await interviewStore.cancelInterview(pendingCancelScheduleId.value);
      $q.notify({
        type: 'positive',
        message: 'Interview schedule cancelled successfully.',
        position: 'top',
      });
      closeCancelInterviewDialog();
      await interviewStore.fetchInterviews({
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
        search: globalSearch.value,
      });
      pagination.value.rowsNumber = interviewStore.total;
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e?.response?.data?.message || e?.message || 'Failed to cancel interview.',
        position: 'top',
      });
    } finally {
      cancelling.value = false;
    }
  };

  // ─── Cancel exam dialog ───────────────────────────────────────────────────────
  const openCancelExamDialog = async (exam) => {
    if (!canModifySchedule.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to cancel exams',
        position: 'top',
      });
      return;
    }

    showCancelExamDialog.value = true;
    cancelExamLoading.value = true;
    pendingCancelExamId.value = exam.schedule_id;

    try {
      const detail = await examStore.fetchExamDetails(exam.schedule_id);

      let scheduleData = {};
      let applicants = [];

      if (detail) {
        scheduleData = {
          schedule_id: detail.schedule_id || exam.schedule_id,
          batch_name: detail.batch_name || exam.batch_name,
          venue_exam: detail.venue_exam || detail.venue || exam.venue_exam || exam.venue,
          date_exam: detail.date_exam || detail.date || exam.date_exam || exam.date,
          time_exam: detail.time_exam || detail.time || exam.time_exam || exam.time,
        };
        if (detail.applicants && Array.isArray(detail.applicants)) {
          applicants = detail.applicants;
        } else if (Array.isArray(detail)) {
          applicants = detail;
        }
      } else {
        scheduleData = exam;
        applicants = exam.applicants || [];
      }

      cancelExamData.value = scheduleData;
      cancelExamApplicants.value = Array.isArray(applicants) ? applicants.map(mapApplicant) : [];
    } catch (e) {
      console.error('Error loading exam details for cancellation:', e);
      $q.notify({
        type: 'negative',
        message: e?.message || 'Failed to load exam details',
        position: 'top',
      });
      closeCancelExamDialog();
    } finally {
      cancelExamLoading.value = false;
    }
  };

  const closeCancelExamDialog = () => {
    showCancelExamDialog.value = false;
    cancelExamData.value = {};
    cancelExamApplicants.value = [];
    pendingCancelExamId.value = null;
  };

  const confirmCancelExam = async () => {
    if (!pendingCancelExamId.value) return;
    cancelling.value = true;
    try {
      await examStore.cancelExamSchedule(pendingCancelExamId.value);
      $q.notify({
        type: 'positive',
        message: 'Examination schedule cancelled successfully.',
        position: 'top',
      });
      closeCancelExamDialog();
      await examStore.fetchExams({
        page: examPagination.value.page,
        perPage: examPagination.value.rowsPerPage,
        search: examGlobalSearch.value,
      });
      examPagination.value.rowsNumber = examStore.total;
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e?.response?.data?.message || e?.message || 'Failed to cancel examination.',
        position: 'top',
      });
    } finally {
      cancelling.value = false;
    }
  };

  // ─── Interview schedule dialog ────────────────────────────────────────────────
  const resetScheduleForm = () => {
    scheduleForm.value = {
      batch_name: '',
      venue_interview: '',
      date_interview: '',
      time_interview: '',
      selected_applicants: [],
    };
    applicantSearch.value = '';
  };

  const openScheduleDialog = async () => {
    if (!canModifySchedule.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to schedule interviews',
        position: 'top',
      });
      return;
    }
    showScheduleDialog.value = true;
    loadingInterviewApplicants.value = true;
    try {
      await interviewStore.fetchAvailableApplicants();
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e?.message || 'Failed to load applicants',
        position: 'top',
      });
    } finally {
      loadingInterviewApplicants.value = false;
    }
  };

  const closeScheduleDialog = () => {
    showScheduleDialog.value = false;
    resetScheduleForm();
  };

  const closeViewDialog = () => {
    showViewDialog.value = false;
    viewData.value = {};
    viewApplicants.value = [];
    interviewStore.clearBatchDetails();
  };

  const submitSchedule = async () => {
    try {
      const payload = {
        batch_name: scheduleForm.value.batch_name || null,
        venue_interview: scheduleForm.value.venue_interview || null,
        date_interview: scheduleForm.value.date_interview,
        time_interview: formatTimeForApi(scheduleForm.value.time_interview),
        applicants: scheduleForm.value.selected_applicants.map((a) => ({
          submission_id: a.submission_id,
          job_batches_rsp: parseInt(a.job_batches_rsp_id),
        })),
      };
      const response = await interviewStore.scheduleInterview(payload);
      if (response?.success || response?.data?.success) {
        $q.notify({
          type: 'positive',
          message:
            response?.message || response?.data?.message || 'Interview scheduled successfully',
          position: 'top',
        });
        closeScheduleDialog();
        await interviewStore.fetchInterviews({
          page: 1,
          perPage: pagination.value.rowsPerPage,
          search: '',
        });
        pagination.value.rowsNumber = interviewStore.total;
      } else {
        $q.notify({
          type: 'negative',
          message: response?.message || response?.data?.message || 'Failed to schedule interview',
          position: 'top',
        });
      }
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e?.response?.data?.message || e?.message || 'Failed to schedule interview',
        position: 'top',
      });
    }
  };

  const viewInterview = async (interview) => {
    try {
      showViewDialog.value = true;
      const detail = await interviewStore.fetchScheduleDetails(interview.schedule_id);

      let scheduleData = {};
      let applicants = [];

      if (detail) {
        if (detail.schedule_id !== undefined || detail.date || detail.time || detail.venue) {
          scheduleData = {
            schedule_id: detail.schedule_id || interview.schedule_id,
            batch_name: detail.batch_name || interview.batch_name,
            venue_interview: detail.venue || interview.venue_interview,
            date_interview: detail.date || interview.date_interview,
            time_interview: detail.time || interview.time_interview,
          };
          applicants = detail.applicants || [];
        } else if (detail.schedule) {
          scheduleData = {
            schedule_id: detail.schedule.schedule_id,
            batch_name: detail.schedule.batch_name,
            venue_interview: detail.schedule.venue,
            date_interview: detail.schedule.date,
            time_interview: detail.schedule.time,
          };
          applicants = detail.applicants || [];
        } else if (Array.isArray(detail)) {
          applicants = detail;
          scheduleData = { ...interview };
        } else {
          scheduleData = interview;
        }
      } else {
        scheduleData = interview;
      }

      viewData.value = scheduleData;
      viewApplicants.value = Array.isArray(applicants) ? applicants.map(mapApplicant) : [];
    } catch (e) {
      console.error('Error loading interview details:', e);
      $q.notify({
        type: 'negative',
        message: e?.message || 'Failed to load interview details',
        position: 'top',
      });
      closeViewDialog();
    }
  };

  // ─── Exam schedule dialog ─────────────────────────────────────────────────────
  const resetExamScheduleForm = () => {
    examScheduleForm.value = {
      batch_name: '',
      venue_exam: '',
      date_exam: '',
      time_exam: '',
      selected_applicants: [],
    };
    examApplicantSearch.value = '';
  };

  const openExamScheduleDialog = async () => {
    if (!canModifySchedule.value) {
      $q.notify({
        type: 'warning',
        message: 'You do not have permission to schedule exams',
        position: 'top',
      });
      return;
    }
    showExamScheduleDialog.value = true;
    try {
      await examStore.fetchAvailableApplicants();
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e?.message || 'Failed to load applicants',
        position: 'top',
      });
    }
  };

  const closeExamScheduleDialog = () => {
    showExamScheduleDialog.value = false;
    resetExamScheduleForm();
  };

  const closeExamViewDialog = () => {
    showExamViewDialog.value = false;
    examViewData.value = {};
    examViewApplicants.value = [];
    examStore.clearExamDetails();
  };

  const submitExamSchedule = async () => {
    try {
      const payload = {
        batch_name: examScheduleForm.value.batch_name || null,
        venue_exam: examScheduleForm.value.venue_exam || null,
        date_exam: examScheduleForm.value.date_exam,
        time_exam: formatTimeForApi(examScheduleForm.value.time_exam),
        applicants: examScheduleForm.value.selected_applicants.map((a) => ({
          submission_id: a.submission_id,
          job_batches_rsp: parseInt(a.job_batches_rsp_id),
        })),
      };
      const response = await examStore.scheduleExam(payload);
      if (response?.success || response?.data?.success) {
        $q.notify({
          type: 'positive',
          message: response?.message || response?.data?.message || 'Exam scheduled successfully',
          position: 'top',
        });
        closeExamScheduleDialog();
        await examStore.fetchExams({
          page: 1,
          perPage: examPagination.value.rowsPerPage,
          search: '',
        });
        examPagination.value.rowsNumber = examStore.total;
      } else {
        $q.notify({
          type: 'negative',
          message: response?.message || response?.data?.message || 'Failed to schedule exam',
          position: 'top',
        });
      }
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e?.response?.data?.message || e?.message || 'Failed to schedule exam',
        position: 'top',
      });
    }
  };

  const viewExam = async (exam) => {
    try {
      showExamViewDialog.value = true;

      examViewData.value = {
        schedule_id: exam.schedule_id,
        batch_name: exam.batch_name,
        date_exam: exam.date_exam || exam.date,
        time_exam: exam.time_exam || exam.time,
        venue_exam: exam.venue_exam || exam.venue,
      };

      const detail = await examStore.fetchExamDetails(exam.schedule_id);

      if (detail) {
        examViewData.value = {
          schedule_id: detail.schedule_id || exam.schedule_id,
          batch_name: detail.batch_name || exam.batch_name,
          date_exam: detail.date_exam || detail.date || exam.date_exam || exam.date,
          time_exam: detail.time_exam || detail.time || exam.time_exam || exam.time,
          venue_exam: detail.venue_exam || detail.venue || exam.venue_exam || exam.venue,
        };

        let applicants = [];
        if (detail.applicants && Array.isArray(detail.applicants)) {
          applicants = detail.applicants;
        } else if (Array.isArray(detail)) {
          applicants = detail;
        }

        examViewApplicants.value = applicants.map(mapApplicant);
      } else {
        examViewApplicants.value = Array.isArray(exam.applicants)
          ? exam.applicants.map(mapApplicant)
          : [];
      }
    } catch (e) {
      console.error('Error loading exam details:', e);
      $q.notify({
        type: 'negative',
        message: e?.message || 'Failed to load exam details',
        position: 'top',
      });
      closeExamViewDialog();
    }
  };

  // ─── Lifecycle ────────────────────────────────────────────────────────────────
  onMounted(async () => {
    await interviewStore.fetchInterviews({
      page: 1,
      perPage: pagination.value.rowsPerPage,
      search: '',
    });
    pagination.value.rowsNumber = interviewStore.total;

    await examStore.fetchExams({ page: 1, perPage: examPagination.value.rowsPerPage, search: '' });
    examPagination.value.rowsNumber = examStore.total;
  });
</script>

<style scoped lang="scss">
  .text-h5 {
    font-size: 1.3rem;
    line-height: 1.7rem;
    margin-bottom: 0.5rem;
  }

  .interviews-table,
  .applicant-selection-table,
  .applicant-view-table {
    font-size: 0.9rem;
    table-layout: fixed;
    width: 100%;

    th {
      font-size: 0.95rem;
      font-weight: 600;
      padding: 8px 12px;
      background-color: #f5f5f5;
    }

    td {
      font-size: 0.9rem;
      padding: 8px 12px;
      vertical-align: middle;
    }

    .batch-column,
    .count-column,
    .venue-column {
      white-space: normal;
      word-break: break-word;
    }
  }

  .interviews-table {
    .batch-column {
      width: 25%;
    }
    .count-column {
      width: 15%;
      text-align: center;
    }
    .venue-column {
      width: 20%;
    }
    .date-column,
    .time-column {
      text-align: center;
      width: 15%;
    }
    .action-column {
      width: 10%;
      text-align: center;
    }
  }

  .applicant-selection-table,
  .applicant-view-table {
    :deep(thead tr th:first-child),
    :deep(tbody tr td:first-child) {
      text-align: center !important;
      vertical-align: middle !important;
      padding: 8px !important;
    }

    :deep(th:first-child),
    :deep(td:first-child) {
      width: 48px !important;
      min-width: 48px !important;
      max-width: 48px !important;
    }

    :deep(.q-checkbox) {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .applicant-selection-table td {
    vertical-align: top;
    padding: 20px;
  }

  .positions-list {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .position-item {
      font-size: 0.9rem;
      line-height: 1.4;
      font-weight: 500;
    }
  }

  .bg-blue-1 {
    background-color: rgba(33, 150, 243, 0.1);
  }
  .bg-green-1 {
    background-color: rgba(76, 175, 80, 0.1);
  }
  .bg-red-1 {
    background-color: rgba(244, 67, 54, 0.1);
  }
  .bg-orange-1 {
    background-color: rgba(255, 152, 0, 0.1);
  }

  @media (max-width: 1024px) {
    .interviews-table th,
    .interviews-table td {
      padding: 6px 8px;
    }
  }
</style>
