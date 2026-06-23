<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Withdrawn Applicant Report</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-separator />
    <div class="q-pa-md" style="flex: 1; min-height: 0; display: flex; flex-direction: column">
      <div
        v-if="isLoading"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-spinner color="primary" size="32px" />
        <div>Loading report...</div>
      </div>
      <div
        v-else-if="!pdfUrl && !isLoading && filteredRows.length === 0"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-icon name="info" size="48px" />
        <div>No data available for this date</div>
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
  import { ref, watch, onUnmounted, computed } from 'vue';
  import { useReportStore } from 'stores/reportStore';

  const props = defineProps({
    publicationDate: {
      type: String,
      default: null,
    },
    applicantType: {
      type: String,
      default: 'both', // 'both', 'internal', 'external'
    },
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const reportStore = useReportStore();
  const reportData = ref(null);
  const internalRows = ref([]);
  const externalRows = ref([]);

  // Filter rows based on applicantType prop
  const filteredRows = computed(() => {
    if (props.applicantType === 'internal') {
      return internalRows.value;
    } else if (props.applicantType === 'external') {
      return externalRows.value;
    } else {
      // 'both' - combine both arrays
      return [...internalRows.value, ...externalRows.value];
    }
  });

  // Watch for changes in publication date (immediate handles initial load)
  watch(
    () => props.publicationDate,
    async (newDate) => {
      if (newDate) {
        await fetchReportData();
        if (internalRows.value.length > 0 || externalRows.value.length > 0) {
          await generatePdfContent();
        }
      }
    },
    { immediate: true },
  );

  // Helper function to format name: Last, First Middle
  function formatFullName(firstname, lastname) {
    if (!firstname && !lastname) return '';
    const first = firstname ? firstname.trim().toUpperCase() : '';
    const last = lastname ? lastname.trim().toUpperCase() : '';
    if (last && first) return `${last}, ${first}`;
    if (last) return last;
    if (first) return first;
    return '';
  }

  // Sort function by formatted name (Last, First)
  function sortByName(a, b) {
    const nameA = a.sortName || '';
    const nameB = b.sortName || '';
    return nameA.localeCompare(nameB);
  }

  async function fetchReportData() {
    if (!props.publicationDate) return;

    isLoading.value = true;
    internalRows.value = [];
    externalRows.value = [];
    reportData.value = null;

    try {
      await reportStore.fetchWithdrawnApplicantList(props.publicationDate);

      // Handle the nested response structure correctly
      if (reportStore.report && reportStore.report.data) {
        if (reportStore.report.data.data && reportStore.report.data.data.external) {
          // Structure with external and internal arrays
          const externalApplicants = reportStore.report.data.data.external || [];
          const internalApplicants = reportStore.report.data.data.internal || [];

          // Process external applicants
          processApplicants(externalApplicants, 'external', externalRows.value);

          // Process internal applicants
          processApplicants(internalApplicants, 'internal', internalRows.value);

          // Sort both arrays by formatted name
          externalRows.value.sort(sortByName);
          internalRows.value.sort(sortByName);
        } else if (Array.isArray(reportStore.report.data)) {
          // Old structure - treat all as external
          processApplicants(reportStore.report.data, 'external', externalRows.value);
          externalRows.value.sort(sortByName);
        } else if (reportStore.report.data.applicants) {
          processApplicants(reportStore.report.data.applicants, 'external', externalRows.value);
          externalRows.value.sort(sortByName);
        } else {
          console.warn('Unexpected data structure:', reportStore.report);
        }

        console.log('External applicants:', externalRows.value.length);
        console.log('Internal applicants:', internalRows.value.length);
      } else {
        console.warn('No report data found');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      isLoading.value = false;
    }
  }

  function processApplicants(applicants, type, targetArray) {
    if (!applicants || !Array.isArray(applicants)) {
      console.warn(`Invalid ${type} applicants data:`, applicants);
      return;
    }

    console.log(`Processing ${applicants.length} ${type} applicants`);

    applicants.forEach((item) => {
      const applicant = item;
      const applications = applicant.applicant_application || [];
      const formattedName = formatFullName(applicant.firstname, applicant.lastname);

      if (applications.length === 0) {
        targetArray.push({
          applicantName: formattedName,
          position: 'N/A',
          office: 'N/A',
          salaryGrade: 'N/A',
          itemNo: 'N/A',
          sortName: formattedName,
          isFirstRow: true,
          type: type,
        });
      } else {
        // Flatten the data - each application becomes its own row
        // Name, email, contact only on first row, empty on subsequent rows
        applications.forEach((app, appIndex) => {
          targetArray.push({
            applicantName: appIndex === 0 ? formattedName : '',
            position: app.job_post?.Position || 'N/A',
            office: app.job_post?.Office || 'N/A',
            salaryGrade: app.job_post?.SalaryGrade || 'N/A',
            itemNo: app.job_post?.ItemNo || 'N/A',

            sortName: formattedName, // Keep the full name for sorting
            isFirstRow: appIndex === 0,
            type: type,
            submissionId: app.submission_id,
          });
        });
      }
    });
  }

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

  async function generatePdfContent() {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
    }

    if (filteredRows.value.length === 0) {
      console.log('No data to generate PDF');
      pdfUrl.value = null;
      return;
    }

    const logoBase64 = await getImageBase64('/logo.png');

    import('pdfmake/build/pdfmake').then((pdfMakeModule) => {
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      import('pdfmake/build/vfs_fonts').then((vfsFontsModule) => {
        pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

        const tableBody = [];

        // Main header row - grey background
        tableBody.push([
          {
            text: 'APPLICANT NAME',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          { text: 'POSITION', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
          { text: 'OFFICE', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
          { text: 'SALARY GRADE', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
          { text: 'ITEM NO', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
        ]);

        // Helper function to add applicant rows for a section
        function addSectionRows(rows, sectionTitle, showSectionHeader = true) {
          if (rows.length === 0) return;

          // Only add section header if showSectionHeader is true
          if (showSectionHeader) {
            tableBody.push([
              {
                text: sectionTitle,
                colSpan: 5,
                style: 'sectionHeader',
                alignment: 'center',
                bold: true,
                fillColor: '#e0e0e0',
              },
              {},
              {},
              {},
              {},
            ]);
          }

          // Add all rows
          rows.forEach((row) => {
            tableBody.push([
              { text: row.applicantName || '', alignment: 'left', margin: [0, 3, 0, 3] },
              { text: row.position || '', alignment: 'left', margin: [0, 3, 0, 3] },
              { text: row.office || '', alignment: 'left', margin: [0, 3, 0, 3] },
              { text: row.salaryGrade || '', alignment: 'center', margin: [0, 3, 0, 3] },
              { text: row.itemNo || '', alignment: 'center', margin: [0, 3, 0, 3] },
            ]);
          });
        }

        // Add sections based on applicantType prop
        if (props.applicantType === 'internal') {
          addSectionRows(internalRows.value, 'INTERNAL APPLICANTS', false); // No section header
        } else if (props.applicantType === 'external') {
          addSectionRows(externalRows.value, 'EXTERNAL APPLICANTS', false); // No section header
        } else {
          // 'both' - show section headers
          addSectionRows(internalRows.value, 'INTERNAL APPLICANTS', true);
          addSectionRows(externalRows.value, 'EXTERNAL APPLICANTS', true);
        }

        // Generate title based on applicant type
        let reportTitle = 'List of All Withdrawn Applicants';
        if (props.applicantType === 'internal') {
          reportTitle = 'List of Internal Withdrawn Applicants';
        } else if (props.applicantType === 'external') {
          reportTitle = 'List of External Withdrawn Applicants';
        }

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'portrait', // Changed from 'landscape' to 'portrait'
          pageMargins: [40, 120, 40, 50],
          header: function () {
            return {
              stack: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 40, // Left margin
                      y: 60,
                      w: 532, // Legal width (8.5" = 612 points) - (40px * 2 margins) = 532, adjust as needed
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
          footer: function (currentPage, pageCount) {
            return {
              margin: [40, 0, 40, 20],
              columns: [
                { text: `Page ${currentPage} of ${pageCount}`, alignment: 'center', fontSize: 7 },
              ],
            };
          },
          content: [
            {
              text: `${reportTitle} - ${props.publicationDate || ''}`,
              fontSize: 12,
              bold: true,
              margin: [0, -20, 0, 16],
              alignment: 'center',
            },
            {
              table: {
                widths: ['20%', '30%', '35%', '8%', '7%'], // Adjusted for portrait (5 columns)
                body: tableBody,
                keepWithHeaderRows: 1,
              },
              layout: {
                fillColor: function (rowIndex, node) {
                  const row = node.table.body[rowIndex];
                  if (row && row[0] && row[0].colSpan === 5) {
                    return '#e0e0e0';
                  }
                  return null;
                },
                hLineWidth: function () {
                  return 0.3;
                },
                vLineWidth: function () {
                  return 0.3;
                },
                hLineColor: function () {
                  return '#aaaaaa';
                },
                vLineColor: function () {
                  return '#aaaaaa';
                },
              },
            },
          ],
          styles: {
            tableHeader: {
              fontSize: 8,
              bold: true,
            },
            sectionHeader: {
              fontSize: 8,
              margin: [0, 4, 0, 4],
            },
          },
          defaultStyle: { fontSize: 8 },
        };

        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob((blob) => {
          pdfUrl.value = URL.createObjectURL(blob);
        });
      });
    });
  }

  onUnmounted(() => {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  });
</script>

<style scoped>
  .modal-card {
    width: 100%;
    max-width: 1200px;
    height: 85vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  }
</style>
