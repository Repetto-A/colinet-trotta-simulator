"use client"

import WelcomeGamePreview from "@/components/welcome-game-preview"
import { Button } from "@/components/ui/button"
import { WELCOME_CONTENT } from "@/lib/game-content"
import { cycleMonthName } from "@/lib/cycle-months"
import { cn } from "@/lib/utils"
import { ArrowRight, Clock, Play, RotateCcw, Wallet } from "lucide-react"

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

export default function WelcomeScreen({ onStart, onContinue, savedSession }: WelcomeScreenProps) {
  const { hero, frameworkChips, cta, savePanel } = WELCOME_CONTENT
  const hasSave = Boolean(onContinue && savedSession)

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-background pb-[env(safe-area-inset-bottom)] text-foreground"
      aria-labelledby="welcome-heading"
    >
      {/* Ambient glow — game brand (blue primary + warm amber) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(37,99,235,0.10),transparent),radial-gradient(ellipse_45%_45%_at_92%_15%,rgba(217,160,60,0.10),transparent)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {hasSave && savedSession && (
          <div className="mb-8 rounded-2xl border border-blue-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-blue-100"
                >
                  <RotateCcw className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">{savePanel.title}</p>
                  <p className="truncate text-lg font-bold text-slate-950">{savedSession.scenarioName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{cycleMonthName(savedSession.turn)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Wallet aria-hidden="true" className="h-3 w-3" />
                      <span className="font-bold tabular-nums text-slate-800">${savedSession.budget}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock aria-hidden="true" className="h-3 w-3" />
                      {savedSession.savedAgoLabel}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={onContinue}
                className="min-h-12 w-full shrink-0 touch-manipulation rounded-xl bg-blue-700 px-6 text-base font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:w-auto"
              >
                <Play aria-hidden="true" className="mr-2 h-4 w-4 fill-current" />
                {cta.continue}
              </Button>
            </div>
          </div>
        )}

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          {/* Pitch */}
          <div className="space-y-7">
            <div className="space-y-4">
              <h1
                id="welcome-heading"
                className="text-balance text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem]"
              >
                {hero.headline}
                <span className="mt-1 block text-blue-700">{hero.headlineAccent}</span>
              </h1>
              <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">{hero.subhead}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={onStart}
                className={cn(
                  "group min-h-12 w-full touch-manipulation rounded-xl px-7 text-base font-bold transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto",
                  hasSave
                    ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-400"
                    : "bg-blue-700 text-white shadow-sm hover:bg-blue-800 focus-visible:ring-blue-500",
                )}
              >
                {hasSave ? cta.newCycle : cta.start}
                <ArrowRight
                  aria-hidden="true"
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </Button>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Frameworks en juego</p>
              <div className="flex flex-wrap gap-1.5">
                {frameworkChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Live board */}
          <div className="lg:pl-2">
            <WelcomeGamePreview />
          </div>
        </div>
      </div>
    </main>
  )
}

