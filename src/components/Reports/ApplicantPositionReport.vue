<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Applicant Per Position</div>
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
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useSummaryReportStore } from 'stores/summaryReportStore';

  const props = defineProps({
    jobpostId: {
      type: [String, Number],
      required: true,
    },
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const summaryReportStore = useSummaryReportStore();
  const reportData = ref(null);

  let DISABLE_ALL_IMAGES = false;

  async function fetchReportData() {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const data = await summaryReportStore.fetchApplicantPosition(props.jobpostId);
      reportData.value = data;
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function isValidBase64(str) {
    if (!str || typeof str !== 'string') return false;
    const dataUrlMatch = str.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
    if (!dataUrlMatch) return false;
    const base64Data = dataUrlMatch[2];
    if (base64Data.length < 100) return false;
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(base64Data)) return false;
    try {
      const binaryString = atob(base64Data);
      if (binaryString.length < 8) return false;
      if (dataUrlMatch[1] === 'png') {
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const isValidPng =
          bytes[0] === 137 &&
          bytes[1] === 80 &&
          bytes[2] === 78 &&
          bytes[3] === 71 &&
          bytes[4] === 13 &&
          bytes[5] === 10 &&
          bytes[6] === 26 &&
          bytes[7] === 10;
        if (!isValidPng) return false;
      }
      return true;
    } catch (error) {
      console.error('Base64 decode error:', error);
      return false;
    }
  }

  function isSupportedImageDataUrl(str) {
    if (!str || typeof str !== 'string') return false;
    const isValid =
      str.startsWith('data:image/png;base64,') ||
      str.startsWith('data:image/jpeg;base64,') ||
      str.startsWith('data:image/jpg;base64,');
    if (!isValid) return false;
    return isValidBase64(str);
  }

  function collectInvalidImages(node, list = []) {
    if (!node || typeof node !== 'object') return list;
    if (node.image && !isSupportedImageDataUrl(node.image)) {
      list.push({ image: node.image, location: 'found invalid image' });
    }
    if (Array.isArray(node.stack)) node.stack.forEach((n) => collectInvalidImages(n, list));
    if (Array.isArray(node.columns)) node.columns.forEach((n) => collectInvalidImages(n, list));
    if (Array.isArray(node.content)) node.content.forEach((n) => collectInvalidImages(n, list));
    if (node.table && Array.isArray(node.table.body)) {
      node.table.body.forEach((row) => row.forEach((n) => collectInvalidImages(n, list)));
    }
    return list;
  }

  function sanitizeImages(node) {
    if (!node || typeof node !== 'object') return;
    if (node.image && !isSupportedImageDataUrl(node.image)) {
      delete node.image;
      delete node.fit;
      delete node.width;
      delete node.height;
      delete node.alignment;
      delete node.margin;
    }
    if (Array.isArray(node.stack)) node.stack.forEach(sanitizeImages);
    if (Array.isArray(node.columns)) node.columns.forEach(sanitizeImages);
    if (Array.isArray(node.content)) node.content.forEach(sanitizeImages);
    if (node.table && Array.isArray(node.table.body)) {
      node.table.body.forEach((row) => row.forEach(sanitizeImages));
    }
  }

  function placeholderImage() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  function safeImageOrPlaceholder(dataUrl) {
    if (dataUrl && isSupportedImageDataUrl(dataUrl)) {
      return dataUrl;
    }
    console.warn('Using placeholder for invalid image');
    return placeholderImage();
  }

  async function getPublicImageBase64(url) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob || blob.size === 0) return null;
      if (blob.size > 500 * 1024) {
        console.warn('Image too large:', blob.size);
        return null;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(blob.type)) return null;
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (isSupportedImageDataUrl(base64)) {
        return base64;
      }
      console.warn('Invalid image data generated for:', url);
      return null;
    } catch (error) {
      console.error('Public image load failed:', url, error);
      return null;
    }
  }

  // Layout for info table (outer borders only)
  const outerBorderLayout = {
    hLineWidth: function (i, node) {
      return i === 0 || i === node.table.body.length ? 2 : 0;
    },
    vLineWidth: function (i, node) {
      return i === 0 || i === node.table.widths.length ? 2 : 0;
    },
    hLineColor: function () {
      return '#d1d1e7';
    },
    vLineColor: function () {
      return '#d1d1e7';
    },
    paddingLeft: function () {
      return 4;
    },
    paddingRight: function () {
      return 4;
    },
    paddingTop: function () {
      return 4;
    },
    paddingBottom: function () {
      return 4;
    },
  };

  // Layout for NO borders at all
  const noBorderLayout = {
    hLineWidth: function () {
      return 0;
    },
    vLineWidth: function () {
      return 0;
    },
    paddingLeft: function () {
      return 4;
    },
    paddingRight: function () {
      return 4;
    },
    paddingTop: function () {
      return 4;
    },
    paddingBottom: function () {
      return 4;
    },
  };

  // Layout for header (no borders, no padding)
  const headerLayout = {
    hLineWidth: function () {
      return 0;
    },
    vLineWidth: function () {
      return 0;
    },
    paddingLeft: function () {
      return 0;
    },
    paddingRight: function () {
      return 0;
    },
    paddingTop: function () {
      return 0;
    },
    paddingBottom: function () {
      return 0;
    },
  };

  async function generatePdfContent() {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }
    if (!reportData.value) return;

    const rd = reportData.value;

    const applicantsArray = Object.values(rd.data || {}).sort(function (a, b) {
      return Number(a.rank) - Number(b.rank);
    });

    const imageMap = {};

    await Promise.all(
      applicantsArray.map(async function (ap) {
        if (ap.image_url) {
          try {
            const b64 = await summaryReportStore.fetchImageBase64(ap.image_url);
            if (b64 && isSupportedImageDataUrl(b64)) {
              imageMap[ap.nPersonalInfo_id] = b64;
            } else {
              console.warn(`Invalid or missing image for applicant ${ap.nPersonalInfo_id}`);
            }
          } catch (error) {
            console.error(`Failed to load image for applicant ${ap.nPersonalInfo_id}:`, error);
          }
        }
      }),
    );

    const logoUrl = new URL('/logo.png', window.location.origin).toString();
    let logoBase64 = null;
    try {
      const rawLogo = await getPublicImageBase64(logoUrl);
      logoBase64 = safeImageOrPlaceholder(rawLogo);
    } catch (error) {
      console.error('Failed to load logo:', error);
      logoBase64 = placeholderImage();
    }

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
    pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

    const allContent = [];
    const BG = '#f0f0f0';

    const divisionOrSection = rd.section || rd.division || '';

    // Info table with outer borders
    const infoRows = [
      [
        {
          text: rd.office || 'N/A',
          fontSize: 12,
          bold: true,
          alignment: 'center',
          colSpan: 2,
          margin: [4, 8, 4, 8],
        },
        { text: '', fillColor: BG },
      ],
      [
        {
          text: 'Position:',
          fontSize: 8,
          margin: [2, 0, 0, 0],
        },
        {
          text: [
            { text: rd.position || 'N/A', bold: true },
            { text: `, SG ${rd.Salary_Grade || 'N/A'}` },
          ],
          fontSize: 8,
          margin: [0, 0, 2, 0],
        },
      ],
      [
        {
          text: 'Plantilla Item No.:',
          fontSize: 8,
          margin: [2, 0, 0, 0],
        },
        {
          text: rd.Plantilla_Item_No || 'N/A',
          fontSize: 8,

          margin: [0, 0, 2, 0],
        },
      ],
    ];

    if (divisionOrSection) {
      infoRows.push([
        {
          text: 'Division/Section:',
          fontSize: 8,
          margin: [2, 0, 0, 0],
        },
        {
          text: divisionOrSection,
          fontSize: 8,

          margin: [0, 0, 2, 0],
        },
      ]);
    }

    allContent.push({
      table: {
        widths: ['20%', '80%'],
        body: infoRows,
      },
      layout: outerBorderLayout,
      margin: [0, 0, 0, 16],
    });

    // Build applicants table body with NO borders
    const applicantsTableBody = [];

    for (let idx = 0; idx < applicantsArray.length; idx++) {
      const applicant = applicantsArray[idx];
      const isInternal = (applicant.applicant_type || '').toLowerCase() === 'internal';

      const fullName =
        ((applicant.firstname || '') + ' ' + (applicant.lastname || '')).trim() || 'N/A';

      const photoData = safeImageOrPlaceholder(imageMap[applicant.nPersonalInfo_id]);

      let infoStack;
      if (isInternal) {
        infoStack = [
          {
            text: [{ text: 'Name: ' }, { text: (fullName || '').toUpperCase(), bold: true }],
            fontSize: 8,
            margin: [0, 0, 0, 6],
          },
          { text: 'Current Position: ' + (applicant.current_position || 'N/A'), fontSize: 8 },
          { text: 'Office: ' + (applicant.office || 'N/A'), fontSize: 8, margin: [0, 3, 0, 0] },
          {
            text: 'Length of Service: ' + (applicant.length_of_service || 'N/A'),
            fontSize: 8,
            margin: [0, 3, 0, 0],
          },
        ];
      } else {
        infoStack = [
          {
            text: [{ text: 'Name: ' }, { text: (fullName || '').toUpperCase(), bold: true }],
            fontSize: 8,
            margin: [0, 0, 0, 6],
          },
          { text: 'Applicant Type: Outsider', fontSize: 8 },
        ];
      }

      const imageStack = [];
      if (!DISABLE_ALL_IMAGES && photoData && isSupportedImageDataUrl(photoData)) {
        imageStack.push({
          image: photoData,
          fit: [100, 100],
          alignment: 'center',
          margin: [0, 8, 0, 8],
        });
      }

      applicantsTableBody.push([
        {
          stack: [
            {
              text: 'RANK',
              fontSize: 8,
              bold: true,
              alignment: 'center',
              color: '#666',
              margin: [0, 10, 0, 5],
            },
            {
              text: (applicant.rank || idx + 1).toString(),
              fontSize: 20,
              bold: true,
              alignment: 'center',
              margin: [0, 0, 0, 10],
            },
          ],
          alignment: 'center',
          margin: [0, 15, 0, 15],
        },
        {
          stack:
            imageStack.length > 0
              ? imageStack
              : [
                  {
                    text: 'No Photo',
                    alignment: 'center',
                    margin: [0, 40, 0, 40],
                    fontSize: 8,
                    color: '#999',
                  },
                ],
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          stack: infoStack,
          margin: [12, 14, 12, 14],
        },
      ]);
    }

    // Add the complete applicants table with NO borders
    allContent.push({
      table: {
        widths: ['8%', '22%', '*'],
        body: applicantsTableBody,
      },
      layout: noBorderLayout, // This removes all borders
      margin: [0, 0, 0, 6],
      dontBreakRows: true,
    });

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 110, 40, 50],
      header: function () {
        const headerImageStack = [];
        if (!DISABLE_ALL_IMAGES && logoBase64 && isSupportedImageDataUrl(logoBase64)) {
          headerImageStack.push({
            image: logoBase64,
            fit: [50, 50],
            alignment: 'center',
            margin: [0, 11, 0, 0],
          });
        }

        return {
          table: {
            widths: ['*', 60, 5, 360, '*'],
            heights: [72],
            body: [
              [
                { text: '', fillColor: '#008000' },
                {
                  fillColor: '#008000',
                  stack: headerImageStack,
                },
                { text: '', fillColor: '#008000' },
                {
                  fillColor: '#008000',
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'rect',
                          x: 0,
                          y: 0,
                          w: 360,
                          h: 28,
                          lineWidth: 1.5,
                          lineColor: '#FFFFFF',
                          color: null,
                        },
                      ],
                      margin: [0, 22, 0, 0],
                    },
                    {
                      text: 'APPLICANTS PER POSITION',
                      color: 'white',
                      fontSize: 11,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -20, 0, 0],
                    },
                  ],
                },
                { text: '', fillColor: '#008000' },
              ],
            ],
          },
          layout: headerLayout,
        };
      },
      footer: function (currentPage, pageCount) {
        return {
          text: 'Page ' + currentPage + ' of ' + pageCount,
          alignment: 'right',
          fontSize: 8,
          margin: [0, 10, 30, 0],
        };
      },
      content: allContent,
      styles: { tableHeader: { fontSize: 8, bold: true } },
      defaultStyle: { fontSize: 8 },
    };

    const bad = collectInvalidImages(docDefinition);
    if (bad.length > 0) {
      console.warn('Found invalid images:', bad.length);
    }

    sanitizeImages(docDefinition);

    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob(function (blob) {
        pdfUrl.value = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      DISABLE_ALL_IMAGES = true;
      await generatePdfContent();
    }
  }

  onUnmounted(function () {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  });

  onMounted(async function () {
    await fetchReportData();
    await generatePdfContent();
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
