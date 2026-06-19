"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EnvironmentalEvent } from "@/types/events"
import { AlertTriangle, Briefcase, Bug, DollarSign, GraduationCap, Scale, ShieldCheck, Siren, Users, Workflow, Wrench } from "lucide-react"

interface EventModalProps {
  event: EnvironmentalEvent
  availableBudget: number
  currentTurn: number
  onMitigate: () => void
  onAccept: () => void
}

const eventIcons = {
  client_escalation: Users,
  regulatory_change: ShieldCheck,
  security_audit: Siren,
  competitor_move: Briefcase,
  talent_churn: Users,
  vendor_blocker: Workflow,
  delivery_bottleneck: Wrench,
  ai_incident: Bug,
  fx_gap: DollarSign,
  salary_parity: Scale,
  training_gap: GraduationCap,
}

const severityColors = {
  low: "bg-yellow-100 text-yellow-800 border-yellow-300",
  medium: "bg-orange-100 text-orange-800 border-orange-300",
  high: "bg-red-100 text-red-800 border-red-300",
  critical: "bg-red-200 text-red-900 border-red-400",
}

const severityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
}

const chapterByTurn = (turn: number) => {
  if (turn <= 2) return 1
  if (turn <= 5) return 2
  if (turn <= 8) return 3
  return 4
}

const chapterLabels: Record<number, string> = {
  1: "Aterrizaje",
  2: "Presión cruzada",
  3: "Punto de inflexión",
  4: "Cierre del ciclo",
}

const eventNarrativeLead: Record<EnvironmentalEvent["type"], string> = {
  client_escalation: "Un cliente clave sube la presión y exige respuesta inmediata del comité.",
  regulatory_change: "El entorno regulatorio se movió y obliga a reordenar prioridades.",
  security_audit: "La confianza quedó bajo lupa: ahora hay que demostrar control real.",
  competitor_move: "El mercado se aceleró y la narrativa competitiva cambió de golpe.",
  talent_churn: "La tensión interna impacta capacidad y pone en riesgo la ejecución.",
  vendor_blocker: "Una dependencia externa frenó el ritmo y expuso fragilidad operativa.",
  delivery_bottleneck: "Se acumuló fricción en entrega: el sistema empezó a trabarse.",
  ai_incident: "Una iniciativa de IA abrió riesgo reputacional y operativo al mismo tiempo.",
  fx_gap: "El tipo de cambio desacomodó costos en USD y obliga a reequilibrar caja e inversiones.",
  salary_parity: "La paritaria salarial tensiona caja, retención y expectativas internas al mismo tiempo.",
  training_gap: "La empresa escala más rápido que lo que el equipo aprendió a ejecutar con calidad.",
}

export default function EventModal({ event, availableBudget, currentTurn, onMitigate, onAccept }: EventModalProps) {
  const Icon = eventIcons[event.type]
  const canAffordMitigation = event.canMitigate && event.mitigationCost ? availableBudget >= event.mitigationCost : false
  const chapter = chapterByTurn(currentTurn)
  const chapterLabel = chapterLabels[chapter]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/70 p-4 backdrop-blur-sm">
      <Card className="max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Incidente de capítulo {chapter}</p>
          <Badge className="bg-white text-sky-800 border border-sky-200">{chapterLabel}</Badge>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-serif text-2xl font-bold text-slate-900">{event.name}</h2>
              <Badge className={severityColors[event.severity]}>{severityLabels[event.severity]}</Badge>
            </div>
            <p className="text-sm text-slate-500 mb-1">{eventNarrativeLead[event.type]}</p>
            <p className="text-slate-600">{event.description}</p>
            {event.learningConcept && (
              <p className="mt-2 rounded-md bg-violet-50 px-3 py-2 text-xs leading-relaxed text-violet-900">
                <span className="font-semibold">En la materia:</span> {event.learningConcept}
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-slate-900 mb-2">Impacto esperado</h3>
          <div className="space-y-1 text-sm">
            {event.effects.clientSatisfactionChange && (
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Clientes / mercado:</span>
                <span className="font-medium text-red-600">{event.effects.clientSatisfactionChange}%</span>
              </div>
            )}
            {event.effects.executionSpeedChange && (
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Velocidad de ejecución:</span>
                <span className={`font-medium ${event.effects.executionSpeedChange > 0 ? "text-blue-600" : "text-red-600"}`}>
                  {event.effects.executionSpeedChange > 0 ? "+" : ""}
                  {event.effects.executionSpeedChange}%
                </span>
              </div>
            )}
            {event.effects.teamCapacityChange && (
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Capacidad del equipo:</span>
                <span className="font-medium text-red-600">{event.effects.teamCapacityChange}%</span>
              </div>
            )}
            {event.effects.processControlChange && (
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Control / gobernanza:</span>
                <span className="font-medium text-red-600">{event.effects.processControlChange}%</span>
              </div>
            )}
            {event.effects.sustainabilityChange && (
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Confianza / clima:</span>
                <span className="font-medium text-red-600">{event.effects.sustainabilityChange}%</span>
              </div>
            )}
            {event.effects.yieldMultiplier && (
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Impacto sistémico:</span>
                <span className="font-medium text-red-600">
                  {Math.round((1 - event.effects.yieldMultiplier) * 100)}% de deterioro
                </span>
              </div>
            )}
            {event.effects.moneyChange && (
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Impacto económico:</span>
                <span className="font-medium text-red-600">${Math.abs(event.effects.moneyChange)}</span>
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-600">Duración: {event.duration} turno{event.duration > 1 ? "s" : ""}</p>
          </div>
        </div>

        {event.canMitigate && event.mitigationCost && event.mitigationEffectiveness && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Decisión del comité</h3>
            <p className="text-sm text-blue-800 mb-3">
              Podés responder con presupuesto y foco para reducir el impacto en {Math.round(event.mitigationEffectiveness * 100)}%
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-900 font-medium">Costo de respuesta:</span>
              <span className="text-blue-900 font-bold">${event.mitigationCost}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          {event.canMitigate && event.mitigationCost && (
            <Button
              onClick={onMitigate}
              disabled={!canAffordMitigation}
              className="min-h-11 flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Responder (${event.mitigationCost})
            </Button>
          )}
          <Button onClick={onAccept} variant="outline" className={`min-h-11 ${event.canMitigate ? "flex-1" : "w-full"}`}>
            {event.canMitigate ? "Aceptar impacto" : "Continuar"}
          </Button>
        </div>

        {event.canMitigate && !canAffordMitigation && (
          <p className="text-xs text-red-600 text-center">No alcanza el presupuesto para responder</p>
        )}
      </Card>
    </div>
  )
}
