import type { BusinessGameState } from "@/types/business-game"
import { SCENARIOS, type ScenarioId } from "@/types/scenario"

export interface StoryBeat {
  chapter: number
  title: string
  brief: string
  objective: string
  risk: string
}

const getMainRisk = (state: BusinessGameState): string => {
  const tensions = [
    { key: "clientes", value: state.clientSatisfaction, risk: "Clientes sensibles a cualquier caída de entrega." },
    { key: "confianza", value: state.sustainability, risk: "Confianza de mercado debilitada por señal inconsistente." },
    { key: "procesos", value: state.processControl, risk: "Gobernanza frágil: la operación depende de heroicidades." },
    { key: "equipo", value: state.teamCapacity, risk: "Capacidad del equipo al límite: sube el retrabajo." },
    {
      key: "ejecucion",
      value: state.executionSpeed,
      risk: "Velocidad de ejecución en descenso: se acumulan cuellos de botella.",
    },
  ]

  tensions.sort((a, b) => a.value - b.value)
  return tensions[0].risk
}

export const getStoryBeat = (state: BusinessGameState, scenarioId: ScenarioId | null): StoryBeat => {
  const turn = state.turn
  const dynamicRisk = getMainRisk(state)
  const scenario = scenarioId ? SCENARIOS[scenarioId] : null

  if (turn <= 2) {
    return {
      chapter: 1,
      title: "Aterrizaje en terreno inestable",
      brief:
        scenario?.openingHook ??
        `Asumiste el comité en “${scenario?.name ?? "Colinet Trotta"}”. Los primeros turnos definen si la empresa juega a la defensiva o toma iniciativa.`,
      objective:
        scenario?.chapterMission ??
        (scenarioId === "core_pressure"
          ? "Entender el límite de escalabilidad de GAUS mp antes de prometer más releases o rediseños en paralelo."
          : "Construir una base mínima de control y capacidad sin frenar la operación."),
      risk: dynamicRisk,
    }
  }

  if (turn <= 5) {
    return {
      chapter: 2,
      title: scenarioId === "core_pressure" ? "Estabilizar, modernizar o seguir shippeando" : "Presión cruzada",
      brief:
        scenarioId === "core_pressure"
          ? "Cada sprint con funcionalidades nuevas tensiona más la base. Estabilizar implica congelar el roadmap comercial; modernizar implica semanas con menos releases visibles mientras se rediseña arquitectura."
          : "Clientes, regulación y agenda de crecimiento empiezan a competir por los mismos recursos. Cada decisión abre un frente y cierra otro.",
      objective:
        scenarioId === "core_pressure"
          ? "Elegir qué tradeoff asumís: confiabilidad inmediata, escalabilidad de mediano plazo o velocidad comercial. No podés maximizar las tres."
          : "Priorizar sin dispersión: proteger core y sostener consistencia de ejecución.",
      risk: dynamicRisk,
    }
  }

  if (turn <= 8) {
    return {
      chapter: 3,
      title: "Punto de inflexión",
      brief:
        scenarioId === "core_pressure"
          ? "Los incidentes, el silencio del roadmap o el costo del rediseño empiezan a ser visibles para clientes y equipo. Lo acumulado en arquitectura ya no se puede postergar sin consecuencias."
          : "La empresa entra en una fase donde los efectos acumulados se hacen visibles. El sistema premia coherencia y castiga improvisación.",
      objective:
        scenarioId === "core_pressure"
          ? "Sostener la apuesta elegida sin romper SLAs ni quemar al equipo en parches eternos."
          : "Alinear portafolio, estructura y cultura para evitar desgaste operacional.",
      risk: dynamicRisk,
    }
  }

  return {
    chapter: 4,
    title: "Cierre del ciclo",
    brief: "Llegó el momento de consolidar. Lo que ordenaste en estrategia y ejecución se reflejará en resultados finales.",
    objective: "Cerrar con equilibrio: mantener confianza, control y margen económico.",
    risk: dynamicRisk,
  }
}
