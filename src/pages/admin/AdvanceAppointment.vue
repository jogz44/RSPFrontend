<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12">
        <q-card>
          <q-scroll-area class="q-pa-sm" style="height: 89vh">
            <!-- Title bar -->
            <div class="row items-center q-pa-sm">
              <div class="text-h6 text-bold">List of Temporary Appointment</div>
            </div>

            <q-card flat class="advance-appointment-card">
              <q-card-section>
                <!-- Selection banner -->
                <transition name="fade">
                  <div
                    v-if="selectedRows.length > 0"
                    class="row items-center q-pa-sm q-mb-md bg-teal-1 rounded-borders"
                  >
                    <q-icon name="check_circle" color="teal" size="20px" class="q-mr-sm" />
                    <span class="text-body2 text-teal-9">
                      {{ selectedRows.length }} employee(s) selected
                    </span>
                    <q-space />
                    <q-btn
                      v-if="canModifyAdvanceAppointment"
                      flat
                      dense
                      no-caps
                      color="teal"
                      icon="work"
                      label="Hire Selected"
                      class="q-mr-sm"
                      :disable="actionLoading"
                      @click="openActionDialog('hire', selectedRows)"
                    />
                    <q-btn
                      v-if="canModifyAdvanceAppointment"
                      flat
                      dense
                      no-caps
                      color="negative"
                      icon="undo"
                      label="Revert Selected"
                      class="q-mr-sm"
                      :disable="actionLoading"
                      @click="openActionDialog('revert', selectedRows)"
                    />
                    <q-btn
                      flat
                      dense
                      no-caps
                      color="grey-8"
                      icon="close"
                      label="Clear"
                      :disable="actionLoading"
                      @click="clearSelection"
                    />
                  </div>
                </transition>

                <!-- Search + record count -->
                <div class="row justify-between items-center q-mb-md">
                  <q-input
                    v-model="advanceAppointmentFilter"
                    dense
                    outlined
                    clearable
                    placeholder="Search employee..."
                    style="max-width: 300px; width: 100%"
                  >
                    <template #append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                  <div class="text-caption text-grey-8">
                    {{ filteredAdvanceAppointments.length }} record(s)
                  </div>
                </div>

                <!-- Main table -->
                <q-table
                  v-model:selected="selectedRows"
                  v-model:pagination="advanceAppointmentPagination"
                  flat
                  bordered
                  class="appointments-table"
                  row-key="ControlNo"
                  selection="multiple"
                  :rows="filteredAdvanceAppointments"
                  :columns="advanceAppointmentColumns"
                  :selected-rows-label="() => ''"
                  :loading="advanceAppointmentStore.loading"
                  :rows-per-page-options="[5, 10, 25, 50]"
                >
                  <template #loading>
                    <q-inner-loading showing color="primary" size="40px" />
                  </template>

                  <!-- Action column -->
                  <template #body-cell-action="props">
                    <q-td :props="props">
                      <div class="row no-wrap justify-center q-gutter-x-xs">
                        <q-btn
                          v-if="canModifyAdvanceAppointment"
                          flat
                          dense
                          round
                          color="positive"
                          class="bg-green-1"
                          icon="work"
                          :disable="actionLoading"
                          @click="openActionDialog('hire', [props.row])"
                        >
                          <q-tooltip>Hire Permanently</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="canModifyAdvanceAppointment"
                          flat
                          dense
                          round
                          color="orange"
                          class="bg-orange-1"
                          icon="edit"
                          @click="editAdvanceAppointment(props.row)"
                        >
                          <q-tooltip>Edit Reports</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="canReportAdvanceAppointment"
                          flat
                          dense
                          round
                          color="teal"
                          class="bg-teal-1"
                          icon="assignment"
                          :loading="appointmentReportLoadingRow === props.row.ControlNo"
                          @click="openAppointmentReport(props.row)"
                        >
                          <q-tooltip>View Appointment Report (PDF)</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="canModifyAdvanceAppointment"
                          flat
                          dense
                          round
                          color="negative"
                          class="bg-red-1"
                          icon="undo"
                          :disable="actionLoading"
                          @click="openActionDialog('revert', [props.row])"
                        >
                          <q-tooltip>Revert Temporary Hire</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </template>

                  <!-- Empty state -->
                  <template #no-data>
                    <div class="text-center q-pa-xl full-width">
                      <template v-if="advanceAppointmentStore.loading">
                        <q-spinner color="primary" size="3em" />
                        <p class="text-h6 text-grey-8 q-mt-md">Loading advance appointments...</p>
                      </template>
                      <template v-else>
                        <q-icon name="info" size="3em" color="grey-7" />
                        <p class="text-h6 text-grey-8 q-mt-md">No advance appointments found</p>
                      </template>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-scroll-area>
        </q-card>
      </div>
    </div>

    <!-- Edit Reports Modal -->
    <q-dialog v-model="editReportModal" persistent>
      <EditReports
        v-model="editReportModal"
        :employee="reportRow"
        @close="editReportModal = false"
      />
    </q-dialog>

    <!-- Appointment Report Modal -->
    <q-dialog v-model="showAppointmentReportModal" persistent>
      <AppointmentReport2
        v-model="showAppointmentReportModal"
        :data="appointmentReportData"
        @close="showAppointmentReportModal = false"
      />
    </q-dialog>

    <!-- Confirmation Dialog (permanent hire / revert temporary hire) -->
    <q-dialog v-model="actionDialog" persistent>
      <q-card class="confirm-dialog column no-wrap">
        <!-- Header -->
        <q-card-section
          class="row items-center text-white q-py-sm"
          :class="`bg-${currentAction.color}`"
        >
          <q-icon :name="currentAction.icon" size="24px" class="q-mr-sm" />
          <div class="text-h6">{{ currentAction.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense :disable="actionLoading" v-close-popup />
        </q-card-section>

        <!-- Body -->
        <q-card-section class="col scroll q-pa-md">
          <div class="text-body1 q-mb-md">
            <template v-if="actionMode === 'hire'">
              You are about to permanently hire
              <span :class="`text-${currentAction.color}`" class="text-weight-bold">
                {{ actionEntries.length }}
              </span>
              employee(s).
            </template>
            <template v-else>
              You are about to revert the temporary hiring of
              <span :class="`text-${currentAction.color}`" class="text-weight-bold">
                {{ actionEntries.length }}
              </span>
              employee(s). This action cannot be undone from this page.
            </template>
          </div>

          <q-table
            flat
            bordered
            dense
            wrap-cells
            separator="cell"
            class="confirm-table"
            row-key="ControlNo"
            hide-pagination
            :rows="actionEntries"
            :columns="employeeColumns"
            :rows-per-page-options="[0]"
          />
        </q-card-section>

        <!-- Footer -->
        <q-separator />
        <q-card-section v-if="actionLoading" class="q-py-sm">
          <div class="text-caption text-grey-8 q-mb-xs">{{ progressLabel }}</div>
          <q-linear-progress
            rounded
            :color="currentAction.color"
            :indeterminate="actionMode === 'hire'"
            :value="progressValue"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            no-caps
            label="Cancel"
            color="grey-7"
            :disable="actionLoading"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            :color="currentAction.color"
            :icon="currentAction.icon"
            :label="currentAction.confirmLabel"
            :loading="actionLoading"
            :disable="actionLoading || actionEntries.length === 0"
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { date } from 'quasar';
  import EditReports from 'src/components/Reports/TempEditTabModal.vue';
  import AppointmentReport2 from 'src/components/Reports/AppointmentReport3.vue';
  import { useAuthStore } from 'stores/authStore';
  import { usePlantillaStore } from 'stores/plantillaStore';
  import { useAdvanceAppointmentStore } from 'stores/advanceAppointmentStore';
  import { useJobPostStore } from 'stores/jobPostStore';
  import { toast } from 'src/boot/toast';

  /* ------------------------------------------------------------------ */
  /* Stores & permissions                                                */
  /* ------------------------------------------------------------------ */
  const authStore = useAuthStore();
  const usePlantilla = usePlantillaStore();
  const advanceAppointmentStore = useAdvanceAppointmentStore();
  const jobPostStore = useJobPostStore();

  const canModifyAdvanceAppointment = computed(
    () => authStore.user?.permissions?.modifyAdvanceAppointmentAccess === '1',
  );
  const canReportAdvanceAppointment = computed(
    () => authStore.user?.permissions?.reportAdvanceAppointmentAccess === '1',
  );

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  /** "2025-03-01 00:00:00" -> "March 1, 2025" */
  const formatEffectiveDate = (value) => {
    if (!value) return '';
    const d = new Date(String(value).trim().replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? String(value) : date.formatDate(d, 'MMMM D, YYYY');
  };

  /**
   * Runs `task(entry)` sequentially for every entry and updates `progress`.
   * `task` must resolve to { success, message }. Returns the list of failures.
   */
  const runBatch = async (entries, progress, task) => {
    const failures = [];
    progress.value = { current: 0, total: entries.length };

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      progress.value = { current: i + 1, total: entries.length };

      try {
        const result = await task(entry);
        if (!result?.success) {
          failures.push({ entry, reason: result?.message || 'Request failed' });
        }
      } catch (err) {
        console.error('Batch error for', entry.ControlNo, err);
        failures.push({ entry, reason: err?.message || 'Network error' });
      }
    }

    return failures;
  };

  /** Success / partial-failure toast. `label` is e.g. "Hired" or "Reverted". */
  const reportBatchResult = (label, total, failures) => {
    if (failures.length === 0) {
      toast.success(`Successfully ${label.toLowerCase()} ${total} employee(s)`);
      return;
    }

    // Group failures by reason so a bulk error isn't repeated for every employee
    const groups = new Map();
    failures.forEach(({ entry, reason }) => {
      const names = groups.get(reason) || [];
      names.push(`${entry.Surname}, ${entry.Firstname}`);
      groups.set(reason, names);
    });

    const summary = [...groups]
      .map(([reason, names]) => `${names.join('; ')} (${reason})`)
      .join(' | ');

    toast.error(`${label} ${total - failures.length}/${total}. Failed: ${summary}`);
  };

  const refreshList = async () => {
    try {
      await advanceAppointmentStore.fetchTempEmployeeList();
    } catch (err) {
      console.error('Failed to refresh list:', err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Main table                                                          */
  /* ------------------------------------------------------------------ */
  const advanceAppointmentFilter = ref('');
  const selectedRows = ref([]);
  const advanceAppointmentPagination = ref({ page: 1, rowsPerPage: 10 });

  const advanceAppointmentColumns = [
    {
      name: 'pages',
      label: 'Page No.',
      field: (row) => row.Pages || '1',
      align: 'left',
      sortable: true,
      style: 'width: 8%',
    },
    {
      name: 'ItemNo',
      label: 'Item No.',
      field: 'ItemNo',
      align: 'left',
      sortable: true,
      style: 'width: 8%',
    },
    {
      name: 'Office',
      label: 'Office',
      field: 'Office',
      align: 'left',
      sortable: true,
      style: 'width: 20%',
    },
    {
      name: 'Designation',
      label: 'Designation',
      field: 'Designation',
      align: 'left',
      sortable: true,
      style: 'width: 19%',
    },
    {
      name: 'name',
      label: 'Name',
      field: 'name',
      align: 'left',
      sortable: true,
      style: 'width: 20%',
    },
    {
      name: 'effectiveDate',
      label: 'Effective Date',
      field: 'effectiveDate',
      align: 'left',
      sortable: true,
      style: 'width: 10%',
    },
    { name: 'action', label: 'Action', field: 'action', align: 'center', style: 'width: 15%' },
  ];

  /** Columns for the confirmation dialog's employee table */
  const employeeColumns = [
    { name: 'name', label: 'Name', field: 'name', align: 'left' },
    { name: 'Designation', label: 'Position', field: 'Designation', align: 'left' },
    { name: 'Office', label: 'Office', field: 'Office', align: 'left' },
    { name: 'ItemNo', label: 'Item No.', field: 'ItemNo', align: 'left', style: 'width: 80px' },
    {
      name: 'effectiveDate',
      label: 'Current Effectivity',
      field: 'effectiveDate',
      align: 'left',
      style: 'width: 140px',
    },
  ];

  const SEARCH_FIELDS = [
    'Surname',
    'Firstname',
    'Middlename',
    'name',
    'Designation',
    'Office',
    'ControlNo',
    'ItemNo',
    'Pages',
  ];

  const appointmentRows = computed(() =>
    (advanceAppointmentStore.employeeList || []).map((item) => ({
      ...item,
      name: `${item.Surname}, ${item.Firstname} ${item.Middlename || ''}`.trim(),
      effectiveDate: formatEffectiveDate(item.FromDate),
    })),
  );

  const filteredAdvanceAppointments = computed(() => {
    const term = (advanceAppointmentFilter.value || '').toLowerCase().trim();
    if (!term) return appointmentRows.value;

    return appointmentRows.value.filter((item) =>
      SEARCH_FIELDS.some((key) => {
        const v = item[key];
        return v !== null && v !== undefined && v !== '' && String(v).toLowerCase().includes(term);
      }),
    );
  });

  const clearSelection = () => {
    selectedRows.value = [];
  };

  /* ------------------------------------------------------------------ */
  /* Confirmation dialog (hire / revert)                                 */
  /* ------------------------------------------------------------------ */
  const ACTION_CONFIG = {
    hire: {
      title: 'Confirm Permanent Hiring',
      icon: 'work',
      color: 'positive',
      confirmLabel: 'Confirm Hire',
      pastLabel: 'Hired',
      noPermission: 'You do not have permission to hire employees',
    },
    revert: {
      title: 'Confirm Revert',
      icon: 'undo',
      color: 'negative',
      confirmLabel: 'Confirm Revert',
      pastLabel: 'Reverted',
      noPermission: 'You do not have permission to revert temporary hires',
    },
  };

  const actionDialog = ref(false);
  const actionMode = ref('hire'); // 'hire' | 'revert'
  const actionEntries = ref([]);
  const actionLoading = ref(false);
  const actionProgress = ref({ current: 0, total: 0 });

  const currentAction = computed(() => ACTION_CONFIG[actionMode.value]);

  const progressLabel = computed(() =>
    actionMode.value === 'hire'
      ? `Hiring ${actionEntries.value.length} employee(s)...`
      : `Reverting ${actionProgress.value.current} of ${actionProgress.value.total}...`,
  );

  const progressValue = computed(() => {
    const { current, total } = actionProgress.value;
    return total ? current / total : 0;
  });

  /** Opens the confirmation for one row (action button) or many (selection). */
  const openActionDialog = (mode, rows) => {
    if (!canModifyAdvanceAppointment.value) {
      toast.error(ACTION_CONFIG[mode].noPermission);
      return;
    }
    if (!rows || rows.length === 0) {
      toast.warning('Please select at least one employee');
      return;
    }

    actionMode.value = mode;
    actionEntries.value = rows.map((row) => ({ ...row }));
    actionProgress.value = { current: 0, total: 0 };
    actionDialog.value = true;
  };

  /** Hire: ONE request for all entries -> POST /hire/applicant { hires: [...] } */
  const runHire = async (entries) => {
    const failures = [];
    const valid = [];

    entries.forEach((entry) => {
      if (entry.submission_id) valid.push(entry);
      else failures.push({ entry, reason: 'Missing submission_id' });
    });

    if (valid.length > 0) {
      const result = await jobPostStore.hireApplicant(valid.map((e) => e.submission_id));
      if (!result.success) {
        valid.forEach((entry) => failures.push({ entry, reason: result.message }));
      }
    }

    return failures;
  };

  /** Revert: one request per entry -> POST /hire/temporary/revert/{submissionId} */
  const revertTask = async (entry) => {
    if (!entry.submission_id) return { success: false, message: 'Missing submission_id' };
    return jobPostStore.revertTemporaryApplicant(entry.submission_id);
  };

  const confirmAction = async () => {
    const mode = actionMode.value;
    const config = ACTION_CONFIG[mode];

    if (!canModifyAdvanceAppointment.value) {
      toast.error(config.noPermission);
      return;
    }
    if (actionEntries.value.length === 0) return;

    const entries = [...actionEntries.value];
    actionLoading.value = true;

    const failures =
      mode === 'hire'
        ? await runHire(entries)
        : await runBatch(entries, actionProgress, revertTask);

    actionLoading.value = false;
    reportBatchResult(config.pastLabel, entries.length, failures);
    actionDialog.value = false;

    // Drop successfully processed rows from the selection; failed ones stay for retry
    const failedKeys = new Set(failures.map((f) => f.entry.ControlNo));
    const doneKeys = new Set(
      entries.filter((e) => !failedKeys.has(e.ControlNo)).map((e) => e.ControlNo),
    );
    selectedRows.value = selectedRows.value.filter((r) => !doneKeys.has(r.ControlNo));

    await refreshList();
  };

  /* ------------------------------------------------------------------ */
  /* Per-row report actions                                              */
  /* ------------------------------------------------------------------ */
  const editReportModal = ref(false);
  const reportRow = ref(null);

  const showAppointmentReportModal = ref(false);
  const appointmentReportData = ref(null);
  const appointmentReportLoadingRow = ref(null);

  const editAdvanceAppointment = async (row) => {
    try {
      const appointmentData = await usePlantilla.fetchTempAppointmentData(row.ControlNo);

      if (!appointmentData) {
        toast.error('No appointment data found for this employee');
        return;
      }

      reportRow.value = { ...row, appointmentData };
      editReportModal.value = true;
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      toast.error('Failed to fetch appointment data');
    }
  };

  const openAppointmentReport = async (row) => {
    appointmentReportLoadingRow.value = row.ControlNo;
    try {
      const appointmentData = await usePlantilla.fetchTempAppointmentData(row.ControlNo);

      if (!appointmentData) {
        toast.error('No appointment data found for this employee');
        return;
      }

      appointmentReportData.value = appointmentData;
      showAppointmentReportModal.value = true;
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      toast.error('Failed to fetch appointment data');
    } finally {
      appointmentReportLoadingRow.value = null;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Lifecycle                                                           */
  /* ------------------------------------------------------------------ */
  onMounted(async () => {
    try {
      await advanceAppointmentStore.fetchTempEmployeeList();
    } catch (error) {
      console.error('Error initializing component:', error);
      toast.error('Failed to load data. Please refresh the page.');
    }
  });
</script>

<style lang="scss" scoped>
  .advance-appointment-card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  /* ---------- Main table (scoped to its own class so the dialog isn't affected) ---------- */
  .appointments-table {
    :deep(.q-table__container),
    :deep(.q-table__middle) {
      overflow-x: hidden;
    }

    /* Fixed-width + wrapping for every column except the selection checkbox column */
    :deep(th:not(:first-child)),
    :deep(td:not(:first-child)) {
      max-width: 0;
      overflow: hidden;
      white-space: normal;
      word-break: break-word;
    }

    /* Selection column gets a real width so the checkbox is never clipped */
    :deep(thead tr th:first-child),
    :deep(tbody tr td:first-child) {
      width: 56px;
      min-width: 56px;
      max-width: none;
      overflow: visible;
      white-space: nowrap;
      padding: 4px 8px;
    }

    :deep(th) {
      padding-bottom: 8px;
    }
  }

  /* ---------- Confirmation dialog ---------- */
  .confirm-dialog {
    width: 820px;
    max-width: 95vw;
    max-height: 90vh;
  }

  .confirm-table {
    max-height: 340px;

    :deep(thead tr th) {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #fff;
      font-weight: 600;
    }

    :deep(td) {
      vertical-align: middle;
    }
  }

  /* ---------- Selection banner transition ---------- */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
