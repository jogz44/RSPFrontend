<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h6 text-bold">NON-ACADEMIC DISTINCTIONS / RECOGNITION</div>
      <div class="row q-gutter-x-sm" v-if="!isReadOnly">
        <q-btn
          unelevated
          rounded
          label="Edit Distinctions"
          icon="edit"
          color="primary"
          size="sm"
          @click="openEditDialog"
        />
      </div>
    </div>

    <!-- Read-only notice for ControlNo applicants -->
    <q-banner v-if="isReadOnly" class="bg-grey-2 text-grey-8 q-mb-md" rounded>
      <div class="row items-center">
        <q-icon name="info" size="sm" class="q-mr-sm" />
        <span>Non-academic distinctions are read-only for this applicant.</span>
      </div>
    </q-banner>

    <div v-if="distinctionsData.length > 0" class="row q-col-gutter-md">
      <div
        v-for="(distinction, index) in distinctionsData"
        :key="distinction.id || index"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="distinction-card" flat bordered>
          <q-card-section>
            <div
              class="text-subtitle1 text-wrap"
              style="
                word-break: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                line-clamp: 7;
                -webkit-box-orient: vertical;
              "
            >
              <q-badge rounded>{{ index + 1 }}</q-badge>
              {{ distinction.non_academic }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="text-center q-pa-md">
      <q-banner class="text-grey-7 rounded-borders">
        <template v-slot:avatar>
          <q-icon name="info" color="grey-5" />
        </template>
        No non-academic distinctions available.
      </q-banner>
    </div>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent max-width="800px">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-h6">Edit Non-Academic Distinctions</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row q-mb-md">
            <div class="col">
              <q-btn
                unelevated
                rounded
                label="Add Distinction"
                icon="add"
                color="primary"
                size="sm"
                @click="addDistinction"
              />
            </div>
          </div>

          <q-card v-for="(item, idx) in editDistinctions" :key="idx" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-bold text-grey-7">Distinction #{{ idx + 1 }}</div>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="removeDistinction(idx)"
                />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="item.non_academic"
                    label="Non-Academic Distinction / Recognition *"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-banner v-if="!editDistinctions.length" class="text-grey-7">
            No distinctions. Click "Add Distinction" to add one.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat rounded label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            rounded
            label="Save"
            icon="save"
            color="positive"
            :loading="isSaving"
            @click="saveDistinctions"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { useAuthStore } from 'stores/authStore';
  import { useQuasar } from 'quasar';

  const $q = useQuasar();
  const authStore = useAuthStore();
  const API_BASE = 'http://192.168.8.182:9000/api';

  const props = defineProps({
    distinctions: {
      type: [Array, Object],
      required: false,
      default: () => [],
    },
    academic: {
      type: [Array, Object],
      required: false,
      default: () => [],
    },
    personalInfoId: { type: [Number, String], default: null },
    controlNo: { type: [String, Number], default: null },
    hasControlNo: { type: Boolean, required: false, default: false },
  });

  const emit = defineEmits(['saved']);

  const showEditDialog = ref(false);
  const isSaving = ref(false);
  const editDistinctions = ref([]);

  // Compute if we should hide edit button (has ControlNo)
  const isReadOnly = computed(() => {
    return props.hasControlNo || !!props.controlNo;
  });

  // Helper function to normalize distinctions data from either structure
  const normalizeDistinctionsData = () => {
    // For ControlNo responses, use the Academic array
    if (props.hasControlNo || props.controlNo) {
      if (props.academic && Array.isArray(props.academic) && props.academic.length > 0) {
        return props.academic.map((item) => ({
          id: item.ID || item.id || null,
          non_academic: item.NonAcademic || '',
        }));
      }
      return [];
    }

    // For non-ControlNo responses (first structure), check distinctions or skills
    let distinctionsArray = [];

    if (props.distinctions && Array.isArray(props.distinctions)) {
      distinctionsArray = props.distinctions;
    } else if (
      props.distinctions &&
      props.distinctions.distinctions &&
      Array.isArray(props.distinctions.distinctions)
    ) {
      distinctionsArray = props.distinctions.distinctions;
    } else if (
      props.distinctions &&
      props.distinctions.skills &&
      Array.isArray(props.distinctions.skills)
    ) {
      // Filter skills that have non_academic field
      distinctionsArray = props.distinctions.skills.filter((item) => item.non_academic);
    }

    return distinctionsArray.map((item) => ({
      id: item.id || null,
      non_academic: item.non_academic || item.NonAcademic || '',
    }));
  };

  const distinctionsData = computed(() => {
    return normalizeDistinctionsData();
  });

  function openEditDialog() {
    editDistinctions.value = JSON.parse(JSON.stringify(distinctionsData.value));
    showEditDialog.value = true;
  }

  function addDistinction() {
    editDistinctions.value.push({
      non_academic: '',
    });
  }

  function removeDistinction(index) {
    editDistinctions.value.splice(index, 1);
  }

  function getToken() {
    return authStore.token || authStore.user?.token || localStorage.getItem('token');
  }

  async function saveDistinctions() {
    isSaving.value = true;

    try {
      const payload = {
        ...(props.personalInfoId ? { personal_info_id: props.personalInfoId } : {}),
        ...(props.controlNo ? { control_no: props.controlNo } : {}),
        distinctions: editDistinctions.value,
      };

      const response = await fetch(`${API_BASE}/applicant/distinctions/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      showEditDialog.value = false;
      $q.notify({ type: 'positive', message: 'Non-academic distinctions updated successfully!' });
      emit('saved', data);
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message || 'Save failed.' });
    } finally {
      isSaving.value = false;
    }
  }
</script>

<style scoped>
  .distinction-card {
    transition: all 0.3s ease;
    border-radius: 8px;
  }
  .distinction-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--q-primary);
  }
</style>
