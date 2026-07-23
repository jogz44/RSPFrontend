<template>
  <q-page
    class="pds-page"
    :style="{
      '--bar-offset': `${stickyBarHeight}px`,
      '--mobile-nav-offset': `${mobileNavHeight}px`,
    }"
  >
    <!-- ═══════════════════════ Sticky Top Bar ═══════════════════════ -->
    <q-card ref="stickyBarRef" flat bordered class="sticky-header-card">
      <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
        <div>
          <div class="text-subtitle1 text-bold">Personal Data Sheet</div>
          <div class="text-caption text-blue-1">CS Form No. 212 &middot; Revised 2017</div>
        </div>
        <q-btn
          unelevated
          rounded
          label="Submit"
          icon="check_circle"
          color="white"
          text-color="primary"
          :loading="isSubmitting"
          @click="submitForm"
        />
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════ Mobile Section Nav (horizontal) ═══════════════════════ -->
    <div class="mobile-nav" ref="mobileNavRef">
      <div class="mobile-nav-scroll" ref="mobileNavScrollRef">
        <q-chip
          v-for="section in sections"
          :key="`mchip-${section.id}`"
          :ref="(el) => setChipRef(section.id, el)"
          clickable
          :outline="activeSection !== section.id"
          :color="activeSection === section.id ? 'primary' : 'grey-4'"
          :text-color="activeSection === section.id ? 'white' : 'grey-8'"
          :icon="section.icon"
          @click="scrollToSection(section.id)"
        >
          {{ section.label }}
        </q-chip>
      </div>
    </div>

    <!-- ═══════════════════════ Layout: Side Nav + Content ═══════════════════════ -->
    <div class="pds-layout">
      <!-- Desktop Side Navigation -->
      <aside class="side-nav">
        <q-card flat bordered class="side-nav-card">
          <q-card-section class="q-py-sm q-px-md bg-grey-2">
            <div class="text-caption text-grey-8 text-bold">JUMP TO SECTION</div>
          </q-card-section>
          <q-list separator>
            <q-item
              v-for="section in sections"
              :key="section.id"
              clickable
              v-ripple
              :active="activeSection === section.id"
              active-class="side-nav-active"
              @click="scrollToSection(section.id)"
            >
              <q-item-section avatar>
                <q-icon
                  :name="section.icon"
                  :color="activeSection === section.id ? 'primary' : 'grey-6'"
                  size="20px"
                />
              </q-item-section>
              <q-item-section>{{ section.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </aside>

      <!-- ═══════════════════════ Main Content ═══════════════════════ -->
      <div class="pds-content">
        <!-- Photo + Name Header -->
        <div id="section-photo" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center q-col-gutter-md">
                <div class="col-auto">
                  <div class="photo-upload-wrap" @click="triggerFileSelect">
                    <q-img
                      :src="photoPreview || 'https://placehold.co/100'"
                      class="bg-grey-4 photo-thumb"
                      ratio="1"
                    />
                    <div class="photo-overlay">
                      <q-icon name="photo_camera" size="20px" color="white" />
                    </div>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/*"
                      class="hidden-input"
                      @change="onPhotoSelected"
                    />
                  </div>
                  <div
                    class="text-caption text-grey-7 text-center q-mt-xs"
                    style="max-width: 150px"
                  >
                    2x2 ID Picture
                  </div>
                </div>
                <div class="col">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="form.personal.firstname"
                        label="First Name *"
                        outlined
                        dense
                        :rules="[
                          (val) => (!!val && val.trim().length > 0) || 'First Name is required',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="form.personal.middlename"
                        label="Middle Name"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="form.personal.lastname"
                        label="Last Name *"
                        outlined
                        dense
                        :rules="[
                          (val) => (!!val && val.trim().length > 0) || 'Last Name is required',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="form.personal.name_extension"
                        label="Name Extension (Jr., Sr., etc.)"
                        outlined
                        dense
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- I. Personal Information -->
        <div id="section-personal" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white q-py-sm">
              <div class="text-subtitle1 text-bold">I. Personal Information</div>
            </q-card-section>

            <q-card-section>
              <div class="section-label">Basic Information</div>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.date_of_birth"
                    label="Date of Birth *"
                    outlined
                    dense
                    mask="##/##/####"
                    hint="MM/DD/YYYY"
                    :rules="[
                      (val) => !!val || 'Date of Birth is required',
                      (val) => (val && val.length === 10) || 'Please enter valid date (MM/DD/YYYY)',
                    ]"
                    lazy-rules
                  >
                    <template v-slot:append>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.place_of_birth"
                    label="Place of Birth *"
                    outlined
                    dense
                    :rules="[
                      (val) => (!!val && val.trim().length > 0) || 'Place of Birth is required',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-2">
                  <q-select
                    v-model="form.personal.sex"
                    label="Sex *"
                    :options="sexOptions"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Sex is required']"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-2">
                  <q-select
                    v-model="form.personal.civil_status"
                    label="Civil Status *"
                    :options="civilStatusOptions"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Civil Status is required']"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-2">
                  <q-select
                    v-model="form.personal.blood_type"
                    label="Blood Type"
                    :options="bloodTypeOptions"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-2">
                  <q-input
                    v-model="form.personal.height"
                    label="Height (m)"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    min="0"
                    :rules="[
                      (val) =>
                        !val ||
                        (parseFloat(val) > 0 && parseFloat(val) < 3) ||
                        'Please enter valid height (0-3m)',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-2">
                  <q-input
                    v-model="form.personal.weight"
                    label="Weight (kg)"
                    outlined
                    dense
                    type="number"
                    step="0.1"
                    min="0"
                    :rules="[
                      (val) =>
                        !val ||
                        (parseFloat(val) > 0 && parseFloat(val) < 500) ||
                        'Please enter valid weight',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.personal.cellphone_number"
                    label="Cellphone Number *"
                    outlined
                    dense
                    mask="09###########"
                    hint="09XXXXXXXXX"
                    :rules="[
                      (val) => !!val || 'Cellphone Number is required',
                      (val) =>
                        /^09\d{9,10}$/.test(val) ||
                        'Invalid Philippine mobile number (09XXXXXXXXX)',
                    ]"
                    lazy-rules
                  >
                    <template v-slot:append>
                      <q-icon name="phone" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.personal.telephone_number"
                    label="Telephone Number"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.personal.email_address"
                    label="Email Address *"
                    outlined
                    dense
                    type="email"
                    :rules="[
                      (val) => !!val || 'Email Address is required',
                      (val) =>
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
                        'Invalid email format (example@domain.com)',
                    ]"
                    lazy-rules
                  >
                    <template v-slot:append>
                      <q-icon name="email" />
                    </template>
                  </q-input>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="section-label">Additional Information</div>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.citizenship"
                    label="Citizenship *"
                    outlined
                    dense
                    :rules="[
                      (val) => (!!val && val.trim().length > 0) || 'Citizenship is required',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.religion"
                    label="Religious Affiliation"
                    outlined
                    dense
                  />
                </div>
              </div>

              <!-- Gender Reference Row -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select
                    v-model="form.personal.gender_reference"
                    label="Gender Reference"
                    outlined
                    dense
                    :options="genderReferenceOptions"
                    emit-value
                    map-options
                    option-value="value"
                    option-label="label"
                    clearable
                  ></q-select>
                </div>
                <div
                  v-if="form.personal.gender_reference === 'Other'"
                  class="col-12 col-sm-6 col-md-8"
                >
                  <q-input
                    v-model="form.personal.gender_other"
                    label="Please specify your gender reference"
                    outlined
                    dense
                    :rules="[
                      (val) =>
                        (!!val && val.trim().length > 0) || 'Please specify your gender reference',
                    ]"
                    lazy-rules
                  />
                </div>
              </div>

              <!-- Ethnic Group Row -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select
                    v-model="form.personal.ethnic_group"
                    label="Ethnic Group"
                    outlined
                    dense
                    :options="ethnicGroupOptions"
                    emit-value
                    map-options
                    option-value="value"
                    option-label="label"
                    clearable
                  ></q-select>
                </div>
                <div v-if="form.personal.ethnic_group === 'Other'" class="col-12 col-sm-6 col-md-8">
                  <q-input
                    v-model="form.personal.ethnic_other"
                    label="Please specify your ethnic group"
                    outlined
                    dense
                    :rules="[
                      (val) =>
                        (!!val && val.trim().length > 0) || 'Please specify your ethnic group',
                    ]"
                    lazy-rules
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="section-label">Government IDs</div>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.gsis_no"
                    label="GSIS ID No."
                    outlined
                    dense
                    :rules="[
                      (val) => !val || /^[0-9-]+$/.test(val) || 'Please enter valid GSIS number',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.pagibig_no"
                    label="PAGIBIG ID No."
                    outlined
                    dense
                    :rules="[
                      (val) => !val || /^[0-9-]+$/.test(val) || 'Please enter valid PAGIBIG number',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.philhealth_no"
                    label="PHILHEALTH ID No."
                    outlined
                    dense
                    :rules="[
                      (val) =>
                        !val || /^[0-9-]+$/.test(val) || 'Please enter valid PHILHEALTH number',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.sss_no"
                    label="SSS No."
                    outlined
                    dense
                    :rules="[
                      (val) => !val || /^[0-9-]+$/.test(val) || 'Please enter valid SSS number',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.tin_no"
                    label="TIN No."
                    outlined
                    dense
                    :rules="[
                      (val) => !val || /^[0-9-]+$/.test(val) || 'Please enter valid TIN number',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.personal.agency_employee_no"
                    label="Agency Employee No."
                    outlined
                    dense
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="section-label">Residential Address</div>
              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.house"
                    label="House/Block/Lot No."
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.street"
                    label="Street/Purok *"
                    outlined
                    dense
                    :rules="[(val) => (!!val && val.trim().length > 0) || 'Street is required']"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.subdivision"
                    label="Subdivision/Village"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.barangay"
                    label="Barangay *"
                    outlined
                    dense
                    :rules="[(val) => (!!val && val.trim().length > 0) || 'Barangay is required']"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.city"
                    label="City/Municipality *"
                    outlined
                    dense
                    :rules="[
                      (val) => (!!val && val.trim().length > 0) || 'City/Municipality is required',
                    ]"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.province"
                    label="Province *"
                    outlined
                    dense
                    :rules="[(val) => (!!val && val.trim().length > 0) || 'Province is required']"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.region"
                    label="Region *"
                    outlined
                    dense
                    :rules="[(val) => (!!val && val.trim().length > 0) || 'Region is required']"
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.residential.zip"
                    label="Zip Code *"
                    outlined
                    dense
                    :rules="[
                      (val) => !!val || 'Zip Code is required',
                      (val) => /^[0-9]{4}$/.test(val) || 'Please enter valid 4-digit zip code',
                    ]"
                    lazy-rules
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row items-center justify-between q-mb-sm">
                <div class="section-label q-mb-none">Permanent Address</div>
                <q-checkbox
                  v-model="sameAsResidential"
                  label="Same as Residential Address"
                  dense
                  @update:model-value="onSameAddressToggle"
                />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.house"
                    label="House/Block/Lot No."
                    outlined
                    dense
                    :disable="sameAsResidential"
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.street"
                    label="Street/Purok *"
                    outlined
                    dense
                    :disable="sameAsResidential"
                    :rules="
                      sameAsResidential
                        ? []
                        : [(val) => (!!val && val.trim().length > 0) || 'Street is required']
                    "
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.subdivision"
                    label="Subdivision/Village"
                    outlined
                    dense
                    :disable="sameAsResidential"
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.barangay"
                    label="Barangay *"
                    outlined
                    dense
                    :disable="sameAsResidential"
                    :rules="
                      sameAsResidential
                        ? []
                        : [(val) => (!!val && val.trim().length > 0) || 'Barangay is required']
                    "
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.city"
                    label="City/Municipality *"
                    outlined
                    dense
                    :disable="sameAsResidential"
                    :rules="
                      sameAsResidential
                        ? []
                        : [
                            (val) =>
                              (!!val && val.trim().length > 0) || 'City/Municipality is required',
                          ]
                    "
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.province"
                    label="Province *"
                    outlined
                    dense
                    :disable="sameAsResidential"
                    :rules="
                      sameAsResidential
                        ? []
                        : [(val) => (!!val && val.trim().length > 0) || 'Province is required']
                    "
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.region"
                    label="Region *"
                    outlined
                    dense
                    :disable="sameAsResidential"
                    :rules="
                      sameAsResidential
                        ? []
                        : [(val) => (!!val && val.trim().length > 0) || 'Region is required']
                    "
                    lazy-rules
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="form.permanent.zip"
                    label="Zip Code *"
                    outlined
                    dense
                    :disable="sameAsResidential"
                    :rules="
                      sameAsResidential
                        ? []
                        : [
                            (val) => !!val || 'Zip Code is required',
                            (val) =>
                              /^[0-9]{4}$/.test(val) || 'Please enter valid 4-digit zip code',
                          ]
                    "
                    lazy-rules
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- II. Family Background -->
        <div id="section-family" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white q-py-sm">
              <div class="text-subtitle1 text-bold">II. Family Background</div>
            </q-card-section>

            <q-card-section>
              <div class="section-label">Spouse's Information</div>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.spouse_firstname"
                    label="Spouse's Firstname"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.spouse_name"
                    label="Spouse's Surname"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.spouse_middlename"
                    label="Spouse's Middlename"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.spouse_occupation"
                    label="Occupation"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.spouse_employer"
                    label="Employer/Business Name"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.spouse_employer_address"
                    label="Business Address"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.family.spouse_employer_telephone"
                    label="Business Telephone"
                    outlined
                    dense
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="section-label">Parent's Information</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.father_firstname"
                    label="Father's Firstname"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.father_lastname"
                    label="Father's Surname"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.father_middlename"
                    label="Father's Middlename"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.mother_firstname"
                    label="Mother's Firstname"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.mother_lastname"
                    label="Mother's Surname"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model="form.family.mother_middlename"
                    label="Mother's Middlename"
                    outlined
                    dense
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row items-center justify-between q-mb-sm">
                <div class="section-label q-mb-none">Children's Information</div>
                <q-btn
                  unelevated
                  rounded
                  label="Add Child"
                  icon="add"
                  color="primary"
                  size="sm"
                  @click="addChild"
                />
              </div>

              <q-card
                v-for="(child, idx) in form.children"
                :key="`child-${idx}`"
                flat
                bordered
                class="q-mb-sm"
              >
                <q-card-section class="row items-center q-gutter-x-md q-py-sm">
                  <div class="text-grey-7 text-caption col-auto">#{{ idx + 1 }}</div>
                  <div class="col">
                    <q-input v-model="child.child_name" label="Full Name" outlined dense />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="child.birth_date"
                      label="Birth Date (MM/DD/YYYY)"
                      outlined
                      dense
                      mask="##/##/####"
                      :rules="[
                        (val) =>
                          !val ||
                          (val && val.length === 10) ||
                          'Please enter valid date (MM/DD/YYYY)',
                      ]"
                      lazy-rules
                    />
                  </div>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="removeChild(idx)"
                  />
                </q-card-section>
              </q-card>

              <q-banner v-if="!form.children.length" class="text-grey-7 bg-grey-2" rounded>
                No children added. Click "Add Child" to add one.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- III. Educational Background -->
        <div id="section-education" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
              <div class="text-subtitle1 text-bold">III. Educational Background</div>
              <q-btn
                unelevated
                rounded
                label="Add Row"
                icon="add"
                color="white"
                text-color="primary"
                size="sm"
                @click="addEducation"
              />
            </q-card-section>

            <q-card-section>
              <q-banner class="upload-instruction-banner bg-blue-1 text-blue q-mb-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                <div class="banner-text">
                  <strong>Upload supporting documents:</strong>
                  For each educational record, you can upload relevant documents such as diplomas,
                  transcript of records, or certificates of graduation. Make it one pdf file for
                  multiple documents.
                </div>
              </q-banner>

              <q-card
                v-for="(row, idx) in form.education"
                :key="`educ-${idx}`"
                flat
                bordered
                class="q-mb-md"
              >
                <q-card-section>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle2 text-bold text-grey-7">Row #{{ idx + 1 }}</div>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="removeRow('education', idx)"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6 col-md-4">
                      <q-select
                        v-model="row.level"
                        label="Level"
                        :options="levelOptions"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-8">
                      <q-input v-model="row.school_name" label="School Name" outlined dense />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input v-model="row.degree" label="Degree / Course" outlined dense />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input v-model="row.attendance_from" label="From" outlined dense />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input v-model="row.attendance_to" label="To" outlined dense />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.highest_units"
                        label="Highest Units Earned"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.year_graduated"
                        label="Year Graduated"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val || /^[0-9]{4}$/.test(val) || 'Please enter valid year (YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="row.scholarship"
                        label="Scholarship / Honors"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-select
                        v-model="row.graduated"
                        label="Graduated?"
                        :options="yesNoOptions"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12">
                      <div class="upload-section">
                        <div class="upload-label text-grey-7 q-mb-xs">
                          <q-icon name="attach_file" size="16px" class="q-mr-xs" />
                          <span class="text-caption">Upload Supporting Documents</span>
                        </div>
                        <q-file
                          v-model="row.file"
                          label="Upload document(s) (PDF, JPG, PNG)"
                          outlined
                          dense
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          multiple
                          use-chips
                          stack-label
                        >
                          <template v-slot:append>
                            <q-icon name="cloud_upload" />
                          </template>
                        </q-file>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-banner v-if="!form.education.length" class="text-grey-7 bg-grey-2" rounded>
                No education records. Click "Add Row" to add one.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- IV. Civil Service Eligibility -->
        <div id="section-eligibility" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
              <div class="text-subtitle1 text-bold">IV. Civil Service Eligibility</div>
              <q-btn
                unelevated
                rounded
                label="Add Row"
                icon="add"
                color="white"
                text-color="primary"
                size="sm"
                @click="addEligibility"
              />
            </q-card-section>

            <q-card-section>
              <q-banner class="upload-instruction-banner bg-orange-1 text-orange q-mb-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                <div class="banner-text">
                  <strong>Upload supporting documents:</strong>
                  For each eligibility record, you can upload certificates, ratings, or license
                  documents. Make it one pdf file for multiple documents.
                </div>
              </q-banner>

              <q-card
                v-for="(row, idx) in form.eligibility"
                :key="`elig-${idx}`"
                flat
                bordered
                class="q-mb-md"
              >
                <q-card-section>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle2 text-bold text-grey-7">Row #{{ idx + 1 }}</div>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="removeRow('eligibility', idx)"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="row.eligibility"
                        label="Eligibility / Career Service"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input v-model="row.rating" label="Rating (if applicable)" outlined dense />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.date_of_examination"
                        label="Date of Exam"
                        outlined
                        dense
                        hint="MM/DD/YYYY"
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="row.place_of_examination"
                        label="Place of Examination"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-4">
                      <q-input
                        v-model="row.license_number"
                        label="License Number"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val || /^[0-9-]+$/.test(val) || 'Please enter valid license number',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-4">
                      <q-input
                        v-model="row.date_of_validity"
                        label="Date of Validity"
                        outlined
                        dense
                        hint="MM/DD/YYYY"
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-4">
                      <div class="upload-section">
                        <div class="upload-label text-grey-7 q-mb-xs">
                          <q-icon name="attach_file" size="16px" class="q-mr-xs" />
                          <span class="text-caption">Upload Supporting Documents</span>
                        </div>
                        <q-file
                          v-model="row.file"
                          label="Upload document(s) (PDF, JPG, PNG)"
                          outlined
                          dense
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          multiple
                          use-chips
                          stack-label
                        >
                          <template v-slot:append>
                            <q-icon name="cloud_upload" />
                          </template>
                        </q-file>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-banner v-if="!form.eligibility.length" class="text-grey-7 bg-grey-2" rounded>
                No eligibility records. Click "Add Row" to add one.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- V. Work Experience -->
        <div id="section-work" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
              <div class="text-subtitle1 text-bold">V. Work Experience</div>
              <q-btn
                unelevated
                rounded
                label="Add Row"
                icon="add"
                color="white"
                text-color="primary"
                size="sm"
                @click="addWork"
              />
            </q-card-section>

            <q-card-section>
              <q-banner class="upload-instruction-banner bg-green-1 text-green q-mb-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                <div class="banner-text">
                  <strong>Upload supporting documents:</strong>
                  For each work experience, upload relevant documents such as:
                  <ul class="q-mt-sm q-mb-none" style="padding-left: 20px">
                    <li><strong>Certificate of Employment (COE)</strong></li>
                    <li><strong>Performance Rating</strong></li>
                    <li>
                      <strong>Work Experience Sheet (WES)</strong>
                      - Download the template below
                    </li>
                  </ul>
                  Make it one pdf file for multiple documents.
                </div>
              </q-banner>

              <q-card
                v-for="(row, idx) in form.workExperience"
                :key="`work-${idx}`"
                flat
                bordered
                class="q-mb-md"
              >
                <q-card-section>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle2 text-bold text-grey-7">Row #{{ idx + 1 }}</div>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="removeRow('workExperience', idx)"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.work_date_from"
                        label="From (MM/DD/YYYY)"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.work_date_to"
                        label="To (MM/DD/YYYY)"
                        outlined
                        dense
                        hint="Type 'PRESENT' for current job"
                        :rules="[
                          (val) =>
                            !val ||
                            val === 'PRESENT' ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY) or PRESENT',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input v-model="row.position_title" label="Position Title" outlined dense />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="row.department"
                        label="Department / Office"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.monthly_salary"
                        label="Monthly Salary"
                        outlined
                        dense
                        type="number"
                        :rules="[
                          (val) => !val || parseFloat(val) >= 0 || 'Please enter valid salary',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input v-model="row.salary_grade" label="Salary Grade" outlined dense />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-select
                        v-model="row.status_of_appointment"
                        label="Status of Appointment"
                        :options="appointmentOptions"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-select
                        v-model="row.government_service"
                        label="Gov't Service?"
                        :options="yesNoOptions"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12">
                      <div class="upload-section">
                        <div class="upload-label text-grey-7 q-mb-xs">
                          <q-icon name="attach_file" size="16px" class="q-mr-xs" />
                          <span class="text-caption">Upload Supporting Documents</span>
                          <span class="text-caption text-grey-6">
                            (COE, Performance Rating, WES)
                          </span>
                        </div>
                        <q-file
                          v-model="row.file"
                          label="Upload document(s) (PDF, JPG, PNG)"
                          outlined
                          dense
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          multiple
                          use-chips
                          stack-label
                        >
                          <template v-slot:append>
                            <q-icon name="cloud_upload" />
                          </template>
                        </q-file>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="wes-download-section q-mt-sm">
                        <div class="row items-center">
                          <div class="col-auto">
                            <q-icon name="download" size="20px" color="green" class="q-mr-sm" />
                          </div>
                          <div class="col">
                            <div class="text-caption text-grey-7">
                              <strong>Work Experience Sheet (WES) Template</strong>
                              <span class="text-grey-6 q-ml-sm">
                                - Download, fill up, then upload as PDF or image
                              </span>
                            </div>
                            <q-btn
                              color="green"
                              size="sm"
                              unelevated
                              icon="download"
                              label="Download WES Template"
                              @click="downloadWES"
                              class="q-mt-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-banner v-if="!form.workExperience.length" class="text-grey-7 bg-grey-2" rounded>
                No work experience records. Click "Add Row" to add one.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- VI. Voluntary Work -->
        <div id="section-voluntary" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
              <div class="text-subtitle1 text-bold">VI. Voluntary Work</div>
              <q-btn
                unelevated
                rounded
                label="Add Row"
                icon="add"
                color="white"
                text-color="primary"
                size="sm"
                @click="addVoluntary"
              />
            </q-card-section>

            <q-card-section>
              <q-card
                v-for="(row, idx) in form.voluntaryWork"
                :key="`vol-${idx}`"
                flat
                bordered
                class="q-mb-md"
              >
                <q-card-section>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle2 text-bold text-grey-7">Row #{{ idx + 1 }}</div>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="removeRow('voluntaryWork', idx)"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input
                        v-model="row.organization_name"
                        label="Organization Name &amp; Address"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.inclusive_date_from"
                        label="From (MM/DD/YYYY)"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.inclusive_date_to"
                        label="To (MM/DD/YYYY)"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.number_of_hours"
                        label="Number of Hours"
                        outlined
                        dense
                        type="number"
                        :rules="[
                          (val) => !val || parseFloat(val) > 0 || 'Please enter valid hours',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.position"
                        label="Position / Nature of Work"
                        outlined
                        dense
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-banner v-if="!form.voluntaryWork.length" class="text-grey-7 bg-grey-2" rounded>
                No voluntary work records. Click "Add Row" to add one.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- VII. L&D Interventions -->
        <div id="section-training" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
              <div class="text-subtitle1 text-bold">VII. L&amp;D Interventions</div>
              <q-btn
                unelevated
                rounded
                label="Add Row"
                icon="add"
                color="white"
                text-color="primary"
                size="sm"
                @click="addTraining"
              />
            </q-card-section>

            <q-card-section>
              <q-banner class="upload-instruction-banner bg-purple-1 text-purple q-mb-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                <div class="banner-text">
                  <strong>Upload supporting documents:</strong>
                  For each training/L&D intervention, upload certificates of completion, attendance
                  certificates, or training records. Make it one pdf file for multiple documents.
                </div>
              </q-banner>

              <q-card
                v-for="(row, idx) in form.training"
                :key="`train-${idx}`"
                flat
                bordered
                class="q-mb-md"
              >
                <q-card-section>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle2 text-bold text-grey-7">Row #{{ idx + 1 }}</div>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="removeRow('training', idx)"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input
                        v-model="row.training_title"
                        label="Title of Learning &amp; Development Intervention"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.inclusive_date_from"
                        label="From (MM/DD/YYYY)"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input
                        v-model="row.inclusive_date_to"
                        label="To (MM/DD/YYYY)"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-2">
                      <q-input
                        v-model="row.number_of_hours"
                        label="No. of Hours"
                        outlined
                        dense
                        type="number"
                        :rules="[
                          (val) => !val || parseFloat(val) > 0 || 'Please enter valid hours',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-4">
                      <q-select
                        v-model="row.type"
                        label="Type"
                        :options="trainingTypeOptions"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="row.conducted_by"
                        label="Conducted / Sponsored By"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-md-6">
                      <div class="upload-section">
                        <div class="upload-label text-grey-7 q-mb-xs">
                          <q-icon name="attach_file" size="16px" class="q-mr-xs" />
                          <span class="text-caption">Upload Supporting Documents</span>
                        </div>
                        <q-file
                          v-model="row.file"
                          label="Upload document(s) (PDF, JPG, PNG)"
                          outlined
                          dense
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          multiple
                          use-chips
                          stack-label
                        >
                          <template v-slot:append>
                            <q-icon name="cloud_upload" />
                          </template>
                        </q-file>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-banner v-if="!form.training.length" class="text-grey-7 bg-grey-2" rounded>
                No training records. Click "Add Row" to add one.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- VIII. Other Information -->
        <div id="section-other" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white q-py-sm">
              <div class="text-subtitle1 text-bold">VIII. Other Information</div>
            </q-card-section>

            <q-card-section>
              <!-- Skills & Hobbies -->
              <div class="row items-center justify-between q-mb-sm">
                <div class="section-label q-mb-none">Special Skills &amp; Hobbies</div>
                <q-btn
                  unelevated
                  rounded
                  label="Add Skill"
                  icon="add"
                  color="primary"
                  size="sm"
                  @click="addSkill"
                />
              </div>
              <q-card
                v-for="(row, idx) in form.skills"
                :key="`skill-${idx}`"
                flat
                bordered
                class="q-mb-sm"
              >
                <q-card-section class="row items-center q-gutter-x-md q-py-sm">
                  <div class="text-grey-7 text-caption col-auto">#{{ idx + 1 }}</div>
                  <div class="col">
                    <q-input v-model="row.skill" label="Skill / Hobby" outlined dense />
                  </div>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="removeRow('skills', idx)"
                  />
                </q-card-section>
              </q-card>
              <q-banner v-if="!form.skills.length" class="text-grey-7 bg-grey-2 q-mb-md" rounded>
                No skills or hobbies added yet.
              </q-banner>

              <q-separator class="q-my-md" />

              <!-- Non-Academic Distinctions -->
              <div class="row items-center justify-between q-mb-sm">
                <div class="section-label q-mb-none">Non-Academic Distinctions / Recognition</div>
                <q-btn
                  unelevated
                  rounded
                  label="Add Distinction"
                  icon="add"
                  color="primary"
                  size="sm"
                  @click="addDistinction"
                />
              </div>
              <q-card
                v-for="(row, idx) in form.distinctions"
                :key="`dist-${idx}`"
                flat
                bordered
                class="q-mb-sm"
              >
                <q-card-section class="row items-center q-gutter-x-md q-py-sm">
                  <div class="text-grey-7 text-caption col-auto">#{{ idx + 1 }}</div>
                  <div class="col">
                    <q-input
                      v-model="row.non_academic"
                      label="Distinction / Recognition"
                      outlined
                      dense
                      type="textarea"
                      rows="1"
                    />
                  </div>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="removeRow('distinctions', idx)"
                  />
                </q-card-section>
              </q-card>
              <q-banner
                v-if="!form.distinctions.length"
                class="text-grey-7 bg-grey-2 q-mb-md"
                rounded
              >
                No non-academic distinctions added yet.
              </q-banner>

              <q-separator class="q-my-md" />

              <!-- Membership -->
              <div class="row items-center justify-between q-mb-sm">
                <div class="section-label q-mb-none">Membership in Association / Organization</div>
                <q-btn
                  unelevated
                  rounded
                  label="Add Membership"
                  icon="add"
                  color="primary"
                  size="sm"
                  @click="addMembership"
                />
              </div>
              <q-card
                v-for="(row, idx) in form.memberships"
                :key="`mem-${idx}`"
                flat
                bordered
                class="q-mb-sm"
              >
                <q-card-section>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle2 text-bold text-grey-7">
                      Membership #{{ idx + 1 }}
                    </div>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="removeRow('memberships', idx)"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input
                        v-model="row.organization"
                        label="Organization / Association Name"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input v-model="row.position" label="Position / Role" outlined dense />
                    </div>
                    <div class="col-12 col-sm-3">
                      <q-input
                        v-model="row.inclusive_date_from"
                        label="From (MM/DD/YYYY)"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                    <div class="col-12 col-sm-3">
                      <q-input
                        v-model="row.inclusive_date_to"
                        label="To (MM/DD/YYYY)"
                        outlined
                        dense
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val.length === 10) ||
                            'Please enter valid date (MM/DD/YYYY)',
                        ]"
                        lazy-rules
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              <q-banner v-if="!form.memberships.length" class="text-grey-7 bg-grey-2" rounded>
                No memberships added yet.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- IX. References -->
        <div id="section-references" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
              <div class="text-subtitle1 text-bold">IX. Character References</div>
              <q-btn
                unelevated
                rounded
                label="Add Row"
                icon="add"
                color="white"
                text-color="primary"
                size="sm"
                @click="addReference"
              />
            </q-card-section>

            <q-card-section>
              <q-card
                v-for="(row, idx) in form.references"
                :key="`ref-${idx}`"
                flat
                bordered
                class="q-mb-sm"
              >
                <q-card-section class="row items-center q-gutter-x-md q-py-sm">
                  <div class="text-grey-7 text-caption col-auto">#{{ idx + 1 }}</div>
                  <div class="col">
                    <q-input v-model="row.full_name" label="Full Name" outlined dense />
                  </div>
                  <div class="col">
                    <q-input v-model="row.address" label="Address" outlined dense />
                  </div>
                  <div class="col-12 col-sm-3">
                    <q-input
                      v-model="row.contact_number"
                      label="Contact Number"
                      outlined
                      dense
                      :rules="[
                        (val) =>
                          !val ||
                          /^09\d{9,10}$/.test(val) ||
                          'Invalid Philippine mobile number (09XXXXXXXXX)',
                      ]"
                      lazy-rules
                    />
                  </div>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="removeRow('references', idx)"
                  />
                </q-card-section>
              </q-card>

              <q-banner v-if="!form.references.length" class="text-grey-7 bg-grey-2" rounded>
                No references added yet.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- X. Personal Background Questionnaire -->
        <div id="section-declarations" class="scroll-target">
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="bg-primary text-white q-py-sm">
              <div class="text-subtitle1 text-bold">X. Personal Background Questionnaire</div>
            </q-card-section>

            <div class="q-gutter-md q-pa-md">
              <q-separator class="q-mb-md" />

              <div class="q-mb-md">
                <div class="text-bold">34.</div>
                Are you related by consanguinity or affinity to the appointing or recommending
                authority, to the chief of bureau or office or to the person who has immediate
                supervision over you in the Office, Bureau or Department where you will be
                appointed,
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
                    <q-radio v-model="formData.relationThirdDegree" val="Yes" label="Yes" />
                    <q-radio v-model="formData.relationThirdDegree" val="No" label="No" />
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
                    <q-radio v-model="formData.relationFourthDegree" val="Yes" label="Yes" />
                    <q-radio v-model="formData.relationFourthDegree" val="No" label="No" />
                  </q-item-section>
                </q-item>

                <div
                  v-if="
                    formData.relationThirdDegree === 'Yes' ||
                    formData.relationFourthDegree === 'Yes'
                  "
                  class="q-pl-md q-mt-sm"
                >
                  <q-input
                    v-model="formData.relationDetails"
                    label="Please provide details"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    :rules="[(val) => (!!val && val.trim().length > 0) || 'Details are required']"
                    lazy-rules
                  />
                </div>
              </div>

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
                    <q-radio v-model="formData.administrativeOffense" val="Yes" label="Yes" />
                    <q-radio v-model="formData.administrativeOffense" val="No" label="No" />
                  </q-item-section>
                </q-item>

                <div v-if="formData.administrativeOffense === 'Yes'" class="q-pl-md q-mb-sm">
                  <q-input
                    v-model="formData.administrativeOffenseDetails"
                    label="Please provide details (offense, date, penalty)"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    :rules="[(val) => (!!val && val.trim().length > 0) || 'Details are required']"
                    lazy-rules
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
                    <q-radio v-model="formData.criminallyCharged" val="Yes" label="Yes" />
                    <q-radio v-model="formData.criminallyCharged" val="No" label="No" />
                  </q-item-section>
                </q-item>

                <div
                  v-if="formData.criminallyCharged === 'Yes'"
                  class="q-pl-md row q-col-gutter-sm"
                >
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="formData.criminalCaseDateFiled"
                      label="Date of filing"
                      outlined
                      dense
                      :rules="[(val) => !!val || 'Date of filing is required']"
                      lazy-rules
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="formData.criminalCaseStatus"
                      label="Status of case"
                      outlined
                      dense
                      :rules="[(val) => !!val || 'Status is required']"
                      lazy-rules
                    />
                  </div>
                </div>
              </div>

              <q-separator class="q-mb-md" />

              <q-item tag="label">
                <q-item-section>
                  <q-item-label>
                    <div class="text-bold">36.</div>
                    Have you ever been convicted of any crime or violation of any law, decree,
                    ordinance or regulation by any court or tribunal?
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-radio v-model="formData.convicted" val="Yes" label="Yes" />
                  <q-radio v-model="formData.convicted" val="No" label="No" />
                </q-item-section>
              </q-item>

              <div v-if="formData.convicted === 'Yes'" class="q-pl-md q-mt-sm">
                <q-input
                  v-model="formData.convictedDetails"
                  label="Please provide details (crime, date, court, penalty)"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                  :rules="[(val) => (!!val && val.trim().length > 0) || 'Details are required']"
                  lazy-rules
                />
              </div>

              <q-separator class="q-mb-md" />

              <q-item tag="label">
                <q-item-section>
                  <q-item-label>
                    <div class="text-bold">37.</div>
                    Have you ever been separated from the service in any of the following modes:
                    resignation, retirement, dropped from the rolls, dismissal, termination, end of
                    term, finished contract or phased out (abolition) in the public or private
                    sector?
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-radio v-model="formData.separatedFromService" val="Yes" label="Yes" />
                  <q-radio v-model="formData.separatedFromService" val="No" label="No" />
                </q-item-section>
              </q-item>

              <div v-if="formData.separatedFromService === 'Yes'" class="q-pl-md q-mt-sm">
                <q-input
                  v-model="formData.separatedFromServiceDetails"
                  label="Please provide details"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                  :rules="[(val) => (!!val && val.trim().length > 0) || 'Details are required']"
                  lazy-rules
                />
              </div>

              <q-separator class="q-mb-md" />

              <div class="text-bold q-mb-md">38.</div>
              <q-item tag="label">
                <q-item-section>
                  <q-item-label>
                    <div class="text-bold">a.</div>
                    Have you ever been a candidate in a national or local election held within the
                    last year (except Barangay election)?
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-radio v-model="formData.electionCandidate" val="Yes" label="Yes" />
                  <q-radio v-model="formData.electionCandidate" val="No" label="No" />
                </q-item-section>
              </q-item>

              <div v-if="formData.electionCandidate === 'Yes'" class="q-pl-md q-mb-sm">
                <q-input
                  v-model="formData.electionCandidateDetails"
                  label="Please provide details (election, position, date)"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                  :rules="[(val) => (!!val && val.trim().length > 0) || 'Details are required']"
                  lazy-rules
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
                  <q-radio v-model="formData.resignedForCampaign" val="Yes" label="Yes" />
                  <q-radio v-model="formData.resignedForCampaign" val="No" label="No" />
                </q-item-section>
              </q-item>

              <div v-if="formData.resignedForCampaign === 'Yes'" class="q-pl-md q-mt-sm">
                <q-input
                  v-model="formData.resignedForCampaignDetails"
                  label="Please provide details"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                  :rules="[(val) => (!!val && val.trim().length > 0) || 'Details are required']"
                  lazy-rules
                />
              </div>

              <q-separator class="q-mb-md" />

              <q-item tag="label">
                <q-item-section>
                  <q-item-label>
                    <div class="text-bold">39.</div>
                    Have you acquired the status of an immigrant or permanent resident of another
                    country?
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-radio v-model="formData.immigrant" val="Yes" label="Yes" />
                  <q-radio v-model="formData.immigrant" val="No" label="No" />
                </q-item-section>
              </q-item>

              <div v-if="formData.immigrant === 'Yes'" class="q-pl-md q-mt-sm">
                <q-input
                  v-model="formData.immigrantDetails"
                  label="Please provide details (country, date acquired)"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                  :rules="[(val) => (!!val && val.trim().length > 0) || 'Details are required']"
                  lazy-rules
                />
              </div>

              <q-separator class="q-mb-md" />

              <div class="q-mb-md">
                <div class="text-bold">40.</div>
                Pursuant to: (a) Indigenous People's Act (RA 8371); (b) Magna Carta for Disabled
                Persons (RA 7277); and (c) Solo Parents Welfare Act of 2000 (RA 8972), please answer
                the following items:
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
                    <q-radio v-model="formData.indigenous" val="Yes" label="Yes" />
                    <q-radio v-model="formData.indigenous" val="No" label="No" />
                  </q-item-section>
                </q-item>

                <!-- Indigenous Group "Please specify" field -->
                <div v-if="formData.indigenous === 'Yes'" class="q-pl-md q-mt-sm">
                  <q-input
                    v-model="formData.indigenousDetails"
                    label="Please specify your indigenous group"
                    outlined
                    dense
                    :rules="[
                      (val) =>
                        (!!val && val.trim().length > 0) || 'Please specify your indigenous group',
                    ]"
                    lazy-rules
                  />
                </div>

                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>
                      <div class="text-bold">b.</div>
                      Are you a person with disability?
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-radio v-model="formData.pwd" val="Yes" label="Yes" />
                    <q-radio v-model="formData.pwd" val="No" label="No" />
                  </q-item-section>
                </q-item>

                <div v-if="formData.pwd === 'Yes'" class="q-pl-md q-mt-sm">
                  <div class="text-subtitle2 text-grey-7">Please select disability type(s):</div>
                  <q-select
                    v-model="formData.pwdTypes"
                    label="Disability Types"
                    multiple
                    outlined
                    dense
                    :options="pwdOptions"
                    use-chips
                    stack-label
                    :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Please select at least one disability type',
                    ]"
                    lazy-rules
                  />
                </div>

                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>
                      <div class="text-bold">c.</div>
                      Are you a solo parent?
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-radio v-model="formData.soloParent" val="Yes" label="Yes" />
                    <q-radio v-model="formData.soloParent" val="No" label="No" />
                  </q-item-section>
                </q-item>

                <!-- Solo Parent "Please specify" field -->
                <div v-if="formData.soloParent === 'Yes'" class="q-pl-md q-mt-sm">
                  <q-input
                    v-model="formData.soloParentDetails"
                    label="Please provide details (if applicable)"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- ═══════════════════════ Bottom Submit ═══════════════════════ -->
        <div class="row justify-end q-mb-xl q-mr-md">
          <q-btn
            unelevated
            rounded
            label="Submit"
            icon="check_circle"
            color="primary"
            :loading="isSubmitting"
            @click="submitForm"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
  import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useQuasar } from 'quasar';

  const $q = useQuasar();
  const emit = defineEmits(['submit']);

  // ── Options ──────────────────────────────────────────────────
  const sexOptions = ['Male', 'Female'];
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated', 'Annulled'];
  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const levelOptions = [
    'Elementary',
    'Secondary',
    'Vocational / Trade Course',
    'College',
    'Graduate Studies',
  ];
  const appointmentOptions = ['Permanent', 'Temporary', 'Casual', 'Contractual', 'Co-terminus'];
  const trainingTypeOptions = [
    'Managerial',
    'Supervisory',
    'Technical',
    'Foundation',
    'Orientation',
  ];
  const yesNoOptions = ['Yes', 'No'];

  // Gender Reference Options
  const genderReferenceOptions = [
    { label: 'Female', value: 'Female' },
    { label: 'Male', value: 'Male' },
    { label: 'Lesbian', value: 'Lesbian' },
    { label: 'Gay', value: 'Gay' },
    { label: 'Bisexual', value: 'Bisexual' },
    { label: 'Transgender', value: 'Transgender' },
    { label: 'Transgender Woman', value: 'Transgender Woman' },
    { label: 'Transgender Man', value: 'Transgender Man' },
    { label: 'Non-binary', value: 'Non-binary' },
    { label: 'Gender Fluid', value: 'Gender Fluid' },
    { label: 'Queer', value: 'Queer' },
    { label: 'Intersex', value: 'Intersex' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
    { label: 'Other', value: 'Other' },
  ];

  // Ethnic Group Options
  const ethnicGroupOptions = [
    { label: 'Maguindanao', value: 'Maguindanao' },
    { label: 'Maranao', value: 'Maranao' },
    { label: 'Tausug', value: 'Tausug' },
    { label: 'Yakan', value: 'Yakan' },
    { label: 'Sama', value: 'Sama' },
    { label: 'Badjao', value: 'Badjao' },
    { label: 'Subanen', value: 'Subanen' },
    { label: 'Manobo', value: 'Manobo' },
    { label: 'Bagobo', value: 'Bagobo' },
    { label: 'Bukidnon', value: 'Bukidnon' },
    { label: 'Higaonon', value: 'Higaonon' },
    { label: 'Bilaan', value: 'Bilaan' },
    { label: 'Tboli', value: 'Tboli' },
    { label: 'Tiruray', value: 'Tiruray' },
    { label: 'Kalagan', value: 'Kalagan' },
    { label: 'Mansaka', value: 'Mansaka' },
    { label: 'Mandaya', value: 'Mandaya' },
    { label: 'Lumad', value: 'Lumad' },
    { label: 'Moro', value: 'Moro' },
    { label: 'Bisaya', value: 'Bisaya' },
    { label: 'Cebuano', value: 'Cebuano' },
    { label: 'Hiligaynon', value: 'Hiligaynon' },
    { label: 'Waray', value: 'Waray' },
    { label: 'Ilonggo', value: 'Ilonggo' },
    { label: 'Aklanon', value: 'Aklanon' },
    { label: 'Capiznon', value: 'Capiznon' },
    { label: 'Surigaonon', value: 'Surigaonon' },
    { label: 'Kinaray-a', value: 'Kinaray-a' },
    { label: 'Romblomanon', value: 'Romblomanon' },
    { label: 'Masbateño', value: 'Masbateño' },
    { label: 'Boholano', value: 'Boholano' },
    { label: 'Porohanon', value: 'Porohanon' },
    { label: 'Cuyonon', value: 'Cuyonon' },
    { label: 'Tagalog', value: 'Tagalog' },
    { label: 'Ilocano', value: 'Ilocano' },
    { label: 'Bicolano', value: 'Bicolano' },
    { label: 'Kapampangan', value: 'Kapampangan' },
    { label: 'Pangasinense', value: 'Pangasinense' },
    { label: 'Ivatan', value: 'Ivatan' },
    { label: 'Ibanag', value: 'Ibanag' },
    { label: 'Gaddang', value: 'Gaddang' },
    { label: 'Sambal', value: 'Sambal' },
    { label: 'Chinese Filipino', value: 'Chinese Filipino' },
    { label: 'Spanish Filipino', value: 'Spanish Filipino' },
    { label: 'Mixed Race', value: 'Mixed Race' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
    { label: 'Other', value: 'Other' },
  ];

  // PWD Options
  const pwdOptions = [
    'Psychosocial Disability',
    'Disability caused by chronic illness',
    'Learning Disability',
    'Mental Disability',
    'Visual Disability',
    'Orthopedic Disability',
    'Communication Disability',
  ];

  // ── Side navigation ──────────────────────────────────────────
  const sections = [
    { id: 'section-photo', label: 'Photo & Name', icon: 'photo_camera' },
    { id: 'section-personal', label: 'Personal Information', icon: 'person' },
    { id: 'section-family', label: 'Family Background', icon: 'family_restroom' },
    { id: 'section-education', label: 'Educational Background', icon: 'school' },
    { id: 'section-eligibility', label: 'Civil Service Eligibility', icon: 'verified' },
    { id: 'section-work', label: 'Work Experience', icon: 'work' },
    { id: 'section-voluntary', label: 'Voluntary Work', icon: 'volunteer_activism' },
    { id: 'section-training', label: 'L&D Interventions', icon: 'menu_book' },
    { id: 'section-other', label: 'Other Information', icon: 'info' },
    { id: 'section-references', label: 'References', icon: 'contacts' },
    { id: 'section-declarations', label: 'Declarations', icon: 'fact_check' },
  ];

  const activeSection = ref('section-photo');
  let sectionObserver = null;
  let isScrolling = false;
  let scrollTimeout = null;
  let isManualScroll = false;

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;

    isManualScroll = true;
    isScrolling = true;
    activeSection.value = id;

    const appHeaderHeight = getAppHeaderHeight();
    const offset = appHeaderHeight + stickyBarHeight.value + mobileNavHeight.value + 20;
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      isManualScroll = false;
    }, 800);
  }

  // ── Sticky bar offset ────────────────────────────────────────────
  const stickyBarRef = ref(null);
  const stickyBarHeight = ref(56);
  const mobileNavRef = ref(null);
  const mobileNavHeight = ref(0);
  let barResizeObserver = null;
  let mobileNavResizeObserver = null;

  function getAppHeaderHeight() {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
      '--app-header-height',
    );
    return parseFloat(value) || 0;
  }

  // ── Improved Intersection Observer for accurate section detection ──
  function setupSectionObserver() {
    const targets = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const stickyOffset = getAppHeaderHeight() + stickyBarHeight.value + mobileNavHeight.value + 20;

    if (sectionObserver) {
      sectionObserver.disconnect();
    }

    sectionObserver = new IntersectionObserver(
      (entries) => {
        if (isScrolling || isManualScroll) return;

        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            id: entry.target.id,
            ratio: entry.intersectionRatio,
            boundingRect: entry.boundingRect,
            isAtTop: entry.boundingRect.top <= stickyOffset + 50 && entry.boundingRect.top >= -50,
          }))
          .sort((a, b) => {
            if (a.isAtTop && !b.isAtTop) return -1;
            if (!a.isAtTop && b.isAtTop) return 1;
            return b.ratio - a.ratio;
          });

        if (visibleSections.length === 0) return;

        const bestSection = visibleSections[0];

        if (bestSection.ratio > 0.15 || bestSection.isAtTop) {
          if (sections.some((s) => s.id === bestSection.id)) {
            activeSection.value = bestSection.id;
          }
        }
      },
      {
        rootMargin: `-${stickyOffset + 10}px 0px -30% 0px`,
        threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0],
      },
    );

    targets.forEach((t) => sectionObserver.observe(t));
  }

  onMounted(() => {
    const barEl = stickyBarRef.value?.$el ?? stickyBarRef.value;
    if (barEl) {
      stickyBarHeight.value = Math.round(barEl.getBoundingClientRect().height);
      barResizeObserver = new ResizeObserver((entries) => {
        stickyBarHeight.value = Math.round(entries[0].contentRect.height);
        setTimeout(setupSectionObserver, 100);
      });
      barResizeObserver.observe(barEl);
    }

    if (mobileNavRef.value) {
      mobileNavHeight.value = Math.round(mobileNavRef.value.getBoundingClientRect().height);
      mobileNavResizeObserver = new ResizeObserver((entries) => {
        mobileNavHeight.value = Math.round(entries[0].contentRect.height);
        setTimeout(setupSectionObserver, 100);
      });
      mobileNavResizeObserver.observe(mobileNavRef.value);
    }

    nextTick(() => {
      setupSectionObserver();
      window.addEventListener('scroll', handleScrollEnd);
    });
  });

  function handleScrollEnd() {
    if (isScrolling || isManualScroll) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollY + windowHeight >= documentHeight - 100) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        activeSection.value = lastSection.id;
      }
    }
  }

  onUnmounted(() => {
    barResizeObserver?.disconnect();
    mobileNavResizeObserver?.disconnect();
    sectionObserver?.disconnect();
    window.removeEventListener('scroll', handleScrollEnd);
    clearTimeout(scrollTimeout);
  });

  // ── Keep the active chip centered in the mobile nav's scroll area ──
  const mobileNavScrollRef = ref(null);
  const chipRefs = {};

  function setChipRef(id, el) {
    if (el) chipRefs[id] = el;
    else delete chipRefs[id];
  }

  function centerActiveChip(id) {
    const container = mobileNavScrollRef.value;
    const chipEl = chipRefs[id]?.$el ?? chipRefs[id];
    if (!container || !chipEl) return;

    const containerRect = container.getBoundingClientRect();
    const chipRect = chipEl.getBoundingClientRect();
    const delta =
      chipRect.left + chipRect.width / 2 - (containerRect.left + containerRect.width / 2);
    container.scrollBy({ left: delta, behavior: 'smooth' });
  }

  watch(activeSection, (id) => {
    nextTick(() => centerActiveChip(id));
  });

  // ── Form State ──────────────────────────────────────────────
  const form = reactive({
    personal: {
      firstname: '',
      lastname: '',
      middlename: '',
      name_extension: '',
      date_of_birth: '',
      place_of_birth: '',
      sex: '',
      civil_status: '',
      blood_type: '',
      height: '',
      weight: '',
      cellphone_number: '',
      telephone_number: '',
      email_address: '',
      citizenship: '',
      religion: '',
      gender_reference: '',
      gender_other: '',
      ethnic_group: '',
      ethnic_other: '',
      gsis_no: '',
      pagibig_no: '',
      philhealth_no: '',
      sss_no: '',
      tin_no: '',
      agency_employee_no: '',
    },
    residential: {
      house: '',
      street: '',
      subdivision: '',
      barangay: '',
      city: '',
      province: '',
      region: '',
      zip: '',
    },
    permanent: {
      house: '',
      street: '',
      subdivision: '',
      barangay: '',
      city: '',
      province: '',
      region: '',
      zip: '',
    },
    family: {
      spouse_firstname: '',
      spouse_name: '',
      spouse_middlename: '',
      spouse_occupation: '',
      spouse_employer: '',
      spouse_employer_address: '',
      spouse_employer_telephone: '',
      father_firstname: '',
      father_lastname: '',
      father_middlename: '',
      mother_firstname: '',
      mother_lastname: '',
      mother_middlename: '',
    },
    children: [],
    education: [],
    eligibility: [],
    workExperience: [],
    voluntaryWork: [],
    training: [],
    skills: [],
    distinctions: [],
    memberships: [],
    references: [],
  });

  // ── Personal Background Questionnaire ──────────────────────────
  const formData = reactive({
    relationThirdDegree: 'No',
    relationFourthDegree: 'No',
    relationDetails: '',
    administrativeOffense: 'No',
    administrativeOffenseDetails: '',
    criminallyCharged: 'No',
    criminalCaseDateFiled: '',
    criminalCaseStatus: '',
    convicted: 'No',
    convictedDetails: '',
    separatedFromService: 'No',
    separatedFromServiceDetails: '',
    electionCandidate: 'No',
    electionCandidateDetails: '',
    resignedForCampaign: 'No',
    resignedForCampaignDetails: '',
    immigrant: 'No',
    immigrantDetails: '',
    indigenous: 'No',
    indigenousDetails: '',
    pwd: 'No',
    pwdTypes: [],
    soloParent: 'No',
    soloParentDetails: '',
  });

  // ── Same as residential toggle ──────────────────────────────────
  const sameAsResidential = ref(false);
  function onSameAddressToggle(val) {
    if (val) Object.assign(form.permanent, { ...form.residential });
  }
  watch(
    () => ({ ...form.residential }),
    (val) => {
      if (sameAsResidential.value) Object.assign(form.permanent, val);
    },
  );

  // ── Photo upload ──────────────────────────────────────────────
  const fileInputRef = ref(null);
  const photoFile = ref(null);
  const photoPreview = ref('');

  function triggerFileSelect() {
    fileInputRef.value?.click();
  }

  function onPhotoSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      $q.notify({ type: 'negative', message: 'Please select an image file.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      $q.notify({ type: 'negative', message: 'Image must be smaller than 5MB.' });
      return;
    }

    if (photoPreview.value?.startsWith('blob:')) URL.revokeObjectURL(photoPreview.value);
    photoFile.value = file;
    photoPreview.value = URL.createObjectURL(file);
  }

  onUnmounted(() => {
    if (photoPreview.value?.startsWith('blob:')) URL.revokeObjectURL(photoPreview.value);
  });

  // ── WES Download ──────────────────────────────────────────────────
  const workExperienceDocxUrl = '/CS Form No. 212 Attachment - Work Experience Sheet.docx';

  function downloadWES() {
    const a = document.createElement('a');
    a.href = workExperienceDocxUrl;
    a.download = 'CS Form No. 212 Attachment - Work Experience Sheet.docx';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    $q.notify({
      type: 'positive',
      message: 'Downloading Work Experience Sheet template...',
    });
  }

  // ── Dynamic row helpers ──────────────────────────────────────────
  function addChild() {
    form.children.push({ child_name: '', birth_date: '' });
  }
  function removeChild(idx) {
    form.children.splice(idx, 1);
  }

  function addEducation() {
    form.education.push({
      level: '',
      school_name: '',
      degree: '',
      attendance_from: '',
      attendance_to: '',
      highest_units: '',
      year_graduated: '',
      scholarship: '',
      graduated: '',
      file: [],
    });
  }

  function addEligibility() {
    form.eligibility.push({
      eligibility: '',
      rating: '',
      date_of_examination: '',
      place_of_examination: '',
      license_number: '',
      date_of_validity: '',
      file: [],
    });
  }

  function addWork() {
    form.workExperience.push({
      work_date_from: '',
      work_date_to: '',
      position_title: '',
      department: '',
      monthly_salary: '',
      salary_grade: '',
      status_of_appointment: '',
      government_service: '',
      file: [],
    });
  }

  function addVoluntary() {
    form.voluntaryWork.push({
      organization_name: '',
      inclusive_date_from: '',
      inclusive_date_to: '',
      number_of_hours: '',
      position: '',
    });
  }

  function addTraining() {
    form.training.push({
      training_title: '',
      inclusive_date_from: '',
      inclusive_date_to: '',
      number_of_hours: '',
      type: '',
      conducted_by: '',
      file: [],
    });
  }

  function addSkill() {
    form.skills.push({ skill: '' });
  }

  function addDistinction() {
    form.distinctions.push({ non_academic: '' });
  }

  function addMembership() {
    form.memberships.push({
      organization: '',
      position: '',
      inclusive_date_from: '',
      inclusive_date_to: '',
    });
  }

  function addReference() {
    form.references.push({ full_name: '', address: '', contact_number: '' });
  }

  function removeRow(section, idx) {
    form[section].splice(idx, 1);
  }

  // ── Actions ──────────────────────────────────────────────────
  const isSubmitting = ref(false);

  function buildPayload() {
    return {
      photo: photoFile.value,
      ...form,
      personalDeclarations: formData,
    };
  }

  async function submitForm() {
    isSubmitting.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      $q.notify({ type: 'positive', message: 'Form ready to submit (no API call wired up yet).' });
      emit('submit', buildPayload());
    } finally {
      isSubmitting.value = false;
    }
  }
</script>

<style scoped>
  .pds-page {
    padding-left: 16px;
    padding-right: 16px;
    padding: var(--page-padding);
    max-width: 1300px;
    margin: 0 auto;
  }

  .sticky-header-card {
    position: sticky;
    top: var(--app-header-height, 0px);
    z-index: 100;
    margin: 0 calc(-1 * var(--page-padding)) 16px;
    width: calc(100% + 2 * var(--page-padding));
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .sticky-header-card .q-card-section {
    background: var(--q-primary) !important;
  }

  .pds-layout {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .side-nav {
    flex: 0 0 250px;
    position: sticky;
    top: calc(var(--app-header-height, 0px) + var(--bar-offset) + 16px);
  }

  .side-nav-card {
    border-radius: 8px;
    overflow: hidden;
  }

  .side-nav-active {
    background: rgba(25, 118, 210, 0.08);
    color: var(--q-primary, #1976d2);
    font-weight: 600;
  }

  .pds-content {
    flex: 1;
    min-width: 0;
  }

  .scroll-target {
    scroll-margin-top: calc(
      var(--app-header-height, 0px) + var(--bar-offset) + var(--mobile-nav-offset) + 16px
    );
  }

  .mobile-nav {
    display: none;
  }

  .mobile-nav-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 8px 4px;
    scrollbar-width: thin;
  }

  .mobile-nav-scroll::-webkit-scrollbar {
    height: 4px;
  }

  .mobile-nav-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .mobile-nav-scroll::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  .photo-upload-wrap {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    border: 2px dashed #cfd8dc;
    flex-shrink: 0;
  }

  .photo-thumb {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
  }

  .photo-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 0;
  }

  .hidden-input {
    display: none;
  }

  .section-label {
    font-weight: 600;
    color: #424242;
    margin-bottom: 12px;
    font-size: 0.95rem;
  }

  .upload-instruction-banner {
    border-left: 4px solid currentColor;
    border-radius: 8px;
  }

  .upload-section {
    border: 1px dashed #cfd8dc;
    border-radius: 4px;
    padding: 8px;
    background: #fafafa;
  }

  .upload-label {
    display: flex;
    align-items: center;
    font-weight: 500;
  }

  .wes-download-section {
    padding: 12px 16px;
    background: #f1f8f5;
    border-radius: 4px;
    border: 1px solid #c8e6c9;
  }

  .banner-text ul {
    margin: 0;
    padding-left: 20px;
  }

  .banner-text ul li {
    font-size: 0.875rem;
    line-height: 1.6;
  }

  @media (max-width: 1023px) {
    .side-nav {
      display: none;
    }

    .sticky-header-card {
      margin-bottom: 0;
    }

    .mobile-nav {
      display: block;
      position: sticky;
      top: calc(var(--app-header-height, 0px) + var(--bar-offset));
      z-index: 90;
      background: white;
      border-radius: 0;
      border-bottom: 1px solid #e0e0e0;
      margin: 0 calc(-1 * var(--page-padding)) 16px;
      width: calc(100% + 2 * var(--page-padding));
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .pds-layout {
      display: block;
    }
  }

  @media (max-width: 599px) {
    .pds-page {
      --page-padding: 8px;
    }

    .photo-upload-wrap {
      width: 110px;
      height: 110px;
      margin: 0 auto;
    }

    .wes-download-section {
      flex-direction: column;
      align-items: flex-start;
    }

    .wes-download-btn {
      width: 100%;
      margin-bottom: 8px;
    }

    .banner-text ul {
      padding-left: 16px;
    }

    .banner-text ul li {
      font-size: 0.8rem;
    }
  }

  @media (min-width: 1440px) {
    .upload-section {
      padding: 12px;
    }
  }
</style>
