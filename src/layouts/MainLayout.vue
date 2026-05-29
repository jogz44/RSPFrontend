<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Sidebar -->
    <SidebarPage v-model:drawer="drawer" />

    <!-- Header -->
    <q-header class="text-black">
      <NavBarPage @toggle-drawer="drawer = !drawer" />
    </q-header>

    <!-- Page -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import SidebarPage from 'src/components/SidebarPage.vue';
  import NavBarPage from 'src/components/NavBar.vue';

  const drawer = ref(true);

  onMounted(async () => {});
</script>
