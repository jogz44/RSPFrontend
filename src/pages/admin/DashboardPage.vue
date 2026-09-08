<template>
  <q-page>
    <!-- User has permission to view dashboard -->
    <div v-if="authStore.user && hasViewDashboardAccess" class="column no-gap">
      <!-- Welcome Message -->
      <div class="text-h5 text-weight-bolder text-primary q-ma-md">DASHBOARD</div>

      <!-- STAT CARDS: responsive grid -->
      <div class="stat-grid q-mx-md q-mb-sm">
        <!-- Positions Card -->
        <q-card class="stat-card ct-light-blue bg-white">
          <q-card-section class="card-content">
            <!-- Loading Overlay -->
            <div v-if="dashboardStore.loadingCards.positions" class="card-loading-overlay">
              <q-spinner color="primary" size="30px" />
            </div>

            <!-- Total Positions -->
            <div class="stat-row q-mb-md">
              <span class="card-label text-bold text-grey-8">TOTAL PLANTILLA POSITIONS</span>
              <span
                class="card-number text-blue-4 text-center"
                style="flex: 1; text-align: left"
                :class="{ 'skeleton-loading': dashboardStore.loadingCards.positions }"
              >
                <template v-if="dashboardStore.loadingCards.positions">
                  <span class="skeleton-text">---</span>
                </template>
                <template v-else>
                  {{ Number(dashboardStore.total_positions).toLocaleString() }}
                </template>
              </span>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Two-column layout with vertical separator -->
            <div class="row">
              <!-- Left Column -->
              <div class="col-12 col-md-5">
                <div class="stat-row q-mb-sm">
                  <span class="card-label text-bold text-grey-8">Funded Positions</span>
                  <span class="colon text-grey-8">:</span>
                  <span
                    class="card-number text-blue-6"
                    :class="{ 'skeleton-loading': dashboardStore.loadingCards.positions }"
                  >
                    <template v-if="dashboardStore.loadingCards.positions">
                      <span class="skeleton-text">---</span>
                    </template>
                    <template v-else>
                      {{ Number(dashboardStore.funded).toLocaleString() }}
                    </template>
                  </span>
                </div>
                <div class="stat-row">
                  <span class="card-label text-bold text-grey-8">Unfunded Positions</span>
                  <span class="colon text-grey-8">:</span>
                  <span
                    class="card-number text-amber-6"
                    :class="{ 'skeleton-loading': dashboardStore.loadingCards.positions }"
                  >
                    <template v-if="dashboardStore.loadingCards.positions">
                      <span class="skeleton-text">---</span>
                    </template>
                    <template v-else>
                      {{ Number(dashboardStore.unfunded).toLocaleString() }}
                    </template>
                  </span>
                </div>
              </div>

              <!-- Vertical Separator (hidden on mobile) -->
              <div class="col-auto flex flex-center q-ml-md q-mr-md lt-md-hidden">
                <q-separator vertical />
              </div>

              <!-- Mobile Separator (visible only on mobile) -->
              <div class="col-12 gt-sm-hidden">
                <q-separator class="q-my-sm" />
              </div>

              <!-- Right Column -->
              <div class="col-12 col-md">
                <div class="stat-row q-mb-sm">
                  <span class="card-label text-bold text-grey-7">Filled-up Positions</span>
                  <span class="colon text-grey-7">:</span>
                  <span
                    class="card-number text-teal-6"
                    :class="{ 'skeleton-loading': dashboardStore.loadingCards.positions }"
                  >
                    <template v-if="dashboardStore.loadingCards.positions">
                      <span class="skeleton-text">---</span>
                    </template>
                    <template v-else>
                      {{ Number(dashboardStore.filled).toLocaleString() }}
                    </template>
                  </span>
                </div>
                <div class="stat-row">
                  <span class="card-label text-bold text-grey-7">Vacant Funded Positions</span>
                  <span class="colon text-grey-7">:</span>
                  <span
                    class="card-number text-deep-purple-4"
                    :class="{ 'skeleton-loading': dashboardStore.loadingCards.positions }"
                  >
                    <template v-if="dashboardStore.loadingCards.positions">
                      <span class="skeleton-text">---</span>
                    </template>
                    <template v-else>
                      {{ Number(dashboardStore.vacant).toLocaleString() }}
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Publication Date -->
        <q-card class="stat-card ct-purple bg-white">
          <q-card-section class="card-content-publication">
            <!-- Loading Overlay -->
            <div v-if="dashboardStore.loadingCards.publication" class="card-loading-overlay">
              <q-spinner color="deep-purple" size="30px" />
            </div>

            <div class="card-label q-mb-xs text-grey-8 text-bold">Publication Date</div>

            <q-select
              v-model="dashboardStore.selectedPublication"
              :options="publicationOptions"
              option-label="label"
              option-value="value"
              color="deep-purple"
              outlined
              dense
              emit-value
              map-options
              :loading="publicationLoading || dashboardStore.loadingCards.publication"
              @update:model-value="onPublicationChange"
              class="q-mb-sm"
              :disable="dashboardStore.loadingCards.publication"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey-6">
                    No publication dates available
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-separator class="q-my-sm" />

            <div class="card-label q-mb-xs text-grey-8 text-bold">Published Positions</div>
            <div
              class="card-number text-deep-purple"
              :class="{ 'skeleton-loading': dashboardStore.loadingCards.publication }"
            >
              <template v-if="dashboardStore.loadingCards.publication">
                <span class="skeleton-text">---</span>
              </template>
              <template v-else>
                {{ Number(dashboardStore.published_position).toLocaleString() }}
              </template>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- STAT CARDS: responsive grid - equal width for bottom row -->
      <div class="stat-grid-bottom q-mx-md q-mb-sm">
        <!-- Total Applicants -->
        <q-card class="stat-card ct-total-applicants bg-white">
          <q-card-section class="card-content">
            <!-- Loading Overlay -->
            <div v-if="dashboardStore.loadingCards.applicants" class="card-loading-overlay">
              <q-spinner color="primary" size="30px" />
            </div>

            <div class="card-label q-mb-xs text-grey-8 text-bold">Total Applicants</div>
            <div
              class="card-number text-green-9"
              :class="{ 'skeleton-loading': dashboardStore.loadingCards.applicants }"
            >
              <template v-if="dashboardStore.loadingCards.applicants">
                <span class="skeleton-text">---</span>
              </template>
              <template v-else>
                {{ Number(dashboardStore.total_applicant).toLocaleString() }}
              </template>
            </div>
            <q-separator class="q-my-sm" />
            <div class="row">
              <div class="col-6 pair-left">
                <div class="card-label text-grey-7 text-bold">Internal</div>
                <div
                  class="card-number text-green-9"
                  :class="{ 'skeleton-loading': dashboardStore.loadingCards.applicants }"
                >
                  <template v-if="dashboardStore.loadingCards.applicants">
                    <span class="skeleton-text">---</span>
                  </template>
                  <template v-else>
                    {{ Number(dashboardStore.internal_applicant).toLocaleString() }}
                  </template>
                </div>
              </div>
              <div class="col-6 pair-right">
                <div class="card-label text-grey-7 text-bold">External</div>
                <div
                  class="card-number text-negative"
                  :class="{ 'skeleton-loading': dashboardStore.loadingCards.applicants }"
                >
                  <template v-if="dashboardStore.loadingCards.applicants">
                    <span class="skeleton-text">---</span>
                  </template>
                  <template v-else>
                    {{ Number(dashboardStore.external_applicant).toLocaleString() }}
                  </template>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Total Applications -->
        <q-card class="stat-card ct-green bg-white">
          <q-card-section class="card-content">
            <!-- Loading Overlay -->
            <div v-if="dashboardStore.loadingCards.applications" class="card-loading-overlay">
              <q-spinner color="primary" size="30px" />
            </div>

            <div class="card-label q-mb-xs text-grey-8 text-bold">Total Applications</div>
            <div
              class="card-number text-green-9"
              :class="{ 'skeleton-loading': dashboardStore.loadingCards.applications }"
            >
              <template v-if="dashboardStore.loadingCards.applications">
                <span class="skeleton-text">---</span>
              </template>
              <template v-else>
                {{ Number(dashboardStore.total_application).toLocaleString() }}
              </template>
            </div>
            <q-separator class="q-my-sm" />
            <div class="row">
              <div class="col-6 pair-left">
                <div class="card-label text-grey-7 text-bold">Internal</div>
                <div
                  class="card-number text-green-9"
                  :class="{ 'skeleton-loading': dashboardStore.loadingCards.applications }"
                >
                  <template v-if="dashboardStore.loadingCards.applications">
                    <span class="skeleton-text">---</span>
                  </template>
                  <template v-else>
                    {{ Number(dashboardStore.internal_application).toLocaleString() }}
                  </template>
                </div>
              </div>
              <div class="col-6 pair-right">
                <div class="card-label text-grey-7 text-bold">External</div>
                <div
                  class="card-number text-negative"
                  :class="{ 'skeleton-loading': dashboardStore.loadingCards.applications }"
                >
                  <template v-if="dashboardStore.loadingCards.applications">
                    <span class="skeleton-text">---</span>
                  </template>
                  <template v-else>
                    {{ Number(dashboardStore.external_application).toLocaleString() }}
                  </template>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Pre-Assessment -->
        <q-card class="stat-card ct-blue bg-white">
          <q-card-section class="card-content">
            <!-- Loading Overlay -->
            <div v-if="dashboardStore.loadingCards.preAssessment" class="card-loading-overlay">
              <q-spinner color="primary" size="30px" />
            </div>

            <div class="card-label q-mb-xs text-grey-8 text-bold">Pre-assessment</div>
            <div
              class="card-number text-blue-9"
              :class="{ 'skeleton-loading': dashboardStore.loadingCards.preAssessment }"
            >
              <template v-if="dashboardStore.loadingCards.preAssessment">
                <span class="skeleton-text">---</span>
              </template>
              <template v-else>
                {{ Number(dashboardStore.qualified + dashboardStore.unqualified).toLocaleString() }}
              </template>
            </div>
            <q-separator class="q-my-sm" />
            <div class="row">
              <div class="col-6 pair-left">
                <div class="card-label text-grey-7 text-bold">Qualified</div>
                <div
                  class="card-number text-green-9"
                  :class="{ 'skeleton-loading': dashboardStore.loadingCards.preAssessment }"
                >
                  <template v-if="dashboardStore.loadingCards.preAssessment">
                    <span class="skeleton-text">---</span>
                  </template>
                  <template v-else>
                    {{ Number(dashboardStore.qualified).toLocaleString() }}
                  </template>
                </div>
              </div>
              <div class="col-6 pair-right">
                <div class="card-label text-grey-7 text-bold">For QS Validation</div>
                <div
                  class="card-number text-red-9"
                  :class="{ 'skeleton-loading': dashboardStore.loadingCards.preAssessment }"
                >
                  <template v-if="dashboardStore.loadingCards.preAssessment">
                    <span class="skeleton-text">---</span>
                  </template>
                  <template v-else>
                    {{ Number(dashboardStore.unqualified).toLocaleString() }}
                  </template>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- For Assessment -->
        <q-card class="stat-card ct-amber bg-white">
          <q-card-section class="card-content">
            <!-- Loading Overlay -->
            <div v-if="dashboardStore.loadingCards.forAssessment" class="card-loading-overlay">
              <q-spinner color="primary" size="30px" />
            </div>

            <div class="card-label q-mb-xs text-grey-8 text-bold">For Assessment</div>
            <div
              class="card-number text-orange-9"
              :class="{ 'skeleton-loading': dashboardStore.loadingCards.forAssessment }"
            >
              <template v-if="dashboardStore.loadingCards.forAssessment">
                <span class="skeleton-text">---</span>
              </template>
              <template v-else>
                {{ Number(dashboardStore.for_assessment).toLocaleString() }}
              </template>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- TABS -->
      <div class="row justify-start items-start q-mt-sm q-mb-xs q-mx-md">
        <q-tabs v-model="activeOverviewTab" dense class="text-primary" inline-label>
          <q-tab name="office" icon-right="apartment" label="Office Overview" />
          <q-tab name="jobs" icon-right="work_history" label="Jobs Overview" />
        </q-tabs>
      </div>

      <q-tab-panels v-model="activeOverviewTab" animated>
        <!-- ── Office Overview ── -->
        <q-tab-panel name="office" class="q-pa-sm">
          <div class="row justify-between items-center q-mb-md">
            <div class="row justify-start items-start">
              <q-chip dense class="q-pl-md q-pr-md">
                Total Office:
                <q-badge dense rounded color="green" class="text-bold q-ml-xs">
                  {{ officeRows.length }}
                </q-badge>
              </q-chip>
            </div>

            <!-- Search Bar for Office Table -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="officeSearch"
                outlined
                dense
                placeholder="Search office..."
                clearable
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Desktop / Tablet table -->
          <div class="desktop-table">
            <q-card style="width: 100%" class="overflow-auto">
              <q-table
                class="applicants-table"
                :rows="filteredOfficeRows"
                :columns="officeColumns"
                row-key="Office"
                :loading="dashboardStore.loading"
                :pagination="officePagination"
                dense
                :wrap-cells="true"
              >
                <template v-slot:header>
                  <q-tr>
                    <q-th rowspan="2" style="text-align: left; vertical-align: middle">Office</q-th>
                    <q-th rowspan="2" style="text-align: center; vertical-align: middle">
                      No. of Application
                    </q-th>
                    <q-th
                      colspan="2"
                      style="text-align: center; border-bottom: 2px solid rgba(0, 0, 0, 0.15)"
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
                      For QS Validation
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

          <!-- Mobile card list with search -->
          <div class="mobile-cards">
            <div v-if="dashboardStore.loading" class="flex flex-center q-pa-lg">
              <q-spinner color="primary" size="40px" />
            </div>
            <template v-else>
              <div v-if="filteredOfficeRows.length === 0" class="text-center q-pa-md text-grey-6">
                No matching offices found
              </div>
              <q-card
                v-for="row in filteredOfficeRows"
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
                      <div class="mobile-stat-label">For QS Validation</div>
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
          <div class="row justify-between items-center q-mb-md">
            <div class="row justify-start items-start">
              <q-chip dense class="q-pl-md q-pr-md">
                Total Active Job Posts:
                <q-badge dense rounded color="green" class="text-bold q-ml-xs">
                  {{ dashboardJobPosts.length }}
                </q-badge>
              </q-chip>
            </div>

            <!-- Search Bar for Jobs Table -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="jobsSearch"
                outlined
                dense
                placeholder="Search by office or position..."
                clearable
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Desktop / Tablet table -->
          <div class="desktop-table">
            <q-card style="width: 100%" class="overflow-auto">
              <q-table
                class="applicants-table"
                :rows="filteredJobPosts"
                :columns="jobColumns"
                row-key="id"
                :loading="dashboardStore.loadingJobPosts"
                :pagination="jobsPagination"
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
                      style="text-align: center; border-bottom: 2px solid rgba(0, 0, 0, 0.15)"
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
                      For QS Validation
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

          <!-- Mobile card list with search -->
          <div class="mobile-cards">
            <div v-if="dashboardStore.loadingJobPosts" class="flex flex-center q-pa-lg">
              <q-spinner color="primary" size="40px" />
            </div>
            <template v-else>
              <div v-if="filteredJobPosts.length === 0" class="text-center q-pa-md text-grey-6">
                No matching jobs found
              </div>
              <q-card
                v-for="job in filteredJobPosts"
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
                      <div class="mobile-stat-label">For QS Validation</div>
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

  const router = useRouter();
  const route = useRoute();

  const dashboardStore = DashboardStore();
  const authStore = useAuthStore();

  const activeOverviewTab = ref('office');

  // Search terms
  const officeSearch = ref('');
  const jobsSearch = ref('');

  // Publication loading state
  const publicationLoading = ref(false);

  const hasViewDashboardAccess = computed(
    () => authStore.user?.permissions?.viewDashboardstat === '1',
  );

  const officeRows = computed(() => dashboardStore.summaryByOffice || []);

  // Dashboard job posts from store
  const dashboardJobPosts = computed(() => dashboardStore.dashboardJobPosts || []);

  // Publication options computed from store
  const publicationOptions = computed(() => {
    return dashboardStore.publicationDates.map((item) => ({
      label: `${item.post_date} - ${item.end_date}`,
      value: item,
    }));
  });

  // Filtered office rows based on search
  const filteredOfficeRows = computed(() => {
    if (!officeSearch.value) return officeRows.value;
    const searchTerm = officeSearch.value.toLowerCase();
    return officeRows.value.filter((row) => row.Office.toLowerCase().includes(searchTerm));
  });

  // Filtered job posts based on search
  const filteredJobPosts = computed(() => {
    if (!jobsSearch.value) return dashboardJobPosts.value;
    const searchTerm = jobsSearch.value.toLowerCase();
    return dashboardJobPosts.value.filter(
      (job) =>
        job.Office?.toLowerCase().includes(searchTerm) ||
        job.Position?.toLowerCase().includes(searchTerm),
    );
  });

  // Responsive pagination
  const officePagination = ref({ rowsPerPage: 5 });
  const jobsPagination = ref({ rowsPerPage: 5 });

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
      label: 'For QS Validation',
      align: 'center',
      field: 'Unqualified',
      sortable: true,
    },
    { name: 'Pending', label: 'For Assessment', align: 'center', field: 'Pending', sortable: true },
  ];

  const jobColumns = [
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
      label: 'For QS Validation',
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

  // Handle publication date change
  const onPublicationChange = async (publication) => {
    if (publicationLoading.value) return;

    publicationLoading.value = true;
    try {
      // Refresh dashboard with selected publication
      await dashboardStore.refreshDashboard(publication);
    } catch (error) {
      console.error('Error refreshing dashboard with new publication:', error);
    } finally {
      publicationLoading.value = false;
    }
  };

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
      try {
        // Fetch publication dates first
        await dashboardStore.fetchPublicationDates();

        // Get initial data with default selection (latest)
        if (dashboardStore.selectedPublication) {
          const { post_date, end_date } = dashboardStore.selectedPublication;
          await dashboardStore.status(post_date, end_date);
          await dashboardStore.fetchSummaryByOffice(post_date);
          await dashboardStore.fetchDashboardJobPosts(post_date);
        } else {
          await dashboardStore.status();
          await dashboardStore.fetchSummaryByOffice();
          await dashboardStore.fetchDashboardJobPosts();
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    }
  });
