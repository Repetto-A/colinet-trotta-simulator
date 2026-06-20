"use client"

import WelcomeGamePreview from "@/components/welcome-game-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WELCOME_CONTENT } from "@/lib/game-content"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Clock,
  DollarSign,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

export interface SavedSessionInfo {
  scenarioName: string
  turn: number
  budget: number
  savedAgoLabel: string
}

interface WelcomeScreenProps {
  onStart: () => void
  onContinue?: () => void
  savedSession?: SavedSessionInfo
}

const TENSION_ICONS = {
  clients: Users,
  cash: DollarSign,
  regulation: ShieldCheck,
  team: Users,
} as const

const toneClass = {
  neutral: "border-slate-200 bg-white",
  warning: "border-amber-200/80 bg-amber-50/40",
  critical: "border-rose-200/80 bg-rose-50/40",
}

export default function WelcomeScreen({ onStart, onContinue, savedSession }: WelcomeScreenProps) {
  const { hero, tensionPillars, frameworkChips, cta, savePanel, brand } = WELCOME_CONTENT
  const hasSave = Boolean(onContinue && savedSession)

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white"
      aria-labelledby="welcome-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.18),transparent)]" />
      <div className="pointer-events-none absolute -right-24 top-32 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {hasSave && savedSession && (
          <Card className="mb-8 border-sky-400/40 bg-white/95 p-4 shadow-xl shadow-sky-900/20 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <RotateCcw className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{savePanel.title}</p>
                    <p className="truncate text-base font-bold text-slate-950">{savedSession.scenarioName}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-[10px] font-semibold uppercase text-slate-500">{savePanel.turnLabel}</dt>
                    <dd className="font-bold tabular-nums text-slate-900">{savedSession.turn}</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-[10px] font-semibold uppercase text-slate-500">{savePanel.budgetLabel}</dt>
                    <dd className="font-bold tabular-nums text-slate-900">${savedSession.budget}</dd>
                  </div>
                  <div className="col-span-2 rounded-lg bg-slate-50 px-2.5 py-2 sm:col-span-2">
                    <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-500">
                      <Clock className="h-3 w-3" />
                      {savePanel.savedLabel}
                    </dt>
                    <dd className="font-medium text-slate-800">{savedSession.savedAgoLabel}</dd>
                  </div>
                </dl>
              </div>
              <Button
                size="lg"
                onClick={onContinue}
                className="min-h-11 w-full shrink-0 rounded-xl bg-indigo-600 px-6 font-semibold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 lg:w-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                {cta.continue}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-100"
              >
                <Sparkles className="mr-1.5 inline h-3 w-3" />
                {hero.eyebrow}
              </Badge>

              <div className="space-y-2">
                <h1 id="welcome-heading" className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
                  {hero.headline}
                  <span className="mt-1 block text-sky-300">{hero.headlineAccent}</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">{hero.subhead}</p>
              </div>

              <p className="border-l-2 border-amber-400/80 pl-3 text-sm font-medium leading-relaxed text-amber-100/95 sm:text-base">
                {hero.promise}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {tensionPillars.map((pillar) => {
                const Icon = TENSION_ICONS[pillar.id as keyof typeof TENSION_ICONS] ?? Users
                return (
                  <div
                    key={pillar.id}
                    className={cn(
                      "rounded-xl border p-2.5 transition-colors hover:border-sky-400/40 sm:p-3",
                      toneClass[pillar.tone],
                    )}
                  >
                    <div className="mb-1 flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{pillar.label}</span>
                    </div>
                    <p className="text-lg font-bold tabular-nums text-slate-900">{pillar.value}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-slate-600 sm:text-[11px]">{pillar.hint}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {frameworkChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="lg"
                variant={hasSave ? "outline" : "default"}
                onClick={onStart}
                className={cn(
                  "min-h-11 w-full rounded-xl px-6 text-base font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto",
                  hasSave
                    ? "border-white/20 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white/50 focus-visible:ring-offset-slate-900"
                    : "bg-sky-500 text-white hover:bg-sky-400 focus-visible:ring-sky-300 focus-visible:ring-offset-slate-900",
                )}
              >
                {hasSave ? cta.newCycle : cta.start}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!hasSave && (
                <p className="text-center text-sm text-slate-400 sm:text-left">{cta.startHint}</p>
              )}
              {hasSave && (
                <p className="text-center text-xs text-slate-400 sm:text-left">
                  {cta.newCycle} borra el progreso guardado y te lleva a elegir escenario.
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500">{hero.footer}</p>
          </div>

          <div className="lg:pl-2">
            <WelcomeGamePreview />
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-600 lg:text-left">
          {brand} · Decisiones que Importan
        </p>
      </div>
    </main>
  )
}
