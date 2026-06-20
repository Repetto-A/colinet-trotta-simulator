import type { ScenarioId } from "./scenario"
import type { Season } from "./initiatives"
import type { BusinessGameState } from "./business-game"

export type SetbackEventType =
  | "client_escalation"
  | "regulatory_change"
  | "security_audit"
  | "competitor_move"
  | "talent_churn"
  | "vendor_blocker"
  | "delivery_bottleneck"
  | "ai_incident"
  | "fx_gap"
  | "salary_parity"
  | "training_gap"

export type FortuneEventType =
  | "client_renewal"
  | "talent_referral"
  | "efficiency_breakthrough"
  | "subsidy_grant"
  | "partnership_win"

export type EventType = SetbackEventType | FortuneEventType

export type EventPolarity = "fortune" | "setback"

export interface EnvironmentalEvent {
  id: string
  type: EventType
  name: string
  description: string
  polarity?: EventPolarity
  severity: "low" | "medium" | "high" | "critical"
  effects: {
    clientSatisfactionChange?: number
    executionSpeedChange?: number
    teamCapacityChange?: number
    processControlChange?: number
    sustainabilityChange?: number
    yieldMultiplier?: number
    moneyChange?: number
  }
  mitigationCost?: number
  mitigationEffectiveness?: number
  canMitigate: boolean
  duration: number
  learningConcept?: string
}

export interface EventProbability {
  eventType: EventType
  probability: number
  seasons: Season[]
  scenarios: ScenarioId[]
}

export const EVENT_PROBABILITIES: EventProbability[] = [
  {
    eventType: "client_escalation",
    probability: 0.42,
    seasons: ["spring", "summer", "autumn", "winter"],
    scenarios: ["core_pressure", "portfolio_expansion"],
  },
  {
    eventType: "regulatory_change",
    probability: 0.28,
    seasons: ["summer", "autumn", "winter"],
    scenarios: ["governance_compliance", "core_pressure", "regional_structure"],
  },
  {
    eventType: "security_audit",
    probability: 0.3,
    seasons: ["autumn", "winter"],
    scenarios: ["governance_compliance", "core_pressure"],
  },
  {
    eventType: "competitor_move",
    probability: 0.33,
    seasons: ["spring", "summer", "autumn"],
    scenarios: ["portfolio_expansion", "core_pressure", "regional_structure"],
  },
  {
    eventType: "talent_churn",
    probability: 0.26,
    seasons: ["summer", "autumn"],
    scenarios: ["ai_innovation", "regional_structure", "portfolio_expansion"],
  },
  {
    eventType: "vendor_blocker",
    probability: 0.22,
    seasons: ["spring", "summer", "autumn"],
    scenarios: ["regional_structure", "portfolio_expansion"],
  },
  {
    eventType: "delivery_bottleneck",
    probability: 0.35,
    seasons: ["summer", "autumn", "winter"],
    scenarios: ["core_pressure", "ai_innovation", "portfolio_expansion", "governance_compliance", "regional_structure"],
  },
  {
    eventType: "ai_incident",
    probability: 0.18,
    seasons: ["spring", "summer"],
    scenarios: ["ai_innovation", "core_pressure"],
  },
  {
    eventType: "fx_gap",
    probability: 0.24,
    seasons: ["summer", "autumn", "winter"],
    scenarios: ["core_pressure", "portfolio_expansion", "regional_structure", "governance_compliance"],
  },
  {
    eventType: "salary_parity",
    probability: 0.22,
    seasons: ["spring", "summer", "autumn", "winter"],
    scenarios: ["core_pressure", "ai_innovation", "regional_structure", "portfolio_expansion"],
  },
  {
    eventType: "training_gap",
    probability: 0.26,
    seasons: ["spring", "summer", "autumn"],
    scenarios: ["ai_innovation", "portfolio_expansion", "core_pressure", "governance_compliance"],
  },
]

