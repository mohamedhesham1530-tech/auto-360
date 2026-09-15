export const SERVICE_WORKFLOWS = {
  ppf: {
    id: 'ppf',
    label: 'Paint Protection Film',
    stages: [
      ['Vehicle Received', 'Your vehicle has been checked in safely.'],
      ['Initial Inspection', 'Condition and service requirements are being reviewed.'],
      ['Wash & Surface Preparation', 'Every surface is being prepared with precision.'],
      ['PPF Installation', 'Expert protection film installation is in progress.'],
      ['Final Quality Check', 'Final detailing and quality assurance are underway.'],
      ['Ready for Delivery', 'Your vehicle is ready for collection.'],
    ],
  },
  tint: {
    id: 'tint',
    label: 'Window Tint',
    stages: [
      ['Vehicle Received', 'Your vehicle has been checked in safely.'],
      ['Initial Inspection', 'Glass condition and installation requirements are reviewed.'],
      ['Preparation', 'Windows and surrounding surfaces are carefully prepared.'],
      ['Window Tint Installation', 'Professional film installation is in progress.'],
      ['Quality Check', 'Edges, finish and clarity are being inspected.'],
      ['Ready for Delivery', 'Your vehicle is ready for collection.'],
    ],
  },
  wash: {
    id: 'wash',
    label: 'Premium Car Wash',
    stages: [
      ['Vehicle Received', 'Your vehicle has been checked in safely.'],
      ['Exterior Wash', 'The exterior is being cleaned with care.'],
      ['Interior Cleaning', 'The interior is being detailed and refreshed.'],
      ['Final Inspection', 'The finished vehicle is receiving a final check.'],
      ['Ready for Delivery', 'Your vehicle is ready for collection.'],
    ],
  },
  ceramic: {
    id: 'ceramic',
    label: 'Ceramic Coating',
    stages: [
      ['Vehicle Received', 'Your vehicle has been checked in safely.'],
      ['Inspection & Decontamination', 'The paint surface is being assessed and decontaminated.'],
      ['Paint Preparation', 'The surface is being refined and prepared for coating.'],
      ['Ceramic Coating', 'The protective coating is being professionally applied.'],
      ['Curing & Quality Check', 'The coating is curing while the finish is inspected.'],
      ['Ready for Delivery', 'Your vehicle is ready for collection.'],
    ],
  },
  maintenance: {
    id: 'maintenance',
    label: 'Maintenance & Service',
    stages: [
      ['Vehicle Received', 'Your vehicle has been checked in safely.'],
      ['Diagnostic Inspection', 'The vehicle is being inspected and diagnosed.'],
      ['Service in Progress', 'The required maintenance work is underway.'],
      ['Testing & Verification', 'Repairs and service results are being checked.'],
      ['Final Quality Check', 'The vehicle is receiving its final inspection.'],
      ['Ready for Delivery', 'Your vehicle is ready for collection.'],
    ],
  },
  custom: {
    id: 'custom',
    label: 'Custom Service',
    stages: [
      ['Vehicle Received', 'Your vehicle has been checked in safely.'],
      ['Initial Inspection', 'The service requirements are being reviewed.'],
      ['Service in Progress', 'Your selected service is currently underway.'],
      ['Final Quality Check', 'The finished vehicle is receiving a final inspection.'],
      ['Ready for Delivery', 'Your vehicle is ready for collection.'],
    ],
  },
}

export const SERVICE_STATUS_OPTIONS = [
  'in_progress',
  'on_hold',
  'ready',
  'completed',
]

export function getWorkflow(serviceId = 'custom') {
  return SERVICE_WORKFLOWS[serviceId] || SERVICE_WORKFLOWS.custom
}

export function buildTimeline(serviceId = 'custom') {
  return getWorkflow(serviceId).stages.map(([title, subtitle], index) => ({
    id: `${serviceId}-${index + 1}`,
    title,
    subtitle,
    titleAr: '',
    subtitleAr: '',
    status: index === 0 ? 'in_progress' : 'upcoming',
  }))
}
