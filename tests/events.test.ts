import { describe, expect, it, vi } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import { EVENTS, EVENT_PROBABILITIES, generateRandomEvent } from "../types/events"
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
    expect(EVENTS[event!.type]).toBeDefined()

    randomSpy.mockRestore()
  })
})
