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

  // Use 'rating_scores' for this report
  const applicants = computed(() => {
    const scores = reportData.value?.rating_scores;
    return Array.isArray(scores) ? scores : [];
  });

  const office = computed(() => reportData.value?.office || '');
  const position = computed(() => reportData.value?.position || '');
  const salaryGrade = computed(() => reportData.value?.salary_grade || '');
  const plantillaItemNo = computed(() => reportData.value?.item_no || '');

  // Rater information with prefix and suffix support
  const raterAssigned = computed(() => reportData.value?.rater_assigned || {});
  const raterPrefix = computed(() => raterAssigned.value?.prefix || '');
  const raterName = computed(() => raterAssigned.value?.name || '');
  const raterSuffix = computed(() => {
    const suffix = raterAssigned.value?.suffix;
    if (!suffix) return '';
    if (typeof suffix === 'string') return suffix;
    if (Array.isArray(suffix)) return suffix.join(', ');
    return String(suffix);
  });
  const raterPosition = computed(() => raterAssigned.value?.position || '');
  const raterRepresentative = computed(() => raterAssigned.value?.representative || '');
  const raterRole = computed(() => raterAssigned.value?.role_type || '');

  // Format full name with prefix and suffix
  const formattedSignatoryName = computed(() => {
    let name = raterName.value;
    if (raterPrefix.value && raterPrefix.value.trim()) {
      name = `${raterPrefix.value.trim()} ${name}`;
    }
    if (raterSuffix.value && raterSuffix.value.trim()) {
      name = `${name}, ${raterSuffix.value.trim()}`;
    }
    return name || '_________________________';
  });

  // ==================== TRIGGER PDF GENERATION ====================
  async function tryGenerate() {
    if (!props.ratingData) return;
    if (isGenerating.value) return;

    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }

    await generatePdfContent();
  }

  onMounted(async () => {
    if (props.modelValue && props.ratingData) {
      await nextTick();
      await tryGenerate();
    }
  });

  watch(
    () => props.modelValue,
    async (isVisible) => {
      if (isVisible) {
        await nextTick();
        await tryGenerate();
      }
    },
  );

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

      // Main criteria only (without behavioral)
      const criteriaOrder = ['education', 'experience', 'training', 'performance'];

      // Criteria that go AFTER QS Total (BEI only - Exam removed)
      const afterQSCriteria = [];

      // Add behavioral if it exists
      if (Array.isArray(criteria.behavioral) && criteria.behavioral.length > 0) {
        afterQSCriteria.push({
          key: 'behavioral',
          label: 'BEI',
          weight: criteria.behavioral[0]?.weight || '',
          qsText: qs.behavioral || '',
          items: criteria.behavioral,
        });
      }

      // ---- Build main criteriaColumns (before QS Total) ----
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
              ? '15%'
              : key === 'experience'
                ? '20%'
                : key === 'training'
                  ? '8%'
                  : '8%',
        });
      });

      const afterQSTableColumns = [];
      afterQSCriteria.forEach((criterion) => {
        // Percentage column
        afterQSTableColumns.push({
          key: criterion.key,
          label: `${criterion.label} (%)`,
          weight: criterion.weight,
          qsText: criterion.qsText,
          items: criterion.items,
          isTwoColumn: true,
          columnType: 'percentage',
          customWidth: '2%',
        });
        // Description column
        afterQSTableColumns.push({
          key: criterion.key,
          label: `${criterion.label} Desc.`,
          weight: criterion.weight,
          qsText: criterion.qsText,
          items: criterion.items,
          isTwoColumn: true,
          columnType: 'description',
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
        ...afterQSTableColumns.map((c) => ({
          text: `${c.label.split(' ')[0]} (${c.weight}%)`,
          style: 'tableHeader',
          alignment: 'center',
          colSpan: c.isTwoColumn && c.columnType === 'percentage' ? 2 : 1,
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
        ...afterQSTableColumns.map((c) => ({
          text: c.qsText || '-',
          fontSize: 8,
          alignment: 'left',
          border: [true, true, true, false],
          colSpan: c.isTwoColumn && c.columnType === 'percentage' ? 2 : 1,
        })),
      ];

      // ---- Helper function to create sub-table for criteria items ----
      const createSubTable = (items, key) => {
        let percentageWidth = '20%';
        let descriptionWidth = '80%';

        if (key === 'experience') {
          percentageWidth = '10%';
          descriptionWidth = '90%';
        } else if (key === 'behavioral' || key === 'exams') {
          percentageWidth = '20%';
          descriptionWidth = '80%';
        }

        return {
          colSpan: 2,
          border: [true, true, true, true],
          table: {
            widths: [percentageWidth, descriptionWidth],
            body: items.map((i) => [
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
      };

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
              if (isPaired) {
                return createSubTable(c.items, c.key);
              }
              return {
                text: c.items.map((i) => `${i.percentage}%`).join('\n'),
                fontSize: 7,
                alignment: 'left',
                border: [true, true, true, true],
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
        ...afterQSTableColumns.map((c, idx) => {
          if (c.columnType === 'percentage') {
            const nextCol = afterQSTableColumns[idx + 1];
            const isPaired =
              nextCol && nextCol.columnType === 'description' && nextCol.key === c.key;
            if (isPaired) {
              return createSubTable(c.items, c.key);
            }
          }
          return {};
        }),
      ];

      // ---- Data rows - display all applicants with scores ----
      let dataRows = [];

      const totalColumns = 2 + criteriaColumns.length + 1 + afterQSTableColumns.length;

      if (applicants.value.length === 0) {
        const emptyRow = [
          { text: '—', alignment: 'center', border: [true, true, true, true] },
          {
            text: 'No applicants found',
            alignment: 'center',
            colSpan: totalColumns - 1,
            border: [true, true, true, true],
          },
        ];
        for (let i = 2; i < totalColumns; i++) {
          emptyRow.push({});
        }
        dataRows = [emptyRow];
      } else {
        dataRows = applicants.value.map((applicant, index) => {
          const row = [
            {
              text: String(index + 1),
              alignment: 'center',
              border: [true, true, true, true],
            },
            {
              text: toUpper(`${applicant.firstname ?? ''} ${applicant.lastname ?? ''}`.trim()),
              border: [true, true, true, true],
            },
          ];

          // Scores for main criteria (before QS Total)
          for (let idx = 0; idx < criteriaColumns.length; idx++) {
            const c = criteriaColumns[idx];
            if (c.isTwoColumn) {
              if (c.columnType === 'percentage') {
                const nextCol = criteriaColumns[idx + 1];
                const shouldSpan =
                  nextCol && nextCol.columnType === 'description' && nextCol.key === c.key;
                if (shouldSpan) {
                  row.push({
                    text: formatNumber(applicant[c.key] ?? ''),
                    alignment: 'center',
                    colSpan: 2,
                    border: [true, true, true, true],
                  });
                  row.push({});
                  idx++;
                } else {
                  row.push({
                    text: formatNumber(applicant[c.key] ?? ''),
                    alignment: 'center',
                    border: [true, true, true, true],
                  });
                }
              } else {
                const prevCol = criteriaColumns[idx - 1];
                const isSpanned =
                  prevCol && prevCol.columnType === 'percentage' && prevCol.key === c.key;
                if (!isSpanned) {
                  row.push({ text: '', alignment: 'center', border: [true, true, true, true] });
                }
              }
            } else {
              row.push({
                text: formatNumber(applicant[c.key] ?? ''),
                alignment: 'center',
                border: [true, true, true, true],
              });
            }
          }

          // QS Total
          row.push({
            text: calculateQS(applicant),
            alignment: 'center',
            border: [true, true, true, true],
          });

          // Scores for after-QS criteria (BEI)
          for (let idx = 0; idx < afterQSTableColumns.length; idx++) {
            const c = afterQSTableColumns[idx];
            if (c.isTwoColumn) {
              if (c.columnType === 'percentage') {
                const nextCol = afterQSTableColumns[idx + 1];
                const shouldSpan =
                  nextCol && nextCol.columnType === 'description' && nextCol.key === c.key;
                if (shouldSpan) {
                  row.push({
                    text: formatNumber(applicant[c.key] ?? ''),
                    alignment: 'center',
                    colSpan: 2,
                    border: [true, true, true, true],
                  });
                  row.push({});
                  idx++;
                } else {
                  row.push({
                    text: formatNumber(applicant[c.key] ?? ''),
                    alignment: 'center',
                    border: [true, true, true, true],
                  });
                }
              } else {
                const prevCol = afterQSTableColumns[idx - 1];
                const isSpanned =
                  prevCol && prevCol.columnType === 'percentage' && prevCol.key === c.key;
                if (!isSpanned) {
                  row.push({ text: '', alignment: 'center', border: [true, true, true, true] });
                }
              }
            } else {
              row.push({
                text: formatNumber(applicant[c.key] ?? ''),
                alignment: 'center',
                border: [true, true, true, true],
              });
            }
          }

          return row;
        });
      }

      const rows = [headerRow1, headerRow2, headerRow3, ...dataRows];

      // ---- Column widths - Dynamic calculation ----
      const baseWidths = {
        no: '4%',
        applicant: '14%',
        educationPercent: '3%',
        educationDesc: '15%',
        experiencePercent: '3%',
        experienceDesc: '20%',
        trainingPercent: '3%',
        trainingDesc: '8%',
        performancePercent: '3%',
        performanceDesc: '8%',
        qsTotal: '9%',
        beiPercent: '4%',
        beiDesc: '12%',
      };

      // Check if BEI exists
      const hasBei = afterQSCriteria.some((c) => c.key === 'behavioral');

      // Calculate total width
      let totalWidth = 0;
      const widthValues = [];

      // Add No and Applicant
      widthValues.push(4, 14);
      totalWidth += 18;

      // Add main criteria
      const mainKeys = ['education', 'experience', 'training', 'performance'];
      const mainWidths = [];
      mainKeys.forEach((key) => {
        const percent = parseFloat(baseWidths[key + 'Percent']);
        const desc = parseFloat(baseWidths[key + 'Desc']);
        mainWidths.push({ key, percent, desc });
        totalWidth += percent + desc;
      });

      // Add QS Total
      widthValues.push(9);
      totalWidth += 9;

      // Add BEI if exists
      if (hasBei) {
        totalWidth += 4 + 12; // BEI percent + description
      }

      // Calculate how much extra width we have
      const extraWidth = 100 - totalWidth;

      // Distribute extra width to main criteria
      if (extraWidth !== 0) {
        const adjustmentPerMain = extraWidth / mainWidths.length / 2;
        mainWidths.forEach((w) => {
          w.percent = Math.max(2, w.percent + adjustmentPerMain);
          w.desc = Math.max(5, w.desc + adjustmentPerMain);
        });
      }

      // Build final colWidths array
      const colWidths = [];
      colWidths.push('4%'); // No.
      colWidths.push('14%'); // Applicant

      // Add main criteria
      for (let idx = 0; idx < criteriaColumns.length; idx++) {
        const c = criteriaColumns[idx];
        if (c.isTwoColumn && c.columnType === 'percentage') {
          const nextCol = criteriaColumns[idx + 1];
          if (nextCol && nextCol.columnType === 'description' && nextCol.key === c.key) {
            const widthData = mainWidths.find((w) => w.key === c.key);
            if (widthData) {
              colWidths.push(widthData.percent + '%');
              colWidths.push(widthData.desc + '%');
              idx++;
            }
          }
        }
      }

      // Add QS Total
      colWidths.push('9%');

      // Add BEI if exists
      if (hasBei) {
        for (let idx = 0; idx < afterQSTableColumns.length; idx++) {
          const c = afterQSTableColumns[idx];
          if (c.isTwoColumn && c.columnType === 'percentage') {
            const nextCol = afterQSTableColumns[idx + 1];
            if (nextCol && nextCol.columnType === 'description' && nextCol.key === c.key) {
              colWidths.push('4%');
              colWidths.push('12%');
              idx++;
            }
          }
        }
      }

      console.log(
        'Total width:',
        colWidths.reduce((sum, w) => sum + parseFloat(w), 0),
      );

      // ---- Doc definition ----
      const docDefinition = {
        pageSize: 'LEGAL',
        pageOrientation: 'landscape',
        pageMargins: [72, 200, 72, 40],
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
            {
              text: 'INDIVIDUAL RATING REPORT',
              fontSize: 12,
              bold: true,
              margin: [0, 10, 0, 10],
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
                    {
                      text: 'Plantilla Item No:',
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
              margin: [72, 0, 0, 8],
            },
          ],
        }),
        content: [
          {
            table: { headerRows: 3, widths: colWidths, body: rows, dontBreakRows: true },
            layout: customLayout,
          },
          {
            unbreakable: true,
            margin: [0, 20, 0, 0],
            stack: [
              { text: formattedSignatoryName.value, alignment: 'center', bold: true, fontSize: 9 },
              {
                canvas: [{ type: 'line', x1: 345, y1: 0, x2: 520, y2: 0, lineWidth: 1 }],
                margin: [0, 4, 0, 4],
              },
              { text: raterPosition.value, alignment: 'center', fontSize: 8 },
              {
                text: raterRepresentative.value,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 2, 0, 0],
              },
              { text: raterRole.value, alignment: 'center', fontSize: 8, margin: [0, 2, 0, 0] },
            ],
          },
        ],
        styles: { tableHeader: { fontSize: 8, bold: true } },
        defaultStyle: { fontSize: 7 },
      };

      const blob = await new Promise((resolve) => {
        pdfMake.createPdf(docDefinition).getBlob(resolve);
      });

      // Clean up old URL if exists
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
      }

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
