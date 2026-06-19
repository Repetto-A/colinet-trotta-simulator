"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { BusinessGameState } from "@/types/business-game"
import type { EnvironmentalEvent, EventType } from "@/types/events"

interface OfficeSceneProps {
  gameState: BusinessGameState
  activeEvent?: EnvironmentalEvent | null
  className?: string
  /** Limita la altura para usarla como escenario fijo (sticky) sin deformar el SVG. */
  compact?: boolean
  /** Incrementar tras una decisión para disparar el pulso visual. */
  pulseKey?: number
}

type MoodTone = "good" | "warning" | "bad"

interface MoodBadge {
  emoji: string
  label: string
  tone: MoodTone
}

const toneStyles: Record<MoodTone, string> = {
  good: "bg-emerald-50/95 text-emerald-800 border-emerald-200 ring-emerald-500/10",
  warning: "bg-amber-50/95 text-amber-800 border-amber-200 ring-amber-500/10",
  bad: "bg-red-50/95 text-red-800 border-red-300 ring-red-500/20",
}

const toneDot: Record<MoodTone, string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  bad: "bg-red-500",
}

const INCIDENT_EVENT_TYPES: EventType[] = [
  "ai_incident",
  "delivery_bottleneck",
  "security_audit",
  "vendor_blocker",
]

const MACRO_EVENT_TYPES: EventType[] = ["fx_gap", "salary_parity", "regulatory_change"]

function clientMood(satisfaction: number): MoodBadge {
  if (satisfaction < 40) return { emoji: "😠", label: "Cliente molesto", tone: "bad" }
  if (satisfaction < 65) return { emoji: "😐", label: "Cliente expectante", tone: "warning" }
  return { emoji: "🙂", label: "Cliente conforme", tone: "good" }
}

function teamMood(capacity: number): MoodBadge {
  if (capacity < 40) return { emoji: "😵", label: "Equipo quemado", tone: "bad" }
  if (capacity < 60) return { emoji: "😪", label: "Equipo cansado", tone: "warning" }
  return { emoji: "💪", label: "Equipo con energía", tone: "good" }
}

function systemMood(processControl: number, hasIncident: boolean): MoodBadge {
  if (hasIncident) return { emoji: "🔥", label: "Incidente en GAUS mp", tone: "bad" }
  if (processControl < 45) return { emoji: "⚠️", label: "Sistema inestable", tone: "warning" }
  return { emoji: "🟢", label: "Servicios estables", tone: "good" }
}

function climateMood(sustainability: number): MoodBadge {
  if (sustainability < 40) return { emoji: "🥀", label: "Clima tenso", tone: "bad" }
  if (sustainability < 60) return { emoji: "🌿", label: "Clima en construcción", tone: "warning" }
  return { emoji: "🌳", label: "Buen clima", tone: "good" }
}

/** Cartel de evento macro tipo titular de diario */
function macroHeadline(event: EnvironmentalEvent | null | undefined, activeTypes: EventType[]): string | null {
  const type = event?.type ?? activeTypes.find((t) => MACRO_EVENT_TYPES.includes(t)) ?? null
  if (!type || !MACRO_EVENT_TYPES.includes(type)) return null
  switch (type) {
    case "fx_gap":
      return "SE DISPARÓ EL DÓLAR"
    case "salary_parity":
      return "PRESIÓN PARITARIA EN EL SECTOR"
    case "regulatory_change":
      return "NUEVA EXIGENCIA DE LA SSN"
    default:
      return null
  }
}

