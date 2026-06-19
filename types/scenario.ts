export type ScenarioId =

  | "core_pressure"

  | "ai_innovation"

  | "portfolio_expansion"

  | "governance_compliance"

  | "regional_structure"



export interface ScenarioProfile {

  /** Madurez de procesos y control interno (0-100) */

  processMaturity: number

  /** Ritmo de ejecución y entrega (0-100) */

  executionPace: number

  /** Carga operativa y fricción del sistema (0-100) */

  operationalLoad: number

}



export interface ScenarioData {

  id: ScenarioId

  name: string

  subtitle: string

  description: string

  /** Contexto narrativo de arranque del ciclo */

  openingHook: string

  /** Objetivo principal del ciclo */

  chapterMission: string

  profile: ScenarioProfile

  initiatives: string[]

  risks: string[]

  learningFocus: string[]

  icon: "core" | "ai" | "growth" | "governance" | "structure"

  accent: string

}



export const SCENARIOS: Record<ScenarioId, ScenarioData> = {

  core_pressure: {

    id: "core_pressure",

    name: "Core al límite: GAUS mp",

    subtitle: "Escalabilidad, incidentes y roadmap en tensión",

    description:

      "GAUS mp crece más rápido que su arquitectura: incidentes, deuda técnica y clientes que piden estabilidad sin pausar el roadmap.",

    openingHook:

      "GAUS mp llegó al límite de escalabilidad. Estabilizar frena el roadmap; rediseñar frena lo visible para el mercado.",

    chapterMission:

      "Equilibrar confiabilidad de GAUS mp, roadmap comercial y capacidad del equipo. Ninguna palanca mejora todo a la vez.",

    profile: { processMaturity: 76, executionPace: 58, operationalLoad: 52 },

    initiatives: ["Estabilización del core", "Release crítico", "Retención de cuentas"],

    risks: ["Congelar el roadmap", "Meses sin updates visibles", "Escaladas de clientes"],

    learningFocus: ["Poder de clientes", "Ejecución", "Negocio core"],

    icon: "core",

    accent: "#0ea5e9",

  },

  ai_innovation: {

    id: "ai_innovation",

    name: "Ventana de IA",

    subtitle: "Oportunidad de innovación sin gobierno listo",

    description:

      "Hay oportunidad en IA y automatización, pero procesos, datos y sponsors todavía no están alineados para escalar sin riesgo.",

    openingHook:

      "El mercado empuja pilotos de IA y el equipo quiere experimentar, pero la base operativa todavía no está lista para escalar sin perder control de datos y prioridades.",

    chapterMission:

      "Convertir entusiasmo en pilotos gobernados: innovar sin dispersar foco ni saltear controles básicos.",

    profile: { processMaturity: 48, executionPace: 64, operationalLoad: 70 },

    initiatives: ["Pilotos de IA", "Automatización", "Aprendizaje validado"],

    risks: ["IA sin control", "Dispersión de foco", "Choque cultural"],

    learningFocus: ["Cambio", "Innovación", "Gobernanza"],

    icon: "ai",

    accent: "#f97316",

  },

  portfolio_expansion: {

    id: "portfolio_expansion",

    name: "Ecosistema GAUS en expansión",

    subtitle: "Crecer sin desbalancear el portafolio",

    description:

      "Hay tracción para nuevos canales y servicios del ecosistema, pero cada apuesta nueva tensiona capacidad, foco comercial y coherencia de marca.",

    openingHook:

      "El ecosistema GAUS despierta interés comercial. Cada canal nuevo compite con el core por la misma capacidad de entrega y por el foco estratégico.",

    chapterMission:

      "Expandir portafolio sin cannibalizar el core ni agotar al equipo con frentes simultáneos.",

    profile: { processMaturity: 60, executionPace: 68, operationalLoad: 58 },

    initiatives: ["Ecosistema GAUS", "Nuevos canales", "Validación comercial"],

    risks: ["Canibalización", "Capacidad limitada", "Señales confusas"],

    learningFocus: ["BCG", "Ansoff", "Portafolio"],

    icon: "growth",

    accent: "#06b6d4",

  },

  governance_compliance: {

    id: "governance_compliance",

    name: "Gobernanza y cumplimiento",

    subtitle: "SSN, ISO 27001 y controles al centro",

    description:

      "Presión regulatoria y comercial obliga a formalizar controles, trazabilidad y responsables sin frenar la operación de forma permanente.",

    openingHook:

      "SSN e ISO 27001 exigen evidencia y responsables claros. Formalizar controles consume capacidad que hoy sale a releases, soporte y ventas.",

    chapterMission:

      "Instalar gobernanza real: controles con dueño y evidencia, sin convertir la operación en burocracia permanente.",

    profile: { processMaturity: 72, executionPace: 44, operationalLoad: 78 },

    initiatives: ["ISO 27001", "Controles SSN", "Seguridad de la información"],

    risks: ["Auditoría adversa", "Demoras por burocracia", "Controles vacíos"],

    learningFocus: ["Gobernanza", "Riesgo", "Cumplimiento"],

    icon: "governance",

    accent: "#8b5cf6",

  },

  regional_structure: {

    id: "regional_structure",

    name: "Expansión con estructura tensa",

    subtitle: "Nuevos mercados, misma estructura funcional",

    description:

      "Colinet Trotta puede abrir frentes regionales y apoyarse en ITware, pero la coordinación entre áreas empieza a quedar corta para la ambición.",

    openingHook:

      "ITware y nuevos mercados amplían el alcance, pero la estructura funcional no coordina áreas al ritmo que pide la expansión.",

    chapterMission:

      "Crecer en nuevos frentes sin que la coordinación entre áreas se vuelva el cuello de botella permanente.",

    profile: { processMaturity: 54, executionPace: 50, operationalLoad: 65 },

    initiatives: ["Expansión regional", "ITware", "Rediseño de estructura"],

    risks: ["Coordinación débil", "Cuellos de botella", "Dependencia de socios"],

    learningFocus: ["Estructura", "Delegación", "Expansión"],

    icon: "structure",

    accent: "#6366f1",

  },

}



export const SCENARIO_LIST = Object.values(SCENARIOS)

