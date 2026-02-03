<!-- src/components/ChangePasswordModal.vue -->
<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="bg-warning text-white">
        <div class="text-h6">
          <q-icon name="lock_reset" class="q-mr-sm" />
          Password Change Required
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-8 q-mb-md">
          For security reasons, you must change your password before accessing the system.
        </div>

        <q-form @submit.prevent="handleChangePassword">
          <q-input
            v-model="form.current_password"
            type="password"
            label="Current Password *"
            outlined
            dense
            class="q-mb-md"
            :rules="[(val) => !!val || 'Current password is required']"
            :error="!!errors.current_password"
            :error-message="errors.current_password"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-input
            v-model="form.new_password"
            type="password"
            label="New Password *"
            outlined
            dense
            class="q-mb-md"
            :rules="[
              (val) => !!val || 'New password is required',
              (val) => val.length >= 8 || 'Password must be at least 8 characters',
            ]"
            :error="!!errors.new_password"
            :error-message="errors.new_password"
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" />
            </template>
            <template v-slot:hint>
              <span class="text-caption">Minimum 8 characters</span>
            </template>
          </q-input>

          <q-input
            v-model="form.new_password_confirmation"
            type="password"
            label="Confirm New Password *"
            outlined
            dense
            class="q-mb-md"
            :rules="[
              (val) => !!val || 'Please confirm your password',
              (val) => val === form.new_password || 'Passwords do not match',
            ]"
            :error="!!errors.new_password_confirmation"
            :error-message="errors.new_password_confirmation"
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" />
            </template>
          </q-input>

          <div class="row q-gutter-sm">
            <q-btn
              type="submit"
              color="primary"
              label="Change Password"
              class="col"
              :loading="loading"
            />
            <q-btn flat color="grey-7" label="Logout" class="col-auto" @click="handleLogout" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'password-changed', 'logout']);



const showDialog = ref(props.modelValue);
const loading = ref(false);
const form = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
});
const errors = ref({});

watch(
  () => props.modelValue,
  (newVal) => {
    showDialog.value = newVal;
  }
);

watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal);
});

const handleChangePassword = async () => {
  errors.value = {};
  emit('password-changed', form.value);
};

const handleLogout = () => {
  emit('logout');
};

// Expose method to set errors from parent
const setErrors = (newErrors) => {
  errors.value = newErrors;
};

const setLoading = (value) => {
  loading.value = value;
};

defineExpose({
  setErrors,
  setLoading,
});
</script>
