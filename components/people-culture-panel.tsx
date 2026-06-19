"use client"

import { AlertTriangle, Clock, Flame, GraduationCap, HeartHandshake, Lightbulb, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BUSINESS_ACTIONS, type BusinessActionDefinition } from "@/lib/business-decisions"
import { PEOPLE_ACTION_IDS } from "@/lib/game-engine"
import type { BusinessGameState } from "@/types/business-game"

interface PeopleCulturePanelProps {
  gameState: BusinessGameState
  cooldowns?: Record<string, number>
  onAction: (action: BusinessActionDefinition) => void
}

const actionIcons = {
  motivate: HeartHandshake,
  culture_bbq: Flame,
  train_team: GraduationCap,
  situational_leadership: Users,
} as const

const MetricPill = ({ label, value }: { label: string; value: number }) => {
  if (value === 0) return null
  const positive = value > 0
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
    >
      {label} {positive ? "+" : ""}
      {value}
    </span>
  )
}

export default function PeopleCulturePanel({ gameState, cooldowns = {}, onAction }: PeopleCulturePanelProps) {
  const peopleActions = BUSINESS_ACTIONS.filter((action) =>
    PEOPLE_ACTION_IDS.includes(action.id as (typeof PEOPLE_ACTION_IDS)[number]),
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Personas y clima: motivación, rituales y señales que sostienen al equipo mientras la empresa crece.
      </p>
      {peopleActions.map((action) => {
        const Icon = actionIcons[action.id as keyof typeof actionIcons] || HeartHandshake
        const canAfford = gameState.money >= action.cost
        const cooldown = cooldowns[action.id] || 0
        const disabled = !canAfford || cooldown > 0
        const hasContextSignal = action.recommended(gameState)

        return (
          <Card
            key={action.id}
            className={`border p-4 transition-colors ${disabled ? "opacity-60" : "hover:border-teal-300 hover:bg-teal-50/30"}`}
          >
            {hasContextSignal && (
              <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
                <Lightbulb className="h-3.5 w-3.5" />
                Señal de contexto
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                <Icon className="h-5 w-5 text-teal-700" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{action.concept}</p>
                    <h3 className="text-base font-bold text-slate-950">{action.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inversión</p>
                    <p className="text-lg font-bold text-green-700">${action.cost}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{action.description}</p>
                {action.warning && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{action.warning}</span>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
              <MetricPill label="Capacidad" value={action.teamCapacityChange} />
              <MetricPill label="Confianza" value={action.sustainabilityChange} />
              <MetricPill label="Control" value={action.processControlChange} />
              <MetricPill label="Velocidad" value={action.executionSpeedChange} />
              <MetricPill label="Clientes" value={action.clientSatisfactionChange} />
                </div>
                <Button
                  disabled={disabled}
                  onClick={() => onAction(action)}
                  className="mt-3 min-h-11 w-full font-semibold bg-teal-700 hover:bg-teal-800"
                >
                  {cooldown > 0 ? (
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Disponible en {cooldown}t
                    </span>
                  ) : !canAfford ? (
                    "Presupuesto insuficiente"
                  ) : (
                    "Ejecutar decisión"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
