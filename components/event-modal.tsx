"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EnvironmentalEvent } from "@/types/events"
import { getEventPolarity } from "@/types/events"
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
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-700">{label}</span>
      <span className={cn("font-semibold tabular-nums", positive ? "text-emerald-700" : "text-rose-700")}>
        {money ? (positive ? `+$${value}` : `-$${Math.abs(value)}`) : `${positive ? "+" : ""}${value}%`}
      </span>
    </div>
  )
}

export default function EventModal({ event, availableBudget, currentTurn, onMitigate, onAccept }: EventModalProps) {
  const Icon = eventIcons[event.type] ?? AlertTriangle
  const fortune = getEventPolarity(event) === "fortune"
  const canAffordMitigation = event.canMitigate && event.mitigationCost ? availableBudget >= event.mitigationCost : false
  const severityLabel = fortune ? fortuneSeverityLabels[event.severity] : severityLabels[event.severity]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <Card
        className={cn(
          "event-cycle-card relative max-h-[92vh] w-full max-w-md overflow-y-auto border-4 p-0 shadow-2xl animate-in fade-in slide-in-from-bottom-6 zoom-in-95 sm:max-w-lg",
          fortune ? "border-emerald-400 bg-emerald-50/30" : "border-amber-400 bg-amber-50/20",
        )}
      >
        <div
          className={cn(
            "px-5 py-4 text-center sm:px-6",
            fortune
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              : "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-90">Giro del ciclo · turno {currentTurn}</p>
          <p className="mt-1 text-2xl font-black sm:text-3xl">{fortune ? "¡Buenas noticias!" : "Imprevisto"}</p>
          <p className="mt-1 text-sm opacity-90">
            {fortune ? "Te tocó una carta favorable." : "Sacaste una carta que tensiona el tablero."}
          </p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner",
                fortune ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800",
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold leading-tight text-slate-900">{event.name}</h2>
                <Badge
                  className={cn(
                    fortune
                      ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                      : "border-amber-300 bg-amber-100 text-amber-900",
                  )}
                >
                  {severityLabel}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{event.description}</p>
            </div>
          </div>

          {event.learningConcept && (
            <p className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs leading-relaxed text-violet-900">
              <span className="font-semibold">En la materia:</span> {event.learningConcept}
            </p>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-bold text-slate-900">
              {fortune ? "Qué ganás si capitalizás" : "Impacto si no respondés"}
            </h3>
            <div className="space-y-1.5">
              {event.effects.clientSatisfactionChange && (
                <EffectRow label="Clientes / mercado" value={event.effects.clientSatisfactionChange} />
              )}
              {event.effects.executionSpeedChange && (
                <EffectRow label="Velocidad de ejecución" value={event.effects.executionSpeedChange} />
              )}
              {event.effects.teamCapacityChange && (
                <EffectRow label="Capacidad del equipo" value={event.effects.teamCapacityChange} />
              )}
              {event.effects.processControlChange && (
                <EffectRow label="Control / gobernanza" value={event.effects.processControlChange} />
              )}
              {event.effects.sustainabilityChange && (
                <EffectRow label="Confianza / clima" value={event.effects.sustainabilityChange} />
              )}
              {event.effects.moneyChange && (
                <EffectRow label="Caja" value={event.effects.moneyChange} money />
              )}
            </div>
            {event.duration > 1 && (
              <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                Efecto repartido en {event.duration} turnos
              </p>
            )}
          </div>

          {!fortune && event.canMitigate && event.mitigationCost && event.mitigationEffectiveness && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <h3 className="text-sm font-bold text-sky-900">Responder con presupuesto</h3>
              <p className="mt-1 text-sm text-sky-800">
                Reducís el impacto en {Math.round(event.mitigationEffectiveness * 100)}% por ${event.mitigationCost}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            {!fortune && event.canMitigate && event.mitigationCost && (
              <Button
                onClick={onMitigate}
                disabled={!canAffordMitigation}
                className="min-h-11 flex-1 bg-sky-700 hover:bg-sky-800"
              >
                Responder (${event.mitigationCost})
              </Button>
            )}
            <Button
              onClick={onAccept}
              variant={fortune ? "default" : "outline"}
              className={cn(
                "min-h-11 font-semibold",
                fortune ? "flex-1 bg-emerald-600 hover:bg-emerald-700" : "flex-1",
                !event.canMitigate && !fortune && "w-full",
              )}
            >
              {fortune ? "Capitalizar oportunidad" : event.canMitigate ? "Asumir impacto" : "Continuar"}
            </Button>
          </div>

          {!fortune && event.canMitigate && !canAffordMitigation && (
            <p className="text-center text-xs text-rose-600">No alcanza el presupuesto para responder</p>
          )}
        </div>
      </Card>
    </div>
  )
}
