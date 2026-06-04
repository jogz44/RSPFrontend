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

  // Format full name with prefix and suffix
  function formatFullName(prefix, name, suffix) {
    let formattedName = name || '';
    if (prefix && prefix.trim()) {
      formattedName = `${prefix.trim()} ${formattedName}`;
    }
    if (suffix && suffix.trim()) {
      formattedName = `${formattedName}, ${suffix.trim()}`;
    }
    return formattedName.toUpperCase();
  }

  function hasBehavioralCriteria(reportData) {
    const criteria = reportData?.criteria || reportData?.jobPost?.criteria || [];
    if (!Array.isArray(criteria)) return false;

    return criteria.some((c) => {
      if (Array.isArray(c.behaviorals) && c.behaviorals.length > 0) return true;
      if (Array.isArray(c.behavioral) && c.behavioral.length > 0) return true;

      const label = `${c.title || ''} ${c.description || ''}`.toLowerCase();
      return label.includes('behavioral') || label.includes('bei');
    });
  }

  function hasExamCriteria(reportData) {
    const criteria = reportData?.criteria || reportData?.jobPost?.criteria || [];
    if (!Array.isArray(criteria)) return false;

    return criteria.some((c) => Array.isArray(c.exams) && c.exams.length > 0);
  }

  // Get QS total weight from criteria
  function getQsTotalWeight(reportData) {
    const criteria = reportData?.criteria || reportData?.jobPost?.criteria || [];
    if (!Array.isArray(criteria)) return 0;

    let totalWeight = 0;

    for (const c of criteria) {
      if (Array.isArray(c.educations) && c.educations.length > 0) {
        totalWeight += parseFloat(c.educations[0]?.weight) || 0;
      }
      if (Array.isArray(c.experiences) && c.experiences.length > 0) {
        totalWeight += parseFloat(c.experiences[0]?.weight) || 0;
      }
      if (Array.isArray(c.trainings) && c.trainings.length > 0) {
        totalWeight += parseFloat(c.trainings[0]?.weight) || 0;
      }
      if (Array.isArray(c.performances) && c.performances.length > 0) {
        totalWeight += parseFloat(c.performances[0]?.weight) || 0;
      }
    }

    return totalWeight;
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

  // Normalize applicants from API response
  function getApplicants(reportData) {
    if (Array.isArray(reportData?.applicants)) return reportData.applicants;

    if (reportData?.data && typeof reportData.data === 'object') {
      return Object.values(reportData.data).map((item) => {
        // Collect scores from raters
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

            // Collect QS scores (total_qs)
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

        // Calculate average BEI (average across all raters)
        const avgBei =
          beiScores.length > 0
            ? beiScores.reduce((sum, val) => sum + val, 0) / beiScores.length
            : 0;

        // Calculate average QS (average across all raters)
        const avgQs =
          qsScores.length > 0 ? qsScores.reduce((sum, val) => sum + val, 0) / qsScores.length : 0;

        // Final Rating = Average QS + Average BEI
        const finalRating = avgQs + avgBei;

        return {
          applicant: {
            firstname: item.firstname,
            lastname: item.lastname,
          },
          score: item.rater_scores,
          total_rating: avgQs,
          bei: avgBei,
          exam_score: item.exam_score || 0,
          final_rating: finalRating,
          grand_total: item.grand_total,
          rank: item.rank,
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
      const ratersCount = item.score?.length || 0;
      if (ratersCount > maxRaters) maxRaters = ratersCount;
    });
    return maxRaters;
  }

  function getAllRaters(reportData) {
    const applicants = getApplicants(reportData);
    if (!applicants.length) return [];

    const ratersMap = new Map();

    applicants.forEach((item) => {
      if (Array.isArray(item.score)) {
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

  // Use raters array for signatories, with Chairperson last
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
      const itemCount = rowItems.length;

      const columns = rowItems.map((r) => {
        // Format full name with prefix and suffix
        const formattedName = formatFullName(r.prefix, r.rater_name, r.suffix);

        return {
          width: 'auto',
          stack: [
            {
              text: formattedName,
              fontSize: 10,
              bold: true,
              alignment: 'center',
              margin: [0, 0, 0, 2],
            },
            {
              canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }],
              alignment: 'center',
              margin: [0, 0, 0, 4],
            },
            { text: r.position || 'Position', fontSize: 9, alignment: 'center', italics: true },
            { text: r.representative || '', fontSize: 9, alignment: 'center', italics: true },
            { text: r.role_type || '', fontSize: 9, alignment: 'center', italics: true },
          ],
        };
      });

      // Calculate widths for centering
      // Each column gets equal width based on count
      const columnWidth = `${100 / itemCount}%`;

      // Apply width to each column
      const columnsWithWidth = columns.map((col) => ({
        ...col,
        width: columnWidth,
      }));

      footerContent.push({
        unbreakable: true,
        columns: columnsWithWidth,
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
    const showBEI = hasBehavioralCriteria(reportData);
    const showExam = hasExamCriteria(reportData);

    // Get dynamic weights from criteria
    const qsWeight = getQsTotalWeight(reportData);
    const beiWeight = getBeiWeight(reportData);

    // Build header row
    const headerRow = [];

    // Column 1: No.
    headerRow.push({
      text: 'No.',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    // Column 2: NAME OF APPLICANT
    headerRow.push({
      text: 'NAME OF APPLICANT',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    // Column 3: HRM PSB MEMBER RATINGS (if has raters)
    if (maxRaters > 0 && allRaters.length > 0) {
      headerRow.push({
        text: 'HRM PSB MEMBER RATINGS',
        style: 'tableHeader',
        alignment: 'center',
        colSpan: maxRaters,
      });
      // Add empty objects for the remaining columns in the span
      for (let i = 1; i < maxRaters; i++) {
        headerRow.push({});
      }
    }

    // TOTAL RATING column
    headerRow.push({
      text: `TOTAL RATING\n(${qsWeight}%)`,
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    // BEI column (if enabled)
    if (showBEI) {
      headerRow.push({
        text: `BEI\n(${beiWeight}%)`,
        style: 'tableHeader',
        alignment: 'center',
        rowSpan: 2,
      });
    }

    // EXAM column (if enabled)
    if (showExam) {
      headerRow.push({
        text: 'EXAM',
        style: 'tableHeader',
        alignment: 'center',
        rowSpan: 2,
      });
    }

    // FINAL RATING column
    headerRow.push({
      text: 'FINAL RATING',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    // RANKING column
    headerRow.push({
      text: 'RANKING',
      style: 'tableHeader',
      alignment: 'center',
      rowSpan: 2,
    });

    // Build sub header row
    const subHeaderRow = [];

    // Empty cells for the first two columns
    subHeaderRow.push({});
    subHeaderRow.push({});

    // Rater names for HRM PSB MEMBER RATINGS
    if (maxRaters > 0 && allRaters.length > 0) {
      allRaters.forEach((rater) => {
        subHeaderRow.push({
          text: getLastNameUpper(rater.name),
          style: 'tableHeader',
          alignment: 'center',
          fontSize: 9,
        });
      });
    }

    // Empty cells for remaining columns (will be filled by rowSpan from header)
    subHeaderRow.push({}); // TOTAL RATING
    if (showBEI) subHeaderRow.push({}); // BEI
    if (showExam) subHeaderRow.push({}); // EXAM
    subHeaderRow.push({}); // FINAL RATING
    subHeaderRow.push({}); // RANKING

    // Build data rows
    const dataRowsWithScores = applicants.map((item) => {
      const row = [];

      // No. placeholder
      row.push({ text: '', alignment: 'center' });

      // Name
      const fullName =
        `${item.applicant?.firstname || ''} ${item.applicant?.lastname || ''}`.trim();
      row.push({ text: fullName || 'N/A', alignment: 'left' });

      // Rater scores
      const scoresMap = new Map();
      if (Array.isArray(item.score)) {
        item.score.forEach((scoreItem) => {
          scoresMap.set(scoreItem.rater_id, scoreItem.total_qs || '');
        });
      }

      // Add score for each rater (or '-' if missing)
      if (maxRaters > 0 && allRaters.length > 0) {
        allRaters.forEach((rater) => {
          const score = scoresMap.get(rater.id);
          row.push({ text: formatNumber(score), alignment: 'center' });
        });
      }

      // TOTAL RATING
      const totalRating70 = item.total_rating ?? 0;
      row.push({ text: formatNumber(totalRating70), alignment: 'center', bold: true });

      // BEI (if enabled)
      if (showBEI) {
        const beiScore = item.bei ?? 0;
        row.push({ text: formatNumber(beiScore), alignment: 'center', bold: true });
      }

      // EXAM (if enabled)
      if (showExam) {
        const examScore = parseFloat(item.exam_score || 0) || 0;
        row.push({ text: formatNumber(examScore), alignment: 'center', bold: true });
      }

      // FINAL RATING
      const finalRating = item.final_rating ?? totalRating70 + (item.bei ?? 0);
      row.push({ text: formatNumber(finalRating), alignment: 'center', bold: true });

      // RANKING placeholder
      row.push({ text: '', alignment: 'center', bold: true });

      return {
        row,
        rank: item.rank ? Number(item.rank) : null,
        finalRating: Number(finalRating) || 0,
      };
    });

    // Sort by final rating (descending)
    dataRowsWithScores.sort((a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank;
      if (a.rank != null) return -1;
      if (b.rank != null) return 1;
      return b.finalRating - a.finalRating;
    });

    // Add ranking numbers
    dataRowsWithScores.forEach((item, index) => {
      item.row[0].text = (index + 1).toString();
      item.row[item.row.length - 1].text = (index + 1).toString();
    });

    const dataRows = dataRowsWithScores.map((item) => item.row);
    const rows = [headerRow, subHeaderRow, ...dataRows];

    // Calculate column widths
    const raterColumnWidth = maxRaters > 0 && allRaters.length > 0 ? '*' : 0;
    const widths = [20, 150]; // No. and Name

    // Add widths for rater columns
    if (maxRaters > 0 && allRaters.length > 0) {
      for (let i = 0; i < maxRaters; i++) {
        widths.push(raterColumnWidth);
      }
    }

    widths.push(65); // TOTAL RATING
    if (showBEI) widths.push(55); // BEI
    if (showExam) widths.push(55); // EXAM
    widths.push(65); // FINAL RATING
    widths.push(50); // RANKING

    const jobPost = reportData.jobPost || reportData || {};
    const office = jobPost.Office || reportData.office || 'N/A';
    const position = jobPost.Position || reportData.position || 'N/A';
    const salaryGrade = jobPost.SalaryGrade || reportData.Salary_Grade || 'N/A';
    const plantillaItemNo = jobPost['Plantilla Item No'] || reportData.Plantilla_Item_No || 'N/A';

    return [
      {
        text: 'SUMMARY OF RATING',
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
        layout: {
          fillColor: function (rowIndex) {
            return rowIndex === 0 || rowIndex === 1 ? 'white' : null;
          },
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
