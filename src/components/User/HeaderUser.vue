<template>
  <q-header ref="headerRef" elevated>
    <q-toolbar class="header row items-center justify-between text-black">
      <!-- Logo and Title Section -->
      <div class="row items-center q-gutter-x-sm logo-section">
        <div>
          <q-img src="logo.png" alt="City Hall Logo" :style="logoSize" />
        </div>
        <div class="title-wrapper">
          <h4 class="text-bold title-text q-ma-none">City Hall of Tagum</h4>
        </div>
      </div>

      <!-- Desktop Navigation - Hidden on form route -->
      <div v-if="!isFormRoute" class="desktop-nav gt-sm">
        <q-tabs
          active-color="primary"
          v-model="routeTab"
          class="bg-white"
          align="justify"
          narrow-indicator
        >
          <q-tab name="Homepage" label="Home" @click="navigateTo('Homepage')" />
          <q-tab name="Joblist" label="Job Lists" @click="navigateTo('Joblist')" />
          <q-tab name="Account" label="Account" @click="navigateTo('Account')" />
          <!-- <q-tab name="Admin" label="Admin" @click="navigateTo('Admin Login')" />
          <q-tab name="Rater" label="Rater" @click="navigateTo('Rater Login')" /> -->
        </q-tabs>
      </div>

      <!-- Mobile Menu Button - Hidden on form route -->
      <q-btn
        v-if="!isFormRoute"
        flat
        dense
        round
        icon="menu"
        class="lt-md"
        aria-label="Open navigation menu"
        @click="drawerOpen = !drawerOpen"
      />
    </q-toolbar>
  </q-header>

  <!-- Mobile Navigation Drawer - Hidden on form route -->
  <q-drawer
    v-if="!isFormRoute"
    v-model="drawerOpen"
    side="right"
    overlay
    behavior="mobile"
    elevated
    class="lt-md"
  >
    <q-list padding>
      <q-item-label header class="text-h6 text-weight-bold">Navigation</q-item-label>

      <q-item
        clickable
        v-ripple
        :active="routeTab === 'Homepage'"
        @click="navigateToMobile('Homepage')"
      >
        <q-item-section avatar>
          <q-icon name="home" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Home</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        :active="routeTab === 'Joblist'"
        @click="navigateToMobile('Joblist')"
      >
        <q-item-section avatar>
          <q-icon name="work" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Job Lists</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        :active="routeTab === 'Account'"
        @click="navigateToMobile('Account')"
      >
        <q-item-section avatar>
          <q-icon name="account_circle" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Account</q-item-label>
        </q-item-section>
      </q-item>

      <!-- <q-separator class="q-my-sm" />

      <q-item
        clickable
        v-ripple
        :active="routeTab === 'Admin'"
        @click="navigateToMobile('Admin Login')"
      >
        <q-item-section avatar>
          <q-icon name="admin_panel_settings" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Admin</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        :active="routeTab === 'Rater'"
        @click="navigateToMobile('Rater Login')"
      >
        <q-item-section avatar>
          <q-icon name="star" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Rater</q-item-label>
        </q-item-section>
      </q-item> -->
    </q-list>
  </q-drawer>
</template>

<script setup>
  import { useRoute, useRouter } from 'vue-router';
  import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
  import { useQuasar } from 'quasar';

  const route = useRoute();
  const router = useRouter();
  const $q = useQuasar();
  const routeTab = ref(route.name);
  const drawerOpen = ref(false);

  // Check if current route is the form route
  const isFormRoute = computed(() => {
    return route.path === '/form' || route.name === 'PDSForm';
  });

  // Responsive logo size
  const logoSize = computed(() => {
    if ($q.screen.xs) {
      return 'width: 35px; height: 35px';
    } else if ($q.screen.sm) {
      return 'width: 40px; height: 40px';
    }
    return 'width: 50px; height: 50px';
  });

  // Update tab when route changes
  watch(
    () => route.name,
    (newRouteName) => {
      routeTab.value = newRouteName;
    },
  );

  // Initialize the tab on component mount
  onMounted(() => {
    routeTab.value = route.name;
  });

  // Navigation function for desktop
  const navigateTo = (routeName) => {
    router.push({ name: routeName });
  };

  // Navigation function for mobile (closes drawer)
  const navigateToMobile = (routeName) => {
    router.push({ name: routeName });
    drawerOpen.value = false;
  };

  // ── Publish header height as a global CSS variable ──────────────
  // Any page can then use var(--app-header-height) for sticky offsets
  // without needing to know anything about this component.
  const headerRef = ref(null);
  let headerResizeObserver = null;

  function publishHeaderHeight(height) {
    document.documentElement.style.setProperty('--app-header-height', `${height}px`);
  }

  onMounted(() => {
    nextTick(() => {
      const headerEl = headerRef.value?.$el;
      if (!headerEl) return;

      publishHeaderHeight(headerEl.getBoundingClientRect().height);

      headerResizeObserver = new ResizeObserver((entries) => {
        publishHeaderHeight(entries[0].contentRect.height);
      });
      headerResizeObserver.observe(headerEl);
    });
  });

  onUnmounted(() => {
    headerResizeObserver?.disconnect();
  });
</script>

<style scoped>
  .header {
    background: white;
    border-bottom: 1px solid #eee;
    height: 70px;
    padding: 0 16px;
  }

  .logo-section {
    flex-shrink: 0;
  }

  .title-text {
    font-size: 1.25rem;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Tablet breakpoint */
  @media (max-width: 1023px) and (min-width: 600px) {
    .header {
      height: 60px;
      padding: 0 12px;
    }

    .title-text {
      font-size: 1.1rem;
    }
  }

  /* Mobile breakpoint */
  @media (max-width: 599px) {
    .header {
      height: 56px;
      padding: 0 8px;
    }

    .title-text {
      font-size: 0.95rem;
    }

    .logo-section {
      gap: 8px !important;
    }
  }

  /* Extra small devices */
  @media (max-width: 360px) {
    .header {
      padding: 0 4px;
    }

    .title-text {
      font-size: 0.85rem;
    }

    .title-wrapper {
      max-width: 140px;
    }
  }

  /* Desktop navigation */
  .desktop-nav {
    flex-grow: 1;
    display: flex;
    justify-content: flex-end;
    padding-right: 20px;
  }

  /* Active menu item in drawer */
  .q-item.q-router-link--active,
  .q-item[aria-current='page'] {
    color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.1);
  }
</style>
