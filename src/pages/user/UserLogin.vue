<template>
  <div class="login-page">
    <!-- Main Login Section -->
    <div class="login-section">
      <div class="login-overlay"></div>
      <div class="login-content">
        <div class="login-card">
          <!-- Logo and Header -->
          <div class="login-header">
            <img src="/logo.png" alt="Logo" class="login-logo" />
            <h1 class="main-title">Recruitment Selection & Placement</h1>
            <h2 class="login-title">
              {{
                emailStore.isOtpSent
                  ? 'Verify Your Email'
                  : 'Join Our Team - Explore Available Positions'
              }}
            </h2>
            <p class="login-subtitle">
              {{
                emailStore.isOtpSent
                  ? 'Enter the verification code sent to your email'
                  : 'Please sign in to continue'
              }}
            </p>
          </div>

          <!-- Email Input Form -->
          <div v-if="!emailStore.isOtpSent" class="form-container">
            <div class="input-group">
              <label class="input-label">Email Address</label>
              <q-input
                v-model="emailInput"
                placeholder="Enter your email address"
                type="email"
                filled
                dense
                :rules="emailRules"
                @keyup.enter="handleSendOtp"
                class="custom-input"
                lazy-rules
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>
            </div>

            <RecaptchaComponent
              ref="emailCaptchaRef"
              :sitekey="recaptchaSiteKey"
              @verify="onEmailCaptchaVerified"
              @expired="onEmailCaptchaExpired"
              @error="onCaptchaError"
              theme="light"
              :size="captchaSize"
            />

            <!-- Terms & Agreement -->
            <div class="agreement-card" :class="{ 'agreement-card--error': showAgreementError }">
              <q-checkbox
                v-model="agreedToTerms"
                color="primary"
                dense
                keep-color
                class="agreement-checkbox"
                @update:model-value="showAgreementError = false"
              >
                <template v-slot:default>
                  <span class="agreement-label">
                    I have read and agree to the
                    <router-link to="/terms" class="agreement-link terms-link" @click.stop>
                      Terms and Conditions
                    </router-link>
                    and
                    <router-link to="/privacy" class="agreement-link privacy-link" @click.stop>
                      Privacy Policy.
                    </router-link>
                  </span>
                </template>
              </q-checkbox>

              <transition name="err-fade">
                <div v-if="showAgreementError" class="agreement-error-msg">
                  <q-icon name="error_outline" size="13px" class="q-mr-xs" />
                  Please agree to the Terms and Privacy Policy to continue.
                </div>
              </transition>
            </div>

            <q-btn
              label="Send Verification Code"
              color="primary"
              @click="handleSendOtp"
              :loading="emailStore.loading"
              :disable="!canSendOtp"
              unelevated
              rounded
              :size="buttonSize"
              class="submit-btn"
            >
              <q-icon name="arrow_forward" :size="iconSize" right />
            </q-btn>

            <div class="info-box">
              <q-icon name="info_outline" :size="infoIconSize" color="primary" />
              <span class="info-text">We'll send a one-time verification code to your email</span>
            </div>
          </div>

          <!-- OTP Verification -->
          <div v-else class="form-container">
            <!-- Email Display -->
            <div class="email-display-card">
              <div class="email-info">
                <q-icon name="mark_email_read" :size="emailIconSize" color="primary" />
                <div class="email-text">
                  <span class="label">Verification code sent to:</span>
                  <span class="email-value">{{ emailStore.email }}</span>
                </div>
              </div>
              <q-btn
                flat
                dense
                round
                icon="edit"
                :size="editButtonSize"
                color="primary"
                @click="handleResetForm"
                class="edit-btn"
              >
                <q-tooltip>Change Email</q-tooltip>
              </q-btn>
            </div>

            <!-- OTP Input -->
            <div class="input-group">
              <label class="input-label">Verification Code</label>
              <q-input
                v-model="otpInput"
                placeholder="Enter 6-digit code"
                type="text"
                filled
                dense
                maxlength="6"
                class="custom-input otp-input"
                :rules="otpRules"
                @keyup.enter="handleVerifyOtp"
                lazy-rules
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
              </q-input>

              <!-- ── Email Delivery Notice ── -->

              <div class="otp-notice-box">
                <div class="otp-notice-header">
                  <q-icon name="campaign" size="15px" class="otp-notice-icon" />
                  <span class="otp-notice-title">Important Notice</span>
                </div>
                <p class="otp-notice-body">
                  Due to the high volume of applicants, email delivery may be delayed. If you do not
                  receive your code, please try again after a few hours or the following day.
                </p>
              </div>
              <!-- ── End Email Delivery Notice ── -->
              <!-- ── End Email Delivery Notice ── -->
            </div>

            <q-btn
              label="Verify & Continue"
              color="primary"
              @click="handleVerifyOtp"
              :loading="emailStore.verifying || redirecting"
              :disable="!canVerifyOtp || redirecting"
              unelevated
              rounded
              :size="buttonSize"
              class="submit-btn"
            >
              <q-icon name="check_circle" :size="iconSize" right />
            </q-btn>

            <!-- Resend Section -->
            <div class="resend-section">
              <span class="resend-text">Didn't receive the code?</span>
              <q-btn
                :label="resendLabel"
                color="primary"
                flat
                @click="handleResendOtp"
                :loading="emailStore.resending"
                :disable="!emailStore.canResend"
                :size="resendButtonSize"
                class="resend-btn"
              />
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="footer-info">
          <div class="help-text">
            <q-icon name="help_outline" :size="footerIconSize" />
            <span class="help-content">
              Need assistance? Contact us at
              <a href="mailto:lgutagumhrmo.recruitment@gmail.com" class="help-link">
                <span class="gt-xs">lgutagumhrmo.recruitment@gmail.com</span>
                <span class="lt-sm">Email Support</span>
              </a>
            </span>
          </div>
          <div class="copyright">
            © 2025 City Government of Tagum. All rights reserved. Developed by CICTMO.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useEmailStore } from 'src/stores/emailStore';
  import RecaptchaComponent from 'src/pages/user/RecaptchaComponent.vue';

  const router = useRouter();
  const $q = useQuasar();
  const emailStore = useEmailStore();
  const redirecting = ref(false);

  // Form inputs
  const emailInput = ref('');
  const otpInput = ref('');

  // Refs for CAPTCHA components
  const emailCaptchaRef = ref(null);

  // CAPTCHA responses
  const emailCaptchaResponse = ref('');

  // Agreement state (only used to gate the button, never sent to backend)
  const agreedToTerms = ref(false);
  const showAgreementError = ref(false);

  // Constants
  const recaptchaSiteKey =
    process.env.RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // Responsive computed properties
  const captchaSize = computed(() => 'normal');

  const buttonSize = computed(() => {
    if ($q.screen.xs) return 'md';
    return 'lg';
  });

  const iconSize = computed(() => {
    if ($q.screen.xs) return 'xs';
    return 'sm';
  });

  const infoIconSize = computed(() => {
    if ($q.screen.xs) return '1rem';
    return '1.2rem';
  });

  const emailIconSize = computed(() => {
    if ($q.screen.xs) return '1.5rem';
    if ($q.screen.sm) return '1.75rem';
    return '2rem';
  });

  const editButtonSize = computed(() => {
    if ($q.screen.xs) return 'xs';
    return 'sm';
  });

  const resendButtonSize = computed(() => {
    if ($q.screen.xs) return 'sm';
    return 'md';
  });

  const footerIconSize = computed(() => {
    if ($q.screen.xs) return '1rem';
    return '1.2rem';
  });

  const resendLabel = computed(() => {
    if (emailStore.resendTimer > 0) {
      return `Resend in ${emailStore.resendTimer}s`;
    }
    return 'Resend Code';
  });

  // Validation rules
  const emailRules = [
    (val) => !!val || 'Email is required',
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email',
  ];

  const otpRules = [
    (val) => !!val || 'Verification code is required',
    (val) => val.length === 6 || 'Code must be 6 digits',
    (val) => /^\d+$/.test(val) || 'Code must contain only numbers',
  ];

  // Computed properties
  const canSendOtp = computed(() => {
    return (
      emailInput.value &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value) &&
      emailCaptchaResponse.value &&
      agreedToTerms.value && // gates the button only, not sent to backend
      !emailStore.loading
    );
  });

  const canVerifyOtp = computed(() => {
    return (
      otpInput.value &&
      otpInput.value.length === 6 &&
      /^\d+$/.test(otpInput.value) &&
      !emailStore.verifying
    );
  });

  // CAPTCHA handlers
  const onEmailCaptchaVerified = (response) => {
    emailCaptchaResponse.value = response;
  };

  const onEmailCaptchaExpired = () => {
    emailCaptchaResponse.value = '';
    $q.notify({
      type: 'warning',
      message: 'CAPTCHA expired. Please verify again.',
      position: 'top',
    });
  };

  const onCaptchaError = () => {
    emailCaptchaResponse.value = '';
    $q.notify({
      type: 'negative',
      message: 'Error loading CAPTCHA. Please refresh the page.',
      position: 'top',
    });
  };

  // Action handlers
  const handleSendOtp = async () => {
    if (!canSendOtp.value) {
      if (!agreedToTerms.value) {
        showAgreementError.value = true;
        setTimeout(() => {
          showAgreementError.value = false;
        }, 4000);
      } else if (!emailInput.value) {
        $q.notify({
          type: 'negative',
          message: 'Please enter your email address.',
          position: 'top',
        });
      } else if (!emailCaptchaResponse.value) {
        $q.notify({
          type: 'negative',
          message: 'Please complete the CAPTCHA verification.',
          position: 'top',
        });
      }
      return;
    }

    try {
      // agreedToTerms is intentionally NOT passed to sendOtp
      await emailStore.sendOtp(emailInput.value, emailCaptchaResponse.value);

      $q.notify({
        type: 'positive',
        message: 'Verification code sent successfully!',
        position: 'top',
        timeout: 4000,
        icon: 'check_circle',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to send verification code.',
        position: 'top',
        timeout: 4000,
      });
      resetEmailCaptcha();
    }
  };

  const handleResendOtp = async () => {
    if (!emailStore.canResend) return;

    try {
      await emailStore.resendOtp();
      otpInput.value = '';
      $q.notify({
        type: 'positive',
        message: 'New verification code sent to your email.',
        position: 'top',
        icon: 'check_circle',
      });
      resetEmailCaptcha();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to resend verification code.',
        position: 'top',
      });
      resetEmailCaptcha();
    }
  };

  const handleVerifyOtp = async () => {
    if (!canVerifyOtp.value) {
      if (!otpInput.value || otpInput.value.length !== 6) {
        $q.notify({
          type: 'negative',
          message: 'Please enter a valid 6-digit verification code.',
          position: 'top',
        });
      }
      return;
    }

    try {
      await emailStore.verifyOtp(otpInput.value);

      redirecting.value = true;
      $q.notify({
        type: 'positive',
        message: 'Verification successful! Redirecting...',
        position: 'top',
        timeout: 2000,
        icon: 'check_circle',
      });

      setTimeout(() => {
        router.push('/page');
      }, 2000);
    } catch (error) {
      redirecting.value = false;
      $q.notify({
        type: 'negative',
        message: error.message || 'Invalid verification code.',
        position: 'top',
        timeout: 4000,
      });
    }
  };

  const handleResetForm = () => {
    emailStore.resetState();
    emailInput.value = '';
    otpInput.value = '';
    resetEmailCaptcha();
  };

  const resetEmailCaptcha = () => {
    if (emailCaptchaRef.value) {
      emailCaptchaRef.value.reset();
    }
    emailCaptchaResponse.value = '';
  };

  onUnmounted(() => {
    emailStore.resetState();
  });
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  .login-page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .login-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/tagum-city-hall.webp');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
  }

  .login-overlay::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(55, 126, 81, 0.85) 0%, rgba(72, 71, 73, 0.85) 100%);
    z-index: 1;
  }

  .login-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .login-card {
    background: white;
    border-radius: 20px;
    padding: 3rem 2.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.6s ease-out;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .login-logo {
    max-width: 100px;
    height: auto;
    margin-bottom: 1.5rem;
    animation: fadeIn 0.8s ease-out;
  }

  .main-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a7e44;
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
  }

  .login-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #28933c;
    margin: 0 0 0.75rem 0;
    line-height: 1.3;
  }

  .login-subtitle {
    font-size: 1rem;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-label {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .custom-input :deep(.q-field__control) {
    border-radius: 12px;
    min-height: 48px;
  }

  .custom-input :deep(.q-field__native) {
    font-size: 1rem;
  }

  .custom-input :deep(.q-field__prepend) {
    padding-left: 12px;
  }

  .otp-input :deep(input) {
    letter-spacing: 0.8rem;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
  }

  .recaptcha-section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 90px;
    overflow: visible;
    padding: 0.5rem 0;
  }

  .submit-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    font-weight: 600;
    font-size: 1rem;
    text-transform: none;
    letter-spacing: 0.5px;
    min-height: 48px;
  }

  .info-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: #e3f2fd;
    border-radius: 12px;
    line-height: 1.5;
  }

  .info-text {
    font-size: 0.875rem;
    color: #1565c0;
    flex: 1;
  }

  .email-display-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    gap: 1rem;
  }

  .email-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
  }

  .email-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .email-text .label {
    font-size: 0.75rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .email-text .email-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1a237e;
    word-break: break-all;
    line-height: 1.3;
  }

  .edit-btn {
    flex-shrink: 0;
  }

  .resend-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e0e0e0;
  }

  .resend-text {
    font-size: 0.875rem;
    color: #666;
    text-align: center;
  }

  .resend-btn {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: none;
  }

  /* ── OTP Notice Box ── */
  .otp-notice-box {
    margin-top: 0.5rem;
    padding: 0.875rem 1rem;
    background: #fffde7;
    border: 1px solid #f9a825;
    border-left: 4px solid #f9a825;
    border-radius: 10px;
  }

  .otp-notice-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }

  .otp-notice-icon {
    color: #f57f17;
    flex-shrink: 0;
  }

  .otp-notice-title {
    font-size: 0.825rem;
    font-weight: 700;
    color: #e65100;
  }

  .otp-notice-body {
    font-size: 0.8rem;
    color: #5d4037;
    line-height: 1.65;
    margin: 0;
  }

  .otp-notice-body strong {
    color: #bf360c;
    font-weight: 700;
  }

  .otp-notice-body em {
    font-style: normal;
    font-weight: 600;
    color: #1565c0;
  }
  /* ── End OTP Notice Box ── */

  /* ── Agreement ── */
  .agreement-card {
    background: linear-gradient(135deg, #f0faf4 0%, #e8f5ec 100%);
    border: 1px solid #a5d6b0;
    border-radius: 12px;
    padding: 14px 16px 10px 16px;
    transition:
      border-color 0.25s,
      box-shadow 0.25s;
  }

  .agreement-card:hover {
    border-color: #2e7d32;
    box-shadow: 0 2px 10px rgba(46, 125, 50, 0.1);
  }

  .agreement-card--error {
    border-color: #ef9a9a !important;
    background: linear-gradient(135deg, #fff5f5 0%, #ffecec 100%) !important;
    animation: shake 0.35s ease;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-4px);
    }
    40% {
      transform: translateX(4px);
    }
    60% {
      transform: translateX(-3px);
    }
    80% {
      transform: translateX(3px);
    }
  }

  .agreement-checkbox {
    align-items: flex-start !important;
    width: 100%;
  }

  .agreement-label {
    font-size: 0.82rem;
    color: #333;
    line-height: 1.6;
    margin-left: 4px;
  }

  .agreement-link {
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1.5px solid transparent;
    transition:
      border-color 0.2s,
      opacity 0.2s;
  }

  .agreement-link:hover {
    opacity: 0.75;
    border-bottom-color: currentColor;
  }

  .terms-link {
    color: #1a7e44;
  }
  .privacy-link {
    color: #1565c0;
  }

  .agreement-error-msg {
    display: flex;
    align-items: center;
    color: #c62828;
    font-size: 0.76rem;
    background: #ffebee;
    border-radius: 6px;
    padding: 5px 10px;
    margin-top: 6px;
  }

  .err-fade-enter-active,
  .err-fade-leave-active {
    transition: all 0.3s ease;
  }
  .err-fade-enter-from,
  .err-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
  /* ── End Agreement ── */

  .footer-info {
    margin-top: 2rem;
    text-align: center;
    color: white;
  }

  .help-text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    line-height: 1.6;
  }

  .help-content {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .help-link {
    color: white;
    text-decoration: underline;
    font-weight: 600;
    transition: opacity 0.3s ease;
  }

  .help-link:hover {
    opacity: 0.8;
  }

  .copyright {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 599px) {
    .recaptcha-section {
      min-height: 160px;
    }
  }

  /* Tablet (600px - 1023px) */
  @media (max-width: 1023px) and (min-width: 600px) {
    .login-section {
      padding: 1.5rem 1rem;
    }
    .login-card {
      padding: 2.5rem 2rem;
    }
    .main-title {
      font-size: 1.5rem;
    }
    .login-title {
      font-size: 1.15rem;
    }
    .login-subtitle {
      font-size: 0.95rem;
    }
    .form-container {
      gap: 1.5rem;
    }
  }

  /* Mobile (<600px) */
  @media (max-width: 599px) {
    .login-section {
      padding: 1rem 0.75rem;
      background-attachment: scroll;
    }
    .login-overlay {
      background-attachment: scroll;
    }
    .login-card {
      padding: 2rem 1.5rem;
      border-radius: 16px;
    }
    .login-header {
      margin-bottom: 2rem;
    }
    .login-logo {
      max-width: 80px;
      margin-bottom: 1.25rem;
    }
    .main-title {
      font-size: 1.25rem;
    }
    .login-title {
      font-size: 1rem;
    }
    .login-subtitle {
      font-size: 0.875rem;
    }
    .form-container {
      gap: 1.5rem;
    }
    .input-label {
      font-size: 0.95rem;
    }
    .custom-input :deep(.q-field__control) {
      min-height: 44px;
    }
    .custom-input :deep(.q-field__native) {
      font-size: 0.95rem;
    }
    .submit-btn {
      font-size: 0.95rem;
      min-height: 44px;
      padding: 0.625rem 1rem;
    }
    .info-text {
      font-size: 0.8rem;
    }
    .email-display-card {
      padding: 1rem;
      flex-wrap: wrap;
    }
    .email-info {
      flex-wrap: wrap;
    }
    .email-text .email-value {
      font-size: 0.9rem;
    }
    .edit-btn {
      margin-left: auto;
    }
    .otp-input :deep(input) {
      letter-spacing: 0.5rem;
      font-size: 1.25rem;
    }
    .resend-text {
      font-size: 0.8rem;
    }
    .help-text {
      font-size: 0.8rem;
    }
    .copyright {
      font-size: 0.7rem;
    }
    .footer-info {
      margin-top: 1.5rem;
    }
    .agreement-card {
      padding: 12px 12px 8px 12px;
    }
    .agreement-label {
      font-size: 0.78rem;
    }
    .agreement-error-msg {
      font-size: 0.73rem;
    }
    .otp-notice-box {
      padding: 0.75rem 0.875rem;
    }
    .otp-notice-title {
      font-size: 0.78rem;
    }
    .otp-notice-body {
      font-size: 0.75rem;
    }
  }

  /* Extra Small (<360px) */
  @media (max-width: 359px) {
    .login-section {
      padding: 0.75rem 0.5rem;
    }
    .login-card {
      padding: 1.5rem 1rem;
      border-radius: 12px;
    }
    .login-logo {
      max-width: 70px;
      margin-bottom: 1rem;
    }
    .main-title {
      font-size: 1.1rem;
    }
    .login-title {
      font-size: 0.95rem;
    }
    .login-subtitle {
      font-size: 0.8rem;
    }
    .form-container {
      gap: 1.25rem;
    }
    .input-label {
      font-size: 0.875rem;
    }
    .custom-input :deep(.q-field__control) {
      min-height: 40px;
    }
    .custom-input :deep(.q-field__native) {
      font-size: 0.875rem;
    }
    .submit-btn {
      font-size: 0.875rem;
      min-height: 40px;
      padding: 0.5rem 0.75rem;
    }
    .info-box {
      padding: 0.75rem;
    }
    .info-text {
      font-size: 0.75rem;
    }
    .email-display-card {
      padding: 0.875rem;
    }
    .email-text .label {
      font-size: 0.7rem;
    }
    .email-text .email-value {
      font-size: 0.85rem;
    }
    .otp-input :deep(input) {
      letter-spacing: 0.4rem;
      font-size: 1.1rem;
    }
    .resend-text {
      font-size: 0.75rem;
    }
    .help-text {
      font-size: 0.75rem;
    }
    .copyright {
      font-size: 0.65rem;
    }
    .agreement-card {
      padding: 10px 10px 8px 10px;
    }
    .agreement-label {
      font-size: 0.74rem;
    }
    .otp-notice-box {
      padding: 0.625rem 0.75rem;
    }
    .otp-notice-title {
      font-size: 0.74rem;
    }
    .otp-notice-body {
      font-size: 0.72rem;
    }
  }

  /* Large Desktop (>1440px) */
  @media (min-width: 1440px) {
    .login-content {
      max-width: 550px;
    }
    .login-card {
      padding: 3.5rem 3rem;
    }
    .main-title {
      font-size: 2rem;
    }
    .login-title {
      font-size: 1.35rem;
    }
    .login-subtitle {
      font-size: 1.1rem;
    }
  }
</style>
