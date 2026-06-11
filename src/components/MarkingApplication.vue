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
        height: 100dvh;
        display: flex;
        flex-direction: column;
        border-radius: 0;
        overflow: hidden;
      "
    >
      <!-- Header -->
      <q-card-section
        class="row items-center q-pb-none q-pt-sm q-px-md bg-white"
        style="flex-shrink: 0"
      >
        <q-icon name="assignment" color="primary" size="24px" class="q-mr-sm gt-xs" />
        <div>
          <div class="text-subtitle1 text-bold text-grey-9">Mark Applications</div>
          <div class="text-caption text-grey-6">Tagging of Applications</div>
        </div>
        <q-space />
        <q-btn flat round icon="close" color="grey-7" @click="$emit('close')" />
      </q-card-section>

      <q-separator class="q-mt-sm" style="flex-shrink: 0" />

      <!-- Tabs -->
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
          <!-- Toolbar — stacks on mobile -->
          <div class="q-pa-sm bg-grey-1" style="flex-shrink: 0">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <!-- Search -->
              <q-input
                v-model="searchText"
                dense
                outlined
                placeholder="Search name or position..."
                class="col-12 col-sm"
                clearable
                bg-color="white"
                :disable="loading"
              >
                <template #prepend>
                  <q-icon name="search" size="16px" color="grey-6" />
                </template>
              </q-input>

              <!-- Office filter -->
              <q-select
                v-model="selectedOfficeFilter"
                :options="filteredOfficeOptions"
                dense
                outlined
                clearable
                label="Office"
                class="col-12 col-sm"
                style="min-width: 0"
                bg-color="white"
                use-input
                fill-input
                hide-selected
                input-debounce="200"
                :disable="loading"
                @filter="filterOfficeOptions"
              >
                <template #prepend>
                  <q-icon name="filter_list" size="16px" color="grey-6" />
                </template>
                <template #no-option>
                  <q-item dense>
                    <q-item-section class="text-grey text-caption">No offices found</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="row items-center q-gutter-xs">
              <!-- Status filter -->
              <q-select
                v-model="applicantStatusFilter"
                :options="applicantStatusOptions"
                dense
                outlined
                label="Status"
                class="col-12 col-sm"
                style="min-width: 0"
                bg-color="white"
                emit-value
                map-options
                :disable="loading"
              >
                <template #prepend>
                  <q-icon name="person_outline" size="16px" color="grey-6" />
                </template>
              </q-select>

              <!-- Tag Color filter -->
              <q-select
                v-model="tagColorFilter"
                :options="tagColorOptions"
                dense
                outlined
                clearable
                label="Tag Color"
                class="col-12 col-sm"
                style="min-width: 0"
                bg-color="white"
                emit-value
                map-options
                :disable="loading"
              >
                <template #prepend>
                  <q-icon name="color_lens" size="16px" color="grey-6" />
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar style="min-width: 28px">
                      <div
                        v-if="scope.opt.value && scope.opt.value !== 'none'"
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
                <!-- FIX: selected slot now uses display:flex with nowrap to prevent label overlay -->
                <template #selected-item>
                  <div
                    v-if="tagColorFilter"
                    class="row no-wrap items-center"
                    style="gap: 6px; overflow: hidden"
                  >
                    <div
                      v-if="tagColorFilter !== 'none'"
                      class="color-circle flex-shrink-0"
                      :style="{ backgroundColor: tagColorFilter }"
                    ></div>
                    <div v-else class="color-circle color-circle-empty flex-shrink-0"></div>
                    <span class="ellipsis">{{ getTagColorLabel(tagColorFilter) }}</span>
                  </div>
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
                class="q-ml-xs"
              >
                {{ selectedApplicants.length }} selected
              </q-chip>
            </div>
          </div>

          <!-- Table (desktop) / Cards (mobile) -->
          <div style="flex: 1 1 0; min-height: 0; overflow-y: auto; overflow-x: hidden">
            <!-- Skeleton -->
            <div v-if="loading" class="column q-pa-sm" style="gap: 8px">
              <div
                v-for="n in 10"
                :key="n"
                class="row items-center q-px-sm"
                style="gap: 10px; height: 32px"
              >
                <q-skeleton type="QCheckbox" size="16px" style="flex-shrink: 0" />
                <q-skeleton type="text" width="22%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="25%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="18%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="8%" height="12px" style="border-radius: 4px" />
                <q-skeleton type="text" width="6%" height="12px" style="border-radius: 4px" />
              </div>
            </div>

            <!-- Desktop table -->
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
              class="applicants-table gt-xs"
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

            <!-- Mobile card list -->
            <div class="lt-sm q-pa-xs column" style="gap: 6px">
              <div
                v-if="!loading && filteredRows.length === 0"
                class="full-width column flex-center q-pa-xl text-grey-6"
              >
                <q-icon name="search_off" size="3rem" class="q-mb-sm" />
                <div class="text-subtitle2">No applicants found</div>
              </div>

              <q-card
                v-for="row in filteredRows"
                :key="row.submission_id"
                flat
                bordered
                class="applicant-card"
                :class="{ 'applicant-card--selected': isSelected(row) }"
                @click="toggleSelection(row)"
              >
                <q-card-section class="q-pa-sm row no-wrap items-start" style="gap: 8px">
                  <q-checkbox
                    :model-value="isSelected(row)"
                    color="primary"
                    dense
                    style="flex-shrink: 0; margin-top: 2px"
                    @update:model-value="toggleSelection(row)"
                    @click.stop
                  />
                  <div style="flex: 1; min-width: 0">
                    <div class="text-body2 text-bold text-grey-9 ellipsis">
                      {{ row.firstname }} {{ row.lastname }}
                    </div>
                    <div class="text-caption text-grey-7 ellipsis">{{ row.Position }}</div>
                    <div class="text-caption text-grey-6 ellipsis">{{ row.Office }}</div>
                  </div>
                  <div class="column items-end" style="flex-shrink: 0; gap: 4px">
                    <q-badge outline color="grey-6" :label="`SG ${row.SalaryGrade}`" />
                    <div
                      v-if="row.tag_color"
                      class="color-circle"
                      :style="{ backgroundColor: row.tag_color }"
                      :title="getTagColorLabel(row.tag_color)"
                    ></div>
                    <span v-else class="text-caption text-grey-5">—</span>
                  </div>
                </q-card-section>
              </q-card>
            </div>
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
          <q-inner-loading
            :showing="updatingTags"
            color="primary"
            label="Updating tags..."
            label-class="text-primary text-subtitle2"
          />

          <!-- Tag Toolbar -->
          <div
            class="row items-center q-px-sm q-py-xs bg-grey-1"
            style="flex-shrink: 0; gap: 6px; flex-wrap: wrap"
          >
            <q-icon name="color_lens" color="primary" size="18px" />
            <div class="text-caption text-grey-8">
              Tag
              <span class="text-primary text-bold">{{ selectedApplicants.length }}</span>
              applicant(s)
            </div>
            <q-space />
            <q-btn
              flat
              dense
              size="xs"
              color="grey-7"
              icon="arrow_back"
              label="Back"
              @click="activeTab = 'select'"
            />
          </div>

          <!-- Bulk color actions -->
          <div class="q-px-sm q-py-xs bg-grey-1" style="flex-shrink: 0">
            <div class="row items-center" style="gap: 6px; flex-wrap: wrap">
              <span class="text-caption text-grey-7">Apply to all:</span>
              <q-btn
                v-for="color in availableColors"
                :key="color.value"
                :style="{ backgroundColor: color.value, color: getContrastColor(color.value) }"
                :label="color.label"
                size="xs"
                dense
                unelevated
                :disable="selectedApplicants.length === 0 || updatingTags"
                @click="applyTagToAll(color.value)"
              >
                <q-tooltip>Apply {{ color.label }} to all selected</q-tooltip>
              </q-btn>
              <q-btn
                color="grey"
                label="Clear All"
                size="xs"
                dense
                flat
                :disable="selectedApplicants.length === 0 || !hasAnyTag || updatingTags"
                @click="clearAllTags"
              />
            </div>
          </div>

          <!-- Summary Cards — 2-col grid on mobile, 4-col on larger -->
          <div class="q-px-sm q-pb-sm q-pt-xs bg-grey-1" style="flex-shrink: 0">
            <div class="row q-gutter-xs">
              <q-card flat bordered class="summary-card col">
                <q-card-section class="q-pa-xs text-center">
                  <div class="text-h6 text-primary text-bold">{{ selectedApplicants.length }}</div>
                  <div class="text-caption text-grey-6">Total</div>
                </q-card-section>
              </q-card>
              <q-card flat bordered class="summary-card col">
                <q-card-section class="q-pa-xs text-center">
                  <div class="text-h6 text-positive text-bold">{{ internalCount }}</div>
                  <div class="text-caption text-grey-6">Internal</div>
                </q-card-section>
              </q-card>
              <q-card flat bordered class="summary-card col">
                <q-card-section class="q-pa-xs text-center">
                  <div class="text-h6 text-info text-bold">{{ externalCount }}</div>
                  <div class="text-caption text-grey-6">External</div>
                </q-card-section>
              </q-card>
              <q-card flat bordered class="summary-card col">
                <q-card-section class="q-pa-xs text-center">
                  <div class="text-h6 text-orange text-bold">{{ uniqueOffices }}</div>
                  <div class="text-caption text-grey-6">Offices</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-separator style="flex-shrink: 0" />

          <!-- Tag Table (desktop) / Tag Cards (mobile) -->
          <div style="flex: 1 1 0; min-height: 0; overflow-y: auto; overflow-x: hidden">
            <!-- Desktop table -->
            <q-table
              flat
              dense
              :rows="selectedApplicants"
              :columns="tagColumns"
              row-key="submission_id"
              :rows-per-page-options="[0]"
              hide-bottom
              wrap-cells
              class="applicants-table gt-xs"
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
                    style="min-width: 110px"
                    :loading="updatingTagId === props.row.submission_id"
                    @update:model-value="(val) => updateTagColor(props.row, val)"
                  >
                    <!-- FIX: selected-item slot prevents float label overlay -->
                    <template #selected-item>
                      <div class="row no-wrap items-center" style="gap: 6px">
                        <div
                          v-if="props.row.tag_color"
                          class="color-circle flex-shrink-0"
                          :style="{ backgroundColor: props.row.tag_color }"
                        ></div>
                        <div v-else class="color-circle color-circle-empty flex-shrink-0"></div>
                        <span>{{ getTagColorLabel(props.row.tag_color) || 'None' }}</span>
                      </div>
                    </template>
                    <template #option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar style="min-width: 28px">
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

            <!-- Mobile tag cards -->
            <div class="lt-sm q-pa-xs column" style="gap: 6px">
              <div
                v-if="selectedApplicants.length === 0"
                class="full-width column flex-center q-pa-xl text-grey-6"
              >
                <q-icon name="inbox" size="3rem" class="q-mb-sm" />
                <div class="text-subtitle2">No applicants selected</div>
                <q-btn
                  flat
                  color="primary"
                  label="Go select applicants"
                  @click="activeTab = 'select'"
                />
              </div>

              <q-card
                v-for="row in selectedApplicants"
                :key="row.submission_id"
                flat
                bordered
                class="applicant-card"
              >
                <q-card-section class="q-pa-sm">
                  <div class="row no-wrap items-start" style="gap: 8px">
                    <div style="flex: 1; min-width: 0">
                      <div class="text-body2 text-bold text-grey-9 ellipsis">
                        {{ row.firstname }} {{ row.lastname }}
                      </div>
                      <div class="text-caption text-grey-7 ellipsis">{{ row.Position }}</div>
                      <div class="text-caption text-grey-6 ellipsis">{{ row.Office }}</div>
                    </div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="remove_circle_outline"
                      color="negative"
                      size="sm"
                      @click="removeFromSelection(row)"
                    />
                  </div>
                  <!-- Inline tag select for mobile -->
                  <div class="row items-center q-mt-xs" style="gap: 6px">
                    <span class="text-caption text-grey-7">Tag:</span>
                    <q-select
                      v-model="row.tag_color"
                      :options="tagSelectOptions"
                      dense
                      outlined
                      emit-value
                      map-options
                      style="min-width: 130px"
                      :loading="updatingTagId === row.submission_id"
                      @update:model-value="(val) => updateTagColor(row, val)"
                    >
                      <template #selected-item>
                        <div class="row no-wrap items-center" style="gap: 6px">
                          <div
                            v-if="row.tag_color"
                            class="color-circle flex-shrink-0"
                            :style="{ backgroundColor: row.tag_color }"
                          ></div>
                          <div v-else class="color-circle color-circle-empty flex-shrink-0"></div>
                          <span class="text-caption">
                            {{ getTagColorLabel(row.tag_color) || 'None' }}
                          </span>
                        </div>
                      </template>
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar style="min-width: 28px">
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
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- Footer -->
      <q-separator style="flex-shrink: 0" />
      <q-card-actions class="q-pa-sm bg-white row no-wrap items-center" style="flex-shrink: 0">
        <!-- Left: Generate Report (only when green or yellow tag filter is active) -->
        <q-btn
          v-if="tagColorFilter === 'green' || tagColorFilter === 'yellow'"
          unelevated
          icon="description"
          label="Generate Report"
          size="sm"
          :color="tagColorFilter === 'green' ? 'positive' : 'warning'"
          :text-color="tagColorFilter === 'yellow' ? 'black' : undefined"
          @click="showReport = true"
        >
          <q-tooltip>Generate {{ getTagColorLabel(tagColorFilter) }} tag report</q-tooltip>
        </q-btn>

        <q-space />

        <!-- Right: Close / Tag Selected -->
        <q-btn flat label="Close" color="grey-7" @click="$emit('close')" class="q-mr-xs" />
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

  <!-- Dynamic Report Dialog (GreenReport / YellowReport) -->
  <component
    :is="reportComponent"
    v-if="showReport && reportComponent"
    :date="props.date"
    @close="showReport = false"
  />
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useMarkingStore } from 'stores/markingStore';
  import { useQuasar } from 'quasar';
  import GreenReport from 'components/Reports/GreenReport.vue';
  import YellowReport from 'components/Reports/YellowReport.vue';

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
  const showReport = ref(false);

  // Resolves which report component to render based on the active tag color filter
  const reportComponent = computed(() => {
    if (tagColorFilter.value === 'green') return GreenReport;
    if (tagColorFilter.value === 'yellow') return YellowReport;
    return null;
  });

  const markingStore = useMarkingStore();

  const applicantStatusFilter = ref('all');
  const applicantStatusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Internal', value: 'INTERNAL' },
    { label: 'External', value: 'EXTERNAL' },
  ];

  const availableColors = [
    { label: 'Green', value: 'green' },
    { label: 'Yellow', value: 'yellow' },
  ];

  const tagSelectOptions = computed(() => [{ label: 'None', value: null }, ...availableColors]);

  const tagColorFilter = ref(null);
  const tagColorOptions = computed(() => {
    const colors = [{ label: 'None', value: 'none' }];
    const existingColors = new Set();
    allRows.value.forEach((row) => {
      if (row.tag_color) existingColors.add(row.tag_color);
    });
    availableColors.forEach((color) => {
      if (existingColors.has(color.value)) colors.push({ label: color.label, value: color.value });
    });
    return colors;
  });

  const getContrastColor = (hexColor) => {
    const darkColors = ['red', 'blue', 'purple', 'green'];
    return darkColors.includes(hexColor) ? 'white' : 'black';
  };

  const getTagColorLabel = (value) => {
    if (!value) return 'None';
    const color = availableColors.find((c) => c.value === value);
    return color ? color.label : value;
  };

  const hasAnyTag = computed(() => selectedApplicants.value.some((app) => app.tag_color));

  // Mobile selection helpers
  const isSelected = (row) =>
    selectedApplicants.value.some((r) => r.submission_id === row.submission_id);

  const toggleSelection = (row) => {
    if (isSelected(row)) {
      selectedApplicants.value = selectedApplicants.value.filter(
        (r) => r.submission_id !== row.submission_id,
      );
    } else {
      selectedApplicants.value = [...selectedApplicants.value, row];
    }
  };

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

  const columns = [
    {
      name: 'select',
      label: '',
      field: 'select',
      align: 'center',
      style: 'width: 5%',
      headerStyle: 'width: 5%',
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
      style: 'width: 27%',
      headerStyle: 'width: 27%',
    },
    {
      name: 'Office',
      label: 'Office',
      field: 'Office',
      align: 'left',
      sortable: true,
      style: 'width: 24%',
      headerStyle: 'width: 24%',
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

  const officeOptions = computed(() =>
    [...new Set(allRows.value.map((r) => r.Office).filter(Boolean))].sort(),
  );

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

  watch(
    () => markingStore.reports,
    () => {
      selectedApplicants.value = [];
    },
  );
</script>

<style scoped>
  .color-circle {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  .color-circle-empty {
    background-color: transparent;
    border: 1.5px solid #bdbdbd;
  }

  /* ── Applicant cards (mobile) ── */
  .applicant-card {
    border-radius: 8px !important;
    cursor: pointer;
    transition: background 0.15s;
  }

  .applicant-card--selected {
    border-color: var(--q-primary) !important;
    background: #e8f0fe;
  }

  /* ── Table overrides ── */
  .applicants-table :deep(thead tr th) {
    font-size: 12px;
    font-weight: 700;
    color: #616161;
    background: #fafafa;
    border-bottom: 2px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 2;
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

  .applicants-table :deep(.q-table__container),
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

  /* Checkbox centering */
  .applicants-table :deep(thead tr th:first-child),
  .applicants-table :deep(tbody tr td:first-child) {
    text-align: center !important;
    width: 40px !important;
  }

  .applicants-table :deep(thead tr th:first-child .q-checkbox),
  .applicants-table :deep(tbody tr td:first-child .q-checkbox) {
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .summary-card {
    border-radius: 8px !important;
    min-width: 60px;
  }

  /* Utility */
  .flex-shrink-0 {
    flex-shrink: 0;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
