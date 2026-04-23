// stores/pdsEditStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminApi } from 'src/boot/axios_admin';

export const usePdsEditStore = defineStore('pdsEdit', () => {
  // ─── State ────────────────────────────────────────────────────────────────

  const activeEditSection = ref(null);

  const draftData = ref({
    education: [],
    work: [],
    voluntary: [],
    civilService: [],
    training: [],
    skills: [],
    references: [],
  });

  const deletedIds = ref({
    education: [],
    work: [],
    voluntary: [],
    civilService: [],
    training: [],
    skills: [],
    references: [],
  });

  const addedRows = ref({
    education: [],
    work: [],
    voluntary: [],
    civilService: [],
    training: [],
    skills: [],
    references: [],
  });

  const isSaving = ref(false);
  const saveError = ref(null);
  const personalInfoId = ref(null);

  // ─── Getters ──────────────────────────────────────────────────────────────

  const isEditing = computed(() => (section) => activeEditSection.value === section);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function cloneRows(rows) {
    return JSON.parse(JSON.stringify(rows ?? []));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  function startEdit(section, liveRows, pInfoId) {
    if (pInfoId) personalInfoId.value = pInfoId;
    activeEditSection.value = section;
    draftData.value[section] = cloneRows(liveRows);
    deletedIds.value[section] = [];
    addedRows.value[section] = [];
    saveError.value = null;
  }

  function cancelEdit(section) {
    if (activeEditSection.value === section) {
      activeEditSection.value = null;
    }
    draftData.value[section] = [];
    deletedIds.value[section] = [];
    addedRows.value[section] = [];
    saveError.value = null;
  }

  function updateDraftRow(section, rowIndex, field, value) {
    if (draftData.value[section]?.[rowIndex] !== undefined) {
      draftData.value[section][rowIndex][field] = value;
    }
  }

  function updateAddedRow(section, rowIndex, field, value) {
    if (addedRows.value[section]?.[rowIndex] !== undefined) {
      addedRows.value[section][rowIndex][field] = value;
    }
  }

  function addRow(section) {
    const templates = {
      education: {
        school_name: '',
        degree: '',
        attendance_from: '',
        attendance_to: '',
        highest_units: '',
        year_graduated: '',
        scholarship: '',
        level: 'College',
        graduated: 'Yes',
      },
      work: {
        work_date_from: '',
        work_date_to: '',
        position_title: '',
        department: '',
        monthly_salary: '',
        salary_grade: '',
        status_of_appointment: '',
        government_service: 'No',
      },
      voluntary: {
        organization_name: '',
        inclusive_date_from: '',
        inclusive_date_to: '',
        number_of_hours: '',
        position: '',
      },
      civilService: {
        eligibility: '',
        rating: '',
        date_of_examination: '',
        place_of_examination: '',
        license_number: '',
        date_of_validity: '',
      },
      training: {
        training_title: '',
        inclusive_date_from: '',
        inclusive_date_to: '',
        number_of_hours: '',
        type: '',
        conducted_by: '',
      },
      skills: {
        skill: '',
        non_academic: '',
        organization: '',
      },
      references: {
        full_name: '',
        address: '',
        contact_number: '',
      },
    };

    addedRows.value[section].push({ ...(templates[section] ?? {}) });
  }

  function markForDelete(section, rowId) {
    if (!deletedIds.value[section].includes(rowId)) {
      deletedIds.value[section].push(rowId);
    }

    draftData.value[section] = draftData.value[section].filter((r) => r.id !== rowId);
  }

  function removeAddedRow(section, rowIndex) {
    addedRows.value[section].splice(rowIndex, 1);
  }

  function buildPayload(section) {
    const sectionKeyMap = {
      education: 'educations',
      work: 'work_experiences',
      voluntary: 'voluntary_works',
      civilService: 'eligibilities',
      training: 'trainings',
      skills: 'skills',
      references: 'references',
    };

    const key = sectionKeyMap[section];
    const existing = draftData.value[section];
    const newRows = addedRows.value[section];

    return {
      personal_info_id: personalInfoId.value,
      [key]: [...existing, ...newRows],
    };
  }

  async function saveSection(section) {
    isSaving.value = true;
    saveError.value = null;

    try {
      const payload = buildPayload(section);

      const response = await adminApi.post('/applicant/qs/edit', payload);

      activeEditSection.value = null;

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      console.error('Save error:', err);

      saveError.value = err.response?.data?.message || err.message || 'Failed to save data';

      return {
        success: false,
        error: saveError.value,
      };
    } finally {
      isSaving.value = false;
    }
  }

  return {
    // state
    activeEditSection,
    draftData,
    deletedIds,
    addedRows,
    isSaving,
    saveError,
    personalInfoId,

    // getters
    isEditing,

    // actions
    startEdit,
    cancelEdit,
    updateDraftRow,
    updateAddedRow,
    addRow,
    markForDelete,
    removeAddedRow,
    saveSection,
  };
});
