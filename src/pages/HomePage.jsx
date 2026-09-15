import { useState } from 'react'
import { Brand } from '../components/Brand'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { navigate } from '../lib/router'
import { useI18n } from '../i18n/I18nProvider'
import { SiteFooter } from '../components/SiteFooter'

export function HomePage() {
  const { t } = useI18n()
  const [trackingId, setTrackingId] = useState('')
  const [error, setError] = useState('')
  const openTracking = (event) => {
    event.preventDefault()

    const raw = trackingId.trim()
    let id = raw

    // Accept both the short tracking ID and a full AUTO 360 tracking URL.
    // Customers/admins often paste the complete link copied from the dashboard.
    try {
      if (/^https?:\/\//i.test(raw)) {
        const url = new URL(raw)
        const parts = url.pathname.split('/').filter(Boolean)
        if (parts[0]?.toLowerCase() === 'track' && parts[1]) id = decodeURIComponent(parts[1])
      }
    } catch {
      // Fall back to validating the raw value below.
    }

    id = id.trim().toLowerCase()
    if (!/^a360-[a-z0-9]{6,20}$/.test(id)) { setError(t.invalidTracking); return }
    navigate(`/track/${encodeURIComponent(id)}`)
  }
  return <main className="home-page page-shell">
    <nav className="home-nav"><Brand compact/><div className="nav-actions"><LanguageSwitcher compact/><button className="text-button" onClick={() => navigate('/admin/login')}>{t.staffAccess}</button></div></nav>
    <section className="home-hero">
      <div>
        <span className="eyebrow">{t.homeEyebrow}</span>
        <h1>{t.homeTitle1}<br/><span>{t.homeTitle2}</span></h1>
        <p>{t.homeText}</p>
        <form className="tracking-lookup" onSubmit={openTracking}>
          <label>{t.trackingCode}<input value={trackingId} onChange={(e) => { setTrackingId(e.target.value); setError('') }} placeholder={t.trackingCodePlaceholder} inputMode="text" autoCapitalize="none"/></label>
          <button className="primary-button">{t.openTracking}</button>
          {error && <span className="error">{error}</span>}
        </form>
      </div>
      <div className="home-visual" aria-label="AUTO 360"><div className="visual-ring" aria-hidden="true"/><div className="visual-car"><img src="/logo.png" alt="AUTO 360"/><small>{t.homeVisual}</small></div></div>
    </section>
    <SiteFooter compact/>
  </main>
}