export const EVENTS: Record<SetbackEventType, Record<string, EnvironmentalEvent>> = {
  client_escalation: {
    light: {
      id: "client-escalation-light",
      type: "client_escalation",
      name: "Pedido urgente de cliente clave",
      description: "Una aseguradora relevante pide adelantar funcionalidades y soporte prioritario.",
      severity: "low",
      effects: { clientSatisfactionChange: -8, executionSpeedChange: -6, moneyChange: 40 },
      canMitigate: true,
      mitigationCost: 60,
      mitigationEffectiveness: 0.55,
      duration: 1,
    },
    moderate: {
      id: "client-escalation-moderate",
      type: "client_escalation",
      name: "Escalada comercial",
      description: "Un cliente importante cuestiona plazos, calidad y gobernanza del roadmap.",
      severity: "medium",
      effects: { clientSatisfactionChange: -18, executionSpeedChange: -12, processControlChange: -8, moneyChange: -40 },
      canMitigate: true,
      mitigationCost: 110,
      mitigationEffectiveness: 0.6,
      duration: 2,
    },
    severe: {
      id: "client-escalation-severe",
      type: "client_escalation",
      name: "Riesgo de churn enterprise",
      description: "La cuenta más grande amenaza con frenar renovaciones si no se estabiliza la operación.",
      severity: "high",
      effects: { clientSatisfactionChange: -28, executionSpeedChange: -18, processControlChange: -10, moneyChange: -120 },
      canMitigate: true,
      mitigationCost: 180,
      mitigationEffectiveness: 0.65,
      duration: 2,
    },
  },
  regulatory_change: {
    light: {
      id: "regulatory-change-light",
      type: "regulatory_change",
      name: "Nueva circular de la SSN",
      description: "Aparecen ajustes menores de trazabilidad y reporting.",
      severity: "low",
      effects: { processControlChange: -8, executionSpeedChange: -4 },
      canMitigate: true,
      mitigationCost: 70,
      mitigationEffectiveness: 0.6,
      duration: 1,
    },
    moderate: {
      id: "regulatory-change-moderate",
      type: "regulatory_change",
      name: "Cambio regulatorio relevante",
      description: "La SSN exige más evidencia de controles, procesos y tiempos de respuesta.",
      severity: "medium",
      effects: { processControlChange: -14, executionSpeedChange: -10, moneyChange: -60 },
      canMitigate: true,
      mitigationCost: 120,
      mitigationEffectiveness: 0.65,
      duration: 2,
    },
    severe: {
      id: "regulatory-change-severe",
      type: "regulatory_change",
      name: "Presión regulatoria crítica",
      description: "Un cambio normativo obliga a reordenar producto, soporte y evidencia operativa.",
      severity: "critical",
      effects: { processControlChange: -22, executionSpeedChange: -14, clientSatisfactionChange: -8, moneyChange: -150 },
      canMitigate: true,
      mitigationCost: 210,
      mitigationEffectiveness: 0.7,
      duration: 3,
    },
  },
  security_audit: {
    light: {
      id: "security-audit-light",
      type: "security_audit",
      name: "Checklist de auditoría",
      description: "El cliente pide evidencias básicas de seguridad e ISO 27001.",
      severity: "low",
      effects: { processControlChange: -6, clientSatisfactionChange: -5 },
      canMitigate: true,
      mitigationCost: 65,
      mitigationEffectiveness: 0.55,
      duration: 1,
    },
    moderate: {
      id: "security-audit-moderate",
      type: "security_audit",
      name: "Auditoría de seguridad",
      description: "Aparecen desvíos de proceso y faltan evidencias sobre accesos y continuidad.",
      severity: "medium",
      effects: { processControlChange: -16, clientSatisfactionChange: -10, moneyChange: -80 },
      canMitigate: true,
      mitigationCost: 130,
      mitigationEffectiveness: 0.65,
      duration: 2,
    },
    severe: {
      id: "security-audit-severe",
      type: "security_audit",
      name: "Hallazgo crítico de auditoría",
      description: "La debilidad de controles pone en duda la confianza de mercado y el cierre comercial.",
      severity: "high",
      effects: { processControlChange: -24, clientSatisfactionChange: -16, executionSpeedChange: -10, moneyChange: -170 },
      canMitigate: true,
      mitigationCost: 220,
      mitigationEffectiveness: 0.7,
      duration: 2,
    },
  },
  competitor_move: {
    light: {
      id: "competitor-move-light",
      type: "competitor_move",
      name: "Lanzamiento rival menor",
      description: "Un competidor anuncia mejoras incrementales y presiona comparaciones comerciales.",
      severity: "low",
      effects: { clientSatisfactionChange: -6, moneyChange: -20 },
      canMitigate: true,
      mitigationCost: 55,
      mitigationEffectiveness: 0.5,
      duration: 1,
    },
    moderate: {
      id: "competitor-move-moderate",
      type: "competitor_move",
      name: "Competidor gana narrativa",
      description: "El mercado empieza a percibir a otro proveedor como más moderno o más rápido.",
      severity: "medium",
      effects: { clientSatisfactionChange: -14, moneyChange: -60, executionSpeedChange: -6 },
      canMitigate: true,
      mitigationCost: 95,
      mitigationEffectiveness: 0.55,
      duration: 2,
    },
    severe: {
      id: "competitor-move-severe",
      type: "competitor_move",
      name: "Oferta agresiva del mercado",
      description: "Un jugador fuerte combina precio, velocidad y seguridad para disputar cuentas clave.",
      severity: "high",
      effects: { clientSatisfactionChange: -22, moneyChange: -110, executionSpeedChange: -10 },
      canMitigate: true,
      mitigationCost: 150,
      mitigationEffectiveness: 0.6,
      duration: 2,
    },
  },
  talent_churn: {
    light: {
      id: "talent-churn-light",
      type: "talent_churn",
      name: "Desgaste del equipo",
      description: "El equipo muestra cansancio y baja de foco por tensión entre operación e innovación.",
      severity: "low",
      effects: { teamCapacityChange: -8, executionSpeedChange: -5 },
      canMitigate: true,
      mitigationCost: 50,
      mitigationEffectiveness: 0.55,
      duration: 1,
    },
    moderate: {
      id: "talent-churn-moderate",
      type: "talent_churn",
      name: "Rotación incipiente",
      description: "Personas clave evalúan irse por sobrecarga y falta de claridad.",
      severity: "medium",
      effects: { teamCapacityChange: -16, executionSpeedChange: -10, clientSatisfactionChange: -6 },
      canMitigate: true,
      mitigationCost: 100,
      mitigationEffectiveness: 0.6,
      duration: 2,
    },
    severe: {
      id: "talent-churn-severe",
      type: "talent_churn",
      name: "Salida de referente crítico",
      description: "La pérdida de una persona clave genera cuello de botella y retrabajo.",
      severity: "high",
      effects: { teamCapacityChange: -24, executionSpeedChange: -14, processControlChange: -8, moneyChange: -90 },
      canMitigate: true,
      mitigationCost: 145,
      mitigationEffectiveness: 0.65,
      duration: 2,
    },
  },
  vendor_blocker: {
    light: {
      id: "vendor-blocker-light",
      type: "vendor_blocker",
      name: "Demora de partner",
      description: "Una dependencia externa retrasa una integración menor de ITware o terceros.",
      severity: "low",
      effects: { executionSpeedChange: -6, moneyChange: -20 },
      canMitigate: true,
      mitigationCost: 45,
      mitigationEffectiveness: 0.45,
      duration: 1,
    },
    moderate: {
      id: "vendor-blocker-moderate",
      type: "vendor_blocker",
      name: "Bloqueo de proveedor",
      description: "La dependencia externa frena entregas y genera fricción con clientes.",
      severity: "medium",
      effects: { executionSpeedChange: -12, clientSatisfactionChange: -10, moneyChange: -60 },
      canMitigate: true,
      mitigationCost: 90,
      mitigationEffectiveness: 0.55,
      duration: 2,
    },
    severe: {
      id: "vendor-blocker-severe",
      type: "vendor_blocker",
      name: "Dependencia crítica expuesta",
      description: "La empresa descubre que su velocidad depende demasiado de un tercero no alineado.",
      severity: "high",
      effects: { executionSpeedChange: -20, clientSatisfactionChange: -14, processControlChange: -8, moneyChange: -100 },
      canMitigate: true,
      mitigationCost: 140,
      mitigationEffectiveness: 0.6,
      duration: 2,
    },
  },
  delivery_bottleneck: {
    light: {
      id: "delivery-bottleneck-light",
      type: "delivery_bottleneck",
      name: "Baja de throughput",
      description: "Las prioridades compiten entre sí y se pierde velocidad de ejecución.",
      severity: "low",
      effects: { executionSpeedChange: -8, teamCapacityChange: -5 },
      canMitigate: true,
      mitigationCost: 55,
      mitigationEffectiveness: 0.5,
      duration: 1,
    },
    moderate: {
      id: "delivery-bottleneck-moderate",
      type: "delivery_bottleneck",
      name: "Cuello de botella funcional",
      description: "La estructura funcional ya no coordina bien cambios cross-equipo.",
      severity: "medium",
      effects: { executionSpeedChange: -14, teamCapacityChange: -8, clientSatisfactionChange: -8 },
      canMitigate: true,
      mitigationCost: 100,
      mitigationEffectiveness: 0.6,
      duration: 2,
    },
    severe: {
      id: "delivery-bottleneck-severe",
      type: "delivery_bottleneck",
      name: "Colapso de ejecución",
      description: "El exceso de frentes abiertos rompe la coordinación y aparece retrabajo en cadena.",
      severity: "critical",
      effects: { executionSpeedChange: -24, teamCapacityChange: -14, clientSatisfactionChange: -12, processControlChange: -10, moneyChange: -80 },
      canMitigate: true,
      mitigationCost: 160,
      mitigationEffectiveness: 0.7,
      duration: 3,
    },
  },
  ai_incident: {
    light: {
      id: "ai-incident-light",
      type: "ai_incident",
      name: "Piloto de IA ambiguo",
      description: "El experimento no tiene hipótesis ni responsable claro.",
      severity: "low",
      effects: { teamCapacityChange: -6, processControlChange: -4 },
      canMitigate: true,
      mitigationCost: 60,
      mitigationEffectiveness: 0.5,
      duration: 1,
    },
    moderate: {
      id: "ai-incident-moderate",
      type: "ai_incident",
      name: "Incidente de gobernanza en IA",
      description: "El piloto toca datos sensibles y genera dudas sobre seguridad, dueños y trazabilidad.",
      severity: "medium",
      effects: { processControlChange: -14, clientSatisfactionChange: -8, moneyChange: -50 },
      canMitigate: true,
      mitigationCost: 110,
      mitigationEffectiveness: 0.65,
      duration: 2,
    },
    severe: {
      id: "ai-incident-severe",
      type: "ai_incident",
      name: "Riesgo reputacional por IA",
      description: "La empresa quiere innovar rápido, pero sin controles el mercado interpreta improvisación.",
      severity: "high",
      effects: { processControlChange: -20, clientSatisfactionChange: -14, executionSpeedChange: -8, moneyChange: -130 },
      canMitigate: true,
      mitigationCost: 180,
      mitigationEffectiveness: 0.7,
      duration: 2,
    },
  },
  fx_gap: {
    light: {
      id: "fx-gap-light",
      type: "fx_gap",
      name: "Brecha cambiaria leve",
      description: "Licencias en USD subieron; el presupuesto en pesos ajusta más lento que la realidad del mercado.",
      severity: "low",
      effects: { moneyChange: -35, executionSpeedChange: -4 },
      canMitigate: true,
      mitigationCost: 55,
      mitigationEffectiveness: 0.55,
      duration: 1,
      learningConcept: "Equilibrio financiero: cubrir costos ahora vs. postergar inversión.",
    },
    moderate: {
      id: "fx-gap-moderate",
      type: "fx_gap",
      name: "Atraso cambiario",
      description:
        "El desfasaje entre tipo de cambio oficial y real tensiona nube, servicios importados y salarios indexados.",
      severity: "medium",
      effects: { moneyChange: -80, executionSpeedChange: -8, teamCapacityChange: -6 },
      canMitigate: true,
      mitigationCost: 120,
      mitigationEffectiveness: 0.6,
      duration: 2,
      learningConcept: "Priorizar qué pagar en USD, renegociar contratos o absorber margen sin frenar el core.",
    },
    severe: {
      id: "fx-gap-severe",
      type: "fx_gap",
      name: "Shock de tipo de cambio",
      description: "Un salto abrupto obliga a reordenar caja, inversiones y expectativas salariales en el mismo trimestre.",
      severity: "high",
      effects: { moneyChange: -150, executionSpeedChange: -12, teamCapacityChange: -10, clientSatisfactionChange: -6 },
      canMitigate: true,
      mitigationCost: 200,
      mitigationEffectiveness: 0.65,
      duration: 3,
      learningConcept: "Gestión macro + tesorería: equilibrar liquidez, motivación del equipo y continuidad operativa.",
    },
  },
  salary_parity: {
    light: {
      id: "salary-parity-light",
      type: "salary_parity",
      name: "Consultas de paritaria",
      description: "El equipo pregunta cómo se comparan sus salarios con el mercado y con otros roles internos.",
      severity: "low",
      effects: { teamCapacityChange: -6, sustainabilityChange: -4 },
      canMitigate: true,
      mitigationCost: 50,
      mitigationEffectiveness: 0.55,
      duration: 1,
      learningConcept: "Transparencia salarial y expectativas: comunicar criterios antes de que suba la tensión.",
    },
    moderate: {
      id: "salary-parity-moderate",
      type: "salary_parity",
      name: "Presión paritaria sectorial",
      description: "La paritaria del sector empuja ajustes salariales mientras la empresa intenta sostener margen e inversión.",
      severity: "medium",
      effects: { moneyChange: -70, teamCapacityChange: -10, executionSpeedChange: -4 },
      canMitigate: true,
      mitigationCost: 115,
      mitigationEffectiveness: 0.6,
      duration: 2,
      learningConcept: "Equilibrio macro-laboral: salarios, productividad e inversión compiten por la misma caja.",
    },
    severe: {
      id: "salary-parity-severe",
      type: "salary_parity",
      name: "Conflicto salarial abierto",
      description: "Referentes clave amenazan con irse si no hay respuesta paritaria creíble antes del cierre de ciclo.",
      severity: "high",
      effects: { moneyChange: -120, teamCapacityChange: -18, clientSatisfactionChange: -8, sustainabilityChange: -10 },
      canMitigate: true,
      mitigationCost: 185,
      mitigationEffectiveness: 0.65,
      duration: 2,
      learningConcept: "Negociación y retención: Herzberg distingue higiene salarial de motivación real del puesto.",
    },
  },
  training_gap: {
    light: {
      id: "training-gap-light",
      type: "training_gap",
      name: "Brecha de habilidades puntual",
      description: "Un área adopta una herramienta nueva y el equipo necesita capacitación formal para usarla bien.",
      severity: "low",
      effects: { executionSpeedChange: -6, processControlChange: -4 },
      canMitigate: true,
      mitigationCost: 45,
      mitigationEffectiveness: 0.5,
      duration: 1,
      learningConcept: "Capacitación oportuna: invertir en aprendizaje antes de escalar la iniciativa.",
    },
    moderate: {
      id: "training-gap-moderate",
      type: "training_gap",
      name: "Capacitación insuficiente",
      description: "Modernización e IA avanzan más rápido que el plan de formación; sube el retrabajo y los errores.",
      severity: "medium",
      effects: { executionSpeedChange: -12, teamCapacityChange: -8, processControlChange: -8, moneyChange: -40 },
      canMitigate: true,
      mitigationCost: 95,
      mitigationEffectiveness: 0.6,
      duration: 2,
      learningConcept: "Desarrollo de personas: alinear capacitación con estrategia y diseño de puestos.",
    },
    severe: {
      id: "training-gap-severe",
      type: "training_gap",
      name: "Equipo no listo para escalar",
      description: "La empresa quiere crecer, pero faltan competencias críticas y no hay ruta de aprendizaje clara.",
      severity: "high",
      effects: { executionSpeedChange: -18, teamCapacityChange: -14, clientSatisfactionChange: -10, processControlChange: -12 },
      canMitigate: true,
      mitigationCost: 155,
      mitigationEffectiveness: 0.65,
      duration: 3,
      learningConcept: "Plan de capacitación + rediseño de roles: formar y reorganizar al mismo tiempo.",
    },
  },
}

