import type { BusinessGameState } from "@/types/business-game"

export interface LearningMission {
  id: string
  title: string
  description: string
  target: string
  progress: number
  maxProgress: number
  timeLimit: string
  timeRemaining: number
  reward: number
  status: "active" | "completed" | "failed"
  type: "context" | "portfolio" | "growth" | "execution"
  framework: string
}

export function createInitialMissions(): LearningMission[] {
  return [
    {
      id: "context-diagnosis",
      title: "Diagnóstico competitivo",
      description: "Elevá satisfacción de clientes y confianza de mercado para leer bien el entorno y responder a la presión externa.",
      target: "Clientes 65 + Confianza 65",
      progress: 0,
      maxProgress: 100,
      timeLimit: "6 turnos",
      timeRemaining: 6,
      reward: 180,
      status: "active",
      type: "context",
      framework: "Porter + oportunidades/amenazas",
    },
    {
      id: "portfolio-balance",
      title: "Balancear portafolio",
      description: "Asigná iniciativas distintas sin repetir una misma apuesta para construir equilibrio entre core, crecimiento y soporte.",
      target: "3 iniciativas distintas o 1 completada",
      progress: 0,
      maxProgress: 3,
      timeLimit: "8 turnos",
      timeRemaining: 8,
      reward: 220,
      status: "active",
      type: "portfolio",
      framework: "BCG + portafolio",
    },
    {
      id: "execution-change",
      title: "Ejecutar sin romper la empresa",
      description: "Mejorá procesos y capacidad manteniendo velocidad aceptable para que el cambio no se coma la operación.",
      target: "Control 60 + Velocidad 50",
      progress: 0,
      maxProgress: 100,
      timeLimit: "10 turnos",
      timeRemaining: 10,
      reward: 250,
      status: "active",
      type: "execution",
      framework: "Cultura + estructura + cambio",
    },
    {
      id: "people-design",
      title: "Ordenar personas al escalar",
      description: "Rediseñá puestos mal armados mientras la empresa suma iniciativas, para que motivación y capacidad no se pierdan.",
      target: "2 puestos rediseñados",
      progress: 0,
      maxProgress: 2,
      timeLimit: "10 turnos",
      timeRemaining: 10,
      reward: 200,
      status: "active",
      type: "execution",
      framework: "Diseño de puesto + motivación",
    },
  ]
}

export function updateMissions(missions: LearningMission[], state: BusinessGameState, previousTurn: number): LearningMission[] {
  const assigned = state.initiativeSlots.filter((slot) => slot.type !== "unassigned")
  const uniqueInitiatives = new Set(assigned.map((slot) => slot.type)).size

  return missions.map((mission) => {
    if (mission.status !== "active") return mission

    let progress = mission.progress
    let status: LearningMission["status"] = mission.status
    let timeRemaining = mission.timeRemaining

    if (state.turn > previousTurn) {
      timeRemaining = Math.max(0, timeRemaining - 1)
      if (timeRemaining === 0 && progress < mission.maxProgress) {
        status = "failed"
      }
    }

    if (mission.id === "context-diagnosis") {
      progress = Math.min(100, Math.round(((state.clientSatisfaction + state.sustainability) / 130) * 100))
      if (state.clientSatisfaction >= 65 && state.sustainability >= 65) {
        progress = 100
        status = "completed"
      }
    }

    if (mission.id === "portfolio-balance") {
      progress = Math.min(mission.maxProgress, Math.max(uniqueInitiatives, state.initiativesCompleted))
      if (uniqueInitiatives >= 3 || state.initiativesCompleted >= 1) {
        status = "completed"
        progress = mission.maxProgress
      }
    }

    if (mission.id === "execution-change") {
      progress = Math.min(100, Math.round(((state.processControl + state.executionSpeed) / 110) * 100))
      if (state.processControl >= 60 && state.executionSpeed >= 50) {
        progress = 100
        status = "completed"
      }
    }

    if (mission.id === "people-design") {
      const fixedCount = state.jobPositions.filter((position) => position.fixed).length
      progress = Math.min(mission.maxProgress, fixedCount)
      if (fixedCount >= mission.maxProgress) {
        status = "completed"
        progress = mission.maxProgress
      }
    }

    return {
      ...mission,
      progress,
      status,
      timeRemaining,
    }
  })
}
