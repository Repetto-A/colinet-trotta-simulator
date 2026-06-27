import { BUSINESS_ACTIONS, type BusinessActionDefinition } from "@/lib/business-decisions"
import {
  applyJobDesignDrain,
  buildJobDesignAlerts,
  syncJobPositions,
} from "@/lib/job-positions"
import {
  CARD_EVENT_ROLL_CHANCE,
  INITIATIVE_ASSIGNMENT_COST,
  INITIATIVE_PAYOUT_RATE,
  MAX_CYCLE_CARDS,
  MAX_TURNS,
  TACTICAL_TUNE_COST,
} from "@/lib/game-balance"
import { KPI_SHORT } from "@/lib/kpi-glossary"
import { calculateRotationEffect, INITIATIVES, SEASONS, type InitiativeType, type Season } from "@/types/initiatives"
import {
  readCoreMetric,
  type ActiveEventModifier,
  type BusinessGameState,
} from "@/types/business-game"
import { generateRandomEvent, getEventPolarity, type EnvironmentalEvent } from "@/types/events"
import type { ScenarioId } from "@/types/scenario"

export type CooldownState = Record<string, number>

export { INITIATIVE_ASSIGNMENT_COST, TACTICAL_TUNE_COST } from "@/lib/game-balance"

export interface TurnFeedbackItem {
  label: string
  delta: number
}

export interface TurnFeedbackSummary {
  title: string
  gains: TurnFeedbackItem[]
  losses: TurnFeedbackItem[]
  risk: string
}

export interface AdvanceTurnResult {
  state: BusinessGameState
  currentSeason: Season
  initiativeCompletions: string[]
}

export interface TurnPipelineResult {
  state: BusinessGameState
  currentSeason: Season
  cooldowns: CooldownState
  pendingEvent: EnvironmentalEvent | null
  feedback: TurnFeedbackSummary
  alerts: string[]
}

const seasonCycle: Season[] = ["spring", "summer", "autumn", "winter"]

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const actionCooldowns: Record<string, number> = {
  stabilize: 1,
  modernize: 2,
  govern: 2,
  innovate: 1,
  motivate: 1,
  culture_bbq: 1,
  train_team: 2,
  delegate_fronts: 2,
  situational_leadership: 1,
  tune: 1,
}

const coreMetricIds = [
  "clientSatisfaction",
  "processControl",
  "teamCapacity",
  "executionSpeed",
] as const
type CoreMetricId = (typeof coreMetricIds)[number]

const tuneMetricIds = [...coreMetricIds, "sustainability"] as const
type TuneMetricId = (typeof tuneMetricIds)[number]

const businessMetricLabels: Record<TuneMetricId, string> = {
  clientSatisfaction: KPI_SHORT.clients,
  processControl: KPI_SHORT.control,
  teamCapacity: KPI_SHORT.capacity,
  executionSpeed: KPI_SHORT.speed,
  sustainability: KPI_SHORT.confidence,
}

function readMetric(state: BusinessGameState, metric: TuneMetricId): number {
  if (metric === "sustainability") return state.sustainability
  return readCoreMetric(state, metric)
}

function writeMetric(state: BusinessGameState, metric: TuneMetricId, value: number): BusinessGameState {
  if (metric === "sustainability") return { ...state, sustainability: clampPercent(value) }
  return { ...state, [metric]: clampPercent(value) }
}

export function updateCooldowns(cooldowns: CooldownState): CooldownState {
  return Object.fromEntries(Object.entries(cooldowns).map(([key, value]) => [key, Math.max(0, value - 1)]))
}

export function getActionCooldown(actionId: string) {
  return actionCooldowns[actionId] || 0
}

