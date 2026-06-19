"use client"

import { REDESIGN_FOCUS_LABELS, type JobPosition } from "@/types/job-positions"

interface JobDesignDiagramProps {
  position: JobPosition
}

function DimensionBar({
  label,
  current,
  target,
  idealMin,
  idealMax,
  fixed,
}: {
  label: string
  current: number
  target: number
  idealMin: number
  idealMax: number
  fixed: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {current}%{fixed ? "" : ` → ${target}%`}
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 rounded-full bg-emerald-200/80"
          style={{ left: `${idealMin}%`, width: `${idealMax - idealMin}%` }}
        />
        <div
          className={`absolute inset-y-0 rounded-full ${fixed ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${Math.min(100, current)}%` }}
        />
        {!fixed && (
          <div
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-violet-600"
            style={{ left: `${target}%` }}
          />
        )}
      </div>
    </div>
  )
}

export default function JobDesignDiagram({ position }: JobDesignDiagramProps) {
  const focusLabel = REDESIGN_FOCUS_LABELS[position.redesignFocus]

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Diseño del puesto</p>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-800">{focusLabel}</span>
      </div>

      <DimensionBar
        label="Amplitud (tareas y alcance)"
        current={position.amplitude}
        target={position.targetAmplitude}
        idealMin={35}
        idealMax={65}
        fixed={position.fixed}
      />
      <DimensionBar
        label="Enriquecimiento (autonomía y significado)"
        current={position.enrichment}
        target={position.targetEnrichment}
        idealMin={55}
        idealMax={90}
        fixed={position.fixed}
      />

      <p className="text-xs leading-relaxed text-slate-600">
        {position.fixed
          ? "La barra verde marca el diseño actual; la zona clara es el rango saludable para escalar sin desgaste."
          : "La línea violeta es el objetivo del rediseño. Fuera del rango saludable, el puesto genera fricción al crecer."}
      </p>
    </div>
  )
}
