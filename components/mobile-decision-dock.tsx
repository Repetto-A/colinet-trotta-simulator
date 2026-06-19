"use client"

import { ArrowDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BusinessActionDefinition } from "@/lib/business-decisions"

interface MobileDecisionDockProps {
  suggestedAction?: BusinessActionDefinition
  canCloseCycle: boolean
  onJumpToDecisions: () => void
  onCloseCycle: () => void
}

export default function MobileDecisionDock({
  suggestedAction,
  canCloseCycle,
  onJumpToDecisions,
  onCloseCycle,
}: MobileDecisionDockProps) {
  const handlePrimaryAction = canCloseCycle ? onCloseCycle : onJumpToDecisions

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700">
            <Sparkles className="h-3.5 w-3.5" />
            Próximo movimiento
          </div>
          <p className="truncate text-sm font-bold text-slate-950">
            {canCloseCycle ? "Ya podés cerrar el ciclo" : suggestedAction?.title ?? "Elegí una decisión estratégica"}
          </p>
        </div>
        <Button onClick={handlePrimaryAction} className="min-h-11 shrink-0 gap-2">
          {canCloseCycle ? "Cerrar ciclo" : "Decidir"}
          {!canCloseCycle && <ArrowDown className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
