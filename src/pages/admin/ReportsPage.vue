<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="q-mb-md">
      <h5 class="text-h5 q-ma-none"><b>Rater Management</b></h5>
      <q-breadcrumbs class="q-mt-sm">
        <template v-slot:separator>
          <q-icon size="1.2em" name="arrow_forward" />
        </template>
        <q-breadcrumbs-el icon="assignment_ind" label="Rater Management" />
        <q-breadcrumbs-el icon="assessment" label="Reports" />
      </q-breadcrumbs>
    </div>

    <!-- Reports Table -->
    <q-table :rows="reports" :columns="columns" row-key="id" :pagination="pagination">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn round dense color="primary" icon="edit" size="sm" @click="handleAction(props.row)">
            <q-tooltip>Generate Reports</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
  export default {
    name: 'ReportManagementPage',

    data() {
      return {
        columns: [
          {
            name: 'id',
            label: 'ID',
            align: 'left',
            field: 'id',
            sortable: true,
          },
          {
            name: 'name',
            label: 'Report Name',
            align: 'left',
            field: 'name',
            sortable: true,
          },
          {
            name: 'description',
            label: 'Description',
            align: 'left',
            field: 'description',
            sortable: true,
          },
          {
            name: 'actions',
            label: 'Actions',
            align: 'center',
            field: 'actions',
            sortable: false,
          },
        ],

        reports: [
          {
            id: 1,
            name: 'Applicant',
            description: 'Reports for all the applicant',
          },
          {
            id: 2,
            name: 'Schedule ',
            description: 'Reports for scheduled interview',
          },
        ],

        pagination: {
          rowsPerPage: 10,
        },
      };
    },

    methods: {
      handleAction(row) {
        console.log('Action clicked for:', row);
      },
    },
  };
</script>

<style scoped></style>
