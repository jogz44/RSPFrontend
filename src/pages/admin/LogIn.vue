<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="login-page">
        <!-- Fullscreen Background -->
        <div class="bg-container">
          <div
            class="bg-image"
            :class="{ 'bg-shifted': sheetOpen && $q.screen.gt.xs }"
            :style="{ backgroundImage: `url('${bgImage}')` }"
          />
        </div>

        <!-- Hero Text -->
        <transition name="fade">
          <div class="hero-text" v-if="!sheetOpen || $q.screen.gt.sm">
            <div
              class="hero-title text-weight-bolder"
              :class="$q.screen.lt.sm ? 'text-h5' : $q.screen.lt.md ? 'text-h4' : 'text-h2'"
              style="text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8)"
            >
              Recruitment, Selection
              <br />
              and Placement
              <br />
              System
            </div>
            <div
              class="hero-subtitle"
              :class="$q.screen.lt.sm ? 'text-caption' : $q.screen.lt.md ? 'text-body2' : 'text-h6'"
              style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7)"
            >
              <!-- Human Resource Management Office -->
            </div>
          </div>
        </transition>

        <!-- Version -->
        <div class="version-label">
          <q-icon name="info" size="xs" color="grey-5" />
          <span>v 1.0.0.1</span>
        </div>

        <!-- CTA Login Button -->
        <transition name="fade">
          <div v-if="!sheetOpen" class="cta-wrapper">
            <q-btn unelevated rounded label="Login" class="cta-btn" @click="openSheet" />
          </div>
        </transition>

        <!-- Login Panel -->
        <transition name="panel-slide">
          <div v-if="sheetOpen" class="login-panel">
            <!-- Back Arrow -->
            <q-btn round flat dense icon="arrow_back" class="back-btn" @click="closeSheet" />

            <!-- Form Content -->
            <div class="form-inner">
              <div class="row justify-start items-center q-mb-lg">
                <q-icon
                  name="admin_panel_settings"
                  :size="$q.screen.lt.sm ? '4em' : '6em'"
                  class="q-mr-sm"
                />
                <div>
                  <div :class="$q.screen.lt.sm ? 'text-h5' : 'text-h4'" class="text-bold q-ma-none">
                    Login
                  </div>
                  <div
                    :class="$q.screen.lt.sm ? 'text-body1' : 'text-h6'"
                    class="q-ma-none text-grey-6"
                  >
                    Hello Admin
                  </div>
                </div>
              </div>

              <form @submit.prevent="login">
                <q-input
                  outlined
                  dense
                  class="q-mb-sm"
                  v-model="username"
                  label="Username"
                  type="text"
                  :error="!!errorMessage.username"
                  :error-message="errorMessage.username?.[0]"
                />
                <q-input
                  outlined
                  dense
                  v-model="password"
                  label="Password"
                  :type="showPass ? 'text' : 'password'"
                  :error="!!errorMessage.password"
                  :error-message="errorMessage.password?.[0]"
                >
                  <template v-slot:append>
                    <q-btn
                      @click="showPass = !showPass"
                      round
                      flat
                      dense
                      color="grey"
                      :icon="showPass ? 'visibility' : 'visibility_off'"
                    />
                  </template>
                </q-input>

                <div class="row justify-center q-mt-lg">
                  <q-btn
                    type="submit"
                    :disabled="authStore.loading"
                    :loading="authStore.loading"
                    label="Login"
                    color="primary"
                    :size="$q.screen.lt.sm ? 'sm' : 'md'"
                    :style="$q.screen.lt.sm ? 'width:100%;max-width:200px' : 'width:200px'"
                    rounded
                  />
                </div>
              </form>
            </div>
          </div>
        </transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useAuthStore } from 'src/stores/authStore';
  import { useQuasar, LocalStorage, SessionStorage } from 'quasar';

  const $q = useQuasar();
  const authStore = useAuthStore();

  const username = ref('');
  const password = ref('');
  const showPass = ref(false);
  const errorMessage = ref([]);
  const sheetOpen = ref(false);

  // ── Background image path — change this one line to swap the photo ──
  const bgImage = '/img/background/tagumbg1.JPG';

  const openSheet = () => {
    sheetOpen.value = true;
  };
  const closeSheet = () => {
    sheetOpen.value = false;
  };

  const clearAdminTokenCookie = () => {
    const cookieSettings = [
      'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;',
      'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure;',
      'admin_token=; path=/; domain=' +
        window.location.hostname +
        '; expires=Thu, 01 Jan 1970 00:00:00 GMT;',
    ];
    cookieSettings.forEach((s) => (document.cookie = s));
  };

  const clearSiteStorage = () => {
    try {
      localStorage.clear();
    } catch {
      //
    }
    try {
      sessionStorage.clear();
    } catch {
      //
    }
    try {
      LocalStorage.clear();
    } catch {
      //
    }
    try {
      SessionStorage.clear();
    } catch {
      //
    }
  };

  const resetAuthState = () => {
    authStore.token = null;
    authStore.isAuthenticated = false;
    authStore.user = null;
    authStore.errors = {};
    authStore.loading = false;
  };

  onMounted(() => {
    clearAdminTokenCookie();
    clearSiteStorage();
    resetAuthState();
  });

  const login = async () => {
    await authStore.login(username.value, password.value);
    errorMessage.value = authStore.errors;
  };
