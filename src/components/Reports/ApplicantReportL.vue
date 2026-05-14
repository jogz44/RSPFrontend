<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Applicant Report</div>
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
        v-else-if="!pdfUrl && !isLoading && tableData.length === 0"
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
  import { ref, watch, onMounted, onUnmounted } from 'vue';
  import { useReportStore } from 'stores/reportStore';

  const props = defineProps({
    publicationDate: {
      type: String,
      default: null,
    },
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const reportStore = useReportStore();
  const reportData = ref(null);
  const tableData = ref([]);

  // Watch for changes in publication date
  watch(
    () => props.publicationDate,
    async (newDate) => {
      if (newDate) {
        await fetchReportData();
        if (tableData.value.length > 0) {
          await generatePdfContent();
        }
      }
    },
    { immediate: true },
  );

  async function fetchReportData() {
    if (!props.publicationDate) return;

    isLoading.value = true;
    tableData.value = [];
    reportData.value = null;

    try {
      await reportStore.fetchApplicantList(props.publicationDate);

      // Handle the nested response structure correctly
      if (reportStore.report && reportStore.report.data) {
        if (reportStore.report.data.data && Array.isArray(reportStore.report.data.data)) {
          reportData.value = reportStore.report.data.data;
        } else if (Array.isArray(reportStore.report.data)) {
          reportData.value = reportStore.report.data;
        } else if (reportStore.report.data.applicants) {
          reportData.value = reportStore.report.data.applicants;
        } else {
          console.warn('Unexpected data structure:', reportStore.report);
          reportData.value = [];
        }

        console.log('Report data extracted:', reportData.value);
        transformDataForTable();
      } else {
        console.warn('No report data found');
        reportData.value = [];
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      isLoading.value = false;
    }
  }

  function transformDataForTable() {
    const rows = [];

    if (!reportData.value || !Array.isArray(reportData.value)) {
      console.warn('Invalid report data:', reportData.value);
      return;
    }

    console.log('Transforming data for', reportData.value.length, 'applicants');

    reportData.value.forEach((item) => {
      const applicant = item.applicant || item;
      const applications = applicant.applicant_application || [];

      if (applications.length === 0) {
        rows.push({
          applicantName: `${applicant.firstname || ''} ${applicant.lastname || ''}`
            .trim()
            .toUpperCase(),
          position: 'N/A',
          office: 'N/A',
          salaryGrade: 'N/A',
          itemNo: 'N/A',
          email: (applicant.email_address || '').toLowerCase(),
          contactNumber: applicant.cellphone_number || 'N/A',
          rowspan: 1,
          isFirstRow: true,
        });
      } else {
        applications.forEach((app, appIndex) => {
          rows.push({
            applicantName: `${applicant.firstname || ''} ${applicant.lastname || ''}`
              .trim()
              .toUpperCase(),
            position: app.job_post?.Position || 'N/A',
            office: app.job_post?.Office || 'N/A',
            salaryGrade: app.job_post?.SalaryGrade || 'N/A',
            itemNo: app.job_post?.ItemNo || 'N/A',
            email: (applicant.email_address || '').toLowerCase(),
            contactNumber: applicant.cellphone_number || 'N/A',
            rowspan: applications.length,
            isFirstRow: appIndex === 0,
          });
        });
      }
    });

    tableData.value = rows;
    console.log('Transformed rows:', tableData.value.length);
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

    if (!tableData.value.length) {
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

        // Header row - Applicant Name, Position, Office, Salary Grade, Item No, Email, Contact Number
        tableBody.push([
          { text: 'APPLICANT NAME', style: 'tableHeader', alignment: 'center' },
          { text: 'POSITION', style: 'tableHeader', alignment: 'center' },
          { text: 'OFFICE', style: 'tableHeader', alignment: 'center' },
          { text: 'SALARY GRADE', style: 'tableHeader', alignment: 'center' },
          { text: 'ITEM NO', style: 'tableHeader', alignment: 'center' },
          { text: 'EMAIL', style: 'tableHeader', alignment: 'center' },
          { text: 'CONTACT NUMBER', style: 'tableHeader', alignment: 'center' },
        ]);

        let currentIndex = 0;
        while (currentIndex < tableData.value.length) {
          const row = tableData.value[currentIndex];
          const rowspan = row.rowspan;

          if (rowspan > 1 && row.isFirstRow) {
            // Row with rowspan for Applicant Name, Email, Contact Number
            tableBody.push([
              { text: row.applicantName || '', rowSpan: rowspan, alignment: 'left' },
              { text: row.position || '', alignment: 'left' },
              { text: row.office || '', alignment: 'left' },
              { text: row.salaryGrade || '', alignment: 'center' },
              { text: row.itemNo || '', alignment: 'center' },
              { text: row.email || '', rowSpan: rowspan, alignment: 'left' },
              { text: row.contactNumber || '', rowSpan: rowspan, alignment: 'left' },
            ]);
          } else if (rowspan === 1) {
            // Single row applicant
            tableBody.push([
              { text: row.applicantName || '', alignment: 'left' },
              { text: row.position || '', alignment: 'left' },
              { text: row.office || '', alignment: 'left' },
              { text: row.salaryGrade || '', alignment: 'center' },
              { text: row.itemNo || '', alignment: 'center' },
              { text: row.email || '', alignment: 'left' },
              { text: row.contactNumber || '', alignment: 'left' },
            ]);
          } else if (!row.isFirstRow) {
            // Subsequent rows for same applicant
            tableBody.push([
              { text: '', alignment: 'left' },
              { text: row.position || '', alignment: 'left' },
              { text: row.office || '', alignment: 'left' },
              { text: row.salaryGrade || '', alignment: 'center' },
              { text: row.itemNo || '', alignment: 'center' },
              { text: '', alignment: 'left' },
              { text: '', alignment: 'left' },
            ]);
          }

          currentIndex++;
        }

        const docDefinition = {
          pageSize: 'A4',
          pageOrientation: 'landscape',
          pageMargins: [40, 120, 40, 40],
          header: function () {
            return {
              stack: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: (841.89 - 761.89) / 2, // Centered for landscape
                      y: 60,
                      w: 761.89,
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
          content: [
            {
              text: `List of All Applicants - ${props.publicationDate || ''}`,
              fontSize: 14,
              bold: true,
              margin: [0, -20, 0, 16],
              alignment: 'center',
            },
            {
              table: {
                headerRows: 1,
                widths: ['17%', '15%', '25%', '8%', '7%', '18%', '10%'],
                body: tableBody,
              },
              layout: {
                fillColor: function (rowIndex) {
                  return rowIndex === 0 ? '#e0e0e0' : null;
                },
                hLineWidth: function () {
                  return 0.5;
                },
                vLineWidth: function () {
                  return 0.5;
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
              fontSize: 9,
              bold: true,
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

  onMounted(async () => {
    if (props.publicationDate) {
      await fetchReportData();
      if (tableData.value.length > 0) {
        await generatePdfContent();
      }
    }
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
