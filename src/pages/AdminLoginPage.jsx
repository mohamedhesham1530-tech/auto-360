import { useEffect, useState } from 'react'
import { Brand } from '../components/Brand'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useAuth } from '../auth/AuthProvider'
import { isFirebaseConfigured } from '../lib/firebase'
import { navigate } from '../lib/router'
import { useI18n } from '../i18n/I18nProvider'
import { SiteFooter } from '../components/SiteFooter'

export function AdminLoginPage() {
  const { t, language } = useI18n()
  const { status, user, isAdmin, signIn, resetPassword, getAuthErrorMessage } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const [diagnosticCode, setDiagnosticCode] = useState('')

  useEffect(() => {
    if (status === 'ready' && user && isAdmin) navigate('/admin')
  }, [status, user, isAdmin])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!isFirebaseConfigured) {
      setError(t.notConfigured)
      return
    }
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (authError) {
      console.error('[AUTO360] Firebase sign-in failed:', authError)
      setError(getAuthErrorMessage(authError, language))
      setDiagnosticCode(import.meta.env.DEV ? String(authError?.code || '') : '')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async () => {
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError(t.enterEmailFirst)
      return
    }
    setResetBusy(true)
    try {
      await resetPassword(email)
      setSuccess(t.resetSent)
    } catch (resetError) {
      console.error('[AUTO360] Firebase password reset failed:', resetError)
      setError(getAuthErrorMessage(resetError, language))
      setDiagnosticCode(import.meta.env.DEV ? String(resetError?.code || '') : '')
    } finally {
      setResetBusy(false)
    }
  }

  return <main className="admin-login page-shell">
    <div className="login-top"><Brand/><LanguageSwitcher/></div>
    <section className="login-card">
      <span className="eyebrow">{t.adminLoginKicker}</span>
      <h1>{t.adminLoginTitle}</h1>
      <p>{t.adminLoginText}</p>
      <form onSubmit={submit}>
        <label>{t.email}<input type="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); setSuccess(''); setDiagnosticCode('') }} /></label>
        <label>{t.password}<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(''); setDiagnosticCode('') }} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t.hidePassword : t.showPassword}>{showPassword ? t.hidePassword : t.showPassword}</button></div></label>
        <div className="login-tools"><button type="button" className="text-button password-reset-button" disabled={resetBusy || busy} onClick={handleReset}>{resetBusy ? t.sendingReset : t.forgotPassword}</button><span>{t.firebaseConfiguredLabel}</span></div>
        {error && <div className="error" role="alert">{error}{diagnosticCode && <span className="error-code">{diagnosticCode}</span>}</div>}
        {success && <div className="success" role="status">{success}</div>}
        <button className="primary-button" disabled={busy}>{busy ? t.signingIn : t.signIn}</button>
      </form>
      <button className="text-button" onClick={() => navigate('/')}>{t.backHome}</button>
    </section>
    <SiteFooter compact/>
  </main>
}