</script>

<style scoped>
  .login-page {
    position: relative;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  /* ── Background ── */
  .bg-container {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    transform: scale(1.1) translateX(0%);
    transform-origin: center center;
    transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .bg-image.bg-shifted {
    transform: scale(1.1) translateX(-22.5%);
  }

  /* ── Hero Text ── */
  .hero-text {
    position: absolute;
    top: 48px;
    left: 48px;
    color: white;
    z-index: 1;
    max-width: 50%;
  }
  .hero-subtitle {
    margin-top: 10px;
  }

  /* ── Version ── */
  .version-label {
    position: absolute;
    bottom: 16px;
    right: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.75rem;
  }

  /* ── CTA Button ── */
  .cta-wrapper {
    position: absolute;
    bottom: 60px;
    width: 100%;
    z-index: 2;
    display: flex;
    justify-content: center;
  }
  .cta-btn {
    background: white !important;
    color: #1b5e20 !important;
    font-weight: 600;
    font-size: 1rem;
    padding: 12px 48px;
    min-width: 200px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  /* ── Login Panel ── */
  .login-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100vh;
    background: white;
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px 40px;
    box-sizing: border-box;
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.18);
  }

  .form-inner {
    width: 100%;
    max-width: 370px;
  }

  /* ── Back Button ── */
  .back-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    color: #555 !important;
    background: #f0f0f0 !important;
  }
  .back-btn:hover {
    background: #e0e0e0 !important;
  }

  /* ── Panel slide from right ── */
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .panel-slide-enter-from,
  .panel-slide-leave-to {
    transform: translateX(100%);
  }

  /* ── Fade ── */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* ── Tablet (600px–1023px) ── */
  @media (max-width: 1023px) and (min-width: 600px) {
    .login-panel {
      width: 55%;
      padding: 40px 32px;
    }
    .hero-text {
      top: 32px;
      left: 28px;
      max-width: 40%;
    }
    .bg-image.bg-shifted {
      transform: scale(1.1) translateX(-15%);
    }
  }

  /* ── Mobile (<600px) ── */
  @media (max-width: 599px) {
    .login-panel {
      width: 100%;
      top: auto;
      bottom: 0;
      height: auto;
      min-height: 60vh;
      border-radius: 24px 24px 0 0;
      padding: 20px 24px 40px;
      justify-content: flex-start;
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.18);
    }
    .form-inner {
      max-width: 100%;
      margin-top: 16px;
    }
    .back-btn {
      top: 5px;
      left: 5px;
    }
    .hero-text {
      top: 24px;
      left: 16px;
      max-width: 90%;
    }
    .bg-image.bg-shifted {
      transform: scale(1.1) translateY(-8%);
    }
    .panel-slide-enter-from,
    .panel-slide-leave-to {
      transform: translateY(100%);
    }
  }
</style>
