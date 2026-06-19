import type { BusinessGameState } from "@/types/business-game"
import { STARTING_BUDGET } from "@/lib/game-balance"
import { createInitialJobPositions } from "@/lib/job-positions"
import { SCENARIOS, type ScenarioId } from "@/types/scenario"
import type { InitiativeType } from "@/types/initiatives"

const emptySlots = (): BusinessGameState["initiativeSlots"] =>
  Array.from({ length: 9 }, () => ({
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

export const COLINET_TROTTA_FACTS = {
  companyName: "Colinet Trotta",
  coreProduct: "GAUS mp",
  growthLine: "Ecosistema GAUS",
  complementaryUnit: "ITware",
  regulator: "SSN",
  certification: "ISO 27001",
}