function calculateLoadDecay(state: BusinessGameState) {
  const activeSlots = state.initiativeSlots.filter((slot) => slot.type !== "unassigned").length
  const load = activeSlots * 0.45 + (state.executionSpeed < 45 ? 0.9 : 0) + (state.processControl < 45 ? 0.6 : 0)
  let processControl = Math.round(0.8 + load)
  let teamCapacity = Math.round(0.7 + load * 0.7)
  let sustainability = 1.0

  // Entropía de mercado: los clientes se enfrían si no los atendés (poder de clientes / rivalidad).
  // Cuesta más sostener satisfacción alta que media (rendimientos decrecientes).
  let clientSatisfaction = state.clientSatisfaction > 70 ? 2.0 : 1.25
  // Entropía operativa: el ritmo de entrega se erosiona sin foco activo.
  let executionSpeed = 1.0

  if (state.lastActionId === "govern") processControl = Math.max(0, processControl - 1)
  if (state.lastActionId === "stabilize") {
    sustainability = Math.max(0, sustainability - 1)
    clientSatisfaction = Math.max(0, clientSatisfaction - 1)
  }
  if (state.lastActionId === "motivate" || state.lastActionId === "culture_bbq") {
    teamCapacity = Math.max(0, teamCapacity - 1)
  }
  if (state.lastActionId === "modernize") executionSpeed = Math.max(0, executionSpeed - 1)

  return { processControl, teamCapacity, sustainability, clientSatisfaction, executionSpeed }
}

function criticalNeedsMultiplier(
  slot: BusinessGameState["initiativeSlots"][number],
  state: BusinessGameState,
): number {
  const initiative = INITIATIVES[slot.type]
  const stage = initiative.stages[slot.stageIndex]
  if (!stage?.criticalNeeds) return 1

  let penalty = 0
  if (stage.criticalNeeds.irrigation && state.executionSpeed < 40) penalty += 0.1
  if (stage.criticalNeeds.nitrogen && state.teamCapacity < 40) penalty += 0.1
  return Math.max(0.75, 1 - penalty)
}

function divideEventEffects(effects: EnvironmentalEvent["effects"], duration: number) {
  const turns = Math.max(1, duration)
  return {
    clientSatisfactionChange: effects.clientSatisfactionChange ? Math.round(effects.clientSatisfactionChange / turns) : undefined,
    executionSpeedChange: effects.executionSpeedChange ? Math.round(effects.executionSpeedChange / turns) : undefined,
    teamCapacityChange: effects.teamCapacityChange ? Math.round(effects.teamCapacityChange / turns) : undefined,
    processControlChange: effects.processControlChange ? Math.round(effects.processControlChange / turns) : undefined,
    sustainabilityChange: effects.sustainabilityChange
      ? Math.round(effects.sustainabilityChange / turns)
      : undefined,
    yieldMultiplier: effects.yieldMultiplier,
  }
}

function applyEffectChunk(
  state: BusinessGameState,
  effects: EnvironmentalEvent["effects"],
  multiplier = 1,
): BusinessGameState {
  let next = { ...state }

  if (effects.clientSatisfactionChange) {
    next.clientSatisfaction = clampPercent(next.clientSatisfaction + Math.round(effects.clientSatisfactionChange * multiplier))
  }
  if (effects.executionSpeedChange) {
    next.executionSpeed = clampPercent(next.executionSpeed + Math.round(effects.executionSpeedChange * multiplier))
  }
  if (effects.teamCapacityChange) {
    next.teamCapacity = clampPercent(next.teamCapacity + Math.round(effects.teamCapacityChange * multiplier))
  }
  if (effects.processControlChange) {
    next.processControl = clampPercent(next.processControl + Math.round(effects.processControlChange * multiplier))
  }
  if (effects.sustainabilityChange) {
    next.sustainability = clampPercent(next.sustainability + Math.round(effects.sustainabilityChange * multiplier))
  }
  if (effects.yieldMultiplier && effects.yieldMultiplier < 1) {
    const penalty = Math.round((1 - effects.yieldMultiplier) * 12 * multiplier)
    next.clientSatisfaction = clampPercent(next.clientSatisfaction - penalty)
    next.executionSpeed = clampPercent(next.executionSpeed - Math.round(penalty * 0.5))
  }

  return next
}

