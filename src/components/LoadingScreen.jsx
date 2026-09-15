import { Brand } from './Brand'
import { useI18n } from '../i18n/I18nProvider'
export function LoadingScreen({ visible }) {
  const { t } = useI18n()
  if (!visible) return null
  return <div className="loading-screen" aria-live="polite" aria-label={t.loadingTitle}>
    <div className="loading-orb" />
    <div className="loading-content"><div className="loading-brand"><Brand /></div><div className="loading-copy"><span>{t.brandTagline}</span><h2>{t.loadingTitle}</h2></div><div className="loader-line"><i /></div><p>{t.loadingBottom}</p></div>
  </div>
}
