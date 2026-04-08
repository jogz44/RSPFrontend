import { adminApi } from 'boot/axios_admin'


export const viewApplicantScore = (scheduleId) => {
  return adminApi.put(`/applicant/exam/update/${scheduleId}`)
}

export const updateApplicantScore = (scheduleId,payload) => {
  return adminApi.put(`/applicant/exam/update/${scheduleId}`, payload)
}

export const deleteApplicantScore = (applicantExamScoreId) => {
  return adminApi.delete(`/applicant/exam/delete/${applicantExamScoreId}`)
}

export const cancelApplicantExamSchedule = (scheduleExamId) => {
  return adminApi.delete(`email/send/examination/cancel/${scheduleExamId}`)
}

