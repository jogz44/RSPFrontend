<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="modal-overlay"
        @click.self="$emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-modal-heading"
      >
        <div class="modal-container">
          <!-- Loading -->
          <div v-if="isLoading" class="state-box">
            <q-spinner size="48px" color="primary" />
            <p class="state-text">Loading applicant data...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="state-box">
            <q-icon name="error_outline" size="48px" color="negative" />
            <p class="state-text">{{ error }}</p>
            <div class="state-actions">
              <q-btn flat label="Cancel" @click="$emit('close')" />
              <q-btn color="primary" label="Retry" @click="fetchApplicantDetailsWithRetry" />
            </div>
          </div>

          <!-- Content -->
          <template v-else-if="applicantDetails">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-header-left">
                <i class="ti ti-mail" aria-hidden="true"></i>
                <span id="email-modal-heading">Notification Preview — Unqualified Applicant</span>
              </div>
              <button class="close-btn" @click="$emit('close')" aria-label="Close modal">
                &times;
              </button>
            </div>

            <!-- Scrollable body -->
            <div class="modal-body">
              <div class="letter-wrapper">
                <div class="letter-container">
                  <ReportHeader />

                  <div class="letter-body">
                    <p class="letter-date">{{ formatDateEnglish(currentDate) }}</p>

                    <p class="letter-addressee">
                      MR./MRS.
                      {{ applicantName }}
                      <br />
                      <span v-if="formattedAddress">{{ formattedAddress }}</span>
                    </p>

                    <p class="letter-greeting">
                      Dear MR./MRS.
                      <strong>{{ applicantName }}</strong>
                      ,
                    </p>

                    <p class="letter-text">Greetings of Peace and Safety!</p>

                    <p class="letter-text">
                      We wish to inform you that after careful evaluation of your application for
                      the position of
                      <strong>{{ applicantDetails.position }}</strong>
                      , in the
                      <strong>{{ applicantDetails.office }}</strong>
                      , the Human Resource Merit Promotion and Selection Board (HRMPSB) has
                      determined that you do not meet the Qualification Standards required for the
                      said position.
                    </p>

                    <p class="letter-text">
                      After a thorough review of the documents you submitted, the following
                      deficiencies were noted that led to your disqualification:
                    </p>

                    <!-- QS Table -->
                    <div class="table-section">
                      <table class="qs-table">
                        <thead>
                          <tr>
                            <th>Qualification Standard</th>
                            <th>Required</th>
                            <th>Your Records</th>
                            <th>Assessment</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in qsRows" :key="row.key">
                            <td>
                              <strong>{{ row.label }}</strong>
                            </td>
                            <td>{{ row.required }}</td>
                            <td v-html="row.record"></td>
                            <td :class="row.meets ? 'text-success' : 'text-error'">
                              {{ row.remark }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Education Records -->
                    <div v-if="applicantDetails.records?.education?.length" class="table-section">
                      <p class="table-label">Education Records:</p>
                      <table class="records-table">
                        <thead>
                          <tr>
                            <th>Degree</th>
                            <th>School</th>
                            <th>Year Attended</th>
                            <th>Graduated</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(edu, i) in applicantDetails.records.education" :key="i">
                            <td>{{ edu.Degree }}</td>
                            <td>{{ edu.School }}</td>
                            <td>{{ edu.DateAttend }}</td>
                            <td>{{ edu.Graduated }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Experience Records -->
                    <div v-if="applicantDetails.records?.experience?.length" class="table-section">
                      <p class="table-label">Work Experience Records:</p>
                      <table class="records-table">
                        <thead>
                          <tr>
                            <th>Position</th>
                            <th>Company</th>
                            <th>From</th>
                            <th>To</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(exp, i) in applicantDetails.records.experience" :key="i">
                            <td>{{ exp.position || '-' }}</td>
                            <td>{{ exp.company || '-' }}</td>
                            <td>{{ exp.from || '-' }}</td>
                            <td>{{ exp.to || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Training Records -->
                    <div v-if="applicantDetails.records?.training?.length" class="table-section">
                      <p class="table-label">Training Records:</p>
                      <table class="records-table">
                        <thead>
                          <tr>
                            <th>Training Title</th>
                            <th>Date</th>
                            <th>Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(train, i) in applicantDetails.records.training" :key="i">
                            <td>{{ train.Training }}</td>
                            <td>{{ formatDate(train.DateFrom) }}</td>
                            <td class="text-center">{{ train.NumHours }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Eligibility Records -->
                    <div v-if="applicantDetails.records?.eligibility?.length" class="table-section">
                      <p class="table-label">Eligibility Records:</p>
                      <table class="records-table">
                        <thead>
                          <tr>
                            <th>Eligibility</th>
                            <th>Date</th>
                            <th>Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(elig, i) in applicantDetails.records.eligibility" :key="i">
                            <td>{{ elig.CivilServe }}</td>
                            <td>{{ formatDate(elig.Dates) }}</td>
                            <td class="text-center">{{ elig.Rates }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p class="letter-text">
                      We appreciate your interest in joining the City Government of Tagum and
                      commend your effort in applying for the position. We encourage you to continue
                      enhancing your qualifications and to apply for future vacancies that match
                      your credentials.
                    </p>

                    <p class="letter-text">
                      The City Government of Tagum upholds the principle of Equal Employment
                      Opportunity and ensures that all applicants are evaluated fairly based on
                      merit, fitness, and qualifications, without discrimination on the basis of
                      gender, age, civil status, disability, religion, or other protected
                      characteristics.
                    </p>

                    <p class="letter-text">
                      If you have any questions or concerns, please do not hesitate to contact us at
                      <strong>{{ contactNumber }}</strong>
                      .
                    </p>

                    <p class="letter-text">Thank you for your understanding.</p>

                    <div class="signature-block">
                      <div class="sig-name">(SGD.) {{ signatoryName }}</div>
                      <div class="sig-title">{{ signatoryTitle }}</div>
                      <div class="sig-sub">Authorized Representative of the City Mayor</div>
                      <div class="sig-sub">Chairperson</div>
                    </div>

                    <div class="system-notice">
                      <i class="ti ti-device-desktop" aria-hidden="true"></i>
                      This is a system-generated email.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { ref, computed, watch, nextTick } from 'vue';
  import { useEmailTemplateStore } from 'stores/emailTemplateStore';
  import { toast } from 'src/boot/toast';
  import ReportHeader from 'src/components/Reports/ReportHeaderEmail.vue';

  // ── Props ────────────────────────────────────────────────
  const props = defineProps({
    show: { type: Boolean, default: false },
    applicant: {
      type: Object,
      default: () => ({
        jobPostId: null,
        submissionId: null,
        firstname: '',
        lastname: '',
        name_extension: '',
      }),
    },
    contactNumber: { type: String, default: '0917-123-4567' },
    signatoryName: { type: String, default: 'EDGAR C. DE GUZMAN' },
    signatoryTitle: { type: String, default: 'City Administrator' },
    currentDate: { type: [String, Date], default: () => new Date() },
  });

  defineEmits(['close']);

  // ── Store ────────────────────────────────────────────────
  const emailTemplateStore = useEmailTemplateStore();

  // ── State ────────────────────────────────────────────────
  const isLoading = ref(false);
  const error = ref(null);
  const applicantDetails = ref(null);
  const fetchAttempts = ref(0);

  // ── Computed ─────────────────────────────────────────────
  const applicantName = computed(() => {
    const { firstname, lastname, name_extension } = props.applicant;
    return [firstname, lastname, name_extension].filter(Boolean).join(' ') || 'Applicant';
  });

  const formattedAddress = computed(() => {
    const addr = applicantDetails.value?.address;
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [
      addr.purok ? ` ${addr.purok}` : '',
      addr.street,
      addr.barangay,
      addr.city,
      addr.province,
    ]
      .filter(Boolean)
      .join(', ');
  });

  const qsRows = computed(() => {
    const d = applicantDetails.value;
    if (!d) return [];
    const MEETS = 'Meets Qualification';
    return [
      {
        key: 'education',
        label: 'Education',
        required: d.qs_jobpost?.education,
        record: d.formatted?.education || '-',
        remark: d.remarks?.education,
        meets: d.remarks?.education === MEETS,
      },
      {
        key: 'experience',
        label: 'Experience',
        required: d.qs_jobpost?.experience,
        record: d.formatted?.experience || 'None',
        remark: d.remarks?.experience,
        meets: d.remarks?.experience === MEETS,
      },
      {
        key: 'training',
        label: 'Training',
        required: d.qs_jobpost?.training,
        record: truncateHtml(d.formatted?.training, 120),
        remark: d.remarks?.training,
        meets: d.remarks?.training === MEETS,
      },
      {
        key: 'eligibility',
        label: 'Eligibility',
        required: d.qs_jobpost?.eligibility,
        record: truncateHtml(d.formatted?.eligibility, 120),
        remark: d.remarks?.eligibility,
        meets: d.remarks?.eligibility === MEETS,
      },
    ];
  });

  // ── Helpers ──────────────────────────────────────────────
  const formatDateEnglish = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const truncateHtml = (html, length = 120) => {
    if (!html) return '';
    const text = html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
    return text.length > length ? `${text.substring(0, length)}…` : text;
  };

  // ── Data fetching ────────────────────────────────────────
  const fetchApplicantDetails = async () => {
    const { jobPostId, submissionId } = props.applicant;
    if (!jobPostId || !submissionId) {
      error.value = 'Missing required applicant information.';
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      await emailTemplateStore.fetchQualificationRemarks(jobPostId, submissionId);
      await nextTick();
      applicantDetails.value = emailTemplateStore.qualificationRemarks;
      if (!applicantDetails.value) throw new Error('No data returned from server.');
    } catch (err) {
      error.value = err.message || 'Failed to load applicant details.';
      applicantDetails.value = null;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchApplicantDetailsWithRetry = async (maxRetries = 3) => {
    fetchAttempts.value = 0;
    while (fetchAttempts.value < maxRetries) {
      fetchAttempts.value++;
      try {
        await fetchApplicantDetails();
        if (applicantDetails.value) return;
      } catch {
        if (fetchAttempts.value === maxRetries) {
          error.value = `Failed to load data after ${maxRetries} attempts. Please try again.`;
          toast.error(error.value);
          return;
        }
        await new Promise((r) => setTimeout(r, 500 * fetchAttempts.value));
      }
    }
  };

  // ── Lifecycle ────────────────────────────────────────────
  const resetState = () => {
    applicantDetails.value = null;
    error.value = null;
    isLoading.value = false;
    fetchAttempts.value = 0;
  };

  watch(
    () => props.show,
    async (val) => {
      if (val) {
        resetState();
        await fetchApplicantDetailsWithRetry();
      } else {
        resetState();
      }
    },
    { immediate: true },
  );

  watch(
    () => props.applicant,
    async (next, prev) => {
      if (
        props.show &&
        next &&
        (next.jobPostId !== prev?.jobPostId || next.submissionId !== prev?.submissionId)
      ) {
        resetState();
        await fetchApplicantDetailsWithRetry();
      }
    },
    { deep: true },
  );
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.55);
    overflow-y: auto;
    /* FIX: Change to center and remove margin auto from container */
    display: flex;
    align-items: center; /* Changed from flex-start */
    justify-content: center;
    padding: 24px 16px;
  }

  .modal-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 800px;
    /* FIX: Remove margin auto since parent handles centering */
    display: flex;
    flex-direction: column;
    color: #1a1a1a;
    font-family: system-ui, sans-serif;
    /* Add max-height to prevent overflow */
    max-height: calc(100vh - 48px);
    /* Add this to handle internal scrolling */
    overflow: hidden;
  }

  /* ── Loading / Error states ──────────────────────────── */
  .state-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    text-align: center;
    min-height: 320px;
  }
  .state-text {
    margin-top: 14px;
    color: #666;
    font-size: 14px;
  }
  .state-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    justify-content: center;
  }

  /* ── Header ──────────────────────────────────────────── */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #15803d;

    flex-shrink: 0;
  }
  .modal-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
  }
  .modal-header-left i {
    font-size: 18px;
  }
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #fff;
    font-size: 22px;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.15s;
    padding: 0 4px;
  }
  .close-btn:hover {
    opacity: 1;
  }

  /* ── Body ────────────────────────────────────────────── */
  .modal-body {
    padding: 20px 24px;
    flex: 1;
    overflow-y: auto; /* Add this */
    min-height: 0; /* Add this - important for flex children scrolling */
  }

  /* ── Letter wrapper ──────────────────────────────────── */
  .letter-wrapper {
    background: #f3f4f6;
    border-radius: 10px;
    padding: 16px;
  }
  .letter-container {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 32px 40px 28px;
    box-sizing: border-box;
    color: #000;
  }

  /* ── Letter typography (single-spaced) ───────────────── */
  .letter-body {
    padding-top: 4px;
  }
  .letter-date,
  .letter-addressee,
  .letter-greeting,
  .letter-text {
    font-size: 10pt;
    line-height: 1.2;
    color: #000;
    margin: 0 0 10px;
  }
  .letter-text {
    text-align: justify;
  }

  /* ── Tables ──────────────────────────────────────────── */
  .table-section {
    margin: 10px 0;
    overflow-x: auto;
  }
  .table-label {
    font-size: 10pt;
    font-weight: 700;
    color: #000;
    margin: 8px 0 4px;
    line-height: 1.2;
  }
  .qs-table,
  .records-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    line-height: 1.2;
    border: 1px solid #d1d5db;
    margin-bottom: 6px;
  }
  .qs-table thead,
  .records-table thead {
    background: #f0f0f0;
  }
  .qs-table th,
  .records-table th {
    padding: 5px 7px;
    text-align: left;
    font-weight: 700;
    color: #1f2937;
    border-right: 1px solid #d1d5db;
    border-bottom: 1px solid #d1d5db;
  }
  .qs-table th:last-child,
  .records-table th:last-child {
    border-right: none;
  }
  .qs-table td,
  .records-table td {
    padding: 5px 7px;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
    word-break: break-word;
  }
  .qs-table td:last-child,
  .records-table td:last-child {
    border-right: none;
  }
  .qs-table tbody tr:hover,
  .records-table tbody tr:hover {
    background: #f9fafb;
  }
  .text-center {
    text-align: center;
  }
  .text-success {
    color: #15803d;
    font-weight: 600;
  }
  .text-error {
    color: #dc2626;
    font-weight: 600;
  }

  /* ── Signature ───────────────────────────────────────── */
  .signature-block {
    margin-top: 24px;
    line-height: 1.2;
  }
  .sig-name {
    font-size: 10pt;
    font-weight: 700;
    text-decoration: underline;
    text-transform: uppercase;
    color: #000;
  }
  .sig-title {
    font-size: 10pt;
    color: #000;
    margin-top: 2px;
  }
  .sig-sub {
    font-size: 9pt;
    color: #374151;
    margin-top: 1px;
  }

  /* ── System notice ───────────────────────────────────── */
  .system-notice {
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #e5e7eb;
    font-size: 9pt;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  /* ── Transition ──────────────────────────────────────── */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .modal-fade-enter-active .modal-container,
  .modal-fade-leave-active .modal-container {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
  .modal-fade-enter-from .modal-container,
  .modal-fade-leave-to .modal-container {
    transform: translateY(-10px);
    opacity: 0;
  }

  /* ── Responsive ──────────────────────────────────────── */
  @media (max-width: 600px) {
    .modal-overlay {
      padding: 0;
      align-items: flex-start;
    }
    .modal-container {
      border-radius: 0;
      min-height: 100dvh;
    }
    .modal-header {
      border-radius: 0;
    }
    .modal-body {
      padding: 14px;
    }
    .letter-wrapper {
      padding: 10px;
    }
    .letter-container {
      padding: 18px 14px;
    }
  }

  /* ── Print ───────────────────────────────────────────── */
  @media print {
    .modal-overlay {
      position: static;
      background: none;
      padding: 0;
      display: block;
    }
    .modal-container {
      box-shadow: none;
      border-radius: 0;
    }
    .modal-header {
      display: none;
    }
    .modal-body {
      padding: 0;
    }
    .letter-wrapper {
      background: none;
      padding: 0;
    }
    .letter-container {
      border: none;
      border-radius: 0;
      padding: 0;
    }
  }
</style>
