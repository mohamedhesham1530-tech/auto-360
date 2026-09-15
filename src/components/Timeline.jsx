import { useI18n } from '../i18n/I18nProvider'
import { localizeStage } from '../i18n/translations'

export function Timeline({ timeline = [] }) {
  const { t, language } = useI18n()
  return <div className="timeline">
    {timeline.map((stage, index) => {
      const [title, subtitle] = localizeStage(stage, language)
      const status = stage.status || 'upcoming'
      return (
        <div className={`timeline-item is-${status}`} key={stage.id || index}>
          <div className="timeline-marker">
            <span>{status === 'completed' ? '✓' : status === 'in_progress' ? '●' : '○'}</span>
            {index < timeline.length - 1 && <i />}
          </div>
          <div className="timeline-copy">
            <div className="timeline-title">
              <h3>{title}</h3>
              <b className={status === 'in_progress' ? 'now' : ''}>{t.timelineStatus[status]}</b>
            </div>
            <p>{subtitle}</p>
          </div>
        </div>
      )
    })}
  </div>
}
