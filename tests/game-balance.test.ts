import { describe, expect, it } from "vitest"

import {
  calculateCycleScore,
  CYCLE_TURNS,
  evaluateGameStatus,
  MAX_TURNS,
  SCORE_PARTIAL,
  SCORE_VICTORY,
  STARTING_BUDGET,
} from "../lib/game-balance"
import { CYCLE_MONTHS, cycleMonthName } from "../lib/cycle-months"
import { createScenarioState } from "../lib/colinet-trotta-content"

describe("game balance", () => {
  it("calculates cycle score from KPIs and budget ratio", () => {
    const state = createScenarioState("core_pressure")
    state.clientSatisfaction = 70
    state.processControl = 70
    state.sustainability = 70
    state.teamCapacity = 70
    state.executionSpeed = 70
    state.money = STARTING_BUDGET
    state.initiativesCompleted = 2

    const score = calculateCycleScore(state)

    expect(score).toBeGreaterThan(50)
    expect(score).toBeLessThanOrEqual(100)
  })

  it("returns defeat when money reaches zero mid-cycle", () => {
    const state = createScenarioState("core_pressure")
    state.turn = 3
    state.money = 0

    const status = evaluateGameStatus(state)

    expect(status.isGameOver).toBe(true)
    expect(status.outcome).toBe("defeat_quiebra")
    expect(status.stars).toBe(0)
  })

  it("returns victory when closing cycle with score above victory threshold", () => {
    const state = createScenarioState("core_pressure")
    state.turn = CYCLE_TURNS
    state.money = 500
    state.clientSatisfaction = 72
    state.processControl = 72
    state.sustainability = 68
    state.teamCapacity = 65
    state.executionSpeed = 62
    state.initiativesCompleted = 1

    const score = calculateCycleScore(state)
    expect(score).toBeGreaterThanOrEqual(SCORE_VICTORY)
    expect(score).toBeLessThan(80)

    const status = evaluateGameStatus(state)

    expect(status.outcome).toBe("victory")
    expect(status.canCloseCycle).toBe(true)
    expect(status.stars).toBeGreaterThanOrEqual(2)
  })

  it("returns defeat_score when closing cycle below partial threshold", () => {
    const state = createScenarioState("core_pressure")
    state.turn = CYCLE_TURNS
    state.money = 50
    state.clientSatisfaction = 20
    state.processControl = 20
    state.sustainability = 20
    state.teamCapacity = 20
    state.executionSpeed = 20

    const score = calculateCycleScore(state)
    expect(score).toBeLessThan(SCORE_PARTIAL)

    const status = evaluateGameStatus(state)

    expect(status.outcome).toBe("defeat_score")
    expect(status.stars).toBe(0)
  })

  it("penalizes fragile and imbalanced KPI profiles", () => {
    const fragile = createScenarioState("core_pressure")
    fragile.turn = 10
    fragile.money = 500
    fragile.clientSatisfaction = 70
    fragile.processControl = 70
    fragile.sustainability = 70
    fragile.teamCapacity = 70
    fragile.executionSpeed = 25

    const recovered = { ...fragile, executionSpeed: 45 }

    expect(calculateCycleScore(fragile)).toBeLessThan(calculateCycleScore(recovered))
  })
})

describe("cycle duration (mandato de 12 meses, REP-10)", () => {
  it("defines a 12-month mandate consistently", () => {
    expect(CYCLE_TURNS).toBe(12)
    expect(CYCLE_MONTHS).toHaveLength(12)
  })

  it("maps each turn index to its Spanish month name", () => {
    expect(cycleMonthName(0)).toBe("Enero")
    expect(cycleMonthName(11)).toBe("Diciembre")
    expect(cycleMonthName(99)).toBe("Diciembre")
  })

  it("does not allow closing the cycle before month 12", () => {
    const state = createScenarioState("core_pressure")
    state.turn = CYCLE_TURNS - 1

    const status = evaluateGameStatus(state)

    expect(status.outcome).toBe("playing")
    expect(status.canCloseCycle).toBe(false)
    expect(status.mustCloseCycle).toBe(false)
  })

  it("closes the cycle at month 12 with a score-based outcome (not timeout)", () => {
    const state = createScenarioState("core_pressure")
    state.turn = CYCLE_TURNS
    state.money = 50
    state.clientSatisfaction = 20
    state.processControl = 20
    state.sustainability = 20
    state.teamCapacity = 20
    state.executionSpeed = 20

    const status = evaluateGameStatus(state)

    expect(status.canCloseCycle).toBe(true)
    expect(status.outcome).toBe("defeat_score")
    expect(status.outcome).not.toBe("defeat_timeout")
  })

  it("penalizes overstaying the mandate (beyond month 12) as a timeout", () => {
    const state = createScenarioState("core_pressure")
    state.turn = MAX_TURNS + 1
    state.money = 50
    state.clientSatisfaction = 20
    state.processControl = 20
    state.sustainability = 20
    state.teamCapacity = 20
    state.executionSpeed = 20

    const status = evaluateGameStatus(state)

    expect(status.outcome).toBe("defeat_timeout")
    expect(status.isGameOver).toBe(true)
  })
})
