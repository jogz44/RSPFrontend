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
        <!-- Generating PDF -->
        <div
          v-if="isGenerating"
          class="column items-center justify-center text-grey q-gutter-sm"
          style="height: 100%"
        >
          <q-spinner color="primary" size="32px" />
          <div>Generating PDF preview...</div>
        </div>

        <!-- No data / no applicants -->
        <div
          v-else-if="!isGenerating && !pdfUrl"
          class="column items-center justify-center text-grey q-gutter-sm"
          style="height: 100%"
        >
          <q-icon name="info" size="32px" />
          <div>No applicants to display.</div>
        </div>

        <!-- PDF iframe -->
        <iframe
          v-if="pdfUrl && !isGenerating"
          :src="pdfUrl"
          style="width: 100%; height: 100%; border: none"
          type="application/pdf"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';

  // ==================== PROPS ====================
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    ratingData: {
      type: Object,
      default: null,
    },
    jobBatchesRspId: {
      type: [String, Number],
      default: null,
    },
    raterId: {
      type: [String, Number],
      default: null,
    },
  });

  const emit = defineEmits(['update:modelValue', 'close']);

  // ==================== STATE ====================
  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const pdfUrl = ref(null);
  const isGenerating = ref(false);

  // ==================== DATA FROM PROP ====================
  const reportData = computed(() => props.ratingData || {});
  const applicants = computed(() => {
    const scores = reportData.value?.rating_scores;
    return Array.isArray(scores) ? scores : [];
  });
  const hasApplicants = computed(() => applicants.value.length > 0);

  const office = computed(() => reportData.value?.office || '');
  const position = computed(() => reportData.value?.position || '');
  const salaryGrade = computed(() => reportData.value?.salary_grade || '');
  const plantillaItemNo = computed(() => reportData.value?.item_no || '');
  const signatoryName = computed(() => reportData.value?.rater_assigned?.name || '');
  const signatoryPosition = computed(() => reportData.value?.rater_assigned?.position || '');
  const signatoryRepresentative = computed(
    () => reportData.value?.rater_assigned?.representative || '',
  );
  const signatoryRole = computed(() => reportData.value?.rater_assigned?.role_type || '');

  // ==================== TRIGGER PDF GENERATION ====================
  // Called whenever we want to (re)build the PDF.
  async function tryGenerate() {
    if (!props.ratingData) return; // data not ready yet
    if (!hasApplicants.value) return; // nothing to render
    if (isGenerating.value) return; // already running

    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }

    await generatePdfContent();
  }

  // On mount: if dialog is already open and data is already set, generate immediately.
  onMounted(async () => {
    if (props.modelValue && props.ratingData) {
      await nextTick();
      await tryGenerate();
    }
  });

  // When dialog opens (modelValue flips to true) AND data is present → generate.
  watch(
    () => props.modelValue,
    async (isVisible) => {
      if (isVisible) {
        await nextTick(); // let Vue propagate the ratingData prop first
        await tryGenerate();
      }
    },
  );

  // If ratingData arrives/changes while dialog is already open → regenerate.
  watch(
    () => props.ratingData,
    async (newData) => {
      if (newData && props.modelValue) {
        await nextTick();
        await tryGenerate();
      }
    },
    { deep: false },
  );

  // ==================== CLOSE ====================
  const closeModal = () => {
    isOpen.value = false;
    emit('close');
  };

  // ==================== HELPERS ====================
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
    } catch {
      return null;
    }
  }

  // ==================== PDF GENERATION ====================
  async function generatePdfContent() {
    isGenerating.value = true;

    try {
      const logoBase64 = await getImageBase64('/logo.png');

      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
      pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

      const qs = reportData.value.qs || {};
      const criteria = reportData.value.criteria || {};

      const trailingCriteriaKeys = ['behavioral', 'exams'];
      const criteriaOrder = ['education', 'experience', 'training', 'performance'];

      const hasBehavioral = Array.isArray(criteria.behavioral) && criteria.behavioral.length > 0;
      const hasExam = Array.isArray(criteria.exams) && criteria.exams.length > 0;

      // ---- Build main criteriaColumns ----
      const criteriaColumns = [];
      criteriaOrder.forEach((key) => {
        if (!Array.isArray(criteria[key]) || criteria[key].length === 0) return;
        const weight = criteria[key][0]?.weight || '';
        const label = key.charAt(0).toUpperCase() + key.slice(1);

        criteriaColumns.push({
          key,
          label: `${label} (%)`,
          weight,
          qsText: qs[key] || '',
          items: criteria[key],
          isTwoColumn: true,
          columnType: 'percentage',
          customWidth: '3%',
        });
        criteriaColumns.push({
          key,
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
      });

      // ---- Build trailingColumns (BEI / Exam after QS Total) ----
      const trailingColumns = [];
      trailingCriteriaKeys.forEach((key) => {
        if (!Array.isArray(criteria[key]) || criteria[key].length === 0) return;
        let weight = criteria[key][0]?.weight || '';
        if (key === 'behavioral' && hasBehavioral && hasExam) weight = '10';
        if (key === 'exams' && hasBehavioral && hasExam) weight = '7';
        trailingColumns.push({
          key: key === 'exams' ? 'exam' : 'behavioral',
          label: key === 'behavioral' ? 'BEI' : 'Exam',
          weight,
          items: criteria[key],
          isTwoColumn: false,
          customWidth: '8%',
        });
      });

      // ---- Custom table layout ----
      const customLayout = {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000',
        vLineColor: () => '#000',
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 2,
        paddingBottom: () => 2,
        fillColor: () => null,
      };

      // ---- Header Row 1 ----
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
        ...criteriaColumns.map((c) => ({
          text: `${c.label.split(' ')[0]} (${c.weight}%)`,
          style: 'tableHeader',
          alignment: 'center',
          colSpan: c.isTwoColumn && c.columnType === 'percentage' ? 2 : 1,
          border: [true, true, true, true],
        })),
        {
          text: 'QS Total',
          style: 'tableHeader',
          alignment: 'center',
          rowSpan: 3,
          border: [true, true, true, true],
        },
        ...trailingColumns.map((c) => ({
          text: `${c.label} (${c.weight}%)`,
          style: 'tableHeader',
          alignment: 'center',
          rowSpan: 3,
          border: [true, true, true, true],
        })),
      ];

      // ---- Header Row 2 — QS values ----
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
        {},
        ...trailingColumns.map(() => ({})),
      ];

      // ---- Header Row 3 — percentage / description details ----
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
                border: [true, true, true, true],
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
        {},
        ...trailingColumns.map(() => ({})),
      ];

      // ---- Data rows ----
      const dataRows = applicants.value.map((a, index) => {
        const row = [
          { text: String(index + 1), alignment: 'center', border: [true, true, true, true] },
          {
            text: toUpper(`${a.firstname ?? ''} ${a.lastname ?? ''}`.trim()),
            border: [true, true, true, true],
          },
        ];

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

        row.push({ text: calculateQS(a), alignment: 'center', border: [true, true, true, true] });

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

      // ---- Column widths ----
      const colWidths = ['3%', '15%'];
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
          // already pushed by its paired 'percentage' column above
        } else {
          colWidths.push(c.customWidth || '8%');
        }
      });
      colWidths.push('6%');
      trailingColumns.forEach((c) => colWidths.push(c.customWidth || '8%'));

      // ---- Doc definition ----
      const docDefinition = {
        pageSize: 'LEGAL',
        pageOrientation: 'landscape',
        pageMargins: [72, 120, 72, 40],
        header: () => ({
          stack: [
            {
              canvas: [
                { type: 'rect', x: (1008 - 936) / 2, y: 60, w: 936, h: 25, color: '#008000' },
              ],
            },
            {
              margin: [72, -65, 72, 0],
              columns: [
                {
                  width: 65,
                  stack: [
                    { canvas: [{ type: 'rect', x: 0, y: 0, w: 75, h: 80, color: '#ffffff' }] },
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
                      color: '#00703c',
                      bold: true,
                      alignment: 'left',
                    },
                    {
                      text: 'HUMAN RESOURCE MERIT PROMOTION AND SELECTION BOARD',
                      fontSize: 12,
                      color: 'white',
                      bold: true,
                      margin: [0, 5, 0, 0],
                    },
                  ],
                },
              ],
            },
          ],
        }),
        content: [
          {
            text: 'INDIVIDUAL RATING REPORT',
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
                  { text: 'Office:', fontSize: 8, border: [false, false, false, false] },
                  {
                    text: office.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  { text: 'Position:', fontSize: 9, border: [false, false, false, false] },
                  {
                    text: position.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  { text: 'Salary Grade:', fontSize: 8, border: [false, false, false, false] },
                  {
                    text: salaryGrade.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
                [
                  { text: 'Plantilla Item No:', fontSize: 8, border: [false, false, false, false] },
                  {
                    text: plantillaItemNo.value,
                    fontSize: 8,
                    bold: true,
                    border: [false, false, false, false],
                  },
                ],
              ],
            },
            margin: [0, 0, 0, 8],
          },
          { table: { headerRows: 3, widths: colWidths, body: rows }, layout: customLayout },
          {
            unbreakable: true,
            margin: [0, 20, 0, 0],
            stack: [
              { text: signatoryName.value, alignment: 'center', bold: true, fontSize: 9 },
              {
                canvas: [{ type: 'line', x1: 345, y1: 0, x2: 520, y2: 0, lineWidth: 1 }],
                margin: [0, 4, 0, 4],
              },
              { text: signatoryPosition.value, alignment: 'center', fontSize: 8 },
              {
                text: signatoryRepresentative.value,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 2, 0, 0],
              },
              { text: signatoryRole.value, alignment: 'center', fontSize: 8, margin: [0, 2, 0, 0] },
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
      isGenerating.value = false;
    }
  }

  // ==================== CLEANUP ====================
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
