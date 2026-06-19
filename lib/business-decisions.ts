export interface BusinessActionDefinition {
  id: string
  title: string
  description: string
  concept: string
  cost: number
  executionSpeedChange: number
  teamCapacityChange: number
  clientSatisfactionChange: number
  sustainabilityChange: number
  processControlChange: number
  warning?: string
  recommended: (state: {
    executionSpeed: number
    teamCapacity: number
    processControl: number
    money: number
    clientSatisfaction: number
    sustainability: number
  }) => boolean
}

export const BUSINESS_ACTIONS: BusinessActionDefinition[] = [
  {
    id: "stabilize",
    title: "Estabilizar GAUS mp",
    description:
      "Congelar funcionalidades no críticas, atacar bugs P1/P2 y sostener SLAs con clientes enterprise. Es la palanca de corto plazo cuando la plataforma falla en producción.",
    concept: "Poder de clientes + ejecución",
    cost: 58,
    executionSpeedChange: -4,
    teamCapacityChange: -6,
    clientSatisfactionChange: 16,
    sustainabilityChange: 8,
    processControlChange: 12,
    warning: "Protege confianza ahora, pero frena roadmap comercial y posterga el rediseño arquitectónico.",
    recommended: (state) => state.clientSatisfaction < 55 || state.processControl < 55,
  },
  {
    id: "modernize",
    title: "Modernizar arquitectura",
    description:
      "Rediseñar módulos críticos, mejorar escalabilidad y bajar el costo de cambio. Implica semanas con menos releases visibles mientras el equipo migra servicios y refactoriza la base monolítica.",
    concept: "Cambio + tecnología",
    cost: 72,
    executionSpeedChange: 12,
    teamCapacityChange: -4,
    clientSatisfactionChange: -6,
    sustainabilityChange: 6,
    processControlChange: -4,
    warning: "Inversión correcta a mediano plazo; hoy comercial puede leerlo como abandono del roadmap.",
    recommended: (state) => state.executionSpeed < 45 || state.money > 550,
  },
  {
    id: "govern",
    title: "Fortalecer gobernanza",
    description: "Formalizar controles, responsables y criterios para SSN, seguridad e iniciativas transversales.",
    concept: "Gobernanza + estructura",
    cost: 52,
    executionSpeedChange: -8,
    teamCapacityChange: 4,
    clientSatisfactionChange: 6,
    sustainabilityChange: 14,
    processControlChange: 18,
    warning: "Demasiado control puede frenar velocidad si el equipo ya está cansado.",
    recommended: (state) => state.sustainability < 60 || state.processControl < 50,
  },
  {
    id: "innovate",
    title: "Reservar capacidad para IA",
    description: "Crear espacio para pilotos de IA, experimentación y aprendizaje validado.",
    concept: "Ansoff + innovación",
    cost: 68,
    executionSpeedChange: 10,
    teamCapacityChange: 14,
    clientSatisfactionChange: -5,
    sustainabilityChange: 5,
    processControlChange: -6,
    warning: "Si la base está inestable, la organización vive esto como caos.",
    recommended: (state) => state.teamCapacity < 55 || state.executionSpeed < 55,
  },
  {
    id: "tune",
    title: "Ajuste táctico",
    description: "Micro-optimización sin cooldown: refuerza la métrica más débil y tensiona la más fuerte.",
    concept: "Operación fina",
    cost: 28,
    executionSpeedChange: 0,
    teamCapacityChange: 0,
    clientSatisfactionChange: 0,
    sustainabilityChange: 0,
    processControlChange: 0,
    recommended: (state) => state.money >= 28,
  },
  {
    id: "motivate",
    title: "Paquete de motivación",
    description: "Reconocimiento, beneficios flexibles y claridad de carrera para retener talento clave.",
    concept: "Herzberg · motivación",
    cost: 48,
    executionSpeedChange: 0,
    teamCapacityChange: 14,
    clientSatisfactionChange: 4,
    sustainabilityChange: 6,
    processControlChange: 0,
    warning: "Si solo pagás más sin rediseñar puestos, el efecto se diluye en unos turnos.",
    recommended: (state) => state.teamCapacity < 50,
  },
  {
    id: "culture_bbq",
    title: "Asado de integración",
    description: "Rituales informales entre áreas para bajar fricción, reforzar pertenencia y escuchar al equipo.",
    concept: "Cultura organizacional",
    cost: 32,
    executionSpeedChange: -3,
    teamCapacityChange: 8,
    clientSatisfactionChange: 0,
    sustainabilityChange: 10,
    processControlChange: 4,
    warning: "Mejora clima y comunicación, pero no reemplaza procesos o puestos mal diseñados.",
    recommended: (state) => state.sustainability < 55,
  },
  {
    id: "train_team",
    title: "Plan de capacitación",
    description: "Formación formal en procesos, herramientas y criterios de calidad para cerrar brechas antes de escalar.",
    concept: "Desarrollo de personas",
    cost: 44,
    executionSpeedChange: 6,
    teamCapacityChange: 10,
    clientSatisfactionChange: 2,
    sustainabilityChange: 4,
    processControlChange: 8,
    warning: "Capacitar sin rediseñar puestos deja al equipo con skills nuevas en roles viejos.",
    recommended: (state) => state.processControl < 55 || state.executionSpeed > 58,
  },
  {
    id: "delegate_fronts",
    title: "Delegar frentes",
    description: "Distribuir ownership de iniciativas entre líderes locales con mandatos claros y espacio de decisión.",
    concept: "Delegación + estructura",
    cost: 50,
    executionSpeedChange: 12,
    teamCapacityChange: 10,
    clientSatisfactionChange: 4,
    sustainabilityChange: -2,
    processControlChange: -10,
    warning: "Sin supervisión y criterios compartidos, la velocidad sube pero el control y la alineación bajan.",
    recommended: (state) => state.executionSpeed < 52 || state.teamCapacity < 52,
  },
  {
    id: "situational_leadership",
    title: "Liderazgo situacional",
    description: "Capacitar a mandos medios para adaptar estilo según madurez del equipo y urgencia del frente.",
    concept: "Liderazgo situacional",
    cost: 46,
    executionSpeedChange: 4,
    teamCapacityChange: 12,
    clientSatisfactionChange: 2,
    sustainabilityChange: 12,
    processControlChange: 2,
    warning: "Adaptar el estilo a cada situación consume tiempo de líderes; no reemplaza procesos o puestos mal diseñados.",
    recommended: (state) => state.teamCapacity < 50,
  },
]
