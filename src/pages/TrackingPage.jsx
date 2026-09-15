import { useEffect, useState } from 'react'
import { Brand } from '../components/Brand'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { LoadingScreen } from '../components/LoadingScreen'
import { ProgressRing } from '../components/ProgressRing'
import { Timeline } from '../components/Timeline'
import { subscribePublicVehicle } from '../lib/vehicleStore'
import { navigate } from '../lib/router'
import { useI18n } from '../i18n/I18nProvider'
import { localizeStage } from '../i18n/translations'
import { SiteFooter } from '../components/SiteFooter'

function useIntro(id) {
  const key = `auto360-intro:${id}`
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(key))
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      sessionStorage.setItem(key, '1')
      setVisible(false)
    }, 850)
    return () => clearTimeout(timer)
  }, [id, visible])
  return visible
}

function formatUpdated(value, locale) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle:'medium', timeStyle:'short' }).format(date)
}

export function TrackingPage({ id }) {
  const { t, language } = useI18n()
  const [vehicle, setVehicle] = useState(undefined)
  const [loadError, setLoadError] = useState(false)
  const introVisible = useIntro(id)
  const trackingId = String(id || '').trim().toLowerCase()

  useEffect(() => {
    setVehicle(undefined)
    setLoadError(false)
    if (!/^a360-[a-z0-9]{6,20}$/.test(trackingId)) {
      setVehicle(null)
      return undefined
    }
    const unsubscribe = subscribePublicVehicle(trackingId, setVehicle, () => setLoadError(true))
    return unsubscribe
  }, [trackingId])

  if (loadError) {
    return <><main className="not-found page-shell"><Brand/><span className="eyebrow">{t.notFoundKicker}</span><h1>{t.notFoundTitle}</h1><p>{t.notFoundText}</p><button className="secondary-button" onClick={() => navigate('/')}>{t.backHome}</button></main><SiteFooter compact/></>
  }
  if (vehicle === undefined) return <><LoadingScreen visible/><main className="tracking-page loading-placeholder" /></>
  if (!vehicle) return <><main className="not-found page-shell"><Brand/><span className="eyebrow">{t.notFoundKicker}</span><h1>{t.notFoundTitle}</h1><p>{t.notFoundText}</p><button className="secondary-button" onClick={() => navigate('/')}>{t.backHome}</button></main><SiteFooter compact/></>

  const progress = Math.min(100, Math.max(0, Number(vehicle.progress) || 0))
  const completed = vehicle.serviceStatus === 'completed' || progress >= 100
  const currentStage = vehicle.timeline?.find((stage) => stage.id === vehicle.currentStageId) || vehicle.timeline?.find((stage) => stage.status === 'in_progress') || vehicle.timeline?.[0]
  const [stageTitle, stageSubtitle] = localizeStage(currentStage || {}, language)
  const serviceLabel = t.serviceOptions[vehicle.serviceId] || vehicle.service
  const statusLabel = ({
    in_progress: t.statusInProgress,
    on_hold: t.statusOnHold,
    ready: t.statusReady,
    completed: t.statusCompleted,
  }[vehicle.serviceStatus] || t.statusInProgress)

  return <><LoadingScreen visible={introVisible}/><main className="tracking-page"><div className="ambient ambient-one"/><div className="ambient ambient-two"/><div className="grain"/>
    <nav className="topbar page-shell"><Brand compact/><div className="nav-actions"><LanguageSwitcher compact/><div className="live-badge"><i/> {t.liveStatus}</div></div></nav>
    <section className="tracking-hero page-shell">
      <div className="hero-copy">
        <span className="eyebrow"><i/> {completed ? t.ready : t.inProgress}</span>
        <p className="welcome">{t.welcome}، <strong>{vehicle.customerName}</strong></p>
        <h1>{completed ? <>{t.ready1} <span>{t.ready2}</span></> : <>{t.expertHands1} <span>{t.expertHands2}</span></>}</h1>
        <p className="hero-description">{completed ? t.readyText : t.heroText}</p>
        <div className="vehicle-grid">
          <div><span>{t.customer}</span><strong>{vehicle.customerName}</strong></div>
          <div><span>{t.vehicle}</span><strong>{vehicle.vehicle}</strong></div>
          <div><span>{t.service}</span><strong>{serviceLabel}</strong></div>
          <div><span>{t.reference}</span><strong>{vehicle.plate || vehicle.trackingId.toUpperCase()}</strong></div>
        </div>
      </div>
      <div className="hero-progress"><ProgressRing value={progress}/><div className="progress-caption"><span>{t.overallProgress}</span><strong>{statusLabel}</strong></div></div>
    </section>

    <section className="section page-shell"><span className="section-kicker">{t.currentWorkflow}</span>
      <div className={`stage-card ${completed ? 'stage-card--complete' : ''}`}>
        <div className="stage-icon">{completed ? '✓' : '◈'}</div>
        <div><span className="small-label">{completed ? t.serviceStatus : t.currentStage}</span><h2>{completed ? t.serviceCompleted : stageTitle}</h2><p>{completed ? t.completedText : stageSubtitle}</p></div>
        <div className="stage-state"><i/> {statusLabel}</div>
      </div>
    </section>

    <section className="section page-shell"><div className="section-heading"><div><span className="section-kicker">{t.serviceJourney}</span><h2>{t.journeyTitle}</h2></div><div className="updated"><span>{t.lastUpdated}</span><strong>{formatUpdated(vehicle.lastUpdated, t.locale)}</strong></div></div><Timeline timeline={vehicle.timeline}/></section>
    <section className="section page-shell reassurance"><div className="reassurance-card"><div className="shield">✦</div><div><span className="small-label">{t.promise}</span><h2>{t.promiseTitle}</h2></div><p>{t.promiseText}</p></div></section>
    <SiteFooter/>
  </main></>
}
