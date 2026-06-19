import { describe, expect, it } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import { BUSINESS_ACTIONS } from "../lib/business-decisions"
import { evaluateGameStatus, MAX_TURNS, SCORE_VICTORY, STARTING_BUDGET, TEAM_SLOT_COUNT } from "../lib/game-balance"
import { executeStrategicTurn, selectInitiative } from "../lib/game-engine"
import type { InitiativeType, Season } from "../types/initiatives"
import type { ScenarioId } from "../types/scenario"

const scenarios: ScenarioId[] = ["core_pressure", "ai_innovation", "portfolio_expansion"]

type SimState = ReturnType<typeof createScenarioState>

function pickAction(state: SimState, cooldowns: Record<string, number>, ids: string[]) {
  for (const id of ids) {
    const action = BUSINESS_ACTIONS.find((a) => a.id === id)!
    if ((cooldowns[id] || 0) === 0 && state.money >= action.cost) return action
  }
  return null
}

const strategies = {
  stabilize_focus: (state: SimState, cooldowns: Record<string, number>) =>
    pickAction(state, cooldowns, ["stabilize", "govern"]),
  people_first: (state: SimState, cooldowns: Record<string, number>) =>
    pickAction(state, cooldowns, ["situational_leadership", "motivate", "culture_bbq", "train_team"]),
  mixed: (state: SimState, cooldowns: Record<string, number>) =>
    pickAction(state, cooldowns, ["delegate_fronts", "govern", "train_team", "innovate", "stabilize"]),
  /** Juego conservador: pocas acciones caras, sin iniciativas agresivas */
  cautious: (state: SimState, cooldowns: Record<string, number>) =>
    pickAction(state, cooldowns, ["culture_bbq", "govern"]),
}

const initiativeRotation: InitiativeType[] = ["wheat", "clover", "vetch", "corn"]

function simulate(scenarioId: ScenarioId, strategy: keyof typeof strategies, seed: number) {
  let random = seed
  const rng = () => {
    random = (random * 1664525 + 1013904223) >>> 0
    return random / 0xffffffff
  }

  let state = createScenarioState(scenarioId)
  let season: Season = "spring"
  let cooldowns = Object.fromEntries(BUSINESS_ACTIONS.map((a) => [a.id, 0]))
  const pick = strategies[strategy]
  let slot = 0
  let initiativesAssigned = 0

  for (let t = 0; t < MAX_TURNS; t++) {
    const assignInitiatives = strategy !== "cautious" && t % 3 === 0 && initiativesAssigned < 3
    if (assignInitiatives && state.money >= 25) {
      const initiative = initiativeRotation[slot % initiativeRotation.length]
      const next = selectInitiative(state, slot % TEAM_SLOT_COUNT, initiative, season)
      if (next) {
        state = next
        slot++
        initiativesAssigned++
      }
    }

    const action = pick(state, cooldowns)
    if (!action) continue

    const originalRandom = Math.random
    Math.random = rng
    const result = executeStrategicTurn({
      previousState: state,
      action,
      currentSeason: season,
      cooldowns,
      scenarioId,
      risk: "Simulación",
    })
    Math.random = originalRandom

    if (!result) continue
    state = result.state
    season = result.currentSeason
    cooldowns = result.cooldowns
  }

  const status = evaluateGameStatus(state, { startingBudget: STARTING_BUDGET, closingCycle: true })
  return status.score
}

describe("playtest balance", () => {
  it("average scores stay in a playable band (not trivial, not impossible)", () => {
    const scores: number[] = []
    const byStrategy: Record<keyof typeof strategies, number[]> = {
      stabilize_focus: [],
      people_first: [],
      mixed: [],
      cautious: [],
    }

    let seed = 42
    for (const scenario of scenarios) {
      for (const strategy of Object.keys(strategies) as Array<keyof typeof strategies>) {
        for (let i = 0; i < 25; i++) {
          const score = simulate(scenario, strategy, seed++)
          scores.push(score)
          byStrategy[strategy].push(score)
        }
      }
    }

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const winRate = scores.filter((s) => s >= SCORE_VICTORY).length / scores.length
    const cautiousWinRate =
      byStrategy.cautious.filter((s) => s >= SCORE_VICTORY).length / byStrategy.cautious.length
    const strongWinRate =
      (byStrategy.stabilize_focus.filter((s) => s >= SCORE_VICTORY).length +
        byStrategy.mixed.filter((s) => s >= SCORE_VICTORY).length) /
      (byStrategy.stabilize_focus.length + byStrategy.mixed.length)

    expect(avg).toBeGreaterThan(50)
    expect(avg).toBeLessThan(82)
    // No se gana por defecto: el win rate global debe quedar lejos del 100%.
    expect(winRate).toBeGreaterThan(0.2)
    expect(winRate).toBeLessThan(0.72)
    // El juego conservador/pasivo no debe ganar casi nunca.
    expect(cautiousWinRate).toBeLessThan(0.35)
    // Jugar activo y bien debe ser recompensado, sin ser trivial.
    expect(strongWinRate).toBeGreaterThan(0.45)
    expect(strongWinRate).toBeLessThan(0.82)
  })
})
