import { defineStore } from 'pinia';
import { adminApi } from 'boot/axios_admin';
import { deleteApplicantScore, updateApplicantScore} from 'src/service/examService';

export const useExamScoreStore = defineStore('examScore', {
  state() {
    return {
      scores: [],
      noScoreApplicants: [],
      loading: false,
      pagination: {
        currentPage: 1,
        total: 0,
        perPage: 10,
        lastPage: 1,
      },
      noScorePagination: {
        currentPage: 1,
        total: 0,
        perPage: 10,
        lastPage: 1,
      },
    };
  },

  actions: {
    // async fetchScores(params = {}) {
    //   this.loading = true;
    //   try {
    //     const response = await adminApi.get('/applicant/exam/list-scores', { params });
    //     this.scores = response.data.data || [];
    //     this.pagination = {
    //       currentPage: response.data.current_page || 1,
    //       total: response.data.total || 0,
    //       perPage: response.data.per_page || 10,
    //       lastPage: response.data.last_page || 1,
    //     };
    //   } finally {
    //     this.loading = false;
    //   }
    // },
    async fetchScores(params = {}) {
  this.loading = true;
  try {
    const response = await adminApi.get('/applicant/exam/list-scores', {
      params: {
        page:      params.page      || 1,
        per_page:  params.perPage   || 10, // ✅ Laravel expects per_page, not perPage
        search:    params.search    || undefined,
        // position:  params.position  || undefined,
        // sortBy:    params.sortBy    || undefined,
        // descending: params.descending ?? undefined,
      },
    });
    this.scores = response.data.data || [];
    this.pagination = {
      currentPage: response.data.current_page || 1,
      total:       response.data.total        || 0,
      perPage:     response.data.per_page     || 10,
      lastPage:    response.data.last_page    || 1,
    };
  } finally {
    this.loading = false;
  }
},

    async fetchNoScoreApplicants(params = {}) {
      this.loading = true;
      try {
        const response = await adminApi.get('/applicant/list-no-exam', { params });
        this.noScoreApplicants = response.data.data || [];
        this.noScorePagination = {
          currentPage: response.data.current_page || 1,
          total: response.data.total || 0,
          perPage: response.data.per_page || 10,
          lastPage: response.data.last_page || 1,
        };
      } finally {
        this.loading = false;
      }
    },

    // FIX: accept payload and send it to the API
    async saveScores(payload) {
      this.loading = true;
      try {
        const response = await adminApi.post('/applicant/exam/score', payload);
        return response.data;
      } finally {
        this.loading = false;
      }
    },

    async deleteScore(applicantExamScoreId) {
      this.loading = true;
      try {
        await deleteApplicantScore(applicantExamScoreId);
        await this.fetchScores(); // refresh list
      } finally {
        this.loading = false;
      }
    },

    async updateScore(applicantExamScoreId, payload) {
      this.loading = true;
      try {
        await updateApplicantScore(applicantExamScoreId, payload);
        // await this.fetchScores(); // refresh list
      } finally {
        this.loading = false;
      }
    },


  },
});