export const FORTUNE_EVENT_PROBABILITIES: EventProbability[] = [
  {
    eventType: "client_renewal",
    probability: 0.34,
    seasons: ["spring", "summer", "autumn", "winter"],
    scenarios: ["core_pressure", "portfolio_expansion", "governance_compliance"],
  },
  {
    eventType: "talent_referral",
    probability: 0.28,
    seasons: ["spring", "summer", "autumn"],
    scenarios: ["ai_innovation", "regional_structure", "core_pressure"],
  },
  {
    eventType: "efficiency_breakthrough",
    probability: 0.3,
    seasons: ["summer", "autumn", "winter"],
    scenarios: ["core_pressure", "governance_compliance", "portfolio_expansion"],
  },
  {
    eventType: "subsidy_grant",
    probability: 0.22,
    seasons: ["spring", "autumn", "winter"],
    scenarios: ["governance_compliance", "regional_structure", "ai_innovation"],
  },
  {
    eventType: "partnership_win",
    probability: 0.26,
    seasons: ["spring", "summer", "autumn"],
    scenarios: ["regional_structure", "portfolio_expansion", "ai_innovation"],
  },
]

export const FORTUNE_EVENTS: Record<FortuneEventType, Record<string, EnvironmentalEvent>> = {
  client_renewal: {
    light: {
      id: "client-renewal-light",
      type: "client_renewal",
      polarity: "fortune",
      name: "Renovación sin fricción",
      description: "Un cliente clave renueva antes de lo previsto y elogia la respuesta del equipo.",
      severity: "low",
      effects: { clientSatisfactionChange: 8, moneyChange: 35 },
      canMitigate: false,
      duration: 1,
      learningConcept: "Poder de clientes: cuando la confianza sube, el comercial deja de pelear cada release.",
    },
    moderate: {
      id: "client-renewal-moderate",
      type: "client_renewal",
      polarity: "fortune",
      name: "Cuenta enterprise ampliada",
      description: "Una aseguradora suma usuarios y abre espacio para upsell sin presionar plazos imposibles.",
      severity: "medium",
      effects: { clientSatisfactionChange: 14, executionSpeedChange: 6, moneyChange: 80 },
      canMitigate: false,
      duration: 2,
      learningConcept: "Retención: convertir estabilidad en expansión comercial.",
    },
    severe: {
      id: "client-renewal-severe",
      type: "client_renewal",
      polarity: "fortune",
      name: "Referencia pública del sector",
      description: "Un cliente enterprise recomienda GAUS mp en el mercado. Llegan consultas nuevas.",
      severity: "high",
      effects: { clientSatisfactionChange: 20, sustainabilityChange: 12, moneyChange: 140 },
      canMitigate: false,
      duration: 2,
      learningConcept: "Confianza de mercado: la señal externa valida la estrategia interna.",
    },
  },
  talent_referral: {
    light: {
      id: "talent-referral-light",
      type: "talent_referral",
      polarity: "fortune",
      name: "Llegada de refuerzo",
      description: "Un referido senior se suma con onboarding rápido y buen encaje cultural.",
      severity: "low",
      effects: { teamCapacityChange: 8, executionSpeedChange: 4 },
      canMitigate: false,
      duration: 1,
      learningConcept: "Herzberg: atraer talento también depende de cómo está diseñado el puesto.",
    },
    moderate: {
      id: "talent-referral-moderate",
      type: "talent_referral",
      polarity: "fortune",
      name: "Equipo técnico reforzado",
      description: "Dos perfiles clave cierran en la misma semana y despejan un cuello de botella.",
      severity: "medium",
      effects: { teamCapacityChange: 14, executionSpeedChange: 8, processControlChange: 4 },
      canMitigate: false,
      duration: 2,
    },
    severe: {
      id: "talent-referral-severe",
      type: "talent_referral",
      polarity: "fortune",
      name: "Talento que multiplica al equipo",
      description: "Un líder técnico trae prácticas que elevan la capacidad de todo el squad.",
      severity: "high",
      effects: { teamCapacityChange: 18, executionSpeedChange: 10, sustainabilityChange: 8 },
      canMitigate: false,
      duration: 2,
      learningConcept: "Capacidad organizacional: una pieza bien ubicada mueve varios KPIs a la vez.",
    },
  },
  efficiency_breakthrough: {
    light: {
      id: "efficiency-light",
      type: "efficiency_breakthrough",
      polarity: "fortune",
      name: "Quick win operativo",
      description: "El equipo elimina retrabajo en un flujo crítico sin proyecto largo.",
      severity: "low",
      effects: { executionSpeedChange: 10, processControlChange: 4 },
      canMitigate: false,
      duration: 1,
    },
    moderate: {
      id: "efficiency-moderate",
      type: "efficiency_breakthrough",
      polarity: "fortune",
      name: "Automatización que libera capacidad",
      description: "Una mejora de proceso devuelve horas al equipo cada semana.",
      severity: "medium",
      effects: { executionSpeedChange: 16, teamCapacityChange: 8, processControlChange: 6 },
      canMitigate: false,
      duration: 2,
    },
    severe: {
      id: "efficiency-severe",
      type: "efficiency_breakthrough",
      polarity: "fortune",
      name: "Salto de productividad",
      description: "Varias áreas alinean criterios y el sistema entrega más con la misma gente.",
      severity: "high",
      effects: { executionSpeedChange: 22, teamCapacityChange: 12, clientSatisfactionChange: 6 },
      canMitigate: false,
      duration: 2,
      learningConcept: "Ejecución: la eficiencia real viene de foco y diseño, no de más horas.",
    },
  },
  subsidy_grant: {
    light: {
      id: "subsidy-light",
      type: "subsidy_grant",
      polarity: "fortune",
      name: "Incentivo a la innovación",
      description: "Un programa sectorial reconoce inversiones en modernización y devuelve parte del gasto.",
      severity: "low",
      effects: { moneyChange: 55, sustainabilityChange: 4 },
      canMitigate: false,
      duration: 1,
    },
    moderate: {
      id: "subsidy-moderate",
      type: "subsidy_grant",
      polarity: "fortune",
      name: "Subsidio aprobado",
      description: "La empresa accede a fondos para seguridad o modernización sin diluir el roadmap.",
      severity: "medium",
      effects: { moneyChange: 110, processControlChange: 6, sustainabilityChange: 6 },
      canMitigate: false,
      duration: 1,
    },
    severe: {
      id: "subsidy-severe",
      type: "subsidy_grant",
      polarity: "fortune",
      name: "Financiamiento estratégico",
      description: "Un programa público-privado cofinancia un frente clave del ecosistema GAUS.",
      severity: "high",
      effects: { moneyChange: 180, processControlChange: 10, executionSpeedChange: 8 },
      canMitigate: false,
      duration: 1,
    },
  },
  partnership_win: {
    light: {
      id: "partnership-light",
      type: "partnership_win",
      polarity: "fortune",
      name: "Acuerdo comercial menor",
      description: "ITware o un canal aliado abre una puerta regional sin consumir toda la capacidad estratégica.",
      severity: "low",
      effects: { clientSatisfactionChange: 6, sustainabilityChange: 6, moneyChange: 40 },
      canMitigate: false,
      duration: 1,
    },
    moderate: {
      id: "partnership-moderate",
      type: "partnership_win",
      polarity: "fortune",
      name: "Alianza que acelera go-to-market",
      description: "Un socio integrador trae pipeline calificado y reduce fricción comercial.",
      severity: "medium",
      effects: { clientSatisfactionChange: 10, executionSpeedChange: 8, moneyChange: 70 },
      canMitigate: false,
      duration: 2,
      learningConcept: "Ansoff: crecer con socios puede ser más rápido que abrir frentes propios.",
    },
    severe: {
      id: "partnership-severe",
      type: "partnership_win",
      polarity: "fortune",
      name: "Socio estratégico ancla",
      description: "Un acuerdo regional valida el ecosistema y trae visibilidad en el sector.",
      severity: "high",
      effects: { clientSatisfactionChange: 14, sustainabilityChange: 14, executionSpeedChange: 6, moneyChange: 120 },
      canMitigate: false,
      duration: 2,
    },
  },
}

