"use client"

import { Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BusinessGameState } from "@/types/business-game"
import type { EnvironmentalEvent } from "@/types/events"
import { getEventPolarity } from "@/types/events"

interface ActiveEventsRailProps {
  modifiers: BusinessGameState["activeModifiers"]
  pendingEvent?: EnvironmentalEvent | null
}

export default function ActiveEventsRail({ modifiers, pendingEvent }: ActiveEventsRailProps) {
  if (!pendingEvent && modifiers.length === 0) return null

  const pendingFortune = pendingEvent ? getEventPolarity(pendingEvent) === "fortune" : false

  return (
    <section
      aria-label="Giros del ciclo activos"
      className="overflow-hidden rounded-2xl border-2 border-dashed border-slate-300/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-3 shadow-sm sm:p-4"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-lg">🎲</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Giro del ciclo</p>
            <p className="text-sm font-semibold text-slate-900">Como en la vida: imprevistos buenos y malos</p>
          </div>
        </div>
        {pendingEvent && (
          <span
            className={cn(
              "inline-flex animate-pulse items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
              pendingFortune ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900",
            )}
          >
            Carta pendiente
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {pendingEvent && (
          <span
            className={cn(
              "inline-flex max-w-full items-start gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium shadow-sm",
              pendingFortune
                ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                : "border-amber-300 bg-amber-50 text-amber-950",
            )}
          >
            {pendingFortune ? (
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            )}
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-wide opacity-70">
                {pendingFortune ? "Buenas noticias" : "Imprevisto"}
              </span>
              {pendingEvent.name}
            </span>
          </span>
        )}

        {modifiers.map((modifier) => {
          const fortune = modifier.polarity === "fortune"
          return (
            <span
              key={modifier.eventId}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                fortune
                  ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
                  : "border-rose-200 bg-rose-50/90 text-rose-900",
              )}
            >
              <span>{fortune ? "✦" : "⚡"}</span>
              <span className="max-w-[12rem] truncate">{modifier.eventName}</span>
              <span className="tabular-nums opacity-70">{modifier.turnsLeft}t</span>
            </span>
          )
        })}
      </div>
    </section>
  )
}
