import { describe, expect, it } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import { BUSINESS_ACTIONS } from "../lib/business-decisions"
import {
  evaluateGameStatus,
  MAX_TURNS,
  SCORE_PARTIAL,
  SCORE_VICTORY,
  STARTING_BUDGET,
} from "../lib/game-balance"
import { executeStrategicTurn, selectInitiative } from "../lib/game-engine"
import type { Season } from "../types/initiatives"

/** Simula una partida guiada: decisiones activas + 2 frentes asignados en 12 turnos. */
function simulateGuidedCycle(seed: number) {
  let random = seed
  const rng = () => {
    random = (random * 1664525 + 1013904223) >>> 0
    return random / 0xffffffff
  }

  let state = createScenarioState("core_pressure")
  let season: Season = "spring"
  let cooldowns = Object.fromEntries(BUSINESS_ACTIONS.map((a) => [a.id, 0]))
  const actionOrder = [
    "stabilize",
    "govern",
    "delegate_fronts",
    "train_team",
    "situational_leadership",
    "motivate",
    "modernize",
    "culture_bbq",
    "innovate",
  ]
  let actionIdx = 0
  let initiativesAssigned = 0

  for (let t = 0; t < MAX_TURNS; t++) {
    if (t === 1 && state.money >= 25) {
      const next = selectInitiative(state, 0, "wheat", season)
      if (next) {
        state = next
        initiativesAssigned++
      }
    }
    if (t === 4 && state.money >= 25) {
      const next = selectInitiative(state, 1, "clover", season)
      if (next) {
        state = next
        initiativesAssigned++
      }
    }

    let action = null
    for (let i = 0; i < actionOrder.length; i++) {
      const id = actionOrder[(actionIdx + i) % actionOrder.length]
      const candidate = BUSINESS_ACTIONS.find((a) => a.id === id)!
      if ((cooldowns[id] || 0) === 0 && state.money >= candidate.cost) {
        action = candidate
        actionIdx = (actionIdx + i + 1) % actionOrder.length
        break
      }
    }
    if (!action) continue

    const originalRandom = Math.random
    Math.random = rng
    const result = executeStrategicTurn({
      previousState: state,
      action,
      currentSeason: season,
      cooldowns,
      scenarioId: "core_pressure",
      risk: "Simulación guiada",
    })
    Math.random = originalRandom

    if (!result) continue
    state = result.state
    season = result.currentSeason
    cooldowns = result.cooldowns
  }

  const status = evaluateGameStatus(state, { startingBudget: STARTING_BUDGET, closingCycle: true })
  return { score: status.score, outcome: status.outcome, initiativesAssigned, turn: state.turn, state }
}

describe("playtest guided full cycle", () => {
  it("active play reaches at least partial outcome without early collapse", () => {
    const runs = Array.from({ length: 12 }, (_, i) => simulateGuidedCycle(100 + i))
    const avgScore = runs.reduce((sum, r) => sum + r.score, 0) / runs.length
    const partialRate = runs.filter((r) => r.score >= SCORE_PARTIAL).length / runs.length
    const victoryRate = runs.filter((r) => r.score >= SCORE_VICTORY).length / runs.length
    const earlyCollapse = runs.filter((r) => r.state.clientSatisfaction < 25 && r.state.teamCapacity < 25).length

    expect(avgScore).toBeGreaterThan(52)
    expect(partialRate).toBeGreaterThan(0.75)
    expect(victoryRate).toBeGreaterThan(0.35)
    expect(earlyCollapse).toBeLessThan(3)
    expect(runs.every((r) => r.initiativesAssigned >= 1)).toBe(true)
  })
})