export function getEventPolarity(event: EnvironmentalEvent): EventPolarity {
  if (event.polarity) return event.polarity
  return "setback"
}

function pickWeightedEvent(
  pool: EventProbability[],
  state: BusinessGameState | undefined,
  weightAdjust?: (entry: EventProbability, state: BusinessGameState | undefined) => number,
): EventProbability {
  const weighted = pool.map((entry) => {
    let weight = entry.probability
    if (weightAdjust) weight += weightAdjust(entry, state)
    return { entry, weight: Math.max(0.05, weight) }
  })
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * totalWeight
  let selectedEvent = weighted[0].entry
  for (const item of weighted) {
    roll -= item.weight
    if (roll <= 0) {
      selectedEvent = item.entry
      break
    }
  }
  return selectedEvent
}

function rollSeverity(): "light" | "moderate" | "severe" {
  const severityRoll = Math.random()
  if (severityRoll < 0.55) return "light"
  if (severityRoll < 0.88) return "moderate"
  return "severe"
}

export function generateRandomEvent(
  scenario: ScenarioId,
  season: Season,
  recentEventTypes: EventType[] = [],
  state?: BusinessGameState,
): EnvironmentalEvent | null {
  const setbackPool = EVENT_PROBABILITIES.filter(
    (entry) =>
      entry.scenarios.includes(scenario) &&
      entry.seasons.includes(season) &&
      !recentEventTypes.slice(-2).includes(entry.eventType),
  )
  const fortunePool = FORTUNE_EVENT_PROBABILITIES.filter(
    (entry) =>
      entry.scenarios.includes(scenario) &&
      entry.seasons.includes(season) &&
      !recentEventTypes.slice(-2).includes(entry.eventType),
  )

  if (setbackPool.length === 0 && fortunePool.length === 0) return null

  let gate = 0.34
  if (state) {
    if (state.clientSatisfaction < 40 || state.processControl < 40 || state.teamCapacity < 40) gate = 0.42
    if (state.activeModifiers.length > 0) gate = 0.22
    if (state.clientSatisfaction >= 70 && state.teamCapacity >= 65) gate = 0.36
  }
  if (Math.random() > gate) return null

  const rollFortune = fortunePool.length > 0 && (setbackPool.length === 0 || Math.random() < 0.4)

  if (rollFortune) {
    const selected = pickWeightedEvent(fortunePool, state, (entry, gameState) => {
      let bonus = 0
      if (!gameState) return bonus
      if (entry.eventType === "client_renewal" && gameState.clientSatisfaction >= 55) bonus += 0.1
      if (entry.eventType === "talent_referral" && gameState.teamCapacity >= 50) bonus += 0.08
      if (entry.eventType === "efficiency_breakthrough" && gameState.executionSpeed >= 55) bonus += 0.1
      if (entry.eventType === "subsidy_grant" && gameState.processControl >= 55) bonus += 0.08
      if (entry.eventType === "partnership_win" && gameState.sustainability >= 50) bonus += 0.08
      return bonus
    })
    return FORTUNE_EVENTS[selected.eventType as FortuneEventType][rollSeverity()]
  }

  const selected = pickWeightedEvent(setbackPool, state, (entry, gameState) => {
    let bonus = 0
    if (!gameState) return bonus
    if (entry.eventType === "client_escalation" && gameState.clientSatisfaction < 50) bonus += 0.12
    if (entry.eventType === "talent_churn" && gameState.teamCapacity < 45) bonus += 0.1
    if (entry.eventType === "security_audit" && gameState.sustainability < 50) bonus += 0.1
    if (entry.eventType === "fx_gap" && gameState.money < 200) bonus += 0.12
    if (entry.eventType === "salary_parity" && gameState.teamCapacity < 50) bonus += 0.1
    if (entry.eventType === "training_gap" && gameState.executionSpeed > 60) bonus += 0.1
    return bonus
  })

  return EVENTS[selected.eventType as SetbackEventType][rollSeverity()]
}

