import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/common.json'
import zh from './locales/zh/common.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'zh' as const, label: '中文' },
]

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    zh: { common: zh },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18n
