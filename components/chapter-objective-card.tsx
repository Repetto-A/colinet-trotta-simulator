import { AlertTriangle, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { StoryBeat } from "@/lib/story-arc"

interface ChapterObjectiveCardProps {
  storyBeat: StoryBeat
}

export default function ChapterObjectiveCard({ storyBeat }: ChapterObjectiveCardProps) {
  return (
    <Card className="border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <Target className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Capítulo {storyBeat.chapter}</p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-950">{storyBeat.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{storyBeat.brief}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{storyBeat.objective}</p>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{storyBeat.risk}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
