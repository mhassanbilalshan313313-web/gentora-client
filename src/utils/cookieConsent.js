/**
 * Utility functions for managing Cookie Consent and blocking optional scripts.
 * Choice is remembered for 6 months (180 days).
 */

const STORAGE_KEY = 'gentora_cookie_consent';
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

export const getCookieConsent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const consent = JSON.parse(raw);
    if (!consent || !consent.expiresAt) return null;

    // Check if consent has expired (> 6 months)
    if (Date.now() > consent.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return consent;
  } catch (e) {
    return null;
  }
};

export const saveCookieConsent = ({ analytics = false, marketing = false } = {}) => {
  try {
    const now = Date.now();
    const consentData = {
      essential: true, // Essential cookies are always required
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      timestamp: now,
      expiresAt: now + SIX_MONTHS_MS,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));

    // Dispatch custom event to notify listeners (e.g. script loaders, UI components)
    window.dispatchEvent(
      new CustomEvent('gentora-cookie-consent-changed', { detail: consentData })
    );

    return consentData;
  } catch (e) {
    return null;
  }
};

export const hasAnalyticsConsent = () => {
  const consent = getCookieConsent();
  return Boolean(consent && consent.analytics);
};

export const hasMarketingConsent = () => {
  const consent = getCookieConsent();
  return Boolean(consent && consent.marketing);
};

export const resetCookieConsent = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent('gentora-cookie-consent-changed', { detail: null })
    );
  } catch (e) {}
};
