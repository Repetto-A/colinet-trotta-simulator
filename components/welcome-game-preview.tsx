"use client"

import { Heart, Radar, ShieldCheck, Users, Wallet } from "lucide-react"
import { WELCOME_CONTENT } from "@/lib/game-content"
import { cn } from "@/lib/utils"

const MOCK_KPIS = [
  { label: "Presupuesto", value: "$630", pct: 100, icon: Wallet, tone: "good" as const },
  { label: "Clientes", value: "54%", pct: 54, icon: Heart, tone: "mid" as const, pulse: true },
  { label: "Control", value: "70%", pct: 70, icon: ShieldCheck, tone: "good" as const },
  { label: "Capacidad", value: "50%", pct: 50, icon: Users, tone: "low" as const },
  { label: "Velocidad", value: "54%", pct: 54, icon: Radar, tone: "mid" as const },
]

const barTone = {
  good: "bg-blue-500",
  mid: "bg-blue-300",
  low: "bg-rose-500",
}

export default function WelcomeGamePreview() {
  return (
    <figure className="w-full">
      <div
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-900/5"
        aria-hidden="true"
      >
        <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold text-slate-800">{WELCOME_CONTENT.brand}</p>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
              Turno 0/10
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-5 sm:gap-2 sm:p-3">
          {MOCK_KPIS.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className={cn(
                  "rounded-lg border border-slate-100 bg-white p-2 sm:p-2.5",
                  kpi.pulse && "welcome-preview-pulse",
                )}
              >
                <div className="mb-1 flex items-center gap-1">
                  <Icon className="h-3 w-3 text-slate-500" />
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[10px]">
                    {kpi.label}
                  </span>
                </div>
                <p className="text-sm font-bold tabular-nums text-slate-900 sm:text-base">{kpi.value}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", barTone[kpi.tone])}
                    style={{ width: `${kpi.pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white px-3 pb-3 pt-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tus equipos</p>
            <span className="text-[10px] font-medium text-sky-700">3 libres</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-lg border border-dashed border-sky-300/80 bg-sky-50/50 px-1.5 py-2 text-center"
              >
                <p className="text-[9px] font-bold text-slate-500">Eq. {n}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-800">Sin frente</p>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
            <p className="text-[10px] font-semibold text-slate-800">Decisiones estratégicas</p>
            <div className="mt-1.5 flex gap-1.5 overflow-hidden">
              <div className="min-w-[42%] shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2 py-1.5">
                <p className="truncate text-[9px] font-semibold text-slate-900">Estabilizar GAUS mp</p>
                <p className="text-[9px] text-sky-700">Ejecutar · $58</p>
              </div>
              <div className="min-w-[38%] shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 opacity-70">
                <p className="truncate text-[9px] font-semibold text-slate-700">Modernizar arq.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground sm:text-left">
        {WELCOME_CONTENT.preview.caption}
      </figcaption>
    </figure>
  )
}
