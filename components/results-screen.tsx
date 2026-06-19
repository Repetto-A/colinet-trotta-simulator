"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Star, Trophy, XCircle } from "lucide-react"
import type { GameStatus } from "@/lib/game-balance"
import { SCORE_VICTORY } from "@/lib/game-balance"
import { groupRecapByFramework, type LearningRecap } from "@/lib/learning-recap"

interface ResultsScreenProps {
  cycleResult: GameStatus
  initialBudget: number
  learningRecap?: LearningRecap
  onPlayAgain: () => void
  onBackToHome: () => void
}

function isVictoryOutcome(outcome: GameStatus["outcome"]): boolean {
  return outcome === "victory" || outcome === "partial" || outcome === "excellent"
}

export default function ResultsScreen({
  cycleResult,
  initialBudget,
  learningRecap,
  onPlayAgain,
  onBackToHome,
}: ResultsScreenProps) {
  const isVictory = isVictoryOutcome(cycleResult.outcome)
  const isDefeat = !isVictory
  const frameworkGroups = learningRecap ? groupRecapByFramework(learningRecap) : []

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDefeat
          ? "bg-gradient-to-b from-red-50 via-background to-red-100/40"
          : "bg-gradient-to-b from-amber-50 via-background to-emerald-50"
      }`}
    >
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-4">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isDefeat ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            {isDefeat ? (
              <XCircle className="w-10 h-10 text-red-600" />
            ) : (
              <Trophy className="w-10 h-10 text-amber-600" />
            )}
          </div>
          <p
            className={`text-sm font-bold uppercase tracking-widest ${
              isDefeat ? "text-red-600" : "text-emerald-700"
            }`}
          >
            {isDefeat ? "Derrota" : "Victoria"}
          </p>
          <h1
            className={`text-4xl md:text-5xl font-bold text-balance ${
              isDefeat ? "text-red-900" : "text-amber-900"
            }`}
          >
            {cycleResult.headline}
          </h1>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3].map((level) => (
              <Star
                key={level}
                className={`h-8 w-8 ${
                  cycleResult.stars >= level
                    ? "fill-amber-400 text-amber-400"
                    : isDefeat
                      ? "text-red-200"
                      : "text-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        <Card
          className={`p-6 space-y-4 border-2 ${
            isDefeat ? "border-red-200 bg-red-50/50" : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50"
          }`}
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Puntaje final</p>
              <p className={`text-4xl font-bold ${isDefeat ? "text-red-700" : "text-emerald-700"}`}>
                {cycleResult.score}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meta de victoria</p>
              <p className="text-4xl font-bold text-slate-700">{SCORE_VICTORY}</p>
            </div>
          </div>
          <p className="text-base leading-relaxed text-slate-700">{cycleResult.detail}</p>
          <p className="text-xs text-muted-foreground">Presupuesto inicial del ciclo: ${initialBudget}</p>
        </Card>

        {frameworkGroups.length > 0 && (
          <Card className="border-violet-200 bg-violet-50/40 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-700" />
              <h2 className="text-lg font-semibold text-violet-950">Qué aprendiste</h2>
            </div>
            <div className="space-y-4">
              {frameworkGroups.map((group) => (
                <div key={group.framework}>
                  <p className="text-sm font-semibold text-violet-900">{group.framework}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                    {group.concepts.map((concept) => (
                      <li key={concept} className="flex gap-2">
                        <span className="text-violet-500">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onPlayAgain} className="px-8">
            Jugar otro ciclo
          </Button>
          <Button size="lg" variant="outline" onClick={onBackToHome} className="px-8 bg-transparent">
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
