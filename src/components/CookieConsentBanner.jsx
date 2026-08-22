import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Settings2, Check, Lock, BarChart3, Megaphone } from 'lucide-react';
import { getCookieConsent, saveCookieConsent } from '../utils/cookieConsent';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference Toggles State
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // Check initial consent on mount
    const currentConsent = getCookieConsent();
    if (!currentConsent) {
      // Delay presentation slightly for smooth entrance animation
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    } else {
      setPreferences({
        analytics: Boolean(currentConsent.analytics),
        marketing: Boolean(currentConsent.marketing),
      });
    }

    // Listen for custom event triggered from Footer or external triggers
    const handleConsentChanged = (e) => {
      if (e.detail === null) {
        // Reset triggered -> show banner again
        setVisible(true);
        setShowPreferences(false);
      }
    };

    window.addEventListener('gentora-cookie-consent-changed', handleConsentChanged);
    return () => window.removeEventListener('gentora-cookie-consent-changed', handleConsentChanged);
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent({ analytics: true, marketing: true });
    setVisible(false);
    setShowPreferences(false);
  };

  const handleRejectOptional = () => {
    saveCookieConsent({ analytics: false, marketing: false });
    setVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent({
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* FIXED BOTTOM CONSENT BANNER */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left Block: Icon & Copy */}
          <div className="flex items-start gap-3.5 max-w-3xl">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-gentora-gold shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
                  We Value Your Privacy & Experience
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  GDPR Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gentora Fabrics uses essential cookies to ensure shopping cart and checkout security. With your consent, we also use non-essential cookies to analyze site traffic and personalize recommendations. Your preference is remembered for 6 months.
              </p>
            </div>
          </div>

          {/* Right Block: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>

            <button
              type="button"
              onClick={handleRejectOptional}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold transition"
            >
              Reject Optional
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-5 py-2 rounded-xl bg-gentora-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-md shadow-emerald-950/50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMIZE PREFERENCES MODAL */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-gentora-gold" />
                <h3 className="font-serif text-lg font-bold text-white">Cookie Consent Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Categories List */}
            <div className="space-y-4 text-xs">
              
              {/* Essential Cookies (Always Active) */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-100">Strictly Necessary Cookies</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full uppercase">
                    Always Active
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Required for site navigation, user login sessions, shopping cart persistence, and secure checkout processing. These cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gentora-gold" />
                    <span className="font-bold text-slate-100">Performance & Analytics</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gentora-emerald"></div>
                  </label>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Allows us to measure website traffic, analyze popular unstitched fabric categories, and optimize page load speeds.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-slate-100">Marketing & Personalization</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gentora-emerald"></div>
                  </label>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Used to deliver relevant promotional offers, discount alerts, and personalized product recommendations.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2 rounded-xl bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs transition shadow-md"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentBanner;
