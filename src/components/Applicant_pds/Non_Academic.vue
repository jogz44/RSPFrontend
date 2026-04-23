<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h6 text-bold">NON-ACADEMIC DISTINCTIONS / RECOGNITION</div>
      <q-chip icon="info" color="blue-1" text-color="blue-8" size="sm" class="text-caption" outline>
        Edit via Special Skills &amp; Hobbies tab
      </q-chip>
    </div>

    <div v-if="distinctionsData.length > 0" class="row q-col-gutter-md">
      <div
        v-for="(distinction, index) in distinctionsData"
        :key="distinction.id"
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
              {{ distinction.non_academic || distinction.skill }}
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
        No non-academic distinctions available. You can add entries from the
        <strong>Special Skills &amp; Hobbies</strong>
        tab.
      </q-banner>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    distinctions: {
      type: Array,
      required: false,
      default: () => [],
    },
  });

  const distinctionsData = computed(() => {
    if (!Array.isArray(props.distinctions)) return [];
    return props.distinctions.filter(
      (item) => item.non_academic || (item.skill && item.organization),
    );
  });
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
