export { getWorkflow, buildTimeline, SERVICE_WORKFLOWS, SERVICE_STATUS_OPTIONS } from './workflows'
export const DEFAULT_STAGES = getWorkflow('ppf').stages.map(([title], index) => ({ id: `ppf-${index+1}`, title }))
