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
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-header-left">
              <i class="ti ti-mail header-icon" aria-hidden="true"></i>
              <span class="modal-title" id="email-modal-heading">
                Send Notification — Unqualified Applicant
              </span>
            </div>
            <button class="close-btn" @click="$emit('close')" aria-label="Close modal">
              &times;
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Email fields row -->
            <!-- <div class="email-fields-row">
              <div class="field-group">
                <label class="field-label" for="recipient-email">Recipient email</label>
                <input
                  id="recipient-email"
                  v-model="recipientEmail"
                  class="field-input"
                  type="email"
                  placeholder="e.g. applicant@email.com"
                />
              </div>
              <div class="field-group">
                <label class="field-label" for="email-subject">Subject</label>
                <input id="email-subject" v-model="emailSubject" class="field-input" type="text" />
              </div>
            </div> -->

            <div class="divider" />

            <!-- Letter Preview -->
            <div class="letter-wrapper">
              <div class="letter-container">
                <!-- Shared report letterhead -->
                <ReportHeader />

                <!-- Letter Body -->
                <div class="letter-body">
                  <p class="letter-date">{{ formatDateEnglish(currentDate) }}</p>

                  <p class="letter-greeting">
                    Dear
                    <strong>{{ applicantName }}</strong>
                    ,
                  </p>

                  <p class="letter-text">Greetings of Peace and Safety!</p>

                  <p class="letter-text">
                    We wish to inform you that after careful evaluation of your application for the
                    position of
                    <strong>{{ position }}</strong>
                    , Item No.
                    <strong>{{ itemNo }}</strong>
                    , in the
                    <strong>{{ office }}</strong>
                    , the Human Resource Merit Promotion and Selection Board (HRMPSB) has determined
                    that you do not meet the Qualification Standards required for the said position.
                  </p>

                  <p class="letter-text">
                    After a thorough review of the documents you submitted on
                    <strong>{{ applicant.appliedDate || 'the date of your application' }}</strong>
                    , the following deficiencies were noted that led to your disqualification:
                  </p>

                  <!-- Editable deficiency reasons -->
                  <ul class="deficiency-list">
                    <li
                      v-for="(reason, index) in deficiencyReasons"
                      :key="index"
                      class="deficiency-item"
                    >
                      <strong>{{ reason.label }}:</strong>
                      <span
                        v-if="!reason.editing"
                        class="deficiency-text"
                        @click="reason.editing = true"
                        title="Click to edit"
                      >
                        {{ reason.text }}
                        <i class="ti ti-pencil edit-hint" aria-hidden="true"></i>
                      </span>
                      <input
                        v-else
                        v-model="reason.text"
                        class="deficiency-input"
                        @blur="reason.editing = false"
                        @keyup.enter="reason.editing = false"
                        autofocus
                      />
                    </li>
                  </ul>

                  <p class="letter-text">
                    We appreciate your interest in joining the City Government of Tagum and commend
                    your effort in applying for the position. We encourage you to continue enhancing
                    your qualifications and to apply for future vacancies that match your
                    credentials.
                  </p>

                  <p class="letter-text">
                    The City Government of Tagum upholds the principle of Equal Employment
                    Opportunity and ensures that all applicants are evaluated fairly based on merit,
                    fitness, and qualifications, without discrimination on the basis of gender, age,
                    civil status, disability, religion, or other protected characteristics.
                  </p>

                  <p class="letter-text">
                    If you have any questions or concerns, please do not hesitate to contact us at
                    <strong>{{ contactNumber }}</strong>
                    .
                  </p>

                  <p class="letter-text">Thank you for your understanding.</p>

                  <div class="signature-block">
                    <div class="sig-name">{{ signatoryName }}</div>
                    <div class="sig-title">{{ signatoryTitle }}</div>
                    <div class="sig-sub">Authorized Representative of the City Mayor</div>
                    <div class="sig-sub">Chairperson, HRMPSB</div>
                  </div>
                </div>
              </div>
            </div>

            <p class="edit-hint-note">
              <i class="ti ti-info-circle" aria-hidden="true"></i>
              Click on any deficiency line to edit it before sending.
            </p>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="$emit('close')">Cancel</button>
            <button class="btn btn-send" @click="handleSend" :disabled="isSending">
              <i class="ti ti-send" aria-hidden="true"></i>
              {{ isSending ? 'Sending...' : 'Send Notification' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import ReportHeader from 'src/components/Reports/ReportHeaderEmail.vue';

  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    applicant: {
      type: Object,
      default: () => ({
        firstname: '',
        lastname: '',
        name_extension: '',
        source: '',
        appliedDate: '',
        email: '',
      }),
    },
    position: {
      type: String,
      default: 'Administrative Officer II',
    },
    itemNo: {
      type: String,
      default: '#',
    },
    office: {
      type: String,
      default: 'OFFICE',
    },
    contactNumber: {
      type: String,
      default: '0917-123-4567',
    },
    signatoryName: {
      type: String,
      default: 'EDGAR C. DE GUZMAN',
    },
    signatoryTitle: {
      type: String,
      default: 'City Administrator',
    },
    currentDate: {
      type: [String, Date],
      default: () => new Date(),
    },
  });

  const emit = defineEmits(['close', 'sent', 'update:show']);

  const isSending = ref(false);
  const recipientEmail = ref('');
  const emailSubject = ref('');

  const deficiencyReasons = ref([
    {
      label: 'Education',
      text: 'Does not meet the minimum educational requirement for the position.',
      editing: false,
    },
    { label: 'Experience', text: 'Relevant work experience is insufficient.', editing: false },
    { label: 'Training', text: 'Required hours of relevant training are not met.', editing: false },
  ]);

  const applicantName = computed(() => {
    const parts = [
      props.applicant.firstname,
      props.applicant.lastname,
      props.applicant.name_extension,
    ];
    return parts.filter(Boolean).join(' ') || 'Applicant Name';
  });

  const formatDateEnglish = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const populateFields = () => {
    recipientEmail.value = props.applicant.email || '';
    emailSubject.value = `Notice of Disqualification – ${props.position} (Item No. ${props.itemNo})`;
    deficiencyReasons.value = [
      {
        label: 'Education',
        text: 'Does not meet the minimum educational requirement for the position.',
        editing: false,
      },
      { label: 'Experience', text: 'Relevant work experience is insufficient.', editing: false },
      {
        label: 'Training',
        text: 'Required hours of relevant training are not met.',
        editing: false,
      },
    ];
  };

  watch(
    () => props.show,
    (val) => {
      if (val) populateFields();
    },
    { immediate: true },
  );
  watch(
    () => props.applicant,
    () => {
      if (props.show) populateFields();
    },
    { deep: true },
  );

  const handleSend = async () => {
    if (!recipientEmail.value) {
      alert('Please enter a recipient email address.');
      return;
    }
    isSending.value = true;
    try {
      // TODO: replace with actual API call
      // await axios.post('/api/send-unqualified-email', {
      //   to: recipientEmail.value,
      //   subject: emailSubject.value,
      //   applicant_id: props.applicant.nPersonalInfo_id,
      //   submission_id: props.applicant.submission_id,
      //   deficiencies: deficiencyReasons.value.map(r => ({ label: r.label, text: r.text })),
      // });
      await new Promise((r) => setTimeout(r, 800));
      emit('sent', {
        to: recipientEmail.value,
        subject: emailSubject.value,
        deficiencies: deficiencyReasons.value.map((r) => ({ label: r.label, text: r.text })),
      });
      emit('close');
    } catch (err) {
      console.error('Failed to send email:', err);
      alert('Failed to send the notification. Please try again.');
    } finally {
      isSending.value = false;
    }
  };