export function tickActiveModifiers(state: BusinessGameState): { state: BusinessGameState; alerts: string[] } {
  const alerts: string[] = []
  const remaining: ActiveEventModifier[] = []

  let next = { ...state }

  for (const modifier of state.activeModifiers) {
    next = applyEffectChunk(next, modifier.effectsPerTurn)

    if (modifier.turnsLeft <= 1) {
      alerts.push(
        modifier.polarity === "fortune"
          ? `Se cerró la ventana favorable de "${modifier.eventName}".`
          : `El efecto de "${modifier.eventName}" dejó de condicionar el ciclo.`,
      )
      continue
    }

    remaining.push({ ...modifier, turnsLeft: modifier.turnsLeft - 1 })
  }

  return { state: { ...next, activeModifiers: remaining }, alerts }
}

export function applyTacticalTune(state: BusinessGameState): BusinessGameState | null {
  if (state.money < TACTICAL_TUNE_COST) return null

  const sorted = [...tuneMetricIds].sort((a, b) => readMetric(state, a) - readMetric(state, b))
  const boost = sorted[0]
  const drain = sorted[sorted.length - 1]

  let next: BusinessGameState = {
    ...state,
    money: state.money - TACTICAL_TUNE_COST,
    turn: state.turn + 1,
    lastActionId: "tune",
    revenue: state.revenue + 12,
  }
  next = writeMetric(next, boost, readMetric(next, boost) + 3)
  next = writeMetric(next, drain, readMetric(next, drain) - 4)

  return next
}

export function applyBusinessAction(
  state: BusinessGameState,
  action: BusinessActionDefinition,
  intensity = 100,
): BusinessGameState {
  const multiplier = intensity / 100
  const actualCost = Math.round(action.cost * multiplier)

  if (actualCost > state.money) return state

  return {
    ...state,
    money: state.money - actualCost,
    executionSpeed: clampPercent(state.executionSpeed + Math.round(action.executionSpeedChange * multiplier)),
    teamCapacity: clampPercent(state.teamCapacity + Math.round(action.teamCapacityChange * multiplier)),
    processControl: clampPercent(state.processControl + Math.round(action.processControlChange * multiplier)),
    clientSatisfaction: clampPercent(state.clientSatisfaction + Math.round(action.clientSatisfactionChange * multiplier)),
    sustainability: clampPercent(state.sustainability + Math.round(action.sustainabilityChange * multiplier)),
    regulatoryRisk: clampPercent(state.regulatoryRisk + (action.sustainabilityChange >= 0 ? -3 : 4)),
    techModernization: Math.max(0, state.techModernization + Math.max(0, action.processControlChange * 4 + action.executionSpeedChange * 2)),
    revenue: state.revenue + action.clientSatisfactionChange * 8 - actualCost * 0.4,
    turn: state.turn + 1,
    lastActionId: action.id,
  }
}

export function selectInitiative(
  state: BusinessGameState,
  slotIndex: number,
  initiativeType: InitiativeType,
  currentSeason: Season,
): BusinessGameState | null {
  if (state.money < INITIATIVE_ASSIGNMENT_COST) return null

  const currentSlot = state.initiativeSlots[slotIndex]
  if (!currentSlot) return null

  const previousType = currentSlot.type
  const rotationEffect = calculateRotationEffect(previousType, initiativeType)
  const updatedHistory = [...(currentSlot.history || [])]

  if (previousType !== "unassigned") {
    updatedHistory.push({
      type: previousType,
      season: `${SEASONS[currentSeason].name} (Turn ${state.turn})`,
    })
  }

  const updatedCrops = [...state.initiativeSlots]
  updatedCrops[slotIndex] = {
    ...currentSlot,
    type: initiativeType,
    stageIndex: 0,
    stageProgress: 0,
    turnsInStage: 0,
    history: updatedHistory,
    rotationMultiplier: rotationEffect.yieldMultiplier,
  }

  return syncJobPositions({
    ...state,
    money: state.money - INITIATIVE_ASSIGNMENT_COST,
    initiativeSlots: updatedCrops,
    processControl: clampPercent(state.processControl + rotationEffect.processControlChange),
    teamCapacity: clampPercent(state.teamCapacity + rotationEffect.teamCapacityChange),
  })
}

