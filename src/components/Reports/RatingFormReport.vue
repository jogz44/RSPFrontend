<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="modal-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Rating Form Report</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeModal" />
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
          v-else-if="!pdfUrl && !hasApplicants"
          class="column items-center justify-center text-grey q-gutter-sm"
          style="height: 100%"
        >
          <q-icon name="info" size="32px" />
          <div>No applicants to display.</div>
        </div>

        <div
          v-else-if="!pdfUrl && !isLoading"
          class="column items-center justify-center text-grey q-gutter-sm"
          style="height: 100%"
        >
          <q-spinner color="primary" size="32px" />
          <div>Generating PDF preview...</div>
        </div>

        <iframe
          v-if="pdfUrl && !isLoading"
          :src="pdfUrl"
          style="width: 100%; height: 100%; border: none"
          type="application/pdf"
        ></iframe>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, watch, onUnmounted, computed } from 'vue';
  import { use_rating_form_store } from 'stores/ratingFormStore';

  const props = defineProps({
    modelValue: Boolean,
    jobBatchesRspId: { type: [String, Number], required: true },
  });

  const emit = defineEmits(['update:modelValue', 'close']);

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const ratingFormStore = use_rating_form_store();

  const hasApplicants = computed(() => ratingFormStore.hasApplicants);
  const isFetching = ref(false);

  const reportData = computed(() => ratingFormStore.data || {});
  const office = computed(() => reportData.value.office || '');
  const position = computed(() => reportData.value.position || '');
  const salaryGrade = computed(() => reportData.value.salary_grade || '');
  const plantillaItemNo = computed(() => reportData.value.item_no || '');

  const signatoryName = computed(() => reportData.value?.rater_assigned?.name || '');
  const signatoryPosition = computed(() => reportData.value?.rater_assigned?.position || '');
  const signatoryRepresentative = computed(
    () => reportData.value?.rater_assigned?.representative || '',
  );
  const signatoryRole = computed(() => reportData.value?.rater_assigned?.role_type || '');

  watch(
    () => props.modelValue,
    async (val, prev) => {
      if (val && !prev && props.jobBatchesRspId && !isFetching.value) {
        isFetching.value = true;
        try {
          await fetchReport();
          await generatePdfContent();
        } finally {
          isFetching.value = false;
        }
      }
    },
  );

  const closeModal = () => {
    isOpen.value = false;
    emit('close');
  };

  async function fetchReport() {
    isLoading.value = true;
    try {
      await ratingFormStore.fetchRatingForm(props.jobBatchesRspId);
    } catch {
      // handled by store
    } finally {
      isLoading.value = false;
    }
  }

  const formatNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value ?? '';
    return num % 1 === 0 ? String(Math.round(num)) : num.toFixed(2);
  };

  const toUpper = (value) => (value || '').toUpperCase();

  const calculateQS = (applicant) => {
    if (!applicant) return '-';
    const edu = parseFloat(applicant.education) || 0;
    const exp = parseFloat(applicant.experience) || 0;
    const train = parseFloat(applicant.training) || 0;
    const perf = parseFloat(applicant.performance) || 0;
    if (edu === 0 && exp === 0 && train === 0 && perf === 0) return '-';
    return formatNumber(edu + exp + train + perf);
  };

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
      pdfUrl.value = null;
    }

    const applicants = ratingFormStore.ratingScores;
    if (!Array.isArray(applicants) || !applicants.length) return;

    isLoading.value = true;

    try {
      const logoBase64 = await getImageBase64('/logo.png');

      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;

      const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
      pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

      const qs = reportData.value.qs || {};
      const criteria = reportData.value.criteria || {};

      // Define criteria that should have two columns (percentage and description)
      const twoColumnCriteria = ['education', 'experience', 'training', 'performance'];

      // IMPORTANT: We will render BEI + Exam AFTER QS Total
      const trailingCriteriaKeys = ['behavioral', 'exams'];

      // Main criteria order (WITHOUT behavioral/exams here)
      const criteriaOrder = ['education', 'experience', 'training', 'performance'];

      const hasBehavioral = Array.isArray(criteria.behavioral) && criteria.behavioral.length > 0;
      const hasExam = Array.isArray(criteria.exams) && criteria.exams.length > 0;

      // Build main columns (education/experience/training/performance only)
      const criteriaColumns = [];

      criteriaOrder.forEach((key) => {
        if (!Array.isArray(criteria[key]) || criteria[key].length === 0) return;

        const weight = criteria[key]?.[0]?.weight || '';
        const label = key.charAt(0).toUpperCase() + key.slice(1);

        // two-column criteria
        if (twoColumnCriteria.includes(key)) {
          criteriaColumns.push({
            key: key,
            subKey: 'percentage',
            label: `${label} (%)`,
            weight,
            qsText: qs[key] || '',
            items: criteria[key],
            isTwoColumn: true,
            columnType: 'percentage',
            customWidth: '3%',
          });

          criteriaColumns.push({
            key: key,
            subKey: 'description',
            label: `${label} Desc.`,
            weight,
            qsText: qs[key] || '',
            items: criteria[key],
            isTwoColumn: true,
            columnType: 'description',
            customWidth:
              key === 'education'
                ? '10%'
                : key === 'experience'
                  ? '22%'
                  : key === 'training'
                    ? '16%'
                    : '10%',
          });
        }
      });

      // Build trailing columns (BEI / Exam) that will appear AFTER QS Total
      const trailingColumns = [];

      trailingCriteriaKeys.forEach((key) => {
        if (!Array.isArray(criteria[key]) || criteria[key].length === 0) return;

        let weight = criteria[key]?.[0]?.weight || '';
        // keep your special weights when both exist
        if (key === 'behavioral' && hasBehavioral && hasExam) weight = '10';
        if (key === 'exams' && hasBehavioral && hasExam) weight = '7';

        const label = key === 'behavioral' ? 'BEI' : 'Exam';

        trailingColumns.push({
          key: key === 'exams' ? 'exam' : 'behavioral',
          label,
          weight,
          qsText: qs[key] || '',
          items: criteria[key],
          isTwoColumn: false,
          customWidth: '8%',
        });
      });

      const customLayout = {
        hLineWidth: function () {
          return 0.5;
        },
        vLineWidth: function () {
          return 0.5;
        },
        hLineColor: function () {
          return '#000';
        },
        vLineColor: function () {
          return '#000';
        },
        paddingLeft: function () {
          return 4;
        },
        paddingRight: function () {
          return 4;
        },
        paddingTop: function () {
          return 2;
        },
        paddingBottom: function () {
          return 2;
        },
        fillColor: function () {
          return null;
        },
      };

      // Header Row 1 - Main headers
      const headerRow1 = [
        {
          text: 'No.',
          style: 'tableHeader',
          alignment: 'center',
          rowSpan: 3,
          border: [true, true, true, true],
        },
        {
          text: 'Applicant',
          style: 'tableHeader',
          alignment: 'center',
          rowSpan: 3,
          border: [true, true, true, true],
        },

        // MAIN columns
        ...criteriaColumns.map((c) => ({
          text: c.isTwoColumn
            ? `${c.label.split(' ')[0]} (${c.weight}%)`
            : `${c.label} (${c.weight}%)`,
          style: 'tableHeader',
          alignment: 'center',
          colSpan: c.isTwoColumn && c.columnType === 'percentage' ? 2 : 1,
          border: [true, true, true, true],
        })),

        // QS Total
        {
          text: 'QS Total',
          style: 'tableHeader',
          alignment: 'center',
          rowSpan: 3,
          border: [true, true, true, true],
        },

        // TRAILING columns (BEI/Exam) AFTER QS Total
        ...trailingColumns.map((c) => ({
          text: `${c.label} (${c.weight}%)`,
          style: 'tableHeader',
          alignment: 'center',
          rowSpan: 3,
          border: [true, true, true, true],
        })),
      ];

      // Header Row 2 - QS values
      const headerRow2 = [
        {},
        {},

        ...criteriaColumns.map((c) => ({
          text: c.qsText || '-',
          fontSize: 8,
          alignment: 'left',
          border: [true, true, true, false],
          colSpan: c.isTwoColumn && c.columnType === 'percentage' ? 2 : 1,
        })),

        {}, // QS Total col (rowSpan)

        // trailing columns rowSpan, so empty placeholders
        ...trailingColumns.map(() => ({})),
      ];

      // Header Row 3 - Percentage/Description details (nested borderless table for two-col criteria)
      const headerRow3 = [
        {},
        {},

        ...criteriaColumns.map((c, idx) => {
          if (c.isTwoColumn) {
            if (c.columnType === 'percentage') {
              const nextCol = criteriaColumns[idx + 1];
              const isPaired =
                nextCol &&
                nextCol.isTwoColumn &&
                nextCol.columnType === 'description' &&
                nextCol.key === c.key;

              if (!isPaired) {
                return {
                  text: c.items.map((i) => `${i.percentage}%`).join('\n'),
                  fontSize: 7,
                  alignment: 'left',
                  border: [true, true, true, true],
                };
              }

              return {
                colSpan: 2,
                border: [true, true, true, true], // only outer border
                table: {
                  widths: ['20%', '80%'],
                  body: c.items.map((i) => [
                    {
                      text: `${i.percentage}%`,
                      fontSize: 7,
                      alignment: 'center',
                      margin: [0, 0, 0, 0],
                    },
                    {
                      text: i.description || '',
                      fontSize: 7,
                      alignment: 'left',
                      margin: [0, 0, 0, 0],
                    },
                  ]),
                },
                layout: {
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                  paddingLeft: () => 0,
                  paddingRight: () => 0,
                  paddingTop: () => 0,
                  paddingBottom: () => 0,
                },
              };
            }

            return {};
          }

          return {
            text: c.items.map((i) => `${i.percentage}% - ${i.description}`).join('\n'),
            fontSize: 7,
            alignment: 'left',
            border: [true, true, true, true],
          };
        }),

        {}, // QS Total col (rowSpan)

        // trailing columns rowSpan, so empty placeholders
        ...trailingColumns.map(() => ({})),
      ];

      // Prepare data rows for applicants
      const dataRows = applicants.map((a, index) => {
        const row = [
          { text: String(index + 1), alignment: 'center', border: [true, true, true, true] },
          {
            text: toUpper(`${a.firstname ?? ''} ${a.lastname ?? ''}`.trim()),
            border: [true, true, true, true],
          },
        ];

        // MAIN criteria values
        criteriaColumns.forEach((c, idx) => {
          if (c.isTwoColumn) {
            if (c.columnType === 'percentage') {
              const nextCol = criteriaColumns[idx + 1];
              const shouldSpan =
                nextCol &&
                nextCol.isTwoColumn &&
                nextCol.columnType === 'description' &&
                nextCol.key === c.key;

              if (shouldSpan) {
                row.push({
                  text: formatNumber(a[c.key] ?? ''),
                  alignment: 'center',
                  colSpan: 2,
                  border: [true, true, true, true],
                });
                row.push({});
              } else {
                row.push({
                  text: formatNumber(a[c.key] ?? ''),
                  alignment: 'center',
                  border: [true, true, true, true],
                });
              }
            } else {
              const prevCol = criteriaColumns[idx - 1];
              const isSpanned =
                prevCol &&
                prevCol.isTwoColumn &&
                prevCol.columnType === 'percentage' &&
                prevCol.key === c.key;

              if (!isSpanned) {
                row.push({ text: '', alignment: 'center', border: [true, true, true, true] });
              }
            }
          } else {
            row.push({
              text: formatNumber(a[c.key] ?? ''),
              alignment: 'center',
              border: [true, true, true, true],
            });
          }
        });

        // QS total
        row.push({
          text: calculateQS(a),
          alignment: 'center',
          border: [true, true, true, true],
        });

        // TRAILING values (BEI/Exam) after QS Total
        trailingColumns.forEach((c) => {
          row.push({
            text: formatNumber(a[c.key] ?? ''),
            alignment: 'center',
            border: [true, true, true, true],
          });
        });

        return row;
      });

      const rows = [headerRow1, headerRow2, headerRow3, ...dataRows];

      // Column widths
      const colWidths = ['3%', '15%'];

      // MAIN widths
      criteriaColumns.forEach((c, idx) => {
        if (c.isTwoColumn && c.columnType === 'percentage') {
          const nextCol = criteriaColumns[idx + 1];
          if (
            nextCol &&
            nextCol.isTwoColumn &&
            nextCol.columnType === 'description' &&
            nextCol.key === c.key
          ) {
            colWidths.push(c.customWidth || '3%');
            colWidths.push(nextCol.customWidth || '12%');
          } else {
            colWidths.push(c.customWidth || '3%');
            colWidths.push('12%');
          }
        } else if (c.isTwoColumn && c.columnType === 'description') {
          return;
        } else {
          colWidths.push(c.customWidth || '8%');
        }
      });

      // QS Total width
      colWidths.push('6%');

      // trailing widths
      trailingColumns.forEach((c) => {
        colWidths.push(c.customWidth || '8%');
      });

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
                        canvas: [{ type: 'rect', x: 0, y: 0, w: 75, h: 80, color: '#ffffff' }],
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
                        fontSize: 12,
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
            text: 'RATING FORM FOR QUALIFICATION STANDARDS',
            fontSize: 12,
            bold: true,
            margin: [0, -20, 0, 10],
            alignment: 'center',
          },
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  { text: 'Office:   ', fontSize: 8, border: [false, false, false, false] },
                  {
                    text: office.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  { text: 'Position:   ', fontSize: 9, border: [false, false, false, false] },
                  {
                    text: position.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  { text: 'Salary Grade:  ', fontSize: 8, border: [false, false, false, false] },
                  {
                    text: salaryGrade.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  {
                    text: 'Plantilla Item No.:    ',
                    fontSize: 8,
                    border: [false, false, false, false],
                  },
                  {
                    text: plantillaItemNo.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
              ],
            },
            margin: [0, 0, 0, 0],
          },
          {
            table: {
              headerRows: 3,
              widths: colWidths,
              body: rows,
            },
            layout: customLayout,
          },
          {
            unbreakable: true,
            margin: [0, 20, 0, 0],
            stack: [
              { text: signatoryName.value || '', alignment: 'center', bold: true, fontSize: 9 },
              {
                canvas: [{ type: 'line', x1: 345, y1: 0, x2: 520, y2: 0, lineWidth: 1 }],
                margin: [0, 4, 0, 4],
              },
              { text: signatoryPosition.value || '', alignment: 'center', fontSize: 8 },
              {
                text: signatoryRepresentative.value || '',
                alignment: 'center',
                fontSize: 8,
                margin: [0, 2, 0, 0],
              },
              {
                text: signatoryRole.value || '',
                alignment: 'center',
                fontSize: 8,
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
        styles: { tableHeader: { fontSize: 8, bold: true } },
        defaultStyle: { fontSize: 7 },
      };

      const blob = await new Promise((resolve) => {
        pdfMake.createPdf(docDefinition).getBlob(resolve);
      });

      pdfUrl.value = URL.createObjectURL(blob);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      isLoading.value = false;
    }
  }

  onUnmounted(() => {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  });
</script>

<style scoped>
  .modal-card {
    width: 100%;
    max-width: 900px;
    height: 80vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  }
</style>
