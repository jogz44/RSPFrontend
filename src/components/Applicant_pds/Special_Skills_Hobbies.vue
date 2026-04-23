<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">Special Skills &amp; Hobbies</div>
      <div class="row q-gutter-x-sm" v-if="!isEditMode">
        <q-btn flat round icon="edit" color="primary" size="sm" @click="enterEdit" title="Edit" />
      </div>
      <div class="row q-gutter-x-sm" v-else>
        <q-btn
          unelevated
          rounded
          label="Add Skill"
          icon="add"
          color="primary"
          size="sm"
          @click="addRow"
        />
        <q-btn
          unelevated
          rounded
          label="Save"
          icon="save"
          color="positive"
          size="sm"
          :loading="editStore.isSaving"
          @click="save"
        />
        <q-btn flat rounded label="Cancel" icon="close" color="grey-7" size="sm" @click="cancel" />
      </div>
    </div>

    <q-banner
      v-if="editStore.saveError && isEditMode"
      class="bg-negative text-white q-mb-md"
      rounded
    >
      {{ editStore.saveError }}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="editStore.saveError = null" />
      </template>
    </q-banner>

    <!-- VIEW MODE -->
    <template v-if="!isEditMode">
      <div v-if="skillsData.length > 0" class="row q-col-gutter-md">
        <div v-for="(skill, index) in skillsData" :key="skill.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="skill-card" flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-wrap" style="word-break: break-word">
                <q-badge rounded>{{ index + 1 }}</q-badge>
                {{ skill.skill }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <q-banner class="text-grey-7">No skills or hobbies available</q-banner>
      </div>
    </template>

    <!-- EDIT MODE -->
    <div v-else>
      <!-- Existing rows -->
      <q-card
        v-for="(row, idx) in editStore.draftData.skills"
        :key="row.id ?? idx"
        flat
        bordered
        class="q-mb-sm"
      >
        <q-card-section class="row items-center q-gutter-x-md q-py-sm">
          <div class="text-grey-7 text-caption col-auto">#{{ idx + 1 }}</div>
          <div class="col">
            <q-input v-model="row.skill" label="Skill / Hobby" outlined dense />
          </div>
          <div class="col">
            <q-input v-model="row.non_academic" label="Non-Academic Distinction" outlined dense />
          </div>
          <div class="col">
            <q-input v-model="row.organization" label="Organization Membership" outlined dense />
          </div>
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="markForDelete(row.id)"
          />
        </q-card-section>
      </q-card>

      <!-- New rows -->
      <q-card
        v-for="(row, idx) in editStore.addedRows.skills"
        :key="`new-${idx}`"
        flat
        bordered
        class="q-mb-sm bg-blue-1"
      >
        <q-card-section class="row items-center q-gutter-x-md q-py-sm">
          <div class="text-blue-8 text-caption col-auto">New</div>
          <div class="col">
            <q-input v-model="row.skill" label="Skill / Hobby" outlined dense />
          </div>
          <div class="col">
            <q-input v-model="row.non_academic" label="Non-Academic Distinction" outlined dense />
          </div>
          <div class="col">
            <q-input v-model="row.organization" label="Organization Membership" outlined dense />
          </div>
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="editStore.removeAddedRow('skills', idx)"
          />
        </q-card-section>
      </q-card>

      <q-banner
        v-if="!editStore.draftData.skills.length && !editStore.addedRows.skills.length"
        class="text-grey-7"
      >
        No skills. Click "Add Skill" to add one.
      </q-banner>

      <div class="text-caption text-grey-6 q-mt-sm">
        Note: Each row also stores Non-Academic Distinctions and Membership Association data.
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { usePdsEditStore } from 'stores/pdsEditStore';
  import { useQuasar } from 'quasar';

  const $q = useQuasar();
  const editStore = usePdsEditStore();

  const props = defineProps({
    skills: { type: Array, required: false, default: () => [] },
    personalInfoId: { type: [Number, String], default: null },
  });
  const emit = defineEmits(['saved']);

  const isEditMode = computed(() => editStore.activeEditSection === 'skills');

  const skillsData = computed(() => {
    if (!Array.isArray(props.skills)) return [];
    return props.skills;
  });

  function enterEdit() {
    editStore.startEdit('skills', props.skills, props.personalInfoId);
  }
  function addRow() {
    editStore.addRow('skills');
  }
  function markForDelete(id) {
    if (!id) return;
    $q.dialog({
      title: 'Confirm Delete',
      message: 'Remove this skill record?',
      cancel: true,
      persistent: true,
    }).onOk(() => editStore.markForDelete('skills', id));
  }
  function cancel() {
    editStore.cancelEdit('skills');
  }
  async function save() {
    const result = await editStore.saveSection('skills');
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Skills updated!' });
      emit('saved', result.data);
    } else {
      $q.notify({ type: 'negative', message: result.error || 'Save failed.' });
    }
  }
</script>

<style scoped>
  .skill-card {
    transition: all 0.3s ease;
    border-radius: 8px;
  }
  .skill-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--q-primary);
  }
</style>
