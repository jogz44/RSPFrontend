<template>
  <q-btn
    flat
    round
    dense
    color="blue"
    class="bg-blue-2 q-ml-sm"
    icon="lock_reset"
    @click="confirmReset"
  >
    <q-tooltip>Reset Password</q-tooltip>
  </q-btn>
</template>

<script setup>
import { Dialog, Loading } from 'quasar'
import { useAuthStore } from 'stores/authStore'

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
})

const authStore = useAuthStore();

const confirmReset = () => {
  Dialog.create({
    title: 'Reset Password',
    message: 'Are you sure you want to reset this user\'s password?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    Loading.show({
      message: 'Resetting password...',
      spinnerColor: 'white',
      messageColor: 'white',
    });

    try {
      await authStore.resetPassword(props.userId);
    } finally {
      Loading.hide();
    }
  })
}
</script>