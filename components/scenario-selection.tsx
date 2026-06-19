"use client"

import { useState } from "react"
import {
  ArrowRight,
  Brain,
  Building2,
  Check,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SCENARIOS, SCENARIO_LIST, type ScenarioData, type ScenarioId } from "@/types/scenario"

interface ScenarioSelectionProps {
  onSelectScenario: (scenarioId: ScenarioId) => void
}

const scenarioIcons = {
  core: Building2,
  ai: Brain,
  growth: Sparkles,
  governance: ShieldCheck,
  structure: GitBranch,
} as const

function ScenarioCard({
  scenario,
  selected,
  onSelect,
}: {
  scenario: ScenarioData
  selected: boolean
  onSelect: () => void
}) {
  const Icon = scenarioIcons[scenario.icon]

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "group relative h-full rounded-2xl text-left outline-none transition-all",
        "focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2",
        selected ? "scale-[1.01]" : "hover:scale-[1.005]",
      )}
    >
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden border-2 p-4 transition-all sm:p-5",
          selected
            ? "border-sky-400 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/50 shadow-lg shadow-sky-100/80"
            : "border-slate-200/90 bg-white hover:border-sky-200 hover:shadow-md",
        )}
        style={selected ? { borderColor: scenario.accent } : undefined}
      >
        {selected && (
          <div
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: scenario.accent }}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </div>
        )}

        <div className="mb-3 flex items-start gap-3 pr-8">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ backgroundColor: scenario.accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-snug text-slate-950 sm:text-lg">{scenario.name}</h2>
            <p className="mt-0.5 text-sm text-slate-600">{scenario.subtitle}</p>
          </div>
        </div>

        <p className="min-h-[4.5rem] text-sm leading-relaxed text-slate-600 line-clamp-3">{scenario.description}</p>

        <div className="mt-auto min-h-[4.5rem] pt-4">
          <div className="flex min-h-[2.25rem] flex-wrap content-start gap-1.5">
            {scenario.learningFocus.map((focus) => (
              <span
                key={focus}
                className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800"
              >
                {focus}
              </span>
            ))}
          </div>
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium text-slate-400 transition-opacity",
              selected ? "text-sky-700 opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
            )}
          >
            {selected ? "Listo para comenzar abajo" : "Seleccionar"}
            <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>
      </Card>
    </div>
  )
}

function ScenarioStartDock({
  scenario,
  onStart,
}: {
  scenario: ScenarioData
  onStart: (scenarioId: ScenarioId) => void
}) {
  const Icon = scenarioIcons[scenario.icon]

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="border-t bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 sm:gap-4">
          <div
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:flex"
            style={{ backgroundColor: scenario.accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Mandato elegido</p>
            <p className="truncate text-sm font-bold text-slate-950 sm:text-base">{scenario.name}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{scenario.chapterMission}</p>
          </div>
          <Button
            size="lg"
            onClick={() => onStart(scenario.id)}
            className="min-h-11 shrink-0 gap-2 rounded-xl px-4 font-semibold sm:px-6"
            style={{ backgroundColor: scenario.accent }}
          >
            <span className="hidden sm:inline">Asumir el comité</span>
            <span className="sm:hidden">Comenzar</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ScenarioSelection({ onSelectScenario }: ScenarioSelectionProps) {
  const [selectedId, setSelectedId] = useState<ScenarioId | null>(null)
  const selected = selectedId ? SCENARIOS[selectedId] : null

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-slate-100/80 via-white to-sky-50/60",
        selected ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]" : "pb-8",
      )}
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:px-6 sm:pt-10">
        <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-6 shadow-sm backdrop-blur-sm sm:px-8 sm:py-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-1/3 h-24 w-24 rounded-full bg-indigo-100/50 blur-2xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Paso 2 · Mandato</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              ¿Qué conflicto vas a encarar?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Cada escenario tensiona otra palanca. Elegí uno y liderá el comité por 12 turnos.
            </p>
          </div>
        </header>

        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {SCENARIO_LIST.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={selectedId === scenario.id}
              onSelect={() => setSelectedId(scenario.id)}
            />
          ))}
        </div>
      </div>

      {selected && <ScenarioStartDock scenario={selected} onStart={onSelectScenario} />}
    </div>
  )
}
