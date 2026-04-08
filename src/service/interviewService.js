import { adminApi } from "boot/axios_admin";


export const cancelApplicantInterview = (ScheduleId) => {
  return adminApi.delete(`email/send/interview/cancel/${ScheduleId}`)
}

export const updateApplicantInterview = (scheduleId) => {
  return adminApi.put(`email/send/interview/update/${scheduleId}`)
}

