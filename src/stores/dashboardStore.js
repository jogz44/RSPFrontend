import { defineStore } from 'pinia';
import { adminApi } from 'src/boot/axios_admin';
import { toast } from 'src/boot/toast';

export const DashboardStore = defineStore('dashboard', {
  state: () => ({
    // publish_jobpost
    published_position: 0,
    publication_date: null,

    // applicant_application
    qualified: 0,
    for_assessment: 0,
    unqualified: 0,
    total_application: 0,
    internal_application: 0,
    external_application: 0,

    // plantilla_position
    funded: 0,
    unfunded: 0,
    filled: 0,
    vacant: 0,
    total_positions: 0,

    // applicant_actual_application
    internal_applicant: 0,
    external_applicant: 0,
    total_applicant: 0,

    summaryByOffice: [],
    vw_status: [],
    loading: false,
    error: null,

    // Publication dates
    publicationDates: [],
    selectedPublication: null,

    // Card specific loading states
    loadingCards: {
      positions: false,
      publication: false,
      applicants: false,
      applications: false,
      preAssessment: false,
      forAssessment: false,
    },

    // Job posts for dashboard
    dashboardJobPosts: [],
    loadingJobPosts: false,
  }),

  actions: {
    async fetchPublicationDates() {
      try {
        const response = await adminApi.get('dashboard/publication-date');
        this.publicationDates = response.data || [];

        // Process and format the options
        this.publicationDates = this.publicationDates.map((item) => ({
          ...item,
          label: `${item.post_date} - ${item.end_date}`,
          value: item,
        }));

        // Find the latest publication date
        if (this.publicationDates.length > 0) {
          // Group by post_date and find the one with latest end_date
          const grouped = this.publicationDates.reduce((acc, curr) => {
            if (!acc[curr.post_date]) {
              acc[curr.post_date] = [];
            }
            acc[curr.post_date].push(curr);
            return acc;
          }, {});

          // For each post_date, find the latest end_date
          let latest = null;
          let latestDate = null;

          for (const postDate in grouped) {
            const dates = grouped[postDate];
            // Sort by end_date descending
            dates.sort((a, b) => {
              // Parse dates for comparison
              const dateA = new Date(a.end_date);
              const dateB = new Date(b.end_date);
              return dateB - dateA;
            });

            // Get the latest end_date for this post_date
            const latestEndDate = dates[0];
            const postDateObj = new Date(postDate);

            if (!latestDate || postDateObj > latestDate) {
              latestDate = postDateObj;
              latest = latestEndDate;
            }
          }

          this.selectedPublication = latest;
        }

        return this.publicationDates;
      } catch (error) {
        console.error('Error fetching publication dates:', error);
        this.publicationDates = [];
        toast.error('Failed to fetch publication dates');
        return [];
      }
    },

    async status(postDate = null, endDate = null) {
      if (this.loading) return;

      this.loading = true;
      // Set all card loading states to true
      this.setAllCardLoading(true);
      this.error = null;

      try {
        let url = 'dashboard';
        if (postDate && endDate) {
          url = `dashboard?post_date=${encodeURIComponent(postDate)}&end_date=${encodeURIComponent(endDate)}`;
        }

        const response = await adminApi.get(url);
        const data = response.data;

        // publish_jobpost
        this.published_position = data.publish_jobpost.vacant;
        this.publication_date = data.publish_jobpost.post_date;

        // applicant_application
        this.qualified = data.applicant_application.qualified;
        this.for_assessment = data.applicant_application.pending;
        this.unqualified = data.applicant_application.unqualified;
        this.total_application = data.applicant_application.total_applicant;
        this.internal_application = data.applicant_application.internal;
        this.external_application = data.applicant_application.external;

        // plantilla_position
        this.funded = data.plantilla_position.funded;
        this.unfunded = data.plantilla_position.unfunded;
        this.filled = data.plantilla_position.occupied;
        this.vacant = data.plantilla_position.unoccupied;
        this.total_positions = data.plantilla_position.total_positions;

        // applicant_actual_application
        this.internal_applicant = data.applicant_actual_application.internal_actual;
        this.external_applicant = data.applicant_actual_application.external_actual;
        this.total_applicant = data.applicant_actual_application.total_application_actual;

        return data;
      } catch (error) {
        console.error('Error fetching the status:', error);
        this.error = 'Failed to fetch status summary.';
        throw error;
      } finally {
        this.loading = false;
        this.setAllCardLoading(false);
      }
    },

    async fetchSummaryByOffice(postDate = null) {
      this.loading = true;
      this.error = null;
      try {
        let url = '/dashboard/summary-by-office';
        if (postDate) {
          url += `?post_date=${encodeURIComponent(postDate)}`;
        }

        const response = await adminApi.get(url);
        this.summaryByOffice = response.data || [];
        return this.summaryByOffice;
      } catch (error) {
        this.summaryByOffice = [];
        const errorMessage = error.response?.data?.message || 'Failed to fetch summary by office';
        console.log(errorMessage);
        toast.warning(errorMessage);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchDashboardJobPosts(postDate = null) {
      this.loadingJobPosts = true;
      this.error = null;
      try {
        let url = '/dashboard/job-post';
        if (postDate) {
          url += `?post_date=${encodeURIComponent(postDate)}`;
        }

        const response = await adminApi.get(url);
        this.dashboardJobPosts = response.data || [];
        return this.dashboardJobPosts;
      } catch (error) {
        this.dashboardJobPosts = [];
        const errorMessage = error.response?.data?.message || 'Failed to fetch job posts';
        console.log(errorMessage);
        toast.warning(errorMessage);
        throw error;
      } finally {
        this.loadingJobPosts = false;
      }
    },

    async fetch_vwActive() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminApi.get('/vw-Active');
        return response.data.data;
      } catch (error) {
        toast.error('Failed to Load vwactive');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchStatus(status) {
      this.loading = true;
      const jsonEncode = {
        status: status,
      };
      try {
        const response = await adminApi.post('/vw-Active/status', jsonEncode);
        this.vw_status = response.data.data;
        return response.data.data;
      } catch (error) {
        this.vw_status = [];
        console.log(error.response.data?.message);
        toast.warning(error.response.data?.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Helper method to refresh all dashboard data with selected publication
    async refreshDashboard(publication) {
      if (publication) {
        const { post_date, end_date } = publication;
        await this.status(post_date, end_date);
        await this.fetchSummaryByOffice(post_date);
        await this.fetchDashboardJobPosts(post_date);
      } else {
        await this.status();
        await this.fetchSummaryByOffice();
        await this.fetchDashboardJobPosts();
      }
    },

    // Set all card loading states
    setAllCardLoading(isLoading) {
      this.loadingCards = {
        positions: isLoading,
        publication: isLoading,
        applicants: isLoading,
        applications: isLoading,
        preAssessment: isLoading,
        forAssessment: isLoading,
      };
    },

    // Set individual card loading state
    setCardLoading(cardName, isLoading) {
      if (Object.prototype.hasOwnProperty.call(this.loadingCards, cardName)) {
        this.loadingCards[cardName] = isLoading;
      }
    },
  },
});
