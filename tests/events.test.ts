import { describe, expect, it, vi } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import {
  EVENTS,
  EVENT_PROBABILITIES,
  FORTUNE_EVENTS,
  generateRandomEvent,
  getEventPolarity,
} from "../types/events"
import type { ScenarioId } from "../types/scenario"
import type { Season } from "../types/initiatives"

const NEW_EVENT_TYPES = ["fx_gap", "salary_parity", "training_gap"] as const
const SEVERITY_KEYS = ["light", "moderate", "severe"] as const

const SCENARIOS: ScenarioId[] = [
  "core_pressure",
  "portfolio_expansion",
  "regional_structure",
  "governance_compliance",
  "ai_innovation",
]
const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"]

describe("environmental events", () => {
  it("includes fx_gap, salary_parity and training_gap in EVENTS with all severity tiers", () => {
    for (const eventType of NEW_EVENT_TYPES) {
      expect(EVENTS[eventType]).toBeDefined()

      for (const severity of SEVERITY_KEYS) {
        const event = EVENTS[eventType][severity]
        expect(event).toBeDefined()
        expect(event.type).toBe(eventType)
        expect(event.id).toBeTruthy()
        expect(event.name).toBeTruthy()
      }
    }
  })

  it("registers new event types in EVENT_PROBABILITIES", () => {
    for (const eventType of NEW_EVENT_TYPES) {
      const entry = EVENT_PROBABILITIES.find((item) => item.eventType === eventType)
      expect(entry).toBeDefined()
      expect(entry!.probability).toBeGreaterThan(0)
      expect(entry!.scenarios.length).toBeGreaterThan(0)
      expect(entry!.seasons.length).toBeGreaterThan(0)
    }
  })

  it("generateRandomEvent does not crash across scenarios and seasons", () => {
    const state = createScenarioState("core_pressure")

    for (const scenario of SCENARIOS) {
      for (const season of SEASONS) {
        for (let i = 0; i < 20; i++) {
          expect(() =>
            generateRandomEvent(scenario, season, ["client_escalation", "delivery_bottleneck"], state),
          ).not.toThrow()
        }
      }
    }
  })

  it("generateRandomEvent returns a valid event when random gate passes", () => {
    const state = createScenarioState("core_pressure")
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.1)

    const event = generateRandomEvent("core_pressure", "summer", [], state)

    expect(event).not.toBeNull()
    expect(event!.type).toBeTruthy()
    expect(EVENTS[event!.type as keyof typeof EVENTS] ?? FORTUNE_EVENTS[event!.type as keyof typeof FORTUNE_EVENTS]).toBeDefined()

    randomSpy.mockRestore()
  })

  it("can roll fortune events with positive polarity", () => {
    const state = createScenarioState("core_pressure")
    let index = 0
    const rolls = [0.1, 0.05, 0.1, 0.1]
    vi.spyOn(Math, "random").mockImplementation(() => rolls[index++ % rolls.length])

    const event = generateRandomEvent("core_pressure", "summer", [], state)

    expect(event).not.toBeNull()
    expect(getEventPolarity(event!)).toBe("fortune")

    vi.mocked(Math.random).mockRestore()
  })
})
