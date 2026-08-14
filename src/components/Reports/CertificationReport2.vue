<template>
  <div class="certification-report-wrapper">
    <!-- Page 1 - Certification for Appointments and Availability of Funds -->
    <div class="certification-report-container page">
      <div class="report-content">
        <ReportHeader />

        <div class="certification-title">
          <h1>CERTIFICATION FOR APPOINTEMENTS ISSUED IN LOCAL GOVERNMENT UNITS (LGUs)</h1>
        </div>
        <div class="certification-body">
          <p class="main-text indented" :style="mainTextStyle">
            <slot name="main-text">
              This is to certify all pertinent provisions of Sec 325 of RA No. 7160 (Local
              Government Code of 1991) have been complied with relative to the appointments issued
              on
              {{ formatDateEnglish(data.EffectiveDate) }}
            </slot>
          </p>

          <div class="signature-container">
            <div class="signature-section">
              <div class="signature-name">{{ signatoryName }}</div>
              <div class="signature-line"></div>
              <div class="signature-title">{{ signatoryTitle }}</div>
            </div>
          </div>

          <div class="stamp" style="padding-top: 35px; padding-bottom: 40px">
            Date: {{ formatDateEnglish(data.EffectiveDate) }}
          </div>
        </div>

        <div class="certification-title">
          <h1>CERTIFICATION ON AVAILABILITY OF FUNDS</h1>
        </div>
        <div class="certification-body">
          <p class="main-text indented" :style="mainTextStyle">
            <slot name="main-text">
              This is to certify that funds are available pursusant to
              {{ data.PresAppro }}
            </slot>
          </p>

          <div class="signature-container">
            <div class="signature-section">
              <div class="signature-name">{{ data.cityaccountant }}</div>
              <div class="signature-line"></div>
              <div class="signature-title">CITY ACCOUNTANT</div>
            </div>
          </div>

          <div class="stamp" style="padding-top: 35px; padding-bottom: 40px">
            Date: {{ formatDateEnglish(data.EffectiveDate) }}
          </div>
        </div>
      </div>
      <ReportFooter :phone="footerPhone" :email="footerEmail" />
    </div>

    <!-- Page 2 - Certification of Assumption to Duty -->
    <div class="certification-report-container page">
      <div class="report-content">
        <ReportHeader />
        <div>
          <div>CSC Form No. 4</div>
          <div>Revised 2025</div>
        </div>

        <div class="certification-title">
          <div class="assumption-title">CERTIFICATION OF ASSUMPTION TO DUTY</div>
        </div>
        <div class="certification-body">
          <p class="main-text indented" :style="mainTextStyle">
            <slot name="main-text">
              This is to certify that
              {{ data.Sex === 'MALE' ? 'Mr.' : 'Ms.' }}
              <span class="bold underline">{{ data.Name4 || 'Unknown' }}</span>
              has assumed the duties and responsibilities as
              <span class="bold underline">{{ data.NewDesignation || 'NA' }}</span>
              of
              <span class="bold underline">{{ data.NewOffice || 'NA' }}</span>
              effective
              <span class="bold underline">{{ formatDateEnglish(data.EffectiveDate) }}</span>
              .
            </slot>
          </p>

          <p class="main-text indented" :style="mainTextStyle">
            <slot name="main-text">
              This certification is being issued in connection with the issuance of the appointment
              of
              {{ data.Sex === 'MALE' ? 'Mr.' : 'Ms.' }}
              <span class="bold underline">{{ data.Name4 || 'Unknown' }}</span>
              as
              <span class="bold underline">{{ data.NewDesignation || 'NA' }}</span>
              .
            </slot>
          </p>

          <p class="issuance-text indented" :style="issuanceTextStyle">
            <slot name="issuance-text">
              Done this {{ formatDayWithSuffix(data.EffectiveDate) }} day of
              {{ formatMonth(data.EffectiveDate) }}, {{ formatYear(data.EffectiveDate) }} at the
              City Government Center, JV Ayala Avenue, Apokon, Tagum City, Davao del Norte.
            </slot>
          </p>
          <div class="signature-container">
            <div class="signature-section">
              <div class="signature-name">{{ data.officeHeadName }}</div>
              <div class="signature-line"></div>
              <div class="signature-title">{{ data.officeHeadPosition }}</div>
            </div>
          </div>

          <div class="left-signature-container">
            <div class="stamp">Attested by:</div>
            <div class="signature-section">
              <div class="signature-name">{{ data.HR }}</div>
              <div class="signature-line"></div>
              <div class="signature-title">CITY HUMAN RESOURCE MGT. OFFICER</div>
            </div>
            <div class="stamp" style="padding-top: 35px; padding-bottom: 40px">
              Date: {{ formatDateEnglish(data.EffectiveDate) }}
            </div>
          </div>

          <div class="stamp">
            <div>201 file</div>
            <div>Admin</div>
            <div>COA</div>
            <div>CSC</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page 3 - Oath of Office -->
    <div class="certification-report-container page">
      <div class="report-content">
        <ReportHeader />
        <div class="oathcontainer">
          <div class="oathstamp"><b>SS Porma Blg. 32</b></div>
          <div class="oathstamp"><i>CS Form No. 32</i></div>
        </div>

        <div class="oathcontainer">
          <div class="oathstamp"><b>Narebisa 2025</b></div>
          <div class="oathstamp">
            <i>Revised 2025</i>
          </div>
        </div>

        <div class="certification-title">
          <h1 style="margin-top: 30px">PANUNUMPA SA KATUNGKULAN</h1>
          <div class="subtitle">OATH OF OFFICE</div>
        </div>
        <div class="certification-body FS">
          <p class="oath-content indented">
            <template v-for="(word, idx) in oathWords" :key="idx">
              <ruby class="word-ruby">
                <span v-html="word.fil"></span>
                <rt>
                  <span v-html="word.eng"></span>
                </rt>
              </ruby>
            </template>
          </p>
          <div class="indented">
            <ruby class="word-ruby">
              <span>KASIHAN NAWA AKO NG DIYOS.</span>
              <rt>
                <span>
                  <span style="color: white">*</span>
                  SO HELP ME GOD
                </span>
              </rt>
            </ruby>
          </div>

          <div class="signature-container">
            <div class="signature-name">{{ data.Name4 }}</div>
          </div>

          <div class="left-signature-container">
            <div>
              Government ID:
              <span v-if="data?.TINNo" class="underline">TIN</span>
              <span v-else class="underline">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
            <div>
              Numero ng ID:
              <span class="underline">
                {{
                  data?.TINNo ||
                  '  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                }}
              </span>
            </div>
            <div>
              Araw ng Pagkakaloob:
              <span
                style="display: inline-block; width: 80px; border-bottom: 1px solid black"
              ></span>
            </div>
          </div>

          <div class="double"></div>

          <p class="main-text indented" :style="mainTextStyle">
            <slot>
              Nilagdaan at pinanumpaan sa harap ko ngayong
              {{ formatDateTagalog(data.EffectiveDate) }} sa Tagum City, Davao Del Norte, Pilipinas.
            </slot>
          </p>

          <div class="signature-container">
            <div class="signature-section">
              <div class="signature-name">{{ signatoryName }}</div>
              <div class="signature-line"></div>
              <div class="signature-title">{{ signatoryTitle }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import ReportHeader from './ReportHeader.vue';
  import ReportFooter from './ReportFooter.vue';

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
    officeName: {
      type: String,
      default: '',
    },
    mainTextStyle: {
      type: Object,
      default: () => ({}),
    },
    issuanceTextStyle: {
      type: Object,
      default: () => ({}),
    },
    signatoryName: {
      type: String,
      default: 'REY T. UY',
    },
    signatoryTitle: {
      type: String,
      default: 'CITY MAYOR',
    },
    footerPhone: {
      type: String,
      default: '',
    },
    footerEmail: {
      type: String,
      default: '',
    },
  });

  // Computed properties for dynamic signatory display
  const signatoryName = computed(() => {
    if (
      props.data.NewOffice?.includes('VICE MAYOR') ||
      props.data.NewOffice?.includes('SANGGUNIANG PANLUNGSOD') ||
      props.data.NewOffice?.includes('SANGGUNIAN')
    ) {
      return props.data.vicemayor || 'NA';
    } else {
      return props.data.mayor || 'NA';
    }
  });

  // Computed property for signatory title
  const signatoryTitle = computed(() => {
    if (
      props.data.NewOffice?.includes('VICE MAYOR') ||
      props.data.NewOffice?.includes('SANGGUNIANG PANLUNGSOD') ||
      props.data.NewOffice?.includes('SANGGUNIAN')
    ) {
      return 'CITY VICE MAYOR';
    } else {
      return 'CITY MAYOR';
    }
  });

  // Date formatting functions
  const formatDateEnglish = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateTagalog = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    const tagalogMonths = {
      0: 'Enero',
      1: 'Pebrero',
      2: 'Marso',
      3: 'Abril',
      4: 'Mayo',
      5: 'Hunyo',
      6: 'Hulyo',
      7: 'Agosto',
      8: 'Setyembre',
      9: 'Oktubre',
      10: 'Nobyembre',
      11: 'Disyembre',
    };

    const month = tagalogMonths[dateObj.getMonth()];
    return `ika-${day} ng ${month}, ${year}`;
  };

  const formatDayWithSuffix = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    if (day > 3 && day < 21) return day + 'th';
    switch (day % 10) {
      case 1:
        return day + 'st';
      case 2:
        return day + 'nd';
      case 3:
        return day + 'rd';
      default:
        return day + 'th';
    }
  };

  const formatMonth = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', { month: 'long' });
  };

  const formatYear = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.getFullYear();
  };

  // Make oathWords a computed property to use dynamic data
  const oathWords = computed(() => [
    { fil: 'Ako', eng: 'I' },
    { fil: 'si', eng: '' },
    {
      fil: ` <span style="font-weight:bold; text-decoration:underline;">${props.data.Name4 || 'Name of Appointee'}</span>`,
      eng: '(Name of Appointee)',
    },
    { fil: ' ng', eng: '' },
    {
      fil: ' <span style="font-weight:bold; text-decoration:underline;">TAGUM CITY, DAVAO DEL NORTE</span> ',
      eng: '(Address)',
    },
    {
      fil: 'na itinalaga bilang',
      eng: 'having been appointed to ',
    },
    {
      fil: ` <span style="font-weight:bold; text-decoration:underline;">${props.data.NewDesignation || 'Position'}</span> `,
      eng: '(Position)',
    },
    {
      fil: 'ay taimtim na nanunumpa na',
      eng: 'hereby solemnly swear,',
    },
    {
      fil: 'sa abot ng aking kakayahan,',
      eng: 'to the best of my ability,',
    },
    {
      fil: 'ang mga katungkulang pinagtalagahan sa akin',
      eng: 'the duties of my present position',
    },
    {
      fil: "at sa dapat gampanan sa iba pang pagkaraan nito'y gagampanan ko",
      eng: 'and of all others that I may hereafter hold',
    },
    {
      fil: 'sa ilalim ng Republika ng Pilipinas;',
      eng: 'under the Republic of the Philippines;',
    },
    {
      fil: 'na aking itataguyod at ipagtatangol ang Saligang Batas ng Pilipinas;',
      eng: 'to uphold and defend the Constitution,',
    },
    {
      fil: 'na tunay na mananalig at tatalima ako rito;',
      eng: 'that I will bear true faith and allegiance to the same;',
    },
    {
      fil: 'na susundin ko ang mga batas at mga kautusang legal,',
      eng: 'that I will obey the laws, legal orders,',
    },
    {
      fil: 'at mga dekretong pinaiiral ng mga sadyang',
      eng: 'and decrees promulgated',
    },
    {
      fil: 'itinakdang maykapangyarihan ng Republika ng Pilipinas;',
      eng: 'by the duly constituted authorities of the Republic of the Philippines;',
    },
    {
      fil: 'at kusa kong babalikatin ang pananagutang ito',
      eng: 'and that I impose this obligation upon myself voluntarily,',
    },
    {
      fil: 'ng walang ano mang pasubali o hangaring umiwas.',
      eng: 'without mental reservation or purpose of evasion.',
    },
    { fil: '', eng: '' },
    { fil: '', eng: '' },
  ]);
