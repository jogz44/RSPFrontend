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
      <q-card style="width: 600px; max-width: 96vw; border-radius: 16px; overflow: hidden">
        <!-- ── Header ── -->
        <div class="add-dialog-header">
          <div class="row items-center q-gutter-sm">
            <div class="add-dialog-icon-wrap">
              <q-icon name="comment" color="white" size="20px" />
            </div>
            <div>
              <div class="text-subtitle1 text-bold text-white">Add New Remark</div>
              <div class="text-caption" style="color: rgba(255, 255, 255, 0.65)">
                Fill in the remark details below
              </div>
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="white" style="opacity: 0.75" v-close-popup />
        </div>

        <!-- ── Body ── -->
        <q-card-section
          class="q-pa-lg"
          style="max-height: 68vh; overflow-y: auto; background: #fff"
        >
          <!-- Step 1 — Remark Text -->
          <div class="add-section-block q-mb-lg">
            <div class="add-section-label">
              <q-icon name="edit_note" size="15px" class="q-mr-xs" />
              Remark Content
            </div>
            <q-input
              v-model="addForm.remarks"
              placeholder="Type your remark here..."
              outlined
              dense
              type="textarea"
              autogrow
              :input-style="{ minHeight: '90px', fontSize: '13.5px' }"
              :rules="[(v) => !!v || 'Remark is required']"
              class="add-remark-input"
            />
          </div>

          <!-- Step 2 — Category Selection -->
          <div class="add-section-block">
            <div class="add-section-label">
              <q-icon name="category" size="15px" class="q-mr-xs" />
              Select Category
              <span class="add-section-hint">— choose one or more</span>
            </div>

            <!-- Category Cards Grid -->
            <div class="category-card-grid">
              <div
                v-for="cat in categoryOptions"
                :key="cat.value"
                class="category-card"
                :class="{
                  'category-card--active': addForm.categories.includes(cat.value),
                  [`category-card--${cat.value.toLowerCase()}`]: true,
                }"
                @click="toggleCategory(cat.value)"
              >
                <div class="category-card-inner">
                  <div class="category-card-check">
                    <q-icon
                      :name="
                        addForm.categories.includes(cat.value)
                          ? 'check_circle'
                          : 'radio_button_unchecked'
                      "
                      :color="
                        addForm.categories.includes(cat.value)
                          ? getCategoryColor(cat.value)
                          : 'grey-4'
                      "
                      size="20px"
                    />
                  </div>
                  <div class="category-card-icon">
                    <q-icon
                      :name="getCategoryIcon(cat.value)"
                      size="22px"
                      :color="getCategoryColor(cat.value)"
                    />
                  </div>
                  <div class="category-card-label">{{ cat.label }}</div>
                </div>
              </div>
            </div>

            <!-- Validation -->
            <div v-if="addCategoryError" class="text-negative text-caption q-mt-sm q-ml-xs">
              <q-icon name="error_outline" size="13px" class="q-mr-xs" />
              Please select at least one category.
            </div>
          </div>
        </q-card-section>

        <!-- ── Summary Banner (shows when ready) ── -->
        <div v-if="addForm.categories.length > 0 && addForm.remarks" class="add-summary-bar">
          <q-icon name="info_outline" size="15px" class="q-mr-xs" style="opacity: 0.8" />
          <span>
            Will create
            <strong>{{ addForm.categories.length }}</strong>
            remark{{ addForm.categories.length > 1 ? 's' : '' }} under:
          </span>
          <q-badge
            v-for="cat in addForm.categories"
            :key="cat"
            :color="getCategoryColor(cat)"
            class="q-ml-xs"
            style="font-size: 10px; padding: 3px 7px"
          >
            {{ cat }}
          </q-badge>
        </div>

        <q-separator />

        <!-- ── Footer ── -->
        <q-card-actions align="right" class="q-px-lg q-py-md bg-grey-1">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="q-mr-xs" />
          <q-btn
            unelevated
            :label="
              addForm.categories.length > 1
                ? `Save ${addForm.categories.length} Remarks`
                : 'Save Remark'
            "
            color="primary"
            icon="save"
            :loading="store.loading"
            style="border-radius: 8px; min-width: 130px"
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

        // Validation flags
        addCategoryError: false,

        addForm: {
          categories: [], // <-- array for multi-checkbox
          remarks: '',
        },

        editForm: {
          category: '',
          remarks: '',
        },
      };
    },

    computed: {
      hasModifyPermission() {
        return this.authStore.user?.permissions?.modifyLibraryAccess === '1';
      },

      filteredRemarks() {
        let search = (this.globalSearch || '').toLowerCase().trim();
        let filtered = this.store.remarks || [];

        if (this.categoryFilter) {
          filtered = filtered.filter((r) => r.category === this.categoryFilter);
        }

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
        return [
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
      },
    },

    watch: {
      // Clear category error as soon as user selects at least one
      'addForm.categories'(val) {
        if (val.length > 0) {
          this.addCategoryError = false;
        }
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

      getCategoryIcon(category) {
        const icons = {
          EDUCATION: 'school',
          EXPERIENCE: 'work',
          TRAINING: 'fitness_center',
          ELIGIBILITY: 'verified',
        };
        return icons[category] || 'label';
      },

      toggleCategory(value) {
        const idx = this.addForm.categories.indexOf(value);
        if (idx === -1) {
          this.addForm.categories.push(value);
        } else {
          this.addForm.categories.splice(idx, 1);
        }
        if (this.addForm.categories.length > 0) {
          this.addCategoryError = false;
        }
      },

      openAddDialog() {
        this.addForm = { categories: [], remarks: '' };
        this.addCategoryError = false;
        this.addDialog = true;
      },

      /**
       * Submit Add — fires one API request per selected category.
       * e.g. if EDUCATION + TRAINING are checked → 2 requests.
       */
      async submitAdd() {
        // Validate categories
        if (this.addForm.categories.length === 0) {
          this.addCategoryError = true;
          this.$q.notify({
            type: 'negative',
            message: 'Please select at least one category.',
            position: 'top',
          });
          return;
        }

        // Validate remarks
        if (!this.addForm.remarks || !this.addForm.remarks.trim()) {
          this.$q.notify({
            type: 'negative',
            message: 'Remark is required.',
            position: 'top',
          });
          return;
        }

        try {
          // Fire one request per selected category
          const requests = this.addForm.categories.map((category) =>
            this.store.storeRemark({
              category,
              remarks: this.addForm.remarks.trim(),
            }),
          );

          await Promise.all(requests);

          const count = this.addForm.categories.length;
          this.$q.notify({
            type: 'positive',
            message:
              count > 1 ? `${count} remarks added successfully.` : 'Remark added successfully.',
            position: 'top',
          });

          this.addDialog = false;
          this.addForm = { categories: [], remarks: '' };
          this.addCategoryError = false;
        } catch (e) {
          this.$q.notify({
            type: 'negative',
            message: e?.response?.data?.message || 'Failed to add remark(s).',
            position: 'top',
          });
        }
      },

      editRemark(row) {
        this.selectedRemark = row;
        this.editForm = {
          category: row.category || '',
          remarks: row.remarks || '',
        };
        this.editDialog = true;
      },

      async submitEdit() {
        if (!this.editForm.category) {
          this.$q.notify({
            type: 'negative',
            message: 'Category is required.',
            position: 'top',
          });
          return;
        }

        if (!this.editForm.remarks || !this.editForm.remarks.trim()) {
          this.$q.notify({
            type: 'negative',
            message: 'Remark is required.',
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
  /* ── Page ── */
  .table-scroll-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
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

  /* ── Add Dialog Header ── */
  .add-dialog-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #43a047 0%, #5db461 100%);
    flex-shrink: 0;
  }

  .add-dialog-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* ── Section labels ── */
  .add-section-block {
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    padding: 14px 16px;
    background: #fafbfc;
  }

  .add-section-label {
    font-size: 11.5px;
    font-weight: 700;
    color: #607080;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
  }

  .add-section-hint {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    color: #aab0b8;
    margin-left: 4px;
    font-size: 11px;
  }

  .add-remark-input :deep(.q-field__control) {
    background: #fff;
    border-radius: 8px;
  }

  /* ── Category Cards ── */
  .category-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .category-card {
    border: 2px solid #e8eaed;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      background 0.18s;
    user-select: none;
  }

  .category-card:hover {
    border-color: #c0c8d0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  }

  .category-card--active {
    background: #f4f8ff;
    box-shadow: 0 2px 10px rgba(25, 118, 210, 0.12);
  }

  .category-card--education.category-card--active {
    border-color: #1976d2;
  }
  .category-card--experience.category-card--active {
    border-color: #43a047;
  }
  .category-card--training.category-card--active {
    border-color: #ef6c00;
  }
  .category-card--eligibility.category-card--active {
    border-color: #7b1fa2;
  }

  .category-card-inner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
  }

  .category-card-check {
    flex-shrink: 0;
  }

  .category-card-icon {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .category-card-label {
    font-size: 12.5px;
    font-weight: 600;
    color: #3a4550;
    letter-spacing: 0.02em;
  }

  /* ── Summary bar ── */
  .add-summary-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    padding: 10px 20px;
    background: #e8f4fd;
    font-size: 12px;
    color: #1565c0;
    border-top: 1px solid #c9e2f7;
  }
</style>
