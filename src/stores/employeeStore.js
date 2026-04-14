import { defineStore } from "pinia";
import { getImageEmployeeInternal } from "src/service/employeeService";

export const useEmployeeStore = defineStore("employeeStore", {
  state: () => ({
    employeeImage: null,
  }),

  actions:{
      async getImageEmployeeInternal(controlNo) {
            try {
              const response = await getImageEmployeeInternal(controlNo);
              // Return the blob data so the component can create an object URL
              return response.data;
            } catch (error) {
              console.error("Error fetching employee image:", error);
              return null;
            }
          }
        }
});