export interface EventResponseLabels {
  /** Acción temática al invertir presupuesto */
  mitigate: string
  /** Acción temática al no hacer nada / asumir */
  accept: string
  /** Frase corta bajo el botón de mitigar */
  mitigateDetail: string
  /** Botón en cartas favorables */
  fortune?: string
}

const EVENT_RESPONSE_COPY: Record<EventType, Omit<EventResponseLabels, "mitigateDetail"> & { mitigateVerb: string; acceptVerb: string }> = {
  salary_parity: {
    mitigateVerb: "Ajustar bandas salariales",
    acceptVerb: "Dejar subir la tensión",
    mitigate: "",
    accept: "",
  },
  fx_gap: {
    mitigateVerb: "Cubrir con reservas de caja",
    acceptVerb: "Trasladar el costo al cliente",
    mitigate: "",
    accept: "",
  },
  client_escalation: {
    mitigateVerb: "Escalar con atención VIP",
    acceptVerb: "Dejar en cola de soporte",
    mitigate: "",
    accept: "",
  },
  regulatory_change: {
    mitigateVerb: "Contratar consultoría SSN",
    acceptVerb: "Presentar lo mínimo exigible",
    mitigate: "",
    accept: "",
  },
  security_audit: {
    mitigateVerb: "Auditoría express y parches",
    acceptVerb: "Confiar en la evidencia actual",
    mitigate: "",
    accept: "",
  },
  competitor_move: {
    mitigateVerb: "Lanzar contraoferta comercial",
    acceptVerb: "No reaccionar todavía",
    mitigate: "",
    accept: "",
  },
  talent_churn: {
    mitigateVerb: "Retener con paquete y rol",
    acceptVerb: "Repartir carga al resto",
    mitigate: "",
    accept: "",
  },
  vendor_blocker: {
    mitigateVerb: "Pagar fee y desbloquear",
    acceptVerb: "Workaround feo en producción",
    mitigate: "",
    accept: "",
  },
  delivery_bottleneck: {
    mitigateVerb: "Sumar consultores externos",
    acceptVerb: "Prometer y apretar fechas",
    mitigate: "",
    accept: "",
  },
  ai_incident: {
    mitigateVerb: "Parche de emergencia en GAUS",
    acceptVerb: "Seguir vendiendo igual",
    mitigate: "",
    accept: "",
  },
  training_gap: {
    mitigateVerb: "Bootcamp relámpago al equipo",
    acceptVerb: "Aprender en producción",
    mitigate: "",
    accept: "",
  },
  client_renewal: {
    mitigateVerb: "Capitalizar con el cliente",
    acceptVerb: "Agradecer y seguir",
    fortune: "Capitalizar con el cliente",
    mitigate: "",
    accept: "",
  },
  talent_referral: {
    mitigateVerb: "Contratar al referido ya",
    acceptVerb: "Archivar para más adelante",
    fortune: "Sumar al referido al equipo",
    mitigate: "",
    accept: "",
  },
  efficiency_breakthrough: {
    mitigateVerb: "Institucionalizar la mejora",
    acceptVerb: "Celebrar y seguir igual",
    fortune: "Institucionalizar la mejora",
    mitigate: "",
    accept: "",
  },
  subsidy_grant: {
    mitigateVerb: "Reinvertir el subsidio",
    acceptVerb: "Guardar en caja",
    fortune: "Reinvertir el subsidio",
    mitigate: "",
    accept: "",
  },
  partnership_win: {
    mitigateVerb: "Activar el acuerdo ya",
    acceptVerb: "Firmar y olvidar",
    fortune: "Activar el acuerdo ya",
    mitigate: "",
    accept: "",
  },
}

export function getEventResponseLabels(event: EnvironmentalEvent): EventResponseLabels {
  const copy = EVENT_RESPONSE_COPY[event.type]
  const cost = event.mitigationCost ?? 0
  const pct = Math.round((event.mitigationEffectiveness ?? 0) * 100)

  if (getEventPolarity(event) === "fortune") {
    return {
      mitigate: copy.fortune ?? copy.mitigateVerb,
      accept: copy.acceptVerb,
      mitigateDetail: "",
      fortune: copy.fortune ?? "Capitalizar oportunidad",
    }
  }

  return {
    mitigate: event.canMitigate && cost > 0 ? `${copy.mitigateVerb} · $${cost}` : copy.mitigateVerb,
    accept: copy.acceptVerb,
    mitigateDetail:
      event.canMitigate && cost > 0
        ? `Suavizás ~${pct}% del impacto. Sale $${cost} de caja.`
        : "",
    fortune: copy.fortune,
  }
}
