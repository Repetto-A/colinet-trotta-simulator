import type { BusinessGameState } from "@/types/business-game"
import { getDerivedKpis } from "@/types/business-game"

/** Duración del ciclo estratégico en turnos de comité */
export const CYCLE_TURNS = 10
export const MAX_TURNS = 12

/** Economía — 630 vs 640: dos palancas nuevas (~$50) en people/estrategia; caja inicial un poco más ajustada */
export const STARTING_BUDGET = 630
export const INITIATIVE_ASSIGNMENT_COST = 25
export const TACTICAL_TUNE_COST = 28
export const INITIATIVE_PAYOUT_RATE = 0.092

/** Etiqueta cualitativa para decisiones del comité (evita ruido de $ en cada carta). */
export function formatDecisionCostTier(cost: number): string {
  if (cost <= 22) return "inversión ligera"
  if (cost <= 38) return "inversión media"
  return "inversión alta"
}

/** Puntuación para cerrar ciclo */
export const SCORE_DEFEAT = 44
export const SCORE_PARTIAL = 45
export const SCORE_VICTORY = 65
export const SCORE_EXCELLENT = 80

export type CycleOutcome =
  | "playing"
  | "defeat_quiebra"
  | "defeat_clientes"
  | "defeat_gobernanza"
  | "defeat_capacidad"
  | "defeat_timeout"
  | "defeat_score"
  | "partial"
  | "victory"
  | "excellent"

export interface GameStatus {
  outcome: CycleOutcome
  isGameOver: boolean
  canCloseCycle: boolean
  mustCloseCycle: boolean
  score: number
  stars: 0 | 1 | 2 | 3
  headline: string
  detail: string
}

const outcomeHeadlines: Record<CycleOutcome, string> = {
  playing: "Ciclo en curso",
  defeat_quiebra: "Quiebra operativa",
  defeat_clientes: "Pérdida de clientes clave",
  defeat_gobernanza: "Colapso de gobernanza",
  defeat_capacidad: "Capacidad agotada",
  defeat_timeout: "Ciclo sin cierre",
  defeat_score: "Estrategia insuficiente",
  partial: "Ciclo sobrevivido",
  victory: "Comité exitoso",
  excellent: "Transformación sobresaliente",
}

export function calculateCycleScore(state: BusinessGameState, startingBudget = STARTING_BUDGET): number {
  const budgetRatio = Math.min(100, Math.round((state.money / startingBudget) * 100))
  const missionBonus = Math.min(12, state.initiativesCompleted * 4)
  const weakestCoreMetric = Math.min(
    state.clientSatisfaction,
    state.processControl,
    state.teamCapacity,
    state.executionSpeed,
  )
  const weakSpotPenalty = weakestCoreMetric < 35 ? Math.round((35 - weakestCoreMetric) * 0.28) : 0
  const imbalancePenalty =
    Math.max(
      state.clientSatisfaction,
      state.processControl,
      state.teamCapacity,
      state.executionSpeed,
      state.sustainability,
    ) -
      Math.min(
        state.clientSatisfaction,
        state.processControl,
        state.teamCapacity,
        state.executionSpeed,
        state.sustainability,
      ) >
    38
      ? 3
      : 0

  return Math.max(
    0,
    Math.round(
    state.clientSatisfaction * 0.24 +
      state.processControl * 0.2 +
      state.sustainability * 0.16 +
      state.teamCapacity * 0.14 +
      state.executionSpeed * 0.1 +
      budgetRatio * 0.06 +
        missionBonus -
        weakSpotPenalty -
        imbalancePenalty,
    ),
  )
}

function starsFromScore(score: number, isGameOver: boolean): 0 | 1 | 2 | 3 {
  if (isGameOver && score < SCORE_PARTIAL) return 0
  if (score >= SCORE_EXCELLENT) return 3
  if (score >= SCORE_VICTORY) return 2
  if (score >= SCORE_PARTIAL) return 1
  return 0
}

function midCycleDefeat(state: BusinessGameState): CycleOutcome | null {
  if (state.money <= 0) return "defeat_quiebra"
  if (state.clientSatisfaction <= 0) return "defeat_clientes"
  if (state.processControl <= 0) return "defeat_gobernanza"
  if (state.teamCapacity <= 0 && state.executionSpeed <= 0) return "defeat_capacidad"
  return null
}

