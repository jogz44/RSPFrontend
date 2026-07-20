<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Unqualified Applicants Report</div>
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
  import { useSummaryReportStore } from 'stores/summaryReportStore';
  import { useQuasar } from 'quasar';

  const props = defineProps({
    publicationDate: {
      type: String,
      required: true,
    },
  });

  const summaryReportStore = useSummaryReportStore();
  const $q = useQuasar();

  const pdfUrl = ref(null);
  const isLoading = ref(false);
  const reportData = ref(null);

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
      const response = await summaryReportStore.fetchInternalUnqualifiedReport(
        props.publicationDate,
      );
      reportData.value = response;
      console.log('Report data:', response);
    } catch (error) {
      console.error('Error fetching unqualified report:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to load unqualified applicants report',
      });
    } finally {
      isLoading.value = false;
    }
  }

  // FALLBACK: Only used when experience_text is not available
  function calculateTotalExperience(applicant) {
    if (!applicant.experience || applicant.experience.length === 0) {
      return '';
    }

    let totalDays = 0;

    applicant.experience.forEach((exp) => {
      let fromDate, toDate;

      if (exp.WFrom) {
        const [month, day, year] = exp.WFrom.split('/');
        fromDate = new Date(`${year}-${month}-${day}`);
      } else if (exp.work_date_from) {
        const [day, month, year] = exp.work_date_from.split('/');
        fromDate = new Date(`${year}-${month}-${day}`);
      }

      if (exp.WTo) {
        const [month, day, year] = exp.WTo.split('/');
        toDate = new Date(`${year}-${month}-${day}`);
      } else if (exp.work_date_to) {
        const [day, month, year] = exp.work_date_to.split('/');
        toDate = new Date(`${year}-${month}-${day}`);
      }

      if (fromDate && toDate && !isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        const diffTime = Math.abs(toDate - fromDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        totalDays += diffDays;
      }
    });

    let years = Math.floor(totalDays / 365);
    let remainingDays = totalDays % 365;
    let months = Math.floor(remainingDays / 30);
    let days = remainingDays % 30;

    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (result) result += ', ';
      result += `${months} month${months > 1 ? 's' : ''}`;
    }
    if (days > 0) {
      if (result) result += ', ';
      result += `${days} day${days > 1 ? 's' : ''}`;
    }

    return result ? `${result} of relevant experience` : '';
  }

  // FALLBACK: Only used when training_text is not available
  function calculateTotalTraining(applicant) {
    if (!applicant.training || applicant.training.length === 0) {
      return 0;
    }

    let totalHours = 0;
    applicant.training.forEach((training) => {
      const hours = parseFloat(training.NumHours) || 0;
      totalHours += hours;
    });

    return totalHours;
  }

  // Helper function to convert experience text to decimal years
  function convertExperienceToDecimalYears(experienceText) {
    if (!experienceText) return 0;

    const yearsMatch = experienceText.match(/(\d+)\s*years?/i);
    const monthsMatch = experienceText.match(/(\d+)\s*months?/i);
    const daysMatch = experienceText.match(/(\d+)\s*days?/i);

    let totalYears = 0;
    if (yearsMatch) totalYears += parseInt(yearsMatch[1]);
    if (monthsMatch) totalYears += parseInt(monthsMatch[1]) / 12;
    if (daysMatch) totalYears += parseInt(daysMatch[1]) / 365;

    return totalYears;
  }

  function getCriteriaRatingDescription(jobPost, applicant, type) {
    const criteriaRating = jobPost.criteria_rating?.[0];
    if (!criteriaRating) return null;

    const requiredValue = jobPost.criteria?.[type.charAt(0).toUpperCase() + type.slice(1)] || '';

    let requiredYears = 0;
    let requiredHours = 0;
    let applicantTotalYears = 0;
    let applicantHours = 0;

    if (type === 'experience') {
      const yearMatch = requiredValue.match(/(\d+)\s*Years?/i);
      requiredYears = yearMatch ? parseInt(yearMatch[1]) : 0;

      // PRIORITY: Use experience_text if available
      let experienceText = applicant.experience_text || '';
      applicantTotalYears = convertExperienceToDecimalYears(experienceText);

      // FALLBACK: Calculate if experience_text is not available or parsing failed
      if (applicantTotalYears === 0 && applicant.experience && applicant.experience.length > 0) {
        const calculatedExperience = calculateTotalExperience(applicant);
        applicantTotalYears = convertExperienceToDecimalYears(calculatedExperience);
      }
    }

    if (type === 'training') {
      const hourMatch = requiredValue.match(/(\d+)\s*Hours?/i);
      requiredHours = hourMatch ? parseInt(hourMatch[1]) : 0;

      // PRIORITY: Use training_text if available
      let trainingText = applicant.training_text || '';
      const hourMatchFromText = trainingText.match(/(\d+)\s*hours?/i);

      if (hourMatchFromText) {
        applicantHours = parseInt(hourMatchFromText[1]);
      } else {
        // FALLBACK: Calculate if training_text is not available
        applicantHours = calculateTotalTraining(applicant);
      }
    }

    // Handle training criteria
    if (type === 'training' && criteriaRating.trainings && requiredHours > 0) {
      if (applicantHours > requiredHours) {
        const trainingRating = criteriaRating.trainings.find((t) =>
          t.description.includes('More than the Minimum Hours'),
        );
        return trainingRating ? trainingRating.description : null;
      } else if (applicantHours >= requiredHours) {
        const trainingRating = criteriaRating.trainings.find((t) =>
          t.description.includes('Within the Minimum Hours'),
        );
        return trainingRating ? trainingRating.description : null;
      }
      return null;
    }

    // Handle experience criteria - FIXED with decimal years
    if (type === 'experience' && criteriaRating.experiences && requiredYears > 0) {
      const percentageOfRequired = (applicantTotalYears / requiredYears) * 100;

      for (const exp of criteriaRating.experiences) {
        const desc = exp.description;
        let matches = false;

        if (desc.includes('500% and above') && percentageOfRequired >= 500) matches = true;
        else if (
          desc.includes('400%-499%') &&
          percentageOfRequired >= 400 &&
          percentageOfRequired < 500
        )
          matches = true;
        else if (
          desc.includes('300%-399%') &&
          percentageOfRequired >= 300 &&
          percentageOfRequired < 400
        )
          matches = true;
        else if (
          desc.includes('200%-299%') &&
          percentageOfRequired >= 200 &&
          percentageOfRequired < 300
        )
          matches = true;
        else if (
          desc.includes('101%-199%') &&
          percentageOfRequired >= 101 &&
          percentageOfRequired < 200
        )
          matches = true;
        else if (
          desc.includes('Minimum Number') &&
          percentageOfRequired >= 100 &&
          percentageOfRequired < 101
        )
          matches = true;

        if (matches) {
          return desc;
        }
      }
      return null;
    }

    if (type === 'experience' && requiredValue.toLowerCase().includes('none required')) {
      return null;
    }

    return null;
  }

  function getEducationInfo(applicant) {
    if (!applicant.education || applicant.education.length === 0) {
      return '';
    }

    const educationLines = applicant.education.map((edu) => {
      let line = edu.degree || edu.Degree || '';
      const units = edu.highest_units || edu.NumUnits || '';
      line += ` (${units} UNITS)`;
      return line;
    });

    return educationLines.join('\n');
  }

  function getApplicantQualification(applicantText, type, applicant) {
    if (type === 'education') {
      if (applicantText) {
        if (applicantText.toLowerCase().includes('no relevant')) {
          return applicantText.trim();
        }

        let cleanText = applicantText;
        cleanText = cleanText.replace(/<br\s*\/?>/gi, '\n');
        cleanText = cleanText.replace(/•\s*/g, '');
        return cleanText.trim();
      }

      const educationInfo = getEducationInfo(applicant);
      if (educationInfo) {
        return educationInfo;
      }
      return '';
    }

    if (applicantText && applicantText.toLowerCase().includes('no relevant')) {
      return applicantText.trim();
    }

    if (!applicantText) {
      return '';
    }

    let cleanText = applicantText;
    cleanText = cleanText.replace(/<br\s*\/?>/gi, '\n');
    cleanText = cleanText.replace(/•\s*/g, '');

    return cleanText.trim();
  }

  function formatCellContent(jobPost, applicant, type, requiredText, applicantText, remark) {
    let result = '';

    if (type === 'experience') {
      const criteriaRatingDesc = getCriteriaRatingDescription(jobPost, applicant, type);
      const applicantQual = getApplicantQualification(applicantText, type, applicant);

      if (criteriaRatingDesc) {
        result += criteriaRatingDesc.toUpperCase();
        if (applicantQual) {
          result += '\n' + applicantQual.toUpperCase();
        }
      } else if (applicantQual) {
        result += applicantQual.toUpperCase();
      }
    } else if (type === 'training') {
      const criteriaRatingDesc = getCriteriaRatingDescription(jobPost, applicant, type);
      const applicantQual = getApplicantQualification(applicantText, type, applicant);

      if (criteriaRatingDesc) {
        result += criteriaRatingDesc.toUpperCase();
        if (applicantQual) {
          result += '\n' + applicantQual.toUpperCase();
        }
      } else if (applicantQual) {
        result += applicantQual.toUpperCase();
      }
    } else if (type === 'education') {
      const applicantQual = getApplicantQualification(applicantText, type, applicant);
      if (applicantQual) {
        result += applicantQual.toUpperCase();
      }
    } else if (type === 'eligibility') {
      const applicantQual = getApplicantQualification(applicantText, type, applicant);
      if (applicantQual) {
        result += applicantQual.toUpperCase();
      }
    }

    if (remark && remark.trim()) {
      if (result && result !== '') result += '\n\n';
      result += `REMARKS: ${remark.toUpperCase()}`;
    }

    return result || '';
  }

  function generateTableRows() {
    if (!reportData.value || !reportData.value.jobPosts) {
      return [];
    }

    const rows = [];

    reportData.value.jobPosts.forEach((jobPost) => {
      rows.push([
        {
          text: `${jobPost.Abbr} ${jobPost.ItemNo}`.toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          alignment: 'center',
        },
        {
          text: (jobPost.SalaryGrade || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          alignment: 'center',
        },
        {
          text: (jobPost.Position || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
        },
        {
          text: (jobPost.criteria?.Education || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
        },
        {
          text: (jobPost.criteria?.Experience || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
        },
        {
          text: (jobPost.criteria?.Training || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
        },
        {
          text: (jobPost.criteria?.Eligibility || '').toUpperCase(),
          style: 'positionRow',
          fillColor: '#d9d9d9',
          fontSize: 6.5,
        },
      ]);

      if (jobPost.applicants && jobPost.applicants.length > 0) {
        const uniqueApplicants = jobPost.applicants.filter(
          (applicant, index, self) =>
            index ===
            self.findIndex(
              (a) => a.firstname === applicant.firstname && a.lastname === applicant.lastname,
            ),
        );

        let counter = 1;

        uniqueApplicants.forEach((applicant) => {
          const applicantName = `${applicant.firstname || ''} ${applicant.lastname || ''}`.trim();
          const isOutsider = String(applicant.applicant_status || '').toUpperCase() === 'OUTSIDER';
          const positionText = (applicant.current_designation || '').toUpperCase();
          const officeText = (applicant.office || '').toUpperCase();

          const nameCellText = isOutsider
            ? `${counter}. ${applicantName.toUpperCase()} (OUTSIDER)`
            : `${counter}. ${applicantName.toUpperCase()}\n${positionText}\n${officeText}`;

          rows.push([
            { text: '', style: 'applicantRow' },
            { text: '', style: 'applicantRow' },
            { text: nameCellText, style: 'applicantRow', fontSize: 7 },
            {
              text: formatCellContent(
                jobPost,
                applicant,
                'education',
                jobPost.criteria?.Education || '',
                applicant.education_text,
                applicant.education_remark,
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
            {
              text: formatCellContent(
                jobPost,
                applicant,
                'experience',
                jobPost.criteria?.Experience || '',
                applicant.experience_text,
                applicant.experience_remark,
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
            {
              text: formatCellContent(
                jobPost,
                applicant,
                'training',
                jobPost.criteria?.Training || '',
                applicant.training_text,
                applicant.training_remark,
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
            {
              text: formatCellContent(
                jobPost,
                applicant,
                'eligibility',
                jobPost.criteria?.Eligibility || '',
                applicant.eligibility_text,
                applicant.eligibility_remark,
              ),
              style: 'applicantCell',
              fontSize: 6.5,
            },
          ]);

          counter += 1;
        });
      } else {
        rows.push([
          {},
          {},
          { text: 'NO APPLICANT', colSpan: 5, alignment: 'center', italics: true },
          {},
          {},
          {},
          {},
        ]);
      }
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

    const logoBase64 = await getImageBase64('/rsp/logo.png');

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
        {
          text: 'FOR QS VALIDATION INTERNAL APPLICANT REPORT'.toUpperCase(),
          fontSize: 13,
          bold: true,
          alignment: 'center',
          margin: [0, -20, 0, 0],
        },
        {
          text: (reportData.value.Date || `${props.publicationDate} PUBLICATION`).toUpperCase(),
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 30],
        },
        {
          table: {
            headerRows: 2,
            widths: ['8%', '4%', '15%', '18%', '18%', '18%', '18%'],
            body: [
              [
                { text: 'PLANTILLA CODE', style: 'tableHeader', rowSpan: 2, fontSize: 7 },
                { text: 'SG', style: 'tableHeader', rowSpan: 2, fontSize: 7 },
                {
                  text: "POSITION TITLE WITH APPLICANT'S NAME",
                  style: 'tableHeader',
                  rowSpan: 2,
                  fontSize: 7,
                },
                {
                  text: 'QUALIFICATION STANDARDS',
                  style: 'tableHeader',
                  colSpan: 4,
                  fontSize: 7,
                },
                {},
                {},
                {},
              ],
              [
                {},
                {},
                {},
                { text: 'EDUCATION', style: 'tableHeader', fontSize: 7 },
                { text: 'EXPERIENCE', style: 'tableHeader', fontSize: 7 },
                { text: 'TRAINING', style: 'tableHeader', fontSize: 7 },
                { text: 'ELIGIBILITY', style: 'tableHeader', fontSize: 7 },
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
            fillColor: (rowIndex) => (rowIndex === 0 || rowIndex === 1 ? '#ffc000' : null),
          },
        },
      ],
      styles: {
        tableHeader: {
          fontSize: 7,
          bold: true,
          alignment: 'center',
        },
        positionRow: {
          fontSize: 6.5,
          bold: true,
          alignment: 'left',
        },
        applicantRow: {
          fontSize: 7,
          alignment: 'left',
        },
        applicantCell: {
          fontSize: 6.5,
          alignment: 'left',
        },
      },
      defaultStyle: {
        fontSize: 6.5,
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
    width: 100%;
    max-width: 90vw;
    height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  }
</style>
