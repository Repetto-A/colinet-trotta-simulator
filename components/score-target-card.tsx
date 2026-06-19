"use client"

import { Card } from "@/components/ui/card"
import { Star, Target } from "lucide-react"
import {
  MAX_TURNS,
  SCORE_EXCELLENT,
  SCORE_VICTORY,
  getScoreProgress,
  type GameStatus,
} from "@/lib/game-balance"

interface ScoreTargetCardProps {
  score: number
  stars: GameStatus["stars"]
  turn: number
  maxTurns?: number
}

export default function ScoreTargetCard({
  score,
  stars,
  turn,
  maxTurns = MAX_TURNS,
}: ScoreTargetCardProps) {
  const { progressToVictory, progressToExcellent } = getScoreProgress(score)

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Puntaje del ciclo</p>
            <p className="text-3xl font-bold text-slate-950">{score}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3].map((level) => (
            <Star
              key={level}
              className={`h-6 w-6 ${
                stars >= level ? "fill-amber-400 text-amber-400" : "text-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Victoria ({SCORE_VICTORY}+)</span>
            <span>{progressToVictory}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
              style={{ width: `${progressToVictory}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Excelencia ({SCORE_EXCELLENT}+)</span>
            <span>{progressToExcellent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
              style={{ width: `${progressToExcellent}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Turno {turn}/{maxTurns} · Objetivo: {SCORE_VICTORY} pts para victoria · {SCORE_EXCELLENT} para excelencia
      </p>
    </Card>
  )
}
