<template>
  <q-page>
    <div>
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Personal Background Questionnaire</div>
          <div class="text-subtitle2" v-if="isReadOnly">View Only</div>
          <div class="text-subtitle2" v-else>View Only</div>
        </q-card-section>

        <!-- Read-only notice for ControlNo applicants -->
        <q-banner v-if="isReadOnly" class="bg-grey-2 text-grey-8" rounded>
          <div class="row items-center">
            <q-icon name="info" size="sm" class="q-mr-sm" />
            <span>This information is read-only for this applicant.</span>
          </div>
        </q-banner>

        <div class="q-gutter-md q-pa-md">
          <!-- Questions 34 -->
          <q-separator class="q-mb-md" />

          <div class="q-mb-md">
            <div class="text-bold">34.</div>
            Are you related by consanguinity or affinity to the appointing or recommending
            authority, to the chief of bureau or office or to the person who has immediate
            supervision over you in the Office, Bureau or Department where you will be appointed,
          </div>

          <div class="q-pl-md q-mb-md">
            <q-item tag="label">
              <q-item-section>
                <q-item-label>
                  <div class="text-bold">a.</div>
                  within the third degree?
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="formData.question_34a" :val="'1'" label="Yes" disable />
                <q-radio v-model="formData.question_34a" :val="'0'" label="No" disable />
              </q-item-section>
            </q-item>

            <q-item tag="label">
              <q-item-section>
                <q-item-label>
                  <div class="text-bold">b.</div>
                  within the fourth degree (for Local Government Unit - Career Employees)?
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="formData.question_34b" :val="'1'" label="Yes" disable />
                <q-radio v-model="formData.question_34b" :val="'0'" label="No" disable />
              </q-item-section>
            </q-item>

            <!-- Details for 34a if Yes -->
            <div v-if="formData.question_34a === '1'" class="q-pl-md q-mt-sm">
              <q-input
                v-model="formData.response_34"
                label="Please provide details"
                outlined
                dense
                disable
                type="textarea"
                rows="2"
              />
            </div>
          </div>

          <!-- Questions 35 -->
          <q-separator class="q-mb-md" />
          <div class="q-mb-md text-bold">35.</div>
          <div class="q-pl-md q-mb-md">
            <q-item tag="label">
              <q-item-section>
                <q-item-label>
                  <div class="text-bold">a.</div>
                  Have you ever been found guilty of any administrative offense?
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="formData.question_35a" :val="'1'" label="Yes" disable />
                <q-radio v-model="formData.question_35a" :val="'0'" label="No" disable />
              </q-item-section>
            </q-item>

            <!-- Details for 35a if Yes -->
            <div v-if="formData.question_35a === '1'" class="q-pl-md q-mt-sm">
              <q-input
                v-model="formData.response_35a"
                label="Please provide details (offense, date, penalty)"
                outlined
                dense
                disable
                type="textarea"
                rows="2"
              />
            </div>

            <q-item tag="label">
              <q-item-section>
                <q-item-label>
                  <div class="text-bold">b.</div>
                  Have you been criminally charged before any court?
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="formData.question_35b" :val="'1'" label="Yes" disable />
                <q-radio v-model="formData.question_35b" :val="'0'" label="No" disable />
              </q-item-section>
            </q-item>

            <!-- Details for 35b if Yes -->
            <div v-if="formData.question_35b === '1'" class="q-pl-md q-mt-sm">
              <q-input
                v-model="formData.response_35b_date"
                label="Date of filing"
                outlined
                dense
                disable
              />
              <q-input
                v-model="formData.response_35b_status"
                label="Status of case"
                outlined
                dense
                disable
                class="q-mt-sm"
              />
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Question 36 -->
          <q-item tag="label">
            <q-item-section>
              <q-item-label>
                <div class="text-bold">36.</div>
                Have you ever been convicted of any crime or violation of any law, decree, ordinance
                or regulation by any court or tribunal?
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio v-model="formData.question_36" :val="'1'" label="Yes" disable />
              <q-radio v-model="formData.question_36" :val="'0'" label="No" disable />
            </q-item-section>
          </q-item>

          <!-- Details for 36 if Yes -->
          <div v-if="formData.question_36 === '1'" class="q-pl-md q-mt-sm">
            <q-input
              v-model="formData.response_36"
              label="Please provide details (crime, date, court, penalty)"
              outlined
              dense
              disable
              type="textarea"
              rows="2"
            />
          </div>

          <q-separator class="q-mb-md" />

          <!-- Question 37 -->
          <q-item tag="label">
            <q-item-section>
              <q-item-label>
                <div class="text-bold">37.</div>
                Have you ever been separated from the service in any of the following modes:
                resignation, retirement, dropped from the rolls, dismissal, termination, end of
                term, finished contract or phased out (abolition) in the public or private sector?
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio v-model="formData.question_37" :val="'1'" label="Yes" disable />
              <q-radio v-model="formData.question_37" :val="'0'" label="No" disable />
            </q-item-section>
          </q-item>

          <!-- Details for 37 if Yes -->
          <div v-if="formData.question_37 === '1'" class="q-pl-md q-mt-sm">
            <q-input
              v-model="formData.response_37"
              label="Please provide details"
              outlined
              dense
              disable
              type="textarea"
              rows="2"
            />
          </div>

          <q-separator class="q-mb-md" />

          <!-- Question 38 -->
          <div class="text-bold q-mb-md">38.</div>
          <q-item tag="label">
            <q-item-section>
              <q-item-label>
                <div class="text-bold">a.</div>
                Have you ever been a candidate in a national or local election held within the last
                year (except Barangay election)?
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio v-model="formData.question_38a" :val="'1'" label="Yes" disable />
              <q-radio v-model="formData.question_38a" :val="'0'" label="No" disable />
            </q-item-section>
          </q-item>

          <!-- Details for 38a if Yes -->
          <div v-if="formData.question_38a === '1'" class="q-pl-md q-mt-sm">
            <q-input
              v-model="formData.response_38a"
              label="Please provide details (election, position, date)"
              outlined
              dense
              disable
              type="textarea"
              rows="2"
            />
          </div>

          <q-item tag="label" class="q-pl-md">
            <q-item-section>
              <q-item-label>
                <div class="text-bold">b.</div>
                Have you resigned from the government service during the three (3)-month period
                before the last election to promote/actively campaign for a national or local
                candidate?
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio v-model="formData.question_38b" :val="'1'" label="Yes" disable />
              <q-radio v-model="formData.question_38b" :val="'0'" label="No" disable />
            </q-item-section>
          </q-item>

          <!-- Details for 38b if Yes -->
          <div v-if="formData.question_38b === '1'" class="q-pl-md q-mt-sm">
            <q-input
              v-model="formData.response_38b"
              label="Please provide details"
              outlined
              dense
              disable
              type="textarea"
              rows="2"
            />
          </div>

          <q-separator class="q-mb-md" />

          <!-- Question 39 -->
          <q-item tag="label">
            <q-item-section>
              <q-item-label>
                <div class="text-bold">39.</div>
                Have you acquired the status of an immigrant or permanent resident of another
                country?
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio v-model="formData.question_39" :val="'1'" label="Yes" disable />
              <q-radio v-model="formData.question_39" :val="'0'" label="No" disable />
            </q-item-section>
          </q-item>

          <!-- Details for 39 if Yes -->
          <div v-if="formData.question_39 === '1'" class="q-pl-md q-mt-sm">
            <q-input
              v-model="formData.response_39"
              label="Please provide details (country, date acquired)"
              outlined
              dense
              disable
              type="textarea"
              rows="2"
            />
          </div>

          <!-- Question 40 -->
          <q-separator class="q-mb-md" />

          <div class="q-mb-md">
            <div class="text-bold">40.</div>
            Pursuant to: (a) Indigenous People's Act (RA 8371); (b) Magna Carta for Disabled Persons
            (RA 7277); and (c) Solo Parents Welfare Act of 2000 (RA 8972), please answer the
            following items:
          </div>

          <div class="q-pl-md q-mb-md">
            <q-item tag="label">
              <q-item-section>
                <q-item-label>
                  <div class="text-bold">a.</div>
                  Are you a member of any indigenous group?
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="formData.question_40a" :val="'1'" label="Yes" disable />
                <q-radio v-model="formData.question_40a" :val="'0'" label="No" disable />
              </q-item-section>
            </q-item>

            <q-item tag="label">
              <q-item-section>
                <q-item-label>
                  <div class="text-bold">b.</div>
                  Are you a person with disability?
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="formData.question_40b" :val="'1'" label="Yes" disable />
                <q-radio v-model="formData.question_40b" :val="'0'" label="No" disable />
              </q-item-section>
            </q-item>

            <q-item tag="label">
              <q-item-section>
                <q-item-label>
                  <div class="text-bold">c.</div>
                  Are you a solo parent?
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="formData.question_40c" :val="'1'" label="Yes" disable />
                <q-radio v-model="formData.question_40c" :val="'0'" label="No" disable />
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useQuasar } from 'quasar';

  const $q = useQuasar();

  const props = defineProps({
    personalDeclarations: {
      type: [Array, Object],
      required: false,
      default: () => [],
    },
    personalInfoId: { type: [Number, String], default: null },
    controlNo: { type: [String, Number], default: null },
    hasControlNo: { type: Boolean, required: false, default: false },
  });

  // Compute if we should show read-only (has ControlNo)
  const isReadOnly = computed(() => {
    return props.hasControlNo || !!props.controlNo;
  });

  // Helper function to normalize personal declarations data from either structure
  const normalizeDeclarationsData = (data) => {
    if (!data) return {};

    let declarationsObj = {};

    if (Array.isArray(data) && data.length > 0) {
      declarationsObj = data[0];
    } else if (
      data.personal_declarations &&
      Array.isArray(data.personal_declarations) &&
      data.personal_declarations.length > 0
    ) {
      declarationsObj = data.personal_declarations[0];
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      declarationsObj = data;
    }

    // Return normalized object with default values
    return {
      question_34a: declarationsObj.question_34a || '0',
      question_34b: declarationsObj.question_34b || '0',
      response_34: declarationsObj.response_34 || '',
      question_35a: declarationsObj.question_35a || '0',
      response_35a: declarationsObj.response_35a || '',
      question_35b: declarationsObj.question_35b || '0',
      response_35b_date: declarationsObj.response_35b_date || '',
      response_35b_status: declarationsObj.response_35b_status || '',
      question_36: declarationsObj.question_36 || '0',
      response_36: declarationsObj.response_36 || '',
      question_37: declarationsObj.question_37 || '0',
      response_37: declarationsObj.response_37 || '',
      question_38a: declarationsObj.question_38a || '0',
      response_38a: declarationsObj.response_38a || '',
      question_38b: declarationsObj.question_38b || '0',
      response_38b: declarationsObj.response_38b || '',
      question_39: declarationsObj.question_39 || '0',
      response_39: declarationsObj.response_39 || '',
      question_40a: declarationsObj.question_40a || '0',
      question_40b: declarationsObj.question_40b || '0',
      question_40c: declarationsObj.question_40c || '0',
    };
  };

  // Form data
  const formData = ref({
    question_34a: '0',
    question_34b: '0',
    response_34: '',
    question_35a: '0',
    response_35a: '',
    question_35b: '0',
    response_35b_date: '',
    response_35b_status: '',
    question_36: '0',
    response_36: '',
    question_37: '0',
    response_37: '',
    question_38a: '0',
    response_38a: '',
    question_38b: '0',
    response_38b: '',
    question_39: '0',
    response_39: '',
    question_40a: '0',
    question_40b: '0',
    question_40c: '0',
  });

  // Load data on mount
  onMounted(async () => {
    try {
      $q.loading.show({ message: 'Loading declarations data...' });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Normalize and set the data
      const normalizedData = normalizeDeclarationsData(props.personalDeclarations);
      formData.value = normalizedData;

      $q.loading.hide();
    } catch (error) {
      $q.loading.hide();
      $q.notify({
        color: 'negative',
        message: 'Failed to load declarations data',
        icon: 'error',
      });
      console.error('Data loading error:', error);
    }
  });
</script>

<style scoped>
  /* Print styles */
  @media print {
    .q-footer,
    .q-header {
      display: none !important;
    }

    .q-btn {
      display: none !important;
    }
  }

  /* Additional custom styles */
  .q-radio {
    margin-right: 12px;
  }
</style>
