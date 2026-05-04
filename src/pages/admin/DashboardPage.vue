<template>
  <q-page>
    <!-- User has permission to view dashboard -->
    <div v-if="authStore.user && hasViewDashboardAccess" class="column no-gap">
      <!-- Welcome Message -->
      <div class="text-h5 text-weight-bolder text-primary q-ma-md">DASHBOARD</div>

      <!-- INTERNAL/EXTERNAL BADGES - Simplified -->
      <div class="row q-col-gutter-sm q-mx-lg q-mb-md">
        <div class="col-12">
          <div class="row justify-start items-center q-gutter-sm">
            <q-badge
              outline
              color="blue"
              class="badge-simple"
              style="padding: 6px 12px; font-size: 0.85rem; font-weight: 800"
            >
              <q-icon name="people" size="xs" class="q-mr-xs" />
              Internal: {{ Number(dashboardStore.fundedData?.internal).toLocaleString() }}
            </q-badge>

            <q-badge
              outline
              color="primary"
              class="badge-simple"
              style="padding: 6px 12px; font-size: 0.85rem; font-weight: 800"
            >
              <q-icon name="people" size="xs" class="q-mr-xs" />
              External: {{ Number(dashboardStore.fundedData?.external).toLocaleString() }}
            </q-badge>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-sm q-mx-lg items-center">
        <div class="col-4">
          <q-card class="bg-white">
            <q-card-section class="q-pa-md">
              <!-- TOTAL -->
              <div class="row items-center q-mb-xs">
                <q-icon name="assessment" color="primary" size="md" class="q-mr-sm" />
                <div class="text-body3 text-bold">
                  Total Positions:
                  <span class="text-primary text-weight-bold q-ml-xs">
                    {{ Number(dashboardStore.fundedData?.total_positions).toLocaleString() }}
                  </span>
                </div>
              </div>
              <q-separator />

              <!-- TWO COLUMNS UNDER TOTAL -->
              <div class="row q-col-gutter-md items-stretch q-pa-xs">
                <!-- LEFT: FUNDED -->
                <div class="col-6">
                  <div class="row items-center q-mb-xs">
                    <q-icon name="account_balance" color="blue-6" size="xs" class="q-mr-sm" />
                    <div class="text-subtitle1 text-bold">
                      Funded:
                      <span class="text-blue-6 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.fundedData?.funded).toLocaleString() }}
                      </span>
                    </div>
                  </div>

                  <div class="row items-center justify-between">
                    <span class="text-subtitle2">
                      Occupied:
                      <span class="text-teal-6 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.fundedData?.occupied).toLocaleString() }}
                      </span>
                    </span>

                    <span class="text-subtitle2">
                      Vacant:
                      <span class="text-deep-purple-4 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.fundedData?.unoccupied).toLocaleString() }}
                      </span>
                    </span>
                  </div>

                  <!-- PROGRESS (Occupied vs Vacant via track) -->
                  <q-linear-progress
                    size="6px"
                    rounded
                    :value="
                      dashboardStore.fundedData?.funded
                        ? (dashboardStore.fundedData?.occupied || 0) /
                          dashboardStore.fundedData?.funded
                        : 0
                    "
                    color="teal-3"
                    track-color="purple-9"
                    class="q-mt-xs"
                  />
                </div>

                <!-- VERTICAL DIVIDER -->
                <div class="col-auto flex flex-center">
                  <q-separator vertical />
                </div>

                <!-- RIGHT: UNFUNDED -->
                <div class="col">
                  <div class="row items-center">
                    <q-icon name="money_off" color="amber-6" size="xs" class="q-mr-sm" />
                    <div class="text-subtitle1 text-bold">
                      Unfunded:
                      <span class="text-amber-6 text-weight-bold q-ml-xs">
                        {{ Number(dashboardStore.fundedData?.unfunded).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-8 flex flex-center"><StatusOverview class="full-width" /></div>
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
        <!-- Office Overview (Default) -->
        <q-tab-panel name="office">
          <div class="row justify-start items-start q-ml-md">
            <q-chip dense class="q-my-xs row justify-start">
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
            <q-chip dense class="q-my-xs row justify-start">
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

    <!-- User is authenticated but doesn't have dashboard permission -->
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

    <!-- Loading Screen -->
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

  import StatusOverview from 'src/components/Dashboard/StatusOverview.vue';
  import { DashboardStore } from 'src/stores/dashboardStore';
  import { useJobPostStore } from 'src/stores/jobPostStore';

  const router = useRouter();
  const route = useRoute();

  const useJobPost = useJobPostStore();
  const dashboardStore = DashboardStore();
  const authStore = useAuthStore();

  const activeOverviewTab = ref('office');

  // Check if user has dashboard view permission
  const hasViewDashboardAccess = computed(() => {
    return authStore.user?.permissions?.viewDashboardstat === '1';
  });

  const jobs = computed(() => {
    return useJobPost.jobPosts.filter((job) => {
      return job.status && job.status.toLowerCase() !== 'republished';
    });
  });

  const officeRows = computed(() => dashboardStore.summaryByOffice || []);

  const officeColumns = [
    { name: 'Office', label: 'Office', align: 'left', field: 'Office', sortable: true },
    {
      name: 'Total_applicant',
      label: 'No. of Applicants',
      align: 'center',
      field: 'Total_applicant',
      sortable: true,
    },
    { name: 'Pending', label: 'Pending', align: 'center', field: 'Pending', sortable: true },
    { name: 'Qualified', label: 'Qualified', align: 'center', field: 'Qualified', sortable: true },
    {
      name: 'Unqualified',
      label: 'Unqualified',
      align: 'center',
      field: 'Unqualified',
      sortable: true,
    },
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
        return 'green';
      case 'qualified':
        return 'green';
      case 'unqualified':
        return 'red';
      case 'unoccupied':
        return 'red-9';
      case 'republished':
        return 'yellow-8';
      default:
        return 'grey';
    }
  };

  const columns = [
    { name: 'office', label: 'Office', align: 'left', field: 'Office', sortable: true },
    { name: 'jobs', label: 'Position', align: 'left', field: 'Position', sortable: true },
    {
      name: 'total_applicants',
      label: 'No. of Applicants',
      align: 'center',
      field: 'total_applicants',
      sortable: true,
    },
    {
      name: 'pending_count',
      label: 'Pending',
      align: 'center',
      field: 'pending_count',
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
      label: 'Unqualified',
      align: 'center',
      field: 'unqualified_count',
      sortable: true,
    },
    {
      name: 'action',
      label: 'Action',
      align: 'center',
      field: 'action',
      sortable: false,
    },
  ];

  const viewJob = (row) => {
    router.push({
      name: 'JobPost View',
      params: { id: row.id },
    });
  };

  // Check for unauthorized parameter from route guard
  const checkUnauthorizedAccess = () => {
    if (route.query.unauthorized === 'true') {
      // Remove the query parameter without reloading
      router.replace({ query: {} });
    }
  };

  // Watch for permission changes and redirect if needed
  watch(hasViewDashboardAccess, (hasAccess) => {
    if (authStore.isAuthenticated && !hasAccess) {
      // User is authenticated but doesn't have dashboard permission
      // This is fine - show the welcome message instead
      console.log('User does not have dashboard view permission');
    }
  });

  onMounted(async () => {
    // Check for unauthorized access notification
    checkUnauthorizedAccess();

    // Only load dashboard data if user has permission
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
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
  }

  .date-filter {
    max-width: 160px;
  }

  .table-container {
    flex: 1;
    min-width: 80%;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .job-card-container {
    width: 24%;
    margin-left: 4px;
  }

  .applicants-table {
    width: 100%;
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

  .access-denied-card {
    transition: transform 0.2s ease;
  }

  /* Status badges */
  .status-badge {
    font-size: 0.95rem !important;
    padding: 4px 10px !important;
    border-radius: 16px !important;
    font-weight: 500 !important;
    letter-spacing: 0.5px;
  }

  .badge-simple {
    border-radius: 20px;
  }
</style>
