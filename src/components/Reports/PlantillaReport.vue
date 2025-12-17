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
  const COLS_COUNT = 13;

  // Format birthdate as mm/dd/yyyy
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [datePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return '';
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }

  // Helper: create a data row for one employee
  function employeeRow(employee) {
    return [
      { text: employee.itemNo ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.position ?? '', alignment: 'left', valign: 'middle' },
      { text: employee.sg ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.authorized ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.actual ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.step, alignment: 'center', valign: 'middle' },
      { text: employee.code ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.type ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.level, alignment: 'center', valign: 'middle' },
      { text: employee.lastname ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.firstname ?? '', alignment: 'center', valign: 'middle' },
      { text: employee.middlename ?? '', alignment: 'center', valign: 'middle' },
      { text: formatDate(employee.birthdate) || 'VACANT', alignment: 'center', valign: 'middle' },
    ];
  }

  // Recursively adds label and employee rows for all sublevels
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
          // Only show row for level label if it has employees
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
          if (Array.isArray(entry.employees)) {
            entry.employees.forEach((emp) => rows.push(employeeRow(emp)));
          }
          addOrgRows(entry, rows);
        }
      }
    }
  }

  // Generates rows for one office (no office label row)
  function generateOfficeRows(office) {
    const rows = [];
    if (Array.isArray(office.employees)) {
      office.employees.forEach((emp) => rows.push(employeeRow(emp)));
    }
    addOrgRows(office, rows);
    return rows;
  }

  // Main PDF generator
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

        // Titles
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
            text: 'as of January 2025',
            style: 'title',
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
        );

        // Table: headerRows: 0 (no automatic repeat of headers in multi-page tables)
        content.push({
          table: {
            headerRows: 0,
            widths: [
              'auto',
              '*',
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
                  colSpan: 5,
                  style: 'tableHeader',
                  alignment: 'left',
                  valign: 'middle',
                },
                {},
                {},
                {},
                {},
              ],
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
              ],
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
                {},
              ],
              ...generateOfficeRows(office),
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

        //Footer
        content.push({
          text: `${office.office || ''}-GRAND TOTAL`,
          style: 'font-size: 10pt;',
          alignment: 'left',
        });
      }

      const docDefinition = {
        pageSize: 'LEGAL',
        pageOrientation: 'landscape',
        pageMargins: [20, 20, 20, 20],
        content,
        styles: {
          title: { fontSize: 12, bold: true, margin: [0, 0, 0, 5] },
          tableHeader: { bold: true, fontSize: 10 },
        },
        defaultStyle: { fontSize: 10 },
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
