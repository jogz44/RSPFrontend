import { adminApi } from "boot/axios_admin";


export const getImageEmployeeInternal = async (controlNo) => {
  return await adminApi.get(`/employee/photo/${controlNo}`, {
    responseType: 'blob', // Tell Axios to return binary data
  });
};
