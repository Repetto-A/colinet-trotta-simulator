import type { BusinessGameState } from "@/types/business-game"
import { STARTING_BUDGET, TEAM_SLOT_COUNT } from "@/lib/game-balance"
import { createInitialJobPositions } from "@/lib/job-positions"
import { INITIATIVES, type InitiativeType } from "@/types/initiatives"
import { SCENARIOS, type ScenarioId } from "@/types/scenario"

const LEGACY_INITIATIVE_IDS: Record<string, InitiativeType> = {
  wheat: "core_stabilization",
  corn: "ecosystem_expansion",
  soy: "itware_integration",
  sunflower: "iso_program",
  fallow: "unassigned",
  vetch: "ai_pilot",
  rye: "tech_debt_reduction",
  clover: "culture_program",
}

export function migrateInitiativeType(type: string): InitiativeType {
  if (type in INITIATIVES) return type as InitiativeType
  return LEGACY_INITIATIVE_IDS[type] ?? "unassigned"
}

const emptySlots = (): BusinessGameState["initiativeSlots"] =>
  Array.from({ length: TEAM_SLOT_COUNT }, () => ({
    type: "unassigned" as InitiativeType,
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
    cycleCardsDrawn: 0,
    initiativesCompleted: 0,
    jobPositions: createInitialJobPositions(),
  }
}

/** Alinea saves viejos: 9 slots → 3 equipos e ids agrícolas → ids de negocio. */
export function normalizeGameState(state: BusinessGameState): BusinessGameState {
  let next: BusinessGameState =
    state.initiativeSlots.length === TEAM_SLOT_COUNT
      ? state
      : { ...state, initiativeSlots: state.initiativeSlots.slice(0, TEAM_SLOT_COUNT) }

  const slots = next.initiativeSlots.map((slot) => ({
    ...slot,
    type: migrateInitiativeType(slot.type as string),
    history: slot.history?.map((entry) => ({
      ...entry,
      type: migrateInitiativeType(entry.type as string),
    })),
  }))

  const slotsChanged = slots.some((slot, index) => slot.type !== next.initiativeSlots[index]?.type)

  if (slotsChanged) {
    next = { ...next, initiativeSlots: slots }
  }

  return {
    ...next,
    cycleCardsDrawn: next.cycleCardsDrawn ?? 0,
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
