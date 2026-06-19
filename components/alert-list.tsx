"use client"

import { X, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface AlertListProps {
  alerts: string[]
  onDismiss: (index: number) => void
  className?: string
}

export default function AlertList({ alerts, onDismiss, className }: AlertListProps) {
  if (alerts.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
        {alerts.length === 1 ? "Alerta" : `${alerts.length} alertas`}
      </p>

      <ul className="space-y-2">
        {alerts.map((message, index) => (
          <li key={`${index}-${message.slice(0, 24)}`}>
            <Alert className="flex items-start gap-3 border-amber-200 bg-amber-50 py-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <AlertDescription className="min-w-0 flex-1 text-sm font-medium leading-snug text-amber-900">
                {message}
              </AlertDescription>
              <button
                type="button"
                onClick={() => onDismiss(index)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-900"
                aria-label={`Descartar alerta ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          </li>
        ))}
      </ul>
    </div>
  )
}
