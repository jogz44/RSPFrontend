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

  // Helper function to clean and format phone number (no spaces)
  function cleanPhoneNumber(phone) {
    if (!phone) return 'N/A';

    // Remove spaces, dashes, parentheses, slashes, and dots
    let cleaned = phone.replace(/[\s\-()/.]/g, '');

    // Check if it's a valid number
    if (cleaned.length === 0) return 'N/A';

    // If number has 10 digits and starts with 9, add 0 at the beginning
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      cleaned = '0' + cleaned;
    }

    // If number has 11 digits and starts with 09 or 9, keep as is
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
      // Already in correct format
    } else if (cleaned.length === 11 && cleaned.startsWith('9')) {
      cleaned = '0' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('639')) {
      // Convert 639... to 09...
      cleaned = '0' + cleaned.substring(2);
    }

    // Return without spaces
    return cleaned;
  }

  // Sort function by formatted name (Last, First)
  function sortByName(a, b) {
    const nameA = a.sortName || '';
    const nameB = b.sortName || '';
    return nameA.localeCompare(nameB);
  }

  // Helper function to get age from date of birth
  function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 'N/A';

    // Parse date in MM/DD/YYYY format
    const parts = dateOfBirth.split('/');
    if (parts.length !== 3) return 'N/A';

    const month = parseInt(parts[0]) - 1; // JS months are 0-indexed
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    const birthDate = new Date(year, month, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age.toString();
  }

  async function fetchReportData() {
    if (!props.publicationDate) return;

    isLoading.value = true;
    internalRows.value = [];
    externalRows.value = [];
    reportData.value = null;

    try {
      await reportStore.fetchApplicantList(props.publicationDate);

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
      const email = (applicant.email_address || '').toLowerCase();
      const contactNumber = cleanPhoneNumber(applicant.cellphone_number);
      const age = calculateAge(applicant.date_of_birth);

      if (applications.length === 0) {
        targetArray.push({
          applicantName: formattedName,
          position: 'N/A',
          office: 'N/A',
          salaryGrade: 'N/A',
          itemNo: 'N/A',
          email: email,
          contactNumber: contactNumber,
          age: age,
          lengthOfService: 'N/A',
          sortName: formattedName,
          isFirstRow: true,
          type: type,
        });
      } else {
        // Flatten the data - each application becomes its own row
        // Name, email, contact, age, length of service only on first row, empty on subsequent rows
        applications.forEach((app, appIndex) => {
          // For internal applicants, get length of service from the application
          let lengthOfService = 'N/A';
          if (type === 'internal' && app.lengthOfService) {
            lengthOfService = app.lengthOfService;
          }

          targetArray.push({
            applicantName: appIndex === 0 ? formattedName : '',
            position: app.job_post?.Position || 'N/A',
            office: app.job_post?.Office || 'N/A',
            salaryGrade: app.job_post?.SalaryGrade || 'N/A',
            itemNo: app.job_post?.ItemNo || 'N/A',
            email: appIndex === 0 ? email : '',
            contactNumber: appIndex === 0 ? contactNumber : '',
            age: appIndex === 0 ? age : '',
            lengthOfService: appIndex === 0 && type === 'internal' ? lengthOfService : '',
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
        // Only show Age and Length of Service columns for internal applicants
        const isInternalOnly = props.applicantType === 'internal';

        if (isInternalOnly) {
          // For internal only - show 9 columns including Age and Length of Service
          // Reduced font sizes and adjusted column widths to prevent overflow
          tableBody.push([
            {
              text: 'APPLICANT NAME',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'AGE',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'LENGTH OF SERVICE',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'POSITION',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'OFFICE',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'SALARY GRADE',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'ITEM NO',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'EMAIL',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
            {
              text: 'CONTACT NUMBER',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
              fontSize: 7,
            },
          ]);
        } else {
          // For external or both - show 7 columns without Age and Length of Service
          tableBody.push([
            {
              text: 'APPLICANT NAME',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
            },
            { text: 'POSITION', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
            { text: 'OFFICE', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
            {
              text: 'SALARY GRADE',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
            },
            { text: 'ITEM NO', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
            { text: 'EMAIL', style: 'tableHeader', alignment: 'center', fillColor: '#e0e0e0' },
            {
              text: 'CONTACT NUMBER',
              style: 'tableHeader',
              alignment: 'center',
              fillColor: '#e0e0e0',
            },
          ]);
        }

        // Helper function to add applicant rows for a section
        function addSectionRows(rows, sectionTitle) {
          if (rows.length === 0) return;

          // Add section header row - grey background
          const colSpan = isInternalOnly ? 9 : 7;
          tableBody.push([
            {
              text: sectionTitle,
              colSpan: colSpan,
              style: 'sectionHeader',
              alignment: 'center',
              bold: true,
              fillColor: '#e0e0e0',
              fontSize: 8,
            },
            ...Array(colSpan - 1).fill({}),
          ]);

          // Add all rows (no rowspan, each row is independent)
          rows.forEach((row) => {
            if (isInternalOnly) {
              // For internal - show all 9 columns including age and length of service with smaller font
              tableBody.push([
                { text: row.applicantName || '', alignment: 'left', fontSize: 7 },
                { text: row.age || '', alignment: 'center', fontSize: 7 },
                { text: row.lengthOfService || '', alignment: 'center', fontSize: 7 },
                { text: row.position || '', alignment: 'left', fontSize: 7 },
                { text: row.office || '', alignment: 'left', fontSize: 7 },
                { text: row.salaryGrade || '', alignment: 'center', fontSize: 7 },
                { text: row.itemNo || '', alignment: 'center', fontSize: 7 },
                { text: row.email || '', alignment: 'left', fontSize: 7 },
                { text: row.contactNumber || '', alignment: 'left', fontSize: 7 },
              ]);
            } else {
              // For external/both - show 7 columns without age and length of service
              tableBody.push([
                { text: row.applicantName || '', alignment: 'left' },
                { text: row.position || '', alignment: 'left' },
                { text: row.office || '', alignment: 'left' },
                { text: row.salaryGrade || '', alignment: 'center' },
                { text: row.itemNo || '', alignment: 'center' },
                { text: row.email || '', alignment: 'left' },
                { text: row.contactNumber || '', alignment: 'left' },
              ]);
            }
          });
        }

        // Add sections based on applicantType prop
        if (props.applicantType === 'internal') {
          addSectionRows(internalRows.value, 'INTERNAL APPLICANTS');
        } else if (props.applicantType === 'external') {
          addSectionRows(externalRows.value, 'EXTERNAL APPLICANTS');
        } else {
          // 'both' - add Internal section first then External section
          // But for 'both', we hide Age and Length of Service (only show for internal-only view)
          addSectionRows(internalRows.value, 'INTERNAL APPLICANTS');
          addSectionRows(externalRows.value, 'EXTERNAL APPLICANTS');
        }

        // Generate title based on applicant type
        let reportTitle = 'List of All Applicants';
        if (props.applicantType === 'internal') {
          reportTitle = 'List of Internal Applicants';
        } else if (props.applicantType === 'external') {
          reportTitle = 'List of External Applicants';
        }

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'landscape',
          pageMargins: [30, 120, 30, 50], // Reduced margins to give more space
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
              text: `${reportTitle} - ${props.publicationDate || ''}`,
              fontSize: 14,
              bold: true,
              margin: [0, -20, 0, 16],
              alignment: 'center',
            },
            {
              table: {
                widths: isInternalOnly
                  ? ['12%', '3%', '10%', '18%', '22%', '7%', '5%', '15%', '8%']
                  : ['15%', '21%', '25%', '8%', '5%', '18%', '8%'],
                body: tableBody,
                keepWithHeaderRows: 1,
              },
              layout: {
                fillColor: function (rowIndex, node) {
                  const row = node.table.body[rowIndex];
                  if (row && row[0] && row[0].colSpan === (isInternalOnly ? 9 : 7)) {
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
          defaultStyle: { fontSize: 7 },
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
