<template>
  <q-dialog v-model="show" persistent transition-show="slide-up" transition-hide="slide-down">
    <q-card class="modal-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Qualified Applicants Report (Green)</div>
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
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          style="width: 100%; height: 100%; border: none"
          type="application/pdf"
        ></iframe>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { useMarkReportStore } from 'stores/markReportStore';
  import { useQuasar } from 'quasar';

  const props = defineProps({
    date: {
      type: String,
      required: true,
    },
  });

  const emit = defineEmits(['close']);

  const markReportStore = useMarkReportStore();
  const $q = useQuasar();

  const show = ref(true);
  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const reportData = ref(null);

  // Close dialog handler
  watch(show, (val) => {
    if (!val) {
      emit('close');
    }
  });

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

  async function fetchReportData() {
    try {
      isLoading.value = true;
      const response = await markReportStore.fetchGreenMarkReport(props.date);
      reportData.value = response;
      console.log('Green report data:', response);
    } catch (error) {
      console.error('Error fetching green report:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to load green mark report',
      });
      show.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  function generateTableRows() {
    if (!reportData.value || !reportData.value.data) {
      return [];
    }

    const rows = [];
    let rowNumber = 1;

    reportData.value.data.forEach((applicant) => {
      const fullName = `${applicant.firstname || ''} ${applicant.lastname || ''}`
        .trim()
        .toUpperCase();
      const status = applicant.applicant_status || '';
      const appliedOffice = (applicant.applied_office || '').toUpperCase();
      const appliedPosition = (applicant.applied_position || '').toUpperCase();
      const itemNo = (applicant.itemNo || '').toUpperCase();
      const currentPosition = (applicant.current_position || 'N/A').toUpperCase();

      rows.push([
        { text: rowNumber.toString(), style: 'cellStyle', alignment: 'center' },
        { text: fullName, style: 'cellStyle' },
        { text: status, style: 'cellStyle', alignment: 'center' },
        { text: currentPosition, style: 'cellStyle' },
        { text: appliedPosition, style: 'cellStyle' },
        { text: itemNo, style: 'cellStyle', alignment: 'center' },
        { text: appliedOffice, style: 'cellStyle' },
      ]);
      rowNumber++;
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
    // const dateDisplay = props.date;

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
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
                      text: 'HUMAN RESOURCE MERIT PROMOTION AND SELECTION BOARD'.toUpperCase(),
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
      footer: function (currentPage, pageCount) {
        return {
          margin: [40, 0, 40, 20],
          columns: [
            { text: `Page ${currentPage} of ${pageCount}`, alignment: 'center', fontSize: 7 },
          ],
        };
      },
      content: [
        // {
        //   stack: [
        //     { text: 'QUALIFIED APPLICANTS', alignment: 'center', fontSize: 14, bold: true },
        //     {
        //       text: 'NO REFERENCE DOCUMENTS BUT WITH ATTACHED DULY SUBSCRIBED PDS',
        //       alignment: 'center',
        //       fontSize: 10,
        //       bold: true,
        //       margin: [0, 5, 0, 5],
        //     },
        //     {
        //       text: dateDisplay.toUpperCase(),
        //       alignment: 'center',
        //       fontSize: 12,
        //       bold: true,
        //       margin: [0, 0, 0, 30],
        //     },
        //   ],
        // },
        {
          table: {
            headerRows: 1,
            widths: ['5%', '15%', '10%', '19%', '23%', '5%', '23%'],
            body: [
              [
                { text: 'NO.', style: 'tableHeader', fontSize: 8 },
                { text: 'NAME', style: 'tableHeader', fontSize: 8, colSpan: 2 },
                { text: '' },
                { text: 'DESIGNATION', style: 'tableHeader', fontSize: 8 },
                { text: 'APPLIED POSITION', style: 'tableHeader', fontSize: 8 },
                { text: 'ITEM NO.', style: 'tableHeader', fontSize: 8 },
                { text: 'APPLIED OFFICE', style: 'tableHeader', fontSize: 8 },
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
          },
        },
      ],
      styles: {
        tableHeader: {
          bold: true,
          alignment: 'center',
        },
        cellStyle: {
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
    width: 90vw;
    max-width: 1400px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
  }
</style>
