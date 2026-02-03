<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header Section -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4">Account Settings</div>
          <div class="text-caption text-grey">Last login: {{ currentDateTime }} UTC</div>
        </div>
        <div class="col-auto">
          <q-chip color="primary" text-color="white">
            <q-avatar>
              <q-icon name="person" />
            </q-avatar>
            {{ authStore.user?.username }}
          </q-chip>
        </div>
      </div>

      <!-- Personal Information Card -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">Personal Information</div>

          <q-form @submit.prevent="saveChanges" ref="accountForm">
            <div class="row q-col-gutter-md">
              <!-- Basic Information -->
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  v-model="form.name"
                  label="Full Name"
                  :rules="[(val) => !!val || 'Name is required']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input outlined v-model="form.username" label="Username" disable />
              </div>

              <div class="col-12 col-md-6">
                <q-input outlined v-model="form.position" label="Position" disable />
              </div>

              <!-- Password Change Section -->
              <div class="col-12">
                <q-separator class="q-my-md" />
                <div class="text-subtitle1 q-mb-md">Change Password (Optional)</div>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  v-model="form.new_password"
                  label="New Password"
                  type="password"
                  :rules="[
                    (val) => !val || val.length >= 8 || 'Password must be at least 8 characters',
                  ]"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  v-model="form.confirm_password"
                  label="Confirm New Password"
                  type="password"
                  :rules="[
                    (val) =>
                      !form.new_password || val === form.new_password || 'Passwords do not match',
                  ]"
                />
              </div>

              <!-- ============================================================ -->
              <!-- DYNAMIC PERMISSIONS SECTION                                   -->
              <!-- Only renders permissions that actually came back from the API -->
              <!-- ============================================================ -->
              <div class="col-12" v-if="permissionKeys.length > 0">
                <q-separator class="q-my-md" />
                <div class="text-subtitle1 q-mb-md">Permissions</div>
                <div class="row q-col-gutter-md">
                  <div
                    v-for="key in permissionKeys"
                    :key="key"
                    class="col-12 col-md-6"
                  >
                    <q-card bordered flat class="bg-grey-1">
                      <q-card-section>
                        <div class="row items-center">
                          <div class="col">
                            <q-toggle
                              v-model="form.permissions[key]"
                              :label="getPermissionLabel(key)"
                              :disable="!canEditPermissions"
                              true-value="1"
                              false-value="0"
                            />
                          </div>
                          <div class="col-auto">
                            <q-icon :name="getPermissionIcon(key)" />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Display -->
            <div v-if="validationErrors" class="q-mt-md">
              <q-banner class="bg-negative text-white">
                <template v-slot:avatar>
                  <q-icon name="error" color="white" />
                </template>
                <div v-for="(errors, field) in validationErrors" :key="field">
                  <div v-for="error in errors" :key="error">
                    {{ error }}
                  </div>
                </div>
              </q-banner>
            </div>

            <!-- Action Buttons -->
            <div class="row q-mt-lg justify-end">
              <q-btn
                label="Reset Changes"
                flat
                color="grey"
                class="q-mr-sm"
                @click="resetForm"
                :disable="authStore.loading"
              />
              <q-btn
                label="Save Changes"
                type="submit"
                color="primary"
                :loading="authStore.loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Account Information Display Card -->
      <q-card>
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">Account Information</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Username</q-item-label>
                  <q-item-label>{{ authStore.user?.username }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Role</q-item-label>
                  <q-item-label>{{ getRoleName() }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Last Login</q-item-label>
                  <q-item-label>{{ currentDateTime }} UTC</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Position</q-item-label>
                  <q-item-label>{{ authStore.user?.position || 'Not specified' }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { useAuthStore } from 'stores/authStore';
  // import { useLogsStore } from 'stores/logsStore';
  import { toast } from 'src/boot/toast';

  // ================================================================
  // LABEL + ICON MAP
  // Add any new permission key here — the loop will pick it up
  // automatically. No need to touch the template.
  // ================================================================
  const PERMISSION_META = {
    viewDashboardstat:      { label: 'View Dashboard Statistics',  icon: 'dashboard' },
    viewPlantillaAccess:    { label: 'View Plantilla Access',      icon: 'visibility' },
    modifyPlantillaAccess:  { label: 'Modify Plantilla Access',    icon: 'edit' },
    viewJobpostAccess:      { label: 'View Job Post Access',       icon: 'visibility' },
    modifyJobpostAccess:    { label: 'Modify Job Post Access',     icon: 'edit' },
    viewActivityLogs:       { label: 'View Activity Logs',         icon: 'history' },
    userManagement:         { label: 'User Management Access',     icon: 'manage_accounts' },
    viewRater:              { label: 'View Rater Module',          icon: 'visibility' },
    modifyRater:            { label: 'Modify Rater Module',        icon: 'edit' },
    viewCriteria:           { label: 'View Criteria Access',       icon: 'visibility' },
    modifyCriteria:         { label: 'Modify Criteria Access',     icon: 'edit' },
    viewReport:             { label: 'View Report Module',         icon: 'assessment' },
  };

  export default defineComponent({
    name: 'EditAccountPage',

    setup() {
      const authStore = useAuthStore();
      // const logsStore = useLogsStore();
      const accountForm = ref(null);
      const validationErrors = ref(null);

      const currentDateTime = ref('');

      // Form only has the base fields — permissions are added dynamically
      const form = ref({
        name: '',
        username: '',
        position: '',
        active: true,
        new_password: '',
        confirm_password: '',
        permissions: {},   // ← populated dynamically from API response
      });

      // ============================================================
      // permissionKeys = whatever keys actually came back from the API
      // This is the single source of truth for what we render
      // ============================================================
      const permissionKeys = computed(() => {
        return Object.keys(form.value.permissions);
      });

      // Only admin position can toggle permissions
      const canEditPermissions = computed(() => {
        return authStore.user?.position === 'admin';
      });

      // ── helpers ─────────────────────────────────────────────────
      const getPermissionLabel = (key) => {
        return PERMISSION_META[key]?.label || key; // fallback: raw key
      };

      const getPermissionIcon = (key) => {
        return PERMISSION_META[key]?.icon || 'lock'; // fallback icon
      };

      // ── populate form from store (works for any set of keys) ────
      const populateForm = () => {
        if (!authStore.user) return;

        const apiPermissions = authStore.user.permissions || {};

        form.value = {
          name:             authStore.user.name || '',
          username:         authStore.user.username || '',
          position:         authStore.user.position || '',
          active:           authStore.user.active ?? true,
          new_password:     '',
          confirm_password: '',
          permissions:      { ...apiPermissions }, // spread whatever came back
        };
      };

      // ── lifecycle ───────────────────────────────────────────────
      onMounted(() => {
        if (authStore.user) {
          populateForm();
          currentDateTime.value = new Date().toISOString().replace('T', ' ').slice(0, 19);
        } else if (!authStore.isAuthenticated) {
          authStore.router?.push({ name: 'Admin Login' });
        }
      });

      // ── role label (kept simple) ────────────────────────────────
      const getRoleName = () => {
        if (!authStore.user) return 'Unknown';
        if (authStore.user.position === 'admin') return 'Administrator';
        return 'Standard User';
      };

      // ── reset ───────────────────────────────────────────────────
      const resetForm = () => {
        populateForm();                        // re-pull from store
        validationErrors.value = null;
        toast.info('Form has been reset');
      };

      // ── save ────────────────────────────────────────────────────
      const saveChanges = async () => {
        try {
          validationErrors.value = null;

          const isValid = await accountForm.value.validate();
          if (!isValid) return;

          const userData = {
            name:        form.value.name.trim(),
            username:    form.value.username,
            position:    form.value.position,
            active:      form.value.active,
            permissions: { ...form.value.permissions }, // send back exactly what we have
          };

          // Only attach password if the user actually typed one
          if (form.value.new_password) {
            if (form.value.new_password !== form.value.confirm_password) {
              toast.error('Passwords do not match');
              return;
            }
            userData.password              = form.value.new_password;
            userData.password_confirmation = form.value.confirm_password;
          }

          const result = await authStore.updateUser(authStore.user.id, userData);

          if (result) {
            // await logsStore.logAction('Updated Account Information');
            form.value.new_password     = '';
            form.value.confirm_password = '';
          }
        } catch (error) {
          console.error('Error updating account:', error);

          if (error.response?.status === 422) {
            validationErrors.value = error.response.data.errors;
            const msgs = [];
            for (const field in error.response.data.errors) {
              msgs.push(...error.response.data.errors[field]);
            }
            toast.error(msgs.join('\n'));
          } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action');
          } else {
            toast.error(error.response?.data?.message || 'An error occurred while updating your account');
          }
        }
      };

      return {
        authStore,
        form,
        accountForm,
        permissionKeys,
        canEditPermissions,
        getPermissionLabel,
        getPermissionIcon,
        saveChanges,
        resetForm,
        getRoleName,
        validationErrors,
        currentDateTime,
      };
    },
  });
</script>

<style scoped>
  .bg-grey-1 {
    background-color: #f5f5f5;
  }

  .q-card {
    transition: all 0.3s ease;
  }

  .q-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>
