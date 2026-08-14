<!-- src\components\Reports\AppointmentReport2.vue -->
<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="onDialogUpdate">
    <q-card class="report-modal-card">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="text-h6">Reports Preview</div>
        <q-btn flat round dense icon="close" @click="closeModal" />
      </q-card-section>

      <q-separator class="q-mt-md" />

      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="bg-grey-3 text-grey-8"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="appointment" label="Appointment Report" />
        <q-tab name="certification" label="Certification Report" />
        <q-tab name="position" label="Position Description Report" />
      </q-tabs>

      <q-separator />

      <q-scroll-area class="report-scroll-area">
        <!-- Appointment Report Tab -->
        <div v-show="activeTab === 'appointment'">
          <div ref="printArea" class="appointment-form-container">
            <!-- Page 1 - Appointment Form -->
            <div class="appointment-form page">
              <div class="form-content">
                <div class="form-title">
                  <div class="cs-form">CS Form No. 33-B</div>
                  <div class="revised">Revised 2025</div>
                </div>

                <div class="stamp-section">
                  <div class="stamp-line"></div>
                  <div class="stamp-label">Stamp of Date of Receipts</div>
                </div>

                <div class="header">
                  <div class="left-logo">
                    <img src="/rsp/image.png" alt="Philippine Seal" />
                  </div>
                  <div class="center-header">
                    <div>Republic of the Philippines</div>
                    <div>PROVINCE OF DAVAO DEL NORTE</div>
                    <div><strong>CITY OF TAGUM</strong></div>
                    <br />
                    <div class="office">
                      <strong>{{ officeTitle }}</strong>
                    </div>
                  </div>
                  <div class="right-logo">
                    <img src="/rsp/logo.png" alt="City of Tagum Logo" />
                  </div>
                </div>

                <div class="body">
                  <p>
                    {{ data.Sex === 'MALE' ? 'MR.' : 'MS.' }}:
                    <strong class="underline">
                      {{ formattedName }}
                    </strong>
                  </p>

                  <p style="text-indent: 2em">
                    You are hereby appointed as
                    <ruby>
                      <strong style="text-decoration: underline">
                        {{ data.NewDesignation || '(Position Title)' }}
                      </strong>
                      <rt>(Position Title)</rt>
                    </ruby>
                    (SG/Step
                    <span style="text-decoration: underline; font-weight: bold">
                      {{ formattedStep }}
                    </span>
                    <span>)</span>

                    under
                    <ruby>
                      <span
                        style="
                          font-weight: bold;
                          border-bottom: 1.5px solid black;
                          display: inline-block;
                          min-width: 150px;
                          line-height: 0.9;
                        "
                      >
                        {{ data.employmenttype || 'N/A' }}
                      </span>
                      <rt>(Permanent, Temporary, etc.)</rt>
                    </ruby>
                    status at the
                    <ruby>
                      <strong class="underline">
                        <span
                          :style="{
                            whiteSpace:
                              data.NewDesignation?.length >= 55 && data.NewDesignation?.length <= 75
                                ? 'nowrap'
                                : 'normal',
                          }"
                        >
                          {{ data.NewOffice || '(Office/Department/Unit)' }}
                        </span>
                      </strong>
                      <rt>
                        <span style="white-space: nowrap; word-break: normal">
                          (Office/Department/Unit)
                        </span>
                      </rt>
                    </ruby>
                    &nbsp;with a compensation rate of
                    <strong class="underline">
                      {{ formatSalaryWords(data.MRate) || '(Salary in Words)' }}
                    </strong>
                    <span>(</span>
                    <strong class="underline">
                      {{ formatSalaryAmount(data.MRate) || '(Amount)' }}
                    </strong>
                    <span>)</span>
                    pesos per month.
                  </p>

                  <p style="text-indent: 2em">
                    The nature of this appointment is
                    <ruby>
                      <span
                        style="
                          font-weight: bold;
                          border-bottom: 1.5px solid black;
                          width: 350px;
                          line-height: 0.9;
                          display: inline-block;
                          text-align: center;
                        "
                      >
                        {{ formattedRenew }}
                      </span>
                      <rt>(Original, Promotion, etc.)</rt>
                    </ruby>
                    vice
                    <span
                      style="
                        font-weight: bold;
                        border-bottom: 1.5px solid black;
                        line-height: 0.9;
                        display: inline-block;
                        text-align: center;
                        min-width: 250px;
                      "
                    >
                      {{ data.vicecause || 'N/A' }}
                    </span>
                    , who
                    <ruby>
                      <span
                        style="
                          font-weight: bold;
                          border-bottom: 1.5px solid black;
                          line-height: 0.9;
                          display: inline-block;
                          text-align: center;
                          min-width: 250px;
                        "
                      >
                        {{ data.vicecause || 'N/A' }}
                      </span>
                      <rt>(Transferred, Retired, etc.)</rt>
                    </ruby>
                    with Plantilla Item No.
                    <strong class="underline">{{ data.ItemNo || '(Item No.)' }}</strong>
                    Page
                    <strong class="underline">{{ data.Pages || '(Page No.)' }}</strong>
                    .
                  </p>

                  <p style="text-indent: 2em">
                    This appointment shall take effect on the date of signing by the appointing
                    officer/authority.
                  </p>

                  <p v-if="showProbationaryNote" style="text-indent: 2em">
                    *Appointee shall undergo probationary period of six (6) months upon assumption
                    of duty.
                  </p>

                  <p v-if="!showProbationaryNote" style="text-indent: 2em; color: white">
                    *Appointee shall undergo probationary period of six (6) months upon assumption
                    of duty.
                  </p>
                </div>

                <div class="signature-block">
                  <div class="signature-section">
                    <p class="signature-salutation">{{ signatureSalutation }}</p>
                    <br />
                    <br />
                    <div class="signature-name-container">
                      <strong class="signature-name">{{ signatoryName }}</strong>
                    </div>
                    <div class="signature-title">{{ signatoryTitle }}</div>
                    <br />
                    <div class="signing-date-container">
                      <strong class="signing-date">{{ signingDate || '' }}</strong>
                    </div>
                    <div class="signing-label">Date of Signing</div>
                  </div>
                </div>

                <div class="footer-note">
                  <p class="footer">
                    Accredited/Deregulated Pursuant to
                    <br />
                    <span>CSC Resolution No.</span>
                    <strong class="underline">1701688,</strong>
                    , s.
                    <strong class="underline">2017</strong>
                    <br />
                    Dated
                    <strong class="underline">December 28, 2017</strong>
                  </p>
                </div>
              </div>
            </div>

            <!-- Page 2 - Certification Page -->
            <div class="certification-page page">
              <div class="certification-section">
                <div class="certificates-container">
                  <div class="certificate-box">
                    <h3 class="certification-title">Certification</h3>

                    <p class="certification-text">
                      This is to certify that all requirements and supporting papers pursuant to the
                      <span>
                        <b>2025 Omnibus Rules on Appointments and Other Human Resource Actions,</b>
                      </span>
                      have been complied with, reviewed and found to be in order.
                    </p>
                    <p class="certification-text">
                      The position was published at
                      <span class="underline">{{ publishedAt }}</span>
                      from
                      <span class="underline">{{ publishStartDate }}</span>
                      to
                      <span class="underline">{{ publishEndDate }}</span>
                      and posted in three (3) conspicuous places from
                      <span class="underline">{{ postStartDate }}</span>
                      to
                      <span class="underline">{{ postEndDate }}</span>
                      in consonance with Republic Act No. 7041. The assessment by the Human Resource
                      Merit Promotion and Selection Board (HRMPSB) started on
                      <span class="underline">{{ assessmentDate }}</span>
                      .
                    </p>

                    <div class="signature-container">
                      <div class="signature">
                        <div class="signature-name-container">
                          <strong class="signature-name">JANYLENE A. PALERMO, MM</strong>
                        </div>
                        <div class="cert-signature-title">City Human Resource Mgt. Officer</div>
                      </div>
                    </div>
                  </div>

                  <!-- Second certification -->
                  <div class="certificate-box">
                    <h3 class="certification-title">Certification</h3>

                    <p class="certification-text">
                      This is to certify that the appointee has been screened and found qualified by
                      at least the majority of the HRMPSB/Placement Committee during the
                      deliberation held on
                      <span class="underline">{{ deliberationDate }}</span>
                      .
                    </p>

                    <div class="signature-container">
                      <div class="signature">
                        <div class="signature-name-container">
                          <strong class="signature-name">EDGAR C. DE GUZMAN</strong>
                        </div>
                        <div class="cert-signature-title">
                          City Administrator
                          <br />
                          Authorized Representative of the City Mayor
                          <br />
                          Chairperson
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notation section -->
                <div class="notation-container">
                  <h3 class="notation-title">CSC/HRMO Notation</h3>
                  <div class="notation-content">
                    <div class="notation-table">
                      <table>
                        <tbody>
                          <tr>
                            <td colspan="3" class="table-header">ACTION ON APPOINTMENTS</td>
                            <td class="table-header">Recorded by</td>
                          </tr>
                          <tr>
                            <td colspan="3" class="checkbox-row">
                              <input type="checkbox" class="custom-checkbox" />
                              Validated per RAI for the month of
                              <span class="form-field"></span>
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colspan="3" class="checkbox-row">
                              <input type="checkbox" class="custom-checkbox" />
                              Invalidated per CSCRO/FO letter dated
                              <span class="form-field"></span>
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td class="checkbox-row">
                              <input type="checkbox" class="custom-checkbox" />
                              <span class="bold-text">Appeal</span>
                            </td>
                            <td class="table-header">DATE FILED</td>
                            <td class="table-header">STATUS</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td class="checkbox-deeper-indent">
                              <div class="indent-wrapper">
                                <input type="checkbox" class="custom-checkbox" />
                                CSCRO/ CSC-Commission
                              </div>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr>
                            <td class="checkbox-row">
                              <input type="checkbox" class="custom-checkbox" />
                              <span class="bold-text">Petition for Review</span>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr>
                            <td class="checkbox-deeper-indent">
                              <div class="indent-wrapper">
                                <input type="checkbox" class="custom-checkbox" />
                                CSC-Commission
                              </div>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr>
                            <td class="checkbox-deeper-indent">
                              <div class="indent-wrapper">
                                <input type="checkbox" class="custom-checkbox" />
                                Court of Appeals
                              </div>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr>
                            <td class="checkbox-deeper-indent">
                              <div class="indent-wrapper">
                                <input type="checkbox" class="custom-checkbox" />
                                Supreme Court
                              </div>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Acknowledgement section -->
                <div class="acknowledgement-container">
                  <div class="acknowledgement-boxes">
                    <div class="left-box">
                      <p class="copy-text">
                        Original Copy - for the Agency
                        <br />
                        Certified True Copy - for the Civil Service Commission
                        <br />
                        Certified True Copy - for the Appointee
                      </p>
                    </div>
                    <div class="right-box">
                      <h3 class="acknowledgement-title">Acknowledgement</h3>
                      <p class="acknowledgement-text">
                        Received original of appointment on
                        <span class="form-field"></span>
                      </p>
                      <div class="appointee-signature">
                        <div class="signature-line"></div>
                        <div class="appointee-signature-title">Appointee</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certification Report Tab -->
        <div v-show="activeTab === 'certification'" class="tab-content-wrapper">
          <CertificationReport :data="data" />
        </div>

        <!-- Position Description Report Tab -->
        <div v-show="activeTab === 'position'" class="tab-content-wrapper">
          <PositionDescriptionReport :data="data" />
        </div>
      </q-scroll-area>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Close" color="grey-8" @click="closeModal" />
        <q-btn
          color="primary"
          :icon="isDownloading ? 'hourglass_top' : 'print'"
          :label="isDownloading ? 'Generating...' : 'Print'"
          :disable="isDownloading"
          unelevated
          @click="openPrintTab"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { usePlantillaStore } from 'stores/plantillaStore';
  import CertificationReport from './CertificationReport2.vue';
  import PositionDescriptionReport from './PositionDescriptionReport2.vue';

  const store = usePlantillaStore();

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['update:modelValue', 'close']);

  const printArea = ref(null);
  const activeTab = ref('appointment');
  const isDownloading = ref(false);

  const closeModal = () => {
    emit('update:modelValue', false);
    emit('close');
  };

  const onDialogUpdate = (val) => {
    emit('update:modelValue', val);
    if (!val) emit('close');
  };

  const openPrintTab = async () => {
    const controlNo = props.data.ControlNo;

    if (!controlNo) {
      alert('No Control Number found for this employee.');
      return;
    }

    if (isDownloading.value) return;
    isDownloading.value = true;

    try {
      let success = false;

      // Determine which report to generate based on active tab
      switch (activeTab.value) {
        case 'appointment':
          success = await store.generateAppointmentReport(controlNo);
          break;
        case 'certification':
          success = await store.generateCertificationReport(controlNo);
          break;
        case 'position':
          success = await store.generatePositionDescriptionReport(controlNo);
          break;
        default:
          success = await store.generateAppointmentReport(controlNo);
      }

      if (success) {
        // Optionally close the dialog after successful download
        // closeModal();
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      isDownloading.value = false;
    }
  };

  // Method to generate specific report by type
  const generateSpecificReport = async (reportType) => {
    const controlNo = props.data.ControlNo;

    if (!controlNo) {
      alert('No Control Number found for this employee.');
      return false;
    }

    if (isDownloading.value) return false;
    isDownloading.value = true;

    try {
      let success = false;

      switch (reportType) {
        case 'appointment':
          success = await store.generateAppointmentReport(controlNo);
          break;
        case 'certification':
          success = await store.generateCertificationReport(controlNo);
          break;
        case 'position':
          success = await store.generatePositionDescriptionReport(controlNo);
          break;
        default:
          success = await store.generateAppointmentReport(controlNo);
      }

      return success;
    } catch (error) {
      console.error('Error generating report:', error);
      return false;
    } finally {
      isDownloading.value = false;
    }
  };

  // Expose methods to parent if needed
  defineExpose({
    generateSpecificReport,
  });

  const formattedName = computed(() => {
    const firstName = props.data.Firstname || '';
    const middleInitial = props.data.MIddlename
      ? props.data.MIddlename.charAt(0).toUpperCase() + '. '
      : '';
    const surname = props.data.Surname || '';

    if (!firstName && !surname) return '(Name)';

    return `${firstName} ${middleInitial}${surname}`.trim();
  });

  const officeTitle = computed(() => {
    if (
      props.data.NewOffice?.includes('VICE MAYOR') ||
      props.data.NewOffice?.includes('SANGGUNIANG PANLUNGSOD') ||
      props.data.NewOffice?.includes('SANGGUNIAN')
    ) {
      return 'OFFICE OF THE VICE MAYOR';
    } else {
      return 'OFFICE OF THE CITY MAYOR';
    }
  });

  const signatoryName = computed(() => {
    if (
      props.data.NewOffice?.includes('VICE MAYOR') ||
      props.data.NewOffice?.includes('SANGGUNIANG PANLUNGSOD') ||
      props.data.NewOffice?.includes('SANGGUNIAN')
    ) {
      return props.data.vicemayor || 'VICE MAYOR NAME';
    } else {
      return props.data.mayor || 'REY T. UY';
    }
  });

  const formattedRenew = computed(() => {
    const renewValue = props.data.Renew || '';
    const employmentType = (props.data.employmenttype || '').toUpperCase();

    if (renewValue === 'ORIGINAL' && employmentType === 'PERMANENT') {
      return `${renewValue}*`;
    }

    return renewValue;
  });

  const showProbationaryNote = computed(() => {
    const renewValue = props.data.Renew || '';
    const employmentType = (props.data.employmenttype || '').toUpperCase();

    return renewValue === 'ORIGINAL' && employmentType === 'PERMANENT';
  });

  const formattedStep = computed(() => {
    return `${props.data.SG || ''}/${props.data.Step || ''}`;
  });

  const signatureSalutation = computed(() => {
    return 'Very truly yours,';
  });

  const signatoryTitle = computed(() => {
    if (
      props.data.NewOffice?.includes('VICE MAYOR') ||
      props.data.NewOffice?.includes('SANGGUNIANG PANLUNGSOD') ||
      props.data.NewOffice?.includes('SANGGUNIAN')
    ) {
      return 'City Vice Mayor';
    } else {
      return 'City Mayor';
    }
  });

  const isCoterminousOrElective = computed(() => {
    return props.data.Status === 'CO-TERMINOUS' || props.data.Status === 'Elective';
  });

  const publishedAt = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : 'CSC Website';
  });

  const deliberationDate = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : formatDate(props.data.deliberation_date);
  });

  const publishStartDate = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : formatDate(props.data.post_date);
  });

  const publishEndDate = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : formatDate(props.data.end_date);
  });

  const postStartDate = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : formatDate(props.data.post_date);
  });

  const postEndDate = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : formatDate(props.data.end_date);
  });

  const assessmentDate = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : formatDate(props.data.assessment_date);
  });

  const signingDate = computed(() => {
    return isCoterminousOrElective.value ? 'N/A' : formatDate(props.data.signingDate);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, '0');

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const month = monthNames[date.getMonth()];

    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const formatSalaryWords = (amount) => {
    if (!amount) return '';

    const numericAmount = parseFloat(amount);
    const wholeNumber = Math.floor(numericAmount);
    const decimalPart = Math.round((numericAmount - wholeNumber) * 100);

    const convertToWords = (num) => {
      if (num === 0) return 'ZERO';

      const ones = [
        '',
        'ONE',
        'TWO',
        'THREE',
        'FOUR',
        'FIVE',
        'SIX',
        'SEVEN',
        'EIGHT',
        'NINE',
        'TEN',
        'ELEVEN',
        'TWELVE',
        'THIRTEEN',
        'FOURTEEN',
        'FIFTEEN',
        'SIXTEEN',
        'SEVENTEEN',
        'EIGHTEEN',
        'NINETEEN',
      ];

      const tens = [
        '',
        '',
        'TWENTY',
        'THIRTY',
        'FORTY',
        'FIFTY',
        'SIXTY',
        'SEVENTY',
        'EIGHTY',
        'NINETY',
      ];

      const scales = ['', 'THOUSAND', 'MILLION', 'BILLION', 'TRILLION'];

      const convertHundreds = (n) => {
        let result = '';

        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + ' HUNDRED';
          n %= 100;
          if (n > 0) result += ' ';
        }

        if (n >= 20) {
          result += tens[Math.floor(n / 10)];
          n %= 10;
          if (n > 0) result += '-' + ones[n];
        } else if (n > 0) {
          result += ones[n];
        }

        return result;
      };

      if (num === 0) return 'ZERO';

      let result = '';
      let scaleIndex = 0;

      while (num > 0) {
        const chunk = num % 1000;
        if (chunk !== 0) {
          let chunkWords = convertHundreds(chunk);
          if (scales[scaleIndex]) {
            chunkWords += ' ' + scales[scaleIndex];
          }
          result = chunkWords + (result ? ' ' + result : '');
        }
        num = Math.floor(num / 1000);
        scaleIndex++;
      }

      return result;
    };

    let result = convertToWords(wholeNumber);

    if (decimalPart > 0) {
      result += ' AND ' + convertToWords(decimalPart) + '/100';
    }

    return result;
  };

  const formatSalaryAmount = (amount) => {
    return amount
      ? new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
        }).format(amount)
      : '';
  };
