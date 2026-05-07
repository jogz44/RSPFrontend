<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Unqualified Applicants Report</div>
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
      const response = await summaryReportStore.fetchUnqualifiedReport(props.publicationDate);
      reportData.value = response;
      console.log('Report data:', response);
    } catch (error) {
      console.error('Error fetching unqualified report:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to load unqualified applicants report',
      });
    } finally {
      isLoading.value = false;
    }
  }

  // Format cell content for unqualified applicants

  function formatUnqualifiedCellContent(applicantText, remark, type) {
    let result = '';

    // Check if there's actual qualification text
    if (applicantText && applicantText !== 'N/A') {
      let cleanText = applicantText;
      cleanText = cleanText.replace(/•\s*/g, '');

      // If it's "No relevant..." type messages, display as is
      if (applicantText.includes('No relevant')) {
        result = applicantText;
      } else {
        // Parse actual qualifications
        if (type === 'education') {
          const degreeMatch = cleanText.match(/(.+?)(?:\s*\(|$)/);
          result = degreeMatch ? degreeMatch[1].trim() : cleanText;
        } else if (type === 'experience') {
          const expMatch = cleanText.match(/(\d+ years?,?\s*\d* months?,?\s*\d* days?)/i);
          result = expMatch ? expMatch[1] : cleanText;
        } else if (type === 'training') {
          const hoursMatch = cleanText.match(/(\d+)\s*hours?/i);
          result = hoursMatch ? `${hoursMatch[1]} HOURS` : cleanText;
        } else if (type === 'eligibility') {
          const eligMatch = cleanText.match(/(.+?)(?:\s*-\s*Rating|$)/);
          result = eligMatch ? eligMatch[1].trim() : cleanText;
        } else {
          result = cleanText;
        }
      }
    } else {
      result = 'NO QUALIFICATION RECORDED';
    }

    if (remark && remark.trim()) {
      result += `\n\nREMARKS: ${remark.toUpperCase()}`;
    }

    return result.toUpperCase();
  }

  // Generate table rows from report data
  function generateTableRows() {
    if (!reportData.value || !reportData.value.jobPosts) {
      return [];
    }

    const rows = [];

    reportData.value.jobPosts.forEach((jobPost) => {
      // Position header row (gray background) - ALL UPPERCASE
      rows.push([
        {
          text: `${jobPost.Abbr} ${jobPost.ItemNo}`.toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          alignment: 'center',
        },
        {
          text: (jobPost.SalaryGrade || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          alignment: 'center',
        },
        {
          text: (jobPost.Position || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
        },
        {
          text: (jobPost.criteria?.Education || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
        },
        {
          text: (jobPost.criteria?.Experience || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
        },
        {
          text: (jobPost.criteria?.Training || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
        },
        {
          text: (jobPost.criteria?.Eligibility || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
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

          rows.push([
            { text: '', style: 'applicantRow' },
            { text: '', style: 'applicantRow' },
            { text: nameCellText, style: 'applicantRow', fontSize: 7 },
            {
              text: formatUnqualifiedCellContent(
                applicant.education_text,
                applicant.education_remark,
                'education',
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
            {
              text: formatUnqualifiedCellContent(
                applicant.experience_text,
                applicant.experience_remark,
                'experience',
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
            {
              text: formatUnqualifiedCellContent(
                applicant.training_text,
                applicant.training_remark,
                'training',
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
            {
              text: formatUnqualifiedCellContent(
                applicant.eligibility_text,
                applicant.eligibility_remark,
                'eligibility',
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
          ]);

          counter += 1;
        });
      } else {
        rows.push([
          {},
          {},
          { text: 'NO APPLICANT', colSpan: 5, alignment: 'center', italics: true },
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
                          text: 'REPUBLIC OF THE PHILIPPINES'.toUpperCase(),
                          fontSize: 8,
                          color: '#00703c',
                          alignment: 'left',
                          margin: [0, 20, 0, 2],
                        },
                        {
                          text: 'PROVINCE OF DAVAO DEL NORTE'.toUpperCase(),
                          fontSize: 8,
                          color: '#00703c',
                          alignment: 'left',
                          margin: [0, 0, 0, 2],
                        },
                        {
                          text: 'CITY OF TAGUM'.toUpperCase(),
                          fontSize: 10,
                          bold: true,
                          color: '#00703c',
                          alignment: 'left',
                        },
                        {
                          text: 'CITY HUMAN RESOURCE MANAGEMENT OFFICE'.toUpperCase(),
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
              text: (
                reportData.value.Header || "APPLICANT'S UNQUALIFICATION STANDARDS"
              ).toUpperCase(),
              fontSize: 13,
              bold: true,
              alignment: 'center',
              margin: [0, -20, 0, 0],
            },
            {
              text: (reportData.value.Date || `${props.publicationDate} PUBLICATION`).toUpperCase(),
              fontSize: 12,
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
                    { text: 'PLANTILLA CODE', style: 'tableHeader', rowSpan: 2, fontSize: 7 },
                    { text: 'SG', style: 'tableHeader', rowSpan: 2, fontSize: 7 },
                    {
                      text: "POSITION TITLE WITH APPLICANT'S NAME",
                      style: 'tableHeader',
                      rowSpan: 2,
                      fontSize: 7,
                    },
                    {
                      text: 'QUALIFICATION STANDARDS',
                      style: 'tableHeader',
                      colSpan: 4,
                      fontSize: 7,
                    },
                    {},
                    {},
                    {},
                  ],
                  [
                    {},
                    {},
                    {},
                    { text: 'EDUCATION', style: 'tableHeader', fontSize: 7 },
                    { text: 'EXPERIENCE', style: 'tableHeader', fontSize: 7 },
                    { text: 'TRAINING', style: 'tableHeader', fontSize: 7 },
                    { text: 'ELIGIBILITY', style: 'tableHeader', fontSize: 7 },
                  ],
                  ...tableRows,
                ],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#000000',
                vLineColor: () => '#000000',
                paddingLeft: () => 3,
                paddingRight: () => 3,
                paddingTop: () => 2,
                paddingBottom: () => 2,
                fillColor: (rowIndex) => (rowIndex === 0 || rowIndex === 1 ? '#ffc000' : null),
              },
            },
          ],
          styles: {
            tableHeader: {
              fontSize: 7,
              bold: true,
              alignment: 'center',
            },
            positionRow: {
              fontSize: 6.5,
              bold: true,
              alignment: 'left',
            },
            applicantRow: {
              fontSize: 7,
              alignment: 'left',
            },
            applicantCell: {
              fontSize: 6.5,
              alignment: 'left',
            },
          },
          defaultStyle: {
            fontSize: 6.5,
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
