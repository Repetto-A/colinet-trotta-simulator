// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  clearPersistedSave,
  formatSaveSummary,
  readPersistedSave,
  writePersistedSave,
  type PersistedGamePayload,
  type PersistedGameSave,
} from "../lib/use-game-persistence"
import { createScenarioState } from "../lib/colinet-trotta-content"
import type { CooldownState } from "../lib/game-engine"

function makePayload(overrides: Partial<PersistedGamePayload> = {}): PersistedGamePayload {
  return {
    gameState: createScenarioState("core_pressure"),
    initialGameState: createScenarioState("core_pressure"),
    season: "spring",
    cooldowns: {} as unknown as CooldownState,
    missions: [],
    rewardedMissions: [],
    selectedScenario: "core_pressure",
    sessionKey: 1,
    ...overrides,
  }
}

/** Reads the single persisted entry without depending on the (unexported) storage key. */
function readRawSave(): { key: string; value: PersistedGameSave } {
  const key = localStorage.key(0)
  if (!key) throw new Error("no persisted save present")
  return { key, value: JSON.parse(localStorage.getItem(key)!) as PersistedGameSave }
}

describe("use-game-persistence (REP-19)", () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it("returns null when there is no save", () => {
    expect(readPersistedSave()).toBeNull()
  })

  it("round-trips a save through write then read", () => {
    const payload = makePayload()
    payload.gameState.turn = 5
    payload.gameState.money = 432

    writePersistedSave(payload)
    const loaded = readPersistedSave()

    expect(loaded).not.toBeNull()
    expect(loaded!.version).toBe(2)
    expect(loaded!.selectedScenario).toBe("core_pressure")
    expect(loaded!.gameState.turn).toBe(5)
    expect(loaded!.gameState.money).toBe(432)
    expect(typeof loaded!.savedAt).toBe("number")
  })

  it("clears the persisted save", () => {
    writePersistedSave(makePayload())
    expect(readPersistedSave()).not.toBeNull()

    clearPersistedSave()
    expect(readPersistedSave()).toBeNull()
  })

  it("discards saves older than the 24h TTL and removes them", () => {
    writePersistedSave(makePayload())
    const { key, value } = readRawSave()
    value.savedAt = Date.now() - 25 * 60 * 60 * 1000
    localStorage.setItem(key, JSON.stringify(value))

    expect(readPersistedSave()).toBeNull()
    expect(localStorage.getItem(key)).toBeNull()
  })

  it("ignores saves from an older schema version", () => {
    writePersistedSave(makePayload())
    const { key, value } = readRawSave()
    localStorage.setItem(key, JSON.stringify({ ...value, version: 1 }))

    expect(readPersistedSave()).toBeNull()
  })

  it("ignores corrupted JSON", () => {
    localStorage.setItem("colinet-trotta-game-save", "{not valid json")
    expect(readPersistedSave()).toBeNull()
  })

  it("formatSaveSummary derives scenario, turn, budget and an age label", () => {
    const save: PersistedGameSave = {
      ...makePayload(),
      version: 2,
      savedAt: Date.now() - 2 * 60 * 60 * 1000,
    }
    save.gameState.turn = 7
    save.gameState.money = 510

    const summary = formatSaveSummary(save)

    expect(summary.scenarioId).toBe("core_pressure")
    expect(summary.turn).toBe(7)
    expect(summary.budget).toBe(510)
    expect(summary.savedAgoLabel).toBe("hace 2 horas")
  })
})
