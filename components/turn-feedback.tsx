import { TrendingDown, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { TurnFeedbackSummary } from "@/lib/game-engine"

interface TurnFeedbackProps {
  feedback: TurnFeedbackSummary | null
}

export default function TurnFeedback({ feedback }: TurnFeedbackProps) {
  if (!feedback) return null

  return (
    <Card className="border-indigo-200 bg-indigo-50/70 p-4">
      <p className="text-sm font-bold text-indigo-950">{feedback.title}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {feedback.gains.length > 0 && (
          <div className="rounded-lg bg-white/80 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <TrendingUp className="h-4 w-4" />
              Ganaste
            </div>
            <div className="flex flex-wrap gap-1.5">
              {feedback.gains.slice(0, 3).map((item) => (
                <span key={item.label} className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                  {item.label} +{item.delta}
                </span>
              ))}
            </div>
          </div>
        )}
        {feedback.losses.length > 0 && (
          <div className="rounded-lg bg-white/80 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
              <TrendingDown className="h-4 w-4" />
              Cediste
            </div>
            <div className="flex flex-wrap gap-1.5">
              {feedback.losses.slice(0, 3).map((item) => (
                <span key={item.label} className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                  {item.label} {item.delta}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs font-medium text-indigo-900">Riesgo a mirar ahora: {feedback.risk}</p>
    </Card>
  )
}
