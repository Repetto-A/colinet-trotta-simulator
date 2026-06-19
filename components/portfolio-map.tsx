"use client"

import { INITIATIVE_ASSIGNMENT_COST, INITIATIVE_PAYOUT_RATE } from "@/lib/game-balance"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { INITIATIVES, SEASONS, type InitiativeType, type Season } from "@/types/initiatives"
import { CheckCircle2, Coins, Layers3, PlusCircle, Radar, ShieldAlert } from "lucide-react"

interface PortfolioMapProps {
  clientSatisfaction: number
  processControl: number
  executionSpeed: number
  teamCapacity: number
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
  clientSatisfaction,
  processControl,
  executionSpeed,
  teamCapacity,
  initiativeSlots,
  onSlotClick,
  currentSeason = "spring",
}: PortfolioMapProps) {
  const globalSignal =
    clientSatisfaction >= 70 && processControl >= 65
      ? { label: "Base estable", tone: "border-green-300 bg-green-50 text-green-700" }
      : clientSatisfaction >= 50 && processControl >= 45
        ? { label: "Empresa exigida", tone: "border-amber-300 bg-amber-50 text-amber-700" }
        : { label: "Zona crítica", tone: "border-red-300 bg-red-50 text-red-700" }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {initiativeSlots.map((slot, index) => {
          const initiative = INITIATIVES[slot.type]
          const activeStage = slot.type === "fallow" ? null : initiative.stages[slot.stageIndex]
          const isEmpty = slot.type === "fallow"
          const isFinalStage =
            !isEmpty && slot.stageIndex === initiative.stages.length - 1 && slot.stageProgress >= 70
          const estimatedPayout = isEmpty
            ? 0
            : Math.round(initiative.baseYield * INITIATIVE_PAYOUT_RATE * (slot.rotationMultiplier ?? 1))

          return (
            <button
              key={index}
              onClick={() => onSlotClick(index)}
              className="text-left transition-transform hover:scale-[1.02]"
              type="button"
            >
              <Card className="h-full border-2 p-4 shadow-sm hover:border-sky-300 hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Slot de capacidad {index + 1}
                    </p>
                    <h3 className="text-base font-semibold text-slate-900">
                      {isEmpty ? "Capacidad libre" : initiative.name}
                    </h3>
                  </div>
                  {isEmpty ? (
                    <PlusCircle className="h-5 w-5 text-slate-400" />
                  ) : isFinalStage ? (
                    <Coins className="h-5 w-5 text-amber-500" />
                  ) : slot.stageProgress >= 95 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Layers3 className="h-5 w-5 text-sky-600" />
                  )}
                </div>

                <div className="space-y-3">
                  <Badge variant="outline" className={isEmpty ? "border-slate-300 text-slate-600" : "border-sky-200 text-sky-700"}>
                    {isEmpty ? `Sin asignación · $${INITIATIVE_ASSIGNMENT_COST}` : activeStage?.name ?? "Iniciativa activa"}
                  </Badge>

                  <p className="min-h-10 text-sm text-slate-600">
                    {isEmpty
                      ? `Asigná una iniciativa ($${INITIATIVE_ASSIGNMENT_COST}). Al completarla liberás capacidad y cobrás retorno.`
                      : activeStage?.description ?? "Esta iniciativa está en marcha."}
                  </p>

                  {!isEmpty && (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Progreso</span>
                          <span>{Math.round(slot.stageProgress)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                            style={{ width: `${Math.min(100, slot.stageProgress)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">
                        Retorno estimado al cerrar: ${estimatedPayout}
                      </p>
                    </>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Radar className="h-4 w-4 text-sky-600" />
            Velocidad
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900">{Math.round(executionSpeed)}%</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ShieldAlert className="h-4 w-4 text-violet-600" />
            Control
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900">{Math.round(processControl)}%</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Layers3 className="h-4 w-4 text-emerald-600" />
            Capacidad
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900">{Math.round(teamCapacity)}%</p>
        </Card>
        <Card className={`border p-3 ${globalSignal.tone}`}>
          <p className="text-sm font-medium">Estado sistémico</p>
          <p className="mt-1 text-lg font-bold">{globalSignal.label}</p>
          <p className="mt-1 text-xs">Fase: {SEASONS[currentSeason].name}</p>
        </Card>
      </div>
    </div>
  )
}
