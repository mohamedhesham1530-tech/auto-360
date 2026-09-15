import { useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { isFirebaseConfigured } from '../lib/firebase'
import { navigate } from '../lib/router'
import { useI18n } from '../i18n/I18nProvider'

export function ProtectedAdmin({ children }) {
  const { status, user, isAdmin, adminError } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    if (status === 'ready' && !user && isFirebaseConfigured) navigate('/admin/login')
  }, [status, user])

  if (status === 'loading') return <div className="route-loading"><div className="mini-loader"/><span>{t.loading}</span></div>
  if (!isFirebaseConfigured) return <main className="setup-page page-shell"><div className="setup-card"><span className="eyebrow">{t.firebaseSetupKicker}</span><h1>{t.firebaseSetupTitle}</h1><p>{t.firebaseSetupText}</p><code>.env.local</code><button className="secondary-button" onClick={() => navigate('/')}>{t.backHome}</button></div></main>
  if (!user) return null
  if (!isAdmin) return <main className="setup-page page-shell"><div className="setup-card"><span className="eyebrow">{adminError ? t.firebaseRulesKicker : t.accessDeniedKicker}</span><h1>{adminError ? t.firebaseRulesTitle : t.accessDeniedTitle}</h1><p>{adminError ? t.firebaseRulesText : t.accessDeniedText}</p>{adminError && <code>{adminError?.code || 'permission-check-failed'}</code>}<button className="secondary-button" onClick={() => navigate('/admin/login')}>{t.backToLogin}</button></div></main>
  return children
}
