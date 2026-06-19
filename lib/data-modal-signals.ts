import type { BusinessGameState, DerivedKpis } from "@/types/business-game"
import { getDerivedKpis } from "@/types/business-game"

export type SignalGroup = "market" | "capacity" | "execution" | "expansion"

export const DERIVED_KPI_LABELS: Record<keyof DerivedKpis, string> = {
  modernizacion_tecnologica: "Modernización tecnológica",
  satisfaccion_clientes: "Satisfacción de clientes",
  riesgo_regulatorio: "Riesgo regulatorio",
  seguridad_informacion: "Seguridad de información",
  capacidad_equipo: "Capacidad del equipo",
  cultura_innovacion: "Cultura de innovación",
  control_procesos: "Control de procesos",
  rentabilidad: "Rentabilidad",
  deuda_tecnica: "Deuda técnica",
  confianza_mercado: "Confianza de mercado",
  velocidad_ejecucion: "Velocidad de ejecución",
  madurez_ecosistema_gaus: "Madurez ecosistema GAUS",
}

export const SIGNAL_GROUPS: Record<SignalGroup, (keyof DerivedKpis)[]> = {
  market: ["confianza_mercado", "satisfaccion_clientes", "riesgo_regulatorio"],
  capacity: ["capacidad_equipo", "cultura_innovacion", "control_procesos"],
  execution: ["velocidad_ejecucion", "seguridad_informacion", "deuda_tecnica"],
  expansion: ["modernizacion_tecnologica", "madurez_ecosistema_gaus", "rentabilidad"],
}

export interface KpiComparisonPoint {
  name: string
  current: number
  previous: number
  delta: number
}

export function buildKpiComparisonData(
  current: DerivedKpis,
  previous: DerivedKpis,
  keys: (keyof DerivedKpis)[],
): KpiComparisonPoint[] {
  return keys.map((key) => ({
    name: DERIVED_KPI_LABELS[key],
    current: current[key],
    previous: previous[key],
    delta: current[key] - previous[key],
  }))
}

export function getSignalSnapshot(gameState: BusinessGameState, previousGameState: BusinessGameState) {
  const current = getDerivedKpis(gameState)
  const previous = getDerivedKpis(previousGameState)

  return {
    turn: gameState.turn,
    money: gameState.money,
    current,
    previous,
    byGroup: Object.fromEntries(
      (Object.keys(SIGNAL_GROUPS) as SignalGroup[]).map((group) => [
        group,
        buildKpiComparisonData(current, previous, SIGNAL_GROUPS[group]),
      ]),
    ) as Record<SignalGroup, KpiComparisonPoint[]>,
  }
}

export function statusLabel(value: number): string {
  if (value >= 70) return "Alta"
  if (value >= 45) return "Media"
  return "Baja"
}
