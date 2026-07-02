<template>
  <q-dialog v-model="show" persistent>
    <q-card class="bg-white modal-card column no-wrap">
      <!-- Header -->
      <q-card-section class="row items-center justify-between q-pa-md bg-grey-2">
        <div class="text-h6">Employee Reports - {{ employeeName }}</div>
        <q-btn flat dense icon="close" @click="close" aria-label="Close dialog" />
      </q-card-section>

      <q-separator />

      <!-- Tabs -->
      <q-tabs v-model="tab" class="bg-white text-primary" align="left" dense>
        <q-tab name="appointment" label="Appointment Report" />
        <q-tab name="certification" label="Certification" />
        <q-tab name="position" label="Position Description" />
      </q-tabs>

      <q-separator />

      <!-- Content (Scrollable Preview Only) -->
      <div class="q-pa-md overflow-auto" style="flex: 1; min-height: 0">
        <div v-if="pdfUrls[tab]" class="full-height">
          <iframe
            :src="pdfUrls[tab]"
            style="width: 100%; height: 100%; border: none"
            title="PDF Viewer"
          ></iframe>
        </div>
        <div
          v-else
          class="column items-center justify-center text-grey q-gutter-sm"
          style="height: 100%"
        >
          <q-spinner color="primary" size="32px" />
          <div>Generating PDF, please wait...</div>
        </div>
      </div>

      <q-separator />

      <!-- Footer -->
      <q-card-actions align="right" class="q-pa-sm">
        <q-btn
          color="primary"
          icon="print"
          label="Print"
          unelevated
          :disable="!pdfUrls[tab]"
          @click="printPdf"
        />
        <q-btn flat label="Close" color="primary" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';
  import AppointmentReport from 'src/components/Reports/AppointmentReport.vue';
  import CertificationPage from 'src/components/Reports/CertificationReport.vue';
  import PositionDescriptionForm from 'src/components/Reports/PositionDescriptionReport.vue';
  import html2pdf from 'html2pdf.js';
  import { createApp } from 'vue';

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    employee: { type: Object, required: true },
  });
  const emit = defineEmits(['update:modelValue', 'close']);

  const show = ref(props.modelValue);
  watch(
    () => props.modelValue,
    (val) => (show.value = val),
  );
  watch(show, (val) => emit('update:modelValue', val));

  function close() {
    show.value = false;
    emit('close');
  }

  // Compute employee name
  const employeeName = computed(() => {
    if (!props.employee) return 'Unknown Employee';
    return (
      `${props.employee.Surname || ''}, ${props.employee.Firstname || ''} ${props.employee.MIddlename || ''}`.trim() ||
      'Unknown Employee'
    );
  });

  const tab = ref('appointment');
  const pdfUrls = ref({});

  async function generatePdf(tabName) {
    let component;
    let componentProps;

    // Create a combined data object with employee info
    const appointmentData = {
      ...props.employee.appointmentData,
      // Add employee name fields directly
      Name: employeeName.value,
      Surname: props.employee.Surname,
      Firstname: props.employee.Firstname,
      MIddlename: props.employee.MIddlename,
      // Add other employee fields that might be needed
      ControlNo: props.employee.ControlNo,
      Designation: props.employee.Designation,
      Office: props.employee.Office,
      FromDate: props.employee.FromDate,
      ToDate: props.employee.ToDate,
      Status: props.employee.Status,
      ItemNo: props.employee.ItemNo,
      Pages: props.employee.Pages,
    };

    switch (tabName) {
      case 'appointment':
        component = AppointmentReport;
        componentProps = {
          data: appointmentData,
        };
        break;
      case 'certification':
        component = CertificationPage;
        componentProps = {
          data: appointmentData,
          officeName:
            props.employee.Office ||
            props.employee.appointmentData?.NewOffice ||
            'OFFICE OF THE CITY MAYOR',
        };
        break;
      case 'position':
        component = PositionDescriptionForm;
        componentProps = {
          data: appointmentData,
        };
        break;
    }

    console.log(`Generating PDF for ${tabName} with props:`, componentProps);

    const div = document.createElement('div');
    div.style.width = '816px';
    div.style.minHeight = '1344px';
    document.body.appendChild(div);

    const app = createApp(component, componentProps);
    app.mount(div);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const pdfBlob = await html2pdf()
      .set({
        margin: 0,
        filename: `${tabName}.pdf`,
        html2canvas: { scale: 5 },
        jsPDF: { unit: 'in', format: 'legal', orientation: 'portrait' },
      })
      .from(div)
      .outputPdf('blob');

    app.unmount();
    document.body.removeChild(div);

    return URL.createObjectURL(pdfBlob);
  }

  async function updatePdf(tabName) {
    pdfUrls.value[tabName] = '';
    pdfUrls.value[tabName] = await generatePdf(tabName);
  }

  watch(
    [tab, () => props.employee],
    async ([newTab]) => {
      if (!pdfUrls.value[newTab]) {
        await updatePdf(newTab);
      }
    },
    { immediate: true },
  );

  function printPdf() {
    const url = pdfUrls.value[tab.value];
    if (!url) return;
    const win = window.open(url, '_blank');
    setTimeout(() => {
      win.print();
    }, 500);
  }

  watch(show, async (val, oldVal) => {
    if (val && !oldVal) {
      await updatePdf(tab.value);
    }
  });
</script>

<style scoped>
  .modal-card {
    width: 100%;
    max-width: 800px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  }

  @media (max-width: 850px) {
    .modal-card {
      width: 95vw;
    }
  }
</style>