</script>

<style scoped>
  /* ── Overlay ─────────────────────────────────────── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
  }

  /* ── Modal shell ─────────────────────────────────── */
  .modal-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 720px;
    max-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #1a1a1a;
    font-family: system-ui, sans-serif;
  }

  /* ── Header ──────────────────────────────────────── */
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
  }
  .header-icon {
    font-size: 18px;
    color: #fff;
  }
  .modal-title {
    font-size: 20px;
    font-weight: 500;
    color: #fff;
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
  }
  .close-btn:hover {
    opacity: 1;
  }

  /* ── Body ────────────────────────────────────────── */
  .modal-body {
    overflow-y: auto;
    padding: 20px 24px 14px;
    flex: 1;
  }

  /* email fields */
  .email-fields-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* ── Letter wrapper ──────────────────────────────── */
  .letter-wrapper {
    background: #f3f4f6;
    border-radius: 10px;
    padding: 16px;
  }
  .letter-container {
    width: 100%;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: #000;
    padding: 32px 40px 28px;
    box-sizing: border-box;
  }

  /* letter body */
  .letter-body {
    padding-top: 4px;
  }

  .letter-date {
    font-size: 10pt;
    margin: 18px 0 14px;
    color: #000;
  }
  .letter-greeting {
    font-size: 10pt;
    margin-bottom: 14px;
    color: #000;
  }
  .letter-text {
    font-size: 10pt;
    line-height: 1.8;
    margin-bottom: 13px;
    text-align: justify;
    color: #000;
  }

  /* deficiency list */
  .deficiency-list {
    margin: 10px 0 14px 36px;
    padding-left: 4px;
  }
  .deficiency-item {
    font-size: 10pt;
    line-height: 1.8;
    margin-bottom: 6px;
    color: #000;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .deficiency-text {
    cursor: pointer;
    border-bottom: 1px dashed #9ca3af;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .deficiency-text:hover {
    border-bottom-color: #185fa5;
    color: #185fa5;
  }
  .edit-hint {
    font-size: 10px;
    color: #9ca3af;
  }
  .deficiency-input {
    flex: 1;
    font-size: 10pt;
    font-family: 'Times New Roman', Times, serif;
    color: #000;
    border: 1px solid #185fa5;
    border-radius: 4px;
    padding: 2px 8px;
    outline: none;
    min-width: 200px;
  }

  /* signature */
  .signature-block {
    margin-top: 40px;
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
    margin-top: 3px;
  }
  .sig-sub {
    font-size: 10px;
    color: #374151;
    margin-top: 2px;
    font-family: system-ui, sans-serif;
  }

  .edit-hint-note {
    font-size: 10px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
  }
  .edit-hint-note i {
    font-size: 12px;
  }

  /* ── Footer ──────────────────────────────────────── */
  .modal-footer {
    border-top: 0.5px solid #e5e7eb;
    padding: 12px 20px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    background: #f9fafb;
    flex-shrink: 0;
  }
  .btn {
    font-family: system-ui, sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .btn-cancel {
    background: #fff;
    border: 0.5px solid #d1d5db;
    color: #374151;
  }
  .btn-cancel:hover {
    background: #f3f4f6;
  }
  .btn-send {
    background: #15803d;
    border: 1px solid #15803d;
    color: #fff;
  }
  .btn-send:hover {
    background: #166534;
    border-color: #166534;
  }
  .btn-send:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ── Transition ──────────────────────────────────── */
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
    transform: translateY(-12px);
    opacity: 0;
  }

  /* ── Responsive ──────────────────────────────────── */
  @media (max-width: 600px) {
    .email-fields-row {
      grid-template-columns: 1fr;
    }
    .modal-body {
      padding: 16px;
    }
    .letter-container {
      padding: 20px 18px;
    }
    .modal-footer {
      flex-direction: column;
    }
    .btn {
      width: 100%;
      justify-content: center;
    }
  }

  /* ── Print ───────────────────────────────────────── */
  @media print {
    .modal-overlay {
      position: static;
      background: none;
      padding: 0;
    }
    .modal-container {
      max-height: none;
      box-shadow: none;
      border-radius: 0;
    }
    .modal-header,
    .modal-footer,
    .email-fields-row,
    .divider,
    .edit-hint-note {
      display: none;
    }
    .modal-body {
      overflow: visible;
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
