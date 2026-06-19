import { describe, expect, it } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import { getStoryBeat } from "../lib/story-arc"
import { SCENARIOS } from "../types/scenario"

describe("story arc", () => {
  it("maps early turns to chapter 1 landing beat", () => {
    const state = createScenarioState("core_pressure")
    state.turn = 1

    const beat = getStoryBeat(state, "core_pressure")

    expect(beat.chapter).toBe(1)
    expect(beat.title).toContain("Aterrizaje")
    expect(beat.brief).toContain("GAUS mp")
    expect(beat.objective).toBeTruthy()
  })

  it("escalates chapter as turns advance", () => {
    const state = createScenarioState("core_pressure")

    state.turn = 6
    expect(getStoryBeat(state, "core_pressure").chapter).toBe(3)

    state.turn = 10
    expect(getStoryBeat(state, "core_pressure").chapter).toBe(4)
    expect(getStoryBeat(state, "core_pressure").title).toContain("Cierre")
  })

  it("surfaces the weakest KPI as dynamic risk", () => {
    const state = createScenarioState("core_pressure")
    state.turn = 4
    state.teamCapacity = 20
    state.clientSatisfaction = 80
    state.processControl = 80
    state.executionSpeed = 80
    state.sustainability = 80

    const beat = getStoryBeat(state, "core_pressure")

    expect(beat.risk).toContain("equipo")
  })

  it("uses scenario opening hook for core pressure", () => {
    const state = createScenarioState("core_pressure")
    state.turn = 1

    const beat = getStoryBeat(state, "core_pressure")

    expect(beat.brief).toBe(SCENARIOS.core_pressure.openingHook)
  })
})
