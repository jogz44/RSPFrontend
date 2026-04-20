<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Newly Appointed and Promoted Employee Report</div>
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
  import { ref, watch, onMounted, onUnmounted } from 'vue';
  import { useSummaryReportStore } from 'stores/summaryReportStore';

  const props = defineProps({
    publicationDate: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: String,
      default: null,
    },
  });

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const summaryReportStore = useSummaryReportStore();
  const reportData = ref(null);

  watch(
    () => [props.publicationDate, props.effectiveDate],
    async ([newPub, newEff], [oldPub, oldEff]) => {
      if (newPub && (newPub !== oldPub || newEff !== oldEff)) {
        await fetchReportData();
        await generatePdfContent();
      }
    },
  );

  // Converts "Apr 14, 2026" → "2026-04-14". Passes through values already in Y-m-d format.
  function toYMD(dateStr) {
    if (!dateStr) return null;
    // Already Y-m-d
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async function fetchReportData() {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const data = await summaryReportStore.fetchNewEmployeeReport(
        toYMD(props.publicationDate),
        toYMD(props.effectiveDate),
      );
      reportData.value = data;
    } catch (error) {
      console.error('Error fetching new employee report data:', error);
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

  /**
   * Build the sub-location line showing hierarchy levels above the office.
   * Levels (root → leaf): group → office2 → division → section → unit
   * Rules:
   *   - Never show "office" (already in the box header)
   *   - Show only the levels that are present
   *   - If unit exists  → show "section - unit"  (or just "unit" if no section)
   *   - Else if section → show "division - section" (or just "section" if no division)
   *   - Else show remaining non-null levels joined by " - "
   */
  function buildSubLocation(jobPost) {
    const { group, office2, division, section, unit } = jobPost;

    if (unit) {
      const parts = [section, unit].filter(Boolean);
      return parts.join(' - ');
    }

    if (section) {
      const parts = [division, section].filter(Boolean);
      return parts.join(' - ');
    }

    // Fall back: show whatever non-null levels exist (group, office2, division)
    return [group, office2, division].filter(Boolean).join(' - ');
  }

  function generateJobPostContent(jobPost) {
    const content = [];

    // Office box — full width, centered text, bordered
    content.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: jobPost.office?.toUpperCase() || '',
              fontSize: 9,
              bold: true,
              alignment: 'center',
              margin: [4, 4, 4, 4],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
      },
      margin: [0, 10, 0, 0],
    });

    // Sub-location line (division / section / unit hierarchy), left-aligned
    const subLocation = buildSubLocation(jobPost);
    if (subLocation) {
      content.push({
        text: subLocation.toUpperCase(),
        fontSize: 8,
        alignment: 'left',
        margin: [0, 4, 0, 4],
      });
    }

    // Applicants table
    const tableBody = [
      [
        { text: 'Appointed Personnel', style: 'tableHeader', alignment: 'center' },
        { text: 'Plantilla No.', style: 'tableHeader', alignment: 'center' },
        { text: 'Designation', style: 'tableHeader', alignment: 'center' },
        { text: 'Salary Grade', style: 'tableHeader', alignment: 'center' },
      ],
    ];

    const hired = jobPost.hired_applicants || [];

    if (hired.length === 0) {
      tableBody.push([{ text: '', fontSize: 8, colSpan: 4, alignment: 'center' }, {}, {}, {}]);
    } else {
      hired.forEach((applicant) => {
        tableBody.push([
          { text: applicant.name.toUpperCase() || '', bold: true, fontSize: 8, alignment: 'left' },
          { text: applicant.ItemNo || '', fontSize: 8, alignment: 'center' },
          { text: applicant.designation || '', fontSize: 8, alignment: 'left' },
          { text: applicant.salary_grade || '', fontSize: 8, alignment: 'center' },
        ]);
      });
    }

    content.push({
      table: {
        headerRows: 1,
        widths: ['30%', '10%', '50%', '10%'],
        body: tableBody,
      },
      layout: {
        // fillColor: (rowIndex) => (rowIndex === 0 ? '#d9d9d9' : null),
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
      },
      margin: [0, 0, 0, 10],
    });

    return content;
  }

  async function generatePdfContent() {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = null;
    }

    if (!reportData.value) return;

    const logoBase64 = await getImageBase64('/logo.png');

    import('pdfmake/build/pdfmake').then((pdfMakeModule) => {
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      import('pdfmake/build/vfs_fonts').then((vfsFontsModule) => {
        pdfMake.vfs = vfsFontsModule?.pdfMake?.vfs || vfsFontsModule?.vfs || vfsFontsModule;

        const allContent = [];

        // ── Title block ──────────────────────────────────────────────────────
        allContent.push({
          stack: [
            {
              text: 'LIST OF NEWLY APPOINTED & PROMOTED PERMANENT EMPLOYEES',
              fontSize: 11,
              bold: true,
              alignment: 'center',
              margin: [0, 0, 0, 3],
            },
            {
              text: `As per ${reportData.value.publication_date || props.publicationDate} Publication`,
              fontSize: 9,
              alignment: 'center',
              margin: [0, 0, 0, 3],
            },
            {
              text: `Effective date of Appointment: ${reportData.value.effective_date || props.effectiveDate || ''}`,
              fontSize: 9,
              alignment: 'center',
              margin: [0, 0, 0, 0],
            },
          ],
          margin: [0, 0, 0, 12],
        });

        // ── Job post sections ────────────────────────────────────────────────
        const jobPosts = reportData.value.data || [];
        jobPosts.forEach((jobPost) => {
          allContent.push(...generateJobPostContent(jobPost));
        });

        // ── PDF document definition ──────────────────────────────────────────
        const docDefinition = {
          pageSize: 'A4',
          pageOrientation: 'portrait',
          pageMargins: [60, 120, 60, 50],
          header: function () {
            return {
              stack: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: (595.28 - 523.28) / 2,
                      y: 60,
                      w: 523.28,
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
                          text: 'OFFICE OF THE CITY MAYOR',
                          fontSize: 11,
                          bold: true,
                          color: 'white',
                          margin: [0, 7, 0, 0],
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
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 30, 0],
            };
          },
          content: allContent,
          styles: {
            tableHeader: {
              fontSize: 8,
              bold: true,
            },
          },
          defaultStyle: {
            fontSize: 8,
          },
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
    if (props.publicationDate) {
      await fetchReportData();
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
