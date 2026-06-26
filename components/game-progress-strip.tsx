"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ChevronDown, ChevronUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StoryBeat } from "@/lib/story-arc"
import type { TurnFeedbackSummary } from "@/lib/game-engine"
import { MAX_TURNS, SCORE_EXCELLENT, SCORE_VICTORY, getScoreProgress } from "@/lib/game-balance"

interface GameProgressStripProps {
  score: number
  turn: number
  storyBeat: StoryBeat
  feedback: TurnFeedbackSummary | null
  maxTurns?: number
  initialExpanded?: boolean
}

function feedbackPills(feedback: TurnFeedbackSummary | null) {
  if (!feedback) return null
  const items = [...feedback.gains, ...feedback.losses].slice(0, 4)
  if (items.length === 0) return null
  return items
}

export default function GameProgressStrip({
  score,
  turn,
  storyBeat,
  feedback,
  maxTurns = MAX_TURNS,
  initialExpanded = false,
}: GameProgressStripProps) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const scoreProgress = getScoreProgress(score)
  const pills = feedbackPills(feedback)

  useEffect(() => {
    setExpanded(initialExpanded)
  }, [initialExpanded])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50/80 sm:px-4"
        aria-expanded={expanded}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
          <Target className="h-4 w-4 text-indigo-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">{storyBeat.title}</p>
          {pills && !expanded ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {pills.map((item) => (
                <span
                  key={`${item.label}-${item.delta}`}
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    item.delta > 0 ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700",
                  )}
                >
                  {item.delta > 0 ? "+" : ""}
                  {item.delta} {item.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="truncate text-[11px] text-slate-500">Misión del mes · objetivos y feedback</p>
          )}
        </div>

        <div className="hidden w-28 shrink-0 sm:block">
          <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
            <span>A victoria</span>
            <span className="tabular-nums">{scoreProgress.progressToVictory}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
              style={{ width: `${scoreProgress.progressToVictory}%` }}
            />
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-100 px-3 pb-3 pt-3 sm:px-4">
          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{storyBeat.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{storyBeat.objective}</p>
              <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-200/80 bg-amber-50/80 px-2 py-1.5 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{storyBeat.risk}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Puntaje rumbo a victoria ({SCORE_VICTORY}+ pts)</span>
                <span className="tabular-nums">{scoreProgress.progressToVictory}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                  style={{ width: `${scoreProgress.progressToVictory}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Puntaje rumbo a excelencia ({SCORE_EXCELLENT}+ pts)</span>
                <span className="tabular-nums">{scoreProgress.progressToExcellent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                  style={{ width: `${scoreProgress.progressToExcellent}%` }}
                />
              </div>
            </div>
          </div>

          {feedback && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-2.5 py-2">
              <p className="text-xs font-semibold text-indigo-950">{feedback.title}</p>
              {pills && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {pills.map((item) => (
                    <span
                      key={`${item.label}-${item.delta}-detail`}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                        item.delta > 0 ? "bg-emerald-500/15 text-emerald-800" : "bg-red-500/15 text-red-800",
                      )}
                    >
                      {item.delta > 0 ? "+" : ""}
                      {item.delta} {item.label}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1.5 text-[10px] text-indigo-900/80">Riesgo: {feedback.risk}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
