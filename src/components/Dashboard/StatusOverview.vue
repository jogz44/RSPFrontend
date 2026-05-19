<template>
  <div class="row q-col-gutter-sm">
    <!-- Total Applications -->
    <div class="col-12 col-md-4">
      <q-card class="stat-card ct-green bg-white">
        <q-card-section class="card-content">
          <div class="card-title q-mb-xs">Total applications</div>
          <div class="metric-value text-green-9">{{ dashboardStore.total_applicant }}</div>
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
              <div class="pair-value text-red-9">{{ dashboardStore.external_application }}</div>
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
          <div class="metric-value text-orange-9">{{ dashboardStore.for_assessment }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue';
  import { DashboardStore } from 'src/stores/dashboardStore';

  const dashboardStore = DashboardStore();

  onMounted(async () => {
    try {
      await dashboardStore.status();
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  });
</script>

<style scoped>
  .stat-card {
    border-radius: 10px;
    border-top: 3px solid transparent;
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

  .pair-left {
    border-right: 1px solid #eeeeee;
    padding-right: 12px;
  }

  .pair-right {
    padding-left: 12px;
  }

  .pair-value {
    font-size: 18px;
    font-weight: 500;
  }
</style>
