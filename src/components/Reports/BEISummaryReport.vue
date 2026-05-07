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
        v-else-if="errorMessage"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-icon name="warning" color="warning" size="64px" />
        <div class="text-h6 text-center">{{ errorMessage }}</div>
        <div class="text-caption text-center text-grey-6">
          Please ensure applicants have been rated before generating the report.
        </div>
      </div>

      <div
        v-else-if="!pdfUrl && !isLoading && !errorMessage"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-spinner color="primary" size="32px" />
        <div>Generating PDF preview...</div>
      </div>

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
    positions: {
      type: Array,
      default: () => [],
    },
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const summaryReportStore = useSummaryReportStore();
  const allReportsData = ref([]);
  const errorMessage = ref(null);

  watch(
    () => props.positions,
    async (newVal, oldVal) => {
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;

      if (newVal && newVal.length) {
        await fetchApplicantDetail();
        await generatePdfContent();
      }
    },
  );

  async function fetchApplicantDetail() {
    if (isLoading.value) return;

    allReportsData.value = [];
    errorMessage.value = null;
    isLoading.value = true;

    try {
      const promises = props.positions.map((positionId) =>
        summaryReportStore.fetchApplicantDetail(positionId),
      );

      const results = await Promise.all(promises);
      const validResults = results.filter((data) => data !== null);

      if (validResults.length === 0) {
        errorMessage.value = "Applicants don't have ratings yet";
        allReportsData.value = [];
        return;
      }

      if (validResults.length < results.length) {
        errorMessage.value = `Some positions don't have ratings yet (${validResults.length} of ${results.length} positions have ratings)`;
        allReportsData.value = [];
        return;
      }

      allReportsData.value = validResults;
    } catch (error) {
      console.error('Error fetching applicants:', error);
      errorMessage.value = error.message || 'An error occurred while loading the report';
    } finally {
      isLoading.value = false;
    }
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

  function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-';
    const num = parseFloat(value);
    if (Number.isNaN(num)) return value;
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  }

  function getLastNameUpper(fullName = '') {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const last = parts.length ? parts[parts.length - 1] : fullName;
    return last.toUpperCase();
  }

  // Get BEI weight from criteria
  function getBeiWeight(reportData) {
    const criteria = reportData?.criteria || reportData?.jobPost?.criteria || [];
    if (!Array.isArray(criteria)) return 0;

    for (const c of criteria) {
      if (Array.isArray(c.behaviorals) && c.behaviorals.length > 0) {
        return parseFloat(c.behaviorals[0]?.weight) || 0;
      }
      if (Array.isArray(c.behavioral) && c.behavioral.length > 0) {
        return parseFloat(c.behavioral[0]?.weight) || 0;
      }
    }
    return 0;
  }

  // Get QS total weight (education + experience + training + performance)
  function getQsTotalWeight(reportData) {
    const criteria = reportData?.criteria || reportData?.jobPost?.criteria || [];
    if (!Array.isArray(criteria)) return 0;

    let totalWeight = 0;

    for (const c of criteria) {
      // Add education weight
      if (Array.isArray(c.educations) && c.educations.length > 0) {
        totalWeight += parseFloat(c.educations[0]?.weight) || 0;
      }
      // Add experience weight
      if (Array.isArray(c.experiences) && c.experiences.length > 0) {
        totalWeight += parseFloat(c.experiences[0]?.weight) || 0;
      }
      // Add training weight
      if (Array.isArray(c.trainings) && c.trainings.length > 0) {
        totalWeight += parseFloat(c.trainings[0]?.weight) || 0;
      }
      // Add performance weight
      if (Array.isArray(c.performances) && c.performances.length > 0) {
        totalWeight += parseFloat(c.performances[0]?.weight) || 0;
      }
    }

    return totalWeight;
  }

  function hasExamCriteria(reportData) {
    const criteria = reportData?.criteria || reportData?.jobPost?.criteria || [];
    if (!Array.isArray(criteria)) return false;

    return criteria.some((c) => Array.isArray(c.exams) && c.exams.length > 0);
  }

  // Normalize applicants from API response with correct calculations
  function getApplicants(reportData) {
    if (Array.isArray(reportData?.applicants)) return reportData.applicants;

    if (reportData?.data && typeof reportData.data === 'object') {
      return Object.values(reportData.data).map((item) => {
        // Collect BEI scores from raters (excluding null/undefined/'-')
        let beiScores = [];
        let qsScores = [];

        if (Array.isArray(item.rater_scores)) {
          item.rater_scores.forEach((scoreItem) => {
            // Collect BEI scores that have valid values
            if (scoreItem.bei !== null && scoreItem.bei !== undefined && scoreItem.bei !== '-') {
              const beiValue = parseFloat(scoreItem.bei);
              if (!isNaN(beiValue)) {
                beiScores.push(beiValue);
              }
            }

            // Collect QS scores
            if (
              scoreItem.total_qs !== null &&
              scoreItem.total_qs !== undefined &&
              scoreItem.total_qs !== '-'
            ) {
              const qsValue = parseFloat(scoreItem.total_qs);
              if (!isNaN(qsValue)) {
                qsScores.push(qsValue);
              }
            }
          });
        }

        // Calculate average BEI (exclude null/'-' values)
        const avgBei =
          beiScores.length > 0
            ? beiScores.reduce((sum, val) => sum + val, 0) / beiScores.length
            : 0;

        // Calculate average QS
        const avgQS =
          qsScores.length > 0 ? qsScores.reduce((sum, val) => sum + val, 0) / qsScores.length : 0;

        // Final Rating = Average QS + Average BEI
        const finalRating = avgQS + avgBei;

        return {
          applicant: {
            firstname: item.firstname,
            lastname: item.lastname,
          },
          rater_scores: item.rater_scores,
          total_rating: avgQS,
          bei: avgBei,
          exam_score: item.exam_score,
          final_rating: finalRating,
          grand_total: item.grand_total,
          rank: item.rank,
          beiScores: beiScores,
        };
      });
    }

    return [];
  }

  function getMaxRatersCount(reportData) {
    const applicants = getApplicants(reportData);
    if (!applicants.length) return 0;

    let maxRaters = 0;
    applicants.forEach((item) => {
      const ratersCount = item.rater_scores?.length || 0;
      if (ratersCount > maxRaters) maxRaters = ratersCount;
    });
    return maxRaters;
  }

  function getAllRaters(reportData) {
    const applicants = getApplicants(reportData);
    if (!applicants.length) return [];

    const ratersMap = new Map();

    applicants.forEach((item) => {
      if (Array.isArray(item.rater_scores)) {
        item.rater_scores.forEach((scoreItem) => {
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

  // Get signatories from raters, with Chairperson last
  function getSignatories(reportData) {
    const raters = Array.isArray(reportData?.raters) ? reportData.raters : [];

    const members = raters.filter((r) => (r.role_type || '').toLowerCase() !== 'chairperson');
    const chairpersons = raters.filter((r) => (r.role_type || '').toLowerCase() === 'chairperson');

    return [...members, ...chairpersons];
  }

  function generateSignatoryFooter(reportData) {
    const signatories = getSignatories(reportData);
    if (!signatories.length) return [];

    const MAX_PER_ROW = 3;
    const footerContent = [];

    for (let i = 0; i < signatories.length; i += MAX_PER_ROW) {
      const rowItems = signatories.slice(i, i + MAX_PER_ROW);

      const columns = rowItems.map((r) => ({
        width: '*',
        stack: [
          {
            text: (r.rater_name || '').toUpperCase(),
            fontSize: 10,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 2],
          },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }],
            alignment: 'center',
            margin: [0, 0, 0, 4],
          },
          { text: r.position || 'Position', fontSize: 9, alignment: 'center', italics: true },
          { text: r.representative || '', fontSize: 9, alignment: 'center', italics: true },
          { text: r.role_type || '', fontSize: 9, alignment: 'center', italics: true },
        ],
      }));

      const missing = MAX_PER_ROW - columns.length;
      const leftPads = Math.floor(missing / 2);
      const rightPads = missing - leftPads;

      const paddedColumns = [
        ...Array.from({ length: leftPads }, () => ({ width: '*', text: '' })),
        ...columns,
        ...Array.from({ length: rightPads }, () => ({ width: '*', text: '' })),
      ];

      footerContent.push({
        unbreakable: true,
        columns: paddedColumns,
        columnGap: 30,
        margin: i === 0 ? [0, 30, 0, 0] : [0, 20, 0, 0],
      });
    }

    return footerContent;
  }

  function generatePositionTable(reportData) {
    const applicants = getApplicants(reportData);
    const maxRaters = getMaxRatersCount(reportData);
    const allRaters = getAllRaters(reportData);
    const showExam = hasExamCriteria(reportData);
    const beiWeight = getBeiWeight(reportData);
    const qsTotalWeight = getQsTotalWeight(reportData);

    // Header Row
    const headerRow = [
      {
        text: 'No.',
        style: 'tableHeader',
        alignment: 'center',
        rowSpan: 2,
      },
      {
        text: 'NAME OF APPLICANT',
        style: 'tableHeader',
        alignment: 'center',
        rowSpan: 2,
      },
    ];

    if (maxRaters > 0) {
      headerRow.push({
        text: 'HRM PSB MEMBER RATINGS (BEI)',
        style: 'tableHeader',
        alignment: 'center',
        colSpan: maxRaters,
      });
      for (let i = 1; i < maxRaters; i++) headerRow.push({});
    }

    headerRow.push({
      text: `TOTAL BEI (${beiWeight}%)`,
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    headerRow.push({
      text: `TOTAL QS (${qsTotalWeight}%)`,
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    if (showExam) {
      headerRow.push({
        text: 'EXAM',
        style: 'tableHeader',
        alignment: 'center',
        rowSpan: 2,
      });
    }

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

    // Sub Header Row
    const subHeaderRow = [{}, {}];

    // BEI headers (rater names)
    allRaters.forEach((rater) => {
      subHeaderRow.push({
        text: getLastNameUpper(rater.name),
        style: 'tableHeader',
        alignment: 'center',
        fontSize: 9,
      });
    });

    subHeaderRow.push({}); // Total BEI column
    subHeaderRow.push({}); // Total QS column
    if (showExam) subHeaderRow.push({}); // Exam column
    subHeaderRow.push({}); // Final Rating column
    subHeaderRow.push({}); // Ranking column

    // Build data rows
    const dataRowsWithScores = applicants.map((item) => {
      const row = [];

      // # number placeholder
      row.push({ text: '', alignment: 'center' });

      // Name
      const fullName =
        `${item.applicant?.firstname || ''} ${item.applicant?.lastname || ''}`.trim();
      row.push({ text: fullName, alignment: 'left' });

      // Map for BEI scores
      const beiMap = new Map();
      let beiScores = [];
      let qsScores = [];

      if (Array.isArray(item.rater_scores)) {
        item.rater_scores.forEach((scoreItem) => {
          // BEI scores
          if (scoreItem.bei !== null && scoreItem.bei !== undefined && scoreItem.bei !== '-') {
            const beiValue = parseFloat(scoreItem.bei);
            if (!isNaN(beiValue)) {
              beiMap.set(scoreItem.rater_id, beiValue);
              beiScores.push(beiValue);
            }
          }

          // QS scores
          if (
            scoreItem.total_qs !== null &&
            scoreItem.total_qs !== undefined &&
            scoreItem.total_qs !== '-'
          ) {
            const qsValue = parseFloat(scoreItem.total_qs);
            if (!isNaN(qsValue)) {
              qsScores.push(qsValue);
            }
          }
        });
      }

      // Display BEI scores per rater
      allRaters.forEach((rater) => {
        const beiScore = beiMap.get(rater.id);
        row.push({
          text: beiScore !== undefined ? formatNumber(beiScore) : '-',
          alignment: 'center',
        });
      });

      // Total BEI (average of all rater BEI scores)
      const totalBei =
        beiScores.length > 0 ? beiScores.reduce((sum, val) => sum + val, 0) / beiScores.length : 0;
      row.push({ text: formatNumber(totalBei), alignment: 'center', bold: true });

      // Total QS (average of all rater QS scores)
      const totalQs =
        qsScores.length > 0 ? qsScores.reduce((sum, val) => sum + val, 0) / qsScores.length : 0;
      row.push({ text: formatNumber(totalQs), alignment: 'center', bold: true });

      // Exam (if applicable)
      if (showExam) {
        row.push({ text: formatNumber(item.exam_score), alignment: 'center', bold: true });
      }

      // Final Rating = Total QS + Total BEI
      const finalRating = totalQs + totalBei;
      row.push({ text: formatNumber(finalRating), alignment: 'center', bold: true });

      // Rank placeholder
      row.push({ text: '', alignment: 'center', bold: true });

      return {
        row,
        finalRating: finalRating,
      };
    });

    // Sort by final rating (descending)
    dataRowsWithScores.sort((a, b) => b.finalRating - a.finalRating);

    // Add ranking numbers
    dataRowsWithScores.forEach((item, index) => {
      item.row[0].text = (index + 1).toString();
      item.row[item.row.length - 1].text = (index + 1).toString();
    });

    const dataRows = dataRowsWithScores.map((item) => item.row);
    const rows = [headerRow, subHeaderRow, ...dataRows];

    // Calculate column widths
    const raterColumnWidth = 50;
    const widths = [30, '*']; // #, Name

    // BEI columns
    for (let i = 0; i < maxRaters; i++) widths.push(raterColumnWidth);
    widths.push(65); // Total BEI
    widths.push(65); // Total QS

    if (showExam) widths.push(55);
    widths.push(75); // Final Rating
    widths.push(50); // Ranking

    const jobPost = reportData.jobPost || reportData || {};
    const office = jobPost.Office || reportData.office || 'N/A';
    const position = jobPost.Position || reportData.position || 'N/A';
    const salaryGrade = jobPost.SalaryGrade || reportData.Salary_Grade || 'N/A';
    const plantillaItemNo = jobPost['Plantilla Item No'] || reportData.Plantilla_Item_No || 'N/A';

    return [
      {
        text: 'BEI SUMMARY OF RATING',
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
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              { text: 'Office:   ', fontSize: 10, border: [false, false, false, false] },
              { text: office, fontSize: 10, bold: true, border: [false, false, false, false] },
            ],
            [
              { text: 'Position:   ', fontSize: 10, border: [false, false, false, false] },
              { text: position, fontSize: 10, bold: true, border: [false, false, false, false] },
            ],
            [
              { text: 'Salary Grade:  ', fontSize: 10, border: [false, false, false, false] },
              {
                text: salaryGrade,
                fontSize: 10,
                bold: true,
                border: [false, false, false, false],
              },
            ],
            [
              {
                text: 'Plantilla Item No.:    ',
                fontSize: 10,
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
      {
        table: {
          headerRows: 2,
          widths: widths,
          body: rows,
        },
      },
      ...generateSignatoryFooter(reportData),
    ];
  }

  async function generatePdfContent() {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }

    if (!allReportsData.value || allReportsData.value.length === 0) {
      return;
    }

    const logoBase64 = await getImageBase64('/logo.png');

    import('pdfmake/build/pdfmake').then((pdfMakeModule) => {
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      import('pdfmake/build/vfs_fonts').then((vfsFontsModule) => {
        pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

        const allContent = [];

        allReportsData.value.forEach((reportData, index) => {
          const positionContent = generatePositionTable(reportData);
          allContent.push(...positionContent);

          if (index < allReportsData.value.length - 1) {
            allContent.push({ text: '', pageBreak: 'after' });
          }
        });

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'landscape',
          pageMargins: [72, 100, 72, 10],
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
                          text: 'HUMAN RESOURCE MERIT PROMOTION AND SELECTION BOARD',
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
            return { stack: [{}] };
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

  onMounted(async () => {
    if (props.positions && props.positions.length) {
      await fetchApplicantDetail();
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
