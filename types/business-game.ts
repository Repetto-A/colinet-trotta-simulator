import type { InitiativeType } from "@/types/initiatives"
import type { EventType } from "@/types/events"
import type { JobPosition } from "@/types/job-positions"

export interface CapabilityHistoryEntry {
  type: InitiativeType
  season: string
}

export interface CapabilitySlot {
  type: InitiativeType
  stageIndex: number
  stageProgress: number
  turnsInStage: number
  history?: CapabilityHistoryEntry[]
  rotationMultiplier?: number
}

export interface ActiveEventModifier {
  eventId: string
  eventName: string
  eventType: EventType
  polarity?: "fortune" | "setback"
  turnsLeft: number
  totalTurns: number
  effectsPerTurn: {
    clientSatisfactionChange?: number
    executionSpeedChange?: number
    teamCapacityChange?: number
    processControlChange?: number
    sustainabilityChange?: number
    yieldMultiplier?: number
  }
}

export interface BusinessGameState {
  executionSpeed: number
  teamCapacity: number
  processControl: number
  money: number
  clientSatisfaction: number
  sustainability: number
  techModernization: number
  regulatoryRisk: number
  revenue: number
  turn: number
  initiativeSlots: CapabilitySlot[]
  lastActionId?: string | null
  activeModifiers: ActiveEventModifier[]
  recentEventTypes: EventType[]
  initiativesCompleted: number
  jobPositions: JobPosition[]
}

export interface DerivedKpis {
  modernizacion_tecnologica: number
  satisfaccion_clientes: number
  riesgo_regulatorio: number
  seguridad_informacion: number
  capacidad_equipo: number
  cultura_innovacion: number
  control_procesos: number
  rentabilidad: number
  deuda_tecnica: number
  confianza_mercado: number
  velocidad_ejecucion: number
  madurez_ecosistema_gaus: number
}

/** @deprecated Use state fields directly (clientSatisfaction, processControl, …). */
export function readCoreMetric(state: BusinessGameState, metric: CoreBusinessMetricId): number {
  return state[metric]
}

export type CoreBusinessMetricId =
  | "clientSatisfaction"
  | "processControl"
  | "teamCapacity"
  | "executionSpeed"

export const KPI_LABELS = {
  executionSpeed: "Velocidad de ejecución",
  teamCapacity: "Capacidad del equipo",
  processControl: "Control y procesos",
  clientSatisfaction: "Satisfacción de clientes",
  money: "Caja / rentabilidad",
  sustainability: "Confianza de mercado",
  techModernization: "Modernización tecnológica",
  regulatoryRisk: "Riesgo regulatorio",
} as const

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function getDerivedKpis(state: BusinessGameState): DerivedKpis {
  const ecosystemAssigned = state.initiativeSlots.filter((slot) =>
    ["ecosystem_expansion", "iso_program", "ai_pilot"].includes(slot.type),
  ).length

  return {
    modernizacion_tecnologica: clamp(state.techModernization / 4),
    satisfaccion_clientes: clamp(state.clientSatisfaction),
    riesgo_regulatorio: clamp(state.regulatoryRisk),
    seguridad_informacion: clamp(state.processControl * 0.55 + state.sustainability * 0.45),
    capacidad_equipo: clamp(state.teamCapacity),
    cultura_innovacion: clamp(
      20 + state.teamCapacity * 0.4 + state.sustainability * 0.35 - state.processControl * 0.15,
    ),
    control_procesos: clamp(state.processControl),
    rentabilidad: clamp(state.money / 10),
    deuda_tecnica: clamp(100 - state.techModernization / 4),
    confianza_mercado: clamp(state.sustainability),
    velocidad_ejecucion: clamp(state.executionSpeed),
    madurez_ecosistema_gaus: clamp((ecosystemAssigned / 3) * 100),
  }
}
