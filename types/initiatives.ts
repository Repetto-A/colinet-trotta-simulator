import type { ScenarioId } from "./scenario"

export type Season = "spring" | "summer" | "autumn" | "winter"
export type InitiativeType = "core_stabilization" | "itware_integration" | "ecosystem_expansion" | "iso_program" | "unassigned" | "ai_pilot" | "tech_debt_reduction" | "culture_program"

export interface PhenologicalStage {
  name: string
  description: string
  duration: number
  criticalNeeds: {
    nitrogen?: boolean
    irrigation?: boolean
    pestControl?: boolean
  }
  alert?: string
}

export interface InitiativeData {
  id: InitiativeType
  name: string
  sowingSeason: Season[]
  harvestSeason: Season[]
  growthDuration: number
  stages: PhenologicalStage[]
  executionNeed: number
  teamFocusNeed: number
  baseYield: number
  color: string
  isSupportInitiative?: boolean
  buildsTeamCapacity?: boolean
  goodPredecessors?: InitiativeType[]
  badPredecessors?: InitiativeType[]
}

export interface RotationEffect {
  type: "bonus" | "penalty" | "neutral"
  message: string
  processControlChange: number
  teamCapacityChange: number
  yieldMultiplier: number
}

export const SEASONS: Record<Season, { name: string; months: string; description: string }> = {
  spring: { name: "Diagnóstico", months: "Ciclo 1-3", description: "Leer contexto, priorizar fuerzas y definir foco" },
  summer: { name: "Alineación", months: "Ciclo 4-6", description: "Conseguir sponsors, reglas y capacidad" },
  autumn: { name: "Ejecución", months: "Ciclo 7-9", description: "Mover iniciativas sin romper la operación" },
  winter: { name: "Revisión", months: "Ciclo 10-12", description: "Medir resultados, absorber aprendizaje y corregir rumbo" },
}

