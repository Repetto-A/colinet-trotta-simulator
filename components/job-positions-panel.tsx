"use client"

import { Briefcase, CheckCircle2, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import JobDesignDiagram from "@/components/job-design-diagram"
import { getJobDesignSummary } from "@/lib/job-positions"
import type { BusinessGameState } from "@/types/business-game"
import type { JobPosition } from "@/types/job-positions"
import { REDESIGN_FOCUS_LABELS } from "@/types/job-positions"

interface JobPositionsPanelProps {
  gameState: BusinessGameState
  onRedesign: (positionId: string) => void
}

const issueLabels: Record<JobPosition["issue"], string> = {
  overload: "Sobrecarga",
  narrow_scope: "Puesto estrecho",
  unclear_ownership: "Roles difusos",
  skill_mismatch: "Desajuste",
}

function designScoreColor(score: number) {
  if (score >= 70) return "text-emerald-700 bg-emerald-100"
  if (score >= 45) return "text-amber-700 bg-amber-100"
  return "text-red-700 bg-red-100"
}

export default function JobPositionsPanel({ gameState, onRedesign }: JobPositionsPanelProps) {
  const summary = getJobDesignSummary(gameState)
  const visiblePositions = gameState.jobPositions.filter((position) => position.revealed)

  if (visiblePositions.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          A medida que asignés iniciativas y avance el ciclo, aparecerán puestos mal diseñados que conviene ordenar
          antes de seguir escalando.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-white">
          Diseño promedio: {summary.avgScore}%
        </Badge>
        {summary.unfixed > 0 ? (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {summary.unfixed} pendiente{summary.unfixed > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Estructura alineada al ritmo</Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Cada puesto mal diseñado drena capacidad del equipo. Medí <strong>amplitud</strong> (alcance de tareas) y{" "}
        <strong>enriquecimiento</strong> (autonomía y significado) antes de rediseñar.
      </p>

      <div className="space-y-3">
        {visiblePositions.map((position) => {
          const canAfford = gameState.money >= position.redesignCost

          return (
            <Card
              key={position.id}
              className={`p-4 ${position.fixed ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-white"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${position.fixed ? "bg-emerald-100" : "bg-amber-100"}`}
                >
                  {position.fixed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <Briefcase className="h-5 w-5 text-amber-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-950">{position.title}</h3>
                      <p className="text-xs text-muted-foreground">{position.area}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${designScoreColor(position.designScore)}`}
                    >
                      {position.fixed ? "Rediseñado" : `${position.designScore}% diseño`}
                    </span>
                  </div>

                  {!position.fixed ? (
                    <>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          {issueLabels[position.issue]}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-violet-50 text-violet-800 border-violet-200">
                          {position.fixConcept}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{position.issueLabel}</p>
                      <p className="mt-2 rounded-md bg-violet-50 px-3 py-2 text-xs leading-relaxed text-violet-900">
                        <span className="font-semibold">En la materia:</span> {position.fixConcept} ·{" "}
                        {REDESIGN_FOCUS_LABELS[position.redesignFocus]}
                      </p>
                      <JobDesignDiagram position={position} />
                      <Button
                        disabled={!canAfford}
                        onClick={() => onRedesign(position.id)}
                        variant="outline"
                        className="mt-3 min-h-11 w-full border-amber-300 hover:bg-amber-50 sm:w-auto"
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        {canAfford
                          ? `Rediseñar puesto · $${position.redesignCost}`
                          : `Presupuesto insuficiente · $${position.redesignCost}`}
                      </Button>
                    </>
                  ) : (
                    <>
                      <JobDesignDiagram position={position} />
                      <p className="mt-2 text-sm text-emerald-800">
                      {position.fixConcept} aplicado: el rol ya acompaña la escala actual de la empresa.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
