<template>
  <div class="certification-report-wrapper">
    <div class="certification-report-container">
      <div class="report-content">
        <ReportHeader />

        <div class="document-body">
          <!-- Date field - right aligned like formal letters -->
          <div class="date-field">
            {{ formatDateEnglish(currentDate) }}
          </div>

          <p class="greeting">Dear {{ applicantName }},</p>

          <p class="main-text justified">Greetings of Peace and Safety!</p>

          <p class="main-text justified">
            This pertains to your application for
            <strong>{{ position }}</strong>
            , Item No.
            <strong>{{ itemNo }}</strong>
            , in the
            <strong>{{ office }}</strong>
            .
          </p>

          <p class="main-text justified">
            Having qualified to the position, please be informed that you are scheduled to take a
            Competency-Based Written Examination as one of the evaluation assessment tools in our
            recruitment process. As such, kindly refer to the examination schedule below:
          </p>

          <div class="examination-details justified">
            <p><strong>Examination Details:</strong></p>
            <p>
              Date:
              <strong>{{ formatDateEnglish(examData.date) }}</strong>
            </p>
            <p>
              Time:
              <strong>{{ examData.time }}</strong>
            </p>
            <p>
              Venue:
              <strong>{{ examData.venue }}</strong>
            </p>
          </div>

          <p class="main-text justified">
            <strong>Kindly be guided of the following reminders:</strong>
          </p>

          <ul class="reminders-list justified">
            <li>Please arrive at least 30 minutes before your scheduled time of interview.</li>
            <li>Bring a valid ID for identification purposes.</li>
            <li>Observe proper/decent dress code in coming to an interview.</li>
            <li>
              Inform us in advance if you require special assistance (e.g., wheelchair or mobility
              support).
            </li>
            <li>
              Please be advised that HR personnel may take photos for documentation purposes only.
              All data will be handled in accordance with data privacy principles.
            </li>
          </ul>

          <p class="main-text justified">
            The City Government of Tagum thru the Human Resource Merit Promotion and Selection Board
            (HRMPSB) upholds the principle of Equal Employment Opportunity. All applicants are
            treated fairly and evaluated based on merit, fitness, and qualifications, without
            discrimination on the basis of gender, age, civil status, disability, religion, or other
            protected characteristics.
          </p>

          <p class="main-text justified">
            If you have any clarifications, you may reach us through our mobile no.
            <strong>{{ contactNumber }}</strong>
            .
          </p>

          <p class="main-text justified">Kindly reply to this email to confirm your attendance.</p>

          <p class="main-text justified">Thank you.</p>

          <div class="signature-container">
            <div class="signature-section">
              <div class="signature-name">{{ signatoryName }}</div>
              <!-- <div class="signature-line"></div> -->
              <div class="signature-title">{{ signatoryTitle }}</div>
              <div class="signature-subtitle">Authorized Representative of the City Mayor</div>
              <div class="signature-subtitle">Chairperson</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import ReportHeader from 'src/components/Reports/ReportHeader.vue';

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
      default: 'EDGAR C. DE GUZMAN',
    },
    signatoryTitle: {
      type: String,
      default: 'City Administrator',
    },
    footerPhone: {
      type: String,
      default: '',
    },
    footerEmail: {
      type: String,
      default: '',
    },
    applicantName: {
      type: String,
      default: 'Applicant Name',
    },
    position: {
      type: String,
      default: 'POSITION',
    },
    itemNo: {
      type: String,
      default: '#',
    },
    office: {
      type: String,
      default: 'OFFICE',
    },
    contactNumber: {
      type: String,
      default: '',
    },
    examData: {
      type: Object,
      default: () => ({
        date: '',
        time: '10:00 AM',
        venue: 'City Hall of Tagum - HR Office',
      }),
    },
    currentDate: {
      type: [String, Date],
      default: () => new Date(),
    },
  });

  const signatoryName = computed(() => {
    return props.signatoryName;
  });

  const signatoryTitle = computed(() => {
    return props.signatoryTitle;
  });

  const formatDateEnglish = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  };
</script>

<style scoped>
  .certification-report-container {
    width: 8.5in;
    min-height: 11in;
    height: 14in;
    position: relative;
    font-family: 'Times New Roman', Times, serif;
    background-color: white;
    box-sizing: border-box;
    color: black;
    line-height: 1.5;
    letter-spacing: normal;
    display: flex;
    flex-direction: column;
  }

  .report-content {
    padding: 0.75in 1in 0 1in;
    flex: 1;
  }

  .document-body {
    text-align: left;
    font-size: 12pt;
  }

  .date-field {
    text-align: left;
    margin-bottom: 40px;
    font-size: 12pt;
  }

  .greeting {
    margin-bottom: 20px;
    font-size: 12pt;
    text-align: left;
  }

  .main-text {
    margin-bottom: 15px;
    line-height: 1.8;
    font-size: 12pt;
  }

  .justified {
    text-align: justify;
  }

  .examination-details {
    margin: 20px 0;
    padding-left: 0;
    line-height: 1.8;
    font-size: 12pt;
  }

  .examination-details p {
    margin-bottom: 5px;
  }

  .reminders-list {
    margin: 15px 0 20px 40px;
    line-height: 1.8;
    font-size: 12pt;
    padding-left: 20px;
  }

  .reminders-list li {
    margin-bottom: 10px;
    text-align: justify;
  }

  .signature-container {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-top: 60px;
    margin-bottom: 60px;
  }

  .signature-section {
    width: 3in;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-top: 30px;
  }

  .signature-line {
    width: 100%;
    border-bottom: 1px solid black;
    margin-bottom: 5px;
  }

  .signature-name {
    font-weight: bold;
    text-align: center;
    text-decoration: underline;
    text-transform: uppercase;
    font-size: 12pt;
  }

  .signature-title {
    text-align: center;
    font-size: 12pt;
  }

  .signature-subtitle {
    text-align: center;
    font-size: 11px;
    margin-top: 3px;
  }

  /* Page-like styling */
  @media print {
    @page {
      size: letter;
      margin: 0;
    }

    .certification-report-container {
      margin: 0;
      padding: 0;
    }
  }
</style>
