<template>
  <q-page class="account-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-wrapper">
          <h4 class="text-bold page-title q-ma-none">My Account</h4>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Profile Card -->
      <q-card class="profile-card q-mx-auto">
        <q-card-section class="profile-header row items-center q-gutter-md">
          <!-- Dynamic Image or Placeholder -->
          <div class="avatar-wrapper">
            <img
              v-if="userImage"
              :src="userImage"
              alt="Profile"
              class="profile-avatar"
              @error="handleImageError"
            />
            <div v-else class="avatar-placeholder">
              <q-icon name="person" size="48px" color="grey-6" />
            </div>
          </div>

          <div class="profile-info">
            <div class="text-h6 text-weight-bold">{{ displayName }}</div>
            <div class="text-body2 text-grey-7">Applicant</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Applied Positions Table -->
      <q-card class="table-card q-mx-auto q-mt-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">Applied Positions</div>

          <!-- Desktop/Tablet Table View -->
          <div class="gt-xs">
            <q-table
              :rows="appliedPositions"
              :columns="columns"
              row-key="id"
              flat
              bordered
              wrap-cells
              hide-pagination
              :rows-per-page-options="[0]"
              :loading="pdsStore.applicationsAreLoading"
              class="positions-table"
            >
              <template v-slot:body-cell-Position="props">
                <q-td :props="props">
                  <span class="text-body1 text-weight-medium text-black">
                    {{ props.row.Position }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-Office="props">
                <q-td :props="props">
                  <span class="text-body1 text-weight-medium text-black">
                    {{ props.row.Office }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-SalaryGrade="props">
                <q-td :props="props" align="center">
                  <q-chip class="text-body2 text-weight-bold salary-grade-chip" dense>
                    <q-icon name="layers" size="xs" class="q-mr-xs" />
                    SG {{ props.row.SalaryGrade || '-' }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-date_applied="props">
                <q-td :props="props">
                  <q-chip class="text-body2 text-weight-medium bg-blue text-white" dense>
                    {{ props.row.date_applied }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props" align="center">
                  <q-chip
                    class="text-body2 text-weight-bold status-chip"
                    :class="statusClass(props.row.status)"
                    dense
                  >
                    {{ props.row.status }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:no-data>
                <div class="full-width text-center text-grey-6 q-pa-md">No applications found.</div>
              </template>
            </q-table>
          </div>

          <!-- Mobile Card View -->
          <div class="cards-wrapper lt-sm">
            <div v-if="pdsStore.applicationsAreLoading" class="text-center q-pa-lg">
              <q-spinner color="primary" size="md" />
            </div>

            <template v-else>
              <q-card
                v-for="position in appliedPositions"
                :key="position.id"
                class="position-card-mobile q-mb-md"
                flat
                bordered
              >
                <q-card-section>
                  <div class="text-body1 text-weight-bold q-mb-xs">
                    {{ position.Position }}
                  </div>
                  <div class="text-body2 text-grey-7 q-mb-sm">
                    <q-icon name="business" size="xs" class="q-mr-xs" />
                    {{ position.Office }}
                  </div>
                  <div class="q-mb-sm">
                    <q-chip class="text-body2 text-weight-bold salary-grade-chip" dense>
                      <q-icon name="layers" size="xs" class="q-mr-xs" />
                      SG {{ position.SalaryGrade || '-' }}
                    </q-chip>
                  </div>
                  <div class="row items-center justify-between q-mt-sm">
                    <q-chip size="sm" class="bg-blue text-white" dense>
                      <q-icon name="event" size="xs" class="q-mr-xs" />
                      {{ position.date_applied }}
                    </q-chip>
                    <q-chip
                      size="sm"
                      class="status-chip"
                      :class="statusClass(position.status)"
                      dense
                    >
                      {{ position.status }}
                    </q-chip>
                  </div>
                </q-card-section>
              </q-card>

              <div v-if="appliedPositions.length === 0" class="text-center text-grey-6 q-pa-md">
                No applications found.
              </div>
            </template>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { usePDSStore } from 'src/stores/pdsFormStore';

  const router = useRouter();
  const $q = useQuasar();
  const pdsStore = usePDSStore();

  // ─── Reactive State ──────────────────────────────────────────
  const hasPDS = ref(false);

  // ─── Computed Properties ──────────────────────────────────────

  // Get user data from store
  const displayName = computed(() => pdsStore.displayName);
  const fullName = computed(() => pdsStore.fullName);
  const userImage = computed(() => pdsStore.userImage);

  // Applied positions now come from the store (mapped from the API response)
  const appliedPositions = computed(() => pdsStore.appliedPositionsTable);

  // ─── Static Data ─────────────────────────────────────────────

  const columns = [
    { name: 'Position', label: 'Position', align: 'left', field: 'Position' },
    { name: 'Office', label: 'Office', align: 'left', field: 'Office' },
    { name: 'SalaryGrade', label: 'Salary Grade', align: 'center', field: 'SalaryGrade' },
    { name: 'date_applied', label: 'Date Applied', align: 'left', field: 'date_applied' },
    { name: 'status', label: 'Status', align: 'center', field: 'status' },
  ];

  // ─── Methods ─────────────────────────────────────────────────

  const statusClass = (status) => {
    switch (status) {
      case 'Qualified':
        return 'status-qualified';
      case 'Not Qualified':
      case 'Unqualified':
        return 'status-not-qualified';
      default:
        return 'status-pending';
    }
  };

  const handleImageError = (event) => {
    // If image fails to load, show placeholder
    event.target.style.display = 'none';
    // Show the placeholder div
    const wrapper = event.target.parentElement;
    const placeholder = wrapper.querySelector('.avatar-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  // ─── Lifecycle ────────────────────────────────────────────────

  onMounted(async () => {
    // Restore user data from localStorage if not already loaded
    if (!fullName.value) {
      pdsStore.restoreFromStorage();
    }

    const email = localStorage.getItem('userEmail');

    // If still no user data and no email to look up, redirect to login
    if (!fullName.value && !email) {
      $q.notify({
        type: 'warning',
        message: 'Please login to view your account.',
        position: 'top',
      });
      router.push('/login');
      return;
    }

    if (email) {
      // Check if user has PDS
      const storedHasPDS = localStorage.getItem('userHasPDS');
      if (storedHasPDS !== null) {
        hasPDS.value = storedHasPDS === 'true';
      }

      // fetchPDS is only a fallback for stale localStorage entries that
      // predate the image_url fix (i.e. restored but with no photo).
      const needsPdsFallback = !userImage.value;

      const [pdsResult, applicationsResult] = await Promise.all([
        needsPdsFallback ? pdsStore.fetchPDS(email) : Promise.resolve({ success: true }),
        pdsStore.fetchApplications(email),
      ]);

      if (!applicationsResult.success) {
        $q.notify({
          type: 'negative',
          message: applicationsResult.error || 'Failed to load your applications.',
          position: 'top',
        });
      }

      // Update hasPDS based on fetch results
      if (needsPdsFallback && pdsResult.success) {
        // If we fetched PDS and it was successful, user has PDS
        hasPDS.value = true;
        localStorage.setItem('userHasPDS', 'true');
      } else if (needsPdsFallback && !pdsResult.success && !fullName.value) {
        // If fetch failed and we don't have a full name, user probably doesn't have PDS
        hasPDS.value = false;
        localStorage.setItem('userHasPDS', 'false');
        console.warn('Could not load PDS/photo:', pdsResult.error);
      }
    }
  });
</script>

<style scoped>
  .account-page {
    padding: 0;
  }

  .page-header {
    padding: 16px 48px;
    background: white;
    border-bottom: 1px solid #eee;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .content-section {
    padding: 16px 48px;
  }

  .profile-card,
  .table-card {
    max-width: 900px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .profile-header {
    padding: 24px;
    flex-wrap: wrap;
  }

  .avatar-wrapper {
    width: 88px;
    height: 88px;
    flex-shrink: 0;
    position: relative;
  }

  .profile-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #e0e0e0;
    background: #f5f5f5;
  }

  .avatar-placeholder {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #f0f0f0;
    border: 2px dashed #c9c9c9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .profile-info {
    min-width: 150px;
  }

  .salary-grade-chip {
    background: #f3eafd;
    color: #6626a6;
    font-weight: 600;
  }

  .status-chip {
    font-weight: 600;
  }

  .status-pending {
    background: #fff4de;
    color: #b8860b;
  }

  .status-qualified {
    background: #e6f7e9;
    color: #2e7d32;
  }

  .status-not-qualified {
    background: #fdeaea;
    color: #c62828;
  }

  .position-card-mobile {
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .position-card-mobile:active {
    transform: scale(0.98);
  }

  /* Tablet breakpoint (600px - 1023px) */
  @media (max-width: 1023px) and (min-width: 600px) {
    .page-header {
      padding: 16px 24px;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .content-section {
      padding: 16px 24px;
    }
  }

  /* Mobile breakpoint (<600px) */
  @media (max-width: 599px) {
    .page-header {
      padding: 12px 16px;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .content-section {
      padding: 12px;
    }

    .profile-header {
      padding: 16px;
      justify-content: center;
      text-align: center;
    }

    .avatar-wrapper {
      width: 72px;
      height: 72px;
    }

    .avatar-placeholder {
      width: 72px;
      height: 72px;
    }

    .profile-avatar {
      width: 72px;
      height: 72px;
    }
  }

  /* Extra small devices (<360px) */
  @media (max-width: 359px) {
    .page-header {
      padding: 8px 12px;
    }

    .page-title {
      font-size: 1.1rem;
    }

    .avatar-wrapper {
      width: 60px;
      height: 60px;
    }

    .avatar-placeholder {
      width: 60px;
      height: 60px;
    }

    .profile-avatar {
      width: 60px;
      height: 60px;
    }
  }

  /* Large desktop optimization */
  @media (min-width: 1440px) {
    .page-header {
      padding: 24px 60px;
    }

    .content-section {
      padding: 24px 60px;
    }

    .page-title {
      font-size: 2rem;
    }

    .avatar-wrapper {
      width: 100px;
      height: 100px;
    }

    .avatar-placeholder {
      width: 100px;
      height: 100px;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
    }
  }
</style>
