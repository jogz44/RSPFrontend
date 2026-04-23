<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h6 text-bold">MEMBERSHIP IN ASSOCIATION / ORGANIZATION</div>
      <q-chip icon="info" color="blue-1" text-color="blue-8" size="sm" class="text-caption" outline>
        Edit via Special Skills &amp; Hobbies tab
      </q-chip>
    </div>

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
              {{ membership.organization || membership.name }}
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
        No memberships available. You can add entries from the
        <strong>Special Skills &amp; Hobbies</strong>
        tab.
      </q-banner>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    memberships: {
      type: Array,
      required: false,
      default: () => [],
    },
  });

  const membershipData = computed(() => {
    if (!Array.isArray(props.memberships)) return [];
    return props.memberships;
  });
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