export function advanceTurn({
  state,
  currentSeason,
  incrementTurn = true,
}: {
  state: BusinessGameState
  currentSeason: Season
  incrementTurn?: boolean
}): AdvanceTurnResult {
  const nextTurn = incrementTurn ? state.turn + 1 : state.turn
  const nextSeason =
    nextTurn > 0 && nextTurn % 3 === 0
      ? seasonCycle[(seasonCycle.indexOf(currentSeason) + 1) % seasonCycle.length]
      : currentSeason

  const initiativeCompletions: string[] = []
  let moneyGain = 0

  const updatedCrops = state.initiativeSlots.map((slot) => {
    if (slot.type === "unassigned") return slot

    const initiative = INITIATIVES[slot.type]
    const stage = initiative.stages[slot.stageIndex]
    const turnsInStage = slot.turnsInStage + 1
    const stageProgress = stage ? (turnsInStage / stage.duration) * 100 : 100

    if (stage && turnsInStage >= stage.duration) {
      if (slot.stageIndex < initiative.stages.length - 1) {
        return {
          ...slot,
          stageIndex: slot.stageIndex + 1,
          turnsInStage: 0,
          stageProgress: 0,
        }
      }

      const payoutMultiplier = (slot.rotationMultiplier ?? 1) * criticalNeedsMultiplier(slot, state)
      const payout = Math.round(initiative.baseYield * INITIATIVE_PAYOUT_RATE * payoutMultiplier)
      moneyGain += payout
      initiativeCompletions.push(`${initiative.name} cerrada · +$${payout}`)

      return {
        type: "unassigned" as InitiativeType,
        stageIndex: 0,
        stageProgress: 0,
        turnsInStage: 0,
        history: slot.history,
        rotationMultiplier: 1,
      }
    }

    return {
      ...slot,
      turnsInStage,
      stageProgress: Math.min(100, stageProgress),
    }
  })

  const decay = calculateLoadDecay(state)
  const afterJobSync = syncJobPositions({
    ...state,
    turn: nextTurn,
    money: state.money + moneyGain,
    revenue: state.revenue + moneyGain * 0.6,
    initiativesCompleted: state.initiativesCompleted + (initiativeCompletions.length > 0 ? initiativeCompletions.length : 0),
    processControl: Math.max(0, Math.round(state.processControl - decay.processControl)),
    teamCapacity: Math.max(0, Math.round(state.teamCapacity - decay.teamCapacity)),
    sustainability: Math.max(0, Math.round(state.sustainability - decay.sustainability)),
    clientSatisfaction: Math.max(0, Math.round(state.clientSatisfaction - decay.clientSatisfaction)),
    executionSpeed: Math.max(0, Math.round(state.executionSpeed - decay.executionSpeed)),
    initiativeSlots: updatedCrops,
  })
  const afterJobDrain = applyJobDesignDrain(afterJobSync)
  const afterModifiers = tickActiveModifiers(afterJobDrain)

  return {
    currentSeason: nextSeason,
    initiativeCompletions,
    state: afterModifiers.state,
  }
}

