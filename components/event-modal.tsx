"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const HOLD_MS = 1100

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

  const [revealed, setRevealed] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const holdRef = useRef<number | null>(null)
  const startRef = useRef(0)

  const finishReveal = useCallback(() => {
    setHoldProgress(100)
    setRevealed(true)
    setCelebrate(true)
    window.setTimeout(() => setCelebrate(false), 900)
  }, [])

  const startHold = useCallback(() => {
    if (revealed) return
    startRef.current = performance.now()
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - startRef.current) / HOLD_MS) * 100)
      setHoldProgress(pct)
      if (pct >= 100) {
        holdRef.current = null
        finishReveal()
        return
      }
      holdRef.current = requestAnimationFrame(tick)
    }
    holdRef.current = requestAnimationFrame(tick)
  }, [revealed, finishReveal])

  const cancelHold = useCallback(() => {
    if (holdRef.current) cancelAnimationFrame(holdRef.current)
    holdRef.current = null
    if (!revealed) setHoldProgress(0)
  }, [revealed])

  useEffect(() => () => {
    if (holdRef.current) cancelAnimationFrame(holdRef.current)
  }, [])

  const accent = fortune
    ? { stripe: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-700", glow: "event-card-celebrate" }
    : { stripe: "bg-amber-500", icon: "bg-amber-50 text-amber-800", glow: "event-card-shake" }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-slate-950/70 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <Card
        className={cn(
          "relative max-h-[92vh] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg",
          revealed && celebrate && accent.glow,
        )}
      >
        {!revealed ? (
          <button
            type="button"
            className="group relative flex w-full flex-col items-center px-6 py-10 text-center outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            onPointerDown={(e) => {
              e.preventDefault()
              startHold()
            }}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onClick={() => {
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finishReveal()
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e3a5f_0%,#0f172a_55%,#020617_100%)]" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 12px)",
              }}
            />
            <div className="relative mb-6 flex h-24 w-16 items-center justify-center rounded-lg border-2 border-amber-200/40 bg-gradient-to-b from-amber-100/90 to-amber-200/70 shadow-lg">
              <span className="text-3xl font-black text-amber-900/80">?</span>
            </div>
            <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-amber-100/90">
              Carta del ciclo
            </p>
            <h2 className="relative mt-2 text-xl font-bold text-white">Colinet Trotta</h2>
            <p className="relative mt-2 max-w-xs text-sm text-slate-300">
              Mantené presionado para sacar la carta · turno {currentTurn}
            </p>
            <div className="relative mt-6 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-[width] duration-75 ease-linear"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
            <p className="relative mt-2 text-[11px] text-slate-400">Soltá antes de tiempo y volvés a empezar</p>
          </button>
        ) : (
          <>
            <div className={cn("h-1.5 w-full", accent.stripe)} />
            <div className="space-y-4 p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Carta del ciclo · turno {currentTurn}
                  </p>
                  <h2 className="mt-1 text-xl font-bold leading-tight text-slate-950 sm:text-2xl">{event.name}</h2>
                </div>
                {!fortune && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {severityLabels[event.severity]}
                  </span>
                )}
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
                  {fortune ? "Si capitalizás" : "Si no actuás"}
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
                {fortune && event.effects.moneyChange && (
                  <p className="mt-3 text-xs text-slate-500">
                    Si elegís &quot;{labels.accept}&quot;, solo sumás la caja sin el resto del impulso.
                  </p>
                )}
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
                      className="min-h-11 w-full bg-slate-900 font-semibold hover:bg-slate-800"
                    >
                      {labels.mitigate}
                    </Button>
                    {labels.mitigateDetail && (
                      <p className="px-1 text-center text-xs text-slate-500">{labels.mitigateDetail}</p>
                    )}
                  </>
                )}

                {fortune ? (
                  <>
                    <Button
                      onClick={onMitigate}
                      className="min-h-11 w-full bg-emerald-600 font-semibold hover:bg-emerald-700"
                    >
                      {labels.fortune ?? labels.mitigate}
                    </Button>
                    <Button
                      onClick={onAccept}
                      variant="outline"
                      className="min-h-11 w-full border-slate-300 font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      {labels.accept}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onAccept}
                    variant="outline"
                    className="min-h-11 w-full border-slate-300 font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {labels.accept}
                  </Button>
                )}
              </div>

              {!fortune && event.canMitigate && !canAffordMitigation && (
                <p className="text-center text-xs text-rose-600">
                  No alcanza la caja para {labels.mitigate.split(" · ")[0].toLowerCase()}.
                </p>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