export function evaluateGameStatus(
  state: BusinessGameState,
  options: { startingBudget?: number; closingCycle?: boolean } = {},
): GameStatus {
  const startingBudget = options.startingBudget ?? STARTING_BUDGET
  const score = calculateCycleScore(state, startingBudget)
  const defeat = midCycleDefeat(state)

  if (defeat) {
    return {
      outcome: defeat,
      isGameOver: true,
      canCloseCycle: true,
      mustCloseCycle: true,
      score,
      stars: 0,
      headline: outcomeHeadlines[defeat],
      detail: buildDefeatDetail(defeat, state),
    }
  }

  if (state.turn >= MAX_TURNS) {
    const outcome = score >= SCORE_PARTIAL ? (score >= SCORE_VICTORY ? "victory" : "partial") : "defeat_timeout"
    const isGameOver = outcome === "defeat_timeout"

    return {
      outcome,
      isGameOver,
      canCloseCycle: true,
      mustCloseCycle: true,
      score,
      stars: starsFromScore(score, isGameOver),
      headline: outcomeHeadlines[outcome],
      detail:
        outcome === "defeat_timeout"
          ? "Superaste el límite de turnos sin cerrar el ciclo con foco. El comité perdió legitimidad."
          : buildVictoryDetail(outcome, score, state),
    }
  }

  if (options.closingCycle || state.turn >= CYCLE_TURNS) {
    let outcome: CycleOutcome = "defeat_score"
    if (score >= SCORE_EXCELLENT) outcome = "excellent"
    else if (score >= SCORE_VICTORY) outcome = "victory"
    else if (score >= SCORE_PARTIAL) outcome = "partial"

    const isWin = outcome !== "defeat_score"

    return {
      outcome,
      isGameOver: false,
      canCloseCycle: state.turn >= CYCLE_TURNS,
      mustCloseCycle: state.turn >= CYCLE_TURNS,
      score,
      stars: starsFromScore(score, !isWin),
      headline: outcomeHeadlines[outcome],
      detail: isWin ? buildVictoryDetail(outcome, score, state) : buildDefeatDetail(outcome, state, score),
    }
  }

  return {
    outcome: "playing",
    isGameOver: false,
    canCloseCycle: false,
    mustCloseCycle: false,
    score,
    stars: starsFromScore(score, false),
    headline: outcomeHeadlines.playing,
    detail: `Objetivo del comité: ${SCORE_VICTORY}+ pts para victoria · ${SCORE_EXCELLENT}+ para excelencia`,
  }
}

function buildDefeatDetail(outcome: CycleOutcome, state: BusinessGameState, score?: number): string {
  switch (outcome) {
    case "defeat_quiebra":
      return "La caja llegó a cero. Sin margen financiero, la empresa no puede sostener operación ni apuestas."
    case "defeat_clientes":
      return "La satisfacción de clientes colapsó. Perdiste legitimidad comercial antes de cerrar el ciclo."
    case "defeat_gobernanza":
      return "Control y procesos en cero. Sin gobernanza, cada iniciativa genera caos en lugar de valor."
    case "defeat_capacidad":
      return "Velocidad y capacidad del equipo se agotaron al mismo tiempo. El sistema no puede ejecutar."
    case "defeat_timeout":
      return "El ciclo se extendió demasiado. En la práctica, eso es una derrota operativa."
    case "defeat_score":
      return `Puntaje final ${score ?? calculateCycleScore(state)}: por debajo del mínimo (${SCORE_PARTIAL}). El comité sobrevivió, pero no entregó resultados.`
    default:
      return "La estrategia no alcanzó para sostener a Colinet Trotta."
  }
}

function buildVictoryDetail(outcome: CycleOutcome, score: number, state: BusinessGameState): string {
  const kpis = getDerivedKpis(state)
  if (outcome === "excellent") {
    return `Puntaje ${score}: equilibrio entre clientes (${kpis.satisfaccion_clientes}%), control (${kpis.control_procesos}%) y confianza (${kpis.confianza_mercado}%).`
  }
  if (outcome === "victory") {
    return `Puntaje ${score}: cerraste el ciclo con una base defendible. Todavía hay tensiones, pero el comité cumplió su mandato.`
  }
  return `Puntaje ${score}: evitaste el colapso, pero varios frentes quedaron frágiles. Repetí el ciclo para mejorar el equilibrio.`
}

export function getScoreProgress(score: number) {
  return {
    score,
    victoryTarget: SCORE_VICTORY,
    excellentTarget: SCORE_EXCELLENT,
    progressToVictory: Math.min(100, Math.round((score / SCORE_VICTORY) * 100)),
    progressToExcellent: Math.min(100, Math.round((score / SCORE_EXCELLENT) * 100)),
  }
}

/** Avance del ciclo por turno (1..maxTurns), no puntaje hacia victoria */
export function getCycleProgress(turn: number, maxTurns: number = MAX_TURNS) {
  const safeMax = Math.max(1, maxTurns)
  const safeTurn = Math.max(1, Math.min(safeMax, turn))
  return Math.round((safeTurn / safeMax) * 100)
}
