export type JobDesignIssue = "overload" | "narrow_scope" | "unclear_ownership" | "skill_mismatch"
export type JobRedesignFocus = "enrichment" | "amplitude" | "both" | "clarify"

export interface JobPositionTemplate {
  id: string
  title: string
  area: string
  designScore: number
  amplitude: number
  enrichment: number
  targetAmplitude: number
  targetEnrichment: number
  redesignFocus: JobRedesignFocus
  issue: JobDesignIssue
  issueLabel: string
  fixConcept: string
  redesignCost: number
  unlockTurn: number
  unlockInitiatives: number
}

export interface JobPosition extends JobPositionTemplate {
  revealed: boolean
  fixed: boolean
}

export const REDESIGN_FOCUS_LABELS: Record<JobRedesignFocus, string> = {
  enrichment: "Enriquecimiento del puesto",
  amplitude: "Ampliación controlada",
  both: "Amplitud + enriquecimiento",
  clarify: "Acotar y clarificar dueños",
}

export const JOB_POSITION_CATALOG: JobPositionTemplate[] = [
  {
    id: "release-coordinator",
    title: "Coordinador de releases",
    area: "Tecnología",
    designScore: 32,
    amplitude: 88,
    enrichment: 22,
    targetAmplitude: 52,
    targetEnrichment: 78,
    redesignFocus: "both",
    issue: "overload",
    issueLabel: "Sobrecarga: una persona planifica, prueba y despliega",
    fixConcept: "Delegar amplitud y enriquecer responsabilidades clave",
    redesignCost: 45,
    unlockTurn: 2,
    unlockInitiatives: 1,
  },
  {
    id: "support-analyst",
    title: "Analista funcional de soporte",
    area: "Operaciones",
    designScore: 28,
    amplitude: 18,
    enrichment: 14,
    targetAmplitude: 38,
    targetEnrichment: 72,
    redesignFocus: "enrichment",
    issue: "narrow_scope",
    issueLabel: "Puesto estrecho: tareas repetitivas sin visión de negocio",
    fixConcept: "Enriquecimiento del puesto",
    redesignCost: 38,
    unlockTurn: 3,
    unlockInitiatives: 2,
  },
  {
    id: "compliance-owner",
    title: "Responsable de cumplimiento",
    area: "Gobernanza",
    designScore: 35,
    amplitude: 62,
    enrichment: 34,
    targetAmplitude: 44,
    targetEnrichment: 82,
    redesignFocus: "clarify",
    issue: "unclear_ownership",
    issueLabel: "Roles difusos: todos asumen que otro controla SSN/ISO",
    fixConcept: "Clarificación de responsabilidades",
    redesignCost: 52,
    unlockTurn: 5,
    unlockInitiatives: 2,
  },
  {
    id: "ai-champion",
    title: "Referente de IA",
    area: "Innovación",
    designScore: 30,
    amplitude: 48,
    enrichment: 20,
    targetAmplitude: 54,
    targetEnrichment: 76,
    redesignFocus: "enrichment",
    issue: "skill_mismatch",
    issueLabel: "Desajuste: se pide innovar sin tiempo ni mandato formal",
    fixConcept: "Diseño de puesto + patrocinio",
    redesignCost: 55,
    unlockTurn: 6,
    unlockInitiatives: 3,
  },
  {
    id: "regional-pm",
    title: "PM de expansión regional",
    area: "Estructura",
    designScore: 26,
    amplitude: 82,
    enrichment: 28,
    targetAmplitude: 48,
    targetEnrichment: 74,
    redesignFocus: "both",
    issue: "overload",
    issueLabel: "Escaló la empresa pero el puesto siguió siendo un rol part-time",
    fixConcept: "Rediseño al escalar + delegación",
    redesignCost: 60,
    unlockTurn: 8,
    unlockInitiatives: 4,
  },
]