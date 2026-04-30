<template>
  <q-page class="job-details-page">
    <!-- Header with back button and title -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <q-btn
            icon="arrow_back"
            round
            class="back-btn bg-black text-white"
            :to="{ name: 'Joblist' }"
            :size="buttonSize"
          />
          <div class="header-text q-ml-sm">
            <div class="page-title text-bold">Job details</div>
            <div class="breadcrumb text-grey gt-xs">Available Job Posts / Job details</div>
          </div>
        </div>
        <div class="header-right">
          <q-chip
            v-if="!jobPostStore.loading"
            class="posted-chip text-white bg-blue"
            :size="chipSize"
          >
            <q-icon name="event" size="xs" class="q-mr-xs gt-xs" />
            <span class="chip-text">
              {{ formatPostedDate(selectedJob?.post_date) }}
            </span>
          </q-chip>
          <q-chip v-else class="posted-chip text-white bg-blue" :size="chipSize">
            <q-linear-progress rounded color="white" query class="loading-progress" />
          </q-chip>
          <q-chip
            v-if="!jobPostStore.loading"
            class="ended-chip text-white bg-red"
            :size="chipSize"
          >
            <q-icon name="event" size="xs" class="q-mr-xs gt-xs" />
            <span class="chip-text">
              {{ formatEndDate(selectedJob?.end_date) }}
            </span>
          </q-chip>
          <q-chip v-else class="ended-chip text-white bg-red" :size="chipSize">
            <q-linear-progress rounded color="white" query class="loading-progress" />
          </q-chip>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Main content card -->
      <q-card v-if="!jobPostStore.loading" class="job-details-card" flat bordered>
        <q-card-section>
          <!-- Job header with logo and info -->
          <div class="job-header">
            <q-avatar color="primary" text-color="white" :size="avatarSize">
              {{ selectedJob?.Position ? selectedJob.Position.charAt(0) : 'N' }}
            </q-avatar>
            <div class="job-info q-ml-md">
              <div class="job-position text-green text-weight-bold">
                {{ selectedJob?.Position || 'No Position' }}
              </div>
              <div class="chips-row q-mb-md">
                <q-chip class="chip-padding salary-chip" dense>
                  <q-icon name="layers" class="q-mr-xs" />
                  <span class="chip-label">
                    Salary Grade:
                    <b>{{ selectedJob?.SalaryGrade || '-' }}</b>
                  </span>
                </q-chip>
                <q-chip class="chip-padding level-chip" dense>
                  <q-icon name="work" class="q-mr-xs" />
                  <span class="chip-label">
                    Level:
                    <b>{{ selectedJob?.level || '-' }}</b>
                  </span>
                </q-chip>
                <q-chip class="chip-padding page-chip" dense>
                  <q-icon name="layers" class="q-mr-xs" />
                  <span class="chip-label">
                    Page No:
                    <b>{{ selectedJob?.PageNo || '-' }}</b>
                  </span>
                </q-chip>
                <q-chip class="chip-padding item-chip" dense>
                  <q-icon name="apps" class="q-mr-xs" />
                  <span class="chip-label">
                    Item No:
                    <b>{{ selectedJob?.ItemNo || '-' }}</b>
                  </span>
                </q-chip>
              </div>
              <div class="job-details-list">
                <div class="job-detail-item" v-if="selectedJob?.Office">
                  <q-icon name="business" size="xs" class="q-mr-xs" />
                  <span>{{ selectedJob.Office }}</span>
                </div>
                <div
                  class="job-detail-item"
                  v-if="selectedJob?.Division && selectedJob.Division !== 'N/A'"
                >
                  <q-icon name="corporate_fare" size="xs" class="q-mr-xs" />
                  <span>{{ selectedJob.Division }}</span>
                </div>
                <div
                  class="job-detail-item"
                  v-if="selectedJob?.Section && selectedJob.Section !== 'N/A'"
                >
                  <q-icon name="account_tree" size="xs" class="q-mr-xs" />
                  <span>{{ selectedJob.Section }}</span>
                </div>
                <div class="job-detail-item" v-if="selectedJob?.Unit && selectedJob.Unit !== 'N/A'">
                  <q-icon name="groups" size="xs" class="q-mr-xs" />
                  <span>{{ selectedJob.Unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Qualification Standards section -->
        <q-card-section class="qualifications-section">
          <div class="section-main-title text-green text-bold">
            Qualification Standards/Requirements
          </div>

          <div class="qualifications-grid q-mt-md">
            <q-card flat bordered class="qualification-card">
              <q-card-section>
                <q-badge color="primary" class="q-mb-sm">Education</q-badge>
                <div class="qualification-text">{{ selectedCriteria?.Education || 'None' }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="qualification-card">
              <q-card-section>
                <q-badge color="secondary" class="q-mb-sm">Training</q-badge>
                <div class="qualification-text">{{ selectedCriteria?.Training || 'None' }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="qualification-card">
              <q-card-section>
                <q-badge color="accent" class="q-mb-sm">Experience</q-badge>
                <div class="qualification-text">{{ selectedCriteria?.Experience || 'None' }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="qualification-card">
              <q-card-section>
                <q-badge color="positive" class="q-mb-sm">Eligibility</q-badge>
                <div class="qualification-text">{{ selectedCriteria?.Eligibility || 'None' }}</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Application Process -->
        <q-card-section class="application-process-section bg-grey-1">
          <div class="process-main-title text-center text-weight-bold q-mb-lg">
            Application Process
          </div>

          <q-banner class="admin-notice q-mb-lg" rounded inline-actions>
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" size="sm" />
            </template>

            <div class="text-weight-medium text-orange">Data Sheet Notice</div>

            <div class="text-grey-7 text-caption q-mt-xs">
              Please do not modify the structure of the Excel data sheet. Only enter data in the
              designated or allowed cells. Any changes to the format, formulas, or layout may result
              in the file being invalid or rejected.
            </div>
          </q-banner>

          <div class="process-steps">
            <!-- Step 1: Download Form -->
            <div class="process-step-wrapper">
              <div class="process-card bg-white">
                <div class="card-content">
                  <div class="step-number bg-green-1 text-green">1</div>
                  <div class="step-icon bg-green-1">
                    <q-icon name="file_download" :size="iconSize" color="green" />
                  </div>
                  <div class="step-title text-green">Download Data Sheet</div>
                  <div class="step-description">
                    Get the data sheet template to fill with your details.
                  </div>
                  <q-btn
                    label="DOWNLOAD DATA SHEET"
                    color="green"
                    class="action-btn full-width q-mt-md"
                    outline
                    @click="downloadExcelForm"
                    :size="buttonSize"
                  />
                </div>
              </div>
            </div>

            <!-- Step 2: Fill Out Form -->
            <div class="process-step-wrapper">
              <div class="process-card bg-white">
                <div class="card-content">
                  <div class="step-number bg-blue-1 text-blue">2</div>
                  <div class="step-icon bg-blue-1">
                    <q-icon name="edit_document" :size="iconSize" color="blue" />
                  </div>
                  <div class="step-title text-blue">Fill Out the Data Sheet</div>
                  <div class="step-description">
                    Complete all required fields in the downloaded Excel data sheet. Do not modify
                    the file's structure or formatting.
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Prepare Supporting Documents -->
            <div class="process-step-wrapper">
              <div class="process-card bg-white">
                <div class="card-content">
                  <div class="card-header">
                    <div class="step-number bg-orange-1 text-orange">3</div>
                    <q-btn
                      icon="info_outline"
                      flat
                      round
                      dense
                      size="sm"
                      color="orange"
                      class="info-btn"
                      @click="openZipInstructions"
                    >
                      <q-tooltip class="bg-orange">Click for detailed instructions</q-tooltip>
                    </q-btn>
                  </div>

                  <div class="step-icon bg-orange-1">
                    <q-icon name="folder_zip" :size="iconSize" color="orange" />
                  </div>
                  <div class="step-title text-orange">Prepare Supporting Documents</div>
                  <div class="step-description">
                    Compile all your supporting documents and compress them into a single
                    <strong>ZIP file</strong>
                    . Click the info button above for detailed instructions on how to properly
                    organize your documents.
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Email Application -->
            <div class="process-step-wrapper">
              <div class="process-card bg-white">
                <div class="card-content">
                  <div class="step-number bg-purple-1 text-purple">4</div>
                  <div class="step-icon bg-purple-1">
                    <q-icon name="email" :size="iconSize" color="purple" />
                  </div>
                  <div class="step-title text-purple">Email Your Application</div>
                  <div class="step-description">
                    Send your completed data sheet and ZIP file of supporting documents to our
                    recruitment email address below.
                  </div>

                  <!-- Email address display -->
                  <div class="email-box q-mt-md full-width">
                    <q-icon name="alternate_email" size="18px" color="purple" class="q-mr-xs" />
                    <span class="email-address">lgutagumhrmo.recruitment@gmail.com</span>
                  </div>

                  <q-btn
                    label="OPEN EMAIL CLIENT"
                    color="purple"
                    class="action-btn full-width q-mt-md"
                    :size="buttonSize"
                    icon="send"
                    @click="openEmailClient"
                  />

                  <div class="email-note q-mt-sm text-grey-6 text-caption text-center">
                    Use the subject format:
                    <br />
                    <em>Application – [Position] – [Your Name]</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Loading skeleton -->
      <q-card v-else flat bordered class="job-details-card">
        <q-card-section>
          <q-skeleton type="text" />
          <q-skeleton type="rect" height="200px" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Zip Instructions Modal Component -->
    <ZipInstructionModal
      v-model="showZipInstructions"
      @instruction-complete="handleInstructionComplete"
    />
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useJobPostStore } from 'stores/jobPostStore';
  import { toast } from 'src/boot/toast';
  import ZipInstructionModal from 'components/ZipFileModal.vue';

  const $q = useQuasar();
  const route = useRoute();
  const router = useRouter();

  const jobPostStore = useJobPostStore();

  const id = route.params.id;

  const RECRUITMENT_EMAIL = 'lgutagumhrmo.recruitment@gmail.com';

  // ==================== RESPONSIVE COMPUTED ====================
  const buttonSize = computed(() => {
    if ($q.screen.xs) return 'sm';
    if ($q.screen.sm) return 'md';
    return 'md';
  });

  const chipSize = computed(() => {
    if ($q.screen.xs) return 'sm';
    return 'md';
  });

  const avatarSize = computed(() => {
    if ($q.screen.xs) return '50px';
    if ($q.screen.sm) return '60px';
    return '75px';
  });

  const iconSize = computed(() => {
    if ($q.screen.xs) return '24px';
    if ($q.screen.sm) return '30px';
    return '36px';
  });

  // ==================== UI STATE ====================
  const showZipInstructions = ref(false);

  // ==================== JOB DATA STATE ====================
  const selectedJob = ref(null);
  const selectedCriteria = ref(null);

  // ==================== HELPER FUNCTIONS ====================

  function formatPostedDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if ($q.screen.xs) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }
    return (
      'Posted ' +
      date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    );
  }

  function formatEndDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if ($q.screen.xs) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }
    return (
      'Ended ' +
      date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    );
  }

  function downloadExcelForm() {
    const excelFileUrl = '/pds.xlsx';
    const a = document.createElement('a');
    a.href = excelFileUrl;

    const position = selectedJob.value?.Position || 'Job';
    const formattedPosition = position.replace(/\s+/g, '_');
    a.download = `${formattedPosition}_Application_Form.xlsx`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function openZipInstructions() {
    showZipInstructions.value = true;
  }

  function handleInstructionComplete() {
    showZipInstructions.value = false;
  }

  function openEmailClient() {
    const position = selectedJob.value?.Position || 'Position';
    const subject = encodeURIComponent(`Application – ${position} – [Your Name]`);
    const body = encodeURIComponent(
      `Dear HRMO Recruitment Team,\n\nI am applying for the ${position} position.\n\nPlease find attached:\n1. Completed Data Sheet (.xlsx)\n2. Supporting Documents (.zip)\n\nThank you.`,
    );
    window.location.href = `mailto:${RECRUITMENT_EMAIL}?subject=${subject}&body=${body}`;
  }

  // ==================== JOB DATA FUNCTIONS ====================

  const refreshJobDetails = async (showLoading = false) => {
    if (showLoading) {
      jobPostStore.loading = true;
    }

    try {
      let jobDetails = await jobPostStore.fetchJobDetails(id);

      if (!jobDetails && jobPostStore.jobPosts) {
        jobDetails = jobPostStore.jobPosts;
      }

      if (!jobDetails) {
        throw new Error('No job details returned from server');
      }

      selectedJob.value = {
        id: jobDetails.id || null,
        old_job_id: jobDetails.old_job_id || null,
        Position: jobDetails.Position || 'Unknown Position',
        status: jobDetails.status || 'Unknown',
        level: jobDetails.level || 'N/A',
        PageNo: jobDetails.PageNo || 'N/A',
        ItemNo: jobDetails.ItemNo || 'N/A',
        SalaryGrade: jobDetails.SalaryGrade || 'N/A',
        Office: jobDetails.Office || 'Unknown Office',
        Division: jobDetails.Division || 'N/A',
        Section: jobDetails.Section || 'N/A',
        Unit: jobDetails.Unit || 'N/A',
        post_date: jobDetails.post_date || null,
        end_date: jobDetails.end_date || null,
        PositionID: jobDetails.PositionID || '',
        tblStructureDetails_ID: jobDetails.tblStructureDetails_ID || null,
        ...jobDetails,
      };

      if (jobDetails.criteria && typeof jobDetails.criteria === 'object') {
        selectedCriteria.value = {
          id: jobDetails.criteria.id || null,
          Education: jobDetails.criteria.Education || 'Not specified',
          Experience: jobDetails.criteria.Experience || 'Not specified',
          Training: jobDetails.criteria.Training || 'Not specified',
          Eligibility: jobDetails.criteria.Eligibility || 'Not specified',
        };
      } else {
        selectedCriteria.value = {
          Education: 'No criteria available',
          Experience: 'No criteria available',
          Training: 'No criteria available',
          Eligibility: 'No criteria available',
        };
      }

      return jobDetails;
    } catch (error) {
      console.error('Error refreshing job details:', error);
      throw error;
    } finally {
      if (showLoading) {
        jobPostStore.loading = false;
      }
    }
  };

  // ==================== LIFECYCLE HOOKS ====================

  onMounted(async () => {
    if (!id) {
      console.error('No job ID provided in route params');
      toast.error('No job ID provided');
      router.push('/job-post');
      return;
    }

    try {
      await refreshJobDetails(true);
    } catch (error) {
      console.error('Error during initial data loading:', error);

      let errorMessage = 'Failed to load job details';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Job not found';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      if (error.response?.status === 404) {
        setTimeout(() => {
          router.push('/job-post');
        }, 2000);
      }
    }
  });
