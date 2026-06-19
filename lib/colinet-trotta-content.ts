import type { BusinessGameState } from "@/types/business-game"
import { STARTING_BUDGET, TEAM_SLOT_COUNT } from "@/lib/game-balance"
import { createInitialJobPositions } from "@/lib/job-positions"
import { SCENARIOS, type ScenarioId } from "@/types/scenario"
import type { InitiativeType } from "@/types/initiatives"

const emptySlots = (): BusinessGameState["initiativeSlots"] =>
  Array.from({ length: TEAM_SLOT_COUNT }, () => ({
    type: "fallow" as InitiativeType,
    stageIndex: 0,
    stageProgress: 0,
    turnsInStage: 0,
    history: [],
    rotationMultiplier: 1,
  }))

export function createScenarioState(scenarioId: ScenarioId): BusinessGameState {
  const scenario = SCENARIOS[scenarioId]
  const { processMaturity, executionPace, operationalLoad } = scenario.profile

  return {
    executionSpeed: Math.max(25, Math.min(88, executionPace - 4)),
    teamCapacity: Math.max(25, Math.min(85, 100 - operationalLoad + 2)),
    processControl: Math.max(25, Math.min(88, processMaturity - 6)),
    money: STARTING_BUDGET,
    clientSatisfaction: Math.max(28, Math.min(85, 48 + Math.round((processMaturity - operationalLoad) / 4))),
    sustainability: Math.max(25, Math.min(85, 46 + Math.round((executionPace - operationalLoad) / 5))),
    techModernization: 260,
    regulatoryRisk: Math.max(20, Math.min(85, 55 + Math.round(operationalLoad / 2) - Math.round(processMaturity / 5))),
    revenue: 0,
    turn: 0,
    initiativeSlots: emptySlots(),
    lastActionId: null,
    activeModifiers: [],
    recentEventTypes: [],
    initiativesCompleted: 0,
    jobPositions: createInitialJobPositions(),
  }
}

/** Alinea saves viejos (9 slots agrícolas) con los 3 equipos del comité. */
export function normalizeGameState(state: BusinessGameState): BusinessGameState {
  if (state.initiativeSlots.length === TEAM_SLOT_COUNT) return state
  return {
    ...state,
    initiativeSlots: state.initiativeSlots.slice(0, TEAM_SLOT_COUNT),
  }
}

export const COLINET_TROTTA_FACTS = {
  companyName: "Colinet Trotta",
  coreProduct: "GAUS mp",
  growthLine: "Ecosistema GAUS",
  complementaryUnit: "ITware",
  regulator: "SSN",
  certification: "ISO 27001",
}
