import { describe, expect, it } from "vitest"

import {
  createEmptyLearningRecap,
  groupRecapByFramework,
  inferFrameworkFromConcept,
  recordActionConcept,
  recordEventConcept,
  recordJobRedesign,
  recordMissionCompleted,
} from "../lib/learning-recap"

describe("learning recap", () => {
  it("deduplicates entries by id", () => {
    let recap = createEmptyLearningRecap()
    recap = recordActionConcept(recap, "stabilize", "Poder de clientes + ejecución")
    recap = recordActionConcept(recap, "stabilize", "Poder de clientes + ejecución")

    expect(recap.entries).toHaveLength(1)
  })

  it("groups concepts by framework without duplicates", () => {
    let recap = createEmptyLearningRecap()
    recap = recordActionConcept(recap, "motivate", "Herzberg · motivación")
    recap = recordJobRedesign(recap, "support-analyst", "Enriquecimiento del puesto", "Enriquecimiento del puesto")
    recap = recordMissionCompleted(recap, "people-design", "Diseño de puesto + motivación", "Ordenar personas al escalar")

    const groups = groupRecapByFramework(recap)
    const peopleGroup = groups.find((group) => group.framework === "Diseño de puesto + motivación")

    expect(peopleGroup?.concepts).toHaveLength(3)
  })

  it("infers frameworks from event concepts", () => {
    expect(inferFrameworkFromConcept("Negociación y retención: Herzberg distingue higiene salarial de motivación real del puesto.")).toBe(
      "Diseño de puesto + motivación",
    )
    expect(inferFrameworkFromConcept("Ansoff + innovación")).toBe("BCG + portafolio")
  })

  it("records events and actions with distinct sources", () => {
    let recap = createEmptyLearningRecap()
    recap = recordEventConcept(recap, "fx-gap-1", "Gestión macro + tesorería: equilibrar liquidez.")

    expect(recap.entries[0]?.source).toBe("event")
    expect(recap.entries[0]?.framework).toBe("Cultura + estructura + cambio")
  })
})