</script>

<style scoped>
  .certification-report-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px 0;
    gap: 20px;
  }

  .certification-report-container {
    width: 8.5in;
    min-height: 13in;
    height: 13in;
    position: relative;
    font-family: Arial, sans-serif;
    background-color: white;
    box-sizing: border-box;
    color: black;
    line-height: 1.5;
    letter-spacing: 0.5px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    page-break-after: always;
    page-break-inside: avoid;
  }

  .certification-report-container:last-child {
    page-break-after: auto;
  }

  h1 {
    margin-top: 80px;
    line-height: 1.5;
  }

  .FS {
    font-family: 'Times New Roman', Times, serif;
  }

  .report-content {
    padding: 0.75in 1in 0 1in;
    flex: 1;
  }

  .assumption-title {
    font-size: large;
    font-weight: bold;
  }

  .certification-title {
    text-align: center;
    margin-bottom: 30px;
  }
  .certification-title h1 {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .certification-body {
    text-align: justify;
  }
  .concern-text {
    margin-bottom: 20px;
  }
  .main-text {
    margin-bottom: 15px;
    text-align: justify;
    line-height: 1.8;
  }
  .indented {
    text-indent: 2em;
  }
  .certification-list {
    padding-left: 40px;
    margin-bottom: 30px;
    line-height: 1.8;
  }
  .certification-list li {
    margin-bottom: 15px;
    text-align: justify;
    padding-left: 10px;
  }
  .issuance-text {
    margin-top: 15px;
    margin-bottom: 60px;
    text-align: justify;
    line-height: 1.8;
  }
  .bold {
    font-weight: bold;
  }
  .underline {
    text-decoration: underline;
  }

  .oath-content {
    text-align: justify;
    margin-bottom: 1.5em;
    line-height: 3;
  }
  .word-ruby {
    display: inline ruby;
    letter-spacing: 1;
    text-align: center;
    ruby-align: center;
    word-break: normal;
  }
  .word-only {
    display: inline;
  }
  .word-space {
    display: inline;
  }
  rt {
    font-size: 10px;
    font-style: italic;
    color: #7f8c8d;
    word-break: normal;
  }
  ruby {
    ruby-position: under;
  }

  .signature-container {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 60px;
  }
  .left-signature-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-top: 30px;
  }
  .stamp {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .oathcontainer {
    padding-bottom: 10px;
  }
  .oathstamp {
    font-size: 8pt;
  }

  .double {
    width: 100%;
    height: 6px;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    margin: 20px 0;
  }
  .signature-section {
    width: 4in;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 50px;
  }

  .signature-line {
    width: 100%;
    border-bottom: 1px solid black;
    margin-bottom: 5px;
  }
  .signature-name {
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
  }

  .signature-title {
    text-align: center;
    font-size: small;
  }

  .subtitle {
    font-size: 14px;
    font-weight: normal;
    margin-top: 5px;
  }

  @media print {
    .certification-report-wrapper {
      padding: 0;
      gap: 0;
    }

    .certification-report-container {
      box-shadow: none;
      page-break-after: always;
      page-break-inside: avoid;
      height: 13in;
    }

    .certification-report-container:last-child {
      page-break-after: auto;
    }
  }
</style>
