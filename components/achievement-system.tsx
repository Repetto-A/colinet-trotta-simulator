"use client"

import type React from "react"
import { Trophy, Star, TrendingUp, Award, ShieldCheck, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import type { BusinessGameState } from "@/types/business-game"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  progress: number
  maxProgress: number
  unlocked: boolean
  category: "strategy" | "governance" | "change" | "mastery"
  reward?: string
}

interface AchievementSystemProps {
  gameState: BusinessGameState
  onAchievementUnlock?: (achievement: Achievement) => void
}

export default function AchievementSystem({ gameState, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first-harvest",
      title: "Primer ciclo completo",
      description: "Llegá al cierre del ciclo sin quebrar la operación",
      icon: Trophy,
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: "strategy",
      reward: "Desbloqueaste una lectura más sistémica del caso",
    },
    {
      id: "soil-master",
      title: "Gobernanza útil",
      description: "Sostené control y procesos arriba de 70 durante 5 turnos",
      icon: TrendingUp,
      progress: 0,
      maxProgress: 5,
      unlocked: false,
      category: "governance",
      reward: "La empresa convirtió control en confianza",
    },
    {
      id: "water-wise",
      title: "Equipo con resto",
      description: "Conservá capacidad del equipo por encima de 70",
      icon: ShieldCheck,
      progress: 0,
      maxProgress: 30,
      unlocked: false,
      category: "change",
      reward: "Evitaste que la transformación se coma a las personas",
    },
    {
      id: "strategic-reader",
      title: "Lectura estratégica",
      description: "Tomá 10 decisiones y mantené el aprendizaje en movimiento",
      icon: Star,
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      category: "strategy",
      reward: "Ya no reaccionás: empezás a diseñar",
    },
    {
      id: "eco-champion",
      title: "Innovación con guardrails",
      description: "Mantené confianza de mercado arriba de 80 durante todo el ciclo",
      icon: Lightbulb,
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      category: "mastery",
      reward: "Certificación simbólica: innovación con control",
    },
  ])

  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null)

  useEffect(() => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        let newProgress = achievement.progress
        let newUnlocked = achievement.unlocked

        switch (achievement.id) {
          case "first-harvest":
            if (gameState.turn >= 10 && !achievement.unlocked) {
              newProgress = 1
              newUnlocked = true
            }
            break

          case "soil-master":
            if (gameState.processControl >= 70) {
              newProgress = Math.min(achievement.maxProgress, achievement.progress + 1)
              if (newProgress >= achievement.maxProgress) {
                newUnlocked = true
              }
            } else {
              newProgress = 0 // Reset if soil drops below 70
            }
            break

          case "water-wise":
            newProgress = Math.min(achievement.maxProgress, Math.max(0, gameState.teamCapacity - 40))
            if (newProgress >= achievement.maxProgress) {
              newUnlocked = true
            }
            break

          case "strategic-reader":
            newProgress = Math.min(achievement.maxProgress, gameState.turn)
            if (newProgress >= achievement.maxProgress) {
              newUnlocked = true
            }
            break

          case "eco-champion":
            if (gameState.sustainability >= 80) {
              newProgress = Math.min(achievement.maxProgress, achievement.progress + 1)
              if (newProgress >= achievement.maxProgress) {
                newUnlocked = true
              }
            }
            break
        }

        // Trigger unlock notification
        if (newUnlocked && !achievement.unlocked) {
          setRecentUnlock(achievement)
          setTimeout(() => setRecentUnlock(null), 5000)
          onAchievementUnlock?.(achievement)
        }

        return {
          ...achievement,
          progress: newProgress,
          unlocked: newUnlocked,
        }
      }),
    )
  }, [gameState, onAchievementUnlock])

  const categoryColors = {
    strategy: "bg-blue-500",
    governance: "bg-violet-500",
    change: "bg-emerald-500",
    mastery: "bg-purple-500",
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-4">
      {recentUnlock && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-foreground">Logro desbloqueado</div>
              <div className="text-sm text-muted-foreground">{recentUnlock.title}</div>
              {recentUnlock.reward && (
                <div className="text-xs text-green-600 font-medium mt-1">🎁 {recentUnlock.reward}</div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Logros
          </h3>
          <Badge variant="secondary">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        <div className="space-y-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            const progressPercent = (achievement.progress / achievement.maxProgress) * 100

            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                    : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? "bg-yellow-400" : "bg-muted"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${achievement.unlocked ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm text-foreground">{achievement.title}</div>
                      <Badge variant="outline" className={`text-xs ${categoryColors[achievement.category]} text-white`}>
                        {achievement.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{achievement.description}</div>
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <Progress value={progressPercent} className="h-1.5" />
                        <div className="text-xs text-muted-foreground">
                          {achievement.progress}/{achievement.maxProgress}
                        </div>
                      </div>
                    )}
                    {achievement.unlocked && achievement.reward && (
                      <div className="text-xs text-green-600 font-medium">✓ {achievement.reward}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
