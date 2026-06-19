"use client"

import { AlertTriangle, Clock, GitBranch, Lightbulb, ShieldCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BUSINESS_ACTIONS, type BusinessActionDefinition } from "@/lib/business-decisions"
import { STRATEGIC_ACTION_IDS } from "@/lib/game-engine"
import type { BusinessGameState } from "@/types/business-game"

interface ActionPanelProps {
  gameState: BusinessGameState
  cooldowns?: Record<string, number>
  onAction: (action: BusinessActionDefinition) => void
}

const actionIcons = [ShieldCheck, TrendingUp, ShieldCheck, Lightbulb, GitBranch]

const MetricPill = ({ label, value }: { label: string; value: number }) => {
  if (value === 0) return null
  const positive = value > 0
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
      {label} {positive ? "+" : ""}
      {value}
    </span>
  )
}

export default function ActionPanel({ gameState, cooldowns = {}, onAction }: ActionPanelProps) {
  const strategicActions = BUSINESS_ACTIONS.filter((action) =>
    STRATEGIC_ACTION_IDS.includes(action.id as (typeof STRATEGIC_ACTION_IDS)[number]),
  ).filter((action) => action.id !== "tune")
  const tuneAction = BUSINESS_ACTIONS.find((action) => action.id === "tune")!

  const actionStates = strategicActions.map((action, index) => ({
    action,
    Icon: actionIcons[index] || Lightbulb,
    canAfford: gameState.money >= action.cost,
    cooldown: cooldowns[action.id] || 0,
    hasContextSignal: action.recommended(gameState),
  }))
  const primary = actionStates.find((item) => item.hasContextSignal && item.canAfford && item.cooldown === 0) || actionStates.find((item) => item.canAfford && item.cooldown === 0) || actionStates[0]
  const secondary = actionStates.filter((item) => item.action.id !== primary.action.id)

  const renderAction = (
    item: (typeof actionStates)[number],
    variant: "primary" | "secondary",
  ) => {
    const { action, Icon, canAfford, cooldown, hasContextSignal } = item
    const disabled = !canAfford || cooldown > 0
    const compact = variant === "secondary"

    return (
      <Card
        key={action.id}
        className={`relative overflow-hidden border transition-colors ${
          variant === "primary" ? "border-sky-300 bg-gradient-to-br from-sky-50 to-indigo-50 p-4" : "p-3"
        } ${disabled ? "opacity-60" : "hover:border-sky-300 hover:bg-sky-50/40"}`}
      >
        {hasContextSignal && (
          <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">
            <Lightbulb className="h-3.5 w-3.5" />
            Señal de contexto
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Icon className="h-5 w-5 text-sky-700" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{action.concept}</p>
                <h3 className={`${compact ? "text-base" : "text-lg"} font-bold text-slate-950`}>{action.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inversión</p>
                <p className="text-lg font-bold text-green-700">${action.cost}</p>
              </div>
            </div>
            {!compact && <p className="mt-2 text-sm leading-relaxed text-slate-600">{action.description}</p>}
            {action.warning && !compact && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{action.warning}</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <MetricPill label="Clientes" value={action.clientSatisfactionChange} />
              <MetricPill label="Control" value={action.processControlChange} />
              <MetricPill label="Velocidad" value={action.executionSpeedChange} />
              <MetricPill label="Capacidad" value={action.teamCapacityChange} />
            </div>
            <Button
              disabled={disabled}
              onClick={() => onAction(action)}
              className="mt-3 min-h-11 w-full font-semibold"
              variant={variant === "primary" ? "default" : "outline"}
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
  }

  return (
    <div className="space-y-3">
      {renderAction(primary, "primary")}
      <div className="grid gap-3 md:grid-cols-3">{secondary.map((item) => renderAction(item, "secondary"))}</div>
      <Card className="border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tuneAction.concept}</p>
            <h3 className="text-base font-bold text-slate-950">{tuneAction.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{tuneAction.description}</p>
          </div>
          <Button
            disabled={gameState.money < tuneAction.cost}
            onClick={() => onAction(tuneAction)}
            variant="outline"
            className="min-h-11 shrink-0"
          >
            {gameState.money < tuneAction.cost ? "Presupuesto insuficiente" : `Ajustar · $${tuneAction.cost}`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
