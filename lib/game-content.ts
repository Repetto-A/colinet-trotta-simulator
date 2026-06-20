export const WELCOME_CONTENT = {
  brand: "Colinet Trotta",
  hero: {
    eyebrow: "Simulación · 12 turnos · trade-offs reales",
    headline: "Tu empresa entra en presión.",
    headlineAccent: "12 turnos para decidir qué sostiene el negocio.",
    subhead:
      "Sos dirección en Colinet Trotta. Clientes, caja, equipo y cumplimiento compiten a la vez. Cada palanca que movés tensiona otra.",
    promise: "Aprendé gestión tomando decisiones, no leyendo teoría muerta.",
    footer: "No hay respuestas únicas: cada decisión mueve todo el sistema.",
  },
  tensionPillars: [
    {
      id: "clients",
      label: "Clientes",
      value: "54%",
      hint: "Enterprise exige señales claras",
      tone: "warning" as const,
    },
    {
      id: "cash",
      label: "Caja",
      value: "$630",
      hint: "Margen justo para abrir frentes",
      tone: "neutral" as const,
    },
    {
      id: "regulation",
      label: "Regulación",
      value: "SSN",
      hint: "Gobernanza bajo la lupa",
      tone: "warning" as const,
    },
    {
      id: "team",
      label: "Equipo",
      value: "50%",
      hint: "Capacidad al límite",
      tone: "critical" as const,
    },
  ],
  frameworkChips: [
    "Porter",
    "BCG",
    "Ansoff",
    "Riesgo",
    "Mercado",
    "Estrategia",
    "Herzberg",
    "Gobernanza",
  ],
  cta: {
    start: "Iniciar simulación",
    startHint: "Elegí mandato · ~12 turnos",
    continue: "Retomar ciclo",
    newCycle: "Nuevo mandato",
  },
  savePanel: {
    title: "Tu ciclo en curso",
    scenarioLabel: "Mandato",
    turnLabel: "Turno",
    budgetLabel: "Caja",
    savedLabel: "Guardado",
  },
  preview: {
    caption: "Vista previa del tablero: KPIs, equipos y decisiones estratégicas.",
    kpiLabels: ["Presupuesto", "Clientes", "Control", "Capacidad", "Velocidad"],
  },
} as const

/** @deprecated Usar WELCOME_CONTENT */
export const GAME_CONTENT = {
  title: `${WELCOME_CONTENT.brand}: Decisiones que Importan`,
  eyebrow: WELCOME_CONTENT.hero.eyebrow,
  subtitle: WELCOME_CONTENT.hero.subhead,
  startCta: WELCOME_CONTENT.cta.start,
  footer: WELCOME_CONTENT.hero.footer,
}

/** @deprecated Usar WELCOME_CONTENT.tensionPillars */
export const WELCOME_CARDS = WELCOME_CONTENT.tensionPillars.map((p) => ({
  title: p.label,
  description: p.hint,
  accent: "text-sky-600",
}))

export const FRAMEWORK_LABELS = WELCOME_CONTENT.frameworkChips
