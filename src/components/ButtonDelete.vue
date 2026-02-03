<template>
  <q-btn
    flat
    round
    dense
    color="red"
    class="bg-red-2 q-ml-sm"
    icon="delete"
    @click="confirmDelete"
  >
    <q-tooltip>Delete Account</q-tooltip>
  </q-btn>
</template>

<script setup>
import { Dialog,Loading} from 'quasar'
import { useAuthStore } from 'stores/authStore'

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
})

const authStore = useAuthStore();

const confirmDelete = () => {
  Dialog.create({
    title: 'Delete Account',
    message: 'Are you sure you want to delete this user\'s Account?',
    cancel: true,
    persistent: true,
    }).onOk(async () => {
    Loading.show({
      message: 'Deleting account...',
      spinnerColor: 'white',
      messageColor: 'white',
    });

    try {
      await authStore.deleteUser(props.userId);
    } finally {
      Loading.hide();
    }
  })
}
</script>
