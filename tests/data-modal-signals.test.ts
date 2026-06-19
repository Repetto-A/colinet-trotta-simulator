import { describe, expect, it } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import { buildKpiComparisonData, getSignalSnapshot, statusLabel } from "../lib/data-modal-signals"
import { getDerivedKpis } from "../types/business-game"

describe("data modal signals", () => {
  it("builds comparison data from derived KPIs", () => {
    const state = createScenarioState("core_pressure")
    const previous = { ...state, clientSatisfaction: state.clientSatisfaction - 10, executionSpeed: state.executionSpeed - 5 }
    const current = getDerivedKpis(state)
    const prev = getDerivedKpis(previous)

    const data = buildKpiComparisonData(current, prev, ["satisfaccion_clientes", "velocidad_ejecucion"])

    expect(data).toHaveLength(2)
    expect(data[0].current).toBe(current.satisfaccion_clientes)
    expect(data[0].previous).toBe(prev.satisfaccion_clientes)
    expect(data[0].delta).toBe(10)
    expect(data[1].delta).toBe(5)
  })

  it("groups snapshot by signal tab using real game state", () => {
    const state = createScenarioState("core_pressure")
    const previous = createScenarioState("core_pressure")
    const snapshot = getSignalSnapshot(state, previous)

    expect(snapshot.turn).toBe(state.turn)
    expect(snapshot.byGroup.market).toHaveLength(3)
    expect(snapshot.byGroup.capacity.every((item) => item.current >= 0 && item.current <= 100)).toBe(true)
  })

  it("labels signal strength bands", () => {
    expect(statusLabel(80)).toBe("Alta")
    expect(statusLabel(50)).toBe("Media")
    expect(statusLabel(20)).toBe("Baja")
  })
})
