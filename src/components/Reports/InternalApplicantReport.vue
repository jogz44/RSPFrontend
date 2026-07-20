<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Internal Applicant Report</div>
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
        v-else-if="!pdfUrl && !isLoading && internalRows.length === 0"
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
  import { ref, watch, onUnmounted } from 'vue';
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
  const internalRows = ref([]);

  // Watch for changes in publication date (immediate handles initial load)
  watch(
    () => props.publicationDate,
    async (newDate) => {
      if (newDate) {
        await fetchReportData();
        if (internalRows.value.length > 0) {
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

  // Helper function to format status
  function formatStatus(status) {
    if (!status) return 'N/A';
    // If status is CONTRACTUAL, display JOB ORDER
    if (status.toUpperCase() === 'CONTRACTUAL') {
      return 'JOB ORDER';
    }
    return status;
  }

  async function fetchReportData() {
    if (!props.publicationDate) return;

    isLoading.value = true;
    internalRows.value = [];

    try {
      await reportStore.fetchInternalList(props.publicationDate);

      // Handle the nested response structure correctly
      if (reportStore.report && reportStore.report.data) {
        const responseData = reportStore.report.data;

        // The data is directly in responseData.data array
        if (responseData.data && Array.isArray(responseData.data)) {
          const applicants = responseData.data;

          // Process internal applicants
          processApplicants(applicants, 'internal', internalRows.value);

          // Sort by formatted name
          internalRows.value.sort(sortByName);

          console.log('Processed internal applicants:', internalRows.value.length);
        } else {
          console.warn('No data array found in response:', responseData);
        }
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
      const age = applicant.age || 'N/A';
      const lengthOfService = applicant.lengthOfService || 'N/A';
      const currentPosition = applicant.current_position || 'N/A';
      const currentOffice = applicant.current_office || 'N/A';
      const status = formatStatus(applicant.status || '');

      if (applications.length === 0) {
        targetArray.push({
          applicantName: formattedName,
          age: age,
          currentPosition: currentPosition,
          currentOffice: currentOffice,
          status: status,
          lengthOfService: lengthOfService,
          appliedPosition: 'N/A',
          appliedOffice: 'N/A',
          pageNo: 'N/A',
          itemNo: 'N/A',
          salaryGrade: 'N/A',
          sortName: formattedName,
          isFirstRow: true,
          type: type,
        });
      } else {
        // Flatten the data - each application becomes its own row
        // Name, age, currentPosition, currentOffice, status, lengthOfService only on first row
        applications.forEach((app, appIndex) => {
          targetArray.push({
            applicantName: appIndex === 0 ? formattedName : '',
            age: appIndex === 0 ? age : '',
            currentPosition: appIndex === 0 ? currentPosition : '',
            currentOffice: appIndex === 0 ? currentOffice : '',
            status: appIndex === 0 ? status : '',
            lengthOfService: appIndex === 0 ? lengthOfService : '',
            appliedPosition: app.job_post?.Position || '',
            appliedOffice: app.job_post?.Office || '',
            pageNo: app.job_post?.PageNo || '',
            itemNo: app.job_post?.ItemNo || '',
            salaryGrade: app.job_post?.SalaryGrade || '',
            sortName: formattedName,
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

    if (internalRows.value.length === 0) {
      console.log('No data to generate PDF');
      pdfUrl.value = null;
      return;
    }

    const logoBase64 = await getImageBase64('/rsp/logo.png');

    import('pdfmake/build/pdfmake').then((pdfMakeModule) => {
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      import('pdfmake/build/vfs_fonts').then((vfsFontsModule) => {
        pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

        const tableBody = [];

        // Main header row - grey background with 11 columns (added Status column)
        tableBody.push([
          {
            text: 'APPLICANT NAME',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          { text: 'AGE', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
          {
            text: 'CURRENT POSITION',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'CURRENT OFFICE',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'STATUS',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'LENGTH OF SERVICE',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'APPLIED POSITION',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'APPLIED OFFICE',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'PAGE NO',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'ITEM NO',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
          {
            text: 'SALARY GRADE',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#e0e0e0',
          },
        ]);

        // Add all rows directly without section header
        internalRows.value.forEach((row) => {
          tableBody.push([
            { text: row.applicantName || '', alignment: 'left' },
            { text: row.age || '', alignment: 'center' },
            { text: row.currentPosition || '', alignment: 'left' },
            { text: row.currentOffice || '', alignment: 'left' },
            { text: row.status || '', alignment: 'center' },
            { text: row.lengthOfService || '', alignment: 'left' },
            { text: row.appliedPosition || '', alignment: 'left' },
            { text: row.appliedOffice || '', alignment: 'left' },
            { text: row.pageNo || '', alignment: 'center' },
            { text: row.itemNo || '', alignment: 'center' },
            { text: row.salaryGrade || '', alignment: 'center' },
          ]);
        });

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'landscape',
          pageMargins: [40, 120, 40, 50],
          header: function () {
            return {
              stack: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: (1008 - 928) / 2,
                      y: 60,
                      w: 928,
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
              text: `Internal Applicant Report - ${props.publicationDate || ''}`,
              fontSize: 14,
              bold: true,
              margin: [0, -20, 0, 16],
              alignment: 'center',
            },
            {
              table: {
                widths: ['12%', '4%', '13%', '12%', '6%', '12%', '14%', '14%', '4%', '4%', '5%'],
                body: tableBody,
                keepWithHeaderRows: 1,
              },
              layout: {
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
          },
          defaultStyle: { fontSize: 7.5 },
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