export const INITIATIVES: Record<InitiativeType, InitiativeData> = {
  core_stabilization: {
    id: "core_stabilization",
    name: "Estabilización de GAUS mp",
    sowingSeason: ["spring", "summer", "autumn"],
    harvestSeason: ["winter"],
    growthDuration: 10,
    stages: [
      {
        name: "Diagnóstico de escalabilidad",
        description: "Mapear cuellos de botella, incidentes en picos de carga y riesgo de pérdida de clientes",
        duration: 2,
        criticalNeeds: { irrigation: true },
      },
      {
        name: "Congelar roadmap comercial",
        description: "Priorizar hotfixes y confiabilidad; comunicar a cuentas clave el tradeoff de corto plazo",
        duration: 3,
        criticalNeeds: { nitrogen: true },
        alert: "Sin capacidad dedicada, la estabilización se vuelve parches eternos y la deuda técnica sigue creciendo.",
      },
      {
        name: "Release crítico de confianza",
        description: "Entregar versión estable que recupere SLAs y reduzca escaladas de soporte",
        duration: 2,
        criticalNeeds: { irrigation: true },
      },
      {
        name: "Seguimiento de cuentas enterprise",
        description: "Renovar confianza con clientes estratégicos y acordar expectativas de roadmap realista",
        duration: 3,
        criticalNeeds: {},
      },
    ],
    executionNeed: 72,
    teamFocusNeed: 68,
    baseYield: 1200,
    color: "#38bdf8",
    goodPredecessors: ["tech_debt_reduction", "culture_program"],
    badPredecessors: ["core_stabilization"],
  },
  ecosystem_expansion: {
    id: "ecosystem_expansion",
    name: "Expansión del Ecosistema GAUS",
    sowingSeason: ["summer", "autumn"],
    harvestSeason: ["winter"],
    growthDuration: 10,
    stages: [
      { name: "Dimensionamiento de oportunidad", description: "Detectar vectores reales de crecimiento", duration: 2, criticalNeeds: {} },
      { name: "Piloto comercial", description: "Validar tracción con clientes", duration: 2, criticalNeeds: { nitrogen: true }, alert: "La expansión está quitando foco del core del negocio." },
      { name: "Despliegue comercial", description: "Salida a mercado y soporte inicial", duration: 2, criticalNeeds: { irrigation: true } },
      { name: "Escalado disciplinado", description: "Mantener foco y métricas alineadas", duration: 4, criticalNeeds: {} },
    ],
    executionNeed: 78,
    teamFocusNeed: 82,
    baseYield: 1500,
    color: "#84cc16",
    goodPredecessors: ["core_stabilization", "ai_pilot"],
    badPredecessors: ["ecosystem_expansion", "iso_program"],
  },
  itware_integration: {
    id: "itware_integration",
    name: "Integración de ITware",
    sowingSeason: ["spring", "summer", "autumn"],
    harvestSeason: ["winter"],
    growthDuration: 9,
    stages: [
      { name: "Revisión de socio", description: "Aclarar dependencia y aporte de valor", duration: 2, criticalNeeds: {} },
      { name: "Hoja de ruta compartida", description: "Alinear prioridades y expectativas", duration: 2, criticalNeeds: {} },
      { name: "Ejecución conjunta", description: "Entregar en conjunto sin ciclos de culpa", duration: 2, criticalNeeds: { irrigation: true }, alert: "La integración con socios necesita gobernanza activa o sube el riesgo de dependencia." },
      { name: "Ajuste del servicio", description: "Convertir el complemento en ventaja competitiva", duration: 3, criticalNeeds: {} },
    ],
    executionNeed: 60,
    teamFocusNeed: 52,
    baseYield: 950,
    color: "#10b981",
    buildsTeamCapacity: true,
    goodPredecessors: ["core_stabilization", "ecosystem_expansion", "tech_debt_reduction"],
    badPredecessors: ["itware_integration"],
  },
  iso_program: {
    id: "iso_program",
    name: "Programa ISO 27001",
    sowingSeason: ["spring", "summer"],
    harvestSeason: ["winter"],
    growthDuration: 9,
    stages: [
      { name: "Alcance y responsables", description: "Definir fronteras y responsabilidades", duration: 2, criticalNeeds: {} },
      { name: "Diseño de controles", description: "Traducir política en práctica operativa", duration: 3, criticalNeeds: { nitrogen: true } },
      { name: "Preparación de auditoría", description: "Evidencia, terceros y continuidad", duration: 2, criticalNeeds: { irrigation: true }, alert: "El programa ISO eleva la exigencia sobre evidencia y disciplina de procesos." },
      { name: "Conversión en confianza", description: "Transformar cumplimiento en señal comercial", duration: 2, criticalNeeds: {} },
    ],
    executionNeed: 58,
    teamFocusNeed: 66,
    baseYield: 900,
    color: "#f59e0b",
    goodPredecessors: ["itware_integration", "culture_program"],
    badPredecessors: ["iso_program", "ecosystem_expansion"],
  },
  ai_pilot: {
    id: "ai_pilot",
    name: "Piloto de IA habilitadora",
    sowingSeason: ["spring", "summer"],
    harvestSeason: ["autumn", "winter"],
    growthDuration: 6,
    stages: [
      { name: "Selección de caso de uso", description: "Empezar donde el riesgo esté contenido", duration: 2, criticalNeeds: {} },
      { name: "Piloto con límites operativos", description: "Aprender sin perder control", duration: 2, criticalNeeds: {} },
      { name: "Prueba de adopción", description: "Decidir si escalar o cortar", duration: 2, criticalNeeds: {}, alert: "El piloto de IA necesita datos claros, responsables definidos y límites de seguridad." },
    ],
    executionNeed: 45,
    teamFocusNeed: 40,
    baseYield: 700,
    color: "#8b5cf6",
    isSupportInitiative: true,
    buildsTeamCapacity: true,
    goodPredecessors: [],
    badPredecessors: [],
  },
  tech_debt_reduction: {
    id: "tech_debt_reduction",
    name: "Reducción de deuda técnica",
    sowingSeason: ["spring", "autumn", "winter"],
    harvestSeason: ["summer", "winter"],
    growthDuration: 6,
    stages: [
      { name: "Inventario de deuda", description: "Hacer visible el costo oculto de la base monolítica y los módulos que frenan escalabilidad", duration: 3, criticalNeeds: {} },
      { name: "Refactor y simplificación", description: "Bajar costo de cambio para futuros releases; implica menos features visibles durante el ciclo", duration: 3, criticalNeeds: {}, alert: "Rediseñar arquitectura rinde a mediano plazo, aunque comercial extrañe el silencio del roadmap." },
    ],
    executionNeed: 40,
    teamFocusNeed: 55,
    baseYield: 650,
    color: "#475569",
    isSupportInitiative: true,
    goodPredecessors: [],
    badPredecessors: [],
  },
  culture_program: {
    id: "culture_program",
    name: "Programa de cultura y cambio",
    sowingSeason: ["spring", "autumn"],
    harvestSeason: ["winter"],
    growthDuration: 5,
    stages: [
      { name: "Narrativa y patrocinio", description: "Explicar por qué el cambio importa", duration: 2, criticalNeeds: {} },
      { name: "Prácticas y rituales", description: "Volver visible el cambio en la operación diaria", duration: 3, criticalNeeds: {}, alert: "Los cambios culturales solo sostienen cuando liderazgo modela lo que pide." },
    ],
    executionNeed: 35,
    teamFocusNeed: 48,
    baseYield: 620,
    color: "#14b8a6",
    isSupportInitiative: true,
    buildsTeamCapacity: true,
    goodPredecessors: [],
    badPredecessors: [],
  },
  unassigned: {
    id: "unassigned",
    name: "Capacidad sin asignar",
    sowingSeason: ["spring", "summer", "autumn", "winter"],
    harvestSeason: ["spring", "summer", "autumn", "winter"],
    growthDuration: 0,
    stages: [],
    executionNeed: 0,
    teamFocusNeed: 0,
    baseYield: 0,
    color: "#a8a29e",
  },
}

