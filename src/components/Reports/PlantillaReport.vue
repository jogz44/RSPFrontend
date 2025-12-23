<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Plantilla Report</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator />

    <!-- Content (PDF Preview) -->
    <div class="q-pa-md" style="flex: 1; min-height: 0; display: flex; flex-direction: column">
      <div
        v-if="!pdfUrl && !isLoading"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-spinner color="primary" size="32px" />
        <div>Generating PDF preview...</div>
      </div>

      <div
        v-if="isLoading"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-spinner color="primary" size="32px" />
        <div>Loading report...</div>
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
  import { usePlantillaReportStore } from 'src/stores/plantillaReportStore.js';

  const pdfUrl = ref(null);
  const plantillaReportStore = usePlantillaReportStore();
  const isLoading = ref(false);
  const COLS_COUNT = 16;

  function officeAbbreviation(officeName) {
    if (!officeName) return '';

    // Remove "OFFICE OF THE" (case-insensitive)
    let cleaned = officeName.replace(/office of the/i, '').trim();

    // Split words and take first letter of each
    const abbr = cleaned
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase())
      .join('');

    // Append "O"
    return `${abbr}O`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [datePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return '';
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }
  function n(val) {
    if (typeof val === 'string') val = val.replace(/,/g, '');
    return Number(val) || 0;
  }
  function employeeRow(employee) {
    return [
      { text: employee.itemNo ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.position ?? '', alignment: 'left', valign: 'middle' },
      { text: employee.salarygrade ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.authorized ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.actual ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.step ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.code ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.type ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.level ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.lastname ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.firstname ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.middlename ?? '', alignment: 'center', valign: 'middle' },
      { text: formatDate(employee.birthdate) || 'VACANT', alignment: 'center', valign: 'middle' },
      { text: formatDate(employee.dateOriginalAppointed), alignment: 'center', valign: 'middle' },
      { text: formatDate(employee.dateLastPromotion), alignment: 'center', valign: 'middle' },
      { text: employee.status ?? '', alignment: 'center', valign: 'middle' },
    ];
  }
  function addOrgRows(node, rows) {
    const subLevels = [
      { array: 'office2', label: 'office2' },
      { array: 'groups', label: 'group' },
      { array: 'divisions', label: 'division' },
      { array: 'sections', label: 'section' },
      { array: 'units', label: 'unit' },
    ];
    for (const sub of subLevels) {
      const subs = node[sub.array];
      if (Array.isArray(subs)) {
        for (const entry of subs) {
          if (entry[sub.label] && Array.isArray(entry.employees) && entry.employees.length > 0) {
            rows.push([
              {
                text: entry[sub.label],
                colSpan: COLS_COUNT,
                style: 'tableHeader',
                alignment: 'left',
              },
              ...Array(COLS_COUNT - 1).fill({}),
            ]);
          }
          if (Array.isArray(entry.employees))
            entry.employees.forEach((emp) => rows.push(employeeRow(emp)));
          addOrgRows(entry, rows);
        }
      }
    }
  }
  function generateOfficeRows(office) {
    const rows = [];
    if (Array.isArray(office.employees))
      office.employees.forEach((emp) => rows.push(employeeRow(emp)));
    addOrgRows(office, rows);
    return rows;
  }
  function collectAllEmployees(office, arr = []) {
    if (Array.isArray(office.employees)) arr.push(...office.employees);
    ['office2', 'groups', 'divisions', 'sections', 'units'].forEach((key) => {
      if (Array.isArray(office[key])) office[key].forEach((sub) => collectAllEmployees(sub, arr));
    });
    return arr;
  }
  function getMaxItemNo(office) {
    const emps = collectAllEmployees(office);
    let maxItem = null;
    for (const emp of emps)
      if (emp.itemNo && (!maxItem || Number(emp.itemNo) > Number(maxItem))) maxItem = emp.itemNo;
    return maxItem;
  }
  function reportDateString() {
    const now = new Date();
    return `as of ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  }

  async function generatePdfContent(reportData) {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
      const vfsFonts = vfsFontsModule.default || vfsFontsModule;
      pdfMake.vfs = vfsFonts?.pdfMake?.vfs || vfsFonts?.vfs || vfsFonts;

      const content = [];

      for (let i = 0; i < reportData.length; ++i) {
        const office = reportData[i];
        if (i > 0) content.push({ text: '', pageBreak: 'before' });

        const allEmployees = collectAllEmployees(office);
        const totalAuthorized = allEmployees.reduce((sum, e) => sum + n(e.authorized), 0);
        const totalActual = allEmployees.reduce((sum, e) => sum + n(e.actual), 0);
        const numItems = getMaxItemNo(office) ?? '';

        content.push(
          {
            text: 'Republic of the Philippines',
            style: 'title',
            alignment: 'center',
            margin: [0, 20, 0, 5],
          },
          { text: 'CITY GOVERNMENT OF TAGUM', style: 'title', alignment: 'center' },
          { text: 'Plantilla of Personnel', style: 'title', alignment: 'center' },
          {
            text: reportDateString(),
            style: 'title',
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
        );

        content.push({
          table: {
            headerRows: 0,
            widths: [
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
            ],
            body: [
              // HEADER ROW 1 (16 cols)
              [
                {
                  text: `(1) OFFICE: ${office.office || ''}`,
                  colSpan: 8,
                  style: 'tableHeader',
                  alignment: 'left',
                  valign: 'middle',
                },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {
                  text: '(2) Agency:  CITY GOVERNMENT OF TAGUM',
                  colSpan: 8,
                  style: 'tableHeader',
                  alignment: 'left',
                  valign: 'middle',
                },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
              ],
              // HEADER ROW 2 (16)
              [
                {
                  text: '(3) Item No.',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: '(4) Position Title',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: '(5) SG',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: 'Annual Salary',
                  colSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {},
                {
                  text: '(8) Step',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: 'Area',
                  colSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {},
                {
                  text: '(11) Level',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: 'Name of Incumbents',
                  colSpan: 3,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {},
                {},
                {
                  text: '(15) Date of Birthday',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: '(16) Date of Original Appointment',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: '(17) Date of Last Promotion',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: '(18) Status',
                  rowSpan: 2,
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
              ],
              // HEADER ROW 3 (16)
              [
                {},
                {},
                {},
                {
                  text: '(6) Authorized',
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                { text: '(7) Actual', style: 'tableHeader', alignment: 'center', valign: 'middle' },
                {},
                { text: '(9) Code', style: 'tableHeader', alignment: 'center', valign: 'middle' },
                { text: '(10) Type', style: 'tableHeader', alignment: 'center', valign: 'middle' },
                {},
                {
                  text: '(12) Last Name',
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: '(13) First Name',
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {
                  text: '(14) Middle Name',
                  style: 'tableHeader',
                  alignment: 'center',
                  valign: 'middle',
                },
                {}, // Birthday
                {}, // Original Appt.
                {}, // Last Promotion
                {}, // Status
              ],
              ...generateOfficeRows(office),

              // Separator row (16 cols)
              [
                {
                  text: '',
                  colSpan: COLS_COUNT,
                  border: [false, false, false, false],
                  margin: [0, 2, 0, 2],
                },
                ...Array(COLS_COUNT - 1).fill({}),
              ],

              // GRAND TOTAL (16)
              [
                {
                  text: `${officeAbbreviation(office.office)}-GRAND TOTAL`,
                  colSpan: 3,
                  alignment: 'left',
                  style: 'grandTotalLabel',
                  border: [false, true, false, true],
                },
                { text: '', border: [false, true, false, true] },
                { text: '', border: [false, true, false, true] },
                {
                  text: totalAuthorized.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                  alignment: 'right',
                  style: 'grandTotalValue',
                  border: [false, true, false, true],
                },
                {
                  text: totalActual.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                  alignment: 'right',
                  style: 'grandTotalValue',
                  border: [false, true, false, true],
                },
                ...Array(COLS_COUNT - 5).fill({ text: '', border: [false, true, false, true] }),
              ],
              // Total Number of Positions (16)
              [
                {
                  text: `(19) Total Number of Position Items:   ${numItems ?? ''}`,
                  colSpan: COLS_COUNT,
                  alignment: 'left',
                  margin: [0, 6, 0, 0],
                  style: 'footerBold',
                  border: [false, false, false, false],
                },
              ],
              // Certification & Signature Block (16)
              [
                {
                  colSpan: COLS_COUNT,
                  columns: [
                    // LEFT SIDE — Certification + Janylene
                    {
                      width: '50%',
                      stack: [
                        {
                          text:
                            'I certify to the correctness of the entries and that above Position Items are duly approved and authorized\n' +
                            'by the agency and in compliance to existing rules and regulations. I further certify that employees whose\n' +
                            'names appear above are the incumbents of the position.',
                          fontSize: 8,
                          margin: [0, 5, 0, 12],
                        },
                        {
                          alignment: 'center',
                          margin: [80, 30, 0, 0], // adjust if needed
                          stack: [
                            {
                              columns: [
                                {
                                  width: 140,
                                  stack: [
                                    {
                                      text: 'JANYLENE A. PALERMO, MM',
                                      style: 'footerBold',
                                      alignment: 'center',
                                      margin: [0, 6, 0, 0],
                                    },
                                    {
                                      text: '____________________________________',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 2, 0, 0], // line
                                    },
                                    {
                                      text: 'Signature',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 2, 0, 0], // label
                                    },
                                  ],
                                },
                                {
                                  width: 80,
                                  stack: [
                                    {
                                      text: '_______________',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 21, 0, 0],
                                    },
                                    {
                                      text: 'Date',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 2, 0, 0],
                                    },
                                  ],
                                },
                              ],
                              columnGap: 16,
                              alignment: 'center',
                            },
                          ],
                        },
                        { width: '*', text: '' },
                      ],
                    },

                    // RIGHT SIDE — Approved by (Mayor)
                    {
                      width: '50%',
                      stack: [
                        {
                          text: 'APPROVED BY:',
                          style: 'footerBold',
                          alignment: 'left',
                          margin: [0, 5, 0, 34],
                        },
                        {
                          alignment: 'center',
                          margin: [60, 30, 0, 0], // adjust if needed
                          stack: [
                            {
                              columns: [
                                {
                                  width: 140,
                                  stack: [
                                    {
                                      text: 'REY T. UY',
                                      style: 'footerBold',
                                      alignment: 'center',
                                      margin: [0, 6, 0, 0],
                                    },
                                    {
                                      text: '_______________',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 2, 0, 0],
                                    },
                                    {
                                      text: 'City Mayor',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 2, 0, 0],
                                    },
                                  ],
                                },
                                {
                                  width: 80,
                                  stack: [
                                    {
                                      text: '_______________',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 21, 0, 0],
                                    },
                                    {
                                      text: 'Date',
                                      fontSize: 8,
                                      alignment: 'center',
                                      margin: [0, 2, 0, 0],
                                    },
                                  ],
                                },
                              ],
                              columnGap: 10,
                              alignment: 'center',
                            },
                          ],
                        },
                        { width: '*', text: '' },
                      ],
                    },
                  ],
                  columnGap: 40,
                  border: [false, false, false, false],
                },
                ...Array(COLS_COUNT - 1).fill({}),
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#333',
            vLineColor: () => '#333',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 8,
            paddingBottom: () => 8,
            cellVerticalAlignment: () => 'middle',
          },
        });
      }

      const docDefinition = {
        pageSize: 'LEGAL',
        pageOrientation: 'landscape',
        pageMargins: [20, 20, 20, 20],
        content,
        styles: {
          title: { fontSize: 11, bold: true, margin: [0, 0, 0, 5] },
          tableHeader: { bold: true, fontSize: 8 },
          grandTotalLabel: { bold: true, fontSize: 8, color: '#222', margin: [0, 3, 0, 0] },
          grandTotalValue: { bold: true, fontSize: 8, color: '#222', alignment: 'right' },
          footerBold: { bold: true, fontSize: 8 },
        },
        defaultStyle: { fontSize: 7 },
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        pdfUrl.value = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  onMounted(async () => {
    isLoading.value = true;
    await plantillaReportStore.fetchReport();
    isLoading.value = false;
    if (plantillaReportStore.data) {
      generatePdfContent(plantillaReportStore.data);
    }
  });

  onUnmounted(() => {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
    }
  });
</script>

<style scoped>
  .modal-card {
    width: 100%;
    max-width: 1200px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  }
</style>
