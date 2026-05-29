<template>
  <q-toolbar class="q-mb-none header">
    <div class="row items-center justify-between full-width no-wrap">
      <!-- Left: Hamburger (mobile) + Title -->
      <div class="row items-center no-wrap">
        <!-- Hamburger — only visible when drawer is hidden (mobile/tablet) -->
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="hamburger-btn q-mr-sm"
          @click="$emit('toggle-drawer')"
        />

        <h5 class="header-title q-ma-none">
          <b>Welcome to Recruitment, Selection and Placement System!</b>
        </h5>
      </div>

      <!-- Right: User dropdown -->
      <div class="row items-center no-wrap">
        <q-btn-dropdown flat :ripple="false" no-icon-animation>
          <template #label>
            <!-- Avatar -->
            <div>
              <div v-if="authStore.user">
                <q-avatar size="36px" color="black" text-color="white" class="avatar">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() }}
                </q-avatar>
              </div>
              <div v-else style="width: 36px">
                <q-skeleton type="circle" />
              </div>
            </div>

            <!-- Name + Position (hidden on xs screens) -->
            <div class="q-ml-sm column justify-start items-start user-info-text">
              <div
                v-if="authStore.user"
                class="text-bold"
                style="font-size: 13px; line-height: 1.2"
              >
                {{ authStore.user?.name || 'Guest' }}
              </div>
              <div v-else style="width: 100px">
                <q-skeleton type="text" />
              </div>

              <div
                v-if="authStore.user"
                class="text-caption text-grey-6"
                style="font-size: 11px; line-height: 1.2"
              >
                {{ authStore.user?.position || 'Guest' }}
              </div>
              <div v-else style="width: 80px">
                <q-skeleton type="text" />
              </div>
            </div>
          </template>

          <q-list>
            <q-item clickable @click="onSetting" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="settings" color="primary" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Settings</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable @click.prevent="onLogout">
              <q-item-section avatar>
                <q-avatar
                  :icon="authStore.loading ? undefined : 'logout'"
                  color="negative"
                  text-color="white"
                >
                  <q-spinner v-if="authStore.loading" color="white" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>
  </q-toolbar>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { useAuthStore } from 'src/stores/authStore';

  defineEmits(['toggle-drawer']);

  const router = useRouter();
  const authStore = useAuthStore();

  const onLogout = async () => {
    await authStore.logout();
  };

  const onSetting = () => {
    router.push('/settings');
  };
</script>

<style scoped>
  .header {
    background: white;
    border-bottom: 1px solid #eee;
    height: 70px;
    padding: 0 12px;
  }

  /* Hamburger: always rendered, visibility controlled by CSS */
  .hamburger-btn {
    display: none;
  }

  /* Show hamburger on screens where the drawer is hidden (< 1024px by default in Quasar) */
  @media (max-width: 1023px) {
    .hamburger-btn {
      display: inline-flex;
    }
  }

  /* Title: truncate on small screens */
  .header-title {
    font-size: clamp(12px, 2vw, 18px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 55vw;
    line-height: 1.2;
  }

  /* Hide name/position text on very small screens — avatar alone is enough */
  @media (max-width: 479px) {
    .user-info-text {
      display: none;
    }

    .header-title {
      max-width: 42vw;
    }
  }

  /* Shrink title on medium screens */
  @media (max-width: 767px) {
    .header-title {
      font-size: clamp(11px, 2.5vw, 14px);
    }
  }
</style>