export function resolveEventImpact(
  state: BusinessGameState,
  event: EnvironmentalEvent,
  mode: "mitigate" | "accept",
): BusinessGameState {
  const isFortune = getEventPolarity(event) === "fortune"
  const cardsDrawn = (state.cycleCardsDrawn ?? 0) + 1

  if (isFortune && mode === "accept") {
    const moneyDelta = event.effects.moneyChange ?? 0
    return {
      ...state,
      money: state.money + moneyDelta,
      recentEventTypes: [...state.recentEventTypes.slice(-2), event.type],
      cycleCardsDrawn: cardsDrawn,
    }
  }

  const mitigationMultiplier = mode === "mitigate" ? 1 - (event.mitigationEffectiveness || 0) : 1
  const mitigationCost = mode === "mitigate" ? event.mitigationCost || 0 : 0
  const perTurn = divideEventEffects(event.effects, event.duration)

  let next = applyEffectChunk(state, perTurn, mitigationMultiplier)
  next = {
    ...next,
    money: next.money + Math.round((event.effects.moneyChange || 0) * mitigationMultiplier) - mitigationCost,
    recentEventTypes: [...state.recentEventTypes.slice(-2), event.type],
    cycleCardsDrawn: cardsDrawn,
  }

  if (event.duration > 1) {
    next.activeModifiers = [
      ...next.activeModifiers,
      {
        eventId: event.id,
        eventName: event.name,
        eventType: event.type,
        polarity: getEventPolarity(event),
        turnsLeft: event.duration - 1,
        totalTurns: event.duration,
        effectsPerTurn: {
          clientSatisfactionChange: perTurn.clientSatisfactionChange
            ? Math.round((perTurn.clientSatisfactionChange || 0) * mitigationMultiplier)
            : undefined,
          executionSpeedChange: perTurn.executionSpeedChange ? Math.round((perTurn.executionSpeedChange || 0) * mitigationMultiplier) : undefined,
          teamCapacityChange: perTurn.teamCapacityChange
            ? Math.round((perTurn.teamCapacityChange || 0) * mitigationMultiplier)
            : undefined,
          processControlChange: perTurn.processControlChange
            ? Math.round((perTurn.processControlChange || 0) * mitigationMultiplier)
            : undefined,
          sustainabilityChange: perTurn.sustainabilityChange
            ? Math.round((perTurn.sustainabilityChange || 0) * mitigationMultiplier)
            : undefined,
          yieldMultiplier: perTurn.yieldMultiplier,
        },
      },
    ]
  }

  return next
}

/** @deprecated Use resolveEventImpact */
export function applyEventEffects(
  state: BusinessGameState,
  event: EnvironmentalEvent,
  multiplier: number,
  mitigationCost = 0,
): BusinessGameState {
  const mode = mitigationCost > 0 ? "mitigate" : "accept"
  const adjustedEvent =
    mode === "mitigate"
      ? {
          ...event,
          mitigationEffectiveness: event.mitigationEffectiveness ?? 1 - multiplier,
          mitigationCost,
          duration: 1,
        }
      : { ...event, duration: 1 }

  return resolveEventImpact(state, adjustedEvent, mode)
}

export function buildThresholdAlerts(state: BusinessGameState): string[] {
  const alerts: string[] = []

  if (state.processControl < 35) {
    alerts.push("Gobernanza en rojo: los controles ya no alcanzan para sostener la ejecución.")
  } else if (state.processControl < 55) {
    alerts.push("Procesos exigidos: ordená responsables, criterios y evidencias antes de escalar.")
  }
  if (state.executionSpeed < 35) {
    alerts.push("La velocidad de ejecución cayó fuerte: hay demasiados frentes para la misma capacidad.")
  }
  if (state.clientSatisfaction < 40) {
    alerts.push("Clientes en riesgo: priorizá calidad percibida y promesas cumplidas antes de abrir más frentes.")
  }
  if (state.sustainability < 45) {
    alerts.push("La confianza de mercado está en riesgo: seguridad, cumplimiento o narrativa quedaron débiles.")
  }
  if (state.money < 120) {
    alerts.push("Caja crítica: la empresa perdió margen para absorber errores o experimentar.")
  }
  if (state.teamCapacity < 35) {
    alerts.push("El equipo está saturado: si seguís sumando iniciativas, aparece desgaste y retrabajo.")
  }
  if (state.turn >= MAX_TURNS - 2) {
    alerts.push("Cierre inminente: quedan pocos turnos para alcanzar el umbral del ciclo.")
  }

  for (const modifier of state.activeModifiers) {
    alerts.push(`Incidente activo: ${modifier.eventName} (${modifier.turnsLeft}t restantes).`)
  }

  alerts.push(...buildJobDesignAlerts(state))

  return alerts
}

const feedbackMetrics: Array<{ metric: TuneMetricId | "money"; label: string }> = [
  { metric: "clientSatisfaction", label: KPI_SHORT.clients },
  { metric: "processControl", label: KPI_SHORT.control },
  { metric: "teamCapacity", label: KPI_SHORT.capacity },
  { metric: "executionSpeed", label: KPI_SHORT.speed },
  { metric: "sustainability", label: KPI_SHORT.confidence },
  { metric: "money", label: KPI_SHORT.budget },
]

