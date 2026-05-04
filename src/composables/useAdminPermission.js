import { computed } from 'vue';
import { useAuthStore } from 'stores/authStore';

export function useAdminPermission() {
  const authStore = useAuthStore();

  /**
   * Check if user is admin or superadmin
   */
  const isAdmin = computed(() => {
    const userRole = authStore.user?.user_role || authStore.user?.role;
    return userRole === 'admin' || userRole === 'superadmin';
  });

  /**
   * Check if user has specific permission
   * @param {string|string[]} requiredPermissions - Permission key(s) to check
   * @returns {boolean}
   */
  const hasPermission = (requiredPermissions) => {
    // If no permission required, allow access
    if (!requiredPermissions) return true;

    // Admin bypass - admins have all permissions
    if (isAdmin.value) return true;

    // Convert to array if string
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const userPermissions = authStore.user?.permissions;

    // Check if user has any of the required permissions
    return permissions.some((permission) => userPermissions?.[permission] === '1');
  };

  /**
   * Check view permission for a specific module
   * @param {string} module - Module name (plantilla, jobpost, applicant, etc.)
   * @returns {boolean}
   */
  const canView = (module) => {
    if (isAdmin.value) return true;

    const viewKey = `view${module.charAt(0).toUpperCase() + module.slice(1)}Access`;
    return authStore.user?.permissions?.[viewKey] === '1';
  };

  /**
   * Check modify permission for a specific module
   * @param {string} module - Module name (plantilla, jobpost, applicant, etc.)
   * @returns {boolean}
   */
  const canModify = (module) => {
    if (isAdmin.value) return true;

    const modifyKey = `modify${module.charAt(0).toUpperCase() + module.slice(1)}Access`;
    return authStore.user?.permissions?.[modifyKey] === '1';
  };

  /**
   * Check report permission
   * @returns {boolean}
   */
  const canViewReports = () => {
    if (isAdmin.value) return true;
    return authStore.user?.permissions?.viewReport === '1';
  };

  /**
   * Check request publication permission
   * @returns {boolean}
   */
  const canRequestPublication = () => {
    if (isAdmin.value) return true;
    return authStore.user?.permissions?.requestPublication === '1';
  };

  /**
   * Check report plantilla permission
   * @returns {boolean}
   */
  const canReportPlantilla = () => {
    if (isAdmin.value) return true;
    return authStore.user?.permissions?.reportPlantillaAccess === '1';
  };

  /**
   * Get all user permissions
   * @returns {object}
   */
  const getUserPermissions = () => {
    return authStore.user?.permissions || {};
  };

  return {
    isAdmin,
    hasPermission,
    canView,
    canModify,
    canViewReports,
    canRequestPublication,
    canReportPlantilla,
    getUserPermissions,
  };
}
