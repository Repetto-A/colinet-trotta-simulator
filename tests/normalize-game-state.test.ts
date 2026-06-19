import { describe, expect, it } from "vitest"

import { createScenarioState, migrateInitiativeType, normalizeGameState } from "../lib/colinet-trotta-content"
import { TEAM_SLOT_COUNT } from "../lib/game-balance"

describe("normalizeGameState", () => {
  it("recorta saves con 9 slots a 3 equipos", () => {
    const base = createScenarioState("core_pressure")
    const legacy = {
      ...base,
      initiativeSlots: Array.from({ length: 9 }, (_, i) => ({
        ...base.initiativeSlots[0],
        type: i === 0 ? ("wheat" as const) : ("unassigned" as const),
      })),
    }

    const normalized = normalizeGameState(legacy as typeof base)

    expect(normalized.initiativeSlots).toHaveLength(TEAM_SLOT_COUNT)
    expect(normalized.initiativeSlots[0].type).toBe("core_stabilization")
  })

  it("migra ids agrícolas en slots e historial", () => {
    const base = createScenarioState("core_pressure")
    const legacy = {
      ...base,
      initiativeSlots: base.initiativeSlots.map((slot, index) =>
        index === 1
          ? {
              ...slot,
              type: "corn" as const,
              history: [{ type: "wheat" as const, season: "Diagnóstico" }],
            }
          : slot,
      ),
    }

    const normalized = normalizeGameState(legacy as typeof base)

    expect(normalized.initiativeSlots[1].type).toBe("ecosystem_expansion")
    expect(normalized.initiativeSlots[1].history?.[0]?.type).toBe("core_stabilization")
  })

  it("migrateInitiativeType devuelve unassigned para ids desconocidos", () => {
    expect(migrateInitiativeType("unknown_crop")).toBe("unassigned")
    expect(migrateInitiativeType("ai_pilot")).toBe("ai_pilot")
  })
})
