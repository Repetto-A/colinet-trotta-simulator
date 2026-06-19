import { describe, expect, it } from "vitest"

import { getDerivedKpis } from "../types/business-game"
import { calculateRotationEffect } from "../types/initiatives"
import { createScenarioState } from "../lib/colinet-trotta-content"

describe("business game domain", () => {
  it("derives management KPIs from the reused state shape", () => {
    const state = createScenarioState("core_pressure")
    const kpis = getDerivedKpis(state)

    expect(kpis.satisfaccion_clientes).toBe(state.clientSatisfaction)
    expect(kpis.control_procesos).toBe(state.processControl)
    expect(kpis.velocidad_ejecucion).toBe(state.executionSpeed)
    expect(kpis.confianza_mercado).toBe(state.sustainability)
  })

  it("rewards transitions from enabling initiatives into core bets", () => {
    const effect = calculateRotationEffect("culture_program", "core_stabilization")

    expect(effect.type).toBe("bonus")
    expect(effect.processControlChange).toBeGreaterThan(0)
    expect(effect.yieldMultiplier).toBeGreaterThan(1)
  })

  it("penalizes repeating the same initiative in the same capacity slot", () => {
    const effect = calculateRotationEffect("core_stabilization", "core_stabilization")

    expect(effect.type).toBe("penalty")
    expect(effect.teamCapacityChange).toBeLessThan(0)
    expect(effect.yieldMultiplier).toBeLessThan(1)
  })
})
