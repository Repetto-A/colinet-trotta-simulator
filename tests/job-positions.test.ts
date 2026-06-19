import { describe, expect, it } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import {
  applyJobDesignDrain,
  createInitialJobPositions,
  redesignJobPosition,
  syncJobPositions,
} from "../lib/job-positions"
import { advanceTurn } from "../lib/game-engine"

describe("job positions and people mechanics", () => {
  it("reveals poorly designed roles as the company scales", () => {
    const state = createScenarioState("core_pressure")
    state.turn = 2
    state.initiativeSlots[0] = { ...state.initiativeSlots[0], type: "wheat" }

    const synced = syncJobPositions(state)
    const revealed = synced.jobPositions.filter((position) => position.revealed)

    expect(revealed.length).toBeGreaterThan(0)
    expect(revealed[0].fixed).toBe(false)
  })

  it("redesigns a job without advancing the turn", () => {
    const state = createScenarioState("core_pressure")
    state.money = 500
    state.jobPositions = createInitialJobPositions().map((position, index) =>
      index === 0 ? { ...position, revealed: true } : position,
    )

    const result = redesignJobPosition(state, "release-coordinator")

    expect(result).not.toBeNull()
    expect(result!.state.turn).toBe(state.turn)
    expect(result!.state.jobPositions[0].fixed).toBe(true)
    expect(result!.state.jobPositions[0].amplitude).toBe(result!.state.jobPositions[0].targetAmplitude)
    expect(result!.state.jobPositions[0].enrichment).toBe(result!.state.jobPositions[0].targetEnrichment)
    expect(result!.state.teamCapacity).toBeGreaterThan(state.teamCapacity)
  })

  it("drains team capacity while unfixed roles remain visible", () => {
    const state = createScenarioState("core_pressure")
    state.teamCapacity = 60
    state.jobPositions = createInitialJobPositions().map((position) => ({ ...position, revealed: true }))

    const drained = applyJobDesignDrain(state)

    expect(drained.teamCapacity).toBeLessThan(state.teamCapacity)
  })

  it("applies job drain during turn advancement", () => {
    const state = createScenarioState("core_pressure")
    state.teamCapacity = 70
    state.jobPositions = createInitialJobPositions().map((position, index) =>
      index === 0 ? { ...position, revealed: true } : position,
    )

    const next = advanceTurn({ state, currentSeason: "spring" })

    expect(next.state.teamCapacity).toBeLessThan(70)
  })
})
