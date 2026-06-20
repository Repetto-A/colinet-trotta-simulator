"use client"

import { useMemo, useState } from "react"
import { ChevronDown, PauseCircle, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { INITIATIVE_ASSIGNMENT_COST } from "@/lib/game-balance"
import {
  INITIATIVE_GUIDE,
  SCENARIO_INITIATIVE_FITS,
  SEASONS,
  calculateRotationEffect,
  describeInitiativeNeeds,
  getInitiativePhaseFit,
  listSelectableInitiatives,
  type InitiativeData,
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

type BadgeTone = "scenario" | "timingGood" | "timingHard" | "transitionGood" | "transitionTense"

interface ShortBadge {
  label: string
  tone: BadgeTone
}

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  scenario: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/70",
  timingGood: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70",
  timingHard: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/70",
  transitionGood: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/70",
  transitionTense: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/70",
}

const BADGE_TONE_DOT: Record<BadgeTone, string> = {
  scenario: "bg-sky-500",
  timingGood: "bg-emerald-500",
  timingHard: "bg-amber-500",
  transitionGood: "bg-sky-500",
  transitionTense: "bg-red-500",
}

function shortBadges(
  initiative: InitiativeData,
  currentSeason: Season,
  fitsScenario: boolean,
  previousInitiative: InitiativeType | null,
): ShortBadge[] {
  const items: ShortBadge[] = []
  if (fitsScenario) items.push({ label: "Encaja con el escenario", tone: "scenario" })
  if (getInitiativePhaseFit(initiative, currentSeason) === "ideal")
    items.push({ label: "Buen timing", tone: "timingGood" })
  else items.push({ label: "Timing exigido", tone: "timingHard" })
  const effect = calculateRotationEffect(previousInitiative, initiative.id)
  if (effect.type === "bonus") items.push({ label: "Buena transición", tone: "transitionGood" })
  if (effect.type === "penalty") items.push({ label: "Transición tensa", tone: "transitionTense" })
  return items
}

export default function InitiativeSelector({
  currentSeason,
  previousInitiative,
  selectedScenario,
  teamIndex,
  onSelectInitiative,
  onClose,
}: InitiativeSelectorProps) {
  const [expandedId, setExpandedId] = useState<InitiativeType | null>(null)
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
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-slate-950/60 p-0 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:items-center sm:p-4">
      <Card className="flex max-h-[min(92vh,100dvh)] w-full flex-col overflow-hidden rounded-b-none border-slate-200/80 p-0 shadow-2xl ring-1 ring-slate-900/5 sm:max-w-xl sm:rounded-2xl lg:max-w-2xl">
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-sky-50 via-white to-white px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-sky-200/30 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  Equipo {teamIndex + 1}
                </span>
                <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                  Costo ${INITIATIVE_ASSIGNMENT_COST}
                </span>
                <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                  Fase {SEASONS[currentSeason].name}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">Elegir frente de trabajo</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {sortedInitiatives.length} propuestas disponibles. Cualquier frente es válido en esta fase.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-2.5 sm:p-3">
          <ul className="space-y-2">
            {sortedInitiatives.map((initiative) => {
              const guide = INITIATIVE_GUIDE[initiative.id]
              const fitsScenario = scenarioFits.includes(initiative.id)
              const badges = shortBadges(initiative, currentSeason, fitsScenario, previousInitiative)
              const expanded = expandedId === initiative.id
              const effect = calculateRotationEffect(previousInitiative, initiative.id)
              const firstStage = initiative.stages[0]

              return (
                <li
                  key={initiative.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all",
                    expanded
                      ? "border-sky-300 ring-1 ring-sky-200"
                      : "border-slate-200 hover:border-slate-300 hover:shadow",
                  )}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ backgroundColor: initiative.color }}
                    aria-hidden
                  />
                  <div className="flex items-center gap-3 py-2.5 pl-3.5 pr-2.5 sm:pl-4">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
                      style={{ backgroundColor: `${initiative.color}1a`, color: initiative.color }}
                    >
                      <Sparkles className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight text-slate-950">{initiative.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-slate-500 sm:text-xs">
                        {guide.summary}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {badges.slice(0, 3).map((badge) => (
                          <span
                            key={badge.label}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:text-[10px]",
                              BADGE_TONE_CLASS[badge.tone],
                            )}
                          >
                            <span className={cn("h-1 w-1 rounded-full", BADGE_TONE_DOT[badge.tone])} />
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-lg px-3 text-xs font-semibold shadow-sm"
                        onClick={() => choose(initiative.id)}
                      >
                        Elegir
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        onClick={() => setExpandedId(expanded ? null : initiative.id)}
                        aria-label={expanded ? "Ocultar detalle" : "Ver detalle"}
                        aria-expanded={expanded}
                      >
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                        />
                      </Button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="ml-3.5 space-y-2 border-t border-slate-100 bg-slate-50/70 px-3.5 pb-3 pt-2.5 text-[11px] leading-relaxed text-slate-600 sm:ml-4 sm:px-4 sm:text-xs">
                      <p className="flex gap-1.5">
                        <span className="shrink-0 font-semibold text-slate-800">Tradeoff:</span>
                        <span>{guide.tradeoff}</span>
                      </p>
                      <p className="flex gap-1.5">
                        <span className="shrink-0 font-semibold text-slate-800">Cuándo:</span>
                        <span>{guide.whenItFits}</span>
                      </p>
                      {firstStage && (
                        <p className="flex gap-1.5">
                          <span className="shrink-0 font-semibold text-slate-800">Primer paso:</span>
                          <span>
                            {firstStage.name}. {firstStage.description}
                          </span>
                        </p>
                      )}
                      <p className="text-slate-400">{describeInitiativeNeeds(initiative)}</p>
                      {effect.type !== "neutral" && (
                        <p
                          className={cn(
                            "rounded-md px-2 py-1 text-[10px] font-medium sm:text-[11px]",
                            effect.type === "penalty"
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700",
                          )}
                        >
                          {effect.message}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {previousInitiative && previousInitiative !== "unassigned" && (
            <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-white/70 px-3.5 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <PauseCircle className="h-4 w-4 shrink-0 text-slate-400" />
                <p className="truncate text-xs text-slate-600">Liberar este equipo y dejarlo sin frente asignado</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 rounded-lg text-xs"
                onClick={() => choose("unassigned")}
              >
                Liberar
              </Button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-2 text-center text-[10px] text-slate-400 sm:text-[11px]">
          <strong className="text-slate-500">Elegir</strong> asigna el frente · el ícono{" "}
          <ChevronDown className="inline h-3 w-3 align-text-bottom" /> despliega tradeoffs y primer paso
        </div>
      </Card>
    </div>
  )
}
