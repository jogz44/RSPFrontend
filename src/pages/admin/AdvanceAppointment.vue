<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12">
        <q-card>
          <q-scroll-area class="q-pa-sm" style="height: 89vh">
            <!-- Title Bar - matches Structure Title bar styling on the Plantilla page -->
            <q-card flat class="row justify-between items-center q-pa-sm">
              <div class="text-h6 text-bold" style="width: 500px">List of Advance Appointment</div>
            </q-card>

            <!-- Advance Appointment Table -->
            <q-card flat class="advance-appointment-card">
              <q-separator />

              <q-card-section>
                <div class="row justify-between items-center q-mb-md">
                  <q-input
                    dense
                    outlined
                    v-model="advanceAppointmentFilter"
                    placeholder="Search employee..."
                    style="max-width: 300px"
                  >
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                  <div class="text-caption text-grey-8">
                    {{ filteredAdvanceAppointments.length }} record(s)
                  </div>
                </div>

                <q-table
                  flat
                  bordered
                  :rows="filteredAdvanceAppointments"
                  :columns="advanceAppointmentColumns"
                  row-key="ControlNo"
                  :loading="advanceAppointmentStore.loading"
                  :pagination="advanceAppointmentPagination"
                  v-model:pagination="advanceAppointmentPagination"
                  :rows-per-page-options="[5, 10, 25, 50]"
                >
                  <!-- Loading State - Shows loading overlay -->
                  <template v-slot:loading>
                    <q-inner-loading showing color="primary" size="40px" />
                  </template>

                  <!-- Custom Cell Rendering for Name Column -->
                  <template v-slot:body-cell-name="props">
                    <q-td :props="props">
                      {{ props.row.Surname }}, {{ props.row.Firstname }}
                      {{ props.row.MIddlename || '' }}
                    </q-td>
                  </template>

                  <!-- Custom Cell Rendering for Effective Date Column -->
                  <template v-slot:body-cell-effectiveDate="props">
                    <q-td :props="props">
                      {{ props.row.FromDate }}
                    </q-td>
                  </template>

                  <!-- Custom Cell Rendering for Pages Column -->
                  <template v-slot:body-cell-pages="props">
                    <q-td :props="props">
                      {{ props.row.Pages || '1' }}
                    </q-td>
                  </template>

                  <!-- Action Column -->
                  <template v-slot:body-cell-action="props">
                    <q-td :props="props" class="q-gutter-x-sm">
                      <!-- Edit Reports button - only if user has modify permission -->
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

                      <!-- Print Reports button - only if user has report permission -->
                      <q-btn
                        v-if="canReportAdvanceAppointment"
                        flat
                        dense
                        round
                        color="black"
                        class="bg-grey-4"
                        icon="print"
                        @click="printAdvanceAppointment(props.row)"
                      >
                        <q-tooltip>Print Reports</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>

                  <!-- No Data with Loading State -->
                  <template v-slot:no-data>
                    <div
                      v-if="advanceAppointmentStore.loading"
                      class="text-center q-pa-xl full-width"
                    >
                      <q-spinner color="primary" size="3em" />
                      <p class="text-h6 text-grey-8 q-mt-md">Loading advance appointments...</p>
                    </div>
                    <div v-else class="text-center q-pa-xl full-width">
                      <q-icon name="info" size="3em" color="grey-7" />
                      <p class="text-h6 text-grey-8 q-mt-md">No advance appointments found</p>
                    </div>
                  </template>

                  <!-- Custom Bottom Pagination -->
                  <template v-slot:bottom="props">
                    <div class="row justify-between items-center q-pa-sm full-width">
                      <div class="text-caption text-grey-8">
                        Showing page {{ props.pagination.page }} of
                        {{ Math.ceil(props.filteredRowsCount / props.pagination.rowsPerPage) || 1 }}
                      </div>
                      <div class="row items-center q-gutter-sm">
                        <q-btn
                          flat
                          round
                          dense
                          icon="chevron_left"
                          :disable="props.pagination.page === 1 || advanceAppointmentStore.loading"
                          @click="props.pagination.page--"
                        />
                        <span class="q-mx-sm">
                          Page {{ props.pagination.page }} /
                          {{
                            Math.ceil(props.filteredRowsCount / props.pagination.rowsPerPage) || 1
                          }}
                        </span>
                        <q-btn
                          flat
                          round
                          dense
                          icon="chevron_right"
                          :disable="
                            props.pagination.page >=
                              Math.ceil(props.filteredRowsCount / props.pagination.rowsPerPage) ||
                            advanceAppointmentStore.loading
                          "
                          @click="props.pagination.page++"
                        />
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-scroll-area>
        </q-card>
      </div>
    </div>

    <!-- Reports Modal -->
    <q-dialog v-model="showReportModal" persistent>
      <Reports v-model="showReportModal" :employee="reportRow" @close="showReportModal = false" />
    </q-dialog>

    <!-- Edit Reports Modal -->
    <q-dialog v-model="editReportModal" persistent>
      <EditReports
        v-model="editReportModal"
        :employee="reportRow"
        @close="editReportModal = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import Reports from 'src/components/Reports/TabModal.vue';
  import EditReports from 'src/components/Reports/EditTabModal.vue';
  import { useAuthStore } from 'stores/authStore';
  import { usePlantillaStore } from 'stores/plantillaStore';
  import { useAdvanceAppointmentStore } from 'stores/advanceAppointmentStore';
  import { toast } from 'src/boot/toast';

  const authStore = useAuthStore();
  const usePlantilla = usePlantillaStore();
  const advanceAppointmentStore = useAdvanceAppointmentStore();

  // Permission checks for Advance Appointment module
  const canModifyAdvanceAppointment = computed(() => {
    return authStore.user?.permissions?.modifyAdvanceAppointmentAccess === '1';
  });

  const canReportAdvanceAppointment = computed(() => {
    return authStore.user?.permissions?.reportAdvanceAppointmentAccess === '1';
  });

  const advanceAppointmentFilter = ref('');
  const showReportModal = ref(false);
  const editReportModal = ref(false);
  const reportRow = ref(null);

  const advanceAppointmentPagination = ref({
    page: 1,
    rowsPerPage: 10,
  });

  const advanceAppointmentColumns = [
    {
      name: 'pages',
      label: 'Page No.',
      field: 'Pages',
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
      style: 'width: 22%',
    },
    {
      name: 'Designation',
      label: 'Designation',
      field: 'Designation',
      align: 'left',
      sortable: true,
      style: 'width: 22%',
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
    {
      name: 'action',
      label: 'Action',
      field: 'action',
      align: 'center',
      style: 'width: 10%',
    },
  ];

  const filteredAdvanceAppointments = computed(() => {
    if (
      !advanceAppointmentStore.employeeList ||
      advanceAppointmentStore.employeeList.length === 0
    ) {
      return [];
    }

    let filtered = advanceAppointmentStore.employeeList.map((item) => ({
      ...item,
      name: `${item.Surname}, ${item.Firstname} ${item.MIddlename || ''}`,
      effectiveDate: item.FromDate,
    }));

    if (advanceAppointmentFilter.value) {
      const searchTerm = advanceAppointmentFilter.value.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.Surname?.toLowerCase().includes(searchTerm) ||
          item.Firstname?.toLowerCase().includes(searchTerm) ||
          item.name?.toLowerCase().includes(searchTerm) ||
          item.Designation?.toLowerCase().includes(searchTerm) ||
          item.Office?.toLowerCase().includes(searchTerm) ||
          item.ControlNo?.toLowerCase().includes(searchTerm) ||
          item.Pages?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return filtered;
  });

  const editAdvanceAppointment = async (row) => {
    try {
      const appointmentData = await usePlantilla.fetchAppointmentData(row.ControlNo);

      if (appointmentData) {
        reportRow.value = {
          ...row,
          appointmentData: appointmentData,
        };
        editReportModal.value = true;
      } else {
        toast.error('No appointment data found for this employee');
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      toast.error('Failed to fetch appointment data');
    }
  };

  const printAdvanceAppointment = async (row) => {
    try {
      const appointmentData = await usePlantilla.fetchAppointmentData(row.ControlNo);

      if (appointmentData) {
        reportRow.value = {
          ...row,
          appointmentData: appointmentData,
        };
        showReportModal.value = true;
      } else {
        toast.error('No appointment data found for this employee');
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      toast.error('Failed to fetch appointment data');
    }
  };

  onMounted(async () => {
    try {
      await advanceAppointmentStore.fetchEmployeeList();
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

  :deep(.q-table__container) {
    overflow-x: hidden;
  }

  :deep(.q-table__middle) {
    overflow-x: hidden;
  }

  :deep(.q-table td),
  :deep(.q-table th) {
    white-space: normal;
    word-break: break-word;
  }

  :deep(.q-table th) {
    white-space: normal;
    padding-bottom: 8px;
  }

  :deep(.q-field--outlined) {
    padding: 0;
    margin-top: 4px;
  }

  /* Ensure the table uses the column widths properly */
  :deep(.q-table th),
  :deep(.q-table td) {
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
