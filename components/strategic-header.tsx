"use client"

import { BarChart3, Building2, HexagonIcon as SeasonIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Season } from "@/types/initiatives"
import { SEASONS } from "@/types/initiatives"
import { CYCLE_TURNS } from "@/lib/game-balance"

interface StrategicHeaderProps {
  turn: number
  score: number
  scenarioName: string
  currentSeason: Season
  canCloseCycle: boolean
  isGameOver: boolean
  headline: string
  onOpenSignals: () => void
  onEndCycle: () => void
}

export default function StrategicHeader({
  turn,
  score,
  scenarioName,
  currentSeason,
  canCloseCycle,
  isGameOver,
  headline,
  onOpenSignals,
  onEndCycle,
}: StrategicHeaderProps) {
  const chapterProgress = Math.min(100, (turn / CYCLE_TURNS) * 100)

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:px-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight text-slate-950 sm:text-lg">Colinet Trotta</h1>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <span>Turno {turn}/{CYCLE_TURNS}</span>
              <span>·</span>
              <span className="font-semibold text-blue-700">{score} pts</span>
              <span>·</span>
              <span className="truncate">{scenarioName}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <SeasonIcon className="h-3.5 w-3.5" />
                {SEASONS[currentSeason].name}
              </span>
            </div>
            {headline !== "Ciclo en curso" && (
              <p className="mt-0.5 truncate text-xs font-medium text-amber-700">{headline}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 lg:min-w-[360px]">
          <div className="h-2 overflow-hidden rounded-full bg-blue-50">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700" style={{ width: `${chapterProgress}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onOpenSignals} className="min-h-11 gap-2 bg-white">
              <BarChart3 className="h-4 w-4" />
              Señales
            </Button>
            <Button onClick={onEndCycle} disabled={!canCloseCycle && !isGameOver} className="min-h-11 font-semibold">
              {isGameOver ? "Ver resultado" : canCloseCycle ? "Cerrar ciclo" : `Capítulo ${Math.min(CYCLE_TURNS, turn + 1)}/${CYCLE_TURNS}`}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
