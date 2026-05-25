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
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-header-left">
              <i class="ti ti-assignment" aria-hidden="true"></i>
              <span id="email-modal-heading">Exam Cancellation Notification Preview</span>
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

                  <p class="letter-greeting">
                    Dear
                    <strong>{{ applicantName }}</strong>
                    ,
                  </p>

                  <p class="letter-text">Greetings of Peace and Safety!</p>

                  <p class="letter-text">
                    This pertains to your application for the
                    <strong>{{ displayPosition }}</strong>
                    <span v-if="displayItemNo">
                      , Item No.
                      <strong>{{ displayItemNo }}</strong>
                    </span>
                    in the
                    <strong>{{ displayOffice }}</strong>
                    .
                  </p>

                  <!-- ✅ Cancellation Notice Box -->
                  <div class="notice-box">
                    <p>⚠ NOTICE: Your scheduled examination has been CANCELLED.</p>
                  </div>

                  <p class="letter-text">
                    Please be informed that the Competency-Based Examination with the Human Resource
                    Merit Promotion and Selection Board (HRMPSB) originally scheduled on:
                  </p>

                  <div class="details-section">
                    <p class="details-title">Cancelled Examination Details:</p>
                    <table class="details-table">
                      <tr>
                        <td class="details-label">Date:</td>
                        <td class="details-value">
                          <strong>{{ formatDate(examDetails?.date_exam) }}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td class="details-label">Time:</td>
                        <td class="details-value">
                          <strong>{{ formatTime(examDetails?.time_exam) }}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td class="details-label">Venue:</td>
                        <td class="details-value">
                          <strong>{{ examDetails?.venue_exam || 'Not specified' }}</strong>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <p class="letter-text">
                    has been cancelled. We sincerely apologize for any inconvenience this may have
                    caused. Please be patient and wait for the updated examination schedule. Thank
                    you.
                  </p>

                  <div class="reminders-section">
                    <p class="reminders-title">Important Reminders:</p>
                    <ul class="reminders-list">
                      <li>
                        Please disregard any previous notice regarding the above examination
                        schedule.
                      </li>
                      <li>You will receive a new notification once a reschedule has been set.</li>
                      <li>
                        If you have any clarifications, you may reach us through our mobile no.
                        <strong>{{ contactNumber }}</strong>
                        .
                      </li>
                    </ul>
                  </div>

                  <p class="letter-text">
                    The City Government of Tagum through the Human Resource Merit Promotion and
                    Selection Board (HRMPSB) upholds the principle of Equal Employment Opportunity.
                    All applicants are treated fairly and evaluated based on merit, fitness, and
                    qualifications, without discrimination of any kind.
                  </p>

                  <p class="letter-text">We appreciate your patience and understanding.</p>

                  <p class="letter-text">Thank you.</p>

                  <p class="letter-text">Sincerely,</p>

                  <div class="signature-block">
                    <div class="sig-name">(SGD.) {{ signatoryName }}</div>
                    <div class="sig-title">{{ signatoryTitle }}</div>
                    <div class="sig-sub">Authorized Representative of the City Mayor</div>
                    <div class="sig-sub">Chairperson</div>
                  </div>

                  <div class="system-notice">
                    <i class="ti ti-device-desktop" aria-hidden="true"></i>
                    This document is system generated.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="modal-footer">
            <q-btn flat label="Close" @click="$emit('close')" color="red" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';

  import ReportHeader from 'src/components/Reports/ReportHeaderEmail.vue';

  // ── Props ────────────────────────────────────────────────
  const props = defineProps({
    show: { type: Boolean, default: false },
    applicant: {
      type: Object,
      default: null,
    },
    examDetails: {
      type: Object,
      default: null,
    },
    contactNumber: { type: String, default: '09973962684' },
    signatoryName: { type: String, default: 'EDGARD C. DE GUZMAN' },
    signatoryTitle: { type: String, default: 'City Administrator' },
    currentDate: { type: [String, Date], default: () => new Date() },
  });

  defineEmits(['close']);

  const dialogVisible = ref(false);

  watch(
    () => props.show,
    (newVal) => {
      dialogVisible.value = newVal;
    },
  );

  // ── Helper functions to extract data from various structures ──
  const extractPosition = (applicant) => {
    if (!applicant) return 'N/A';
    if (applicant.position) return applicant.position;
    if (
      applicant.positions &&
      Array.isArray(applicant.positions) &&
      applicant.positions.length > 0
    ) {
      return applicant.positions[0];
    }
    if (applicant.job_batch_rsp?.Position) return applicant.job_batch_rsp.Position;
    return 'N/A';
  };

  const extractOffice = (applicant) => {
    if (!applicant) return 'N/A';
    if (applicant.office) return applicant.office;
    if (applicant.offices && Array.isArray(applicant.offices) && applicant.offices.length > 0) {
      return applicant.offices[0];
    }
    if (applicant.job_batch_rsp?.Office) return applicant.job_batch_rsp.Office;
    return 'N/A';
  };

  const extractItemNo = (applicant) => {
    if (!applicant) return null;
    if (applicant.itemNo) return applicant.itemNo;
    if (applicant.job_batch_rsp?.ItemNo) return applicant.job_batch_rsp.ItemNo;
    return null;
  };

  // ── Time formatting helper for SQL Server time format ──
  const formatTime = (timeStr) => {
    if (!timeStr) return 'Not specified';

    // Handle SQL Server time format (HH:MM:SS.sssssss)
    let cleanTime = timeStr;

    // If it's a string and contains microseconds, remove them
    if (typeof timeStr === 'string') {
      if (timeStr.includes('.') && timeStr.includes(':')) {
        cleanTime = timeStr.split('.')[0];
      }
    }

    // Parse HH:MM:SS or HH:MM format
    const parts = cleanTime.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0]);
      const minutes = parts[1];

      // Validate hours
      if (isNaN(hours) || hours < 0 || hours > 23) return timeStr;

      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }

    return timeStr;
  };

  // ── Computed ─────────────────────────────────────────────
  const applicantName = computed(() => {
    if (!props.applicant) return 'Applicant';

    let firstname = props.applicant.firstname || '';
    let lastname = props.applicant.lastname || '';
    let nameExtension = props.applicant.name_extension || '';

    // Handle view modal format (applicant_name)
    if (!firstname && !lastname && props.applicant.applicant_name) {
      const nameParts = props.applicant.applicant_name.split(' ');
      firstname = nameParts[0] || '';
      lastname = nameParts.slice(1).join(' ') || '';
    }

    return [firstname, lastname, nameExtension].filter(Boolean).join(' ') || 'Applicant';
  });

  const displayPosition = computed(() => {
    return extractPosition(props.applicant) || props.examDetails?.position || 'N/A';
  });

  const displayOffice = computed(() => {
    return extractOffice(props.applicant) || props.examDetails?.office || 'N/A';
  });

  const displayItemNo = computed(() => {
    return extractItemNo(props.applicant) || props.examDetails?.itemNo || null;
  });

  // ── Methods ──────────────────────────────────────────────
  const formatDateEnglish = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.55);
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
  }

  .modal-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    color: #1a1a1a;
    font-family: system-ui, sans-serif;
    max-height: calc(100vh - 48px);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #d32f2f;
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

  .modal-body {
    padding: 20px 24px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    flex-shrink: 0;
  }

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

  .notice-box {
    background-color: #fff5f5;
    border-left: 5px solid #c0392b;
    padding: 15px 20px;
    margin: 25px 0;
    border-radius: 3px;
  }

  .notice-box p {
    margin: 0;
    color: #c0392b;
    font-weight: bold;
    font-size: 15px;
  }

  .details-section {
    margin: 16px 0;
  }

  .details-title,
  .reminders-title {
    font-size: 10pt;
    font-weight: 700;
    margin: 8px 0 4px;
  }

  .details-table {
    margin-left: 20px;
    border-collapse: collapse;
  }

  .details-label {
    font-weight: 600;
    padding-right: 16px;
    vertical-align: top;
  }

  .details-value {
    font-weight: normal;
  }

  .reminders-list {
    margin: 8px 0 8px 20px;
    padding-left: 0;
  }

  .reminders-list li {
    font-size: 10pt;
    line-height: 1.3;
    margin-bottom: 6px;
  }

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

  @media (max-width: 600px) {
    .modal-overlay {
      padding: 0;
      align-items: flex-start;
    }
    .modal-container {
      border-radius: 0;
      min-height: 100dvh;
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
    .modal-header,
    .modal-footer {
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
