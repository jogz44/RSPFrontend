<template>
  <q-dialog v-model="localShow" persistent @show="onModalShow" @hide="onModalHide">
    <q-card class="wes-modal" :style="cardStyle">
      <!-- Header -->
      <q-card-section class="wes-header row items-center justify-between q-px-md q-py-sm">
        <div class="row items-center q-gutter-sm">
          <q-icon name="work_history" size="1.4em" color="white" />
          <div>
            <div class="text-h6 text-white text-bold">Work Experience Sheet</div>
            <div class="text-caption text-green-2">
              Control No:
              <strong>{{ ControlNo || '—' }}</strong>
            </div>
          </div>
        </div>
        <q-btn icon="close" flat round dense color="white" @click="onClose" />
      </q-card-section>

      <!-- Loading -->
      <div v-if="isLoading" class="column items-center justify-center" style="min-height: 300px">
        <q-spinner-dots size="50px" color="green-8" />
        <div class="q-mt-md text-grey-7 text-subtitle2">Loading Work Experience Sheet...</div>
      </div>

      <!-- Error / Not Found -->
      <div
        v-else-if="errorMessage"
        class="column items-center justify-center q-pa-xl"
        style="min-height: 300px"
      >
        <q-icon
          :name="isNotFoundError ? 'manage_search' : 'error_outline'"
          size="3.5em"
          :color="isNotFoundError ? 'grey-5' : 'negative'"
        />
        <div
          class="q-mt-md text-subtitle1 text-bold"
          :class="isNotFoundError ? 'text-grey-7' : 'text-negative'"
        >
          {{ isNotFoundError ? 'No WES Record Found' : 'Failed to Load Data' }}
        </div>
        <q-banner
          class="q-mt-sm text-center"
          :class="isNotFoundError ? 'bg-grey-2 text-grey-7' : 'bg-red-1 text-red-9'"
          rounded
          dense
          style="max-width: 340px"
        >
          <template v-slot:avatar>
            <q-icon
              :name="isNotFoundError ? 'info' : 'warning'"
              :color="isNotFoundError ? 'grey-6' : 'negative'"
              size="18px"
            />
          </template>
          {{ errorMessage }}
        </q-banner>
        <q-btn
          v-if="!isNotFoundError"
          class="q-mt-lg"
          label="Retry"
          color="green-8"
          rounded
          icon="refresh"
          @click="loadWESData"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!isLoading && wesData.length === 0"
        class="column items-center justify-center q-pa-xl"
        style="min-height: 300px"
      >
        <q-icon name="inbox" size="3em" color="grey-4" />
        <div class="q-mt-md text-grey-6 text-subtitle1">No Work Experience Records Found</div>
        <div class="text-grey-5 text-caption q-mt-xs">
          No WES data available for control no. {{ ControlNo }}
        </div>
      </div>

      <!-- Content -->
      <q-card-section
        v-else
        class="q-pa-sm q-pa-md-md"
        style="overflow: auto; max-height: calc(90vh - 130px)"
      >
        <!-- Summary Strip -->
        <div class="row q-gutter-sm q-mb-md">
          <q-badge color="green-8" class="q-px-sm q-py-xs text-caption">
            <q-icon name="work" size="12px" class="q-mr-xs" />
            {{ wesData.length }} Position{{ wesData.length !== 1 ? 's' : '' }}
          </q-badge>
          <q-badge color="green-6" class="q-px-sm q-py-xs text-caption">
            <q-icon name="schedule" size="12px" class="q-mr-xs" />
            {{ totalMonthsText }}
          </q-badge>
        </div>

        <!-- WES Cards -->
        <div class="wes-timeline">
          <div v-for="entry in sortedWesData" :key="entry.ID" class="wes-entry q-mb-md">
            <!-- Position Header -->
            <q-card flat bordered class="wes-entry-card">
              <q-card-section class="wes-entry-header q-py-sm q-px-md">
                <div class="row items-start justify-between no-wrap q-gutter-x-sm">
                  <div class="col">
                    <!-- Position Badge + Title -->
                    <div class="row items-center q-gutter-xs q-mb-xs wrap">
                      <span class="text-subtitle2 text-bold text-grey-9 wes-position-title">
                        {{ entry.Position }}
                      </span>
                      <q-badge
                        color="green-9"
                        class="q-px-sm q-py-xs text-caption text-bold"
                        rounded
                      >
                        {{ entry.status || 'REGULAR' }}
                      </q-badge>
                    </div>

                    <!-- Meta Row -->
                    <div class="column q-gutter-y-xs q-mt-xs">
                      <div class="row items-start no-wrap q-gutter-xs">
                        <span class="wes-meta-label">Office:</span>
                        <span class="text-caption text-grey-8">{{ entry.officeName }}</span>
                      </div>
                      <div class="row items-start no-wrap q-gutter-xs">
                        <span class="wes-meta-label">Organization:</span>
                        <span class="text-caption text-grey-8">{{ entry.Organization }}</span>
                      </div>
                      <div class="row items-start no-wrap q-gutter-xs">
                        <span class="wes-meta-label">Immediate Supervisor:</span>
                        <span class="text-caption text-grey-8">{{ entry.Supervisor }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Duration Chip -->
                  <div class="column items-end q-ml-sm" style="min-width: 110px; flex-shrink: 0">
                    <q-chip
                      dense
                      color="green-1"
                      text-color="green-9"
                      icon="date_range"
                      class="q-px-sm"
                      style="font-size: 0.72rem"
                    >
                      {{ formatDateShort(entry.DurationFrom) }} –
                      {{
                        entry.DurationTo === 'Present'
                          ? 'Present'
                          : formatDateShort(entry.DurationTo)
                      }}
                    </q-chip>
                    <q-chip
                      dense
                      color="green-1"
                      text-color="green-9"
                      icon="timelapse"
                      class="q-px-sm q-mt-xs"
                      style="font-size: 0.72rem"
                    >
                      {{ getDuration(entry.DurationFrom, entry.DurationTo) }}
                    </q-chip>
                    <!-- <div class="text-caption text-grey-5 q-mt-xs text-right">
                      Entry #{{ idx + 1 }}
                    </div> -->
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Duties -->
              <q-card-section class="q-py-sm q-px-md">
                <div
                  class="text-caption text-grey-6 text-bold q-mb-sm row items-center q-gutter-xs"
                >
                  <q-icon name="list_alt" size="14px" />
                  <span>DUTIES & RESPONSIBILITIES</span>
                  <q-badge color="grey-5" text-color="white" rounded class="q-px-xs">
                    {{ entry.Duties.length }}
                  </q-badge>
                </div>
                <div v-if="entry.Duties && entry.Duties.length > 0" class="wes-duties-list">
                  <div
                    v-for="duty in entry.Duties"
                    :key="duty.ID"
                    class="wes-duty-item row no-wrap q-gutter-xs q-mb-xs"
                  >
                    <q-icon
                      name="chevron_right"
                      size="16px"
                      color="green-8"
                      class="q-mt-xs"
                      style="flex-shrink: 0"
                    />
                    <span class="text-body2 text-grey-8 wes-duty-text">{{ duty.Duties }}</span>
                  </div>
                </div>
                <div v-else class="text-caption text-grey-5 q-pa-sm">
                  No duties listed for this position.
                </div>
              </q-card-section>

              <!-- Accomplishments (if any) -->
              <template v-if="entry.Accomplishments && entry.Accomplishments.length > 0">
                <q-separator />
                <q-card-section class="q-py-sm q-px-md">
                  <div
                    class="text-caption text-grey-6 text-bold q-mb-sm row items-center q-gutter-xs"
                  >
                    <q-icon name="emoji_events" size="14px" color="amber-8" />
                    <span>ACCOMPLISHMENTS</span>
                  </div>
                  <div
                    v-for="acc in entry.Accomplishments"
                    :key="acc.ID || acc"
                    class="row no-wrap q-gutter-xs q-mb-xs"
                  >
                    <q-icon
                      name="star"
                      size="14px"
                      color="amber-7"
                      style="flex-shrink: 0; margin-top: 3px"
                    />
                    <span class="text-body2 text-grey-8">{{ acc.Accomplishment || acc }}</span>
                  </div>
                </q-card-section>
              </template>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { usePlantillaStore } from 'stores/plantillaStore';

  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    ControlNo: {
      type: [String, Number],
      default: '',
    },
  });

  const emit = defineEmits(['update:show', 'close']);

  const localShow = ref(props.show);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const wesData = ref([]);
  const plantillaStore = usePlantillaStore();

  // True when the API returned a soft "not found" (success:false) rather than a network error
  const isNotFoundError = computed(
    () =>
      !!errorMessage.value &&
      wesData.value.length === 0 &&
      (errorMessage.value.toLowerCase().includes('not found') ||
        errorMessage.value.toLowerCase().includes('no record') ||
        errorMessage.value.toLowerCase().includes('no wes')),
  );

  // Responsive card style
  const cardStyle = computed(() => ({
    width: '900px',
    maxWidth: '98vw',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
  }));

  watch(
    () => props.show,
    (val) => {
      localShow.value = val;
    },
  );

  watch(localShow, (val) => {
    emit('update:show', val);
  });

  const onModalShow = () => {
    loadWESData();
  };

  const onModalHide = () => {
    wesData.value = [];
    errorMessage.value = '';
  };

  const loadWESData = async () => {
    if (!props.ControlNo) {
      errorMessage.value = 'No Control Number provided.';
      return;
    }
    isLoading.value = true;
    errorMessage.value = '';
    wesData.value = [];
    try {
      const result = await plantillaStore.fetchEmployeeWESRater(props.ControlNo);

      // API returned { success: false, message: '...' } — surface the message
      if (result && result.success === false) {
        errorMessage.value = result.message || 'WES record not found.';
        return;
      }

      // Support both direct array and nested { data: { WES: [...] } } response shapes
      if (Array.isArray(result)) {
        wesData.value = result;
      } else if (result?.data?.WES) {
        wesData.value = result.data.WES;
      } else if (result?.WES) {
        wesData.value = result.WES;
      } else {
        wesData.value = [];
      }
    } catch (err) {
      console.error('WES fetch error:', err);
      errorMessage.value =
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred while fetching WES data.';
    } finally {
      isLoading.value = false;
    }
  };

  // ── Date helpers ────────────────────────────────────────────────────────────

  const parseWESDate = (dateStr) => {
    if (!dateStr || dateStr.toLowerCase() === 'present') return null;
    // MM/DD/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const m = parseInt(parts[0], 10) - 1;
      const d = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) return dt;
    }
    const dt = new Date(dateStr);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    if (dateStr.toLowerCase() === 'present') return 'Present';
    const dt = parseWESDate(dateStr);
    if (!dt) return dateStr;
    return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  };

  const getMonthsDiff = (fromStr, toStr) => {
    const start = parseWESDate(fromStr);
    if (!start) return 0;
    const end = toStr?.toLowerCase() === 'present' ? new Date() : parseWESDate(toStr);
    if (!end) return 0;
    let months =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months -= 1;
    return Math.max(0, months);
  };

  const formatMonths = (months) => {
    if (months === 0) return '< 1 mo';
    const y = Math.floor(months / 12);
    const m = months % 12;
    const parts = [];
    if (y) parts.push(`${y} yr${y !== 1 ? 's' : ''}`);
    if (m) parts.push(`${m} mo${m !== 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const getDuration = (from, to) => formatMonths(getMonthsDiff(from, to));

  const totalMonthsText = computed(() => {
    const total = wesData.value.reduce(
      (sum, e) => sum + getMonthsDiff(e.DurationFrom, e.DurationTo),
      0,
    );
    return `Total: ${formatMonths(total)}`;
  });

  const sortedWesData = computed(() => {
    return [...wesData.value].sort((a, b) => {
      // Sort latest first: compare DurationFrom dates descending
      const dateA = parseWESDate(a.DurationFrom);
      const dateB = parseWESDate(b.DurationFrom);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });
  });

  const onClose = () => {
    localShow.value = false;
    emit('close');
  };
</script>

<style scoped>
  /* ── Header ── */
  .wes-header {
    background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 55%, #43a047 100%);
    border-radius: 8px 8px 0 0;
    flex-shrink: 0;
  }

  /* ── Card Shell ── */
  .wes-modal {
    border-radius: 10px;
    overflow: hidden;
  }

  /* ── Entry Card ── */
  .wes-entry-card {
    border-radius: 8px;
    border-left: 4px solid #2e7d32 !important;
    transition: box-shadow 0.2s ease;
  }
  .wes-entry-card:hover {
    box-shadow: 0 4px 16px rgba(46, 125, 50, 0.13) !important;
  }

  .wes-entry-header {
    background: #f1f8f1;
  }

  /* ── Position Title ── */
  .wes-position-title {
    font-size: 0.92rem;
    line-height: 1.3;
    word-break: break-word;
  }

  /* ── Duties ── */
  .wes-duty-item {
    padding: 2px 0;
  }
  .wes-duty-text {
    font-size: 0.82rem;
    line-height: 1.5;
    word-break: break-word;
  }

  /* ── Timeline Visual ── */
  .wes-timeline {
    position: relative;
  }

  /* ── Meta labels ── */
  .wes-meta-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #388e3c;
    white-space: nowrap;
    padding-top: 1px;
  }

  /* ── Responsive Tweaks ── */
  @media (max-width: 599px) {
    .wes-entry-card {
      border-left-width: 3px !important;
    }
    .wes-position-title {
      font-size: 0.85rem;
    }
    .wes-duty-text {
      font-size: 0.78rem;
    }
  }
</style>
