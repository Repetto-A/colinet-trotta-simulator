import { useCallback, useReducer } from "react"

import {
  buildThresholdAlerts,
  executeStrategicTurn,
  INITIATIVE_ASSIGNMENT_COST,
  resolveEventImpact,
  selectInitiative,
  type CooldownState,
  type TurnFeedbackSummary,
} from "@/lib/game-engine"
import { redesignJobPosition } from "@/lib/job-positions"
import { createInitialMissions, updateMissions, type LearningMission } from "@/lib/learning-objectives"
import {
  createEmptyLearningRecap,
  recordActionConcept,
  recordEventConcept,
  recordJobRedesign,
  recordMissionCompleted,
  type LearningRecap,
} from "@/lib/learning-recap"
import { getStoryBeat } from "@/lib/story-arc"
import { REDESIGN_FOCUS_LABELS } from "@/types/job-positions"
import type { BusinessActionDefinition } from "@/lib/business-decisions"
import type { BusinessGameState } from "@/types/business-game"
import { INITIATIVES, type InitiativeType, type Season } from "@/types/initiatives"
import type { EnvironmentalEvent } from "@/types/events"
import { getEventPolarity } from "@/types/events"
import type { ScenarioId } from "@/types/scenario"

const defaultCooldowns: CooldownState = {
  stabilize: 0,
  modernize: 0,
  govern: 0,
  innovate: 0,
  delegate_fronts: 0,
  motivate: 0,
  culture_bbq: 0,
  train_team: 0,
  situational_leadership: 0,
  tune: 0,
}

export interface GameLoopState {
  gameState: BusinessGameState
  previousGameState: BusinessGameState
  season: Season
  cooldowns: CooldownState
  missions: LearningMission[]
  rewardedMissions: string[]
  activeEvent: EnvironmentalEvent | null
  lastTurnFeedback: TurnFeedbackSummary | null
  alerts: string[]
  learningRecap: LearningRecap
}

type GameLoopAction =
  | { type: "EXECUTE_DECISION"; action: BusinessActionDefinition; scenarioId: ScenarioId | null; scenarioName: string }
  | { type: "REDESIGN_JOB"; positionId: string }
  | { type: "ASSIGN_INITIATIVE"; slotIndex: number; initiative: InitiativeType; season: Season }
  | { type: "RESOLVE_EVENT"; mode: "mitigate" | "accept" }
  | { type: "DISMISS_ALERT"; index: number }
  | { type: "PUSH_ALERT"; message: string }
  | { type: "RESET"; gameState: BusinessGameState; season: Season }

function rewardCompletedMissions(state: GameLoopState): GameLoopState {
  const newlyCompleted = state.missions.filter(
    (mission) => mission.status === "completed" && !state.rewardedMissions.includes(mission.id),
  )

  if (newlyCompleted.length === 0) return state

  const reward = newlyCompleted.reduce((sum, mission) => sum + mission.reward, 0)

  const learningRecap = newlyCompleted.reduce(
    (recap, mission) => recordMissionCompleted(recap, mission.id, mission.framework, mission.title),
    state.learningRecap,
  )

  return {
    ...state,
    gameState: { ...state.gameState, money: state.gameState.money + reward },
    rewardedMissions: [...state.rewardedMissions, ...newlyCompleted.map((mission) => mission.id)],
    learningRecap,
    alerts: [
      `Misión cumplida: +$${reward} por ${newlyCompleted.map((mission) => mission.title).join(", ")}`,
      ...state.alerts,
    ].slice(0, 4),
  }
}

