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

        <!-- Apply/Reapply Button Section -->
        <q-card-section class="apply-section q-pa-lg">
          <!-- Already Applied with Reapply Option -->
          <div v-if="hasApplied" class="apply-content text-center">
            <q-icon name="check_circle" size="48px" color="green" class="q-mb-md" />
            <div class="apply-title text-h5 text-weight-bold q-mb-sm text-green">
              You've Already Applied!
            </div>
            <div class="apply-subtitle text-grey-7 q-mb-md">
              You have already submitted an application for this position.
              <br />
              <span class="text-caption text-grey-6">Submitted on: {{ getApplicationDate() }}</span>
              <br />
              <span class="text-caption text-grey-6">
                Status:
                <strong>{{ getApplicationStatus() }}</strong>
              </span>
            </div>

            <div class="row justify-center q-gutter-md q-mt-md">
              <q-chip color="green" text-color="white" icon="check" size="lg">
                Application Submitted
              </q-chip>
            </div>

            <div class="row justify-center q-gutter-md q-mt-lg">
              <q-btn
                label="Reapply"
                color="orange"
                size="md"
                unelevated
                rounded
                icon="refresh"
                @click="goToPDS"
                class="q-px-lg"
              />
              <q-btn
                label="View My Applications"
                color="primary"
                size="md"
                unelevated
                rounded
                icon="list_alt"
                @click="goToApplications"
                class="q-px-lg"
              />
            </div>

            <div class="text-caption text-grey-6 q-mt-md">
              <q-icon name="info" size="xs" />
              Reapplying will update your existing application with new information.
            </div>
          </div>

          <!-- Apply Now Button (Only if not applied) -->
          <div v-else class="apply-content text-center">
            <q-icon name="work" size="48px" color="primary" class="q-mb-md" />
            <div class="apply-title text-h5 text-weight-bold q-mb-sm">
              Ready to apply for this position?
            </div>
            <div class="apply-subtitle text-grey-7 q-mb-md">
              Complete your Personal Data Sheet (PDS) to submit your application.
            </div>
            <q-btn
              label="Apply Now"
              color="primary"
              size="lg"
              unelevated
              rounded
              icon="assignment"
              @click="goToPDS"
              class="apply-btn"
            />
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
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useJobPostStore } from 'stores/jobPostStore';
  import { useEmailStore } from 'stores/emailStore';
  import { usePDSStore } from 'stores/pdsFormStore';
  import { toast } from 'src/boot/toast';

  const $q = useQuasar();
  const route = useRoute();
  const router = useRouter();

  const jobPostStore = useJobPostStore();
  const emailStore = useEmailStore();
  const pdsStore = usePDSStore();

  const id = route.params.id;

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

  // ==================== USER EMAIL ====================
  const userEmail = computed(() => {
    return emailStore.getEmail || localStorage.getItem('userEmail') || '';
  });

  // ==================== JOB DATA STATE ====================
  const selectedJob = ref(null);
  const selectedCriteria = ref(null);
  const hasApplied = ref(false);
  const applicationDate = ref('');
  const applicationStatus = ref('');
  const applicationId = ref(null);
  const isLoadingApplicationStatus = ref(true);

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

  function getApplicationDate() {
    if (applicationDate.value) {
      const date = new Date(applicationDate.value);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '';
  }

  function getApplicationStatus() {
    return applicationStatus.value || 'Pending';
  }

  // ==================== NAVIGATION FUNCTIONS ====================

  function goToPDS() {
    // Store the job ID and application ID (if reapplying) in localStorage
    localStorage.setItem('selectedJobId', id);
    localStorage.setItem('selectedJobPosition', selectedJob.value?.Position || '');
    localStorage.setItem('selectedJobTitle', selectedJob.value?.Position || '');

    // If reapplying, store the application ID
    if (hasApplied.value && applicationId.value) {
      localStorage.setItem('reapplyApplicationId', applicationId.value);
      localStorage.setItem('isReapply', 'true');
    } else {
      localStorage.removeItem('reapplyApplicationId');
      localStorage.removeItem('isReapply');
    }

    router.push({
      name: 'UserPDS',
      query: {
        jobId: id,
        position: selectedJob.value?.Position || '',
        reapply: hasApplied.value ? 'true' : 'false',
        applicationId: applicationId.value || '',
      },
    });
  }

  function goToApplications() {
    router.push({ name: 'Account' });
  }

  // ==================== CHECK APPLICATION STATUS ====================

  async function checkApplicationStatus() {
    isLoadingApplicationStatus.value = true;
    try {
      const email = userEmail.value;
      if (!email) {
        isLoadingApplicationStatus.value = false;
        return;
      }

      // Fetch applications from the store
      const result = await pdsStore.fetchApplications(email);

      if (result.success && result.data) {
        const applications = result.data;

        // Find if user has applied for this specific job
        const foundApplication = applications.find((app) => {
          // Try to match by position name or job ID
          const positionMatch = app.applied_position === selectedJob.value?.Position;
          const jobIdMatch = app.job_id === parseInt(id) || app.job_id === id;
          return positionMatch || jobIdMatch;
        });

        if (foundApplication) {
          hasApplied.value = true;
          applicationDate.value = foundApplication.application_applied_date || '';
          applicationStatus.value = foundApplication.application_status || 'Pending';
          applicationId.value = foundApplication.id || foundApplication.personal_id || null;
        } else {
          hasApplied.value = false;
          applicationDate.value = '';
          applicationStatus.value = '';
          applicationId.value = null;
        }
      } else {
        hasApplied.value = false;
        applicationDate.value = '';
        applicationStatus.value = '';
        applicationId.value = null;
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      hasApplied.value = false;
      applicationDate.value = '';
      applicationStatus.value = '';
      applicationId.value = null;
    } finally {
      isLoadingApplicationStatus.value = false;
    }
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
    // Check if user is authenticated
    if (!emailStore.isAuthenticated && !emailStore.checkAuthStatus()) {
      toast.error('Please verify your email before applying');
      router.push('/');
      return;
    }

    if (!userEmail.value) {
      toast.error('Email not found. Please verify your email again.');
      emailStore.logout();
      router.push('/');
      return;
    }

    if (!id) {
      console.error('No job ID provided in route params');
      toast.error('No job ID provided');
      router.push('/job-post');
      return;
    }

    try {
      await refreshJobDetails(true);

      if (selectedJob.value && selectedJob.value.id) {
        // Store job ID for reference
        localStorage.setItem('currentJobId', selectedJob.value.id);
        localStorage.setItem('currentJobPosition', selectedJob.value.Position || '');

        // Check if user has already applied for this position
        await checkApplicationStatus();
      } else {
        throw new Error('Job ID is missing');
      }
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
  .position-section {
    padding: 20px 24px;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .section-content {
    font-size: 0.95rem;
    color: #666;
  }

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

  /* ==================== APPLY SECTION ====================*/
  .apply-section {
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
    border-radius: 0 0 12px 12px;
  }

  .apply-content {
    padding: 16px 0;
  }

  .apply-title {
    color: #1a237e;
  }

  .apply-title.text-green {
    color: #2e7d32;
  }

  .apply-subtitle {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .apply-btn {
    padding: 12px 48px;
    font-weight: 600;
    transition: transform 0.3s ease;
  }

  .apply-btn:hover {
    transform: translateY(-2px);
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

    .qualifications-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .apply-title {
      font-size: 1.3rem;
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

    .section-title {
      font-size: 1.1rem;
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

    .apply-section {
      padding: 20px 16px !important;
    }

    .apply-title {
      font-size: 1.1rem;
    }

    .apply-subtitle {
      font-size: 0.9rem;
    }

    .apply-btn {
      width: 100%;
      padding: 12px 24px;
      font-size: 1rem;
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

    .apply-title {
      font-size: 1rem;
    }

    .apply-btn {
      font-size: 0.9rem;
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
  }
</style>
