import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

const I18nContext = createContext(null)
const KEY = 'auto360-language'

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(KEY) === 'ar' ? 'ar' : 'en')
  const value = useMemo(() => ({ language, setLanguage, t: translations[language] }), [language])
  useEffect(() => {
    localStorage.setItem(KEY, language)
    document.documentElement.lang = language
    document.documentElement.dir = translations[language].dir
    document.title = language === 'ar' ? 'AUTO 360 | متابعة السيارة' : 'AUTO 360 | Vehicle Tracking'
  }, [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