</script>

<style scoped>
  /* ─── UNIFIED TYPOGRAPHY SYSTEM ─────────────────────────── */
  /* All labels — same size as "TOTAL PLANTILLA POSITIONS" label */
  .card-label {
    font-size: 15px;
    font-weight: 700;
    color: #616161;
    letter-spacing: 0.2px;
  }

  /* All numbers — same size, same bold weight across every card */
  .card-number {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.2;
    word-break: break-word;
    transition: all 0.3s ease;
  }

  /* ─── LOADING STATES ─────────────────────────────────────── */
  .card-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    z-index: 10;
    backdrop-filter: blur(2px);
  }

  .skeleton-loading {
    color: #e0e0e0 !important;
    position: relative;
  }

  .skeleton-text {
    display: inline-block;
    min-width: 50px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
    color: transparent !important;
    padding: 0 8px;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* ─── STAT ROW WITH PERFECT COLON ALIGNMENT ─────────────────────────── */
  .stat-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-row .card-label {
    flex: 1;
    text-align: left;
  }

  .stat-row .colon {
    flex-shrink: 0;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-row .card-number {
    flex-shrink: 0;
    text-align: right;
    min-width: 60px;
  }

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
    gap: 8px;
    align-items: center;
  }

  /* Large badge style */
  .badge-large {
    padding: 10px 18px !important;
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    border-radius: 24px !important;
    min-height: 38px;
    display: inline-flex;
    align-items: center;
  }

  /* ─── SEARCH INPUT ─────────────────────────────────────── */
  .search-input {
    min-width: 200px;
  }

  .search-input :deep(.q-field__control) {
    border-radius: 8px;
  }

  /* ─── STAT CARDS GRID - TOP ROW ────────────────────────── */
  .stat-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 12px;
  }

  /* ─── STAT CARDS GRID - BOTTOM ROW (Equal width) ────────── */
  .stat-grid-bottom {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 0.5fr;
    gap: 12px;
  }

  /* Tablet (768–1023px): 2 columns for top row, 2 columns for bottom row */
  @media (max-width: 1023px) and (min-width: 768px) {
    .stat-grid {
      grid-template-columns: 1fr 1fr;
    }

    .stat-grid-bottom {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* Mobile (<768px): 1 column for all grids */
  @media (max-width: 767px) {
    .stat-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .stat-grid-bottom {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .search-input {
      margin-top: 8px;
      width: 100%;
    }

    .badge-large {
      padding: 8px 14px !important;
      font-size: 0.82rem !important;
      min-height: 34px;
    }

    /* Mobile colon alignment adjustments */
    .stat-row {
      gap: 6px;
    }

    .stat-row .card-label {
      font-size: 12px;
    }

    .stat-row .card-number {
      font-size: 16px;
      min-width: 50px;
    }
  }

  /* ─── STAT CARDS ─────────────────────────────────────── */
  .stat-card {
    border-radius: 10px;
    border-top: 3px solid transparent;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    position: relative;
    overflow: hidden;
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

  .ct-total-applicants {
    border-top-color: #2196f3;
  }

  .card-content {
    padding: 14px 16px;
    position: relative;
  }

  /* Expanded publication card content with more vertical padding */
  .card-content-publication {
    padding: 20px 20px;
    position: relative;
  }

  .pair-left {
    border-right: 1px solid #eeeeee;
    padding-right: 12px;
  }

  .pair-right {
    padding-left: 12px;
  }

  /* Responsive text wrapping */
  .text-wrap {
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
  }

  /* ─── TABLE (desktop) ────────────────────────────────── */
  .desktop-table {
    display: block;
  }

  .mobile-cards {
    display: none;
  }

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

  /* Responsive table handling */
  .overflow-auto {
    overflow-x: auto;
  }

  /* ─── MOBILE CARDS ───────────────────────────────────── */
  @media (max-width: 767px) {
    .desktop-table {
      display: none;
    }

    .mobile-cards {
      display: block;
    }
  }

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
    font-weight: 700;
  }

  /* Hide on mobile */
  .lt-md-hidden {
    display: flex;
  }

  .gt-sm-hidden {
    display: none;
  }

  @media (max-width: 767px) {
    .lt-md-hidden {
      display: none;
    }

    .gt-sm-hidden {
      display: block;
    }
  }

  /* ─── STATUS BADGE ───────────────────────────────────── */
  .status-badge {
    font-size: 0.85rem;
    padding: 4px 10px;
    border-radius: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  /* Responsive tabs */
  @media (max-width: 480px) {
    .q-tabs {
      width: 100%;
    }

    .q-tab {
      font-size: 12px;
      padding: 0 8px;
    }
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

  /* Extra small devices */
  @media (max-width: 480px) {
    .card-content {
      padding: 10px 12px;
    }

    .card-content-publication {
      padding: 14px 14px;
    }

    .card-number {
      font-size: 18px;
    }

    .card-label {
      font-size: 11px;
    }

    .badge-large {
      font-size: 0.75rem !important;
      padding: 7px 12px !important;
    }
  }
</style>