export function createTurnFeedback(
  previous: BusinessGameState,
  next: BusinessGameState,
  actionTitle: string,
  risk: string,
): TurnFeedbackSummary {
  const deltas = feedbackMetrics
    .map(({ metric, label }) => ({
      label,
      delta: Math.round(
        (metric === "money" ? next.money : readMetric(next, metric)) -
          (metric === "money" ? previous.money : readMetric(previous, metric)),
      ),
    }))
    .filter((item) => item.delta !== 0)

  return {
    title: `Decisión ejecutada: ${actionTitle}`,
    gains: deltas.filter((item) => item.delta > 0),
    losses: deltas.filter((item) => item.delta < 0),
    risk,
  }
}

export function executeStrategicTurn({
  previousState,
  action,
  currentSeason,
  cooldowns,
  scenarioId,
  risk,
}: {
  previousState: BusinessGameState
  action: BusinessActionDefinition
  currentSeason: Season
  cooldowns: CooldownState
  scenarioId: ScenarioId | null
  risk: string
}): TurnPipelineResult | null {
  if ((cooldowns[action.id] || 0) > 0 || action.cost > previousState.money) {
    return null
  }

  const afterAction =
    action.id === "tune" ? applyTacticalTune(previousState) : applyBusinessAction(previousState, action)

  if (!afterAction || afterAction.turn === previousState.turn) return null

  const advanced = advanceTurn({ state: afterAction, currentSeason, incrementTurn: false })
  const nextCooldowns = {
    ...updateCooldowns(cooldowns),
    [action.id]: getActionCooldown(action.id),
  }

  const cardsDrawn = advanced.state.cycleCardsDrawn ?? 0
  const pendingEvent =
    scenarioId &&
    cardsDrawn < MAX_CYCLE_CARDS &&
    advanced.state.turn >= 2 &&
    Math.random() <= CARD_EVENT_ROLL_CHANCE
      ? generateRandomEvent(scenarioId, advanced.currentSeason, previousState.recentEventTypes, advanced.state)
      : null

  const alerts = [
    ...buildThresholdAlerts(advanced.state),
    ...advanced.initiativeCompletions,
    ...(pendingEvent
      ? [`Sacá la carta del ciclo: ${pendingEvent.name}.`]
      : []),
    ...(advanced.state.activeModifiers.length > previousState.activeModifiers.length
      ? [`Un giro del ciclo sigue activo en los próximos turnos.`]
      : []),
  ]

  return {
    state: advanced.state,
    currentSeason: advanced.currentSeason,
    cooldowns: nextCooldowns,
    pendingEvent,
    feedback: createTurnFeedback(previousState, advanced.state, action.title, risk),
    alerts: alerts.slice(0, 4),
  }
}

export function getAvailableBusinessActions(state: BusinessGameState, cooldowns: CooldownState) {
  return BUSINESS_ACTIONS.map((action) => ({
    action,
    canAfford: state.money >= action.cost,
    cooldown: action.id === "tune" ? 0 : cooldowns[action.id] || 0,
    isSuggested: action.recommended(state),
  }))
}

export const STRATEGIC_ACTION_IDS = ["stabilize", "modernize", "govern", "innovate", "delegate_fronts", "tune"] as const
export const PEOPLE_ACTION_IDS = ["motivate", "culture_bbq", "train_team", "situational_leadership"] as const

export function createTacticalFeedback(previous: BusinessGameState, next: BusinessGameState, risk: string) {
  const sorted = [...tuneMetricIds].sort((a, b) => readMetric(previous, a) - readMetric(previous, b))
  const boost = sorted[0]
  const drain = sorted[sorted.length - 1]

  return {
    title: "Ajuste táctico aplicado",
    gains: [{ label: businessMetricLabels[boost], delta: Math.max(0, readMetric(next, boost) - readMetric(previous, boost)) }],
    losses: [{ label: businessMetricLabels[drain], delta: Math.min(0, readMetric(next, drain) - readMetric(previous, drain)) }],
    risk,
  }
}
