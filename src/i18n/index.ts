import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English locales
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enFarmer from './locales/en/farmer.json';
import enCustomer from './locales/en/customer.json';
import enAdmin from './locales/en/admin.json';
import enAgriculture from './locales/en/agriculture.json';
import enWeather from './locales/en/weather.json';
import enMarket from './locales/en/market.json';
import enChatbot from './locales/en/chatbot.json';
import enNotifications from './locales/en/notifications.json';
import enInvoice from './locales/en/invoice.json';

// Import Tamil locales
import taCommon from './locales/ta/common.json';
import taAuth from './locales/ta/auth.json';
import taFarmer from './locales/ta/farmer.json';
import taCustomer from './locales/ta/customer.json';
import taAdmin from './locales/ta/admin.json';
import taAgriculture from './locales/ta/agriculture.json';
import taWeather from './locales/ta/weather.json';
import taMarket from './locales/ta/market.json';
import taChatbot from './locales/ta/chatbot.json';
import taNotifications from './locales/ta/notifications.json';
import taInvoice from './locales/ta/invoice.json';

// Import Hindi locales
import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiFarmer from './locales/hi/farmer.json';
import hiCustomer from './locales/hi/customer.json';
import hiAdmin from './locales/hi/admin.json';
import hiAgriculture from './locales/hi/agriculture.json';
import hiWeather from './locales/hi/weather.json';
import hiMarket from './locales/hi/market.json';
import hiChatbot from './locales/hi/chatbot.json';
import hiNotifications from './locales/hi/notifications.json';
import hiInvoice from './locales/hi/invoice.json';

// Import Telugu locales
import teCommon from './locales/te/common.json';
import teAuth from './locales/te/auth.json';
import teFarmer from './locales/te/farmer.json';
import teCustomer from './locales/te/customer.json';
import teAdmin from './locales/te/admin.json';
import teAgriculture from './locales/te/agriculture.json';
import teWeather from './locales/te/weather.json';
import teMarket from './locales/te/market.json';
import teChatbot from './locales/te/chatbot.json';
import teNotifications from './locales/te/notifications.json';
import teInvoice from './locales/te/invoice.json';

// Import Malayalam locales
import mlCommon from './locales/ml/common.json';
import mlAuth from './locales/ml/auth.json';
import mlFarmer from './locales/ml/farmer.json';
import mlCustomer from './locales/ml/customer.json';
import mlAdmin from './locales/ml/admin.json';
import mlAgriculture from './locales/ml/agriculture.json';
import mlWeather from './locales/ml/weather.json';
import mlMarket from './locales/ml/market.json';
import mlChatbot from './locales/ml/chatbot.json';
import mlNotifications from './locales/ml/notifications.json';
import mlInvoice from './locales/ml/invoice.json';

// Import Kannada locales
import knCommon from './locales/kn/common.json';
import knAuth from './locales/kn/auth.json';
import knFarmer from './locales/kn/farmer.json';
import knCustomer from './locales/kn/customer.json';
import knAdmin from './locales/kn/admin.json';
import knAgriculture from './locales/kn/agriculture.json';
import knWeather from './locales/kn/weather.json';
import knMarket from './locales/kn/market.json';
import knChatbot from './locales/kn/chatbot.json';
import knNotifications from './locales/kn/notifications.json';
import knInvoice from './locales/kn/invoice.json';

export const defaultNamespaces = [
  'common',
  'auth',
  'farmer',
  'customer',
  'admin',
  'agriculture',
  'weather',
  'market',
  'chatbot',
  'notifications',
  'invoice'
] as const;

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    farmer: enFarmer,
    customer: enCustomer,
    admin: enAdmin,
    agriculture: enAgriculture,
    weather: enWeather,
    market: enMarket,
    chatbot: enChatbot,
    notifications: enNotifications,
    invoice: enInvoice,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
    farmer: taFarmer,
    customer: taCustomer,
    admin: taAdmin,
    agriculture: taAgriculture,
    weather: taWeather,
    market: taMarket,
    chatbot: taChatbot,
    notifications: taNotifications,
    invoice: taInvoice,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    farmer: hiFarmer,
    customer: hiCustomer,
    admin: hiAdmin,
    agriculture: hiAgriculture,
    weather: hiWeather,
    market: hiMarket,
    chatbot: hiChatbot,
    notifications: hiNotifications,
    invoice: hiInvoice,
  },
  te: {
    common: teCommon,
    auth: teAuth,
    farmer: teFarmer,
    customer: teCustomer,
    admin: teAdmin,
    agriculture: teAgriculture,
    weather: teWeather,
    market: teMarket,
    chatbot: teChatbot,
    notifications: teNotifications,
    invoice: teInvoice,
  },
  ml: {
    common: mlCommon,
    auth: mlAuth,
    farmer: mlFarmer,
    customer: mlCustomer,
    admin: mlAdmin,
    agriculture: mlAgriculture,
    weather: mlWeather,
    market: mlMarket,
    chatbot: mlChatbot,
    notifications: mlNotifications,
    invoice: mlInvoice,
  },
  kn: {
    common: knCommon,
    auth: knAuth,
    farmer: knFarmer,
    customer: knCustomer,
    admin: knAdmin,
    agriculture: knAgriculture,
    weather: knWeather,
    market: knMarket,
    chatbot: knChatbot,
    notifications: knNotifications,
    invoice: knInvoice,
  },
};

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('agriconnect_language') : 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ta', 'hi', 'te', 'ml', 'kn'],
    defaultNS: 'common',
    ns: defaultNamespaces,
    fallbackNS: defaultNamespaces,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'agriconnect_language',
      caches: ['localStorage'],
    },
  });

export default i18n;
