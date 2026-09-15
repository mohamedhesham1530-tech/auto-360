import { useI18n } from '../i18n/I18nProvider'
export function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useI18n()
  return <button className={`language-switcher ${compact ? 'language-switcher--compact' : ''}`} onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} aria-label={`Switch language to ${t.language}`}>
    <span>{t.languageCode}</span><i>{t.language}</i>
  </button>
}
