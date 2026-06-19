"use client"

import { useMemo } from "react"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  PauseCircle,
  Sparkles,
  X,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { INITIATIVE_ASSIGNMENT_COST } from "@/lib/game-balance"
import {
  INITIATIVES,
  INITIATIVE_GUIDE,
  SCENARIO_INITIATIVE_FITS,
  SEASONS,
  calculateRotationEffect,
  describeInitiativeNeeds,
  getInitiativePhaseFit,
  listSelectableInitiatives,
  type InitiativeType,
  type Season,
} from "@/types/initiatives"
import type { ScenarioId } from "@/types/scenario"
import { cn } from "@/lib/utils"

interface InitiativeSelectorProps {
  currentSeason: Season
  previousInitiative: InitiativeType | null
  selectedScenario?: ScenarioId | null
  teamIndex: number
  onSelectInitiative: (initiativeType: InitiativeType) => void
  onClose: () => void
}

function rotationBadge(initiativeType: InitiativeType, previousInitiative: InitiativeType | null) {
  const effect = calculateRotationEffect(previousInitiative, initiativeType)
  if (effect.type === "bonus") {
    return (
      <Badge className="border-green-300 bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        Buena transición
      </Badge>
    )
  }
  if (effect.type === "penalty") {
    return (
      <Badge className="border-red-300 bg-red-100 text-red-800">
        <XCircle className="mr-1 h-3 w-3" />
        Transición tensa
      </Badge>
    )
  }
  return null
}

export default function InitiativeSelector({
  currentSeason,
  previousInitiative,
  selectedScenario,
  teamIndex,
  onSelectInitiative,
  onClose,
}: InitiativeSelectorProps) {
  const scenarioFits = selectedScenario ? SCENARIO_INITIATIVE_FITS[selectedScenario] : []

  const sortedInitiatives = useMemo(() => {
    const all = listSelectableInitiatives(currentSeason)
    return [...all].sort((a, b) => {
      const aScenario = scenarioFits.includes(a.id) ? 0 : 1
      const bScenario = scenarioFits.includes(b.id) ? 0 : 1
      if (aScenario !== bScenario) return aScenario - bScenario
      const aPhase = getInitiativePhaseFit(a, currentSeason) === "ideal" ? 0 : 1
      const bPhase = getInitiativePhaseFit(b, currentSeason) === "ideal" ? 0 : 1
      if (aPhase !== bPhase) return aPhase - bPhase
      return a.name.localeCompare(b.name, "es")
    })
  }, [currentSeason, scenarioFits])

  const choose = (initiativeType: InitiativeType) => {
    onSelectInitiative(initiativeType)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-slate-900/55 p-0 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:items-center sm:p-4">
      <Card className="flex max-h-[min(92vh,100dvh)] w-full flex-col overflow-hidden rounded-b-none border-slate-200 p-0 shadow-2xl sm:max-w-2xl sm:rounded-xl">
        <div className="shrink-0 border-b bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Equipo {teamIndex + 1} · frente de trabajo
              </p>
              <h2 className="text-xl font-bold text-slate-950">Elegí qué lleva este equipo</h2>
              <p className="mt-1 text-sm text-slate-600">
                Fase {SEASONS[currentSeason].name}. Asignar cuesta ${INITIATIVE_ASSIGNMENT_COST} y ocupa al equipo hasta
                completar el frente.
              </p>
            </div>
            <Button variant="ghost" size="icon-lg" onClick={onClose} aria-label="Cerrar selector">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pb-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            <p>
              <strong>No hay una sola respuesta correcta.</strong> Podés abrir cualquier frente. Las etiquetas abajo
              ayudan a comparar timing, encaje con tu escenario y continuidad con lo que hizo este equipo antes.
            </p>
            {selectedScenario && scenarioFits.length > 0 && (
              <p className="mt-1.5 text-xs text-slate-600">
                Tu escenario encaja especialmente con{" "}
                {scenarioFits.map((id) => INITIATIVES[id].name).join(" o ")} — pero no estás obligado a elegirlos.
              </p>
            )}
          </div>

          {sortedInitiatives.map((initiative) => {
            const guide = INITIATIVE_GUIDE[initiative.id]
            const phaseFit = getInitiativePhaseFit(initiative, currentSeason)
            const effect = calculateRotationEffect(previousInitiative, initiative.id)
            const fitsScenario = scenarioFits.includes(initiative.id)
            const firstStage = initiative.stages[0]

            return (
              <Card
                key={initiative.id}
                className={cn(
                  "border p-3 transition-colors hover:border-sky-300 hover:bg-sky-50/30 sm:p-4",
                  effect.type === "penalty" && "border-red-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white"
                    style={{ borderColor: `${initiative.color}44` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: initiative.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-bold text-slate-950">{initiative.name}</h3>
                      {fitsScenario && (
                        <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">
                          Encaja con tu escenario
                        </Badge>
                      )}
                      {phaseFit === "ideal" ? (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                          Buen timing en esta fase
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                          Fuera del timing clásico
                        </Badge>
                      )}
                      {rotationBadge(initiative.id, previousInitiative)}
                    </div>

                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{guide.summary}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      <span className="font-semibold text-slate-600">Tradeoff:</span> {guide.tradeoff}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">Cuándo tiene sentido:</span> {guide.whenItFits}
                    </p>

                    {firstStage && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>
                          Primer paso: <strong>{firstStage.name}</strong> — {firstStage.description}
                        </span>
                      </p>
                    )}

                    <p className="mt-2 text-[11px] font-medium text-slate-500">{describeInitiativeNeeds(initiative)}</p>

                    {effect.type !== "neutral" && (
                      <p className="mt-2 text-xs italic text-slate-600">{effect.message}</p>
                    )}

                    <Button
                      className="mt-3 min-h-10 w-full text-sm sm:w-auto"
                      variant="outline"
                      onClick={() => choose(initiative.id)}
                    >
                      Asignar {initiative.name}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}

          {previousInitiative && previousInitiative !== "unassigned" && (
          <Card className="border-dashed border-slate-300 bg-slate-50/80 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white">
                <PauseCircle className="h-5 w-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{INITIATIVES.unassigned.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{INITIATIVE_GUIDE.unassigned.summary}</p>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {INITIATIVE_GUIDE.unassigned.tradeoff}
                </p>
                <Button variant="ghost" className="mt-2 min-h-10 px-0 text-slate-700 hover:text-slate-900" onClick={() => choose("unassigned")}>
                  Dejar este equipo libre por ahora
                </Button>
              </div>
            </div>
          </Card>
          )}
        </div>
      </Card>
    </div>
  )
}
