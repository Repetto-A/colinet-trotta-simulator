import { KPI_LABELS } from "@/types/business-game"

/**
 * Glosario único de KPIs visibles (REP-11). Fuente de verdad para los nombres mostrados en el
 * header (NavKpiBar), el preview de bienvenida, las píldoras-teaser y el panel de detalle, de modo
 * que las superficies no vuelvan a usar nombres distintos para el mismo KPI.
 *
 * - `short`: etiqueta corta para pills/preview/teasers.
 * - `full`: etiqueta completa (panel de detalle / tooltips), reutiliza `KPI_LABELS`.
 */
export interface KpiGlossaryEntry {
  short: string
  full: string
}

export const KPI_GLOSSARY = {
  budget: { short: "Presupuesto", full: KPI_LABELS.money },
  clients: { short: "Clientes", full: KPI_LABELS.clientSatisfaction },
  control: { short: "Control", full: KPI_LABELS.processControl },
  capacity: { short: "Capacidad", full: KPI_LABELS.teamCapacity },
  speed: { short: "Velocidad", full: KPI_LABELS.executionSpeed },
  confidence: { short: "Confianza", full: KPI_LABELS.sustainability },
} as const satisfies Record<string, KpiGlossaryEntry>

export type KpiGlossaryKey = keyof typeof KPI_GLOSSARY

/** Etiquetas cortas canónicas, para consumo directo en componentes. */
export const KPI_SHORT = {
  budget: KPI_GLOSSARY.budget.short,
  clients: KPI_GLOSSARY.clients.short,
  control: KPI_GLOSSARY.control.short,
  capacity: KPI_GLOSSARY.capacity.short,
  speed: KPI_GLOSSARY.speed.short,
  confidence: KPI_GLOSSARY.confidence.short,
} as const
