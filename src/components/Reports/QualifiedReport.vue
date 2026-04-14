<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Qualified Applicants Report</div>
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
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useSummaryReportStore } from 'stores/summaryReportStore';
  import { useQuasar } from 'quasar';

  const props = defineProps({
    publicationDate: {
      type: String,
      required: true,
    },
  });

  const summaryReportStore = useSummaryReportStore();
  const $q = useQuasar();

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const reportData = ref(null);

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

  // Fetch report data
  async function fetchReportData() {
    try {
      isLoading.value = true;
      const response = await summaryReportStore.fetchQualifiedReport(props.publicationDate);
      reportData.value = response;
      console.log('Report data:', response);
    } catch (error) {
      console.error('Error fetching qualified report:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to load qualified applicants report',
      });
    } finally {
      isLoading.value = false;
    }
  }

  function normalizeLineBreaks(text = '') {
    return String(text).replace(/<br\s*\/?>/gi, '\n');
  }

  // Generate table rows from report data (show ALL applicants)
  function generateTableRows() {
    if (!reportData.value || !reportData.value.jobPosts) {
      return [];
    }

    const rows = [];

    reportData.value.jobPosts.forEach((jobPost) => {
      // Position header row (gray background)
      rows.push([
        {
          text: `${jobPost.Abbr} ${jobPost.ItemNo}`,
          style: 'positionRow',
          fillColor: '#d9d9d9',
          alignment: 'center',
        },
        {
          text: jobPost.SalaryGrade || '',
          style: 'positionRow',
          fillColor: '#d9d9d9',
          alignment: 'center',
        },
        {
          text: jobPost.Position || '',
          style: 'positionRow',
          fillColor: '#d9d9d9',
        },
        {
          text: jobPost.criteria?.Education || '',
          style: 'positionRow',
          fillColor: '#d9d9d9',
        },
        {
          text: jobPost.criteria?.Experience || '',
          style: 'positionRow',
          fillColor: '#d9d9d9',
        },
        {
          text: jobPost.criteria?.Training || '',
          style: 'positionRow',
          fillColor: '#d9d9d9',
        },
        {
          text: jobPost.criteria?.Eligibility || '',
          style: 'positionRow',
          fillColor: '#d9d9d9',
        },
      ]);

      if (jobPost.applicants && jobPost.applicants.length > 0) {
        const uniqueApplicants = jobPost.applicants.filter(
          (applicant, index, self) =>
            index ===
            self.findIndex(
              (a) => a.firstname === applicant.firstname && a.lastname === applicant.lastname,
            ),
        );

        let counter = 1;

        uniqueApplicants.forEach((applicant) => {
          const applicantName = `${applicant.firstname || ''} ${applicant.lastname || ''}`.trim();

          const isOutsider = String(applicant.applicant_status || '').toUpperCase() === 'OUTSIDER';

          const positionText = (applicant.current_designation || '').toUpperCase();
          const officeText = (applicant.office || '').toUpperCase();

          const nameCellText = isOutsider
            ? `${counter}. ${applicantName.toUpperCase()} (OUTSIDER)`
            : `${counter}. ${applicantName.toUpperCase()}\n${positionText}\n${officeText}`;

          const educationText = normalizeLineBreaks(applicant.education_text || 'N/A');
          const experienceText = normalizeLineBreaks(applicant.experience_text || 'N/A');
          const trainingText = normalizeLineBreaks(applicant.training_text || 'N/A');
          const eligibilityText = normalizeLineBreaks(applicant.eligibility_text || 'N/A');

          const eduRemark = applicant.education_remark
            ? `\n\nREMARKS: ${applicant.education_remark}`
            : '';
          const expRemark = applicant.experience_remark
            ? `\n\nREMARKS: ${applicant.experience_remark}`
            : '';
          const trainRemark = applicant.training_remark
            ? `\n\nREMARKS: ${applicant.training_remark}`
            : '';
          const eligRemark = applicant.eligibility_remark
            ? `\n\nREMARKS: ${applicant.eligibility_remark}`
            : '';

          rows.push([
            { text: '', style: 'applicantRow' },
            { text: '', style: 'applicantRow' },
            { text: nameCellText, style: 'applicantRow' },
            { text: `${educationText}${eduRemark}`, style: 'applicantRow', fontSize: 7 },
            { text: `${experienceText}${expRemark}`, style: 'applicantRow', fontSize: 7 },
            { text: `${trainingText}${trainRemark}`, style: 'applicantRow', fontSize: 7 },
            { text: `${eligibilityText}${eligRemark}`, style: 'applicantRow', fontSize: 7 },
          ]);

          counter += 1;
        });

        if (counter === 1) {
          rows.push([
            {},
            {},
            { text: 'No qualified applicants', colSpan: 5, alignment: 'left', italics: true },
            {},
            {},
            {},
            {},
          ]);
        }
      } else {
        rows.push([
          {},
          {},
          { text: 'No qualified applicants', colSpan: 5, alignment: 'left', italics: true },
          {},
          {},
          {},
          {},
        ]);
      }
    });

    return rows;
  }

  async function generatePdfContent() {
    if (!reportData.value) {
      console.error('No report data available');
      return;
    }

    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }

    const logoBase64 = await getImageBase64('/logo.png');

    import('pdfmake/build/pdfmake').then((pdfMakeModule) => {
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      import('pdfmake/build/vfs_fonts').then((vfsFontsModule) => {
        pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

        const tableRows = generateTableRows();

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'landscape',
          pageMargins: [72, 120, 72, 40],
          header: function () {
            return {
              stack: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: (1008 - 936) / 2,
                      y: 60,
                      w: 936,
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
                          text: 'CITY HUMAN RESOURCE MANAGEMENT OFFICE',
                          fontSize: 13,
                          bold: true,
                          color: 'white',
                          margin: [0, 5, 0, 0],
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
              text: reportData.value.Header || "APPLICANT'S QUALIFICATION STANDARDS",
              fontSize: 14,
              bold: true,
              alignment: 'center',
              margin: [0, -20, 0, 0],
            },
            {
              text: reportData.value.Date || `${props.publicationDate} PUBLICATION`,
              fontSize: 14,
              bold: true,
              alignment: 'center',
              margin: [0, 0, 0, 30],
            },
            {
              table: {
                headerRows: 2,
                widths: ['8%', '4%', '15%', '18%', '18%', '18%', '18%'],
                body: [
                  [
                    { text: 'Plantilla Code', style: 'tableHeader', rowSpan: 2 },
                    { text: 'SG', style: 'tableHeader', rowSpan: 2 },
                    {
                      text: "Position Title with Applicant's Name",
                      style: 'tableHeader',
                      rowSpan: 2,
                    },
                    { text: 'Qualification Standards', style: 'tableHeader', colSpan: 4 },
                    {},
                    {},
                    {},
                  ],
                  [
                    {},
                    {},
                    {},
                    { text: 'Education', style: 'tableHeader' },
                    { text: 'Experience', style: 'tableHeader' },
                    { text: 'Training', style: 'tableHeader' },
                    { text: 'Eligibility', style: 'tableHeader' },
                  ],
                  ...tableRows,
                ],
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#000000',
                vLineColor: () => '#000000',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2,
                fillColor: (rowIndex) => (rowIndex === 0 || rowIndex === 1 ? '#ffc000' : null),
              },
            },
          ],
          styles: {
            tableHeader: {
              fontSize: 8,
              bold: true,
              alignment: 'center',
            },
            positionRow: {
              fontSize: 7,
              bold: true,
              alignment: 'left',
            },
            applicantRow: {
              fontSize: 7,
              alignment: 'left',
            },
          },
          defaultStyle: {
            fontSize: 7,
          },
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
    await fetchReportData();
    if (reportData.value) {
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
