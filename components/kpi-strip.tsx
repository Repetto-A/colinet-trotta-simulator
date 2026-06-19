import { Heart, Radar, ShieldCheck, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { STARTING_BUDGET } from "@/lib/game-balance"
import type { BusinessGameState } from "@/types/business-game"
import { getDerivedKpis } from "@/types/business-game"

interface KpiStripProps {
  gameState: BusinessGameState
  previousState: BusinessGameState
  highlightLabel?: string | null
  pulseKey?: number
}

type HealthTier = "good" | "mid" | "low"

const healthTier = (value: number): HealthTier => {
  if (value >= 70) return "good"
  if (value >= 45) return "mid"
  return "low"
}

const valueTone: Record<HealthTier, string> = {
  good: "text-emerald-700",
  mid: "text-amber-700",
  low: "text-red-700",
}

const barTone: Record<HealthTier, string> = {
  good: "bg-emerald-500",
  mid: "bg-amber-500",
  low: "bg-red-500",
}

interface MetricTheme {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  barTrack: string
}

const metricThemes: Record<string, MetricTheme> = {
  Clientes: {
    icon: Heart,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    barTrack: "bg-rose-100",
  },
  Control: {
    icon: ShieldCheck,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    barTrack: "bg-indigo-100",
  },
  Capacidad: {
    icon: Users,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    barTrack: "bg-violet-100",
  },
  Velocidad: {
    icon: Radar,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    barTrack: "bg-sky-100",
  },
}

function DeltaBadge({ delta, money = false }: { delta: number; money?: boolean }) {
  if (delta === 0) return null
  const positive = delta > 0
  const label = money
    ? `${positive ? "+" : "-"}$${Math.abs(delta)}`
    : `${positive ? "+" : ""}${delta}`

  return (
    <span
      title="vs. turno previo"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none",
        positive ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700",
      )}
    >
      {positive ? <TrendingUp className="h-3 w-3 shrink-0" /> : <TrendingDown className="h-3 w-3 shrink-0" />}
      {label}
    </span>
  )
}

function budgetHealth(money: number): HealthTier {
  const ratio = money / STARTING_BUDGET
  if (ratio >= 0.85) return "good"
  if (ratio >= 0.45) return "mid"
  return "low"
}

export default function KpiStrip({
  gameState,
  previousState,
  highlightLabel = null,
  pulseKey = 0,
}: KpiStripProps) {
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)
  const current = getDerivedKpis(gameState)
  const previous = getDerivedKpis(previousState)
  const moneyDelta = gameState.money - previousState.money
  const budgetTier = budgetHealth(gameState.money)
  const budgetPct = Math.min(100, Math.round((gameState.money / STARTING_BUDGET) * 100))

  useEffect(() => {
    if (!highlightLabel || pulseKey <= 0) return
    setActiveHighlight(highlightLabel)
    const timer = window.setTimeout(() => setActiveHighlight(null), 1600)
    return () => window.clearTimeout(timer)
  }, [highlightLabel, pulseKey])

  const items = [
    {
      label: "Clientes",
      value: current.satisfaccion_clientes,
      previousValue: previous.satisfaccion_clientes,
    },
    {
      label: "Control",
      value: current.control_procesos,
      previousValue: previous.control_procesos,
    },
    {
      label: "Capacidad",
      value: current.capacidad_equipo,
      previousValue: previous.capacidad_equipo,
    },
    {
      label: "Velocidad",
      value: current.velocidad_ejecucion,
      previousValue: previous.velocidad_ejecucion,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      <Card
        className={cn(
          "col-span-2 border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm sm:col-span-1",
          activeHighlight === "Presupuesto" && "kpi-highlight-pulse",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presupuesto</p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
              <p className={cn("text-xl font-bold tabular-nums tracking-tight sm:text-2xl", valueTone[budgetTier])}>
                ${gameState.money.toLocaleString("es-AR")}
              </p>
              <DeltaBadge delta={moneyDelta} money />
            </div>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900">
            <Wallet className="h-3.5 w-3.5 text-emerald-300" />
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span>Caja vs. inicio</span>
            <span className="tabular-nums text-slate-600">{budgetPct}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all", barTone[budgetTier])}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      </Card>

      {items.map((item) => {
        const theme = metricThemes[item.label]
        const Icon = theme.icon
        const tier = healthTier(item.value)
        const delta = Math.round(item.value - item.previousValue)
        const rounded = Math.round(item.value)

        return (
          <Card
            key={item.label}
            className={cn(
              "border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm",
              activeHighlight === item.label && "kpi-highlight-pulse",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                  <p className={cn("text-xl font-bold tabular-nums tracking-tight sm:text-2xl", valueTone[tier])}>
                    {rounded}%
                  </p>
                  <DeltaBadge delta={delta} />
                </div>
              </div>
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", theme.iconBg)}>
                <Icon className={cn("h-3.5 w-3.5", theme.iconColor)} />
              </div>
            </div>
            <div className={cn("mt-2 h-1 overflow-hidden rounded-full", theme.barTrack)}>
              <div
                className={cn("h-full rounded-full transition-all", barTone[tier])}
                style={{ width: `${Math.min(100, Math.max(0, rounded))}%` }}
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
