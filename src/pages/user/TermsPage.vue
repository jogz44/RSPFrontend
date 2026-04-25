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
          <q-icon name="gavel" size="14px" class="q-mr-xs" />
          Terms & Conditions Document
        </div>
        <h1 class="hero-title">Terms &amp; Conditions</h1>
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
            <q-icon name="menu_book" size="13px" class="q-mr-xs" />
            12 Sections
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
              <!-- Section 1 -->
              <div id="section-1" class="section-card">
                <div class="section-header">
                  <div class="section-num">1</div>
                  <h2 class="section-title">Acceptance of Terms</h2>
                </div>
                <div class="section-body">
                  <p>
                    By accessing and using the Recruitment, Selection, and Placement System
                    ("System"), you agree to be bound by these Terms and Conditions.
                  </p>
                  <p>
                    The System is an official platform of the City Government of Tagum, administered
                    by the City Human Resource Management Office (CHRMO) for recruitment, selection,
                    and placement processes.
                  </p>
                  <div class="notice-box notice-box--warning">
                    <q-icon name="warning_amber" size="18px" class="notice-icon" />
                    <span>
                      If you do not agree to these Terms and Conditions, you must discontinue use of
                      the System immediately.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Section 2 -->
              <div id="section-2" class="section-card">
                <div class="section-header">
                  <div class="section-num">2</div>
                  <h2 class="section-title">Definitions</h2>
                </div>
                <div class="section-body">
                  <div class="definition-list">
                    <div class="definition-item" v-for="def in definitions" :key="def.term">
                      <span class="def-term">{{ def.term }}</span>
                      <span class="def-sep">—</span>
                      <span class="def-desc">{{ def.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3 -->
              <div id="section-3" class="section-card">
                <div class="section-header">
                  <div class="section-num">3</div>
                  <h2 class="section-title">User Access and Authentication</h2>
                </div>
                <div class="section-body">
                  <h3 class="sub-heading">3.1 Email-Based OTP Authentication</h3>
                  <p>
                    Access to the System is granted through email verification using a One-Time
                    Password (OTP).
                  </p>
                  <p>Users acknowledge that:</p>
                  <ul class="styled-list">
                    <li>A valid and active email address is required</li>
                    <li>OTP authentication is mandatory for access</li>
                    <li>The verified email serves as the official user identity</li>
                  </ul>
                  <div class="notice-box notice-box--info">
                    <q-icon name="info_outline" size="18px" class="notice-icon" />
                    <span>
                      The City Government shall not be liable for unauthorized access resulting from
                      compromised email accounts.
                    </span>
                  </div>

                  <h3 class="sub-heading">3.2 User Responsibilities</h3>
                  <p>Users agree to:</p>
                  <ul class="styled-list">
                    <li>Use only their own email address</li>
                    <li>Ensure all submitted data is accurate and current</li>
                    <li>Maintain confidentiality of OTP access</li>
                    <li>Accept responsibility for all activities performed under their access</li>
                  </ul>

                  <h3 class="sub-heading">3.3 Suspension or Restriction of Access</h3>
                  <p>Access may be suspended or restricted in cases of:</p>
                  <ul class="styled-list styled-list--red">
                    <li>Submission of false or misleading information</li>
                    <li>Email mismatch between account and submitted documents</li>
                    <li>Abuse of authentication mechanisms</li>
                    <li>Violation of applicable laws, CSC rules, or policies</li>
                  </ul>
                </div>
              </div>

              <!-- Section 4 -->
              <div id="section-4" class="section-card">
                <div class="section-header">
                  <div class="section-num">4</div>
                  <h2 class="section-title">Submission Requirements</h2>
                </div>
                <div class="section-body">
                  <h3 class="sub-heading">4.1 Personal Data Sheet (PDS)</h3>
                  <p>Applicants must upload their PDS using the official Excel template.</p>
                  <div class="req-grid">
                    <div class="req-item req-item--green">
                      <q-icon name="check_circle" size="16px" class="q-mr-xs" />
                      Strict adherence to prescribed format
                    </div>
                    <div class="req-item req-item--green">
                      <q-icon name="check_circle" size="16px" class="q-mr-xs" />
                      Email in PDS must exactly match registered email
                    </div>
                    <div class="req-item req-item--red">
                      <q-icon name="cancel" size="16px" class="q-mr-xs" />
                      Non-compliance may result in automatic disqualification
                    </div>
                  </div>

                  <h3 class="sub-heading">4.2 Supporting Documents</h3>
                  <p>Applicants must upload supporting documents in a single ZIP file.</p>
                  <div class="two-col">
                    <div class="col-card col-card--green">
                      <div class="col-card-title">
                        <q-icon name="check_circle_outline" size="16px" class="q-mr-xs" />
                        Allowed Formats
                      </div>
                      <ul>
                        <li>PDF</li>
                        <li>JPG, JPEG, PNG</li>
                      </ul>
                    </div>
                    <div class="col-card col-card--red">
                      <div class="col-card-title">
                        <q-icon name="block" size="16px" class="q-mr-xs" />
                        Not Allowed
                      </div>
                      <ul>
                        <li>Executable or script files</li>
                        <li>Unsupported or corrupted files</li>
                        <li>Password-protected files</li>
                      </ul>
                    </div>
                  </div>

                  <h3 class="sub-heading">4.3 System Validation and Enforcement</h3>
                  <p>
                    The System may automatically validate submissions. The City Government reserves
                    the right to reject incomplete or invalid submissions, flag inconsistencies for
                    review, and disqualify applications that fail validation checks.
                  </p>

                  <h3 class="sub-heading">4.4 Applicant Accountability</h3>
                  <p>
                    Applicants are fully responsible for accuracy and truthfulness of submitted
                    data, completeness and readability of documents, and compliance with CSC
                    requirements.
                  </p>
                  <div class="notice-box notice-box--warning">
                    <q-icon name="gavel" size="18px" class="notice-icon" />
                    <span>
                      False declarations may result in administrative, civil, or criminal liability.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Section 5 -->
              <div id="section-5" class="section-card">
                <div class="section-header">
                  <div class="section-num">5</div>
                  <h2 class="section-title">Use of the System</h2>
                </div>
                <div class="section-body">
                  <div class="two-col">
                    <div class="col-card col-card--green">
                      <div class="col-card-title">
                        <q-icon name="thumb_up_alt" size="16px" class="q-mr-xs" />
                        Permitted Use
                      </div>
                      <ul>
                        <li>Job application submission</li>
                        <li>Viewing job vacancies</li>
                        <li>Receiving application updates</li>
                      </ul>
                    </div>
                    <div class="col-card col-card--red">
                      <div class="col-card-title">
                        <q-icon name="thumb_down_alt" size="16px" class="q-mr-xs" />
                        Prohibited Acts
                      </div>
                      <ul>
                        <li>Provide false information</li>
                        <li>Impersonate another person</li>
                        <li>Attempt unauthorized system access</li>
                        <li>Interfere with system operations</li>
                        <li>Use automated scraping or bots</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 6 -->
              <div id="section-6" class="section-card">
                <div class="section-header">
                  <div class="section-num">6</div>
                  <h2 class="section-title">Automated Processing Disclosure</h2>
                </div>
                <div class="section-body">
                  <p>The System may use automated tools to assist in evaluating applicants.</p>
                  <ul class="styled-list">
                    <li>Outputs are advisory only</li>
                    <li>Final decisions are made by authorized CHRMO personnel</li>
                    <li>Evaluation is based on qualification standards and CSC guidelines</li>
                  </ul>
                </div>
              </div>

              <!-- Section 7 -->
              <div id="section-7" class="section-card">
                <div class="section-header">
                  <div class="section-num">7</div>
                  <h2 class="section-title">Compliance with Laws and CSC Standards</h2>
                </div>
                <div class="section-body">
                  <p>The System adheres to:</p>
                  <ul class="styled-list">
                    <li>
                      Civil Service Commission (CSC) recruitment, selection, and placement policies
                    </li>
                    <li>Equal opportunity and merit-based hiring principles</li>
                    <li>Applicable Philippine laws and regulations</li>
                  </ul>
                </div>
              </div>

              <!-- Section 8 -->
              <div id="section-8" class="section-card">
                <div class="section-header">
                  <div class="section-num">8</div>
                  <h2 class="section-title">Intellectual Property</h2>
                </div>
                <div class="section-body">
                  <p>
                    All System content, including but not limited to software, design, text,
                    graphics, and functionality, is owned by the City Government of Tagum and
                    protected by applicable Philippine intellectual property laws.
                  </p>
                </div>
              </div>

              <!-- Section 9 -->
              <div id="section-9" class="section-card">
                <div class="section-header">
                  <div class="section-num">9</div>
                  <h2 class="section-title">Disclaimer of Warranties</h2>
                </div>
                <div class="section-body">
                  <p>
                    The System is provided
                    <strong>"as is"</strong>
                    without warranties of uninterrupted or error-free operation. The City Government
                    makes no representations that the System will be continuously available, secure,
                    or free from defects.
                  </p>
                </div>
              </div>

              <!-- Section 10 -->
              <div id="section-10" class="section-card">
                <div class="section-header">
                  <div class="section-num">10</div>
                  <h2 class="section-title">Limitation of Liability</h2>
                </div>
                <div class="section-body">
                  <p>The City Government shall not be liable for:</p>
                  <ul class="styled-list styled-list--red">
                    <li>Loss of data</li>
                    <li>Unauthorized access</li>
                    <li>System downtime</li>
                    <li>Decisions influenced by automated outputs</li>
                  </ul>
                </div>
              </div>

              <!-- Section 11 -->
              <div id="section-11" class="section-card">
                <div class="section-header">
                  <div class="section-num">11</div>
                  <h2 class="section-title">Amendments</h2>
                </div>
                <div class="section-body">
                  <p>
                    These Terms may be updated at any time without prior notice. Continued use of
                    the System after any amendments constitutes acceptance of the revised Terms and
                    Conditions.
                  </p>
                </div>
              </div>

              <!-- Section 12 -->
              <div id="section-12" class="section-card">
                <div class="section-header">
                  <div class="section-num">12</div>
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
                      <q-icon name="location_on" size="20px" color="primary" />
                      <div>
                        <div class="contact-label">Address</div>
                        <div class="contact-value">
                          2nd Floor, City Hall of Tagum, J.V. Ayala Avenue, Barangay Apokon, Tagum
                          City
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
                label="Privacy Policy"
                icon="privacy_tip"
                @click="goToPrivacy"
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
  const goToPrivacy = () => router.push('/privacy');

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
    { id: 1, title: 'Acceptance of Terms' },
    { id: 2, title: 'Definitions' },
    { id: 3, title: 'User Access and Authentication' },
    { id: 4, title: 'Submission Requirements' },
    { id: 5, title: 'Use of the System' },
    { id: 6, title: 'Automated Processing Disclosure' },
    { id: 7, title: 'Compliance with CSC Standards' },
    { id: 8, title: 'Intellectual Property' },
    { id: 9, title: 'Disclaimer of Warranties' },
    { id: 10, title: 'Limitation of Liability' },
    { id: 11, title: 'Amendments' },
    { id: 12, title: 'Contact Information' },
  ];

  const definitions = [
    { term: 'System', desc: 'RSPS web application and related services' },
    { term: 'User', desc: 'Any individual accessing the System' },
    { term: 'Applicant', desc: 'A user applying for a position' },
    { term: 'PDS', desc: 'Personal Data Sheet (CSC Form No. 212, Revised 2025)' },
    { term: 'CHRMO', desc: 'City Human Resource Management Office' },
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
    background: linear-gradient(135deg, rgba(55, 126, 81, 0.92) 0%, rgba(72, 71, 73, 0.92) 100%);
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
    background: transparent;
    padding: 1.5rem 1rem 1rem;
    text-align: center;
    color: white;
    backdrop-filter: blur(10px);
    background: rgba(55, 126, 81, 0.3);
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
  }

  .toc-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 0.875rem;
    border-bottom: 2px solid #f0f4f1;
  }

  .toc-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1a2e1f;
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
    background: #f0faf4;
    color: #1a7e44;
  }

  .toc-link--active {
    background: #f0faf4;
    color: #1a7e44;
    border-left-color: #1a7e44;
    font-weight: 600;
  }

  .toc-link--active .toc-num {
    background: #0d5e2e;
  }

  .toc-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    min-width: 22px;
    background: #1a7e44;
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

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.75rem;
    background: linear-gradient(135deg, #f7fbf8 0%, #eef6f0 100%);
    border-bottom: 1px solid #e0ede4;
  }

  .section-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    min-width: 38px;
    background: linear-gradient(135deg, #1a7e44 0%, #28933c 100%);
    color: white;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 800;
    box-shadow: 0 3px 8px rgba(26, 126, 68, 0.35);
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a2e1f;
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
    color: #1a7e44;
    margin: 0.5rem 0 0;
    padding-bottom: 0.4rem;
    border-bottom: 1px dashed #c8e6d0;
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
    background: #1a7e44;
    margin-top: 0.45em;
  }

  .styled-list--red li::before {
    background: #c62828;
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

  .notice-box--warning {
    background: #fff8e1;
    color: #e65100;
    border: 1px solid #ffe0b2;
  }

  .notice-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Definition List ── */
  .definition-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid #e0ede4;
    border-radius: 12px;
    overflow: hidden;
  }

  .definition-item {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 0.88rem;
    border-bottom: 1px solid #f0f4f1;
  }

  .definition-item:last-child {
    border-bottom: none;
  }
  .definition-item:nth-child(odd) {
    background: #fafffe;
  }

  .def-term {
    font-weight: 700;
    color: #1a7e44;
    min-width: 80px;
    font-size: 0.85rem;
  }

  .def-sep {
    color: #aaa;
  }

  .def-desc {
    color: #444;
    line-height: 1.5;
  }

  /* ── Req Grid ── */
  .req-grid {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .req-item {
    display: flex;
    align-items: center;
    padding: 0.55rem 0.875rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .req-item--green {
    background: #f1faf4;
    color: #1b5e20;
    border: 1px solid #c8e6c9;
  }

  .req-item--red {
    background: #fff5f5;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }

  /* ── Two Col ── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.875rem;
  }

  .col-card {
    border-radius: 12px;
    padding: 1rem;
    font-size: 0.85rem;
  }

  .col-card-title {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 0.82rem;
    margin-bottom: 0.6rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .col-card ul {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .col-card li {
    line-height: 1.5;
  }

  .col-card--green {
    background: #f1faf4;
    border: 1px solid #c8e6c9;
    color: #1b5e20;
  }

  .col-card--red {
    background: #fff5f5;
    border: 1px solid #ffcdd2;
    color: #c62828;
  }

  /* ── Contact Card ── */
  .contact-card {
    background: #f7fbf8;
    border: 1px solid #c8e6c9;
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
    color: #1a2e1f;
  }

  .contact-link {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1a7e44;
    text-decoration: none;
  }

  .contact-link:hover {
    text-decoration: underline;
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
  }

  .footer-btn--outline {
    border-color: rgba(255, 255, 255, 0.5) !important;
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
      border-bottom-color: #1a7e44;
    }

    .hero-title {
      font-size: 1.5rem;
    }

    .two-col {
      grid-template-columns: 1fr;
    }

    .sticky-header {
      padding: 1rem 0.75rem 0.75rem;
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
