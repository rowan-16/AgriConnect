import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption } from '../services/translations';
import { authService } from '../services/authService';

interface LanguageContextType {
  language: SupportedLanguage;
  supportedLanguages: LanguageOption[];
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallbackOrOptions?: string | Record<string, any>, options?: Record<string, any>) => string;
}

const LANGUAGE_KEY = 'agriconnect_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    // 1. Try logged in user profile preference
    const currentUser = authService.getCurrentUser();
    if (currentUser?.preferredLanguage) {
      return currentUser.preferredLanguage;
    }
    // 2. Try localStorage
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved && ['en', 'ta', 'hi', 'te', 'ml', 'kn'].includes(saved)) {
      return saved as SupportedLanguage;
    }
    // 3. Fallback to English
    return 'en';
  });

  // Keep HTML document lang attribute synchronized
  useEffect(() => {
    document.documentElement.lang = language;
    if (i18n.language !== language) {
      i18n.changeLanguage(language).catch(() => {});
    }
  }, [language]);

  // Synchronize with logged in user if their preference was saved
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.preferredLanguage && currentUser.preferredLanguage !== language) {
      setLanguageState(currentUser.preferredLanguage);
      localStorage.setItem(LANGUAGE_KEY, currentUser.preferredLanguage);
      i18n.changeLanguage(currentUser.preferredLanguage).catch(() => {});
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang).catch(() => {});

    // For authenticated users, persist to MongoDB and local profile
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.id) {
        authService.updateProfile(currentUser.id, { preferredLanguage: lang });
      }
    } catch {
      // Non-blocking sync error
    }
  }, []);

  const t = useCallback((
    key: string,
    fallbackOrOptions?: string | Record<string, any>,
    options?: Record<string, any>
  ): string => {
    let fallback: string | undefined;
    let opts: Record<string, any> = {};

    if (typeof fallbackOrOptions === 'string') {
      fallback = fallbackOrOptions;
      if (options && typeof options === 'object') {
        opts = options;
      }
    } else if (typeof fallbackOrOptions === 'object' && fallbackOrOptions !== null) {
      opts = fallbackOrOptions;
    }

    // 1. Try i18next first (supporting namespaces, interpolation, pluralization)
    if (i18n.isInitialized) {
      const i18nVal = i18n.t(key, { ...opts, defaultValue: '__MISSING__' });
      if (i18nVal && i18nVal !== '__MISSING__' && i18nVal !== key) {
        return i18nVal;
      }
    }

    // 2. Try TRANSLATIONS dictionary
    const entry = TRANSLATIONS[key];
    if (entry) {
      const langText = entry[language];
      if (langText) {
        // Simple interpolation replacement if opts provided
        if (opts && Object.keys(opts).length > 0) {
          return Object.entries(opts).reduce(
            (acc, [k, v]) => acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v)),
            langText
          );
        }
        return langText;
      }
      if (entry.en) {
        if (opts && Object.keys(opts).length > 0) {
          return Object.entries(opts).reduce(
            (acc, [k, v]) => acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v)),
            entry.en
          );
        }
        return entry.en;
      }
    }

    // 3. Fallback string or key
    if (fallback) {
      if (opts && Object.keys(opts).length > 0) {
        return Object.entries(opts).reduce(
          (acc, [k, v]) => acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v)),
          fallback
        );
      }
      return fallback;
    }

    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, supportedLanguages: SUPPORTED_LANGUAGES, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
