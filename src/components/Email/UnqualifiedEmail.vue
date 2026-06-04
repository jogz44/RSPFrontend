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

                    <p class="letter-greeting">Dear {{ applicantName }},</p>

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
                            <th>Prescribed QS</th>
                            <th>Position Requirements</th>
                            <th>Assessment</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in qsRows" :key="row.key">
                            <td>
                              <strong>{{ row.label }}</strong>
                            </td>
                            <td>{{ row.required }}</td>
                            <td>
                              {{ row.remark }}
                            </td>
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

                    <p class="letter-text">Sincerely,</p>

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

            <!-- Sticky Footer -->
            <div class="modal-footer">
              <q-btn flat label="Close" @click="$emit('close')" class="footer-close-btn" />
              <q-btn
                color="primary"
                :loading="isPrinting"
                :disable="isPrinting"
                @click="handlePrint"
                class="footer-print-btn"
              >
                <i class="ti ti-printer" style="margin-right: 6px"></i>
                {{ isPrinting ? 'Generating PDF...' : 'Print' }}
              </q-btn>
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
  const isPrinting = ref(false);

  // ── Computed ─────────────────────────────────────────────
  const applicantName = computed(() => {
    const { firstname, lastname, name_extension } = props.applicant;
    // Capitalize each part properly (first letter uppercase, rest lowercase)
    const capitalizeName = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const fullName = [firstname, lastname, name_extension]
      .filter(Boolean)
      .map(capitalizeName)
      .join(' ');

    return fullName || 'Applicant';
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
        remark: d.remarks?.education,
        meets: d.remarks?.education === MEETS,
      },
      {
        key: 'experience',
        label: 'Experience',
        required: d.qs_jobpost?.experience,
        remark: d.remarks?.experience,
        meets: d.remarks?.experience === MEETS,
      },
      {
        key: 'training',
        label: 'Training',
        required: d.qs_jobpost?.training,
        remark: d.remarks?.training,
        meets: d.remarks?.training === MEETS,
      },
      {
        key: 'eligibility',
        label: 'Eligibility',
        required: d.qs_jobpost?.eligibility,
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

  // ── Image helper ─────────────────────────────────────────
  const getImageBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // ── PDF Generation ───────────────────────────────────────
  const FONT_SIZE = 10;
  const FONT_SIZE_HEADER = 10;

  const buildQsTableBody = () => {
    const header = [
      { text: 'Prescribed QS', style: 'tableHeader' },
      { text: 'Position Requirements', style: 'tableHeader' },
      { text: 'Assessment', style: 'tableHeader' },
    ];

    const rows = qsRows.value.map((row) => [
      { text: row.label, fontSize: FONT_SIZE, bold: true },
      { text: row.required || '-', fontSize: FONT_SIZE },
      {
        text: row.remark || '-',
        fontSize: FONT_SIZE,
        color: '#000000',
      },
    ]);

    return [header, ...rows];
  };

  const handlePrint = async () => {
    if (isPrinting.value) return;
    isPrinting.value = true;

    try {
      const logoBase64 = await getImageBase64('/logo.png');

      const [pdfMakeModule, vfsFontsModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);

      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

      const d = applicantDetails.value;
      const name = applicantName.value;
      const dateStr = formatDateEnglish(props.currentDate);

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [60, 120, 60, 50],

        header: () => ({
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: (595.28 - 523.28) / 2,
                  y: 60,
                  w: 523.28,
                  h: 25,
                  color: '#008000',
                },
              ],
            },
            {
              margin: [72, -65, 72, 0],
              columns: [
                {
                  width: 65,
                  stack: [
                    {
                      canvas: [{ type: 'rect', x: 0, y: 0, w: 75, h: 80, color: '#ffffff' }],
                    },
                    ...(logoBase64
                      ? [
                          {
                            image: logoBase64,
                            width: 65,
                            height: 65,
                            absolutePosition: { x: 77, y: 22 },
                          },
                        ]
                      : []),
                  ],
                },
                {
                  width: '*',
                  margin: [15, -15, 0, 0],
                  stack: [
                    {
                      text: 'REPUBLIC OF THE PHILIPPINES',
                      fontSize: 8,
                      color: '#00703c',
                      alignment: 'left',
                      margin: [0, 20, 0, 2],
                    },
                    {
                      text: 'PROVINCE OF DAVAO DEL NORTE',
                      fontSize: 8,
                      color: '#00703c',
                      alignment: 'left',
                      margin: [0, 0, 0, 2],
                    },
                    {
                      text: 'CITY OF TAGUM',
                      fontSize: 10,
                      bold: true,
                      color: '#00703c',
                      alignment: 'left',
                    },
                    {
                      text: 'HUMAN RESOURCE MERIT PROMOTION AND SELECTION BOARD',
                      fontSize: 11,
                      bold: true,
                      color: 'white',
                      margin: [0, 7, 0, 0],
                    },
                  ],
                },
              ],
            },
          ],
        }),

        footer: () => ({
          stack: [
            {
              text: 'This is a system-generated email.',
              fontSize: 8,
              color: '#6b7280',
              alignment: 'center',
              margin: [60, 8, 60, 2],
            },
          ],
        }),

        content: [
          { text: dateStr, fontSize: FONT_SIZE, margin: [0, 0, 0, 10] },

          {
            text: `Dear ${name},`,
            fontSize: FONT_SIZE,
            margin: [0, 0, 0, 10],
          },

          { text: 'Greetings of Peace and Safety!', fontSize: FONT_SIZE, margin: [0, 0, 0, 10] },

          {
            text: [
              'We wish to inform you that after careful evaluation of your application for the position of ',
              { text: d.position || 'N/A', bold: true },
              ', in the ',
              { text: d.office || 'N/A', bold: true },
              ', the Human Resource Merit Promotion and Selection Board (HRMPSB) has determined that you do not meet the Qualification Standards required for the said position.',
            ],
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },

          {
            text: 'After a thorough review of the documents you submitted, the following deficiencies were noted that led to your disqualification:',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 8],
          },

          {
            table: {
              headerRows: 1,
              widths: ['30%', '40%', '30%'],
              body: buildQsTableBody(),
            },
            layout: {
              fillColor: (rowIndex) => (rowIndex === 0 ? '#f0f0f0' : null),
            },
            margin: [0, 0, 0, 8],
          },

          {
            text: 'We appreciate your interest in joining the City Government of Tagum and commend your effort in applying for the position. We encourage you to continue enhancing your qualifications and to apply for future vacancies that match your credentials.',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 10, 0, 10],
          },

          {
            text: 'The City Government of Tagum upholds the principle of Equal Employment Opportunity and ensures that all applicants are evaluated fairly based on merit, fitness, and qualifications, without discrimination on the basis of gender, age, civil status, disability, religion, or other protected characteristics.',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },

          {
            text: [
              'If you have any questions or concerns, please do not hesitate to contact us at ',
              { text: props.contactNumber, bold: true },
              '.',
            ],
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },

          {
            text: 'Thank you for your understanding.',
            fontSize: FONT_SIZE,
            margin: [0, 0, 0, 30],
          },
          { text: 'Sincerely,', fontSize: FONT_SIZE, margin: [0, 0, 0, 30] },

          {
            stack: [
              {
                text: `(SGD.) ${props.signatoryName}`,
                fontSize: FONT_SIZE,
                bold: true,
              },
              { text: props.signatoryTitle, fontSize: FONT_SIZE, margin: [0, 2, 0, 0] },
              {
                text: 'Authorized Representative of the City Mayor',
                fontSize: FONT_SIZE,
                color: '#374151',
                margin: [0, 1, 0, 0],
              },
              {
                text: 'Chairperson',
                fontSize: FONT_SIZE,
                color: '#374151',
                margin: [0, 1, 0, 0],
              },
            ],
            margin: [0, 0, 0, 20],
          },
        ],

        styles: {
          tableHeader: {
            fontSize: FONT_SIZE_HEADER,
            bold: true,
            fillColor: '#f0f0f0',
          },
        },

        defaultStyle: {
          fontSize: FONT_SIZE,
        },
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      isPrinting.value = false;
    }
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

  .modal-body {
    padding: 20px 24px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px;
    border-top: 1px solid #e5e7eb;
    background: #fff;
    flex-shrink: 0;
  }

  .footer-close-btn {
    color: #6b7280;
  }

  .footer-print-btn {
    display: flex;
    align-items: center;
    gap: 4px;
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

  .table-section {
    margin: 10px 0;
    overflow-x: auto;
  }
  .qs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
    line-height: 1.2;
    border: 1px solid #d1d5db;
    margin-bottom: 6px;
  }
  .qs-table thead {
    background: #f0f0f0;
  }
  .qs-table th {
    padding: 5px 7px;
    text-align: left;
    font-size: 10pt;
    font-weight: 700;
    color: #1f2937;
    border-right: 1px solid #d1d5db;
    border-bottom: 1px solid #d1d5db;
  }
  .qs-table th:last-child {
    border-right: none;
  }
  .qs-table td {
    padding: 5px 7px;
    font-size: 10pt;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
    word-break: break-word;
  }
  .qs-table td:last-child {
    border-right: none;
  }
  .qs-table tbody tr:hover {
    background: #f9fafb;
  }

  .signature-block {
    margin-top: 24px;
    line-height: 1.2;
  }
  .sig-name {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #000;
  }
  .sig-title {
    font-size: 10pt;
    color: #000;
    margin-top: 2px;
  }
  .sig-sub {
    font-size: 10pt;
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
