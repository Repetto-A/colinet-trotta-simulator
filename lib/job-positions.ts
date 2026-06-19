import type { BusinessGameState } from "@/types/business-game"
import { JOB_POSITION_CATALOG, type JobPosition } from "@/types/job-positions"

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function createInitialJobPositions(): JobPosition[] {
  return JOB_POSITION_CATALOG.map((template) => ({
    ...template,
    revealed: false,
    fixed: false,
  }))
}

export function countActiveInitiatives(state: BusinessGameState) {
  return state.initiativeSlots.filter((slot) => slot.type !== "fallow").length
}

export function syncJobPositions(state: BusinessGameState): BusinessGameState {
  const activeInitiatives = countActiveInitiatives(state)
  const jobPositions = state.jobPositions.map((position) => {
    if (position.revealed || position.fixed) return position

    const shouldReveal =
      state.turn >= position.unlockTurn && activeInitiatives >= position.unlockInitiatives

    return shouldReveal ? { ...position, revealed: true } : position
  })

  return { ...state, jobPositions }
}

export function getUnfixedPositions(state: BusinessGameState) {
  return state.jobPositions.filter((position) => position.revealed && !position.fixed)
}

export function applyJobDesignDrain(state: BusinessGameState): BusinessGameState {
  const unfixed = getUnfixedPositions(state)
  if (unfixed.length === 0) return state

  const drain = Math.round(unfixed.length * 1.4)
  const avgDesign = unfixed.reduce((sum, p) => sum + p.designScore, 0) / unfixed.length

  return {
    ...state,
    teamCapacity: clamp(state.teamCapacity - drain),
    executionSpeed: clamp(state.executionSpeed - Math.round(drain * 0.35)),
    sustainability: clamp(state.sustainability - (avgDesign < 30 ? 1 : 0)),
  }
}

export function redesignJobPosition(
  state: BusinessGameState,
  positionId: string,
): { state: BusinessGameState; message: string } | null {
  const position = state.jobPositions.find((item) => item.id === positionId)
  if (!position || !position.revealed || position.fixed) return null
  if (state.money < position.redesignCost) return null

  const jobPositions = state.jobPositions.map((item) =>
    item.id === positionId
      ? {
          ...item,
          fixed: true,
          designScore: 86,
          amplitude: item.targetAmplitude,
          enrichment: item.targetEnrichment,
        }
      : item,
  )

  return {
    state: {
      ...state,
      money: state.money - position.redesignCost,
      jobPositions,
      teamCapacity: clamp(state.teamCapacity + 10),
      executionSpeed: clamp(state.executionSpeed - 4),
      sustainability: clamp(state.sustainability + 5),
      processControl: clamp(state.processControl + 4),
    },
    message: `Puesto rediseñado: ${position.title} · ${position.fixConcept}`,
  }
}

export function getJobDesignSummary(state: BusinessGameState) {
  const visible = state.jobPositions.filter((p) => p.revealed)
  const unfixed = visible.filter((p) => !p.fixed)
  const avgScore =
    visible.length === 0
      ? 100
      : Math.round(visible.reduce((sum, p) => sum + p.designScore, 0) / visible.length)

  return { visible: visible.length, unfixed: unfixed.length, avgScore }
}

export function buildJobDesignAlerts(state: BusinessGameState): string[] {
  const unfixed = getUnfixedPositions(state)
  if (unfixed.length === 0) return []

  const worst = [...unfixed].sort((a, b) => a.designScore - b.designScore)[0]
  return [
    `${unfixed.length} puesto${unfixed.length > 1 ? "s" : ""} mal diseñado${unfixed.length > 1 ? "s" : ""}: revisá "${worst.title}" antes de seguir escalando.`,
  ]
}