</script>

<style scoped>
  .tab-content-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 16px 0;
    width: 100%;
    min-height: 100%;
    background: #eceff1;
  }

  .tab-content-wrapper > * {
    flex-shrink: 0;
  }

  .report-modal-card {
    width: 950px;
    max-width: 95vw;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
  }

  .report-scroll-area {
    height: 72vh;
    background: #eceff1;
  }

  .appointment-form-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
    align-items: center;
  }

  .page {
    width: 8.5in;
    min-height: 13in;
    font-family: 'Consolas', 'Courier New', Courier, monospace;
    font-size: 12pt;
    color: black;
    background: white;
    box-sizing: border-box;
    page-break-after: always;
    page-break-inside: avoid;
  }

  .page:last-child {
    page-break-after: auto;
  }

  /* Page 1 - Appointment Form Styles */
  .appointment-form {
    padding: 0.3in;
    padding-top: 0.5in;
    line-height: 1.5;
  }

  .form-content {
    width: 100%;
    height: 100%;
    border: 2px solid black;
    box-shadow:
      inset 0 0 0 20px #c0c0c0,
      inset 0 0 0 22px black;
    padding: 0.5in;
    box-sizing: border-box;
    position: relative;
    min-height: calc(13in - 1in);
  }

  .form-title {
    position: absolute;
    top: 0.5in;
    left: 0.5in;
    font-size: 10pt;
    line-height: 1.2;
  }

  .cs-form {
    font-weight: bold;
    font-style: italic;
    font-size: 13pt;
  }

  .revised {
    font-weight: bold;
    font-style: italic;
    font-size: 10pt;
  }

  .stamp-section {
    position: absolute;
    top: 0.5in;
    right: 0.5in;
    text-align: center;
    font-size: 10pt;
    line-height: 1.2;
  }

  .stamp-line {
    width: 200px;
    height: 10px;
    border: none;
    border-bottom: 1px solid black;
    margin-bottom: 5px;
    background-color: white;
  }

  .stamp-label {
    font-weight: bold;
    font-style: italic;
    font-size: 9pt;
    text-align: center;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 3em;
    margin-bottom: 1em;
  }

  .right-logo img {
    width: 105px;
    height: 95px;
  }

  .left-logo img {
    width: 100px;
    height: 90px;
  }

  .center-header {
    text-align: center;
    flex-grow: 1;
    font-size: 11pt;
  }

  .office {
    font-size: 16pt;
  }

  .body {
    font-size: 11pt;
    text-align: justify;
    line-height: 2.5;
    word-break: normal;
  }

  .body p {
    word-break: normal;
    margin-top: 0%;
  }

  p {
    margin: 0%;
    padding: 0%;
  }

  .underline {
    text-decoration: underline;
  }

  ruby {
    ruby-position: under;
    text-align: center;
    line-height: 1;
    word-break: normal;
    overflow-wrap: anywhere;
    display: inline-ruby;
  }

  rt {
    padding-top: 2px;
    font-size: 8pt;
    font-style: italic;
    color: #666;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
  }

  .signature-block {
    text-align: right;
    font-size: 11pt;
  }

  .signature-salutation {
    text-align: left;
  }

  .signature-section {
    display: inline-block;
    text-align: center;
  }

  .signature-name-container {
    position: relative;
    display: inline-block;
    min-width: 300px;
    border-bottom: 2px solid black;
    padding-bottom: 3px;
    margin-bottom: 5px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .signature-name {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 11pt;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .signature-title {
    font-style: italic;
    font-size: 11pt;
  }

  .signing-date-container {
    position: relative;
    display: inline-block;
    min-width: 200px;
    border-bottom: 2px solid black;
    padding-bottom: 3px;
  }

  .signing-date {
    font-weight: bold;
    font-size: 11pt;
  }

  .signing-label {
    font-style: italic;
    font-size: 11pt;
  }

  .footer {
    font-size: 11pt;
  }

  .footer-note {
    max-width: 300px;
    margin-top: 2em;
    margin-bottom: 15px;
    font-size: 11pt;
  }

  /* Page 2 - Certification Page Styles */
  .certification-page {
    padding: 0.3in;
    padding-top: 0.5in;
    position: relative;
  }

  .certification-section {
    width: 100%;
    padding: 0;
    box-sizing: border-box;
    position: relative;
  }

  .certificates-container {
    width: 100%;
    background-color: #c0c0c0;
    padding: 20px;
    box-sizing: border-box;
    border: 2px solid black;
    margin-bottom: 10px;
  }

  .certificate-box {
    width: 100%;
    border: 2px solid black;
    background-color: white;
    padding: 0.1in;
    box-sizing: border-box;
    margin-bottom: 10px;
  }

  .certificate-box:last-child {
    margin-bottom: 0;
  }

  .notation-container {
    width: 100%;
    background-color: #c0c0c0;
    border: 2px solid black;
    box-sizing: border-box;
    margin-bottom: 10px;
    position: relative;
    padding-top: 35px;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
  }

  .notation-title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 0;
    position: absolute;
    top: 3px;
    left: 0;
    right: 0;
  }

  .notation-content {
    background-color: #ffff;
    border: 2px solid black;
    padding: 0.15in;
    box-sizing: border-box;
  }

  .custom-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border: 1px solid black;
    background-color: white;
    margin-right: 5px;
    position: relative;
    top: 1px;
  }

  .custom-checkbox:checked {
    background-color: white;
  }

  .custom-checkbox:checked:after {
    content: '✓';
    position: absolute;
    top: -2px;
    left: 1px;
    color: black;
    font-size: 10px;
  }

  .bold-text {
    font-weight: bold;
  }

  .acknowledgement-container {
    width: 100%;
    background-color: #c0c0c0;
    border: 2px solid black;
    box-sizing: border-box;
    padding: 10px;
  }

  .acknowledgement-boxes {
    display: flex;
    width: 100%;
  }

  .left-box {
    width: 50%;
    background-color: white;
    border: 2px solid black;
    padding: 0.15in;
    padding-top: 40px;
    box-sizing: border-box;
    border-right: none;
  }

  .right-box {
    width: 50%;
    background-color: white;
    border: 2px solid black;
    padding: 0.15in;
    box-sizing: border-box;
  }

  .copy-text {
    font-size: 8pt;
    line-height: 1.5;
  }

  .certification-title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 0px;
  }

  .acknowledgement-title {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 10px;
  }

  .certification-text {
    text-align: justify;
    text-indent: 2em;
    line-height: 1.5;
    font-size: 11pt;
    margin-bottom: 8px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .certification-text .underline {
    word-break: break-word;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .signature-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    margin-bottom: 5px;
  }

  .signature {
    display: inline-block;
    text-align: center;
    width: 380px;
  }

  .cert-signature-title {
    font-size: 9pt;
  }

  .notation-table table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    table-layout: fixed;
  }

  .notation-table td {
    border: 1px solid #000;
    padding: 3px;
    height: 25px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .table-header {
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    background-color: #fff;
  }

  .checkbox-row {
    font-size: 10pt;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .indent-wrapper {
    padding-left: 20px;
    display: flex;
    align-items: center;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .checkbox-deeper-indent {
    padding-left: 5px;
    font-size: 10pt;
  }

  .form-field {
    display: inline-block;
    width: 150;
    min-width: 100px;
    border-bottom: 1px solid #000;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .acknowledgement-text {
    text-align: left;
    margin-bottom: 30px;
    font-size: 8pt;
  }

  .appointee-signature {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }

  .appointee-signature .signature-line {
    border-top: 1px solid #000;
    display: block;
    width: 200px;
    margin: 0 auto 3px auto;
  }

  .appointee-signature-title {
    text-align: center;
    font-size: 10pt;
    width: 100%;
  }

  @media screen {
    .page {
      page-break-after: auto !important;
      page-break-inside: auto !important;
      min-height: auto !important;
      height: auto !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }
  }
</style>
