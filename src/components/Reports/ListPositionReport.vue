<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">List of Position Report</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-separator />
    <div class="q-pa-md" style="flex: 1; min-height: 0; display: flex; flex-direction: column">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-spinner color="primary" size="32px" />
        <div>Loading report...</div>
      </div>

      <!-- PDF Generation State -->
      <div
        v-if="!pdfUrl && !isLoading"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-spinner color="primary" size="32px" />
        <div>Generating PDF preview...</div>
      </div>

      <!-- PDF Viewer -->
      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        style="width: 100%; height: 100%; border: none"
        type="application/pdf"
      ></iframe>
    </div>
  </q-card>
</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted } from 'vue';
  import { useSummaryReportStore } from 'stores/summaryReportStore';

  const props = defineProps({
    publicationDate: {
      type: String,
      required: true,
    },
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const summaryReportStore = useSummaryReportStore();
  const reportData = ref(null);

  // Watch for changes in publication date and regenerate report
  watch(
    () => props.publicationDate,
    async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        await fetchReportData();
        await generatePdfContent();
      }
    },
  );

  /**
   * Convert display date (e.g., "Apr 15, 2026") to API format (e.g., "2026-04-15")
   */
  function formatDateForApi(dateString) {
    if (!dateString) return '';

    // Try parsing the date string
    const date = new Date(dateString);

    // Check if date is valid
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Return original if cannot parse
    console.warn('Unable to parse date:', dateString);
    return dateString;
  }

  async function fetchReportData() {
    if (isLoading.value) return;

    isLoading.value = true;

    try {
      // Format the date to YYYY-MM-DD before sending to API
      const formattedDate = formatDateForApi(props.publicationDate);
      console.log('Sending date to API:', formattedDate); // For debugging

      const data = await summaryReportStore.fetchListPositionReport(formattedDate);
      reportData.value = data;
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // Helper function to convert image to base64
  async function getImageBase64(url) {
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
      console.error('Error loading image:', error);
      return null;
    }
  }

  /**
   * Format the publication date to show in the report header (for display purposes)
   */
  function getPublicationDateDisplay() {
    if (!props.publicationDate) return '';

    // Handle date format like "Apr 28, 2026"
    const date = new Date(props.publicationDate);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // If already in YYYY-MM-DD format, convert for display
    if (/^\d{4}-\d{2}-\d{2}$/.test(props.publicationDate)) {
      const [year, month, day] = props.publicationDate.split('-');
      const displayDate = new Date(year, month - 1, day);
      return displayDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return props.publicationDate;
  }

  /**
   * Build the table body for the report
   */
  function buildTableBody() {
    if (!reportData.value || !Array.isArray(reportData.value) || reportData.value.length === 0) {
      return [[{ text: 'No data available', colSpan: 6, alignment: 'center' }]];
    }

    const body = [];

    // Table Header
    body.push([
      { text: 'Page No.', style: 'tableHeader', alignment: 'center' },
      { text: 'Item No.', style: 'tableHeader', alignment: 'center' },
      { text: 'Position', style: 'tableHeader', alignment: 'left' },
      { text: 'Office', style: 'tableHeader', alignment: 'left' },
      { text: 'SG', style: 'tableHeader', alignment: 'center' },
      { text: 'Rate', style: 'tableHeader', alignment: 'center' },
    ]);

    // Table Rows
    reportData.value.forEach((item) => {
      body.push([
        { text: item.PageNo || '', alignment: 'center', margin: [0, 2] },
        { text: item.ItemNo || '', alignment: 'center', margin: [0, 2] },
        { text: item.Position || '', alignment: 'left', margin: [0, 2] },
        { text: item.Office || '', alignment: 'left', margin: [0, 2] },
        { text: item.SalaryGrade || '', alignment: 'center', margin: [0, 2] },
        { text: item.monthly_salary || '', alignment: 'right', margin: [0, 2] },
      ]);
    });

    return body;
  }

  /**
   * Generate the PDF document
   */
  async function generatePdfContent() {
    // Revoke previous PDF URL if it exists
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }

    if (!reportData.value) {
      return;
    }

    const logoBase64 = await getImageBase64('/logo.png');

    // Dynamically import pdfmake
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;

    const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
    pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

    const publicationDateDisplay = getPublicationDateDisplay();

    // Build document definition
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [60, 120, 60, 50],

      // Header with government seal and letterhead
      header: function () {
        return {
          stack: [
            // Green rectangle bar
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
            // Logo and header text
            {
              margin: [72, -65, 72, 0],
              columns: [
                // Logo column
                {
                  width: 65,
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'rect',
                          x: 0,
                          y: 0,
                          w: 75,
                          h: 80,
                          color: '#ffffff',
                        },
                      ],
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
                // Text column
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
        };
      },

      // Footer with page numbers
      footer: function (currentPage, pageCount) {
        return {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'right',
          fontSize: 8,
          margin: [0, 10, 30, 0],
        };
      },

      // Main content
      content: [
        // Title Section
        [
          [
            {
              stack: [
                {
                  text: 'LIST OF POSITION',
                  fontSize: 10,
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: `As of ${publicationDateDisplay}`.toUpperCase() || '',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 3, 0, 20],
                },
              ],
            },
          ],
        ],

        // Data Table
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*', 'auto', 'auto'],
            body: buildTableBody(),
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 1.5 : 0.5;
            },
            vLineWidth: function () {
              return 0.5;
            },
            hLineColor: function (i) {
              return i === 0 || i === 1 ? '#333333' : '#cccccc';
            },
            vLineColor: function () {
              return '#cccccc';
            },
            paddingLeft: function (i) {
              return i === 0 ? 4 : 3;
            },
            paddingRight: function (i) {
              return i === 0 ? 4 : 3;
            },
            paddingTop: function (i) {
              return i === 0 ? 6 : 4;
            },
            paddingBottom: function (i) {
              return i === 0 ? 6 : 4;
            },
            fillColor: function (i) {
              return i === 0 ? '#e8e8e8' : null;
            },
          },
        },
      ],

      // Styles
      styles: {
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: '#000000',
        },
      },

      // Default text style
      defaultStyle: {
        fontSize: 8,
        color: '#333333',
      },
    };

    // Generate PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
      pdfUrl.value = URL.createObjectURL(blob);
    });
  }

  // Clean up on unmount
  onUnmounted(() => {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
    }
  });

  // Fetch data on mount
  onMounted(async () => {
    if (props.publicationDate) {
      await fetchReportData();
      await generatePdfContent();
    }
  });
</script>

<style scoped>
  .modal-card {
    width: 100%;
    max-width: 90vw;
    height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  }
</style>
