<template>
  <div class="report-header">
    <div class="header-container">
      <div class="green-line">
        <div class="line"></div>
      </div>
      <div class="city-logo">
        <img class="logo" alt="City of Tagum Logo" src="/logo.png" />
      </div>
      <div class="header-text">
        <div class="text-green-9 text-caption padded-text">REPUBLIC OF THE PHILIPPINES</div>
        <div class="text-green-9 text-caption padded-text">PROVINCE OF DAVAO DEL NORTE</div>
        <div class="text-green-9 text-weight-bold padded-text">CITY OF TAGUM</div>

        <div class="green-banner">
          <div class="text-subtitle3 padded-text">HUMAN RESOURCE MANAGEMENT OFFICE</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    officeName: {
      type: String,
      default: 'Human Resource Management Office',
    },
  });
</script>

<style scoped>
  .report-header {
    width: 100%;
    margin-bottom: 20px;
  }

  .header-container {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .city-logo {
    flex-shrink: 0;
  }

  .logo {
    width: 70px;
    height: auto;
    object-fit: contain;
  }

  .green-line {
    width: 60px;
    height: 80px;
    margin-right: 12px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .line {
    width: 60px;
    height: 28px;
    background-color: #036431;
  }

  .header-text {
    margin-left: 12px;
    width: 100%;
  }

  .padded-text {
    padding-left: 6px;
  }

  .green-banner {
    background-color: #036431;
    color: white;
    font-weight: bold;
    font-size: 9pt;
    padding: 5px 0;
    text-align: left;
    margin-top: 5px;
    width: 100%;
  }

  .text-green-9 {
    color: #036431;
  }

  .text-caption {
    font-size: 7pt;
    line-height: 1.2;
  }

  .text-h5 {
    font-size: 10pt;
    font-weight: bold;
  }

  .text-weight-bold {
    font-weight: bold;
  }

  /* Print styles */
  @media print {
    .green-banner,
    .line {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
