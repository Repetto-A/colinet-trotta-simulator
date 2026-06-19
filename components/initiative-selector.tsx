"use client"

import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Radar, ShieldCheck, Sparkles, X, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { INITIATIVES, type InitiativeType, type Season, SEASONS, calculateRotationEffect } from "@/types/initiatives"

interface InitiativeSelectorProps {
  currentSeason: Season
  previousInitiative: InitiativeType | null
  onSelectInitiative: (initiativeType: InitiativeType) => void
  onClose: () => void
}

export default function InitiativeSelector({ currentSeason, previousInitiative, onSelectInitiative, onClose }: InitiativeSelectorProps) {
  const [showDetails, setShowDetails] = useState(false)
  const availableInitiatives = Object.values(INITIATIVES).filter(
    (initiative) => initiative.sowingSeason.includes(currentSeason) || initiative.id === "fallow",
  )
  const suggested = useMemo(() => {
    return (
      availableInitiatives.find((initiative) => {
        if (initiative.id === "fallow") return false
        return calculateRotationEffect(previousInitiative, initiative.id).type === "bonus"
      }) || availableInitiatives.find((initiative) => initiative.id !== "fallow")
    )
  }, [availableInitiatives, previousInitiative])

  const choose = (initiativeType: InitiativeType) => {
    onSelectInitiative(initiativeType)
    onClose()
  }

  const rotationBadge = (initiativeType: InitiativeType) => {
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
          Riesgo de sobrecarga
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <Card className="max-h-[88vh] w-full overflow-hidden rounded-b-none p-0 shadow-2xl sm:max-w-3xl sm:rounded-xl">
        <div className="sticky top-0 z-10 border-b bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Frente de trabajo</p>
              <h2 className="text-xl font-bold text-slate-950">Elegir iniciativa para el equipo</h2>
              <p className="mt-1 text-sm text-slate-600">
                Fase {SEASONS[currentSeason].name}
                {previousInitiative && previousInitiative !== "fallow" ? ` · Anterior: ${INITIATIVES[previousInitiative].name}` : ""}
              </p>
            </div>
            <Button variant="ghost" size="icon-lg" onClick={onClose} aria-label="Cerrar selector">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="max-h-[calc(88vh-88px)] space-y-3 overflow-y-auto p-4 pb-6">
          {suggested && (
            <Card className="border-sky-300 bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Sparkles className="h-5 w-5" style={{ color: suggested.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-950">{suggested.name}</h3>
                    {rotationBadge(suggested.id)}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Movimiento de bajo roce para esta capacidad. Revisá detalles solo si querés comparar alternativas.
                  </p>
                  <Button className="mt-3 min-h-11 w-full" onClick={() => choose(suggested.id)}>
                    Asignar esta iniciativa
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Button variant="outline" className="min-h-11 w-full justify-between bg-white" onClick={() => setShowDetails((value) => !value)}>
            Comparar todas las opciones
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showDetails && (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                Las iniciativas habilitadoras no siempre dan retorno inmediato, pero reducen fricción futura.
              </div>
              {availableInitiatives.map((initiative) => {
                const effect = calculateRotationEffect(previousInitiative, initiative.id)
                const isFallow = initiative.id === "fallow"
                return (
                  <Card
                    key={initiative.id}
                    className={`cursor-pointer p-4 transition-colors hover:border-sky-300 hover:bg-sky-50/40 ${
                      effect.type === "bonus" ? "border-green-300" : effect.type === "penalty" ? "border-red-300" : ""
                    }`}
                    onClick={() => choose(initiative.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white">
                        {isFallow ? (
                          <XCircle className="h-5 w-5 text-slate-500" />
                        ) : initiative.isSupportInitiative ? (
                          <ShieldCheck className="h-6 w-6" style={{ color: initiative.color }} />
                        ) : (
                          <Sparkles className="h-6 w-6" style={{ color: initiative.color }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950">{initiative.name}</h3>
                          {rotationBadge(initiative.id)}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {isFallow
                            ? "Dejar capacidad libre para absorber demanda o esperar mejor timing."
                            : initiative.stages[0]?.description ?? "Iniciativa estratégica disponible."}
                        </p>
                        {!isFallow && (
                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1">
                              <Radar className="h-3 w-3 text-blue-600" />
                              Velocidad {initiative.executionNeed}%
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              Capacidad {initiative.teamFocusNeed}%
                            </span>
                          </div>
                        )}
                        {effect.type !== "neutral" && <p className="mt-2 text-xs italic text-slate-600">{effect.message}</p>}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
