import { describe, expect, it } from "vitest"

import {
  advanceTurn,
  applyBusinessAction,
  applyEventEffects,
  applyTacticalTune,
  executeStrategicTurn,
  INITIATIVE_ASSIGNMENT_COST,
  TACTICAL_TUNE_COST,
  resolveEventImpact,
  selectInitiative,
  updateCooldowns,
  createTurnFeedback,
} from "../lib/game-engine"
import { createScenarioState } from "../lib/colinet-trotta-content"
import { BUSINESS_ACTIONS } from "../lib/business-decisions"
import type { EnvironmentalEvent } from "../types/events"

describe("game engine transitions", () => {
  it("applies a business action and advances one turn", () => {
    const state = createScenarioState("core_pressure")
    const action = BUSINESS_ACTIONS.find((item) => item.id === "govern")!

    const next = applyBusinessAction(state, action)

    expect(next.turn).toBe(state.turn + 1)
    expect(next.money).toBe(state.money - action.cost)
    expect(next.processControl).toBeGreaterThan(state.processControl)
    expect(next.lastActionId).toBe("govern")
  })

  it("reduces cooldowns without going below zero", () => {
    expect(updateCooldowns({ stabilize: 2, modernize: 1, govern: 0, tune: 0, motivate: 1, culture_bbq: 0 })).toEqual({
      stabilize: 1,
      modernize: 0,
      govern: 0,
      tune: 0,
      motivate: 0,
      culture_bbq: 0,
    })
  })

  it("advances initiative stages and changes season every three turns", () => {
    const state = createScenarioState("core_pressure")
    const withInitiative = selectInitiative(state, 0, "wheat", "spring")
    expect(withInitiative).not.toBeNull()

    const next = advanceTurn({ state: { ...withInitiative!, turn: 2 }, currentSeason: "spring" })

    expect(next.state.turn).toBe(3)
    expect(next.currentSeason).toBe("summer")
    expect(next.state.initiativeSlots[0].turnsInStage).toBe(1)
  })

  it("can progress a turn that was already incremented by an action", () => {
    const state = createScenarioState("core_pressure")
    const withInitiative = selectInitiative(state, 0, "wheat", "spring")
    const action = BUSINESS_ACTIONS.find((item) => item.id === "stabilize")!
    const afterAction = applyBusinessAction({ ...withInitiative!, turn: 2 }, action)

    const next = advanceTurn({ state: afterAction, currentSeason: "spring", incrementTurn: false })

    expect(next.state.turn).toBe(3)
    expect(next.currentSeason).toBe("summer")
    expect(next.state.initiativeSlots[0].turnsInStage).toBe(1)
  })

  it("selects initiatives, charges assignment cost and applies rotation effects", () => {
    const state = createScenarioState("core_pressure")
    const prepared = {
      ...state,
      initiativeSlots: state.initiativeSlots.map((slot, index) => (index === 0 ? { ...slot, type: "clover" as const } : slot)),
    }

    const next = selectInitiative(prepared, 0, "wheat", "spring")

    expect(next).not.toBeNull()
    expect(next!.money).toBe(prepared.money - INITIATIVE_ASSIGNMENT_COST)
    expect(next!.initiativeSlots[0].type).toBe("wheat")
    expect(next!.initiativeSlots[0].history?.[0]?.type).toBe("clover")
    expect(next!.processControl).toBeGreaterThan(prepared.processControl)
    expect(next!.teamCapacity).toBeGreaterThan(prepared.teamCapacity)
  })

  it("pays out when an initiative completes its final stage", () => {
    const state = createScenarioState("core_pressure")
    const assigned = selectInitiative(state, 0, "wheat", "spring")!
    const initiative = assigned.initiativeSlots[0]
    const finalStageDuration = 3
    assigned.initiativeSlots[0] = {
      ...initiative,
      stageIndex: 3,
      turnsInStage: finalStageDuration - 1,
      stageProgress: 90,
    }

    const result = advanceTurn({ state: assigned, currentSeason: "winter", incrementTurn: true })

    expect(result.state.initiativeSlots[0].type).toBe("fallow")
    expect(result.state.money).toBeGreaterThan(assigned.money)
    expect(result.initiativeCompletions.length).toBe(1)
  })

  it("applies tactical tune without cooldown", () => {
    const state = createScenarioState("core_pressure")
    state.teamCapacity = 20
    state.clientSatisfaction = 80

    const tuned = applyTacticalTune(state)

    expect(tuned).not.toBeNull()
    expect(tuned!.turn).toBe(state.turn + 1)
    expect(tuned!.teamCapacity).toBe(state.teamCapacity + 3)
    expect(tuned!.clientSatisfaction).toBe(state.clientSatisfaction - 4)
    expect(tuned!.money).toBe(state.money - TACTICAL_TUNE_COST)
  })

  it("uses updated balance constants for initiative and tune costs", () => {
    expect(TACTICAL_TUNE_COST).toBe(24)
    expect(INITIATIVE_ASSIGNMENT_COST).toBe(25)
  })

  it("registers multi-turn modifiers when accepting long events", () => {
    const state = createScenarioState("core_pressure")
    const event: EnvironmentalEvent = {
      id: "test-event",
      type: "delivery_bottleneck",
      name: "Cuello de botella",
      description: "Test",
      severity: "medium",
      effects: { executionSpeedChange: -20, clientSatisfactionChange: -10, moneyChange: -100 },
      canMitigate: true,
      mitigationCost: 50,
      mitigationEffectiveness: 0.5,
      duration: 2,
    }

    const resolved = resolveEventImpact(state, event, "accept")

    expect(resolved.activeModifiers).toHaveLength(1)
    expect(resolved.activeModifiers[0].turnsLeft).toBe(1)
    expect(resolved.recentEventTypes).toContain("delivery_bottleneck")
  })

  it("applies mitigated event effects through legacy helper", () => {
    const state = createScenarioState("core_pressure")
    const event: EnvironmentalEvent = {
      id: "test-event",
      type: "delivery_bottleneck",
      name: "Cuello de botella",
      description: "Test",
      severity: "medium",
      effects: { executionSpeedChange: -20, clientSatisfactionChange: -10, moneyChange: -100 },
      canMitigate: true,
      mitigationCost: 50,
      mitigationEffectiveness: 0.5,
      duration: 1,
    }

    const accepted = applyEventEffects(state, event, 1)
    const mitigated = applyEventEffects(state, event, 0.5, event.mitigationCost)

    expect(accepted.executionSpeed).toBe(state.executionSpeed - 20)
    expect(mitigated.executionSpeed).toBe(state.executionSpeed - 10)
    expect(mitigated.money).toBe(state.money - 100)
  })

  it("executes a full strategic turn in one pipeline", () => {
    const state = createScenarioState("core_pressure")
    const action = BUSINESS_ACTIONS.find((item) => item.id === "stabilize")!

    const result = executeStrategicTurn({
      previousState: state,
      action,
      currentSeason: "spring",
      cooldowns: { stabilize: 0, modernize: 0, govern: 0, innovate: 0, tune: 0 },
      scenarioId: "core_pressure",
      risk: "Test risk",
    })

    expect(result).not.toBeNull()
    expect(result!.state.turn).toBe(state.turn + 1)
    expect(result!.cooldowns.stabilize).toBe(1)
    expect(result!.feedback.title).toContain(action.title)
  })

  it("summarizes visible post-turn feedback", () => {
    const state = createScenarioState("core_pressure")
    const action = BUSINESS_ACTIONS.find((item) => item.id === "stabilize")!
    const next = applyBusinessAction(state, action)

    const feedback = createTurnFeedback(state, next, action.title, "Gobernanza frágil")

    expect(feedback.title).toContain(action.title)
    expect(feedback.gains.length).toBeGreaterThan(0)
    expect(feedback.losses.length).toBeGreaterThan(0)
    expect(feedback.risk).toBe("Gobernanza frágil")
  })
})