function reducer(state: GameLoopState, action: GameLoopAction): GameLoopState {
  switch (action.type) {
    case "RESET":
      return createInitialLoopState(action.gameState, action.season)

    case "DISMISS_ALERT":
      return { ...state, alerts: state.alerts.filter((_, index) => index !== action.index) }

    case "PUSH_ALERT":
      return { ...state, alerts: [action.message, ...state.alerts].slice(0, 4) }

    case "ASSIGN_INITIATIVE": {
      const nextState = selectInitiative(state.gameState, action.slotIndex, action.initiative, action.season)
      if (!nextState) {
        return {
          ...state,
          alerts: ["No hay margen en caja para abrir un frente nuevo.", ...state.alerts].slice(0, 4),
        }
      }

      const previousSlot = state.gameState.initiativeSlots[action.slotIndex]
      const selectedSlot = nextState.initiativeSlots[action.slotIndex]
      const rotationAlert =
        selectedSlot.rotationMultiplier && selectedSlot.rotationMultiplier !== 1
          ? [
              `${INITIATIVES[previousSlot.type].name} ${
                selectedSlot.rotationMultiplier > 1 ? "mejora" : "tensiona"
              } la transición hacia ${INITIATIVES[action.initiative].name}.`,
            ]
          : []

      return rewardCompletedMissions({
        ...state,
        gameState: nextState,
        alerts: [
          `Iniciativa asignada · -$${INITIATIVE_ASSIGNMENT_COST}`,
          ...rotationAlert,
          ...buildThresholdAlerts(nextState),
        ].slice(0, 4),
      })
    }

    case "REDESIGN_JOB": {
      const position = state.gameState.jobPositions.find((item) => item.id === action.positionId)
      const result = redesignJobPosition(state.gameState, action.positionId)
      if (!result) {
        return {
          ...state,
          alerts: ["No se pudo rediseñar el puesto: verificá presupuesto y que siga pendiente.", ...state.alerts].slice(
            0,
            4,
          ),
        }
      }

      const learningRecap =
        position && !position.fixed
          ? recordJobRedesign(
              state.learningRecap,
              position.id,
              position.fixConcept,
              REDESIGN_FOCUS_LABELS[position.redesignFocus],
            )
          : state.learningRecap

      return rewardCompletedMissions({
        ...state,
        gameState: result.state,
        learningRecap,
        alerts: [result.message, ...buildThresholdAlerts(result.state)].slice(0, 4),
      })
    }

    case "EXECUTE_DECISION": {
      const pipeline = executeStrategicTurn({
        previousState: state.gameState,
        action: action.action,
        currentSeason: state.season,
        cooldowns: state.cooldowns,
        scenarioId: action.scenarioId,
        risk: getStoryBeat(state.gameState, action.scenarioId).risk,
      })

      if (!pipeline) return state

      const missions = updateMissions(state.missions, pipeline.state, state.gameState.turn)
      const next: GameLoopState = {
        ...state,
        previousGameState: state.gameState,
        gameState: pipeline.state,
        season: pipeline.currentSeason,
        cooldowns: pipeline.cooldowns,
        missions,
        activeEvent: pipeline.pendingEvent,
        lastTurnFeedback: pipeline.feedback,
        alerts: pipeline.alerts,
        learningRecap: recordActionConcept(state.learningRecap, action.action.id, action.action.concept),
      }

      return rewardCompletedMissions(next)
    }

    case "RESOLVE_EVENT": {
      if (!state.activeEvent) return state

      const event = state.activeEvent
      if (
        action.mode === "mitigate" &&
        (!event.canMitigate || !event.mitigationCost || state.gameState.money < event.mitigationCost)
      ) {
        return state
      }

      const nextGameState = resolveEventImpact(state.gameState, event, action.mode)
      const isFortune = getEventPolarity(event) === "fortune"
      const alertMessage = isFortune
        ? `Capitalizaste "${event.name}". El impulso queda en el ciclo.`
        : action.mode === "mitigate"
          ? `Respondiste "${event.name}" y amortiguaste parte del impacto.`
          : `Asumiste "${event.name}". El efecto sigue en juego.`

      const learningRecap = event.learningConcept
        ? recordEventConcept(state.learningRecap, event.id, event.learningConcept)
        : state.learningRecap

      return {
        ...state,
        gameState: nextGameState,
        activeEvent: null,
        learningRecap,
        alerts: [alertMessage, ...buildThresholdAlerts(nextGameState)].slice(0, 4),
      }
    }

    default:
      return state
  }
}

export interface GameLoopInitialOverrides {
  cooldowns?: CooldownState
  missions?: LearningMission[]
  rewardedMissions?: string[]
  learningRecap?: LearningRecap
}

function createInitialLoopState(
  gameState: BusinessGameState,
  season: Season,
  overrides?: GameLoopInitialOverrides,
): GameLoopState {
  return {
    gameState,
    previousGameState: gameState,
    season,
    cooldowns: overrides?.cooldowns ? { ...defaultCooldowns, ...overrides.cooldowns } : { ...defaultCooldowns },
    missions: overrides?.missions ?? createInitialMissions(),
    rewardedMissions: overrides?.rewardedMissions ?? [],
    activeEvent: null,
    lastTurnFeedback: null,
    alerts: buildThresholdAlerts(gameState),
    learningRecap: overrides?.learningRecap ?? createEmptyLearningRecap(),
  }
}

export function useGameLoop(
  initialGameState: BusinessGameState,
  initialSeason: Season,
  overrides?: GameLoopInitialOverrides,
) {
  const [state, dispatch] = useReducer(
    reducer,
    { gameState: initialGameState, season: initialSeason, overrides },
    (seed) => createInitialLoopState(seed.gameState, seed.season, seed.overrides),
  )

  const executeDecision = useCallback(
    (decision: BusinessActionDefinition, scenarioId: ScenarioId | null, scenarioName: string) => {
      dispatch({ type: "EXECUTE_DECISION", action: decision, scenarioId, scenarioName })
    },
    [],
  )

  const assignInitiative = useCallback((slotIndex: number, initiative: InitiativeType, season: Season) => {
    dispatch({ type: "ASSIGN_INITIATIVE", slotIndex, initiative, season })
  }, [])

  const resolveEvent = useCallback((mode: "mitigate" | "accept") => {
    dispatch({ type: "RESOLVE_EVENT", mode })
  }, [])

  const dismissAlert = useCallback((index: number) => {
    dispatch({ type: "DISMISS_ALERT", index })
  }, [])

  const pushAlert = useCallback((message: string) => {
    dispatch({ type: "PUSH_ALERT", message })
  }, [])

  const resetLoop = useCallback((gameState: BusinessGameState, season: Season) => {
    dispatch({ type: "RESET", gameState, season })
  }, [])

  const redesignJob = useCallback((positionId: string) => {
    dispatch({ type: "REDESIGN_JOB", positionId })
  }, [])

  return {
    ...state,
    executeDecision,
    assignInitiative,
    redesignJob,
    resolveEvent,
    dismissAlert,
    pushAlert,
    resetLoop,
  }
}
