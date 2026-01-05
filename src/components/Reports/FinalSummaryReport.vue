<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Final Summary Report</div>
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
  import { ref, watch, onMounted, onUnmounted } from 'vue';
  import { useApplicantStore } from 'stores/applicantStore';

  const props = defineProps({
    positions: {
      type: Array,
      default: () => [],
    },
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const applicantStore = useApplicantStore();
  const allReportsData = ref([]);

  // Watch for changes in positions and regenerate report
  watch(
    () => props.positions,
    async (newVal) => {
      if (newVal && newVal.length) {
        await fetchAllApplicants();
        await generatePdfContent();
      }
    },
    { immediate: true },
  );

  async function fetchAllApplicants() {
    allReportsData.value = [];
    isLoading.value = true;
    try {
      for (const positionId of props.positions) {
        const reportData = await applicantStore.fetchApplicantDetail(positionId);
        if (reportData) {
          allReportsData.value.push(reportData);
        }
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
    isLoading.value = false;
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

  // Function to get max number of raters for a single report
  function getMaxRatersCount(reportData) {
    if (!reportData?.applicants) return 0;

    let maxRaters = 0;
    reportData.applicants.forEach((item) => {
      const ratersCount = item.score?.length || 0;
      if (ratersCount > maxRaters) {
        maxRaters = ratersCount;
      }
    });
    return maxRaters;
  }

  // Function to get unique raters for a single report
  function getAllRaters(reportData) {
    if (!reportData?.applicants) return [];

    const ratersMap = new Map();

    reportData.applicants.forEach((item) => {
      if (item.score && Array.isArray(item.score)) {
        item.score.forEach((scoreItem) => {
          if (!ratersMap.has(scoreItem.rater_id)) {
            ratersMap.set(scoreItem.rater_id, {
              id: scoreItem.rater_id,
              name: scoreItem.rater_name,
              position: scoreItem.rater_position,
            });
          }
        });
      }
    });

    return Array.from(ratersMap.values());
  }

  // Generate table for single position
  function generatePositionTable(reportData) {
    const maxRaters = getMaxRatersCount(reportData);
    const allRaters = getAllRaters(reportData);

    // Build header row with dynamic raters
    const headerRow = [
      { text: 'NAME OF APPLICANT', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
    ];

    // Add "HRM PSB MEMBER RATINGS" header spanning all rater columns
    if (maxRaters > 0) {
      headerRow.push({
        text: 'HRM PSB MEMBER RATINGS',
        style: 'tableHeader',
        alignment: 'center',
        colSpan: maxRaters,
      });
      // Add empty cells for the colspan
      for (let i = 1; i < maxRaters; i++) {
        headerRow.push({});
      }
    }

    // Add new column headers
    headerRow.push({
      text: 'TOTAL RATING\n(70%)',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    headerRow.push({
      text: 'BEI\n(30%)',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    headerRow.push({
      text: 'FINAL RATING',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    headerRow.push({
      text: 'RANKING',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    // Build second header row with individual rater names
    const subHeaderRow = [{}]; // Empty for "Name of Applicant" (rowSpan from above)

    allRaters.forEach((rater) => {
      subHeaderRow.push({
        text: `${rater.name}`,
        style: 'tableHeader',
        alignment: 'center',
        fontSize: 9,
      });
    });

    // Empty cells for new columns (they have rowSpan from headerRow)
    subHeaderRow.push({}); // TOTAL RATING (70%)
    subHeaderRow.push({}); // BEI (30%)
    subHeaderRow.push({}); // FINAL RATING
    subHeaderRow.push({}); // RANKING

    // Build data rows with calculations
    const dataRowsWithScores = reportData.applicants.map((item) => {
      const row = [];

      // Applicant name
      const fullName =
        `${item.applicant?.firstname || ''} ${item.applicant?.lastname || ''}`.trim();
      row.push({ text: fullName, alignment: 'left' });

      // Create a map of rater scores for this applicant
      const scoresMap = new Map();
      let beiScore = 0;

      if (item.score && Array.isArray(item.score)) {
        item.score.forEach((scoreItem) => {
          scoresMap.set(scoreItem.rater_id, scoreItem.grand_total || scoreItem.total_qs || '');
          // Get BEI score (assuming it's the same across raters, take the first one)
          if (!beiScore && scoreItem.bei) {
            beiScore = parseFloat(scoreItem.bei) || 0;
          }
        });
      }

      // Add scores in order of raters
      allRaters.forEach((rater) => {
        const score = scoresMap.get(rater.id) || '-';
        row.push({ text: score, alignment: 'center' });
      });

      // Calculate average rating from all raters
      const scores = Array.from(scoresMap.values()).filter((s) => s !== '');
      const averageRating =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + parseFloat(score), 0) / scores.length
          : 0;

      // TOTAL RATING (70%) = Average Rating * 0.70
      const totalRating70 = (averageRating * 0.7).toFixed(2);
      row.push({ text: totalRating70, alignment: 'center', bold: true });

      const bei30 = beiScore.toFixed(2);
      row.push({ text: bei30, alignment: 'center', bold: true });

      // FINAL RATING = TOTAL RATING (70%) + BEI (30%)
      const finalRating = (parseFloat(totalRating70) + parseFloat(bei30)).toFixed(2);
      row.push({ text: finalRating, alignment: 'center', bold: true });

      // Ranking placeholder (will be filled after sorting)
      row.push({ text: '', alignment: 'center', bold: true });

      return {
        row,
        finalRating: parseFloat(finalRating),
      };
    });

    // Sort by final rating (descending) and assign rankings
    dataRowsWithScores.sort((a, b) => b.finalRating - a.finalRating);
    dataRowsWithScores.forEach((item, index) => {
      // Set ranking (last column)
      item.row[item.row.length - 1].text = (index + 1).toString();
    });

    // Extract just the rows
    const dataRows = dataRowsWithScores.map((item) => item.row);

    // Combine all rows
    const rows = [headerRow, subHeaderRow, ...dataRows];

    // Calculate column widths dynamically
    const raterColumnWidth = maxRaters > 0 ? 50 : 0;
    const widths = ['*']; // Name column takes remaining space
    for (let i = 0; i < maxRaters; i++) {
      widths.push(raterColumnWidth);
    }
    widths.push(65); // TOTAL RATING (70%)
    widths.push(55); // BEI (30%)
    widths.push(65); // FINAL RATING
    widths.push(50); // RANKING

    // Get position data from jobPost
    const jobPost = reportData.jobPost || {};
    const office = jobPost.Office || 'N/A';
    const position = jobPost.Position || 'N/A';
    const salaryGrade = jobPost.SalaryGrade || 'N/A';
    const plantillaItemNo = jobPost['Plantilla Item No'] || 'N/A';

    return {
      content: [
        {
          text: 'FINAL SUMMARY OF RATING',
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 2],
          alignment: 'center',
        },
        {
          text: 'QUALIFICATION STANDARDS',
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 16],
          alignment: 'center',
        },

        // Borderless table for Office, Position, Salary Grade, Plantilla Item No
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'Office: ',
                  fontSize: 10,
                  bold: false,
                  border: [false, false, false, false],
                },
                { text: office, fontSize: 10, bold: true, border: [false, false, false, false] },
              ],
              [
                {
                  text: 'Position:  ',
                  fontSize: 10,
                  bold: false,
                  border: [false, false, false, false],
                },
                { text: position, fontSize: 10, bold: true, border: [false, false, false, false] },
              ],
              [
                {
                  text: 'Salary Grade: ',
                  fontSize: 10,
                  bold: false,
                  border: [false, false, false, false],
                },
                {
                  text: salaryGrade,
                  fontSize: 10,
                  bold: true,
                  border: [false, false, false, false],
                },
              ],
              [
                {
                  text: 'Plantilla Item No.:  ',
                  fontSize: 10,
                  bold: false,
                  border: [false, false, false, false],
                },
                {
                  text: plantillaItemNo,
                  fontSize: 10,
                  bold: true,
                  border: [false, false, false, false],
                },
              ],
            ],
          },
          margin: [0, 0, 0, 16],
        },

        // Main applicants table
        {
          table: {
            headerRows: 2,
            widths: widths,
            body: rows,
          },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 || rowIndex === 1 ? 'white' : null;
            },
          },
        },
      ],
    };
  }

  async function generatePdfContent() {
    pdfUrl.value && URL.revokeObjectURL(pdfUrl.value);
    if (!allReportsData.value || allReportsData.value.length === 0) {
      pdfUrl.value = null;
      return;
    }

    // Load logo image
    const logoBase64 = await getImageBase64('/logo.png');

    import('pdfmake/build/pdfmake').then((pdfMakeModule) => {
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      import('pdfmake/build/vfs_fonts').then((vfsFontsModule) => {
        pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

        // Generate content for all positions
        const allContent = [];

        allReportsData.value.forEach((reportData, index) => {
          const positionTable = generatePositionTable(reportData);
          allContent.push(...positionTable.content);

          // Add page break between positions (except for the last one)
          if (index < allReportsData.value.length - 1) {
            allContent.push({ text: '', pageBreak: 'after' });
          }
        });

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'landscape',
          pageMargins: [72, 120, 72, 40], // left, top, right, bottom
          header: function () {
            return {
              stack: [
                // Green banner (drawn first, so it's behind)
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: (1008 - 936) / 2, // Legal landscape width is 1008 points
                      y: 60,
                      w: 936, // Adjusted width for legal landscape
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
          content: allContent,
          styles: {
            tableHeader: {
              fontSize: 10,
              bold: true,
            },
          },
          footer: function () {
            return {
              stack: [{}],
            };
          },
          defaultStyle: { fontSize: 9 },
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

  // Initial fetch and render
  onMounted(async () => {
    if (props.positions && props.positions.length) {
      await fetchAllApplicants();
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
