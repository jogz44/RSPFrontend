import { raterApi } from "boot/axios_rater";


// fetch the list of rater with there job assigned
export const raterListWithJob = (jobPostId) => {
  return raterApi.get(`rater/list-jobs/${jobPostId}`)
}

export const getApplicantScore = (payload) => {
 return raterApi.post('rater/rated-score', payload)
}
