"use client"

import { useMemo } from "react"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  GitBranch,
  GraduationCap,
  GripHorizontal,
  HeartHandshake,
  Lightbulb,
  Rocket,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useHorizontalDragScroll } from "@/hooks/use-horizontal-drag-scroll"
import { BUSINESS_ACTIONS, type BusinessActionDefinition } from "@/lib/business-decisions"
import { formatDecisionCostTier } from "@/lib/game-balance"
import { PEOPLE_ACTION_IDS, STRATEGIC_ACTION_IDS } from "@/lib/game-engine"
import type { BusinessGameState } from "@/types/business-game"

interface DecisionDeckProps {
  gameState: BusinessGameState
  cooldowns?: Record<string, number>
  onAction: (action: BusinessActionDefinition) => void
}

type DeckCategory = "strategy" | "people"

const actionIcons: Record<string, LucideIcon> = {
  stabilize: ShieldCheck,
  modernize: Rocket,
  govern: Scale,
  innovate: Lightbulb,
  delegate_fronts: GitBranch,
  tune: SlidersHorizontal,
  motivate: HeartHandshake,
  culture_bbq: Flame,
  train_team: GraduationCap,
  situational_leadership: Users,
}

const categoryAccent: Record<DeckCategory, { label: string; stripe: string; icon: string; badge: string }> = {
  strategy: {
    label: "Estrategia",
    stripe: "from-blue-500 to-blue-700",
    icon: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
  people: {
    label: "Personas",
    stripe: "from-blue-400 to-cyan-600",
    icon: "text-cyan-700",
    badge: "bg-cyan-100 text-cyan-700",
  },
}

const MetricPill = ({ label, value }: { label: string; value: number }) => {
  if (value === 0) return null
  const positive = value > 0
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums",
        positive ? "border-blue-200 bg-blue-50 text-blue-700" : "border-rose-200 bg-rose-50 text-rose-700",
      )}
    >
      {label} {positive ? "+" : ""}
      {value}
    </span>
  )
}

interface DeckEntry {
  action: BusinessActionDefinition
  category: DeckCategory
}

function buildDeck(): DeckEntry[] {
  const byId = new Map(BUSINESS_ACTIONS.map((action) => [action.id, action]))
  const strategy: DeckEntry[] = STRATEGIC_ACTION_IDS.map((id) => byId.get(id))
    .filter((action): action is BusinessActionDefinition => Boolean(action))
    .map((action) => ({ action, category: "strategy" as const }))
  const people: DeckEntry[] = PEOPLE_ACTION_IDS.map((id) => byId.get(id))
    .filter((action): action is BusinessActionDefinition => Boolean(action))
    .map((action) => ({ action, category: "people" as const }))
  return [...strategy, ...people]
}

export default function DecisionDeck({ gameState, cooldowns = {}, onAction }: DecisionDeckProps) {
  const deck = buildDeck()
  const { viewportRef, trackRef, trackStyle, isDragging, scrollBy, handlers } = useHorizontalDragScroll([
    deck.length,
  ])

  const suggestedId = useMemo(
    () =>
      deck.find(({ action }) => {
        const affordable = gameState.money >= action.cost
        const ready = (cooldowns[action.id] || 0) === 0
        return affordable && ready && action.recommended(gameState)
      })?.action.id,
    [deck, gameState, cooldowns],
  )

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Decisiones del comité</h2>
            <p className="flex items-center gap-1 text-[10px] text-slate-500 sm:text-xs">
              <GripHorizontal className="h-3.5 w-3.5" />
              Arrastrá o usá las flechas
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full border-slate-200 bg-white text-blue-700"
            onClick={() => scrollBy(-300)}
            aria-label="Ver decisiones anteriores"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full border-slate-200 bg-white text-blue-700"
            onClick={() => scrollBy(300)}
            aria-label="Ver más decisiones"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-slate-50/95 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-slate-50/95 to-transparent" />

        <div
          ref={viewportRef}
          className="overflow-hidden pb-1"
        >
          <div
            ref={trackRef}
            {...handlers}
            style={trackStyle}
            className={cn(
              "flex gap-3",
              isDragging ? "cursor-grabbing select-none" : "cursor-grab",
            )}
          >
          {deck.map(({ action, category }) => {
            const Icon = actionIcons[action.id] ?? Lightbulb
            const accent = categoryAccent[category]
            const canAfford = gameState.money >= action.cost
            const cooldown = cooldowns[action.id] || 0
            const disabled = !canAfford || cooldown > 0
            const recommended = action.id === suggestedId

            return (
              <article
                key={action.id}
                className={cn(
                  "relative flex w-[240px] shrink-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow sm:w-[260px]",
                  disabled && "opacity-65 saturate-50",
                  recommended
                    ? "border-blue-300 shadow-md ring-1 ring-blue-200"
                    : "border-slate-200 hover:border-slate-300 hover:shadow",
                )}
              >
                <div className={cn("h-1 w-full bg-gradient-to-r", accent.stripe)} />

                <div className="flex flex-1 flex-col p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {accent.label}
                    </span>
                    {recommended && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Sugerida
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <span className={cn("mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md", accent.badge)}>
                      <Icon className={cn("h-3.5 w-3.5", accent.icon)} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold leading-snug text-slate-900">{action.title}</h3>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{action.concept}</p>
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{action.description}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <MetricPill label="Cli" value={action.clientSatisfactionChange} />
                    <MetricPill label="Ctrl" value={action.processControlChange} />
                    <MetricPill label="Vel" value={action.executionSpeedChange} />
                    <MetricPill label="Cap" value={action.teamCapacityChange} />
                  </div>

                  {recommended && action.warning && (
                    <p className="mt-2 line-clamp-2 text-[10px] leading-snug text-amber-800/90">
                      <AlertTriangle className="mr-0.5 inline h-3 w-3 -translate-y-px" />
                      {action.warning}
                    </p>
                  )}

                  <div className="mt-auto pt-3">
                    <Button
                      disabled={disabled}
                      onClick={() => onAction(action)}
                      variant={recommended ? "default" : "outline"}
                      className={cn(
                        "min-h-9 w-full text-sm font-semibold",
                        recommended && "bg-blue-600 hover:bg-blue-700",
                        !recommended && "border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-700",
                        disabled && "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-400",
                      )}
                    >
                      {cooldown > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          En {cooldown}t
                        </span>
                      ) : !canAfford ? (
                        "Presupuesto insuficiente"
                      ) : (
                        <>Ejecutar · {formatDecisionCostTier(action.cost)}</>
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
          </div>
        </div>
      </div>
    </div>
  )
}
