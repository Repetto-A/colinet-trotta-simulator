"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Trophy, CheckCircle2, Clock } from "lucide-react"
import type { LearningMission } from "@/lib/learning-objectives"

interface MissionPanelProps {
  missions: LearningMission[]
  currentWeek: number
}

export default function MissionPanel({ missions, currentWeek }: MissionPanelProps) {
  const activeMissions = missions.filter((m) => m.status === "active")
  const completedMissions = missions.filter((m) => m.status === "completed")

  const getMissionIcon = (type: string) => {
    switch (type) {
      case "context":
        return "🌐"
      case "portfolio":
        return "🧩"
      case "growth":
        return "🚀"
      case "execution":
        return "⚙️"
      default:
        return "🎯"
    }
  }

  const getProgressColor = (progress: number, maxProgress: number) => {
    const percentage = (progress / maxProgress) * 100
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50 border-2 border-sky-300 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-lg">🎯</div>
          <h3 className="text-xl font-bold text-slate-900">Misiones Activas</h3>
        </div>
        {completedMissions.length > 0 && (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
            <Trophy className="w-4 h-4 mr-2" />
            {completedMissions.length} / 4
          </Badge>
        )}
      </div>

      {activeMissions.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-semibold mb-2">¡Misiones completadas!</p>
          <p className="text-sm">Nuevas misiones en el próximo ciclo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeMissions.map((mission) => {
            const progressPercentage = (mission.progress / mission.maxProgress) * 100
            const timePercentage = (mission.timeRemaining / Math.max(1, Number.parseInt(mission.timeLimit, 10))) * 100

            return (
              <Card
                key={mission.id}
                className="p-4 bg-white border-2 border-slate-200 hover:border-sky-300 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{getMissionIcon(mission.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 leading-tight">{mission.title}</h4>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                        ${mission.reward}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{mission.description}</p>
                    <p className="mt-2 text-xs font-medium text-sky-700">{mission.framework}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Avance: {mission.target}</span>
                      <span className="font-semibold text-slate-900">
                        {mission.progress} / {mission.maxProgress}
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${getProgressColor(mission.progress, mission.maxProgress)} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>Tiempo restante</span>
                    </div>
                    <span className={`font-semibold ${timePercentage < 30 ? "text-red-600" : "text-slate-900"}`}>
                      {mission.timeRemaining} turnos
                    </span>
                  </div>
                </div>

                {progressPercentage >= 100 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Objetivo listo. Avanzá el turno para capitalizar el aprendizaje.</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </Card>
  )
}
