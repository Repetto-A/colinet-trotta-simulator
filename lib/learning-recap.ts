export type LearningSource = "action" | "event" | "job-redesign" | "mission"

export interface LearningEntry {
  id: string
  concept: string
  framework: string
  source: LearningSource
}

export interface LearningRecap {
  entries: LearningEntry[]
}

export interface FrameworkGroup {
  framework: string
  concepts: string[]
}

export function createEmptyLearningRecap(): LearningRecap {
  return { entries: [] }
}

export function inferFrameworkFromConcept(concept: string): string {
  const lower = concept.toLowerCase()

  if (
    lower.includes("herzberg") ||
    lower.includes("motivación") ||
    lower.includes("puesto") ||
    lower.includes("amplitud") ||
    lower.includes("enriquecimiento") ||
    lower.includes("capacitación") ||
    lower.includes("desarrollo de personas")
  ) {
    return "Diseño de puesto + motivación"
  }

  if (
    lower.includes("porter") ||
    lower.includes("cliente") ||
    lower.includes("competencia") ||
    lower.includes("mercado") ||
    lower.includes("macro-laboral")
  ) {
    return "Porter + oportunidades/amenazas"
  }

  if (lower.includes("ansoff") || lower.includes("portafolio") || lower.includes("bcg") || lower.includes("innovación")) {
    return "BCG + portafolio"
  }

  if (
    lower.includes("gobernanza") ||
    lower.includes("cultura") ||
    lower.includes("cambio") ||
    lower.includes("estructura") ||
    lower.includes("tesorería") ||
    lower.includes("ejecución") ||
    lower.includes("operación")
  ) {
    return "Cultura + estructura + cambio"
  }

  return "Conceptos aplicados"
}

function addEntry(recap: LearningRecap, entry: LearningEntry): LearningRecap {
  if (recap.entries.some((existing) => existing.id === entry.id)) return recap
  return { entries: [...recap.entries, entry] }
}

export function recordActionConcept(recap: LearningRecap, actionId: string, concept: string): LearningRecap {
  return addEntry(recap, {
    id: `action:${actionId}`,
    concept,
    framework: inferFrameworkFromConcept(concept),
    source: "action",
  })
}

export function recordEventConcept(recap: LearningRecap, eventId: string, concept: string): LearningRecap {
  return addEntry(recap, {
    id: `event:${eventId}`,
    concept,
    framework: inferFrameworkFromConcept(concept),
    source: "event",
  })
}

export function recordJobRedesign(
  recap: LearningRecap,
  positionId: string,
  fixConcept: string,
  focusLabel: string,
): LearningRecap {
  return addEntry(recap, {
    id: `job:${positionId}`,
    concept: `${fixConcept} · ${focusLabel}`,
    framework: "Diseño de puesto + motivación",
    source: "job-redesign",
  })
}

export function recordMissionCompleted(
  recap: LearningRecap,
  missionId: string,
  framework: string,
  title: string,
): LearningRecap {
  return addEntry(recap, {
    id: `mission:${missionId}`,
    concept: title,
    framework,
    source: "mission",
  })
}

export function groupRecapByFramework(recap: LearningRecap): FrameworkGroup[] {
  const grouped = new Map<string, Set<string>>()

  for (const entry of recap.entries) {
    if (!grouped.has(entry.framework)) {
      grouped.set(entry.framework, new Set())
    }
    grouped.get(entry.framework)!.add(entry.concept)
  }

  return Array.from(grouped.entries()).map(([framework, concepts]) => ({
    framework,
    concepts: Array.from(concepts),
  }))
}
