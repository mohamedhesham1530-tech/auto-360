import { useI18n } from '../i18n/I18nProvider'
export function ProgressRing({ value }) {
  const { t } = useI18n()
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))
  const radius = 86
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - safeValue / 100)
  const completed = safeValue >= 100
  return <div className={`progress-ring ${completed ? 'progress-ring--complete' : ''}`}>
    <svg viewBox="0 0 220 220" role="img" aria-label={`${safeValue}% ${t.progressLabel}`}>
      <defs><linearGradient id="auto360Progress" x1="0" x2="1"><stop stopColor="#78e900"/><stop offset="1" stopColor="#d7ff35"/></linearGradient><filter id="auto360Glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <circle className="progress-ring__track" cx="110" cy="110" r={radius}/>
      <circle className="progress-ring__value" cx="110" cy="110" r={radius} strokeDasharray={circumference} strokeDashoffset={dashOffset} filter="url(#auto360Glow)"/>
    </svg>
    <div className="progress-ring__content"><strong>{safeValue}<small>%</small></strong><span>{completed ? t.progressComplete : t.progressLabel}</span></div>
  </div>
}
