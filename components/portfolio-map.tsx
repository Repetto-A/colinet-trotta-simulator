"use client"

import { TEAM_SLOT_COUNT } from "@/lib/game-balance"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { INITIATIVES, SEASONS, type InitiativeType, type Season } from "@/types/initiatives"
import { CheckCircle2, Layers3, PlusCircle } from "lucide-react"

interface PortfolioMapProps {
  initiativeSlots: Array<{
    type: InitiativeType
    stageIndex: number
    stageProgress: number
    turnsInStage: number
    rotationMultiplier?: number
  }>
  onSlotClick: (index: number) => void
  currentSeason?: Season
}

export default function PortfolioMap({
  initiativeSlots,
  onSlotClick,
  currentSeason = "spring",
}: PortfolioMapProps) {
  const teamSlots = initiativeSlots.slice(0, TEAM_SLOT_COUNT)
  const busyCount = teamSlots.filter((slot) => slot.type !== "unassigned").length

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2.5 text-sm text-slate-700">
        <p>
          Tenés <strong>3 equipos</strong>. Cada uno puede llevar <strong>una iniciativa</strong> a la vez. Al
          completarla, el equipo queda libre para el siguiente frente.
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Fase del ciclo: {SEASONS[currentSeason].name} · {busyCount} equipo{busyCount === 1 ? "" : "s"} en marcha
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {teamSlots.map((slot, index) => {
          const initiative = INITIATIVES[slot.type]
          const activeStage = slot.type === "unassigned" ? null : initiative.stages[slot.stageIndex]
          const isEmpty = slot.type === "unassigned"
          const isFinalStage =
            !isEmpty && slot.stageIndex === initiative.stages.length - 1 && slot.stageProgress >= 70

          return (
            <button
              key={index}
              onClick={() => onSlotClick(index)}
              className="text-left transition-transform hover:scale-[1.01]"
              type="button"
            >
              <Card className="h-full border-2 p-4 shadow-sm hover:border-sky-300 hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Equipo {index + 1}
                    </p>
                    <h3 className="text-base font-semibold text-slate-900">
                      {isEmpty ? "Sin frente asignado" : initiative.name}
                    </h3>
                  </div>
                  {isEmpty ? (
                    <PlusCircle className="h-5 w-5 text-slate-400" />
                  ) : isFinalStage ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Layers3 className="h-5 w-5 text-sky-600" />
                  )}
                </div>

                <div className="space-y-3">
                  <Badge
                    variant="outline"
                    className={isEmpty ? "border-slate-300 text-slate-600" : "border-sky-200 text-sky-700"}
                  >
                    {isEmpty ? "Tocá para elegir iniciativa" : activeStage?.name ?? "En marcha"}
                  </Badge>

                  <p className="min-h-10 text-sm text-slate-600">
                    {isEmpty
                      ? "Asigná un frente estratégico a este equipo. Necesitás margen en caja y capacidad disponible."
                      : activeStage?.description ?? "Esta iniciativa está en marcha."}
                  </p>

                  {!isEmpty && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Avance del frente</span>
                        <span>{Math.round(slot.stageProgress)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                          style={{ width: `${Math.min(100, slot.stageProgress)}%` }}
                        />
                      </div>
                      {activeStage?.alert && slot.stageProgress >= 40 && (
                        <p className="text-xs text-amber-800">{activeStage.alert}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
