<template>
  <q-page>
    <!-- User has permission to view dashboard -->
    <div v-if="authStore.user && hasViewDashboardAccess" class="column no-gap">
      <!-- Welcome Message -->
      <div class="text-h5 text-weight-bolder text-primary q-ma-md">DASHBOARD</div>

      <!-- INTERNAL/EXTERNAL BADGES and Publication Info in a row -->
      <div class="row items-center justify-between q-mx-lg q-mb-sm">
        <!-- Badges on the left -->
        <div class="row items-center q-gutter-sm">
          <q-badge
            outline
            color="green"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.85rem; font-weight: 800"
          >
            <q-icon name="people" size="xs" class="q-mr-xs" />
            Total Applicant: {{ Number(dashboardStore.total_applicant).toLocaleString() }}
          </q-badge>
          <q-badge
            outline
            color="green"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.85rem; font-weight: 800"
          >
            <q-icon name="people" size="xs" class="q-mr-xs" />
            Internal: {{ Number(dashboardStore.internal_applicant).toLocaleString() }}
          </q-badge>
          <q-badge
            outline
            color="primary"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.85rem; font-weight: 800"
          >
            <q-icon name="people" size="xs" class="q-mr-xs" />
            External: {{ Number(dashboardStore.external_applicant).toLocaleString() }}
          </q-badge>
        </div>

        <!-- Publication badges on the right -->
        <div class="row items-center q-gutter-sm">
          <q-badge
            outline
            color="deep-purple"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 1rem; font-weight: 700"
          >
            Publication Date: {{ dashboardStore.publication_date }}
          </q-badge>
          <q-badge
            outline
            color="deep-purple"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 1rem; font-weight: 700"
          >
            Published Position: {{ dashboardStore.published_position }}
          </q-badge>
        </div>
      </div>

      <!-- Cards row with top alignment -->
      <div class="row q-col-gutter-sm q-mx-lg items-start">
        <!-- Positions Card -->
        <div class="col-4">
          <q-card class="stat-card ct-light-blue bg-white">
            <q-card-section class="card-content">
              <div class="card-title q-mb-xs">Total positions</div>
              <div class="metric-value text-blue-4">
                {{ Number(dashboardStore.total_positions).toLocaleString() }}
              </div>
              <q-separator class="q-my-sm" />
              <div class="row q-col-gutter-md items-stretch q-pa-xs">
                <!-- Funded -->
                <div class="col-6">
                  <div class="row items-center q-mb-xs">
                    <div class="text-subtitle1 text-bold text-grey-8">
                      Funded Position:
                      <span class="text-blue-6 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.funded).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                  <div class="row items-center justify-between">
                    <span class="text-subtitle2">
                      Filled Up:
                      <span class="text-teal-6 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.filled).toLocaleString() }}
                      </span>
                    </span>
                    <span class="text-subtitle2">
                      Vacant:
                      <span class="text-deep-purple-4 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.vacant).toLocaleString() }}
                      </span>
                    </span>
                  </div>
                  <q-linear-progress
                    size="6px"
                    rounded
                    :value="
                      dashboardStore.funded
                        ? (dashboardStore.filled || 0) / dashboardStore.funded
                        : 0
                    "
                    color="teal-3"
                    track-color="purple-9"
                    class="q-mt-xs"
                  />
                </div>
                <!-- Vertical Divider -->
                <div class="col-auto flex flex-center">
                  <q-separator vertical />
                </div>
                <!-- Unfunded -->
                <div class="col">
                  <div class="row items-center">
                    <div class="text-subtitle1 text-bold text-grey-8">
                      Unfunded Position:
                      <span class="text-amber-6 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.unfunded).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Status Cards (inlined from StatusOverview) -->
        <div class="col-8">
          <div class="row q-col-gutter-sm">
            <!-- Total Applications -->
            <div class="col-12 col-md-4">
              <q-card class="stat-card ct-green bg-white">
                <q-card-section class="card-content">
                  <div class="card-title q-mb-xs">Total applications</div>
                  <div class="metric-value text-green-9">
                    {{ dashboardStore.total_applicant }}
                  </div>
                  <q-separator class="q-my-sm" />
                  <div class="row">
                    <div class="col-6 pair-left">
                      <div class="metric-label">Internal</div>
                      <div class="pair-value text-green-9">
                        {{ dashboardStore.internal_applicantion }}
                      </div>
                    </div>
                    <div class="col-6 pair-right">
                      <div class="metric-label">External</div>
                      <div class="pair-value text-red-9">
                        {{ dashboardStore.external_application }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Pre-Assessment -->
            <div class="col-12 col-md-4">
              <q-card class="stat-card ct-blue bg-white">
                <q-card-section class="card-content">
                  <div class="card-title q-mb-xs">Pre-assessment</div>
                  <div class="metric-value text-blue-9">
                    {{ dashboardStore.qualified + dashboardStore.unqualified }}
                  </div>
                  <q-separator class="q-my-sm" />
                  <div class="row">
                    <div class="col-6 pair-left">
                      <div class="metric-label">Qualified</div>
                      <div class="pair-value text-green-9">{{ dashboardStore.qualified }}</div>
                    </div>
                    <div class="col-6 pair-right">
                      <div class="metric-label">For QS verification</div>
                      <div class="pair-value text-red-9">{{ dashboardStore.unqualified }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- For Assessment -->
            <div class="col-12 col-md-4">
              <q-card class="stat-card ct-amber bg-white">
                <q-card-section class="card-content">
                  <div class="card-title q-mb-xs">For assessment</div>
                  <div class="metric-value text-orange-9">
                    {{ dashboardStore.for_assessment }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobpost / Office Overview Tabs -->
      <div class="row justify-start items-start q-mt-sm q-mb-xs q-mx-lg">
        <div class="column">
          <q-tabs v-model="activeOverviewTab" dense class="text-primary">
            <q-tab name="office" icon-right="apartment" label="Office Overview" />
            <q-tab name="jobs" icon-right="work_history" label="Jobs Overview" />
          </q-tabs>
        </div>
      </div>

      <q-tab-panels v-model="activeOverviewTab" animated>
        <!-- Office Overview -->
        <q-tab-panel name="office">
          <div class="row justify-start items-start q-ml-md">
            <q-chip dense class="q-my-xs row justify-start q-pl-md q-pr-md q-mb-md">
              Total Office:
              <q-badge dense rounded color="green" class="text-bold q-ml-xs">
                {{ officeRows.length }}
              </q-badge>
            </q-chip>
          </div>
          <div class="row justify-between">
            <q-card class="q-mx-auto" style="width: 98%">
              <q-table
                class="applicants-table"
                :rows="officeRows"
                :columns="officeColumns"
                row-key="Office"
                :loading="dashboardStore.loading"
                :pagination="{ rowsPerPage: 5 }"
                dense
              />
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Jobs Overview -->
        <q-tab-panel name="jobs">
          <div class="row justify-start items-start q-ml-md">
            <q-chip dense class="q-my-xs row justify-start q-pl-md q-pr-md q-mb-md">
              Total Active Job Posts:
              <q-badge dense rounded color="green" class="text-bold q-ml-xs">
                {{ jobs.length }}
              </q-badge>
            </q-chip>
          </div>
          <div class="row justify-between">
            <q-card class="q-mx-auto" style="width: 98%">
              <q-table
                class="applicants-table"
                :rows="jobs"
                :columns="columns"
                row-key="job"
                :loading="useJobPost.loading"
                :pagination="{ rowsPerPage: 5 }"
                dense
                wrap-cells
              >
                <template v-slot:body-cell-office="props">
                  <q-td :props="props">
                    <div class="text-body2" style="white-space: normal; width: 300px">
                      {{ props.row.Office }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-jobs="props">
                  <q-td :props="props">
                    <div class="text-body2" style="white-space: normal; width: 300px">
                      {{ props.row.Position }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-qualified_count="props">
                  <q-td :props="props">
                    {{ props.row.qualified_count || 0 }}
                  </q-td>
                </template>

                <template v-slot:body-cell-unqualified_count="props">
                  <q-td :props="props">
                    {{ props.row.unqualified_count || 0 }}
                  </q-td>
                </template>

                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-badge
                      :color="getStatusColor(props.row.status)"
                      class="status-badge q-px-md q-py-xs"
                    >
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>
                </template>

                <template v-slot:body-cell-action="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      round
                      dense
                      color="blue"
                      icon="visibility"
                      @click="viewJob(props.row)"
                    >
                      <q-tooltip>View Job Details</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- No Permission -->
    <div v-else-if="authStore.user && !hasViewDashboardAccess" class="welcome-container">
      <q-img src="tagum-city-hall.webp" class="welcome-bg" style="opacity: 0.8">
        <div class="absolute-full flex flex-center">
          <q-card
            class="welcome-card text-center q-pa-md"
            style="
              background: rgba(255, 255, 255, 0.95);
              border-radius: 12px;
              max-width: 450px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            "
          >
            <q-avatar
              size="80px"
              color="primary"
              text-color="white"
              icon="person"
              class="q-mb-sm"
            />
            <div v-if="authStore.user">
              <div class="text-h5 text-black text-weight-bold q-mb-xs">
                Welcome,
                <span class="text-primary">{{ authStore.user.name }}</span>
                !
              </div>
              <div class="text-subtitle1 text-grey-8 q-mb-sm">
                to Recruitment, Selection & Placement Portal
              </div>
              <q-separator class="q-my-sm" />
              <div class="text-body2 text-grey-7">
                You do not have permission to view the dashboard. Please contact your administrator
                for access. Use the sidebar menu to navigate to available modules.
              </div>
            </div>
            <div v-else>
              <q-skeleton type="text" class="q-mb-xs" style="height: 30px; width: 80%" />
              <q-skeleton type="text" class="q-mb-sm" style="height: 20px; width: 60%" />
              <q-skeleton type="rect" style="height: 36px; width: 100px" />
            </div>
          </q-card>
        </div>
      </q-img>
    </div>

    <!-- Loading -->
    <div v-else class="welcome-container">
      <div class="absolute-full flex flex-center">
        <q-card
          class="welcome-card text-center q-pa-md"
          style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            max-width: 450px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          "
        >
          <q-spinner size="60px" color="primary" class="q-mb-md" />
          <div class="text-h6 text-weight-bold q-mb-xs">Loading</div>
          <div class="text-body2 text-grey-8">Please wait while we load your dashboard...</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
  import { onMounted, computed, ref, watch } from 'vue';
  import { useAuthStore } from 'src/stores/authStore';
  import { useRouter, useRoute } from 'vue-router';
  import { DashboardStore } from 'src/stores/dashboardStore';
  import { useJobPostStore } from 'src/stores/jobPostStore';

  const router = useRouter();
  const route = useRoute();

  const useJobPost = useJobPostStore();
  const dashboardStore = DashboardStore();
  const authStore = useAuthStore();

  const activeOverviewTab = ref('office');

  const hasViewDashboardAccess = computed(
    () => authStore.user?.permissions?.viewDashboardstat === '1',
  );

  const jobs = computed(() =>
    useJobPost.jobPosts.filter((job) => job.status?.toLowerCase() !== 'republished'),
  );

  const officeRows = computed(() => dashboardStore.summaryByOffice || []);

  // Office columns with Pre-assessment header
  const officeColumns = [
    { name: 'Office', label: 'Office', align: 'left', field: 'Office', sortable: true },
    {
      name: 'Total_applicant',
      label: 'No. of Application',
      align: 'center',
      field: 'Total_applicant',
      sortable: true,
    },
    {
      name: 'Qualified',
      label: 'Qualified',
      align: 'center',
      field: 'Qualified',
      sortable: true,
    },
    {
      name: 'Unqualified',
      label: 'For QS Verification',
      align: 'center',
      field: 'Unqualified',
      sortable: true,
    },
    {
      name: 'Pending',
      label: 'For Assessment',
      align: 'center',
      field: 'Pending',
      sortable: true,
    },
  ];

  // Jobs columns with all visible columns
  const columns = [
    { name: 'office', label: 'Office', align: 'left', field: 'Office', sortable: true },
    { name: 'jobs', label: 'Position', align: 'left', field: 'Position', sortable: true },
    {
      name: 'total_applicants',
      label: 'No. of Application',
      align: 'center',
      field: 'total_applicants',
      sortable: true,
    },
    {
      name: 'qualified_count',
      label: 'Qualified',
      align: 'center',
      field: 'qualified_count',
      sortable: true,
    },
    {
      name: 'unqualified_count',
      label: 'For QS Verification',
      align: 'center',
      field: 'unqualified_count',
      sortable: true,
    },
    {
      name: 'pending_count',
      label: 'For Assessment',
      align: 'center',
      field: 'pending_count',
      sortable: true,
    },
    { name: 'status', label: 'Status', align: 'center', field: 'status', sortable: true },
    { name: 'action', label: 'Action', align: 'center', field: 'action', sortable: false },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'not started':
        return 'grey';
      case 'pending':
        return 'orange';
      case 'assessed':
        return 'blue';
      case 'rated':
        return 'purple';
      case 'occupied':
      case 'qualified':
        return 'green';
      case 'unqualified':
      case 'unoccupied':
        return 'red-9';
      case 'republished':
        return 'yellow-8';
      default:
        return 'grey';
    }
  };

  const viewJob = (row) => router.push({ name: 'JobPost View', params: { id: row.id } });

  const checkUnauthorizedAccess = () => {
    if (route.query.unauthorized === 'true') router.replace({ query: {} });
  };

  watch(hasViewDashboardAccess, (hasAccess) => {
    if (authStore.isAuthenticated && !hasAccess) {
      console.log('User does not have dashboard view permission');
    }
  });

  onMounted(async () => {
    checkUnauthorizedAccess();
    if (hasViewDashboardAccess.value) {
      await dashboardStore.status();
      await dashboardStore.fetchSummaryByOffice();
      await useJobPost.job_post();
    }
  });
</script>

<style scoped>
  .stat-card {
    border-radius: 10px;
    border-top: 3px solid transparent;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .ct-light-blue {
    border-top-color: #7fbcf2;
  }
  .ct-green {
    border-top-color: #1b5e20;
  }
  .ct-blue {
    border-top-color: #0d47a1;
  }
  .ct-amber {
    border-top-color: #e65100;
  }
  .ct-teal {
    border-top-color: #00695c;
  }
  .ct-purple {
    border-top-color: #4527a0;
  }

  .card-content {
    padding: 14px 16px;
  }

  .card-title {
    font-size: 13px;
    font-weight: 700;
    color: #757575;
  }
  .metric-value {
    font-size: 26px;
    font-weight: 500;
    line-height: 1;
  }
  .metric-label {
    font-size: 12px;
    color: #757575;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .pair-value {
    font-size: 18px;
    font-weight: 500;
  }
  .sub-value {
    font-size: 15px;
    font-weight: 500;
  }

  .pair-left {
    border-right: 1px solid #eeeeee;
    padding-right: 12px;
  }
  .pair-right {
    padding-left: 12px;
  }

  .badge-simple {
    border-radius: 20px;
  }

  .applicants-table {
    width: 100%;
  }

  .cell-wrap {
    white-space: normal;
    max-width: 300px;
  }

  .status-badge {
    font-size: 0.95rem;
    padding: 4px 10px;
    border-radius: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .welcome-container {
    position: relative;
    height: 80vh;
    overflow: hidden;
  }
  .welcome-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .welcome-card {
    transition: transform 0.2s ease;
  }
  .welcome-card:hover {
    transform: scale(1.01);
  }
</style>