export function calculateRotationEffect(previousInitiative: InitiativeType | null, newInitiative: InitiativeType): RotationEffect {
  if (!previousInitiative || previousInitiative === "unassigned") {
    return {
      type: "neutral",
      message: "Primera iniciativa asignada a esta capacidad",
      processControlChange: 0,
      teamCapacityChange: 0,
      yieldMultiplier: 1,
    }
  }

  const newInitiativeData = INITIATIVES[newInitiative]
  const prevInitiativeData = INITIATIVES[previousInitiative]

  if (prevInitiativeData.isSupportInitiative) {
    return {
      type: "bonus",
      message: `${prevInitiativeData.name} dejó mejores condiciones para ${newInitiativeData.name}`,
      processControlChange: 10,
      teamCapacityChange: prevInitiativeData.buildsTeamCapacity ? 12 : 6,
      yieldMultiplier: 1.15,
    }
  }

  if (previousInitiative === newInitiative) {
    return {
      type: "penalty",
      message: `Repetir ${newInitiativeData.name} en la misma capacidad genera fatiga organizacional y ceguera operativa.`,
      processControlChange: -12,
      teamCapacityChange: -10,
      yieldMultiplier: 0.78,
    }
  }

  if (newInitiativeData.goodPredecessors?.includes(previousInitiative)) {
    return {
      type: "bonus",
      message: `${prevInitiativeData.name} preparó una transición sana hacia ${newInitiativeData.name}`,
      processControlChange: 8,
      teamCapacityChange: 6,
      yieldMultiplier: 1.18,
    }
  }

  if (newInitiativeData.badPredecessors?.includes(previousInitiative)) {
    return {
      type: "penalty",
      message: `${prevInitiativeData.name} dejó tensiones sin resolver antes de lanzar ${newInitiativeData.name}`,
      processControlChange: -8,
      teamCapacityChange: -5,
      yieldMultiplier: 0.86,
    }
  }

  return {
    type: "neutral",
    message: `Transición aceptable: ${prevInitiativeData.name} → ${newInitiativeData.name}`,
    processControlChange: 0,
    teamCapacityChange: 0,
    yieldMultiplier: 1,
  }
}

/** Copy claro para elegir frente (sin metáfora agrícola). */
export const INITIATIVE_GUIDE: Record<
  InitiativeType,
  { summary: string; tradeoff: string; whenItFits: string }
