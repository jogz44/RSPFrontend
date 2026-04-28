<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h6 text-bold">MEMBERSHIP IN ASSOCIATION / ORGANIZATION</div>
      <div class="row q-gutter-x-sm" v-if="!isReadOnly">
        <q-btn
          unelevated
          rounded
          label="Edit Memberships"
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
        <span>Membership records are read-only for this applicant.</span>
      </div>
    </q-banner>

    <div v-if="membershipData.length > 0" class="row q-col-gutter-md">
      <div
        v-for="(membership, index) in membershipData"
        :key="index"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="membership-card" flat bordered>
          <q-card-section>
            <div
              class="text-subtitle1 text-wrap"
              style="
                word-break: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
              "
            >
              <q-badge rounded>{{ index + 1 }}</q-badge>
              {{ membership.organization || membership.organization_name || membership.name }}
            </div>
            <div v-if="membership.position" class="text-caption text-grey-7 q-mt-sm">
              Position: {{ membership.position }}
            </div>
            <div
              v-if="membership.inclusive_date_from || membership.inclusive_date_to"
              class="text-caption text-grey-7"
            >
              {{ formatDateRange(membership) }}
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
        No memberships available.
      </q-banner>
    </div>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent max-width="800px">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-h6">Edit Memberships</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row q-mb-md">
            <div class="col">
              <q-btn
                unelevated
                rounded
                label="Add Membership"
                icon="add"
                color="primary"
                size="sm"
                @click="addMembership"
              />
            </div>
          </div>

          <q-card v-for="(item, idx) in editMemberships" :key="idx" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-bold text-grey-7">Membership #{{ idx + 1 }}</div>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="removeMembership(idx)"
                />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="item.organization"
                    label="Organization / Association Name *"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="item.position" label="Position / Role" outlined dense />
                </div>
                <div class="col-12 col-sm-3">
                  <q-input
                    v-model="item.inclusive_date_from"
                    label="From (MM/DD/YYYY)"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-3">
                  <q-input
                    v-model="item.inclusive_date_to"
                    label="To (MM/DD/YYYY)"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model="item.number_of_hours"
                    label="No. of Hours"
                    outlined
                    dense
                    type="number"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-banner v-if="!editMemberships.length" class="text-grey-7">
            No memberships. Click "Add Membership" to add one.
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
            @click="saveMemberships"
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
    memberships: {
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
  const editMemberships = ref([]);

  // Compute if we should hide edit button (has ControlNo)
  const isReadOnly = computed(() => {
    return props.hasControlNo || !!props.controlNo;
  });

  // Helper function to normalize membership data from either structure
  const normalizeMembershipData = (data) => {
    if (!data) return [];

    let membershipArray = [];
    if (Array.isArray(data)) {
      membershipArray = data;
    } else if (data.organization && Array.isArray(data.organization)) {
      membershipArray = data.organization;
    } else {
      return [];
    }

    return membershipArray.map((item) => {
      // Check if it's the second structure (has organization_name field)
      const isSecondStructure = 'organization_name' in item;

      if (isSecondStructure) {
        // Second structure format
        return {
          id: item.id || null,
          organization: item.organization_name || '',
          position: item.position || '',
          inclusive_date_from: item.inclusive_date_from || '',
          inclusive_date_to: item.inclusive_date_to || '',
          number_of_hours: item.number_of_hours || '',
        };
      } else {
        // First structure format (from skills array or Organization array)
        return {
          id: item.id || null,
          organization: item.organization || item.name || '',
          position: item.position || '',
          inclusive_date_from: item.inclusive_date_from || '',
          inclusive_date_to: item.inclusive_date_to || '',
          number_of_hours: item.number_of_hours || '',
        };
      }
    });
  };

  const membershipData = computed(() => {
    const normalized = normalizeMembershipData(props.memberships);
    return normalized;
  });

  const formatDateRange = (membership) => {
    const fromDate = membership.inclusive_date_from
      ? formatDate(membership.inclusive_date_from)
      : '';
    const toDate = membership.inclusive_date_to ? formatDate(membership.inclusive_date_to) : '';

    if (fromDate && toDate) {
      return `${fromDate} - ${toDate}`;
    } else if (fromDate) {
      return `From ${fromDate}`;
    } else if (toDate) {
      return `Until ${toDate}`;
    }
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  function openEditDialog() {
    editMemberships.value = JSON.parse(JSON.stringify(membershipData.value));
    showEditDialog.value = true;
  }

  function addMembership() {
    editMemberships.value.push({
      organization: '',
      position: '',
      inclusive_date_from: '',
      inclusive_date_to: '',
      number_of_hours: '',
    });
  }

  function removeMembership(index) {
    editMemberships.value.splice(index, 1);
  }

  function getToken() {
    return authStore.token || authStore.user?.token || localStorage.getItem('token');
  }

  async function saveMemberships() {
    isSaving.value = true;

    try {
      const payload = {
        // Use appropriate identifier
        ...(props.personalInfoId ? { personal_info_id: props.personalInfoId } : {}),
        ...(props.controlNo ? { control_no: props.controlNo } : {}),

        // Memberships data
        memberships: editMemberships.value,
      };

      const response = await fetch(`${API_BASE}/applicant/memberships/edit`, {
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
      $q.notify({ type: 'positive', message: 'Memberships updated successfully!' });
      emit('saved', data);
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message || 'Save failed.' });
    } finally {
      isSaving.value = false;
    }
  }
</script>

<style scoped>
  .membership-card {
    transition: all 0.3s ease;
    border-radius: 8px;
  }
  .membership-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--q-primary);
  }
</style>