</script>

<style scoped>
  /* ==================== BASE LAYOUT ====================*/
  .job-details-page {
    padding: 0;
    background: #f5f5f5;
  }

  .page-header {
    background: white;
    padding: 16px 24px;
    border-bottom: 1px solid #eee;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .back-btn {
    flex-shrink: 0;
  }

  .header-text {
    min-width: 0;
    flex: 1;
  }

  .page-title {
    font-size: 1.5rem;
    margin: 0;
    line-height: 1.2;
  }

  .breadcrumb {
    font-size: 0.875rem;
    margin-top: 4px;
    line-height: 1.2;
  }

  .header-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .posted-chip {
    white-space: nowrap;
  }

  .chip-text {
    font-size: 0.875rem;
  }

  .loading-progress {
    width: 80px;
  }

  .content-wrapper {
    max-width: 1200px;
    margin: 24px auto;
    padding: 0 24px;
  }

  .job-details-card {
    border-radius: 12px;
    overflow: hidden;
  }

  /* ==================== JOB HEADER ====================*/
  .job-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .job-info {
    flex: 1;
    min-width: 0;
  }

  .job-position {
    font-size: 1.5rem;
    margin-bottom: 12px;
    word-wrap: break-word;
  }

  .job-details-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .job-detail-item {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.95rem;
  }

  /* Chips */
  .chips-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .chip-padding {
    padding-left: 12px;
    padding-right: 12px;
  }
  .level-chip {
    background: #a8d5a4;
    color: #161616;
  }
  .page-chip {
    background: #e3f0fc;
    color: #2156a4;
  }
  .item-chip {
    background: #fff6df;
    color: #ff9800;
  }
  .salary-chip {
    background: #f3eafd;
    color: #6626a6;
  }
  .chip-label {
    font-size: 1rem;
    font-weight: 400;
    font-family: 'Montserrat', 'Roboto', Arial, sans-serif;
  }
  @media (max-width: 479px) {
    .chips-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .chip-label {
      font-size: 0.8rem !important;
    }
    .job-title {
      font-size: 1.05rem;
      line-height: 1.25rem;
    }
  }

  /* ==================== SECTIONS ====================*/
  .qualifications-section {
    padding: 24px;
  }

  .section-main-title {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }

  .qualifications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .qualification-card {
    border-radius: 8px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .qualification-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .qualification-text {
    margin-top: 8px;
    font-size: 0.95rem;
    color: #444;
  }

  /* ==================== APPLICATION PROCESS ====================*/
  .application-process-section {
    padding: 32px 24px;
  }

  .process-main-title {
    font-size: 1.75rem;
  }

  .process-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }

  .process-step-wrapper {
    min-width: 0;
  }

  .process-card {
    position: relative;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    overflow: hidden;
    height: 100%;
  }

  .process-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 12px;
  }

  .info-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
  }

  .card-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
  }

  .step-number {
    font-size: 18px;
    font-weight: 600;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }

  .step-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .step-title {
    font-size: 1.1rem;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .step-description {
    color: #666;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .action-btn {
    border-radius: 8px;
    font-weight: 600;
    padding: 12px 24px;
    transition: all 0.3s;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  /* ==================== EMAIL BOX ====================*/
  .email-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3eafd;
    border: 1.5px solid #ce93d8;
    border-radius: 8px;
    padding: 10px 14px;
    gap: 4px;
    flex-wrap: wrap;
  }

  .email-address {
    font-size: 0.85rem;
    font-weight: 600;
    color: #6626a6;
    word-break: break-all;
  }

  .email-note {
    line-height: 1.5;
  }

  /* ==================== NOTICE ====================*/
  .admin-notice {
    background: #fff8e1;
    border: 1px solid #f2c94c;
    color: #8a6d3b;
  }

  /* ==================== TABLET (600px - 1023px) ====================*/
  @media (max-width: 1023px) and (min-width: 600px) {
    .page-header {
      padding: 16px 20px;
    }

    .content-wrapper {
      padding: 0 20px;
      margin: 20px auto;
    }

    .page-title {
      font-size: 1.3rem;
    }

    .breadcrumb {
      font-size: 0.8rem;
    }

    .job-position {
      font-size: 1.3rem;
    }

    .section-main-title {
      font-size: 1.3rem;
    }

    .process-main-title {
      font-size: 1.5rem;
    }

    .qualifications-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .process-steps {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .step-title {
      font-size: 1rem;
    }
  }

  /* ==================== MOBILE (<600px) ====================*/
  @media (max-width: 599px) {
    .page-header {
      padding: 12px 16px;
    }

    .header-content {
      flex-wrap: wrap;
      gap: 12px;
    }

    .header-left {
      flex: 1 1 auto;
      max-width: calc(100% - 120px);
    }

    .header-right {
      flex: 0 0 auto;
    }

    .page-title {
      font-size: 1.1rem;
    }

    .chip-text {
      font-size: 0.75rem;
    }

    .loading-progress {
      width: 60px;
    }

    .content-wrapper {
      padding: 0 16px;
      margin: 16px auto;
    }

    .job-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .job-info {
      width: 100%;
    }

    .job-position {
      font-size: 1.15rem;
    }

    .job-details-list {
      align-items: center;
    }

    .job-detail-item {
      font-size: 0.875rem;
    }

    .section-main-title {
      font-size: 1.15rem;
    }

    .qualifications-section {
      padding: 16px;
    }

    .qualifications-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .application-process-section {
      padding: 20px 16px;
    }

    .process-main-title {
      font-size: 1.25rem;
      margin-bottom: 20px !important;
    }

    .process-steps {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .card-content {
      padding: 20px;
    }

    .step-title {
      font-size: 0.95rem;
    }

    .step-description {
      font-size: 0.85rem;
    }

    .email-address {
      font-size: 0.78rem;
    }
  }

  /* ==================== EXTRA SMALL (<360px) ====================*/
  @media (max-width: 359px) {
    .page-header {
      padding: 10px 12px;
    }

    .header-left {
      max-width: calc(100% - 100px);
    }

    .page-title {
      font-size: 1rem;
    }

    .chip-text {
      font-size: 0.7rem;
    }

    .content-wrapper {
      padding: 0 12px;
    }

    .job-position {
      font-size: 1.05rem;
    }

    .section-main-title {
      font-size: 1.05rem;
    }

    .process-main-title {
      font-size: 1.15rem;
    }

    .card-content {
      padding: 16px;
    }

    .step-title {
      font-size: 0.9rem;
    }

    .step-description {
      font-size: 0.8rem;
    }

    .action-btn {
      padding: 10px 16px;
      font-size: 0.85rem;
    }

    .email-address {
      font-size: 0.72rem;
    }
  }

  /* ==================== LARGE DESKTOP (>1440px) ====================*/
  @media (min-width: 1440px) {
    .page-header {
      padding: 20px 48px;
    }

    .content-wrapper {
      max-width: 1400px;
      padding: 0 48px;
    }

    .page-title {
      font-size: 1.75rem;
    }

    .job-position {
      font-size: 1.75rem;
    }

    .section-main-title {
      font-size: 1.75rem;
    }

    .process-main-title {
      font-size: 2rem;
    }
  }
</style>
