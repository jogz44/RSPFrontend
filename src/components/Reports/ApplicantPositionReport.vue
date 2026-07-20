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
        v-if="!pdfUrl && !isLoading && !hasNoData"
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
  import { ref, onMounted, onUnmounted, computed } from 'vue';
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
  let rejectionHandler = null;

  // Computed property to safely get applicants array
  const applicantsArray = computed(() => {
    if (!reportData.value || !reportData.value.data) return [];
    if (Array.isArray(reportData.value.data)) {
      return [...reportData.value.data].sort((a, b) => Number(a.rank) - Number(b.rank));
    }
    return Object.values(reportData.value.data).sort((a, b) => Number(a.rank) - Number(b.rank));
  });

  const hasNoData = computed(() => {
    return !isLoading.value && reportData.value && applicantsArray.value.length === 0;
  });

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

      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (dataUrlMatch[1] === 'png') {
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
      } else {
        // JPEG/JPG: check for SOI marker (FFD8) at start and EOI marker (FFD9) at end.
        // Without this, a truncated JPEG (e.g. cut off mid-fetch) passes validation
        // and later crashes pdfmake's internal JPEG parser.
        const isValidJpegStart = bytes[0] === 0xff && bytes[1] === 0xd8;
        const isValidJpegEnd =
          bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
        if (!isValidJpegStart || !isValidJpegEnd) return false;

        // Reject progressive JPEGs (SOF2, marker 0xFFC2). Browsers decode these
        // fine, but pdfmake's hand-rolled JPEG parser only reliably supports
        // baseline JPEG (SOF0, 0xFFC0) and can walk off the buffer on SOF2 data,
        // producing "Invalid image: RangeError: Trying to access beyond buffer
        // length" even though the file itself is perfectly valid.
        let isProgressive = false;
        for (let i = 2; i < bytes.length - 1; i++) {
          if (bytes[i] !== 0xff) continue;
          const marker = bytes[i + 1];
          // Skip padding/fill bytes.
          if (marker === 0xff || marker === 0x00) continue;
          if (marker === 0xc2) {
            isProgressive = true;
            break;
          }
          // SOF0 (baseline) or SOS (start of scan) — no need to look further.
          if (marker === 0xc0 || marker === 0xda) break;
          // Any other marker with a length field: skip its segment.
          if (marker >= 0xd0 && marker <= 0xd9) {
            i += 1; // markers with no payload (RST0-7, SOI, EOI)
            continue;
          }
          if (i + 3 < bytes.length) {
            const segmentLength = (bytes[i + 2] << 8) | bytes[i + 3];
            i += 1 + segmentLength;
          } else {
            break;
          }
        }
        if (isProgressive) return false;
      }
      return true;
    } catch {
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

  // Confirms a data URL is a real, decodable image AND normalizes it into a
  // plain baseline sRGB JPEG by drawing it through a canvas. This is the
  // actual fix for pdfmake compatibility: pdfmake has its own hand-rolled
  // image parser (it doesn't use the browser's decoder), which can fail on
  // CMYK JPEGs, progressive JPEGs, 16-bit PNGs, or files carrying ICC/EXIF
  // data it doesn't skip correctly — even though the browser displays them
  // fine. Re-encoding through canvas strips all of that and always produces
  // a format pdfmake can read. Returns null if the image can't be decoded
  // at all (truncated/corrupt data).
  function normalizeImageForPdfmake(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl) return resolve(null);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          if (canvas.width === 0 || canvas.height === 0) return resolve(null);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const normalized = canvas.toDataURL('image/jpeg', 0.92);
          resolve(normalized);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  }

  function placeholderImage() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  function safeImageOrPlaceholder(dataUrl) {
    if (dataUrl && isSupportedImageDataUrl(dataUrl)) {
      return dataUrl;
    }
    return placeholderImage();
  }

  async function getPublicImageBase64(url) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob || blob.size === 0) return null;
      if (blob.size > 500 * 1024) return null;
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
      return null;
    } catch {
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

  function getFormattedPublicationDate() {
    if (!reportData.value || !reportData.value.publication_date) {
      return '';
    }

    const pubDate = reportData.value.publication_date;
    let startDateStr = pubDate.split(' - ')[0] || pubDate;
    const dateParts = startDateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!dateParts) return '';

    const month = dateParts[1];
    const day = dateParts[2];
    const year = dateParts[3];
    return `${month.toUpperCase()} ${day}, ${year}`;
  }

  async function generatePdfContent() {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }
    if (!reportData.value) return;

    const rd = reportData.value;

    let applicants = [];
    if (Array.isArray(rd.data)) {
      applicants = rd.data;
    } else if (rd.data && typeof rd.data === 'object') {
      applicants = Object.values(rd.data);
    }

    applicants.sort((a, b) => Number(a.rank) - Number(b.rank));

    // Load pdfmake
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
    pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

    const publicationDateText = getFormattedPublicationDate();
    let headerTitleText = 'APPLICANTS PER POSITION';
    if (publicationDateText) {
      headerTitleText = `APPLICANTS PER POSITION - ${publicationDateText} PUBLICATION`;
    }

    // If no applicants, show a simple message
    if (applicants.length === 0) {
      const docDefinition = {
        pageSize: 'Legal',
        pageOrientation: 'portrait',
        pageMargins: [40, 110, 40, 50],
        header: function () {
          return {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: headerTitleText,
                    color: 'white',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    fillColor: '#008000',
                    margin: [0, 25, 0, 25],
                  },
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
        content: [
          {
            text: 'No applicants found for this position.',
            alignment: 'center',
            fontSize: 14,
            margin: [0, 50, 0, 0],
          },
        ],
        defaultStyle: { fontSize: 8 },
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob(function (blob) {
        pdfUrl.value = URL.createObjectURL(blob);
      });
      return;
    }

    // Load images — each candidate is validated by magic-byte check AND
    // actually decoded in the browser before being trusted for pdfmake.
    const imageMap = {};
    await Promise.all(
      applicants.map(async function (ap) {
        const uniqueKey = ap.ControlNo || ap.nPersonalInfo_id;
        if (!uniqueKey || !ap.image_url) return;

        try {
          const b64 = await summaryReportStore.fetchImageBase64(ap.image_url);
          if (b64 && isSupportedImageDataUrl(b64)) {
            const normalized = await normalizeImageForPdfmake(b64);
            if (normalized) {
              imageMap[uniqueKey] = normalized;
            }
          }
        } catch {
          // Silently skip
        }
      }),
    );

    const logoUrl = new URL('/rsp/logo.png', window.location.origin).toString();
    let logoBase64 = null;
    try {
      const rawLogo = await getPublicImageBase64(logoUrl);
      const candidate = safeImageOrPlaceholder(rawLogo);
      const normalized = await normalizeImageForPdfmake(candidate);
      logoBase64 = normalized || placeholderImage();
    } catch {
      logoBase64 = placeholderImage();
    }

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

    // Build each applicant as a separate unbreakable table
    for (let idx = 0; idx < applicants.length; idx++) {
      const applicant = applicants[idx];
      const isInternal = (applicant.applicant_type || '').toLowerCase() === 'internal';

      const fullName =
        ((applicant.firstname || '') + ' ' + (applicant.lastname || '')).trim() || 'N/A';
      const uniqueKey = applicant.ControlNo || applicant.nPersonalInfo_id;
      const photoData =
        uniqueKey && imageMap[uniqueKey]
          ? safeImageOrPlaceholder(imageMap[uniqueKey])
          : placeholderImage();

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

      // Create a separate table for each applicant with unbreakable: true
      const applicantTable = {
        table: {
          widths: ['8%', '22%', '*'],
          body: [
            [
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
            ],
          ],
        },
        layout: {
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
        },
        margin: [0, 0, 0, 6],
        unbreakable: true, // This keeps the entire applicant row together
      };

      allContent.push(applicantTable);
    }

    const docDefinition = {
      pageSize: 'Legal',
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
                      text: headerTitleText,
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
    if (rejectionHandler) {
      window.removeEventListener('unhandledrejection', rejectionHandler);
    }
  });

  onMounted(async function () {
    // Backstop: pdfmake's document build runs internally as a promise chain,
    // so an "Invalid image" error thrown deep inside it (e.g. corrupt buffer
    // that slipped past validation) surfaces as an unhandled rejection rather
    // than something our try/catch around getBlob() can see. This catches
    // that case and retries once with all images disabled.
    rejectionHandler = (event) => {
      // pdfmake frequently rejects with a plain string rather than an Error
      // object, so event.reason?.message is often undefined even on a real
      // "Invalid image" failure. Check both shapes.
      const reasonText =
        typeof event.reason === 'string' ? event.reason : event.reason?.message || '';
      if (reasonText.includes('Invalid image')) {
        event.preventDefault();
        console.error('Caught pdfmake image error via unhandledrejection, retrying without images.');
        DISABLE_ALL_IMAGES = true;
        generatePdfContent();
      }
    };
    window.addEventListener('unhandledrejection', rejectionHandler);

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
