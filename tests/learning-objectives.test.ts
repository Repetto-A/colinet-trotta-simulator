import { describe, expect, it } from "vitest"

import { createScenarioState } from "../lib/colinet-trotta-content"
import { createInitialMissions, updateMissions } from "../lib/learning-objectives"

describe("learning objectives", () => {
  it("creates the business-learning missions for the adapted game", () => {
    const missions = createInitialMissions()

    expect(missions).toHaveLength(4)
    expect(missions.map((mission) => mission.framework)).toEqual(
      expect.arrayContaining([
        "Porter + oportunidades/amenazas",
        "BCG + portafolio",
        "Cultura + estructura + cambio",
        "Diseño de puesto + motivación",
      ]),
    )
  })

  it("completes the context diagnosis mission when trust and client value are high enough", () => {
    const missions = createInitialMissions()
    const state = createScenarioState("core_pressure")
    state.turn = 1
    state.clientSatisfaction = 70
    state.sustainability = 72

    const updated = updateMissions(missions, state, 0)
    const contextMission = updated.find((mission) => mission.id === "context-diagnosis")

    expect(contextMission?.status).toBe("completed")
    expect(contextMission?.progress).toBe(100)
  })
})
