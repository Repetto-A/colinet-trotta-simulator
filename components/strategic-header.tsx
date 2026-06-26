"use client"

import { Building2, HexagonIcon as SeasonIcon, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import NavKpiBar from "@/components/kpi-strip"
import { cn } from "@/lib/utils"
import type { BusinessGameState } from "@/types/business-game"
import type { GameStatus } from "@/lib/game-balance"
import type { Season } from "@/types/initiatives"
import { SEASONS } from "@/types/initiatives"
import { CYCLE_TURNS } from "@/lib/game-balance"

interface StrategicHeaderProps {
  turn: number
  score: number
  stars: GameStatus["stars"]
  scenarioName: string
  currentSeason: Season
  canCloseCycle: boolean
  isGameOver: boolean
  headline: string
  gameState: BusinessGameState
  previousGameState: BusinessGameState
  highlightLabel?: string | null
  pulseKey?: number
  onEndCycle: () => void
  onOpenDetail: () => void
}

export default function StrategicHeader({
  turn,
  score,
  stars,
  scenarioName,
  currentSeason,
  canCloseCycle,
  isGameOver,
  headline,
  gameState,
  previousGameState,
  highlightLabel,
  pulseKey,
  onEndCycle,
  onOpenDetail,
}: StrategicHeaderProps) {
  const chapterProgress = Math.min(100, (turn / CYCLE_TURNS) * 100)

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2.5 sm:px-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-bold leading-tight text-slate-950 sm:text-base">Colinet Trotta</h1>
                <span className="hidden items-center gap-0.5 sm:flex" aria-label={`${stars} de 3 estrellas`}>
                  {[1, 2, 3].map((level) => (
                    <Star
                      key={level}
                      className={cn("h-3 w-3", stars >= level ? "fill-amber-400 text-amber-400" : "text-slate-300")}
                    />
                  ))}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] text-muted-foreground sm:text-xs">
                <span className="font-semibold tabular-nums text-blue-700">{score} pts</span>
                <span className="text-slate-300">·</span>
                <span className="tabular-nums">Mes {turn}/{CYCLE_TURNS}</span>
                <span className="hidden text-slate-300 sm:inline">·</span>
                <span className="hidden truncate sm:inline">{scenarioName}</span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <SeasonIcon className="h-3 w-3" />
                  {SEASONS[currentSeason].name}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={onEndCycle}
            disabled={!canCloseCycle && !isGameOver}
            size="sm"
            className="min-h-10 shrink-0 px-3 font-semibold"
          >
            {isGameOver ? "Ver resultado" : canCloseCycle ? "Cerrar ciclo" : "Siguiente mes"}
          </Button>
        </div>

        {headline !== "Ciclo en curso" && (
          <p className="-mt-1 truncate text-[11px] font-medium text-amber-700">{headline}</p>
        )}

        <NavKpiBar
          gameState={gameState}
          previousState={previousGameState}
          highlightLabel={highlightLabel}
          pulseKey={pulseKey}
          onOpenDetail={onOpenDetail}
        />

        <div className="flex items-center gap-2" aria-label={`Avance del capítulo ${Math.round(chapterProgress)}%`}>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-blue-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
              style={{ width: `${chapterProgress}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400">{Math.round(chapterProgress)}%</span>
        </div>
      </div>
    </header>
  )
}
