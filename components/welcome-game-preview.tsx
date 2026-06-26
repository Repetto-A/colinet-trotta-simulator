"use client"

import { Heart, Radar, ShieldCheck, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { WELCOME_CONTENT } from "@/lib/game-content"
import { cycleMonthName } from "@/lib/cycle-months"
import { KPI_SHORT } from "@/lib/kpi-glossary"
import { cn } from "@/lib/utils"

interface MockKpi {
  label: string
  value: string
  pct: number
  icon: LucideIcon
  iconBg: string
  iconColor: string
  valueTone: string
  bar: string
  track: string
  pulse?: boolean
}

// Espeja KpiStrip: azul=sano, slate=medio, rose=bajo, cian=velocidad
const MOCK_KPIS: MockKpi[] = [
  {
    label: KPI_SHORT.clients,
    value: "54%",
    pct: 54,
    icon: Heart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    valueTone: "text-slate-700",
    bar: "bg-blue-300",
    track: "bg-blue-100/70",
    pulse: true,
  },
  {
    label: KPI_SHORT.control,
    value: "70%",
    pct: 70,
    icon: ShieldCheck,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    valueTone: "text-blue-700",
    bar: "bg-blue-500",
    track: "bg-blue-100/70",
  },
  {
    label: KPI_SHORT.capacity,
    value: "50%",
    pct: 50,
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    valueTone: "text-slate-700",
    bar: "bg-blue-300",
    track: "bg-slate-100",
  },
  {
    label: KPI_SHORT.speed,
    value: "54%",
    pct: 54,
    icon: Radar,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
    valueTone: "text-slate-700",
    bar: "bg-blue-300",
    track: "bg-cyan-100/80",
  },
]

export default function WelcomeGamePreview() {
  return (
    <div className="w-full">
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-lg shadow-slate-300/30 backdrop-blur-sm"
      >
        {/* Header — espeja StrategicHeader */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-4 py-2.5">
          <p className="text-sm font-bold text-slate-950">{WELCOME_CONTENT.brand}</p>
          <span className="text-xs font-semibold text-slate-700">{cycleMonthName(0)}</span>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-5">
          {/* Presupuesto — tarjeta destacada */}
          <div className="col-span-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:col-span-1">
            <div className="flex items-center justify-between gap-1">
              <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{KPI_SHORT.budget}</p>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-700">
                <Wallet className="h-3 w-3 text-blue-100" />
              </span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-blue-700">$630</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-blue-50">
              <div className="h-full rounded-full bg-blue-500" style={{ width: "100%" }} />
            </div>
          </div>

          {MOCK_KPIS.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className={cn(
                  "rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm",
                  kpi.pulse && "welcome-preview-pulse",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{kpi.label}</p>
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md", kpi.iconBg)}>
                    <Icon className={cn("h-3 w-3", kpi.iconColor)} />
                  </span>
                </div>
                <p className={cn("mt-1 text-xl font-bold tabular-nums tracking-tight", kpi.valueTone)}>{kpi.value}</p>
                <div className={cn("mt-2 h-1 overflow-hidden rounded-full", kpi.track)}>
                  <div className={cn("h-full rounded-full", kpi.bar)} style={{ width: `${kpi.pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Equipos */}
        <div className="border-t border-slate-200/80 px-3 pb-3 pt-2.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tus equipos</p>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">3 libres</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-1.5 py-2.5 text-center"
              >
                <p className="text-[9px] font-bold uppercase text-slate-400">Eq. {n}</p>
                <p className="mt-0.5 text-[11px] font-bold text-blue-700">Asignar</p>
              </div>
            ))}
          </div>

          {/* Decisión */}
          <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Decisión estratégica</p>
            <div className="mt-1.5 flex gap-2">
              <div className="min-w-[46%] shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5">
                <p className="truncate text-[10px] font-bold text-slate-900">Estabilizar GAUS</p>
                <p className="text-[9px] text-blue-700">Ejecutar · $58</p>
              </div>
              <div className="min-w-[40%] shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 opacity-70">
                <p className="truncate text-[10px] font-semibold text-slate-600">Modernizar arq.</p>
                <p className="text-[9px] text-slate-400">Ejecutar · $92</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
