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
  import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
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

      // Debug: Log the first applicant's image data
      if (data && data.data) {
        const firstApplicant = Array.isArray(data.data)
          ? data.data[0]
          : Object.values(data.data)[0];
        if (firstApplicant) {
          console.log('First applicant data:', {
            name: `${firstApplicant.firstname} ${firstApplicant.lastname}`,
            image_url: firstApplicant.image_url,
            controlNo: firstApplicant.ControlNo,
            nPersonalInfo_id: firstApplicant.nPersonalInfo_id,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function isValidBase64(str) {
    if (!str || typeof str !== 'string') return false;

    // Check if it's a data URL - allow ALL image types
    const dataUrlMatch = str.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      console.log('Not a valid data URL format');
      return false;
    }

    const imageType = dataUrlMatch[1];
    const base64Data = dataUrlMatch[2];

    if (base64Data.length < 100) {
      console.log('Base64 data too short');
      return false;
    }

    // Check for valid base64 characters
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(base64Data)) {
      console.log('Invalid base64 characters');
      return false;
    }

    try {
      const binaryString = atob(base64Data);
      if (binaryString.length < 8) {
        console.log('Binary data too short');
        return false;
      }

      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Validate common image types by magic bytes
      // PNG
      if (imageType === 'png') {
        const isValidPng =
          bytes[0] === 137 &&
          bytes[1] === 80 &&
          bytes[2] === 78 &&
          bytes[3] === 71 &&
          bytes[4] === 13 &&
          bytes[5] === 10 &&
          bytes[6] === 26 &&
          bytes[7] === 10;
        if (!isValidPng) {
          console.log('Invalid PNG header');
          return false;
        }
        return true;
      }

      // JPEG/JPG
      if (imageType === 'jpeg' || imageType === 'jpg') {
        const isValidJpegStart = bytes[0] === 0xff && bytes[1] === 0xd8;
        if (!isValidJpegStart) {
          console.log('Invalid JPEG start marker');
          return false;
        }

        const isValidJpegEnd = bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
        if (!isValidJpegEnd) {
          console.log('Invalid JPEG end marker - image may be truncated');
          return false;
        }
        return true;
      }

      // GIF
      if (imageType === 'gif') {
        const isValidGif =
          bytes[0] === 0x47 &&
          bytes[1] === 0x49 &&
          bytes[2] === 0x46 &&
          bytes[3] === 0x38 &&
          (bytes[4] === 0x37 || bytes[4] === 0x39) &&
          bytes[5] === 0x61;
        if (!isValidGif) {
          console.log('Invalid GIF header');
          return false;
        }
        return true;
      }

      // BMP
      if (imageType === 'bmp') {
        const isValidBmp = bytes[0] === 0x42 && bytes[1] === 0x4d;
        if (!isValidBmp) {
          console.log('Invalid BMP header');
          return false;
        }
        return true;
      }

      // WEBP
      if (imageType === 'webp') {
        const isValidWebp =
          bytes[0] === 0x52 &&
          bytes[1] === 0x49 &&
          bytes[2] === 0x46 &&
          bytes[3] === 0x46 &&
          bytes[8] === 0x57 &&
          bytes[9] === 0x45 &&
          bytes[10] === 0x42 &&
          bytes[11] === 0x50;
        if (!isValidWebp) {
          console.log('Invalid WEBP header');
          return false;
        }
        return true;
      }

      // SVG - just check if it's valid XML
      if (imageType === 'svg+xml' || imageType === 'svg') {
        const str = binaryString.substring(0, 100).toLowerCase();
        const isValidSvg = str.includes('<svg') || str.includes('<?xml');
        if (!isValidSvg) {
          console.log('Invalid SVG header');
          return false;
        }
        return true;
      }

      // For other image types (ico, tiff, etc.), try to decode
      console.log(`Unknown image type: ${imageType}, accepting if decodable`);
      return true;
    } catch (error) {
      console.error('Error validating base64:', error);
      return false;
    }
  }

  function isSupportedImageDataUrl(str) {
    if (!str || typeof str !== 'string') return false;
    // Allow ALL image types
    const isValid = str.startsWith('data:image/');
    if (!isValid) {
      console.log('Not a valid data URL');
      return false;
    }
    return isValidBase64(str);
  }

  function normalizeImageForPdfmake(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl) {
        console.log('No data URL to normalize');
        return resolve(null);
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          if (canvas.width === 0 || canvas.height === 0) {
            console.log('Invalid image dimensions');
            return resolve(null);
          }

          const ctx = canvas.getContext('2d');

          // Check if it's a PNG
          const isPng = dataUrl.startsWith('data:image/png');
          // Check if it's a GIF (might have transparency)
          const isGif = dataUrl.startsWith('data:image/gif');
          // Check if it's a WEBP (might have transparency)
          const isWebp = dataUrl.startsWith('data:image/webp');

          if (isPng || isGif || isWebp) {
            // For images with possible transparency, preserve it
            ctx.drawImage(img, 0, 0);
            // Keep as PNG format for transparency
            const normalized = canvas.toDataURL('image/png');
            console.log(
              `Image normalized with transparency preserved: ${canvas.width}x${canvas.height}`,
            );
            resolve(normalized);
          } else {
            // For JPEGs and other formats, add white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const normalized = canvas.toDataURL('image/jpeg', 0.92);
            console.log(`JPEG normalized: ${canvas.width}x${canvas.height}`);
            resolve(normalized);
          }
        } catch (error) {
          console.error('Error normalizing image:', error);
          resolve(null);
        }
      };

      img.onerror = (error) => {
        console.error('Image load error:', error);
        resolve(null);
      };

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
      console.log('Fetching public image from URL:', url);
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        console.log('Failed to fetch image:', response.status);
        return null;
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        console.log('Empty blob');
        return null;
      }

      // REMOVED file type restriction - allow ALL image types
      // Just log the type for debugging
      console.log(`Image type: ${blob.type}, size: ${blob.size} bytes`);

      // ✅ Allow larger images but resize them
      let imageDataUrl;
      if (blob.size > 500 * 1024) {
        console.log(`Image too large (${blob.size} bytes), resizing...`);

        // Load the image
        const img = new Image();
        const loadPromise = new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target.result;
          };
          reader.readAsDataURL(blob);
        });
        await loadPromise;

        // Resize to max 800px width/height
        const maxSize = 800;
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Draw resized image on canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to appropriate format
        if (blob.type === 'image/png') {
          imageDataUrl = canvas.toDataURL('image/png');
        } else {
          imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
        console.log(`Image resized to ${width}x${height}`);
      } else {
        // Convert small images normally
        imageDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      if (isSupportedImageDataUrl(imageDataUrl)) {
        console.log('Successfully loaded image');
        return imageDataUrl;
      }

      return null;
    } catch (error) {
      console.error('Error fetching image:', error);
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
    // Revoke old URL if exists
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
      return new Promise((resolve) => {
        pdfDocGenerator.getBlob(function (blob) {
          const url = URL.createObjectURL(blob);
          pdfUrl.value = url;
          console.log('PDF generated (no applicants)');
          resolve();
        });
      });
    }

    // Load images — each candidate is validated by magic-byte check AND
    // actually decoded in the browser before being trusted for pdfmake.
    const imageMap = {};
    console.log(`Loading images for ${applicants.length} applicants...`);

    await Promise.all(
      applicants.map(async function (ap) {
        const uniqueKey = ap.ControlNo || ap.nPersonalInfo_id;
        if (!uniqueKey) {
          console.log('No unique key for applicant:', ap);
          return;
        }

        if (!ap.image_url) {
          console.log(`No image_url for applicant ${uniqueKey}`);
          return;
        }

        try {
          console.log(`Fetching image for applicant ${uniqueKey} from URL:`, ap.image_url);

          // If image_url is relative, make it absolute
          let imageUrl = ap.image_url;
          if (imageUrl.startsWith('/')) {
            imageUrl = window.location.origin + imageUrl;
            console.log(`Converted to absolute URL: ${imageUrl}`);
          }

          const b64 = await summaryReportStore.fetchImageBase64(imageUrl);

          if (b64) {
            console.log(`Raw base64 for ${uniqueKey}:`, b64.substring(0, 100) + '...');
            console.log(`Base64 length: ${b64.length}`);
          } else {
            console.log(`No base64 data returned for ${uniqueKey}`);
            return;
          }

          if (b64 && isSupportedImageDataUrl(b64)) {
            console.log(`Base64 validated for ${uniqueKey}, normalizing...`);
            const normalized = await normalizeImageForPdfmake(b64);
            if (normalized) {
              imageMap[uniqueKey] = normalized;
              console.log(`✅ Image successfully loaded for ${uniqueKey}`);
            } else {
              console.log(`❌ Failed to normalize image for ${uniqueKey}`);
            }
          } else {
            console.log(`❌ Base64 validation failed for ${uniqueKey}`);
          }
        } catch (error) {
          console.error(`❌ Error loading image for ${uniqueKey}:`, error);
        }
      }),
    );

    console.log(`Successfully loaded ${Object.keys(imageMap).length} images`);

    const logoUrl = new URL('/rsp/logo.png', window.location.origin).toString();
    let logoBase64 = null;
    try {
      const rawLogo = await getPublicImageBase64(logoUrl);
      const candidate = safeImageOrPlaceholder(rawLogo);
      const normalized = await normalizeImageForPdfmake(candidate);
      logoBase64 = normalized || placeholderImage();
      console.log('Logo loaded successfully');
    } catch (error) {
      console.error('Error loading logo:', error);
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

      // Check if we have an image for this applicant
      const hasImage = uniqueKey && imageMap[uniqueKey] && !DISABLE_ALL_IMAGES;
      const photoData = hasImage ? imageMap[uniqueKey] : null;

      console.log(`Applicant ${idx}: ${fullName}, hasImage: ${!!hasImage}`);

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
      if (photoData && isSupportedImageDataUrl(photoData) && !DISABLE_ALL_IMAGES) {
        imageStack.push({
          image: photoData,
          fit: [100, 100],
          alignment: 'center',
          margin: [0, 8, 0, 8],
        });
        console.log(`✅ Adding photo for ${fullName}`);
      } else {
        console.log(`❌ No photo for ${fullName}`, {
          hasImage: !!hasImage,
          DISABLE_ALL_IMAGES,
          photoData: photoData ? 'exists' : 'null',
        });
        imageStack.push({
          text: 'No Photo',
          alignment: 'center',
          margin: [0, 40, 0, 40],
          fontSize: 8,
          color: '#999',
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
                stack: imageStack,
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
        unbreakable: true,
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
      console.log('Generating PDF...');
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      // Use Promise to wait for blob generation
      return new Promise((resolve, reject) => {
        pdfDocGenerator.getBlob(function (blob) {
          try {
            console.log('PDF blob generated, size:', blob.size);
            const url = URL.createObjectURL(blob);
            pdfUrl.value = url;
            console.log('PDF URL set:', url);

            // Force a re-render of the iframe
            nextTick(() => {
              // The iframe will automatically update when pdfUrl changes
              console.log('PDF generated successfully');
              resolve();
            });
          } catch (error) {
            console.error('Error creating blob URL:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      DISABLE_ALL_IMAGES = true;
      console.log('Retrying without images...');
      await generatePdfContent();
    }
  }

  onUnmounted(function () {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }
    if (rejectionHandler) {
      window.removeEventListener('unhandledrejection', rejectionHandler);
    }
  });

  onMounted(async function () {
    // Backstop: pdfmake's document build runs internally as a promise chain,
    // so an "Invalid image" error thrown deep inside it surfaces as an unhandled rejection.
    rejectionHandler = (event) => {
      const reasonText =
        typeof event.reason === 'string' ? event.reason : event.reason?.message || '';
      if (reasonText.includes('Invalid image')) {
        event.preventDefault();
        console.error(
          'Caught pdfmake image error via unhandledrejection, retrying without images.',
        );
        DISABLE_ALL_IMAGES = true;
        generatePdfContent();
      }
    };
    window.addEventListener('unhandledrejection', rejectionHandler);

    await fetchReportData();
    await generatePdfContent();

    // Log final state
    console.log('Final state:', {
      hasPdfUrl: !!pdfUrl.value,
      pdfUrlValue: pdfUrl.value,
      reportData: !!reportData.value,
      applicants: applicantsArray.value.length,
    });
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
