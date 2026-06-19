"use client"

import { useCallback, useEffect, useState } from "react"

import type { CooldownState } from "@/lib/game-engine"
import type { LearningMission } from "@/lib/learning-objectives"
import type { BusinessGameState } from "@/types/business-game"
import type { Season } from "@/types/initiatives"
import type { ScenarioId } from "@/types/scenario"

import type { LearningRecap } from "@/lib/learning-recap"
import { normalizeGameState } from "@/lib/colinet-trotta-content"

const STORAGE_KEY = "colinet-trotta-game-save"
const SAVE_VERSION = 2
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export interface PersistedGameSave {
  version: typeof SAVE_VERSION
  savedAt: number
  gameState: BusinessGameState
  initialGameState: BusinessGameState
  season: Season
  cooldowns: CooldownState
  missions: LearningMission[]
  rewardedMissions: string[]
  selectedScenario: ScenarioId
  sessionKey: number
  learningRecap?: LearningRecap
}

export type PersistedGamePayload = Omit<PersistedGameSave, "version" | "savedAt">

export function readPersistedSave(): PersistedGameSave | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as PersistedGameSave
    if (parsed.version !== SAVE_VERSION) return null
    if (!parsed.gameState || !parsed.selectedScenario || typeof parsed.savedAt !== "number") return null
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      ...parsed,
      gameState: normalizeGameState(parsed.gameState),
      initialGameState: normalizeGameState(parsed.initialGameState),
    }
  } catch {
    return null
  }
}

export function writePersistedSave(payload: PersistedGamePayload) {
  if (typeof window === "undefined") return

  const save: PersistedGameSave = {
    ...payload,
    version: SAVE_VERSION,
    savedAt: Date.now(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
}

export function clearPersistedSave() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function formatSaveSummary(save: PersistedGameSave) {
  const hoursAgo = Math.max(1, Math.round((Date.now() - save.savedAt) / (60 * 60 * 1000)))
  return {
    scenarioId: save.selectedScenario,
    turn: save.gameState.turn,
    budget: save.gameState.money,
    savedAgoLabel: hoursAgo === 1 ? "hace 1 hora" : `hace ${hoursAgo} horas`,
  }
}

export function useGamePersistence() {
  const [savedGame, setSavedGame] = useState<PersistedGameSave | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSavedGame(readPersistedSave())
    setHydrated(true)
  }, [])

  const persist = useCallback((payload: PersistedGamePayload) => {
    writePersistedSave(payload)
    setSavedGame(readPersistedSave())
  }, [])

  const clear = useCallback(() => {
    clearPersistedSave()
    setSavedGame(null)
  }, [])

  return {
    hydrated,
    savedGame,
    hasValidSave: hydrated && savedGame !== null,
    persist,
    clear,
    saveSummary: savedGame ? formatSaveSummary(savedGame) : null,
  }
}
