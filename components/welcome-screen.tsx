"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Building2 } from "lucide-react"
import { GAME_CONTENT, WELCOME_CARDS } from "@/lib/game-content"

const CARD_DOTS = ["bg-sky-500", "bg-emerald-500", "bg-amber-500"] as const

interface WelcomeScreenProps {
  onStart: () => void
  onContinue?: () => void
  continueHint?: string
}

export default function WelcomeScreen({ onStart, onContinue, continueHint }: WelcomeScreenProps) {
  const titleParts = GAME_CONTENT.title.split(":")

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-background to-indigo-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14 xl:gap-20">
          {/* Hero */}
          <div className="space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Building2 className="h-3.5 w-3.5" />
              {GAME_CONTENT.eyebrow}
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {titleParts[0]}
              <span className="mt-1 block text-primary">{titleParts[1]?.trim()}</span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
              {GAME_CONTENT.subtitle}
            </p>
            <p className="hidden text-sm text-muted-foreground/80 lg:block">{GAME_CONTENT.footer}</p>
          </div>

          {/* Panel derecho: cards + acciones */}
          <div className="mx-auto w-full max-w-xl space-y-6 lg:max-w-none">
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 md:gap-3 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-border/60">
                {WELCOME_CARDS.map((card, index) => (
                  <div
                    key={card.title}
                    className={cn(
                      "flex items-start gap-3 md:flex-col md:gap-2 lg:flex-row lg:gap-4 lg:py-4 lg:first:pt-0 lg:last:pb-0",
                    )}
                  >
                    <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full md:mt-0", CARD_DOTS[index])} />
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">{card.title}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              {onContinue && (
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="w-full rounded-xl px-8 py-5 text-base font-semibold sm:w-auto lg:min-w-[180px] bg-indigo-600 hover:bg-indigo-700"
                >
                  Retomar partida
                </Button>
              )}
              <Button
                size="lg"
                variant={onContinue ? "outline" : "default"}
                onClick={onStart}
                className="w-full rounded-xl px-8 py-5 text-base font-semibold sm:w-auto lg:min-w-[180px]"
              >
                {onContinue ? "Empezar nuevo ciclo" : GAME_CONTENT.startCta}
              </Button>
            </div>

            {onContinue && continueHint && (
              <p className="text-center text-sm text-muted-foreground lg:text-left">
                Último guardado: {continueHint}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
