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
              <span id="email-modal-heading">Exam Notification Preview</span>
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

                  <p class="letter-text">
                    Having qualified to the position, please be informed that you are scheduled for
                    a
                    <strong>Competency-Based Examination</strong>
                    as part of our recruitment process. As such, kindly refer to the exam schedule
                    below:
                  </p>

                  <div class="details-section">
                    <p class="details-title">Examination Details:</p>
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
                          <strong>{{ examDetails?.venue_exam || '' }}</strong>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div class="reminders-section">
                    <p class="reminders-title">Kindly be guided of the following reminders:</p>
                    <ul class="reminders-list">
                      <li>
                        Please arrive at least 30 minutes before your scheduled time of examination.
                      </li>
                      <li>Bring a valid ID for identification purposes.</li>
                      <li>Bring pencils, ballpens, and other necessary writing materials.</li>
                      <li>Observe proper/decent dress code when coming to an examination.</li>
                      <li>
                        Inform us in advance if you require special assistance (e.g., wheelchair or
                        mobility support).
                      </li>
                      <li>
                        Please be advised that HR personnel may take photos for documentation
                        purposes only. All data will be handled in accordance with data privacy
                        principles.
                      </li>
                    </ul>
                  </div>

                  <p class="letter-text">
                    The City Government of Tagum thru the Human Resource Merit Promotion and
                    Selection Board (HRMPSB) upholds the principle of Equal Employment Opportunity.
                    All applicants are treated fairly and evaluated based on merit, fitness, and
                    qualifications, without discrimination on the basis of gender, age, civil
                    status, disability, religion, or other protected characteristics.
                  </p>

                  <p class="letter-text">
                    If you have any clarifications, you may reach us through our mobile no.
                    <strong>{{ contactNumber }}</strong>
                    .
                  </p>

                  <p class="letter-text">Kindly reply to this email to confirm your attendance.</p>

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
                    This is a system-generated email.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="modal-footer">
            <q-btn flat label="Close" @click="$emit('close')" class="footer-close-btn" />
            <q-btn
              color="positive"
              :loading="isPrinting"
              :disable="isPrinting"
              @click="handlePrint"
              class="footer-print-btn"
            >
              <i class="ti ti-printer" style="margin-right: 6px"></i>
              {{ isPrinting ? 'Generating PDF...' : 'Print' }}
            </q-btn>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { toast } from 'src/boot/toast';
  import ReportHeader from 'src/components/Reports/ReportHeaderEmail.vue';

  const FONT_SIZE = 10;

  // ── Props ────────────────────────────────────────────────
  const props = defineProps({
    show: { type: Boolean, default: false },
    applicant: { type: Object, default: null },
    examDetails: { type: Object, default: null },
    contactNumber: { type: String, default: '09973962684' },
    signatoryName: { type: String, default: 'EDGAR C. DE GUZMAN' },
    signatoryTitle: { type: String, default: 'City Administrator' },
    currentDate: { type: [String, Date], default: () => new Date() },
  });

  defineEmits(['close']);

  const isPrinting = ref(false);

  // ── Helper to capitalize name properly ───────────────────
  const capitalizeName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ── Helpers ──────────────────────────────────────────────
  const extractPosition = (applicant) => {
    if (!applicant) return 'N/A';
    if (applicant.position) return applicant.position;
    if (applicant.positions?.length) return applicant.positions[0];
    if (applicant.job_batch_rsp?.Position) return applicant.job_batch_rsp.Position;
    return 'N/A';
  };

  const extractOffice = (applicant) => {
    if (!applicant) return 'N/A';
    if (applicant.office) return applicant.office;
    if (applicant.offices?.length) return applicant.offices[0];
    if (applicant.job_batch_rsp?.Office) return applicant.job_batch_rsp.Office;
    return 'N/A';
  };

  const extractItemNo = (applicant) => {
    if (!applicant) return null;
    if (applicant.itemNo) return applicant.itemNo;
    if (applicant.job_batch_rsp?.ItemNo) return applicant.job_batch_rsp.ItemNo;
    return null;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    let cleanTime = timeStr;
    if (typeof timeStr === 'string' && timeStr.includes('.') && timeStr.includes(':')) {
      cleanTime = timeStr.split('.')[0];
    }
    const parts = cleanTime.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0]);
      const minutes = parts[1];
      if (isNaN(hours) || hours < 0 || hours > 23) return timeStr;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  const formatDateEnglish = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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

  // ── Computed ─────────────────────────────────────────────
  const applicantName = computed(() => {
    if (!props.applicant) return 'Applicant';
    let firstname = props.applicant.firstname || '';
    let lastname = props.applicant.lastname || '';
    let nameExtension = props.applicant.name_extension || '';
    if (!firstname && !lastname && props.applicant.applicant_name) {
      const parts = props.applicant.applicant_name.split(' ');
      firstname = parts[0] || '';
      lastname = parts.slice(1).join(' ') || '';
    }
    const fullName = [firstname, lastname, nameExtension].filter(Boolean).join(' ') || 'Applicant';
    return capitalizeName(fullName);
  });

  const displayPosition = computed(
    () => extractPosition(props.applicant) || props.examDetails?.position || 'N/A',
  );
  const displayOffice = computed(
    () => extractOffice(props.applicant) || props.examDetails?.office || 'N/A',
  );
  const displayItemNo = computed(
    () => extractItemNo(props.applicant) || props.examDetails?.itemNo || null,
  );

  // ── PDF Header ───────────────────────────────────────────
  const buildPdfHeader = (logoBase64) => ({
    stack: [
      {
        canvas: [
          { type: 'rect', x: (595.28 - 523.28) / 2, y: 60, w: 523.28, h: 25, color: '#008000' },
        ],
      },
      {
        margin: [72, -65, 72, 0],
        columns: [
          {
            width: 65,
            stack: [
              { canvas: [{ type: 'rect', x: 0, y: 0, w: 75, h: 80, color: '#ffffff' }] },
              ...(logoBase64
                ? [{ image: logoBase64, width: 65, height: 65, absolutePosition: { x: 77, y: 22 } }]
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
  });

  // ── PDF Generation ───────────────────────────────────────
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

      const name = applicantName.value;
      const dateStr = formatDateEnglish(props.currentDate);
      const ex = props.examDetails;

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [60, 120, 60, 60],
        header: () => buildPdfHeader(logoBase64),
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
              'This pertains to your application for the ',
              { text: displayPosition.value, bold: true },
              ...(displayItemNo.value
                ? [', Item No. ', { text: displayItemNo.value, bold: true }]
                : []),
              ' in the ',
              { text: displayOffice.value, bold: true },
              '.',
            ],
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },
          {
            text: [
              'Having qualified to the position, please be informed that you are scheduled for a ',
              { text: 'Competency-Based Examination', bold: true },
              ' as part of our recruitment process. As such, kindly refer to the exam schedule below:',
            ],
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },
          // Exam Details
          { text: 'Examination Details:', fontSize: FONT_SIZE, bold: true, margin: [0, 0, 0, 4] },
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'Date:',
                    fontSize: FONT_SIZE,
                    bold: true,
                    border: [false, false, false, false],
                  },
                  {
                    text: formatDate(ex?.date_exam) || '',
                    fontSize: FONT_SIZE,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  {
                    text: 'Time:',
                    fontSize: FONT_SIZE,
                    bold: true,
                    border: [false, false, false, false],
                  },
                  {
                    text: formatTime(ex?.time_exam) || '',
                    fontSize: FONT_SIZE,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  {
                    text: 'Venue:',
                    fontSize: FONT_SIZE,
                    bold: true,
                    border: [false, false, false, false],
                  },
                  {
                    text: ex?.venue_exam || '',
                    fontSize: FONT_SIZE,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
              ],
            },
            margin: [20, 0, 0, 10],
          },
          // Reminders
          {
            text: 'Kindly be guided of the following reminders:',
            fontSize: FONT_SIZE,
            bold: true,
            margin: [0, 0, 0, 4],
          },
          {
            ul: [
              'Please arrive at least 30 minutes before your scheduled time of examination.',
              'Bring a valid ID for identification purposes.',
              'Bring pencils, ballpens, and other necessary writing materials.',
              'Observe proper/decent dress code when coming to an examination.',
              'Inform us in advance if you require special assistance (e.g., wheelchair or mobility support).',
              'Please be advised that HR personnel may take photos for documentation purposes only. All data will be handled in accordance with data privacy principles.',
            ],
            fontSize: FONT_SIZE,
            margin: [20, 0, 0, 10],
          },
          {
            text: 'The City Government of Tagum thru the Human Resource Merit Promotion and Selection Board (HRMPSB) upholds the principle of Equal Employment Opportunity. All applicants are treated fairly and evaluated based on merit, fitness, and qualifications, without discrimination on the basis of gender, age, civil status, disability, religion, or other protected characteristics.',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },
          {
            text: [
              'If you have any clarifications, you may reach us through our mobile no. ',
              { text: props.contactNumber, bold: true },
              '.',
            ],
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'Kindly reply to this email to confirm your attendance.',
            fontSize: FONT_SIZE,
            margin: [0, 0, 0, 10],
          },
          { text: 'Thank you.', fontSize: FONT_SIZE, margin: [0, 0, 0, 10] },
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
              { text: 'Chairperson', fontSize: FONT_SIZE, color: '#374151', margin: [0, 1, 0, 0] },
            ],
            margin: [0, 0, 0, 20],
          },
        ],
        defaultStyle: { fontSize: FONT_SIZE },
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
    background: #2e7d32;
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
    font-size: 10pt;
    font-weight: 600;
    padding-right: 16px;
    vertical-align: top;
  }

  .details-value {
    font-size: 10pt;
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
