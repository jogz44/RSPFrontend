<template>
  <q-page>
    <!-- User has permission to view dashboard -->
    <div v-if="authStore.user && hasViewDashboardAccess" class="column no-gap">
      <!-- Welcome Message -->
      <div class="text-h5 text-weight-bolder text-primary q-ma-md">DASHBOARD</div>

      <!-- BADGES ROW: stacks vertically on mobile -->
      <div class="badges-row q-mx-md q-mb-sm">
        <div class="badges-group">
          <q-badge
            outline
            color="green"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.8rem; font-weight: 800"
          >
            <q-icon name="people" size="xs" class="q-mr-xs" />
            Total Applicant: {{ Number(dashboardStore.total_applicant).toLocaleString() }}
          </q-badge>
          <q-badge
            outline
            color="green"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.8rem; font-weight: 800"
          >
            <q-icon name="people" size="xs" class="q-mr-xs" />
            Internal: {{ Number(dashboardStore.internal_applicant).toLocaleString() }}
          </q-badge>
          <q-badge
            outline
            color="primary"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.8rem; font-weight: 800"
          >
            <q-icon name="people" size="xs" class="q-mr-xs" />
            External: {{ Number(dashboardStore.external_applicant).toLocaleString() }}
          </q-badge>
        </div>
        <div class="badges-group">
          <q-badge
            outline
            color="deep-purple"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.8rem; font-weight: 700"
          >
            Publication Date: {{ dashboardStore.publication_date }}
          </q-badge>
          <q-badge
            outline
            color="deep-purple"
            class="badge-simple"
            style="padding: 6px 12px; font-size: 0.8rem; font-weight: 700"
          >
            Published Position: {{ dashboardStore.published_position }}
          </q-badge>
        </div>
      </div>

      <!-- STAT CARDS: responsive grid -->
      <div class="stat-grid q-mx-md q-mb-sm">
        <!-- Positions Card -->
        <q-card class="stat-card ct-light-blue bg-white">
          <q-card-section class="card-content">
            <div class="card-title q-mb-xs">Total Positions</div>
            <div class="metric-value text-blue-4">
              {{ Number(dashboardStore.total_positions).toLocaleString() }}
            </div>
            <q-separator class="q-my-sm" />
            <div class="row q-col-gutter-sm items-stretch">
              <div class="col-6">
                <div class="text-subtitle2 text-bold text-grey-8 q-mb-xs">
                  Funded:
                  <span class="text-blue-6 text-weight-bold q-ml-xs">
                    {{ Number(dashboardStore.funded).toLocaleString() }}
                  </span>
                </div>
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption">
                    Filled Up:
                    <span class="text-teal-6 text-weight-bold">
                      {{ Number(dashboardStore.filled).toLocaleString() }}
                    </span>
                  </span>
                  <span class="text-caption">
                    Vacant:
                    <span class="text-deep-purple-4 text-weight-bold">
                      {{ Number(dashboardStore.vacant).toLocaleString() }}
                    </span>
                  </span>
                </div>
                <q-linear-progress
                  size="6px"
                  rounded
                  :value="
                    dashboardStore.funded ? (dashboardStore.filled || 0) / dashboardStore.funded : 0
                  "
                  color="teal-3"
                  track-color="purple-9"
                />
              </div>
              <div class="col-auto flex flex-center">
                <q-separator vertical />
              </div>
              <div class="col">
                <div class="text-subtitle2 text-bold text-grey-8">
                  Unfunded:
                  <span class="text-amber-6 text-weight-bold q-ml-xs">
                    {{ Number(dashboardStore.unfunded).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Total Applications -->
        <q-card class="stat-card ct-green bg-white">
          <q-card-section class="card-content">
            <div class="card-title q-mb-xs">Total Applications</div>
            <div class="metric-value text-green-9">{{ dashboardStore.total_application }}</div>
            <q-separator class="q-my-sm" />
            <div class="row">
              <div class="col-6 pair-left">
                <div class="metric-label">Internal</div>
                <div class="pair-value text-green-9">{{ dashboardStore.internal_application }}</div>
              </div>
              <div class="col-6 pair-right">
                <div class="metric-label">External</div>
                <div class="pair-value text-red-9">{{ dashboardStore.external_application }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Pre-Assessment -->
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
                <div class="metric-label">For QS Verification</div>
                <div class="pair-value text-red-9">{{ dashboardStore.unqualified }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- For Assessment -->
        <q-card class="stat-card ct-amber bg-white">
          <q-card-section class="card-content">
            <div class="card-title q-mb-xs">For Assessment</div>
            <div class="metric-value text-orange-9">{{ dashboardStore.for_assessment }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- TABS -->
      <div class="row justify-start items-start q-mt-sm q-mb-xs q-mx-md">
        <q-tabs v-model="activeOverviewTab" dense class="text-primary">
          <q-tab name="office" icon-right="apartment" label="Office Overview" />
          <q-tab name="jobs" icon-right="work_history" label="Jobs Overview" />
        </q-tabs>
      </div>

      <q-tab-panels v-model="activeOverviewTab" animated>
        <!-- ── Office Overview ── -->
        <q-tab-panel name="office" class="q-pa-sm">
          <div class="row justify-start items-start q-mb-md">
            <q-chip dense class="q-pl-md q-pr-md">
              Total Office:
              <q-badge dense rounded color="green" class="text-bold q-ml-xs">
                {{ officeRows.length }}
              </q-badge>
            </q-chip>
          </div>

          <!-- Desktop / Tablet table -->
          <div class="gt-xs">
            <q-card style="width: 100%">
              <q-table
                class="applicants-table"
                :rows="officeRows"
                :columns="officeColumns"
                row-key="Office"
                :loading="dashboardStore.loading"
                :pagination="{ rowsPerPage: 5 }"
                dense
              >
                <template v-slot:header>
                  <q-tr>
                    <q-th rowspan="2" style="text-align: left; vertical-align: middle">Office</q-th>
                    <q-th rowspan="2" style="text-align: center; vertical-align: middle">
                      No. of Application
                    </q-th>
                    <q-th
                      colspan="2"
                      style="
                        text-align: center;
                        border-bottom: 2px solid rgba(0, 0, 0, 0.15);
                        font-weight: 700;
                        color: #1565c0;
                      "
                    >
                      Pre-assessment
                    </q-th>
                    <q-th rowspan="2" style="text-align: center; vertical-align: middle">
                      For Assessment
                    </q-th>
                  </q-tr>
                  <q-tr>
                    <q-th style="text-align: center">Qualified</q-th>
                    <q-th
                      style="
                        text-align: center;
                        border-right: 1px solid rgba(0, 0, 0, 0.18) !important;
                      "
                    >
                      For QS Verification
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="Office" :props="props" style="text-align: left">
                      {{ props.row.Office }}
                    </q-td>
                    <q-td key="Total_applicant" :props="props" style="text-align: center">
                      {{ props.row.Total_applicant }}
                    </q-td>
                    <q-td key="Qualified" :props="props" style="text-align: center">
                      {{ props.row.Qualified }}
                    </q-td>
                    <q-td
                      key="Unqualified"
                      :props="props"
                      style="
                        text-align: center;
                        border-right: 1px solid rgba(0, 0, 0, 0.18) !important;
                      "
                    >
                      {{ props.row.Unqualified }}
                    </q-td>
                    <q-td key="Pending" :props="props" style="text-align: center">
                      {{ props.row.Pending }}
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card>
          </div>

          <!-- Mobile card list -->
          <div class="lt-sm">
            <div v-if="dashboardStore.loading" class="flex flex-center q-pa-lg">
              <q-spinner color="primary" size="40px" />
            </div>
            <template v-else>
              <q-card
                v-for="row in officeRows"
                :key="row.Office"
                class="mobile-row-card q-mb-sm"
                flat
                bordered
              >
                <q-card-section class="q-pa-sm">
                  <div class="text-subtitle2 text-weight-bold text-primary q-mb-sm">
                    {{ row.Office }}
                  </div>
                  <div class="row q-col-gutter-xs q-mb-xs">
                    <div class="col-6">
                      <div class="mobile-stat-label">No. of Application</div>
                      <div class="mobile-stat-value">{{ row.Total_applicant }}</div>
                    </div>
                    <div class="col-6">
                      <div class="mobile-stat-label">For Assessment</div>
                      <div class="mobile-stat-value">{{ row.Pending }}</div>
                    </div>
                  </div>
                  <q-separator class="q-my-xs" />
                  <div class="text-caption text-weight-bold text-blue-8 q-mb-xs">
                    Pre-assessment
                  </div>
                  <div class="row q-col-gutter-xs">
                    <div class="col-6">
                      <div class="mobile-stat-label">Qualified</div>
                      <div class="mobile-stat-value text-green-8">{{ row.Qualified }}</div>
                    </div>
                    <div class="col-6">
                      <div class="mobile-stat-label">For QS Verification</div>
                      <div class="mobile-stat-value text-red-8">{{ row.Unqualified }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </template>
          </div>
        </q-tab-panel>

        <!-- ── Jobs Overview ── -->
        <q-tab-panel name="jobs" class="q-pa-sm">
          <div class="row justify-start items-start q-mb-md">
            <q-chip dense class="q-pl-md q-pr-md">
              Total Active Job Posts:
              <q-badge dense rounded color="green" class="text-bold q-ml-xs">
                {{ jobs.length }}
              </q-badge>
            </q-chip>
          </div>

          <!-- Desktop / Tablet table -->
          <div class="gt-xs">
            <q-card style="width: 100%">
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
                <template v-slot:header>
                  <q-tr>
                    <q-th rowspan="2" style="text-align: left; vertical-align: middle">Office</q-th>
                    <q-th rowspan="2" style="text-align: left; vertical-align: middle">
                      Position
                    </q-th>
                    <q-th rowspan="2" style="text-align: center; vertical-align: middle">
                      No. of Application
                    </q-th>
                    <q-th
                      colspan="2"
                      style="
                        text-align: center;
                        border-bottom: 2px solid rgba(0, 0, 0, 0.15);
                        font-weight: 700;
                        color: #1565c0;
                      "
                    >
                      Pre-assessment
                    </q-th>
                    <q-th rowspan="2" style="text-align: center; vertical-align: middle">
                      For Assessment
                    </q-th>
                    <q-th rowspan="2" style="text-align: center; vertical-align: middle">
                      Status
                    </q-th>
                    <q-th rowspan="2" style="text-align: center; vertical-align: middle">
                      Action
                    </q-th>
                  </q-tr>
                  <q-tr>
                    <q-th style="text-align: center">Qualified</q-th>
                    <q-th
                      style="
                        text-align: center;
                        border-right: 1px solid rgba(0, 0, 0, 0.18) !important;
                      "
                    >
                      For QS Verification
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="office" :props="props">
                      <div style="white-space: normal; min-width: 100px; max-width: 180px">
                        {{ props.row.Office }}
                      </div>
                    </q-td>
                    <q-td key="jobs" :props="props">
                      <div style="white-space: normal; min-width: 100px; max-width: 180px">
                        {{ props.row.Position }}
                      </div>
                    </q-td>
                    <q-td key="total_applicants" :props="props" style="text-align: center">
                      {{ props.row.total_applicants }}
                    </q-td>
                    <q-td key="qualified_count" :props="props" style="text-align: center">
                      {{ props.row.qualified_count || 0 }}
                    </q-td>
                    <q-td
                      key="unqualified_count"
                      :props="props"
                      style="
                        text-align: center;
                        border-right: 1px solid rgba(0, 0, 0, 0.18) !important;
                      "
                    >
                      {{ props.row.unqualified_count || 0 }}
                    </q-td>
                    <q-td key="pending_count" :props="props" style="text-align: center">
                      {{ props.row.pending_count || 0 }}
                    </q-td>
                    <q-td key="status" :props="props" style="text-align: center">
                      <q-badge
                        :color="getStatusColor(props.row.status)"
                        class="status-badge q-px-md q-py-xs"
                      >
                        {{ props.row.status }}
                      </q-badge>
                    </q-td>
                    <q-td key="action" :props="props" style="text-align: center">
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
                  </q-tr>
                </template>
              </q-table>
            </q-card>
          </div>

          <!-- Mobile card list -->
          <div class="lt-sm">
            <div v-if="useJobPost.loading" class="flex flex-center q-pa-lg">
              <q-spinner color="primary" size="40px" />
            </div>
            <template v-else>
              <q-card
                v-for="job in jobs"
                :key="job.id"
                class="mobile-row-card q-mb-sm"
                flat
                bordered
              >
                <q-card-section class="q-pa-sm">
                  <div class="row items-start justify-between q-mb-xs">
                    <div class="col">
                      <div class="text-subtitle2 text-weight-bold text-primary">
                        {{ job.Position }}
                      </div>
                      <div class="text-caption text-grey-7">{{ job.Office }}</div>
                    </div>
                    <div class="col-auto">
                      <q-badge
                        :color="getStatusColor(job.status)"
                        class="status-badge q-px-sm q-py-xs"
                      >
                        {{ job.status }}
                      </q-badge>
                    </div>
                  </div>
                  <q-separator class="q-my-xs" />
                  <div class="row q-col-gutter-xs q-mb-xs">
                    <div class="col-6">
                      <div class="mobile-stat-label">No. of Application</div>
                      <div class="mobile-stat-value">{{ job.total_applicants }}</div>
                    </div>
                    <div class="col-6">
                      <div class="mobile-stat-label">For Assessment</div>
                      <div class="mobile-stat-value">{{ job.pending_count || 0 }}</div>
                    </div>
                  </div>
                  <div class="text-caption text-weight-bold text-blue-8 q-mb-xs">
                    Pre-assessment
                  </div>
                  <div class="row q-col-gutter-xs q-mb-sm">
                    <div class="col-6">
                      <div class="mobile-stat-label">Qualified</div>
                      <div class="mobile-stat-value text-green-8">
                        {{ job.qualified_count || 0 }}
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="mobile-stat-label">For QS Verification</div>
                      <div class="mobile-stat-value text-red-8">
                        {{ job.unqualified_count || 0 }}
                      </div>
                    </div>
                  </div>
                  <q-btn
                    flat
                    dense
                    color="blue"
                    icon="visibility"
                    label="View Details"
                    size="sm"
                    @click="viewJob(job)"
                  />
                </q-card-section>
              </q-card>
            </template>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- No Permission -->
    <div v-else-if="authStore.user && !hasViewDashboardAccess" class="welcome-container">
      <q-img src="tagum-city-hall.webp" class="welcome-bg" style="opacity: 0.8">
        <div class="absolute-full flex flex-center q-pa-md">
          <q-card
            class="welcome-card text-center q-pa-md"
            style="
              background: rgba(255, 255, 255, 0.95);
              border-radius: 12px;
              width: 100%;
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
              <div class="text-h6 text-black text-weight-bold q-mb-xs">
                Welcome,
                <span class="text-primary">{{ authStore.user.name }}</span>
                !
              </div>
              <div class="text-subtitle2 text-grey-8 q-mb-sm">
                to Recruitment, Selection & Placement Portal
              </div>
              <q-separator class="q-my-sm" />
              <div class="text-body2 text-grey-7">
                You do not have permission to view the dashboard. Please contact your administrator
                for access.
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
      <div class="absolute-full flex flex-center q-pa-md">
        <q-card
          class="welcome-card text-center q-pa-md"
          style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            width: 100%;
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

  const officeColumns = [
    { name: 'Office', label: 'Office', align: 'left', field: 'Office', sortable: true },
    {
      name: 'Total_applicant',
      label: 'No. of Application',
      align: 'center',
      field: 'Total_applicant',
      sortable: true,
    },
    { name: 'Qualified', label: 'Qualified', align: 'center', field: 'Qualified', sortable: true },
    {
      name: 'Unqualified',
      label: 'For QS Verification',
      align: 'center',
      field: 'Unqualified',
      sortable: true,
    },
    { name: 'Pending', label: 'For Assessment', align: 'center', field: 'Pending', sortable: true },
  ];

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
  /* ─── BADGES ROW ─────────────────────────────────────── */
  .badges-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }
  .badges-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .badge-simple {
    border-radius: 20px;
  }

  /* ─── STAT CARDS GRID ────────────────────────────────── */
  /* Desktop: positions card wider, rest equal */
  .stat-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 8px;
  }
  /* Tablet (600–1023px): 2 columns */
  @media (max-width: 1023px) and (min-width: 600px) {
    .stat-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  /* Mobile (<600px): 1 column */
  @media (max-width: 599px) {
    .stat-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ─── STAT CARDS ─────────────────────────────────────── */
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
  .pair-left {
    border-right: 1px solid #eeeeee;
    padding-right: 12px;
  }
  .pair-right {
    padding-left: 12px;
  }

  /* ─── TABLE (desktop) ────────────────────────────────── */
  .applicants-table {
    width: 100%;
  }
  .applicants-table :deep(table) {
    border-collapse: collapse;
    border: 1px solid rgba(0, 0, 0, 0.18);
  }
  .applicants-table :deep(th) {
    text-transform: uppercase;
  }
  .applicants-table :deep(th),
  .applicants-table :deep(td) {
    border-right: 1px solid rgba(0, 0, 0, 0.18) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.18) !important;
  }
  .applicants-table :deep(th:last-child),
  .applicants-table :deep(td:last-child) {
    border-right: none !important;
  }

  /* ─── MOBILE CARDS ───────────────────────────────────── */
  .mobile-row-card {
    border-radius: 8px;
  }
  .mobile-stat-label {
    font-size: 11px;
    color: #757575;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .mobile-stat-value {
    font-size: 16px;
    font-weight: 500;
  }

  /* ─── STATUS BADGE ───────────────────────────────────── */
  .status-badge {
    font-size: 0.85rem;
    padding: 4px 10px;
    border-radius: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  /* ─── WELCOME / LOADING ──────────────────────────────── */
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
