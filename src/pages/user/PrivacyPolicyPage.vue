<template>
  <div class="legal-page">
    <!-- Background -->
    <div class="page-overlay"></div>

    <!-- Floating back button -->
    <div class="back-btn-wrapper">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="white"
        class="back-btn"
        @click="goBack"
        aria-label="Go back"
      >
        <q-tooltip>Go Back</q-tooltip>
      </q-btn>
    </div>

    <!-- Sticky Header -->
    <header class="sticky-header">
      <div class="hero-inner">
        <img src="/logo.png" alt="City Government of Tagum Logo" class="hero-logo" />
        <div class="badge">
          <q-icon name="privacy_tip" size="14px" class="q-mr-xs" />
          Privacy Document
        </div>
        <h1 class="hero-title">Privacy Policy</h1>
        <p class="hero-sub">
          Recruitment, Selection &amp; Placement System (RSPS)
          <br />
          <strong>City Government of Tagum</strong>
        </p>
        <div class="meta-row">
          <span class="meta-item">
            <q-icon name="update" size="13px" class="q-mr-xs" />
            Last Updated: April 25, 2026
          </span>
          <span class="meta-sep">•</span>
          <span class="meta-item">
            <q-icon name="verified_user" size="13px" class="q-mr-xs" />
            RA 10173 Compliant
          </span>
        </div>
      </div>
    </header>

    <!-- Scrollable Main Content -->
    <div class="scrollable-content">
      <div class="page-content">
        <!-- Main two-column layout -->
        <div class="main-layout">
          <!-- Left sidebar - Table of Contents (Sticky) -->
          <aside class="toc-sidebar">
            <div class="toc-card">
              <div class="toc-header">
                <q-icon name="format_list_numbered" size="18px" color="primary" class="q-mr-sm" />
                <span class="toc-title">Table of Contents</span>
              </div>
              <nav class="toc-nav">
                <a
                  v-for="item in tocItems"
                  :key="item.id"
                  :href="`#section-${item.id}`"
                  class="toc-link"
                  :class="{ 'toc-link--active': activeSection === item.id }"
                  @click.prevent="scrollTo(`section-${item.id}`, item.id)"
                >
                  <span class="toc-num">{{ item.id }}</span>
                  <span class="toc-text">{{ item.title }}</span>
                  <q-icon name="chevron_right" size="14px" class="toc-arrow" />
                </a>
              </nav>
            </div>
          </aside>

          <!-- Right content area -->
          <main class="content-area">
            <div class="sections-container">
              <!-- RA 10173 Highlight Banner -->
              <div class="law-banner">
                <div class="law-banner-icon">
                  <q-icon name="account_balance" size="28px" color="primary" />
                </div>
                <div class="law-banner-text">
                  <div class="law-banner-title">Republic Act No. 10173</div>
                  <div class="law-banner-desc">
                    This Privacy Policy fully complies with the Data Privacy Act of 2012 and its
                    Implementing Rules and Regulations.
                  </div>
                </div>
              </div>
              <!-- Section 1 -->
              <div id="section-1" class="section-card">
                <div class="section-header">
                  <div class="section-num">1</div>
                  <h2 class="section-title">Policy Statement</h2>
                </div>
                <div class="section-body">
                  <p>
                    The City Government of Tagum ensures compliance with Republic Act No. 10173
                    (Data Privacy Act of 2012) and its Implementing Rules and Regulations.
                  </p>
                  <p>
                    We are committed to protecting the personal data of every individual who uses
                    this System, and we adopt appropriate organizational, physical, and technical
                    safeguards to ensure data privacy and security.
                  </p>
                </div>
              </div>

              <!-- Section 2 -->
              <div id="section-2" class="section-card">
                <div class="section-header">
                  <div class="section-num">2</div>
                  <h2 class="section-title">Personal Information Controller (PIC)</h2>
                </div>
                <div class="section-body">
                  <div class="pic-card">
                    <div class="pic-row">
                      <div class="pic-icon-wrap">
                        <q-icon name="location_city" size="22px" color="primary" />
                      </div>
                      <div>
                        <div class="pic-label">Personal Information Controller</div>
                        <div class="pic-value">City Government of Tagum</div>
                        <div class="pic-sub">City Human Resource Management Office (CHRMO)</div>
                      </div>
                    </div>
                    <div class="pic-row">
                      <div class="pic-icon-wrap">
                        <q-icon name="email" size="22px" color="primary" />
                      </div>
                      <div>
                        <div class="pic-label">Email</div>
                        <a href="mailto:lgutagumhrmo.recruitment@gmail.com" class="pic-link">
                          lgutagumhrmo.recruitment@gmail.com
                        </a>
                      </div>
                    </div>
                    <!-- <div class="pic-row">
                      <div class="pic-icon-wrap">
                        <q-icon name="shield" size="22px" color="primary" />
                      </div>
                      <div>
                        <div class="pic-label">Data Protection Officer</div>
                        <div class="pic-value">To be designated</div>
                      </div>
                    </div> -->
                  </div>
                </div>
              </div>

              <!-- Section 3 -->
              <div id="section-3" class="section-card">
                <div class="section-header">
                  <div class="section-num">3</div>
                  <h2 class="section-title">Personal Data Collected</h2>
                </div>
                <div class="section-body">
                  <div class="data-type-grid">
                    <div class="data-type-card" v-for="dtype in dataTypes" :key="dtype.title">
                      <div class="data-type-icon">
                        <q-icon :name="dtype.icon" size="20px" color="primary" />
                      </div>
                      <div class="data-type-title">{{ dtype.title }}</div>
                      <ul class="data-type-list">
                        <li v-for="item in dtype.items" :key="item">{{ item }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 4 -->
              <div id="section-4" class="section-card">
                <div class="section-header">
                  <div class="section-num">4</div>
                  <h2 class="section-title">Purpose of Processing</h2>
                </div>
                <div class="section-body">
                  <div class="purpose-grid">
                    <div class="purpose-block purpose-block--primary">
                      <div class="purpose-block-title">
                        <q-icon name="star" size="16px" class="q-mr-xs" />
                        Primary Purposes
                      </div>
                      <ul class="styled-list">
                        <li>Recruitment and hiring</li>
                        <li>Qualification assessment</li>
                        <li>Official communication with applicants</li>
                      </ul>
                    </div>
                    <div class="purpose-block purpose-block--secondary">
                      <div class="purpose-block-title">
                        <q-icon name="tune" size="16px" class="q-mr-xs" />
                        Secondary Purposes
                      </div>
                      <ul class="styled-list">
                        <li>System improvement</li>
                        <li>Security and fraud prevention</li>
                        <li>Statistical reporting (aggregated only)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 5 -->
              <div id="section-5" class="section-card">
                <div class="section-header">
                  <div class="section-num">5</div>
                  <h2 class="section-title">Legal Basis</h2>
                </div>
                <div class="section-body">
                  <p>
                    Processing of personal data is based on one or more of the following lawful
                    grounds:
                  </p>
                  <div class="basis-grid">
                    <div class="basis-item" v-for="basis in legalBases" :key="basis.title">
                      <q-icon :name="basis.icon" size="18px" color="primary" class="basis-icon" />
                      <div>
                        <div class="basis-title">{{ basis.title }}</div>
                        <div class="basis-desc">{{ basis.desc }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 6 -->
              <div id="section-6" class="section-card">
                <div class="section-header">
                  <div class="section-num">6</div>
                  <h2 class="section-title">Data Sharing and Disclosure (DSA-Compliant)</h2>
                </div>
                <div class="section-body">
                  <p>
                    Personal data may be shared under strict controls and only for legitimate
                    purposes:
                  </p>

                  <h3 class="sub-heading">6.1 Internal Sharing</h3>
                  <ul class="styled-list">
                    <li>CHRMO personnel involved in recruitment and hiring</li>
                    <li>Authorized hiring departments</li>
                  </ul>

                  <h3 class="sub-heading">6.2 External Sharing</h3>
                  <ul class="styled-list">
                    <li>Civil Service Commission (CSC)</li>
                    <li>Government agencies when required by law</li>
                    <li>Accredited service providers (e.g., hosting, database, system support)</li>
                  </ul>

                  <h3 class="sub-heading">6.3 Data Sharing Safeguards</h3>
                  <p>
                    All data sharing shall be governed by Data Sharing Agreements (DSA) or
                    equivalent instruments, ensuring that:
                  </p>
                  <div class="dsa-grid">
                    <div class="dsa-item" v-for="dsa in dsaSafeguards" :key="dsa">
                      <q-icon name="verified" size="15px" class="q-mr-xs dsa-icon" />
                      {{ dsa }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 7 -->
              <div id="section-7" class="section-card">
                <div class="section-header">
                  <div class="section-num">7</div>
                  <h2 class="section-title">Data Security Measures</h2>
                </div>
                <div class="section-body">
                  <div class="security-grid">
                    <div class="security-item" v-for="sec in securityMeasures" :key="sec.title">
                      <div class="security-icon-wrap">
                        <q-icon :name="sec.icon" size="20px" color="primary" />
                      </div>
                      <div class="security-title">{{ sec.title }}</div>
                      <div class="security-desc">{{ sec.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 8 -->
              <div id="section-8" class="section-card">
                <div class="section-header">
                  <div class="section-num">8</div>
                  <h2 class="section-title">Data Retention and Disposal</h2>
                </div>
                <div class="section-body">
                  <div class="retention-table">
                    <div class="retention-row retention-row--head">
                      <div class="ret-col">Data Category</div>
                      <div class="ret-col">Retention Period</div>
                    </div>
                    <div class="retention-row" v-for="ret in retentionData" :key="ret.category">
                      <div class="ret-col ret-cat">{{ ret.category }}</div>
                      <div class="ret-col ret-period">{{ ret.period }}</div>
                    </div>
                  </div>
                  <div class="notice-box notice-box--info">
                    <q-icon name="delete_sweep" size="18px" class="notice-icon" />
                    <span>
                      Data is securely disposed of through deletion or anonymization after the
                      applicable retention period.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Section 9 -->
              <div id="section-9" class="section-card">
                <div class="section-header">
                  <div class="section-num">9</div>
                  <h2 class="section-title">Data Subject Rights</h2>
                </div>
                <div class="section-body">
                  <p>Under Republic Act No. 10173, you have the following rights:</p>
                  <div class="rights-grid">
                    <div class="right-item" v-for="right in dataRights" :key="right.title">
                      <div class="right-icon-wrap">
                        <q-icon :name="right.icon" size="18px" color="primary" />
                      </div>
                      <div class="right-title">{{ right.title }}</div>
                      <div class="right-desc">{{ right.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 10 -->
              <div id="section-10" class="section-card">
                <div class="section-header">
                  <div class="section-num">10</div>
                  <h2 class="section-title">Cookies</h2>
                </div>
                <div class="section-body">
                  <div class="notice-box notice-box--green">
                    <q-icon name="cookie" size="18px" class="notice-icon" />
                    <span>
                      Only essential cookies are used for authentication and system security. No
                      tracking, advertising, or third-party analytics cookies are employed.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Section 11 -->
              <div id="section-11" class="section-card">
                <div class="section-header">
                  <div class="section-num">11</div>
                  <h2 class="section-title">Personal Data Breach Management (NPC-Compliant)</h2>
                </div>
                <div class="section-body">
                  <p>
                    In the event of a personal data breach, the City Government shall take the
                    following steps:
                  </p>
                  <div class="breach-steps">
                    <div class="breach-step" v-for="(step, idx) in breachSteps" :key="step.title">
                      <div class="breach-step-num">{{ idx + 1 }}</div>
                      <div class="breach-step-content">
                        <div class="breach-step-title">{{ step.title }}</div>
                        <div class="breach-step-desc">{{ step.desc }}</div>
                      </div>
                    </div>
                  </div>

                  <h3 class="sub-heading">Information Provided in Notifications</h3>
                  <ul class="styled-list">
                    <li>Description of the nature of the breach</li>
                    <li>Types of personal data involved</li>
                    <li>Possible consequences for affected individuals</li>
                    <li>Measures taken or proposed to address the breach</li>
                    <li>Recommendations to protect affected individuals</li>
                  </ul>

                  <h3 class="sub-heading">Mitigation Measures</h3>
                  <ul class="styled-list">
                    <li>Immediate containment of the breach</li>
                    <li>Prevention of recurrence through security improvements</li>
                    <li>Strengthening of existing security controls</li>
                  </ul>
                </div>
              </div>

              <!-- Section 12 -->
              <div id="section-12" class="section-card">
                <div class="section-header">
                  <div class="section-num">12</div>
                  <h2 class="section-title">Amendments</h2>
                </div>
                <div class="section-body">
                  <p>
                    This Privacy Policy may be updated at any time without prior notice. Continued
                    use of the System after any amendments constitutes your acceptance of the
                    revised Privacy Policy.
                  </p>
                </div>
              </div>

              <!-- Section 13 -->
              <div id="section-13" class="section-card">
                <div class="section-header">
                  <div class="section-num">13</div>
                  <h2 class="section-title">Contact Information</h2>
                </div>
                <div class="section-body">
                  <div class="contact-card">
                    <div class="contact-row">
                      <q-icon name="business" size="20px" color="primary" />
                      <div>
                        <div class="contact-label">Office</div>
                        <div class="contact-value">
                          City Human Resource Management Office (CHRMO)
                        </div>
                      </div>
                    </div>
                    <div class="contact-row">
                      <q-icon name="email" size="20px" color="primary" />
                      <div>
                        <div class="contact-label">Email</div>
                        <a href="mailto:lgutagumhrmo.recruitment@gmail.com" class="contact-link">
                          lgutagumhrmo.recruitment@gmail.com
                        </a>
                      </div>
                    </div>
                    <div class="contact-row">
                      <q-icon name="account_balance" size="20px" color="primary" />
                      <div>
                        <div class="contact-label">Regulatory Body</div>
                        <div class="contact-value">National Privacy Commission (NPC)</div>
                        <a
                          href="https://www.privacy.gov.ph"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="contact-link"
                        >
                          www.privacy.gov.ph
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 14 -->
              <div id="section-14" class="section-card section-card--consent">
                <div class="section-header section-header--consent">
                  <div class="section-num section-num--consent">14</div>
                  <h2 class="section-title">Declaration of Consent</h2>
                </div>
                <div class="section-body">
                  <p>By using the System, you confirm that:</p>
                  <div class="consent-items">
                    <div class="consent-item">
                      <q-icon name="check_circle" size="20px" color="positive" class="q-mr-sm" />
                      <span>You have read and understood this Privacy Policy in its entirety.</span>
                    </div>
                    <div class="consent-item">
                      <q-icon name="check_circle" size="20px" color="positive" class="q-mr-sm" />
                      <span>
                        You freely and voluntarily consent to the processing of your personal data
                        as described herein.
                      </span>
                    </div>
                    <div class="consent-item">
                      <q-icon name="check_circle" size="20px" color="positive" class="q-mr-sm" />
                      <span>
                        You understand your rights as a data subject under Republic Act No. 10173.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="footer-actions">
              <q-btn
                unelevated
                rounded
                color="primary"
                label="Back to Login"
                icon="arrow_back"
                @click="goBack"
                class="footer-btn"
              />
              <q-btn
                unelevated
                rounded
                outline
                color="white"
                label="Terms &amp; Conditions"
                icon="gavel"
                @click="goToTerms"
                class="footer-btn footer-btn--outline"
              />
            </div>

            <div class="footer-copy">© 2025 City Government of Tagum. All rights reserved.</div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const activeSection = ref(1);

  const goBack = () => router.push('/');
  const goToTerms = () => router.push('/terms');

  const scrollTo = (id, sectionNum) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      activeSection.value = sectionNum;
    }
  };

  // Intersection Observer to update active section on scroll
  let observer = null;

  const setupObserver = () => {
    const sections = document.querySelectorAll('.section-card');

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const sectionNum = parseInt(id.split('-')[1]);
            if (sectionNum) {
              activeSection.value = sectionNum;
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  };

  onMounted(() => {
    setupObserver();
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  const tocItems = [
    { id: 1, title: 'Policy Statement' },
    { id: 2, title: 'Personal Information Controller' },
    { id: 3, title: 'Personal Data Collected' },
    { id: 4, title: 'Purpose of Processing' },
    { id: 5, title: 'Legal Basis' },
    { id: 6, title: 'Data Sharing and Disclosure' },
    { id: 7, title: 'Data Security Measures' },
    { id: 8, title: 'Data Retention and Disposal' },
    { id: 9, title: 'Data Subject Rights' },
    { id: 10, title: 'Cookies' },
    { id: 11, title: 'Personal Data Breach Management' },
    { id: 12, title: 'Amendments' },
    { id: 13, title: 'Contact Information' },
    { id: 14, title: 'Declaration of Consent' },
  ];

  const dataTypes = [
    {
      icon: 'person',
      title: 'PDS Information',
      items: [
        'Personal & family data',
        'Educational background',
        'Employment history',
        'Eligibility & trainings',
        'Government-issued IDs',
        'References',
      ],
    },
    {
      icon: 'manage_accounts',
      title: 'Account Data',
      items: ['Email address', 'Authentication logs', 'OTP records'],
    },
    {
      icon: 'assignment',
      title: 'Application Data',
      items: ['Applications submitted', 'Evaluation results', 'HR assessments'],
    },
    {
      icon: 'devices',
      title: 'Technical Data',
      items: ['IP address', 'Device & browser info', 'Activity logs', 'Session data'],
    },
  ];

  const legalBases = [
    {
      icon: 'how_to_reg',
      title: 'Consent',
      desc: 'Freely given, specific, informed agreement by the data subject.',
    },
    {
      icon: 'gavel',
      title: 'Legal Obligation',
      desc: 'Processing required by law, regulation, or government mandate.',
    },
    {
      icon: 'account_balance',
      title: 'Public Authority',
      desc: 'Exercise of official duties as a local government unit.',
    },
    {
      icon: 'balance',
      title: 'Legitimate Interest',
      desc: 'Necessary for a legitimate purpose not overridden by your rights.',
    },
  ];

  const dsaSafeguards = [
    'Data is shared only for legitimate and specific purposes',
    'Recipient organizations implement adequate security measures',
    'Processing is limited to agreed purposes only',
    'Confidentiality obligations are strictly enforced',
    'Data is retained only for authorized periods',
    'Data is returned or securely disposed of after use',
  ];

  const securityMeasures = [
    {
      icon: 'lock',
      title: 'Encryption',
      desc: 'Secure HTTPS transmission and encrypted storage for all personal data.',
    },
    {
      icon: 'admin_panel_settings',
      title: 'Access Control',
      desc: 'Role-based access to ensure only authorized personnel can access data.',
    },
    {
      icon: 'receipt_long',
      title: 'Audit Logging',
      desc: 'Comprehensive logs of all data access and system activities.',
    },
    {
      icon: 'backup',
      title: 'Secure Backups',
      desc: 'Regular encrypted backups with controlled recovery procedures.',
    },
  ];

  const retentionData = [
    { category: 'Applicant Data', period: 'Up to 3 years from application date' },
    { category: 'Employee Records', period: 'Per Civil Service Commission regulations' },
    { category: 'System Logs', period: 'Up to 1 year' },
  ];

  const dataRights = [
    {
      icon: 'visibility',
      title: 'Right to Access',
      desc: 'Request a copy of your personal data held by us.',
    },
    {
      icon: 'edit',
      title: 'Right to Rectify',
      desc: 'Correct inaccurate or incomplete personal data.',
    },
    {
      icon: 'delete_forever',
      title: 'Right to Erasure',
      desc: 'Request deletion of data, subject to legal limitations.',
    },
    {
      icon: 'block',
      title: 'Right to Object',
      desc: 'Object to processing in certain circumstances.',
    },
    {
      icon: 'sync_alt',
      title: 'Data Portability',
      desc: 'Receive your data in a structured, machine-readable format.',
    },
    {
      icon: 'report',
      title: 'File Complaint',
      desc: 'Lodge a complaint with the National Privacy Commission.',
    },
  ];

  const breachSteps = [
    {
      title: 'Detection & Assessment',
      desc: 'Immediately assess the nature, scope, and risk level of the breach to data subjects.',
    },
    {
      title: 'NPC Notification',
      desc: 'Notify the National Privacy Commission within 72 hours when the breach poses a risk to data subjects.',
    },
    {
      title: 'Notification to Affected Users',
      desc: 'Inform affected individuals without undue delay when the breach poses a risk to their rights and freedoms.',
    },
    {
      title: 'Containment & Recovery',
      desc: 'Take immediate steps to contain the breach, restore systems, and prevent recurrence.',
    },
  ];
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  /* ── Base ── */
  .legal-page {
    width: 100%;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .page-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/tagum-city-hall.webp');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    z-index: 0;
  }

  .page-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(21, 69, 180, 0.88) 0%, rgba(72, 71, 73, 0.92) 100%);
  }

  /* ── Back Button ── */
  .back-btn-wrapper {
    position: fixed;
    top: 1.25rem;
    left: 1.25rem;
    z-index: 100;
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    transition: background 0.2s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ── Sticky Header ── */
  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 1.5rem 1rem 1rem;
    text-align: center;
    color: white;
    backdrop-filter: blur(10px);
    background: rgba(21, 69, 180, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    max-width: 860px;
    margin: 0 auto;
  }

  .hero-logo {
    width: 48px;
    height: auto;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  }

  .badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);
    border-radius: 100px;
    padding: 3px 12px;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.9);
  }

  .hero-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .hero-sub {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    line-height: 1.5;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
  }

  .meta-sep {
    opacity: 0.4;
  }

  /* ── Scrollable Content ── */
  .scrollable-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 1;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scrollable-content::-webkit-scrollbar {
    display: none;
  }

  /* ── Page Content ── */
  .page-content {
    position: relative;
    z-index: 1;
    width: 94%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 0 4rem;
  }

  /* ── Law Banner ── */
  .law-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    border-left: 5px solid #1565c0;
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }

  .law-banner-title {
    font-size: 0.95rem;
    font-weight: 800;
    color: #1565c0;
    margin-bottom: 0.2rem;
  }

  .law-banner-desc {
    font-size: 0.82rem;
    color: #555;
    line-height: 1.5;
  }

  /* ── Main Layout: Two Columns ── */
  .main-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  /* ── TOC Sidebar (Sticky within scrollable area) ── */
  .toc-sidebar {
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: 1rem;
    align-self: flex-start;
    z-index: 10;
  }

  .toc-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    max-height: calc(100vh - 14rem);
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .toc-card::-webkit-scrollbar {
    display: none;
  }

  .toc-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 0.875rem;
    border-bottom: 2px solid #f0f3fb;
  }

  .toc-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1a2040;
  }

  .toc-nav {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .toc-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    text-decoration: none;
    color: #444;
    font-size: 0.8rem;
    transition:
      background 0.18s,
      color 0.18s;
    cursor: pointer;
    border-left: 3px solid transparent;
  }

  .toc-link:hover {
    background: #eff3fb;
    color: #1565c0;
  }

  .toc-link--active {
    background: #eff3fb;
    color: #1565c0;
    border-left-color: #1565c0;
    font-weight: 600;
  }

  .toc-link--active .toc-num {
    background: #0d47a1;
  }

  .toc-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    min-width: 22px;
    background: #1565c0;
    color: white;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .toc-text {
    flex: 1;
  }

  .toc-arrow {
    opacity: 0.35;
    transition:
      opacity 0.18s,
      transform 0.18s;
  }

  .toc-link:hover .toc-arrow,
  .toc-link--active .toc-arrow {
    opacity: 0.8;
    transform: translateX(2px);
  }

  /* ── Content Area ── */
  .content-area {
    flex: 1;
    min-width: 0;
  }

  /* ── Section Cards ── */
  .sections-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    scroll-margin-top: 1.5rem;
  }

  .section-card--consent {
    border: 2px solid #1a7e44;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.75rem;
    background: linear-gradient(135deg, #f5f7fc 0%, #edf0f9 100%);
    border-bottom: 1px solid #dde3f0;
  }

  .section-header--consent {
    background: linear-gradient(135deg, #f0faf4 0%, #e6f5ec 100%) !important;
    border-bottom-color: #c8e6c9 !important;
  }

  .section-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    min-width: 38px;
    background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
    color: white;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 800;
    box-shadow: 0 3px 8px rgba(21, 69, 180, 0.35);
  }

  .section-num--consent {
    background: linear-gradient(135deg, #1a7e44 0%, #28933c 100%) !important;
    box-shadow: 0 3px 8px rgba(26, 126, 68, 0.35) !important;
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a2040;
    margin: 0;
  }

  .section-body {
    padding: 1.5rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .section-body p {
    margin: 0;
    color: #444;
    line-height: 1.7;
    font-size: 0.92rem;
  }

  /* ── Sub Heading ── */
  .sub-heading {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1565c0;
    margin: 0.5rem 0 0;
    padding-bottom: 0.4rem;
    border-bottom: 1px dashed #c5cff0;
  }

  /* ── Lists ── */
  .styled-list {
    margin: 0;
    padding-left: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .styled-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.88rem;
    color: #444;
    line-height: 1.55;
  }

  .styled-list li::before {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    min-width: 7px;
    border-radius: 50%;
    background: #1565c0;
    margin-top: 0.45em;
  }

  /* ── Notice Boxes ── */
  .notice-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 12px;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .notice-box--info {
    background: #e3f2fd;
    color: #1565c0;
    border: 1px solid #bbdefb;
  }

  .notice-box--green {
    background: #f1faf4;
    color: #1b5e20;
    border: 1px solid #c8e6c9;
  }

  .notice-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── PIC Card ── */
  .pic-card {
    background: #f5f7fc;
    border: 1px solid #dde3f0;
    border-radius: 14px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pic-row {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
  }

  .pic-icon-wrap {
    width: 36px;
    height: 36px;
    min-width: 36px;
    background: #edf0f9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pic-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #888;
    font-weight: 600;
    margin-bottom: 0.15rem;
  }

  .pic-value {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1a2040;
  }

  .pic-sub {
    font-size: 0.82rem;
    color: #666;
  }

  .pic-link {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1565c0;
    text-decoration: none;
  }

  .pic-link:hover {
    text-decoration: underline;
  }

  /* ── Data Types ── */
  .data-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 0.875rem;
  }

  .data-type-card {
    background: #f5f7fc;
    border: 1px solid #dde3f0;
    border-radius: 14px;
    padding: 1rem;
  }

  .data-type-icon {
    width: 36px;
    height: 36px;
    background: #edf0f9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.6rem;
  }

  .data-type-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1a2040;
    margin-bottom: 0.5rem;
  }

  .data-type-list {
    margin: 0;
    padding-left: 1rem;
    list-style-type: disc;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .data-type-list li {
    font-size: 0.78rem;
    color: #555;
    line-height: 1.4;
  }

  /* ── Purpose ── */
  .purpose-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.875rem;
  }

  .purpose-block {
    border-radius: 14px;
    padding: 1rem 1.1rem;
  }

  .purpose-block-title {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 0.7rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .purpose-block--primary {
    background: #eff3fb;
    border: 1px solid #c5cff0;
    color: #1a2d6e;
  }

  .purpose-block--secondary {
    background: #f5f7fc;
    border: 1px solid #dde3f0;
    color: #3a4560;
  }

  /* ── Legal Basis ── */
  .basis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .basis-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem;
    background: #f5f7fc;
    border: 1px solid #dde3f0;
    border-radius: 12px;
  }

  .basis-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .basis-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1a2040;
    margin-bottom: 0.2rem;
  }

  .basis-desc {
    font-size: 0.78rem;
    color: #666;
    line-height: 1.45;
  }

  /* ── DSA ── */
  .dsa-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 0.4rem;
  }

  .dsa-item {
    display: flex;
    align-items: flex-start;
    padding: 0.55rem 0.75rem;
    background: #f0faf4;
    border: 1px solid #c8e6c9;
    border-radius: 10px;
    font-size: 0.83rem;
    color: #1b5e20;
    line-height: 1.45;
  }

  .dsa-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: #1a7e44;
  }

  /* ── Security ── */
  .security-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.875rem;
  }

  .security-item {
    background: #f5f7fc;
    border: 1px solid #dde3f0;
    border-radius: 14px;
    padding: 1rem;
    text-align: center;
  }

  .security-icon-wrap {
    width: 44px;
    height: 44px;
    background: #edf0f9;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.6rem;
  }

  .security-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1a2040;
    margin-bottom: 0.3rem;
  }

  .security-desc {
    font-size: 0.77rem;
    color: #666;
    line-height: 1.45;
  }

  /* ── Retention Table ── */
  .retention-table {
    border: 1px solid #dde3f0;
    border-radius: 12px;
    overflow: hidden;
  }

  .retention-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid #edf0f9;
  }

  .retention-row:last-child {
    border-bottom: none;
  }

  .retention-row--head {
    background: linear-gradient(135deg, #1565c0, #1976d2);
    color: white;
  }

  .ret-col {
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }

  .retention-row--head .ret-col {
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.04em;
  }

  .retention-row:not(.retention-row--head):nth-child(even) {
    background: #f5f7fc;
  }

  .ret-cat {
    font-weight: 600;
    color: #1a2040;
  }
  .ret-period {
    color: #555;
  }

  /* ── Rights Grid ── */
  .rights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .right-item {
    background: #f5f7fc;
    border: 1px solid #dde3f0;
    border-radius: 14px;
    padding: 1rem;
  }

  .right-icon-wrap {
    width: 36px;
    height: 36px;
    background: #edf0f9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.6rem;
  }

  .right-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1a2040;
    margin-bottom: 0.25rem;
  }

  .right-desc {
    font-size: 0.78rem;
    color: #666;
    line-height: 1.45;
  }

  /* ── Breach Steps ── */
  .breach-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid #dde3f0;
    border-radius: 14px;
    overflow: hidden;
  }

  .breach-step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #edf0f9;
  }

  .breach-step:last-child {
    border-bottom: none;
  }
  .breach-step:nth-child(odd) {
    background: #f5f7fc;
  }

  .breach-step-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    min-width: 28px;
    background: linear-gradient(135deg, #1565c0, #1976d2);
    color: white;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 800;
    margin-top: 1px;
  }

  .breach-step-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: #1a2040;
    margin-bottom: 0.2rem;
  }

  .breach-step-desc {
    font-size: 0.82rem;
    color: #666;
    line-height: 1.5;
  }

  /* ── Contact Card ── */
  .contact-card {
    background: #f5f7fc;
    border: 1px solid #dde3f0;
    border-radius: 14px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contact-row {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
  }

  .contact-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #888;
    font-weight: 600;
    margin-bottom: 0.15rem;
  }

  .contact-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1a2040;
  }

  .contact-link {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1565c0;
    text-decoration: none;
    display: block;
  }

  .contact-link:hover {
    text-decoration: underline;
  }

  /* ── Consent Items ── */
  .consent-items {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .consent-item {
    display: flex;
    align-items: flex-start;
    background: #f1faf4;
    border: 1px solid #c8e6c9;
    border-radius: 12px;
    padding: 0.875rem 1rem;
    font-size: 0.88rem;
    color: #1b5e20;
    line-height: 1.5;
  }

  /* ── Footer ── */
  .footer-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2.5rem;
    flex-wrap: wrap;
  }

  .footer-btn {
    font-weight: 600;
    font-size: 0.9rem;
    min-height: 44px;
    text-transform: none;
    padding: 0 1.5rem;
    background: #1565c0 !important;
  }

  .footer-btn--outline {
    border-color: rgba(255, 255, 255, 0.5) !important;
    background: transparent !important;
  }

  .footer-btn--outline:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }

  .footer-copy {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    margin-top: 1.25rem;
    padding-bottom: 1rem;
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .main-layout {
      gap: 1rem;
    }

    .toc-sidebar {
      width: 220px;
    }
  }

  @media (max-width: 768px) {
    .page-content {
      width: 96%;
    }

    .main-layout {
      flex-direction: column;
    }

    .toc-sidebar {
      width: 100%;
      position: static;
    }

    .toc-card {
      max-height: none;
    }

    .toc-nav {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.3rem;
    }

    .toc-link {
      font-size: 0.78rem;
      padding: 0.5rem 0.65rem;
      border-left: none;
      border-bottom: 2px solid transparent;
    }

    .toc-link--active {
      border-left: none;
      border-bottom-color: #1565c0;
    }

    .hero-title {
      font-size: 1.5rem;
    }

    .purpose-grid {
      grid-template-columns: 1fr;
    }

    .sticky-header {
      padding: 1rem 0.75rem 0.75rem;
    }

    .law-banner {
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .page-content {
      width: 100%;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      padding-top: 1rem;
    }

    .back-btn-wrapper {
      top: 0.75rem;
      left: 0.75rem;
    }

    .hero-title {
      font-size: 1.25rem;
    }

    .toc-nav {
      grid-template-columns: 1fr;
    }

    .data-type-grid {
      grid-template-columns: 1fr;
    }

    .security-grid {
      grid-template-columns: 1fr;
    }

    .rights-grid {
      grid-template-columns: 1fr;
    }

    .basis-grid {
      grid-template-columns: 1fr;
    }

    .dsa-grid {
      grid-template-columns: 1fr;
    }

    .retention-row {
      grid-template-columns: 1fr;
    }

    .retention-row--head .ret-col:last-child {
      display: none;
    }

    .section-header {
      padding: 1rem 1.25rem;
    }

    .section-body {
      padding: 1.25rem;
    }

    .section-title {
      font-size: 1rem;
    }

    .footer-actions {
      flex-direction: column;
      align-items: center;
    }

    .sticky-header {
      padding: 0.75rem 0.5rem 0.75rem;
    }

    .hero-logo {
      width: 36px;
    }
  }
</style>
