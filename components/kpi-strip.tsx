import { ChevronRight, Heart, Radar, ShieldCheck, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { STARTING_BUDGET } from "@/lib/game-balance"
import { KPI_GLOSSARY, KPI_SHORT } from "@/lib/kpi-glossary"
import type { BusinessGameState } from "@/types/business-game"
import { getDerivedKpis } from "@/types/business-game"

export interface NavKpiBarProps {
  gameState: BusinessGameState
  previousState: BusinessGameState
  highlightLabel?: string | null
  pulseKey?: number
  className?: string
  onOpenDetail?: () => void
}

type HealthTier = "good" | "mid" | "low"

const healthTier = (value: number): HealthTier => {
  if (value >= 70) return "good"
  if (value >= 45) return "mid"
  return "low"
}

const valueTone: Record<HealthTier, string> = {
  good: "text-blue-700",
  mid: "text-slate-700",
  low: "text-rose-700",
}

const barTone: Record<HealthTier, string> = {
  good: "bg-blue-500",
  mid: "bg-blue-300",
  low: "bg-rose-500",
}

const pillBorder: Record<HealthTier, string> = {
  good: "border-blue-200/80",
  mid: "border-slate-200/80",
  low: "border-rose-200/80",
}

interface MetricTheme {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  barTrack: string
}

type KpiShortValue = (typeof KPI_SHORT)[keyof typeof KPI_SHORT]

const metricThemes: Partial<Record<KpiShortValue, MetricTheme>> = {
  [KPI_SHORT.clients]: {
    icon: Heart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    barTrack: "bg-blue-100/70",
  },
  [KPI_SHORT.control]: {
    icon: ShieldCheck,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    barTrack: "bg-blue-100/70",
  },
  [KPI_SHORT.capacity]: {
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    barTrack: "bg-slate-100",
  },
  [KPI_SHORT.speed]: {
    icon: Radar,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
    barTrack: "bg-cyan-100/80",
  },
}

function budgetHealth(money: number): HealthTier {
  const ratio = money / STARTING_BUDGET
  if (ratio >= 0.85) return "good"
  if (ratio >= 0.45) return "mid"
  return "low"
}

function NavKpiPill({
  label,
  fullLabel,
  value,
  tier,
  delta,
  pct,
  icon: Icon,
  iconBg,
  iconColor,
  barTrack,
  highlighted,
  money = false,
  onClick,
}: {
  label: string
  fullLabel: string
  value: string
  tier: HealthTier
  delta: number
  pct: number
  icon: LucideIcon
  iconBg: string
  iconColor: string
  barTrack: string
  highlighted: boolean
  money?: boolean
  onClick?: () => void
}) {
  const showDelta = delta !== 0

  const pillClass = cn(
    "flex min-w-[5.5rem] shrink-0 flex-col rounded-lg border bg-white/95 px-2 py-1.5 shadow-sm sm:min-w-[6.25rem]",
    pillBorder[tier],
    highlighted && "kpi-highlight-pulse",
    onClick &&
      "cursor-pointer text-left transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
  )

  const body = (
    <>
      <div className="flex items-center justify-between gap-1">
        <p className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md", iconBg)}>
          <Icon className={cn("h-3 w-3", iconColor)} />
        </div>
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <p className={cn("text-sm font-bold tabular-nums leading-none sm:text-base", valueTone[tier])}>{value}</p>
        {showDelta && (
          <span
            title="vs. turno previo"
            className={cn(
              "inline-flex items-center text-[9px] font-semibold tabular-nums leading-none",
              delta > 0 ? "text-blue-600" : "text-rose-600",
            )}
          >
            {delta > 0 ? <TrendingUp className="mr-0.5 h-2.5 w-2.5" /> : <TrendingDown className="mr-0.5 h-2.5 w-2.5" />}
            {money
              ? `${delta > 0 ? "+" : "-"}$${Math.abs(delta)}`
              : `${delta > 0 ? "+" : ""}${delta}`}
          </span>
        )}
      </div>
      <div className={cn("mt-1.5 h-0.5 overflow-hidden rounded-full", barTrack)}>
        <div className={cn("h-full rounded-full transition-all", barTone[tier])} style={{ width: `${pct}%` }} />
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} title={fullLabel} aria-label={`Ver detalle de ${fullLabel}`} className={pillClass}>
        {body}
      </button>
    )
  }

  return (
    <div title={fullLabel} className={pillClass}>
      {body}
    </div>
  )
}

export default function NavKpiBar({
  gameState,
  previousState,
  highlightLabel = null,
  pulseKey = 0,
  className,
  onOpenDetail,
}: NavKpiBarProps) {
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
      label: KPI_SHORT.clients,
      fullLabel: KPI_GLOSSARY.clients.full,
      value: current.satisfaccion_clientes,
      previousValue: previous.satisfaccion_clientes,
    },
    {
      label: KPI_SHORT.control,
      fullLabel: KPI_GLOSSARY.control.full,
      value: current.control_procesos,
      previousValue: previous.control_procesos,
    },
    {
      label: KPI_SHORT.capacity,
      fullLabel: KPI_GLOSSARY.capacity.full,
      value: current.capacidad_equipo,
      previousValue: previous.capacidad_equipo,
    },
    {
      label: KPI_SHORT.speed,
      fullLabel: KPI_GLOSSARY.speed.full,
      value: current.velocidad_ejecucion,
      previousValue: previous.velocidad_ejecucion,
    },
  ]

  const renderPills = (onPillClick?: () => void) => (
    <>
      <NavKpiPill
        label={KPI_SHORT.budget}
        fullLabel={KPI_GLOSSARY.budget.full}
        value={`$${gameState.money.toLocaleString("es-AR")}`}
        tier={budgetTier}
        delta={moneyDelta}
        pct={budgetPct}
        icon={Wallet}
        iconBg="bg-blue-700"
        iconColor="text-blue-100"
        barTrack="bg-blue-50"
        highlighted={activeHighlight === KPI_SHORT.budget}
        money
        onClick={onPillClick}
      />

      {items.map((item) => {
        const theme = metricThemes[item.label]
        if (!theme) return null
        const tier = healthTier(item.value)
        const delta = Math.round(item.value - item.previousValue)
        const rounded = Math.round(item.value)

        return (
          <NavKpiPill
            key={item.label}
            label={item.label}
            fullLabel={item.fullLabel}
            value={`${rounded}%`}
            tier={tier}
            delta={delta}
            pct={Math.min(100, Math.max(0, rounded))}
            icon={theme.icon}
            iconBg={theme.iconBg}
            iconColor={theme.iconColor}
            barTrack={theme.barTrack}
            highlighted={activeHighlight === item.label}
            onClick={onPillClick}
          />
        )
      })}
    </>
  )

  const scrollClasses =
    "flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

  if (!onOpenDetail) {
    return (
      <div className={cn(scrollClasses, className)} aria-label="Indicadores clave del negocio">
        {renderPills()}
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label="Indicadores clave del negocio"
      className={cn("flex items-center gap-1.5 rounded-xl", className)}
    >
      <span className={cn(scrollClasses, "flex-1")}>{renderPills(onOpenDetail)}</span>
      <button
        type="button"
        onClick={onOpenDetail}
        aria-label="Ver KPIs en detalle"
        className="group flex shrink-0 items-center gap-0.5 self-stretch rounded-lg border border-slate-200/80 bg-white/95 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
      >
        Detalle
        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}
