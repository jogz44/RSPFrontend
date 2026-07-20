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
            <p class="state-text">Loading...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="state-box">
            <q-icon name="error_outline" size="48px" color="negative" />
            <p class="state-text">{{ error }}</p>
            <div class="state-actions">
              <q-btn flat label="Cancel" @click="$emit('close')" />
              <q-btn color="primary" label="Retry" @click="retryLoad" />
            </div>
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-header-left">
                <i class="ti ti-mail" aria-hidden="true"></i>
                <span id="email-modal-heading">Notification Preview — Application Received</span>
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

                    <!-- Addressee block -->
                    <p class="letter-addressee">
                      <strong class="addressee-name">{{ applicantNameUppercase }}</strong>
                      <br />
                      <span>{{ formattedAddressProper }}</span>
                    </p>

                    <p class="letter-greeting">Dear {{ applicantName }},</p>

                    <p class="letter-text">Greetings of Peace and Safety!</p>

                    <p class="letter-text">
                      Thank you for submitting your application for the position of
                      <strong>{{ position }}</strong>
                      <span v-if="itemNumber">, item # {{ itemNumber }}</span>
                      under the
                      <strong>{{ office }}</strong>
                      .
                    </p>

                    <p class="letter-text">
                      This is to formally acknowledge receipt of your application. Your application
                      is currently under review by our Human Resource Merit Promotion and Selection
                      Board Secretariat. We highly appreciate your interest in joining our
                      organization and your willingness to contribute your skills and expertise.
                    </p>

                    <p class="letter-text">
                      To facilitate further review and validation of your submitted application,
                      kindly provide hard copy of the following documents:
                    </p>

                    <!-- Required Documents List -->
                    <div class="documents-list">
                      <ul>
                        <li>Duly accomplished and subscribed Personal Data Sheet (PDS)</li>
                        <li>Work Experience Sheet</li>
                        <li>Application Letter</li>
                      </ul>
                    </div>

                    <p class="letter-text">
                      If you have applied for more than one position, a single submission of these
                      documents will suffice. You may forward the requirements via email at
                      <strong>lgutagumhrmo.recruitment@gmail.com</strong>
                      or submit them in person at our office.
                    </p>

                    <p class="letter-text">
                      Kindly await further updates regarding the status of your application. Should
                      you have any questions or require additional information, please feel free to
                      contact us.
                    </p>

                    <p class="letter-text">
                      Thank you, and we wish you the best of luck in the selection process.
                    </p>

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
  import { ref, computed } from 'vue';
  import { toast } from 'src/boot/toast';
  import ReportHeader from 'src/components/Reports/ReportHeaderEmail.vue';

  // ── Props ────────────────────────────────────────────────
  const props = defineProps({
    show: { type: Boolean, default: false },
    applicant: {
      type: Object,
      default: () => ({
        firstname: '',
        lastname: '',
        name_extension: '',
        email: '',
        address: '',
      }),
    },
    position: { type: String, default: '' },
    itemNumber: { type: String, default: '' },
    office: { type: String, default: '' },
    contactNumber: { type: String, default: '09178659351' },
    signatoryName: { type: String, default: 'EDGAR C. DE GUZMAN' },
    signatoryTitle: { type: String, default: 'City Administrator' },
    currentDate: { type: [String, Date], default: () => new Date() },
  });

  defineEmits(['close']);

  // ── State ────────────────────────────────────────────────
  const isLoading = ref(false);
  const error = ref(null);
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

  // ── Helper function for proper case ──────────────────────
  const toProperCase = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => {
        // Find the first letter character and capitalize it,
        // leaving any leading punctuation (like '(') untouched
        return word.replace(/([a-z])/, (char) => char.toUpperCase());
      })
      .join(' ');
  };

  // ── Static Default Address ───────────────────────────────
  const DEFAULT_ADDRESS = 'Purok, Barangay, City, Province';

  // ── Computed ─────────────────────────────────────────────
  const applicantName = computed(() => {
    const { firstname, lastname, name_extension } = props.applicant;
    const name = [firstname, lastname].filter(Boolean).join(' ');
    const extension = name_extension ? ` ${name_extension}` : '';
    const fullName = name ? name + extension : 'Applicant';
    return capitalizeName(fullName);
  });

  const applicantNameUppercase = computed(() => {
    return applicantName.value.toUpperCase();
  });

  const formattedAddressProper = computed(() => {
    const address = DEFAULT_ADDRESS;
    return toProperCase(address);
  });

  // ── Helpers ──────────────────────────────────────────────
  const formatDateEnglish = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const retryLoad = () => {
    error.value = null;
    isLoading.value = false;
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
    } catch (error) {
      console.warn('Failed to load image:', url, error);
      return null;
    }
  };

  // ── PDF Generation ───────────────────────────────────────
  const FONT_SIZE = 10;
  const FONT_SIZE_HEADER = 10;

  const handlePrint = async () => {
    if (isPrinting.value) return;
    isPrinting.value = true;

    try {
      // Show loading toast
      toast.info('Generating PDF, please wait...');

      const logoBase64 = await getImageBase64('/rsp/logo.png');

      const [pdfMakeModule, vfsFontsModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);

      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

      const name = applicantName.value;
      const nameUppercase = applicantNameUppercase.value;
      const dateStr = formatDateEnglish(props.currentDate);
      const addressStr = formattedAddressProper.value;
      const positionText = props.position || 'the position';
      const itemNumberText = props.itemNumber ? `, item # ${props.itemNumber}` : '';
      const officeText = props.office || 'the office';

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [60, 120, 60, 50],

        // Header with logo and letterhead
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

        // Main Content
        content: [
          // Date
          { text: dateStr, fontSize: FONT_SIZE, margin: [0, 0, 0, 10] },

          // Addressee block with UPPERCASE bold name and proper case address
          {
            stack: [
              { text: nameUppercase, fontSize: FONT_SIZE, bold: true, margin: [0, 0, 0, 2] },
              { text: addressStr, fontSize: FONT_SIZE, margin: [0, 0, 0, 15] },
            ],
          },

          // Salutation
          {
            text: `Dear ${name},`,
            fontSize: FONT_SIZE,
            margin: [0, 0, 0, 10],
          },

          {
            text: 'Greetings of Peace and Safety!',
            fontSize: FONT_SIZE,
            margin: [0, 0, 0, 10],
          },

          {
            text: [
              'Thank you for submitting your application for the position of ',
              { text: positionText, bold: true },
              `${itemNumberText} under the `,
              { text: officeText, bold: true },
              '.',
            ],
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },

          {
            text: 'This is to formally acknowledge receipt of your application. Your application is currently under review by our Human Resource Merit Promotion and Selection Board Secretariat. We highly appreciate your interest in joining our organization and your willingness to contribute your skills and expertise.',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },

          {
            text: 'To facilitate further review and validation of your submitted application, kindly provide hard copy of the following documents:',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 8],
          },

          // Documents list
          {
            ul: [
              'Duly accomplished and subscribed Personal Data Sheet (PDS)',
              'Work Experience Sheet',
              'Application Letter',
            ],
            fontSize: FONT_SIZE,
            margin: [10, 0, 0, 10],
          },

          {
            text: 'If you have applied for more than one position, a single submission of these documents will suffice. You may forward the requirements via email at lgutagumhrmo.recruitment@gmail.com or submit them in person at our office.',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },

          {
            text: 'Kindly await further updates regarding the status of your application. Should you have any questions or require additional information, please feel free to contact us.',
            fontSize: FONT_SIZE,
            alignment: 'justify',
            margin: [0, 0, 0, 10],
          },

          {
            text: 'Thank you, and we wish you the best of luck in the selection process.',
            fontSize: FONT_SIZE,
            margin: [0, 0, 0, 30],
          },

          { text: 'Sincerely,', fontSize: FONT_SIZE, margin: [0, 0, 0, 30] },

          // Signature block (no SGD in PDF)
          {
            stack: [
              {
                text: props.signatoryName,
                fontSize: FONT_SIZE,
                bold: true,
              },
              { text: props.signatoryTitle, fontSize: FONT_SIZE, margin: [0, 2, 0, 0] },
              {
                text: 'Authorized Representative of the City Mayor',
                fontSize: FONT_SIZE,
                margin: [0, 1, 0, 0],
              },
              {
                text: 'Chairperson',
                fontSize: FONT_SIZE,
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
          fontFamily: 'Roboto',
        },
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      // Open PDF in new tab
      pdfDocGenerator.getBlob((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        toast.success('PDF generated successfully!');
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

  /* Loading / Error states */
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

  /* Header */
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

  /* Body */
  .modal-body {
    padding: 20px 24px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  /* Footer */
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

  /* Letter wrapper */
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

  /* Letter typography */
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

  .letter-addressee .addressee-name {
    font-weight: bold;
  }

  .letter-text {
    text-align: justify;
  }

  /* Documents list */
  .documents-list {
    margin: 10px 0 10px 20px;
  }
  .documents-list ul {
    margin: 5px 0;
    padding-left: 20px;
  }
  .documents-list li {
    font-size: 10pt;
    line-height: 1.3;
    color: #000;
    margin: 3px 0;
  }

  /* Signature block */
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
    color: #000;
    margin-top: 1px;
  }

  /* System notice */
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

  /* Transitions */
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

  /* Responsive */
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

  /* Print styles */
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
      max-height: none;
      overflow: visible;
    }
    .modal-header,
    .modal-footer {
      display: none;
    }
    .modal-body {
      padding: 0;
      overflow: visible;
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
