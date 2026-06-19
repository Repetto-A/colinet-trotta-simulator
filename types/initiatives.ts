export type Season = "spring" | "summer" | "autumn" | "winter"
export type InitiativeType = "wheat" | "soy" | "corn" | "sunflower" | "fallow" | "vetch" | "rye" | "clover"

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
  wheat: {
    id: "wheat",
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
    goodPredecessors: ["rye", "clover"],
    badPredecessors: ["wheat"],
  },
  corn: {
    id: "corn",
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
    goodPredecessors: ["wheat", "vetch"],
    badPredecessors: ["corn", "sunflower"],
  },
  soy: {
    id: "soy",
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
    goodPredecessors: ["wheat", "corn", "rye"],
    badPredecessors: ["soy"],
  },
  sunflower: {
    id: "sunflower",
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
    goodPredecessors: ["soy", "clover"],
    badPredecessors: ["sunflower", "corn"],
  },
  vetch: {
    id: "vetch",
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
  rye: {
    id: "rye",
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
  clover: {
    id: "clover",
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
  fallow: {
    id: "fallow",
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
  if (!previousInitiative || previousInitiative === "fallow") {
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
