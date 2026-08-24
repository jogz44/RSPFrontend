// src/stores/pdsFormStore.js
import { defineStore } from 'pinia';
import { date } from 'quasar';
import { applicantApi } from 'boot/axios_applicant';

const { formatDate } = date;

export const usePDSStore = defineStore('pds', {
  state: () => ({
    // User profile data (only what we need)
    user: {
      fullName: '',
      firstName: '',
      lastName: '',
      middleName: '',
      image: '',
    },

    // Applied positions (from /applicant/application/list/{email})
    applications: [],

    // Status flags
    isAuthenticated: false,
    hasExistingPDS: false,

    // API state
    loading: false,
    error: null,

    applicationsLoading: false,
    applicationsError: null,

    // Submission state
    isSubmitting: false,
    submissionError: null,
    submissionSuccess: false,
  }),

  getters: {
    // User getters
    fullName: (state) => state.user.fullName,
    firstName: (state) => state.user.firstName,
    lastName: (state) => state.user.lastName,
    middleName: (state) => state.user.middleName,
    userImage: (state) => state.user.image,

    // Status getters
    hasPDS: (state) => state.hasExistingPDS,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,

    // Display name (fallback)
    displayName: (state) => state.user.fullName || 'Guest User',

    // Applications getters
    getApplications: (state) => state.applications,
    hasApplications: (state) => state.applications.length > 0,
    applicationsAreLoading: (state) => state.applicationsLoading,
    getApplicationsError: (state) => state.applicationsError,

    // Submission getters
    getIsSubmitting: (state) => state.isSubmitting,
    getSubmissionError: (state) => state.submissionError,
    isSubmissionSuccess: (state) => state.submissionSuccess,

    // Applications mapped to the shape the Account page table expects
    appliedPositionsTable: (state) => {
      return state.applications.map((app) => ({
        id: app.personal_id,
        Position: app.applied_position || '',
        Office: app.office || '',
        SalaryGrade: app.salary_grade || '',
        date_applied: app.application_applied_date
          ? formatDate(app.application_applied_date, 'MMM D, YYYY')
          : '',
        status: app.application_status || '',
      }));
    },
  },

  actions: {
    /**
     * Fetch PDS data for a given email
     * @param {string} email - Applicant email address
     * @returns {Promise<Object>} Result with success flag and data
     */
    async fetchPDS(email) {
      this.loading = true;
      this.error = null;

      try {
        const response = await applicantApi.get(`/applicant/application/pds/external/${email}`);

        if (response.data?.success && response.data?.data) {
          const userData = response.data.data;
          this._saveUserData(userData);
          this.hasExistingPDS = true;
          return { success: true, data: userData };
        } else {
          this._clearUserData();
          this.hasExistingPDS = false;
          return { success: false, error: 'No PDS found', data: null };
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this._clearUserData();
          this.hasExistingPDS = false;
          return { success: false, error: 'Applicant not found', data: null };
        }

        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to fetch PDS';
        this.error = errorMessage;
        this.hasExistingPDS = false;
        return { success: false, error: errorMessage, data: null };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch PDS data specific to a job post using personal ID
     * Endpoint: /applicant/application/data/{jobPostId}/{nPersonalId}
     * @param {string|number} jobPostId - Job post ID
     * @param {string|number} nPersonalId - Personal ID from the application
     * @returns {Promise<Object>} Result with success flag and data
     */
    async fetchPDSbyJobPost(jobPostId, nPersonalId) {
      this.loading = true;
      this.error = null;

      try {
        // Use the correct endpoint: /applicant/application/data/{jobPostId}/{nPersonalId}
        const response = await applicantApi.get(
          `/applicant/application/data/${jobPostId}/${nPersonalId}`,
        );

        if (response.data?.success && response.data?.data) {
          const userData = response.data.data;
          this._saveUserData(userData);
          this.hasExistingPDS = true;

          // Store the job ID for reference
          if (jobPostId) {
            localStorage.setItem('currentJobPDSId', jobPostId);
          }
          if (nPersonalId) {
            localStorage.setItem('currentPersonalId', nPersonalId);
          }

          return { success: true, data: userData };
        } else {
          this._clearUserData();
          this.hasExistingPDS = false;
          return { success: false, error: 'No PDS found for this job post', data: null };
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this._clearUserData();
          this.hasExistingPDS = false;
          return { success: false, error: 'No PDS found for this job post', data: null };
        }

        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to fetch PDS for job post';
        this.error = errorMessage;
        this.hasExistingPDS = false;
        return { success: false, error: errorMessage, data: null };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch the list of job applications for a given applicant email
     * @param {string} email - Applicant email address
     * @returns {Promise<Object>} Result with success flag and data
     */
    async fetchApplications(email) {
      this.applicationsLoading = true;
      this.applicationsError = null;

      try {
        const response = await applicantApi.get(`/applicant/application/list/${email}`);

        if (response.data?.success && Array.isArray(response.data?.data)) {
          const applications = response.data.data;
          this.applications = applications;

          if (applications.length > 0 && !this.user.fullName) {
            this._saveUserFromApplication(applications[0]);
          }

          return { success: true, data: applications };
        } else {
          this.applications = [];
          return { success: false, error: 'No applications found', data: [] };
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this.applications = [];
          return { success: false, error: 'Applicant not found', data: [] };
        }

        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to fetch applications';
        this.applicationsError = errorMessage;
        return { success: false, error: errorMessage, data: [] };
      } finally {
        this.applicationsLoading = false;
      }
    },

    /**
     * Submit PDS application
     * @param {Object} payload - Form data payload
     * @param {File} photo - Photo file (optional)
     * @returns {Promise<Object>} Result with success flag and data
     */
    async submitApplication(payload, photo = null) {
      this.isSubmitting = true;
      this.submissionError = null;
      this.submissionSuccess = false;

      try {
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) {
            if (typeof payload[key] === 'object' && !(payload[key] instanceof File)) {
              formData.append(key, JSON.stringify(payload[key]));
            } else if (payload[key] instanceof File) {
              formData.append(key, payload[key]);
            } else {
              formData.append(key, String(payload[key]));
            }
          }
        });

        if (photo && photo instanceof File) {
          formData.append('image_path', photo);
        }

        const response = await applicantApi.post('/applicant/application/submission', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data?.success) {
          this.submissionSuccess = true;

          const { useEmailStore } = await import('./emailStore');
          const emailStore = useEmailStore();
          if (emailStore) {
            emailStore.clearPDSCache();
          }

          const message = response.data?.message || 'Application submitted successfully';

          return {
            success: true,
            data: response.data,
            message: message,
          };
        } else {
          const errorMessage = response.data?.message || 'Submission failed';
          this.submissionError = errorMessage;
          return {
            success: false,
            error: errorMessage,
          };
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to submit application';
        this.submissionError = errorMessage;
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Reset submission state
     */
    resetSubmissionState() {
      this.isSubmitting = false;
      this.submissionError = null;
      this.submissionSuccess = false;
    },

    /**
     * Restore user data from localStorage
     * @returns {boolean} True if data was restored
     */
    restoreFromStorage() {
      const storedData = this._getFromStorage();

      if (storedData) {
        this._restoreUserData(storedData);
        return true;
      }

      return false;
    },

    /**
     * Check if user has stored data
     * @returns {boolean} True if valid data exists
     */
    hasStoredData() {
      return !!localStorage.getItem('userData');
    },

    /**
     * Get current user data
     * @returns {Object} User data object
     */
    getUserData() {
      return {
        fullName: this.user.fullName,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        middleName: this.user.middleName,
        image: this.user.image,
        hasPDS: this.hasExistingPDS,
      };
    },

    /**
     * Clear all user data
     */
    clear() {
      this._clearUserData();
      this._clearStorage();
      this.applications = [];
      this.applicationsError = null;
      this.resetSubmissionState();
    },

    // ─── Private Methods ───────────────────────────────────────

    /**
     * Save user data from API response
     * @param {Object} userData - User data from API
     */
    _saveUserData(userData) {
      const firstName = userData.firstname || '';
      const middleName = userData.middlename || '';
      const lastName = userData.lastname || '';

      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

      const image = userData.image_url || userData.image_path || '';

      this.user = {
        fullName: fullName,
        firstName: firstName,
        lastName: lastName,
        middleName: middleName,
        image: image,
      };

      this.hasExistingPDS = true;
      this.isAuthenticated = true;

      this._saveToStorage();
    },

    /**
     * Hydrate basic profile info from an application list record
     * @param {Object} application - Single record from /applicant/application/list/{email}
     */
    _saveUserFromApplication(application) {
      const firstName = application.firstname || '';
      const lastName = application.lastname || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

      this.user.fullName = fullName;
      this.user.firstName = firstName;
      this.user.lastName = lastName;

      this.isAuthenticated = true;
    },

    /**
     * Clear user data from state
     */
    _clearUserData() {
      this.user = {
        fullName: '',
        firstName: '',
        lastName: '',
        middleName: '',
        image: '',
      };
      this.hasExistingPDS = false;
      this.isAuthenticated = false;
    },

    /**
     * Save user data to localStorage
     */
    _saveToStorage() {
      try {
        const storageData = {
          fullName: this.user.fullName,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          middleName: this.user.middleName,
          image: this.user.image,
          timestamp: Date.now(),
        };

        localStorage.setItem('userFullName', this.user.fullName);
        localStorage.setItem('userFirstName', this.user.firstName);
        localStorage.setItem('userLastName', this.user.lastName);
        localStorage.setItem('userMiddleName', this.user.middleName);
        localStorage.setItem('userImage', this.user.image);
        localStorage.setItem('userData', JSON.stringify(storageData));
        localStorage.setItem('userAuthenticated', 'true');
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },

    /**
     * Get user data from localStorage
     * @returns {Object|null} Stored data or null
     */
    _getFromStorage() {
      try {
        const data = localStorage.getItem('userData');
        if (data) {
          return JSON.parse(data);
        }
        return null;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    },

    /**
     * Restore user data from stored object
     * @param {Object} storedData - Data from localStorage
     */
    _restoreUserData(storedData) {
      this.user = {
        fullName: storedData.fullName || '',
        firstName: storedData.firstName || '',
        lastName: storedData.lastName || '',
        middleName: storedData.middleName || '',
        image: storedData.image || '',
      };

      this.hasExistingPDS = true;
      this.isAuthenticated = true;
    },

    /**
     * Clear localStorage
     */
    _clearStorage() {
      const keys = [
        'userFullName',
        'userFirstName',
        'userLastName',
        'userMiddleName',
        'userImage',
        'userData',
        'userAuthenticated',
      ];

      keys.forEach((key) => localStorage.removeItem(key));
    },
  },
});
