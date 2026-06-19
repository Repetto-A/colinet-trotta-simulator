"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EnvironmentalEvent } from "@/types/events"
import { getEventPolarity, getEventResponseLabels } from "@/types/events"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Briefcase,
  Bug,
  DollarSign,
  GraduationCap,
  PartyPopper,
  Scale,
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
  Wrench,
} from "lucide-react"

interface EventModalProps {
  event: EnvironmentalEvent
  availableBudget: number
  currentTurn: number
  onMitigate: () => void
  onAccept: () => void
}

const eventIcons: Record<string, typeof Users> = {
  client_escalation: Users,
  regulatory_change: ShieldCheck,
  security_audit: Siren,
  competitor_move: Briefcase,
  talent_churn: Users,
  vendor_blocker: Workflow,
  delivery_bottleneck: Wrench,
  ai_incident: Bug,
  fx_gap: DollarSign,
  salary_parity: Scale,
  training_gap: GraduationCap,
  client_renewal: PartyPopper,
  talent_referral: Sparkles,
  efficiency_breakthrough: TrendingUp,
  subsidy_grant: DollarSign,
  partnership_win: Briefcase,
}

const severityLabels = {
  low: "Leve",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
}

const fortuneSeverityLabels = {
  low: "Buena",
  medium: "Muy buena",
  high: "Excepcional",
  critical: "Excepcional",
}

function EffectRow({ label, value, money = false }: { label: string; value: number; money?: boolean }) {
  const positive = value > 0
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={cn("shrink-0 font-semibold tabular-nums", positive ? "text-emerald-700" : "text-rose-700")}>
        {money ? (positive ? `+$${value}` : `-$${Math.abs(value)}`) : `${positive ? "+" : ""}${value}%`}
      </span>
    </div>
  )
}

export default function EventModal({ event, availableBudget, currentTurn, onMitigate, onAccept }: EventModalProps) {
  const Icon = eventIcons[event.type] ?? AlertTriangle
  const fortune = getEventPolarity(event) === "fortune"
  const labels = getEventResponseLabels(event)
  const canAffordMitigation = event.canMitigate && event.mitigationCost ? availableBudget >= event.mitigationCost : false
  const severityLabel = fortune ? fortuneSeverityLabels[event.severity] : severityLabels[event.severity]

  const accent = fortune
    ? { stripe: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800", icon: "bg-emerald-50 text-emerald-700" }
    : { stripe: "bg-amber-500", badge: "bg-amber-100 text-amber-900", icon: "bg-amber-50 text-amber-800" }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-slate-900/60 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
      <Card className="relative max-h-[92vh] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:max-w-lg">
        <div className={cn("h-1.5 w-full", accent.stripe)} />

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {fortune ? "Giro favorable" : "Imprevisto"} · turno {currentTurn}
              </p>
              <h2 className="mt-1 text-xl font-bold leading-tight text-slate-950 sm:text-2xl">{event.name}</h2>
            </div>
            <Badge variant="outline" className={cn("shrink-0 border-0", accent.badge)}>
              {severityLabel}
            </Badge>
          </div>

          <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", accent.icon)}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{event.description}</p>
          </div>

          {event.learningConcept && (
            <p className="border-l-2 border-violet-300 pl-3 text-xs leading-relaxed text-slate-600">
              <span className="font-semibold text-violet-800">Marco:</span> {event.learningConcept}
            </p>
          )}

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              {fortune ? "Si lo aprovechás" : "Si no actuás"}
            </h3>
            <div className="space-y-2">
              {event.effects.clientSatisfactionChange !== undefined && (
                <EffectRow label="Clientes / mercado" value={event.effects.clientSatisfactionChange} />
              )}
              {event.effects.executionSpeedChange !== undefined && (
                <EffectRow label="Velocidad" value={event.effects.executionSpeedChange} />
              )}
              {event.effects.teamCapacityChange !== undefined && (
                <EffectRow label="Capacidad del equipo" value={event.effects.teamCapacityChange} />
              )}
              {event.effects.processControlChange !== undefined && (
                <EffectRow label="Control / gobernanza" value={event.effects.processControlChange} />
              )}
              {event.effects.sustainabilityChange !== undefined && (
                <EffectRow label="Confianza / clima" value={event.effects.sustainabilityChange} />
              )}
              {event.effects.moneyChange !== undefined && (
                <EffectRow label="Caja" value={event.effects.moneyChange} money />
              )}
            </div>
            {event.duration > 1 && (
              <p className="mt-3 text-xs text-slate-500">Impacto repartido en {event.duration} turnos.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {!fortune && event.canMitigate && event.mitigationCost && (
              <>
                <Button
                  onClick={onMitigate}
                  disabled={!canAffordMitigation}
                  className="min-h-11 w-full bg-slate-900 text-left font-semibold hover:bg-slate-800"
                >
                  {labels.mitigate}
                </Button>
                {labels.mitigateDetail && (
                  <p className="px-1 text-center text-xs text-slate-500">{labels.mitigateDetail}</p>
                )}
              </>
            )}

            <Button
              onClick={onAccept}
              variant={fortune ? "default" : "outline"}
              className={cn(
                "min-h-11 w-full font-semibold",
                fortune && "bg-emerald-600 hover:bg-emerald-700",
                !fortune && "border-slate-300 text-slate-800 hover:bg-slate-50",
              )}
            >
              {fortune ? labels.fortune ?? labels.mitigate : labels.accept}
            </Button>
          </div>

          {!fortune && event.canMitigate && !canAffordMitigation && (
            <p className="text-center text-xs text-rose-600">No alcanza la caja para {labels.mitigate.split(" · ")[0].toLowerCase()}.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
