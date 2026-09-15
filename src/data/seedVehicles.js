import { buildTimeline } from './workflows'

const now = new Date().toISOString()

export const seedVehicles = [
  {
    id: 'a360-x7k92p',
    trackingId: 'a360-x7k92p',
    customerName: 'Mohamed Hesham',
    vehicle: 'BMW X5',
    plate: 'A 360 · 2026',
    service: 'Paint Protection Film',
    serviceId: 'ppf',
    progress: 65,
    currentStageId: 'ppf-4',
    serviceStatus: 'in_progress',
    timeline: buildTimeline('ppf').map((stage, i) => ({ ...stage, status: i < 3 ? 'completed' : i === 3 ? 'in_progress' : 'upcoming' })),
    lastUpdated: now,
    createdAt: now,
  },
]
