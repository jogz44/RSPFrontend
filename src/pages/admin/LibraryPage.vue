<template>
  <q-page class="q-pa-md">
    <!-- ── Page Header ─────────────────────────────────────────────── -->
    <div class="column items-start justify-center q-mb-md">
      <h5 class="text-h5 q-ma-none"><b>Remarks</b></h5>
      <div class="q-pa-md q-gutter-sm">
        <q-breadcrumbs class="q-ma-none">
          <template #separator>
            <q-icon size="1.2em" name="arrow_forward" />
          </template>
          <q-breadcrumbs-el icon="library_books" label="Library" />
          <q-breadcrumbs-el icon="comment" label="Remarks" />
        </q-breadcrumbs>
      </div>
    </div>

    <!-- ── Filters / Toolbar ───────────────────────────────────────── -->
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-input v-model="globalSearch" outlined dense placeholder="Search remarks..." clearable>
          <template #prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-select
          v-model="categoryFilter"
          :options="categoryOptions"
          outlined
          dense
          label="Filter by category"
          clearable
          emit-value
          map-options
        >
          <template #prepend>
            <q-icon name="category" color="primary" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-6 flex justify-end">
        <q-btn
          v-if="hasModifyPermission"
          rounded
          unelevated
          color="primary"
          icon="add"
          @click="openAddDialog"
        >
          <span class="gt-xs q-ml-xs">Add Remark</span>
        </q-btn>
      </div>
    </div>

    <!-- ── Main Table ────────────────────────────────────────────────── -->
    <div class="table-scroll-wrapper">
      <q-table
        :rows="filteredRemarks"
        :columns="columns"
        row-key="remarks_id"
        v-model:pagination="pagination"
        :rows-per-page-options="[10, 20, 50, 100, 200]"
        :loading="store.loading"
        flat
        wrap-cells
      >
        <template #body-cell-category="props">
          <q-td :props="props">
            <q-badge :color="getCategoryColor(props.row.category)" class="category-badge">
              {{ props.row.category || 'N/A' }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-action="p">
          <q-td :props="p">
            <!-- Edit button - only if has modify permission -->
            <q-btn
              v-if="hasModifyPermission"
              flat
              round
              dense
              color="green"
              class="bg-green-1"
              icon="edit"
              @click="editRemark(p.row)"
            >
              <q-tooltip>Update</q-tooltip>
            </q-btn>

            <!-- Delete button - only if has modify permission -->
            <q-btn
              v-if="hasModifyPermission"
              flat
              round
              dense
              color="red"
              class="bg-red-1"
              icon="delete"
              @click="deleteRemark(p.row.remarks_id)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>

            <!-- Read-only indicator for users without modify permission -->
            <q-badge v-if="!hasModifyPermission" outline color="blue" class="read-only-badge">
              <q-icon name="visibility" size="12px" class="q-mr-xs" />
              Read Only
            </q-badge>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-md text-grey">No Remarks Found</div>
        </template>
      </q-table>
    </div>

    <!-- ================================================================
         ADD DIALOG
         ================================================================ -->
    <q-dialog
      v-model="addDialog"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card style="width: 560px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="dialog-header-light">
          <q-icon name="comment" color="primary" size="24px" class="q-mr-sm gt-xs" />
          <div>
            <div class="text-h6 text-bold text-grey-9">Add Remark</div>
            <div class="text-caption text-grey-6">Fill in the details below</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg" style="max-height: 65vh; overflow-y: auto">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="addForm.category"
                label="Category *"
                outlined
                dense
                :options="categoryOptions"
                emit-value
                map-options
                :rules="[(v) => !!v || 'Category is required']"
              >
                <template #prepend><q-icon name="category" size="18px" /></template>
              </q-select>
            </div>

            <div class="col-12">
              <q-input
                v-model="addForm.remarks"
                label="Remark *"
                outlined
                dense
                type="textarea"
                autogrow
                :input-style="{ minHeight: '80px' }"
                :rules="[(v) => !!v || 'Remark is required']"
              >
                <template #prepend><q-icon name="comment" size="18px" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-lg q-py-sm bg-grey-1">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Save"
            color="primary"
            icon="save"
            :loading="store.loading"
            @click="submitAdd"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ================================================================
         EDIT DIALOG
         ================================================================ -->
    <q-dialog
      v-model="editDialog"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card style="width: 560px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none q-pt-md q-px-lg">
          <div class="row items-center q-gutter-sm">
            <q-icon name="comment" color="primary" size="22px" />
            <div>
              <div class="text-subtitle1 text-bold text-grey-9">Edit Remark</div>
              <div class="text-caption text-grey-5">
                Remarks ID: {{ selectedRemark?.remarks_id || 'N/A' }}
              </div>
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>

        <q-separator class="q-mt-sm" />

        <q-card-section class="q-pa-lg" style="max-height: 65vh; overflow-y: auto">
          <div
            class="text-caption text-uppercase text-grey-5 text-bold q-mb-md"
            style="letter-spacing: 0.06em"
          >
            <q-icon name="edit" size="13px" class="q-mr-xs" />
            Edit remark details
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="editForm.category"
                label="Category *"
                outlined
                dense
                :options="categoryOptions"
                emit-value
                map-options
                :rules="[(v) => !!v || 'Category is required']"
              >
                <template #prepend><q-icon name="category" size="18px" /></template>
              </q-select>
            </div>

            <div class="col-12">
              <q-input
                v-model="editForm.remarks"
                label="Remark *"
                outlined
                dense
                type="textarea"
                autogrow
                :input-style="{ minHeight: '80px' }"
                :rules="[(v) => !!v || 'Remark is required']"
              >
                <template #prepend><q-icon name="comment" size="18px" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-lg q-py-sm bg-grey-1">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Save changes"
            color="primary"
            icon="save"
            :loading="store.loading"
            @click="submitEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
  import { useRemarkStore } from 'src/stores/remarkStore';
  import { useAuthStore } from 'src/stores/authStore';

  export default {
    name: 'LibraryRemarksPage',

    setup() {
      const store = useRemarkStore();
      const authStore = useAuthStore();
      return { store, authStore };
    },

    data() {
      return {
        globalSearch: '',
        categoryFilter: null,
        categoryOptions: [
          { label: 'EDUCATION', value: 'EDUCATION' },
          { label: 'EXPERIENCE', value: 'EXPERIENCE' },
          { label: 'TRAINING', value: 'TRAINING' },
          { label: 'ELIGIBILITY', value: 'ELIGIBILITY' },
        ],
        pagination: {
          sortBy: 'remarks',
          descending: false,
          page: 1,
          rowsPerPage: 10,
        },

        addDialog: false,
        editDialog: false,
        selectedRemark: null,

        addForm: {
          category: '',
          remarks: '',
        },

        editForm: {
          category: '',
          remarks: '',
        },
      };
    },

    computed: {
      // Check if user has modify permission
      hasModifyPermission() {
        return this.authStore.user?.permissions?.modifyLibraryAccess === '1';
      },

      filteredRemarks() {
        let search = (this.globalSearch || '').toLowerCase().trim();
        let filtered = this.store.remarks || [];

        // Apply category filter
        if (this.categoryFilter) {
          filtered = filtered.filter((r) => r.category === this.categoryFilter);
        }

        // Apply search filter
        if (search) {
          filtered = filtered.filter((r) => {
            return [r.remarks, r.category, r.created_at]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(search));
          });
        }

        return filtered;
      },

      columns() {
        const cols = [
          {
            name: 'remarks',
            label: 'Remark',
            align: 'left',
            field: 'remarks',
            sortable: true,
          },
          {
            name: 'category',
            label: 'Category',
            align: 'left',
            field: 'category',
            sortable: true,
          },
          {
            name: 'action',
            label: this.hasModifyPermission ? 'Action' : 'Access',
            align: 'center',
            field: 'action',
            sortable: false,
          },
        ];

        return cols;
      },
    },

    methods: {
      getCategoryColor(category) {
        const colors = {
          EDUCATION: 'blue',
          EXPERIENCE: 'green',
          TRAINING: 'orange',
          ELIGIBILITY: 'purple',
        };
        return colors[category] || 'primary';
      },

      editRemark(row) {
        this.selectedRemark = row;
        this.editForm = {
          category: row.category || '',
          remarks: row.remarks || '',
        };
        this.editDialog = true;
      },

      openAddDialog() {
        this.addForm = { category: '', remarks: '' };
        this.addDialog = true;
      },

      async submitAdd() {
        if (!this.addForm.category) {
          this.$q.notify({
            type: 'negative',
            message: 'Category is required',
            position: 'top',
          });
          return;
        }

        if (!this.addForm.remarks) {
          this.$q.notify({
            type: 'negative',
            message: 'Remark is required',
            position: 'top',
          });
          return;
        }

        try {
          await this.store.storeRemark(this.addForm);
          this.$q.notify({
            type: 'positive',
            message: 'Remark added successfully.',
            position: 'top',
          });
          this.addDialog = false;
          // Reset form
          this.addForm = { category: '', remarks: '' };
        } catch (e) {
          this.$q.notify({
            type: 'negative',
            message: e?.response?.data?.message || 'Failed to add remark.',
            position: 'top',
          });
        }
      },

      async submitEdit() {
        if (!this.editForm.category) {
          this.$q.notify({
            type: 'negative',
            message: 'Category is required',
            position: 'top',
          });
          return;
        }

        if (!this.editForm.remarks) {
          this.$q.notify({
            type: 'negative',
            message: 'Remark is required',
            position: 'top',
          });
          return;
        }

        try {
          await this.store.updateRemark(this.selectedRemark.remarks_id, this.editForm);
          this.$q.notify({
            type: 'positive',
            message: 'Remark updated successfully.',
            position: 'top',
          });
          this.editDialog = false;
        } catch (e) {
          this.$q.notify({
            type: 'negative',
            message: e?.response?.data?.message || 'Failed to update remark.',
            position: 'top',
          });
        }
      },

      deleteRemark(remarksId) {
        this.$q
          .dialog({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this remark?',
            cancel: true,
            persistent: true,
          })
          .onOk(async () => {
            try {
              await this.store.deleteRemark(remarksId);
              this.$q.notify({
                type: 'positive',
                message: 'Remark deleted successfully.',
                position: 'top',
              });
            } catch (error) {
              this.$q.notify({
                type: 'negative',
                message: error?.response?.data?.message || 'Failed to delete remark.',
                position: 'top',
              });
            }
          });
      },
    },

    mounted() {
      this.store.fetchRemarks();
    },
  };
</script>

<style scoped>
  .table-scroll-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dialog-header-light {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    flex-shrink: 0;
  }

  .dialog-footer {
    background: #fff;
    flex-shrink: 0;
  }

  .category-badge {
    padding: 4px 8px;
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  .read-only-badge {
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 500;
  }
</style>
