import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import { buildTimeline, getWorkflow } from '../data/workflows'
import { seedVehicles } from '../data/seedVehicles'

const STORAGE_KEY = 'auto360-vehicles-v4'

const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage
const cleanText = (value, max = 120) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max)
const safeProgress = (value) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)))

function normalizeTimeline(timeline, serviceId) {
  const fallback = buildTimeline(serviceId)
  const incoming = Array.isArray(timeline) && timeline.length ? timeline : fallback
  let activeFound = false
  return incoming.map((stage, index) => {
    const status = ['completed', 'in_progress', 'upcoming'].includes(stage?.status) ? stage.status : 'upcoming'
    let safeStatus = status
    if (status === 'in_progress') {
      if (activeFound) safeStatus = 'upcoming'
      else activeFound = true
    }
    return {
      id: cleanText(stage?.id || `${serviceId}-${index + 1}`, 50),
      title: cleanText(stage?.title || `Stage ${index + 1}`, 100),
      subtitle: cleanText(stage?.subtitle || '', 180),
      titleAr: cleanText(stage?.titleAr || '', 100),
      subtitleAr: cleanText(stage?.subtitleAr || '', 180),
      status: safeStatus,
    }
  })
}

export function normalizeVehicle(vehicle = {}) {
  const serviceId = cleanText(vehicle.serviceId || 'custom', 30) || 'custom'
  return {
    id: cleanText(vehicle.id || vehicle.trackingId, 32).toLowerCase(),
    trackingId: cleanText(vehicle.trackingId || vehicle.id, 32).toLowerCase(),
    customerName: cleanText(vehicle.customerName, 80),
    vehicle: cleanText(vehicle.vehicle, 100),
    plate: cleanText(vehicle.plate, 60),
    service: cleanText(vehicle.service || getWorkflow(serviceId).label, 120),
    serviceId,
    progress: safeProgress(vehicle.progress),
    currentStageId: cleanText(vehicle.currentStageId || '', 60),
    serviceStatus: ['in_progress', 'on_hold', 'ready', 'completed'].includes(vehicle.serviceStatus)
      ? vehicle.serviceStatus
      : 'in_progress',
    timeline: normalizeTimeline(vehicle.timeline, serviceId),
    lastUpdated: vehicle.lastUpdated || new Date().toISOString(),
    createdAt: vehicle.createdAt || new Date().toISOString(),
  }
}

function isValid(vehicle) {
  return /^a360-[a-z0-9]{6,20}$/.test(vehicle.trackingId)
    && vehicle.customerName
    && vehicle.vehicle
    && vehicle.service
    && vehicle.timeline.length > 0
}

function localList() {
  if (!hasStorage()) return seedVehicles.map(normalizeVehicle)
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const initial = seedVehicles.map(normalizeVehicle)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
  try {
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed.map(normalizeVehicle).filter(isValid) : []
    if (!Array.isArray(parsed)) throw new Error('invalid-local-data')
    return list
  } catch {
    const initial = seedVehicles.map(normalizeVehicle)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
}

function saveLocal(vehicles) {
  if (!hasStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles.map(normalizeVehicle)))
  window.dispatchEvent(new CustomEvent('auto360:vehicles-updated'))
}

function publicProjection(vehicle) {
  return {
    trackingId: vehicle.trackingId,
    customerName: vehicle.customerName,
    vehicle: vehicle.vehicle,
    plate: vehicle.plate,
    service: vehicle.service,
    serviceId: vehicle.serviceId,
    progress: vehicle.progress,
    currentStageId: vehicle.currentStageId,
    serviceStatus: vehicle.serviceStatus,
    timeline: vehicle.timeline,
    lastUpdated: vehicle.lastUpdated,
  }
}

export function isCloudMode() {
  return isFirebaseConfigured && !!db
}

export function getVehicles() {
  return localList()
}

export function getVehicle(id) {
  const clean = cleanText(id, 32).toLowerCase()
  return localList().find((v) => v.trackingId === clean) || null
}

export function createTrackingId(existing = []) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  const exists = new Set(existing.map((v) => v.trackingId))
  let id = ''
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(10))
    id = `a360-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`
  } while (exists.has(id))
  return id
}

export async function fetchVehicles() {
  if (!isCloudMode()) return localList()
  const snap = await getDocs(query(collection(db, 'vehicles'), orderBy('createdAt', 'desc')))
  return snap.docs.map((item) => normalizeVehicle(item.data()))
}

export function subscribeVehicles(callback, onError) {
  if (!isCloudMode()) {
    callback(localList())
    const handler = () => callback(localList())
    window.addEventListener('auto360:vehicles-updated', handler)
    return () => window.removeEventListener('auto360:vehicles-updated', handler)
  }
  return onSnapshot(
    query(collection(db, 'vehicles'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((item) => normalizeVehicle(item.data()))),
    onError,
  )
}

export async function fetchPublicVehicle(trackingId) {
  const clean = cleanText(trackingId, 32).toLowerCase()
  if (!isCloudMode()) return getVehicle(clean)
  const snap = await getDoc(doc(db, 'publicTrackings', clean))
  return snap.exists() ? normalizeVehicle(snap.data()) : null
}

export function subscribePublicVehicle(trackingId, callback, onError) {
  const clean = cleanText(trackingId, 32).toLowerCase()
  if (!isCloudMode()) {
    callback(getVehicle(clean))
    const handler = () => callback(getVehicle(clean))
    window.addEventListener('auto360:vehicles-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('auto360:vehicles-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }
  return onSnapshot(
    doc(db, 'publicTrackings', clean),
    (snap) => callback(snap.exists() ? normalizeVehicle(snap.data()) : null),
    onError,
  )
}

export async function saveVehicle(vehicle) {
  const safe = normalizeVehicle({ ...vehicle, lastUpdated: new Date().toISOString() })
  if (!isValid(safe)) throw new Error('invalid-vehicle')
  if (!isCloudMode()) {
    const vehicles = localList()
    const index = vehicles.findIndex((v) => v.trackingId === safe.trackingId)
    saveLocal(index >= 0 ? vehicles.map((v, i) => i === index ? safe : v) : [safe, ...vehicles])
    return safe
  }

  const batch = writeBatch(db)
  batch.set(doc(db, 'vehicles', safe.trackingId), safe)
  batch.set(doc(db, 'publicTrackings', safe.trackingId), publicProjection(safe))
  await batch.commit()
  return safe
}

export async function deleteVehicle(trackingId) {
  const clean = cleanText(trackingId, 32).toLowerCase()
  if (!isCloudMode()) {
    saveLocal(localList().filter((v) => v.trackingId !== clean))
    return
  }
  const batch = writeBatch(db)
  batch.delete(doc(db, 'vehicles', clean))
  batch.delete(doc(db, 'publicTrackings', clean))
  await batch.commit()
}

export function buildNewVehicle({ serviceId = 'ppf', existing = [] } = {}) {
  const now = new Date().toISOString()
  return normalizeVehicle({
    trackingId: createTrackingId(existing),
    serviceId,
    service: getWorkflow(serviceId).label,
    progress: 0,
    currentStageId: buildTimeline(serviceId)[0]?.id || '',
    serviceStatus: 'in_progress',
    timeline: buildTimeline(serviceId),
    createdAt: now,
    lastUpdated: now,
  })
}