> = {
  core_stabilization: {
    summary: "Endurecer GAUS mp: menos incidentes, SLAs recuperados y clientes enterprise más tranquilos.",
    tradeoff: "Congelás parte del roadmap comercial mientras el equipo pelea la base técnica.",
    whenItFits: "Cuando la confiabilidad del core amenaza contratos o escaladas.",
  },
  ecosystem_expansion: {
    summary: "Abrir el ecosistema GAUS: pilotos comerciales, nuevos módulos y tracción fuera del core.",
    tradeoff: "Quita foco y capacidad del producto principal si no hay gobernanza de portafolio.",
    whenItFits: "Cuando hay demanda real de crecimiento y el core aguanta una apuesta paralela.",
  },
  itware_integration: {
    summary: "Ordenar la relación con ITware: roles, entregables conjuntos y menos fricción con socios.",
    tradeoff: "Integrar socios lleva tiempo de coordinación antes de verse en revenue.",
    whenItFits: "Cuando la dependencia o el caos con aliados frena entregas regionales.",
  },
  iso_program: {
    summary: "Programa ISO 27001: controles, evidencia y señal de confianza ante clientes y regulador.",
    tradeoff: "Eleva la exigencia documental y puede frenar cambios rápidos.",
    whenItFits: "Cuando cumplimiento o auditorías pesan más que velocidad pura.",
  },
  ai_pilot: {
    summary: "Piloto acotado de IA: aprender con límites, sin apostar todo el negocio.",
    tradeoff: "El retorno es aprendizaje y capacidad; no es un frente de revenue inmediato.",
    whenItFits: "Cuando querés innovar sin perder control operativo.",
  },
  tech_debt_reduction: {
    summary: "Bajar deuda técnica: inventario, refactor y base más barata de cambiar.",
    tradeoff: "Pocas novedades visibles para el mercado mientras limpiás por dentro.",
    whenItFits: "Cuando cada release cuesta más que antes y el equipo paga intereses técnicos.",
  },
  culture_program: {
    summary: "Cultura y cambio: narrativa, patrocinio y rituales que sostienen la transformación.",
    tradeoff: "No arregla solo incidentes ni revenue; prepara al equipo para lo que viene.",
    whenItFits: "Cuando hay resistencia, silos o fatiga después de muchos frentes.",
  },
  unassigned: {
    summary: "No asignar frente todavía: el equipo queda libre para absorber urgencias o esperar timing.",
    tradeoff: "No avanzás iniciativas estratégicas mientras la capacidad está ociosa.",
    whenItFits: "Cuando la caja o el equipo no dan para abrir otro frente ahora.",
  },
}

export type InitiativePhaseFit = "ideal" | "off_phase"

export function getInitiativePhaseFit(initiative: InitiativeData, season: Season): InitiativePhaseFit {
  if (initiative.id === "unassigned") return "ideal"
  return initiative.sowingSeason.includes(season) ? "ideal" : "off_phase"
}

/** Frentes que encajan con la narrativa del escenario (sugerencia, no obligación). */
export const SCENARIO_INITIATIVE_FITS: Record<ScenarioId, InitiativeType[]> = {
  core_pressure: ["core_stabilization", "tech_debt_reduction"],
  ai_innovation: ["ai_pilot", "ecosystem_expansion"],
  portfolio_expansion: ["ecosystem_expansion", "itware_integration"],
  governance_compliance: ["iso_program", "culture_program"],
  regional_structure: ["itware_integration", "ecosystem_expansion"],
}

export function listSelectableInitiatives(season: Season): InitiativeData[] {
  return Object.values(INITIATIVES).filter((item) => item.id !== "unassigned")
}

export function describeInitiativeNeeds(initiative: InitiativeData): string {
  if (initiative.id === "unassigned") return "Sin demanda extra"
  const exec = initiative.executionNeed
  const team = initiative.teamFocusNeed
  const execLabel = exec >= 70 ? "alta exigencia de ejecución" : exec >= 50 ? "ejecución moderada" : "ejecución contenida"
  const teamLabel = team >= 65 ? "equipo muy dedicado" : team >= 45 ? "foco de equipo medio" : "foco de equipo bajo"
  return `${execLabel} · ${teamLabel}`
}
