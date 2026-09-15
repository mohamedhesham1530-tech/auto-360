import { useEffect, useMemo, useState } from 'react'
import { Brand } from '../components/Brand'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useAuth } from '../auth/AuthProvider'
import { buildNewVehicle, deleteVehicle, saveVehicle, subscribeVehicles, isCloudMode } from '../lib/vehicleStore'
import { SERVICE_WORKFLOWS, buildTimeline, getWorkflow } from '../data/workflows'
import { navigate } from '../lib/router'
import { useI18n } from '../i18n/I18nProvider'
import { localizeStage } from '../i18n/translations'
import { SiteFooter } from '../components/SiteFooter'

const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true }
  } catch {}
  const area = document.createElement('textarea')
  area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'
  document.body.appendChild(area); area.select()
  const ok = document.execCommand('copy'); area.remove(); return ok
}

function cloneVehicle(vehicle) {
  return JSON.parse(JSON.stringify(vehicle))
}

export function AdminPage() {
  const { t, language } = useI18n()
  const { user, signOut } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    return subscribeVehicles((items) => { setVehicles(items); setLoading(false) }, () => { setError(t.saveError); setLoading(false) })
  }, [t.saveError])

  const flash = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const startNew = () => {
    setError('')
    setForm(buildNewVehicle({ serviceId: 'ppf', existing: vehicles }))
    setEditing('new')
  }

  const startEdit = (vehicle) => {
    setError('')
    setForm(cloneVehicle(vehicle))
    setEditing(vehicle.trackingId)
  }

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const changeService = (serviceId) => {
    setForm((current) => {
      if (!current) return current
      const workflow = getWorkflow(serviceId)
      const timeline = buildTimeline(serviceId)
      return {
        ...current,
        serviceId,
        service: workflow.label,
        timeline,
        currentStageId: timeline[0]?.id || '',
      }
    })
  }

  const setCurrentStage = (stageId) => setForm((current) => ({
    ...current,
    currentStageId: stageId,
    timeline: current.timeline.map((stage) => stage.id === stageId
      ? { ...stage, status: 'in_progress' }
      : stage.status === 'in_progress' ? { ...stage, status: 'upcoming' } : stage),
  }))

  const updateStage = (index, key, value) => {
    setForm((current) => {
      const timeline = current.timeline.map((stage, i) => i === index ? { ...stage, [key]: value } : stage)
      if (key === 'status' && value === 'in_progress') {
        return { ...current, timeline: timeline.map((stage, i) => i === index ? stage : { ...stage, status: 'upcoming' }), currentStageId: timeline[index].id }
      }
      return { ...current, timeline }
    })
  }

  const addStage = () => setForm((current) => ({
    ...current,
    timeline: [...current.timeline, { id: `${current.serviceId}-custom-${Date.now()}`, title: '', subtitle: '', status: 'upcoming' }],
  }))

  const removeStage = (index) => setForm((current) => {
    if (current.timeline.length <= 2) return current
    const timeline = current.timeline.filter((_, i) => i !== index)
    const currentStillExists = timeline.some((stage) => stage.id === current.currentStageId)
    return { ...current, timeline, currentStageId: currentStillExists ? current.currentStageId : timeline[0].id }
  })

  const save = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.customerName.trim() || !form.vehicle.trim() || !form.service.trim() || !form.timeline.length) {
      setError(t.invalidData); return
    }
    const cleanedTimeline = form.timeline.map((stage, index) => ({
      ...stage,
      title: stage.title.trim() || `Stage ${index + 1}`,
      subtitle: stage.subtitle.trim(),
      titleAr: stage.titleAr?.trim() || '',
      subtitleAr: stage.subtitleAr?.trim() || '',
    }))
    const payload = { ...form, progress: Number(form.progress), timeline: cleanedTimeline }
    try {
      await saveVehicle(payload)
      setEditing(null); setForm(null); flash(t.saveSuccess)
    } catch (saveError) {
      setError(saveError?.code === 'permission-denied' ? t.accessDeniedText : t.saveError)
    }
  }

  const remove = async (trackingId) => {
    if (!window.confirm(t.deleteConfirm)) return
    try { await deleteVehicle(trackingId); flash(t.deleteSuccess) } catch { setError(t.saveError) }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vehicles
    return vehicles.filter((v) => [v.customerName, v.vehicle, v.plate, v.service, v.trackingId].join(' ').toLowerCase().includes(q))
  }, [vehicles, search])

  const stats = {
    total: vehicles.length,
    completed: vehicles.filter((v) => v.serviceStatus === 'completed' || v.progress >= 100).length,
    active: vehicles.filter((v) => v.serviceStatus !== 'completed' && v.progress < 100).length,
  }

  const trackingUrl = form ? `${window.location.origin}/track/${form.trackingId}` : ''
  const currentStageOptions = form?.timeline || []

  return <main className="admin-page">
    <nav className="admin-nav page-shell">
      <Brand compact/>
      <div className="nav-actions"><LanguageSwitcher compact/><button className="text-button" onClick={() => navigate('/')}>{t.viewSite}</button><button className="text-button" onClick={async () => { await signOut(); navigate('/admin/login') }}>{t.signOut}</button></div>
    </nav>

    <div className="admin-shell page-shell">
      <header className="admin-header">
        <div><span className="eyebrow">{t.adminKicker}</span><h1>{t.adminTitle}</h1><p>{t.adminText}</p><div className="admin-user">{t.signedInAs} <strong>{user?.email}</strong></div></div>
        <button className="primary-button" onClick={startNew}>{t.addVehicle}</button>
      </header>

      <div className={`connection-banner ${isCloudMode() ? 'is-cloud' : 'is-local'}`}>
        <span className="connection-dot"/><div><strong>{isCloudMode() ? t.cloudMode : t.localMode}</strong><p>{isCloudMode() ? t.cloudModeText : t.localModeText}</p></div>
      </div>

      <section className="admin-stats">
        <div><span>{t.totalVehicles}</span><strong>{stats.total}</strong></div>
        <div><span>{t.activeVehicles}</span><strong>{stats.active}</strong></div>
        <div><span>{t.completedVehicles}</span><strong>{stats.completed}</strong></div>
      </section>

      <div className="admin-toolbar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search}/><span>{filtered.length} / {vehicles.length}</span></div>
      {notice && <div className="toast" role="status">{notice}</div>}
      {error && <div className="admin-error" role="alert">{error}</div>}

      {loading ? <div className="empty-state"><div className="mini-loader"/><p>{t.loading}</p></div> :
        filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">⌁</div><h3>{t.noVehicles}</h3><p>{t.noVehiclesText}</p><button className="primary-button" onClick={startNew}>{t.createTracking}</button></div> :
        <div className="vehicle-list">{filtered.map((v) => {
          const current = v.timeline?.find((stage) => stage.id === v.currentStageId)
          return <article className="admin-vehicle" key={v.trackingId}>
            <div><span className="vehicle-id">{v.trackingId.toUpperCase()}</span><h3>{v.customerName}</h3><p>{v.vehicle} · {t.serviceOptions[v.serviceId] || v.service}</p></div>
            <div className="admin-progress"><strong>{v.progress}%</strong><span>{current?.title || v.service}</span></div>
            <div className="admin-actions">
              <button onClick={async () => { const ok = await copyText(`${window.location.origin}/track/${v.trackingId}`); flash(ok ? t.copied : t.copyError) }}>{t.copyLink}</button>
              <button onClick={() => navigate(`/track/${v.trackingId}`)}>{t.view}</button>
              <button onClick={() => startEdit(v)}>{t.edit}</button>
              <button className="danger" onClick={() => remove(v.trackingId)}>{t.delete}</button>
            </div>
          </article>
        })}</div>
      }
    </div>

    <SiteFooter compact/>

    {editing && form && <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal wide-modal">
        <div className="modal-head"><div><span className="eyebrow">{t.vehicleRecord}</span><h2>{editing === 'new' ? t.createTrackingTitle : t.updateVehicle}</h2></div><div className="modal-head-actions"><LanguageSwitcher compact/><button className="modal-close" type="button" onClick={() => { setEditing(null); setForm(null) }} aria-label={t.close}>×</button></div></div>
        <form onSubmit={save} className="vehicle-form">
          <label>{t.customerName}<input required maxLength="80" value={form.customerName} onChange={(e) => updateForm('customerName', e.target.value)}/></label>
          <label>{t.vehicleBrandModel}<input required maxLength="100" value={form.vehicle} onChange={(e) => updateForm('vehicle', e.target.value)}/></label>
          <label>{t.plate}<input maxLength="60" value={form.plate} onChange={(e) => updateForm('plate', e.target.value)}/></label>
          <label>{t.servicePackage}<select value={form.serviceId} onChange={(e) => changeService(e.target.value)}>{Object.entries(SERVICE_WORKFLOWS).map(([id]) => <option key={id} value={id}>{t.serviceOptions[id]}</option>)}</select></label>

          <section className="progress-editor full">
            <div className="editor-heading"><div><span className="small-label">{t.progressPercentage}</span><h3>{form.progress}%</h3></div><div className="quick-values">{[0,25,50,75,100].map((v) => <button type="button" key={v} className={Number(form.progress) === v ? 'selected' : ''} onClick={() => updateForm('progress', v)}>{v}%</button>)}</div></div>
            <input className="big-range" type="range" min="0" max="100" value={form.progress} onChange={(e) => updateForm('progress', Number(e.target.value))}/>
            <div className="exact-row"><label>{t.exactProgress}<input type="number" min="0" max="100" value={form.progress} onChange={(e) => updateForm('progress', Math.min(100, Math.max(0, Number(e.target.value))))}/></label><label>{t.serviceStatusLabel}<select value={form.serviceStatus} onChange={(e) => updateForm('serviceStatus', e.target.value)}><option value="in_progress">{t.statusInProgress}</option><option value="on_hold">{t.statusOnHold}</option><option value="ready">{t.statusReady}</option><option value="completed">{t.statusCompleted}</option></select></label></div>
          </section>

          <label className="full">{t.currentStage}<select value={form.currentStageId} onChange={(e) => setCurrentStage(e.target.value)}>{currentStageOptions.map((stage) => <option key={stage.id} value={stage.id}>{language === 'ar' ? localizeStage(stage, 'ar')[0] : stage.title}</option>)}</select></label>

          <section className="timeline-editor full">
            <div className="editor-heading"><div><span className="small-label">{t.serviceWorkflow}</span><h3>{t.currentStage}</h3><p>{t.workflowHint}</p><span className="editor-language-note">{language === 'ar' ? 'تحرير النص العربي' : 'Editing English text'}</span></div><button type="button" className="secondary-button" onClick={addStage}>{t.addStage}</button></div>
            <div className="stage-editor-list">{form.timeline.map((stage, index) => <div className="stage-editor" key={stage.id}>
              <div className="stage-number">{String(index + 1).padStart(2,'0')}</div>
              <div className="stage-fields">
                <input value={language === 'ar' ? (stage.titleAr || localizeStage(stage, 'ar')[0]) : stage.title} aria-label={t.stageName} placeholder={t.stageName} onChange={(e) => updateStage(index, language === 'ar' ? 'titleAr' : 'title', e.target.value)}/>
                <input value={language === 'ar' ? (stage.subtitleAr || localizeStage(stage, 'ar')[1]) : stage.subtitle} aria-label={t.stageDescription} placeholder={t.stageDescription} onChange={(e) => updateStage(index, language === 'ar' ? 'subtitleAr' : 'subtitle', e.target.value)}/>
              </div>
              <select value={stage.status} aria-label={t.stageStatus} onChange={(e) => updateStage(index, 'status', e.target.value)}>
                <option value="completed">{t.completed}</option><option value="in_progress">{t.inProgress}</option><option value="upcoming">{t.upcoming}</option>
              </select>
              <button type="button" className="icon-danger" onClick={() => removeStage(index)} aria-label={t.removeStage}>×</button>
            </div>)}</div>
          </section>

          <label className="full">{t.trackingUrl}<div className="tracking-url"><code>{trackingUrl}</code><button type="button" onClick={async () => flash((await copyText(trackingUrl)) ? t.copied : t.copyError)}>{t.copyLink}</button></div></label>
          <div className="form-actions"><button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm(null) }}>{t.cancel}</button><button className="primary-button">{t.saveChanges}</button></div>
        </form>
      </div>
    </div>}
  </main>
}
