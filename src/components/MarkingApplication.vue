<template>
  <q-dialog
    v-model="show"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card
      class="column"
      style="
        width: 100vw;
        max-width: 1500px;
        height: 90vh;
        display: flex;
        flex-direction: column;
        border-radius: 0;
        overflow: hidden;
      "
    >
      <!-- Header -->
      <q-card-section
        class="row items-center q-pb-none q-pt-md q-px-lg bg-white"
        style="flex-shrink: 0"
      >
        <q-icon name="assignment" color="primary" size="28px" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-bold text-grey-9">Mark Applications</div>
          <div class="text-caption text-grey-6">Tagging of Applications</div>
        </div>
        <q-space />
        <q-btn flat round icon="close" color="grey-7" @click="$emit('close')" />
      </q-card-section>

      <q-separator class="q-mt-md" style="flex-shrink: 0" />

      <!-- Tabs — full width justified -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        style="flex-shrink: 0"
      >
        <q-tab name="select" icon="checklist" label="Select Applicants" />
        <q-tab name="tag" icon="color_lens" label="Tag" :disable="selectedApplicants.length === 0">
          <q-badge
            v-if="selectedApplicants.length > 0"
            color="primary"
            floating
            rounded
            style="top: 4px; right: 4px; font-size: 10px"
          >
            {{ selectedApplicants.length }}
          </q-badge>
        </q-tab>
      </q-tabs>

      <q-separator style="flex-shrink: 0" />

      <!-- Tab Panels -->
      <q-tab-panels
        v-model="activeTab"
        animated
        style="flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden"
      >
        <!-- ── SELECT APPLICANTS TAB ── -->
        <q-tab-panel
          name="select"
          class="q-pa-none"
          style="
            flex: 1 1 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          "
        >
          <!-- Toolbar -->
          <div
            class="row items-center q-pa-md bg-grey-1"
            style="flex-shrink: 0; flex-wrap: wrap; gap: 8px"
          >
            <q-input
              v-model="searchText"
              dense
              outlined
              placeholder="Search by name or position..."
              style="width: 250px"
              clearable
              bg-color="white"
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="search" size="18px" color="grey-6" />
              </template>
            </q-input>

            <q-select
              v-model="selectedOfficeFilter"
              :options="filteredOfficeOptions"
              dense
              outlined
              clearable
              label="Filter by Office"
              style="min-width: 260px; flex: 1; max-width: 500px"
              bg-color="white"
              use-input
              fill-input
              hide-selected
              input-debounce="200"
              :disable="loading"
              @filter="filterOfficeOptions"
            >
              <template #prepend>
                <q-icon name="filter_list" size="18px" color="grey-6" />
              </template>
              <template #no-option>
                <q-item dense>
                  <q-item-section class="text-grey text-caption">No offices found</q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Applicant Status Filter -->
            <q-select
              v-model="applicantStatusFilter"
              :options="applicantStatusOptions"
              dense
              outlined
              label="Applicant Status"
              style="width: 200px"
              bg-color="white"
              emit-value
              map-options
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="person_outline" size="18px" color="grey-6" />
              </template>
            </q-select>

            <!-- Tag Color Filter -->
            <q-select
              v-model="tagColorFilter"
              :options="tagColorOptions"
              dense
              outlined
              clearable
              label="Tag Color"
              style="width: 180px"
              bg-color="white"
              emit-value
              map-options
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="color_lens" size="18px" color="grey-6" />
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <div
                      v-if="scope.opt.value !== 'none'"
                      class="color-circle"
                      :style="{ backgroundColor: scope.opt.value }"
                    ></div>
                    <div v-else class="color-circle color-circle-empty"></div>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template #selected>
                <div v-if="tagColorFilter" class="row items-center" style="gap: 8px">
                  <div
                    v-if="tagColorFilter !== 'none'"
                    class="color-circle"
                    :style="{ backgroundColor: tagColorFilter }"
                  ></div>
                  <div v-else class="color-circle color-circle-empty"></div>
                  <span>{{ getTagColorLabel(tagColorFilter) }}</span>
                </div>
                <span v-else>None</span>
              </template>
            </q-select>

            <q-space />

            <!-- Selected count chip -->
            <q-chip
              v-if="selectedApplicants.length > 0"
              dense
              color="primary"
              text-color="white"
              icon="check_circle"
            >
              {{ selectedApplicants.length }} selected
            </q-chip>
          </div>

          <!-- Table -->
          <div style="flex: 1 1 0; min-height: 0; overflow-y: auto; overflow-x: hidden">
            <!-- Skeleton rows while fetching data -->
            <div v-if="loading" class="column q-pa-md" style="gap: 10px">
              <div
                v-for="n in 12"
                :key="n"
                class="row items-center q-px-sm"
                style="gap: 10px; height: 32px"
              >
                <q-skeleton type="QCheckbox" size="16px" style="flex-shrink: 0" />
                <q-skeleton type="text" width="20%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="25%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="15%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="8%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="6%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="8%" height="12px" style="border-radius: 4px" />
              </div>
            </div>

            <q-table
              v-else
              flat
              dense
              :rows="filteredRows"
              :columns="columns"
              row-key="submission_id"
              v-model:selected="selectedApplicants"
              selection="multiple"
              :rows-per-page-options="[0]"
              hide-bottom
              wrap-cells
              class="applicants-table"
            >
              <template #body-cell-name="props">
                <q-td :props="props">{{ props.row.firstname }} {{ props.row.lastname }}</q-td>
              </template>

              <template #body-cell-tag_color="props">
                <q-td :props="props" class="text-center">
                  <div
                    v-if="props.row.tag_color"
                    class="color-circle"
                    :style="{ backgroundColor: props.row.tag_color }"
                    :title="getTagColorLabel(props.row.tag_color)"
                  ></div>
                  <span v-else class="text-grey-5 text-caption">—</span>
                </q-td>
              </template>

              <template #no-data>
                <div class="full-width column flex-center q-pa-xl text-grey-6">
                  <q-icon name="search_off" size="3rem" class="q-mb-sm" />
                  <div class="text-subtitle2">No applicants found</div>
                  <div class="text-caption">Try adjusting your filters</div>
                </div>
              </template>
            </q-table>
          </div>
        </q-tab-panel>

        <!-- ── TAG TAB ── -->
        <q-tab-panel
          name="tag"
          class="q-pa-none"
          style="
            flex: 1 1 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          "
        >
          <!-- Tagging overlay -->
          <q-inner-loading
            :showing="updatingTags"
            color="primary"
            label="Updating tags..."
            label-class="text-primary text-subtitle2"
            label-style="font-size: 1em"
          />

          <!-- Tag Toolbar -->
          <div class="row items-center q-px-md q-py-sm bg-grey-1" style="flex-shrink: 0; gap: 8px">
            <q-icon name="color_lens" color="primary" size="20px" />
            <div class="text-subtitle2 text-grey-8">
              Tag
              <span class="text-primary text-bold">{{ selectedApplicants.length }}</span>
              selected applicant(s)
            </div>
            <q-space />
            <q-btn
              flat
              dense
              size="sm"
              color="grey-7"
              icon="arrow_back"
              label="Back to Selection"
              @click="activeTab = 'select'"
            />
          </div>

          <!-- Tag Color Assignment Card -->
          <div class="q-px-md q-py-sm bg-grey-1" style="flex-shrink: 0">
            <div class="row items-center q-gutter-md">
              <div class="text-subtitle2 text-grey-8">Apply tag color to all selected:</div>
              <q-btn
                v-for="color in availableColors"
                :key="color.value"
                :style="{ backgroundColor: color.value, color: getContrastColor(color.value) }"
                :label="color.label"
                size="sm"
                dense
                unelevated
                :disable="selectedApplicants.length === 0 || updatingTags"
                @click="applyTagToAll(color.value)"
              >
                <q-tooltip>Apply {{ color.label }} tag to all selected applicants</q-tooltip>
              </q-btn>
              <q-btn
                color="grey"
                label="Clear All Tags"
                size="sm"
                dense
                flat
                :disable="selectedApplicants.length === 0 || !hasAnyTag || updatingTags"
                @click="clearAllTags"
              >
                <q-tooltip>Remove tags from all selected applicants</q-tooltip>
              </q-btn>
            </div>
          </div>

          <q-separator style="flex-shrink: 0" />

          <!-- Summary Cards -->
          <div
            class="row no-wrap q-px-md q-pb-md q-pt-sm q-gutter-sm bg-grey-1"
            style="flex-shrink: 0"
          >
            <q-card flat bordered class="summary-card col">
              <q-card-section class="q-pa-sm text-center">
                <div class="text-h5 text-primary text-bold">{{ selectedApplicants.length }}</div>
                <div class="text-caption text-grey-6">Total Selected</div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="summary-card col">
              <q-card-section class="q-pa-sm text-center">
                <div class="text-h5 text-positive text-bold">{{ internalCount }}</div>
                <div class="text-caption text-grey-6">Internal</div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="summary-card col">
              <q-card-section class="q-pa-sm text-center">
                <div class="text-h5 text-info text-bold">{{ externalCount }}</div>
                <div class="text-caption text-grey-6">External</div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="summary-card col">
              <q-card-section class="q-pa-sm text-center">
                <div class="text-h5 text-orange text-bold">{{ uniqueOffices }}</div>
                <div class="text-caption text-grey-6">Offices</div>
              </q-card-section>
            </q-card>
          </div>

          <q-separator style="flex-shrink: 0" />

          <!-- Tag Table -->
          <div style="flex: 1 1 0; min-height: 0; overflow-y: auto; overflow-x: hidden">
            <q-table
              flat
              dense
              :rows="selectedApplicants"
              :columns="tagColumns"
              row-key="submission_id"
              :rows-per-page-options="[0]"
              hide-bottom
              wrap-cells
              class="applicants-table"
            >
              <template #body-cell-name="props">
                <q-td :props="props">{{ props.row.firstname }} {{ props.row.lastname }}</q-td>
              </template>

              <template #body-cell-tag_color="props">
                <q-td :props="props" class="text-center">
                  <q-select
                    v-model="props.row.tag_color"
                    :options="tagSelectOptions"
                    dense
                    flat
                    borderless
                    emit-value
                    map-options
                    style="min-width: 100px"
                    :loading="updatingTagId === props.row.submission_id"
                    @update:model-value="(val) => updateTagColor(props.row, val)"
                  >
                    <template #selected>
                      <div class="row items-center" style="gap: 8px">
                        <div
                          v-if="props.row.tag_color"
                          class="color-circle"
                          :style="{ backgroundColor: props.row.tag_color }"
                        ></div>
                        <span>{{ getTagColorLabel(props.row.tag_color) || 'None' }}</span>
                      </div>
                    </template>
                    <template #option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <div
                            v-if="scope.opt.value"
                            class="color-circle"
                            :style="{ backgroundColor: scope.opt.value }"
                          ></div>
                          <div v-else class="color-circle color-circle-empty"></div>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-td>
              </template>

              <template #body-cell-remove="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    flat
                    round
                    dense
                    icon="remove_circle_outline"
                    color="negative"
                    size="sm"
                    @click="removeFromSelection(props.row)"
                  >
                    <q-tooltip>Remove from selection</q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <template #no-data>
                <div class="full-width column flex-center q-pa-xl text-grey-6">
                  <q-icon name="inbox" size="3rem" class="q-mb-sm" />
                  <div class="text-subtitle2">No applicants selected</div>
                  <q-btn
                    flat
                    color="primary"
                    label="Go select applicants"
                    @click="activeTab = 'select'"
                  />
                </div>
              </template>
            </q-table>
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- Footer -->
      <q-separator style="flex-shrink: 0" />
      <q-card-actions align="right" class="q-pa-md bg-white" style="flex-shrink: 0">
        <q-btn flat label="Close" color="grey-7" @click="$emit('close')" class="q-mr-sm" />
        <q-btn
          v-if="activeTab === 'select'"
          unelevated
          label="Tag Selected"
          color="primary"
          icon-right="color_lens"
          :disable="selectedApplicants.length === 0"
          @click="activeTab = 'tag'"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useMarkingStore } from 'stores/markingStore';
  import { useQuasar } from 'quasar';

  const $q = useQuasar();
  defineEmits(['close']);

  const props = defineProps({
    date: {
      type: String,
      required: true,
    },
  });

  const show = ref(true);
  const activeTab = ref('select');
  const searchText = ref('');
  const selectedOfficeFilter = ref(null);
  const selectedApplicants = ref([]);
  const loading = ref(false);
  const updatingTags = ref(false);
  const updatingTagId = ref(null);
  const allRows = ref([]);
  const filteredOfficeOptions = ref([]);

  const markingStore = useMarkingStore();

  const applicantStatusFilter = ref('all');
  const applicantStatusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Internal', value: 'INTERNAL' },
    { label: 'External', value: 'EXTERNAL' },
  ];

  // Available colors for tagging
  const availableColors = [
    { label: 'Green', value: 'green' },
    { label: 'Yellow', value: 'yellow' },
  ];

  // Tag select options (including None)
  const tagSelectOptions = computed(() => [{ label: 'None', value: null }, ...availableColors]);

  // Tag Color Filter options
  const tagColorFilter = ref(null);
  const tagColorOptions = computed(() => {
    const colors = [{ label: 'None', value: 'none' }];
    const existingColors = new Set();
    allRows.value.forEach((row) => {
      if (row.tag_color) {
        existingColors.add(row.tag_color);
      }
    });
    availableColors.forEach((color) => {
      if (existingColors.has(color.value)) {
        colors.push({ label: color.label, value: color.value });
      }
    });
    return colors;
  });

  // Helper function to get contrast text color
  const getContrastColor = (hexColor) => {
    const darkColors = ['red', 'blue', 'purple', 'green'];
    return darkColors.includes(hexColor) ? 'white' : 'black';
  };

  const getTagColorLabel = (value) => {
    if (!value) return 'None';
    const color = availableColors.find((c) => c.value === value);
    return color ? color.label : value;
  };

  // Check if any selected applicant has a tag
  const hasAnyTag = computed(() => {
    return selectedApplicants.value.some((app) => app.tag_color);
  });

  // Apply tag to all selected applicants
  const applyTagToAll = async (color) => {
    updatingTags.value = true;

    try {
      const submissionIds = selectedApplicants.value.map((app) => app.submission_id);
      await markingStore.updateTagColor(submissionIds, color);

      selectedApplicants.value.forEach((app) => {
        app.tag_color = color;
      });

      $q.notify({
        type: 'positive',
        message: `Applied ${getTagColorLabel(color)} tag to ${submissionIds.length} applicant(s)`,
        position: 'top',
        timeout: 2000,
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to update tags',
        position: 'top',
        timeout: 3000,
      });
    } finally {
      updatingTags.value = false;
    }
  };

  // Clear all tags from selected applicants
  const clearAllTags = async () => {
    updatingTags.value = true;

    try {
      const submissionIds = selectedApplicants.value.map((app) => app.submission_id);
      await markingStore.updateTagColor(submissionIds, null);

      selectedApplicants.value.forEach((app) => {
        app.tag_color = null;
      });

      $q.notify({
        type: 'info',
        message: `Cleared tags from ${submissionIds.length} applicant(s)`,
        position: 'top',
        timeout: 2000,
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to clear tags',
        position: 'top',
        timeout: 3000,
      });
    } finally {
      updatingTags.value = false;
    }
  };

  // Update individual tag color
  const updateTagColor = async (row, newColor) => {
    updatingTagId.value = row.submission_id;
    const oldColor = row.tag_color;

    try {
      await markingStore.updateTagColor([row.submission_id], newColor);
      row.tag_color = newColor;
      $q.notify({
        type: 'positive',
        message: `Tag updated for ${row.firstname} ${row.lastname}`,
        position: 'top',
        timeout: 1000,
      });
    } catch (error) {
      row.tag_color = oldColor;
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to update tag color',
        position: 'top',
        timeout: 2000,
      });
    } finally {
      updatingTagId.value = null;
    }
  };

  // Table columns for selection tab
  const columns = [
    {
      name: 'select',
      label: '',
      field: 'select',
      align: 'center',
      style: 'width: 5%',
      headerStyle: 'width: 7%',
    },
    {
      name: 'name',
      label: 'Name',
      field: 'name',
      align: 'left',
      sortable: true,
      style: 'width: 22%',
      headerStyle: 'width: 22%',
    },
    {
      name: 'Position',
      label: 'Position',
      field: 'Position',
      align: 'left',
      sortable: true,
      style: 'width: 25%',
      headerStyle: 'width: 25%',
    },
    {
      name: 'Office',
      label: 'Office',
      field: 'Office',
      align: 'left',
      sortable: true,
      style: 'width: 22%',
      headerStyle: 'width: 22%',
    },
    {
      name: 'ItemNo',
      label: 'Item No',
      field: 'ItemNo',
      align: 'center',
      sortable: true,
      style: 'width: 8%',
      headerStyle: 'width: 8%',
    },
    {
      name: 'SalaryGrade',
      label: 'SG',
      field: 'SalaryGrade',
      align: 'center',
      sortable: true,
      style: 'width: 6%',
      headerStyle: 'width: 6%',
    },
    {
      name: 'tag_color',
      label: 'Tag',
      field: 'tag_color',
      align: 'center',
      sortable: true,
      style: 'width: 7%',
      headerStyle: 'width: 7%',
    },
  ];

  // Tag columns (same as columns but without select and with remove)
  const tagColumns = [
    {
      name: 'name',
      label: 'Name',
      field: 'name',
      align: 'left',
      sortable: true,
      style: 'width: 25%',
      headerStyle: 'width: 25%',
    },
    {
      name: 'Position',
      label: 'Position',
      field: 'Position',
      align: 'left',
      sortable: true,
      style: 'width: 28%',
      headerStyle: 'width: 28%',
    },
    {
      name: 'Office',
      label: 'Office',
      field: 'Office',
      align: 'left',
      sortable: true,
      style: 'width: 25%',
      headerStyle: 'width: 25%',
    },
    {
      name: 'ItemNo',
      label: 'Item No',
      field: 'ItemNo',
      align: 'center',
      sortable: true,
      style: 'width: 8%',
      headerStyle: 'width: 8%',
    },
    {
      name: 'SalaryGrade',
      label: 'SG',
      field: 'SalaryGrade',
      align: 'center',
      sortable: true,
      style: 'width: 6%',
      headerStyle: 'width: 6%',
    },
    {
      name: 'tag_color',
      label: 'Tag',
      field: 'tag_color',
      align: 'center',
      sortable: true,
      style: 'width: 8%',
      headerStyle: 'width: 8%',
    },
    {
      name: 'remove',
      label: '',
      field: 'remove',
      align: 'center',
      style: 'width: 5%',
      headerStyle: 'width: 5%',
    },
  ];

  // Office options from data
  const officeOptions = computed(() =>
    [...new Set(allRows.value.map((r) => r.Office).filter(Boolean))].sort(),
  );

  // Filtered rows based on search, office, applicant status, and tag color
  const filteredRows = computed(() => {
    const search = searchText.value?.toLowerCase().trim() ?? '';

    return allRows.value.filter((row) => {
      const fullName = `${row.firstname || ''} ${row.lastname || ''}`.toLowerCase();
      const matchSearch =
        !search || fullName.includes(search) || (row.Position || '').toLowerCase().includes(search);

      const matchOffice = !selectedOfficeFilter.value || row.Office === selectedOfficeFilter.value;

      const matchStatus =
        applicantStatusFilter.value === 'all' ||
        row.applicant_status === applicantStatusFilter.value;

      const matchTagColor =
        !tagColorFilter.value ||
        (tagColorFilter.value === 'none' ? !row.tag_color : row.tag_color === tagColorFilter.value);

      return matchSearch && matchOffice && matchStatus && matchTagColor;
    });
  });

  const internalCount = computed(
    () => selectedApplicants.value.filter((a) => a.applicant_status === 'INTERNAL').length,
  );
  const externalCount = computed(
    () => selectedApplicants.value.filter((a) => a.applicant_status === 'EXTERNAL').length,
  );
  const uniqueOffices = computed(() => new Set(selectedApplicants.value.map((a) => a.Office)).size);

  // Filter offices for dropdown
  const filterOfficeOptions = (val, update) => {
    update(() => {
      if (!val.trim()) {
        filteredOfficeOptions.value = officeOptions.value;
      } else {
        const needle = val.toLowerCase();
        filteredOfficeOptions.value = officeOptions.value.filter((o) =>
          o.toLowerCase().includes(needle),
        );
      }
    });
  };

  const removeFromSelection = (row) => {
    selectedApplicants.value = selectedApplicants.value.filter(
      (r) => r.submission_id !== row.submission_id,
    );
    if (selectedApplicants.value.length === 0) activeTab.value = 'select';
  };

  // Load data on mount
  onMounted(async () => {
    loading.value = true;
    try {
      await markingStore.fetchQualifiedReports(props.date);
      allRows.value = markingStore.reports;
      filteredOfficeOptions.value = [...officeOptions.value];
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Failed to load qualified applicants',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  });

  // Reset selection when data changes
  watch(
    () => markingStore.reports,
    () => {
      selectedApplicants.value = [];
    },
  );
</script>

<style scoped>
  /* Color circle styles */
  .color-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-block;
    margin: 0 auto;
  }

  .color-circle-empty {
    background-color: transparent;
    border: 1px solid #ccc;
  }

  .applicants-table :deep(thead tr th:first-child) {
    text-align: center !important;
    padding-left: 0 !important;
    width: 40px !important;
  }

  .applicants-table :deep(thead tr th:first-child .q-checkbox) {
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .applicants-table :deep(tbody tr td:first-child) {
    text-align: center !important;
    width: 40px !important;
  }

  .applicants-table :deep(tbody tr td:first-child .q-checkbox) {
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .applicants-table :deep(thead tr th) {
    font-size: 12px;
    font-weight: 700;
    color: #616161;
    background: #fafafa;
    border-bottom: 2px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 2;
    text-align: center !important;
  }

  .applicants-table :deep(tbody tr td:nth-child(2)) {
    text-align: left;
  }

  .applicants-table :deep(tbody tr td:nth-child(3)) {
    text-align: left;
  }

  .applicants-table :deep(tbody tr td:nth-child(4)) {
    text-align: left;
  }

  .applicants-table :deep(tbody tr td:nth-child(5)) {
    text-align: center !important;
  }

  .applicants-table :deep(tbody tr td:nth-child(6)) {
    text-align: center !important;
  }

  .applicants-table :deep(tbody tr td:nth-child(7)) {
    text-align: center !important;
  }

  .applicants-table :deep(tbody tr:hover td) {
    background: #f1f8ff;
  }

  .applicants-table :deep(tbody tr td) {
    font-size: 13px;
    color: #37474f;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }

  .applicants-table :deep(.q-table__container) {
    overflow-x: hidden !important;
  }

  .applicants-table :deep(.q-table__middle) {
    overflow-x: hidden !important;
  }

  .applicants-table :deep(table) {
    table-layout: fixed;
    width: 100%;
  }

  .applicants-table :deep(.q-table__bottom) {
    display: none;
  }

  .summary-card {
    border-radius: 8px !important;
    min-width: 80px;
  }
</style>