export default function OfficeScene({ gameState, activeEvent, className, compact = false, pulseKey = 0 }: OfficeSceneProps) {
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (pulseKey <= 0) return
    setPulsing(true)
    const timer = window.setTimeout(() => setPulsing(false), 950)
    return () => window.clearTimeout(timer)
  }, [pulseKey])
  const activeTypes = useMemo(
    () => gameState.activeModifiers.map((modifier) => modifier.eventType),
    [gameState.activeModifiers],
  )

  const hasIncident = useMemo(
    () => activeTypes.some((type) => INCIDENT_EVENT_TYPES.includes(type)) || gameState.processControl < 35,
    [activeTypes, gameState.processControl],
  )

  const client = clientMood(gameState.clientSatisfaction)
  const team = teamMood(gameState.teamCapacity)
  const system = systemMood(gameState.processControl, hasIncident)
  const climate = climateMood(gameState.sustainability)
  const headline = macroHeadline(activeEvent, activeTypes)

  const wallScreenColor = hasIncident ? "#ef4444" : gameState.executionSpeed < 45 ? "#f59e0b" : "#38bdf8"
  const plantColor = gameState.sustainability < 40 ? "#a8a29e" : gameState.sustainability < 60 ? "#84cc16" : "#16a34a"

  // Movimiento que comunica estado, no decoración:
  const clientAnim = client.tone === "bad" ? "office-anim-shake" : client.tone === "good" ? "office-anim-nod" : "office-anim-breathe"
  const teamAnim = team.tone === "good" ? "office-anim-bob" : "office-anim-breathe"
  const isTired = team.tone !== "good"

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-100 via-white to-slate-50 shadow-sm transition-shadow",
        compact && "h-[200px] sm:h-[240px] lg:h-[270px]",
        pulsing && "office-decision-pulse",
        className,
      )}
    >
      {headline && (
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-2 bg-red-600 px-3 py-1.5 text-center text-xs font-extrabold uppercase tracking-wide text-white shadow-md animate-in slide-in-from-top-2 sm:text-sm">
          <span className="text-base">📰</span>
          {headline}
        </div>
      )}

      <svg
        viewBox="0 0 800 420"
        preserveAspectRatio="xMidYMid meet"
        className={cn("block min-h-0 w-full flex-1", compact ? "h-full" : "h-auto")}
        role="img"
        aria-label="Vista de la oficina de Colinet Trotta reaccionando al estado del juego"
      >
        {/* Piso isométrico */}
        <polygon points="400,70 770,250 400,410 30,250" fill="#eef2f7" />
        <polygon points="400,70 770,250 400,410 30,250" fill="none" stroke="#dbe3ec" strokeWidth="2" />

        {/* Pared trasera izquierda */}
        <polygon points="30,250 400,70 400,30 30,210" fill="#f8fafc" />
        {/* Pared trasera derecha */}
        <polygon points="770,250 400,70 400,30 770,210" fill="#eef2f7" />

        {/* Pantalla de pared (dashboard / estado de servicios) */}
        <g transform="translate(430,70)">
          <polygon points="0,40 150,118 150,190 0,112" fill="#0f172a" />
          <polygon
            className="office-anim-screen"
            points="12,58 138,122 138,176 12,112"
            fill={wallScreenColor}
          />
          <text x="74" y="120" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">
            GAUS mp
          </text>
        </g>

        {/* Recepción: cliente */}
        <g transform="translate(150,205)">
          <ellipse cx="0" cy="64" rx="46" ry="18" fill="#000" opacity="0.06" />
          {/* mostrador */}
          <polygon points="-60,40 0,72 60,40 0,8" fill="#cbd5e1" />
          {/* cliente (cabeza + cuerpo animados según ánimo) */}
          <g className={clientAnim}>
            <circle cx="-2" cy="-2" r="15" fill={client.tone === "bad" ? "#fca5a5" : "#fcd5b5"} />
            <rect x="-16" y="12" width="28" height="34" rx="12" fill={client.tone === "bad" ? "#dc2626" : "#6366f1"} />
            {client.tone === "bad" && (
              <text x="14" y="-14" textAnchor="middle" fontSize="15">
                💢
              </text>
            )}
          </g>
        </g>

        {/* Escritorios de devs */}
        <g transform="translate(360,255)">
          <ellipse cx="0" cy="40" rx="52" ry="18" fill="#000" opacity="0.06" />
          <polygon points="-60,18 0,50 60,18 0,-14" fill="#e2e8f0" />
          {/* dev 1 */}
          <g className={teamAnim}>
            <circle cx="-18" cy="-12" r="13" fill="#fcd5b5" />
            <rect x="-30" y="0" width="24" height="28" rx="10" fill={team.tone === "bad" ? "#b45309" : "#0ea5e9"} />
          </g>
          {/* monitor */}
          <rect x="6" y="-10" width="26" height="18" rx="3" fill="#0f172a" />
          {/* dev 2 (cansado si team malo) */}
          <g className={team.tone === "good" ? "office-anim-bob" : "office-anim-type"}>
            <circle cx="26" cy="-6" r="12" fill="#fcd5b5" />
            <rect x="15" y="4" width="22" height="26" rx="9" fill={team.tone === "good" ? "#22c55e" : "#94a3b8"} />
          </g>
          {isTired && (
            <text className="office-anim-zzz" x="26" y="-18" textAnchor="middle" fontSize="14">
              💤
            </text>
          )}
        </g>

        {/* Server rack */}
        <g transform="translate(610,250)">
          <ellipse cx="0" cy="60" rx="34" ry="14" fill="#000" opacity="0.06" />
          <polygon points="-26,-30 0,-16 0,52 -26,38" fill={hasIncident ? "#7f1d1d" : "#334155"} />
          <polygon points="0,-16 26,-30 26,38 0,52" fill={hasIncident ? "#991b1b" : "#475569"} />
          <polygon points="-26,-30 0,-44 26,-30 0,-16" fill={hasIncident ? "#b91c1c" : "#64748b"} />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              className="office-anim-led"
              style={{ animationDelay: `${i * 0.32}s` }}
              x="-22"
              y={-22 + i * 14}
              width="20"
              height="6"
              rx="2"
              fill={hasIncident ? "#fca5a5" : "#38bdf8"}
            />
          ))}
          {hasIncident && (
            <>
              <text className="office-anim-smoke" x="0" y="-50" textAnchor="middle" fontSize="20">
                💨
              </text>
              <text
                className="office-anim-smoke"
                style={{ animationDelay: "1.1s" }}
                x="10"
                y="-46"
                textAnchor="middle"
                fontSize="14"
              >
                💨
              </text>
            </>
          )}
        </g>

        {/* Zona de descanso: planta + clima */}
        <g transform="translate(250,310)">
          <ellipse cx="0" cy="26" rx="26" ry="10" fill="#000" opacity="0.06" />
          <rect x="-10" y="6" width="20" height="18" rx="3" fill="#d6c3a3" />
          <g className="office-anim-sway">
            <circle cx="0" cy="-2" r="16" fill={plantColor} />
            <circle cx="-10" cy="6" r="10" fill={plantColor} opacity="0.85" />
            <circle cx="10" cy="6" r="10" fill={plantColor} opacity="0.85" />
          </g>
        </g>
      </svg>

      {/* Barra de estado — no tapa la escena */}
      <div className="flex shrink-0 gap-1 overflow-x-auto border-t border-slate-200/80 bg-white/90 px-2 py-1.5 backdrop-blur-sm [scrollbar-width:none]">
        <StatusChip badge={client} />
        <StatusChip badge={team} />
        <StatusChip badge={system} />
        <StatusChip badge={climate} />
      </div>
    </div>
  )
}

function StatusChip({ badge }: { badge: MoodBadge }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium sm:text-[11px]",
        toneStyles[badge.tone],
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneDot[badge.tone])} />
      <span className="leading-none">{badge.emoji}</span>
      <span className="whitespace-nowrap">{badge.label}</span>
    </span>
  )
}
