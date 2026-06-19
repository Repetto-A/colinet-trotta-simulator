"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { TEAM_SLOT_COUNT } from "@/lib/game-balance"
import { cn } from "@/lib/utils"
import { INITIATIVES } from "@/types/initiatives"
import type { BusinessGameState } from "@/types/business-game"
import type { EnvironmentalEvent, EventType } from "@/types/events"

interface OfficeSceneProps {
  gameState: BusinessGameState
  previousGameState?: BusinessGameState
  activeEvent?: EnvironmentalEvent | null
  className?: string
  compact?: boolean
  pulseKey?: number
}

type Tone = "good" | "warning" | "bad"

const TONE_FILL: Record<Tone, string> = { good: "#22c55e", warning: "#f59e0b", bad: "#ef4444" }
const TONE_BODY: Record<Tone, string> = { good: "#2563eb", warning: "#d97706", bad: "#dc2626" }

const INCIDENT_EVENT_TYPES: EventType[] = ["ai_incident", "delivery_bottleneck", "security_audit", "vendor_blocker"]
const MACRO_EVENT_TYPES: EventType[] = ["fx_gap", "salary_parity", "regulatory_change"]

const FRETE_TILES = [
  { gx: 4.05, gy: 0.75 },
  { gx: 4.05, gy: 1.75 },
  { gx: 4.05, gy: 2.75 },
]

const TILE_W = 92
const TILE_H = 46
const OX = 410
const OY = 96

function iso(gx: number, gy: number) {
  return {
    x: OX + (gx - gy) * (TILE_W / 2),
    y: OY + (gx + gy) * (TILE_H / 2),
  }
}

function shortLabel(text: string, max = 16) {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

interface AreaDef {
  key: string
  area: string
  name: string
  value: number
  prev: number
  tone: Tone
  hint: string
  tile: { gx: number; gy: number }
  tableSpot: { gx: number; gy: number }
}

function clientTone(v: number): { tone: Tone; hint: string } {
  if (v < 40) return { tone: "bad", hint: "Cliente al borde de irse" }
  if (v < 65) return { tone: "warning", hint: "Falta darle señales claras" }
  return { tone: "good", hint: "Cliente conforme" }
}
function capacityTone(v: number): { tone: Tone; hint: string } {
  if (v < 40) return { tone: "bad", hint: "Equipo quemado, sin aire" }
  if (v < 60) return { tone: "warning", hint: "Capacidad muy justa" }
  return { tone: "good", hint: "Hay margen para más" }
}
function processTone(v: number, incident: boolean): { tone: Tone; hint: string } {
  if (incident) return { tone: "bad", hint: "Incidente activo en GAUS" }
  if (v < 45) return { tone: "warning", hint: "Procesos inestables" }
  return { tone: "good", hint: "Operación bajo control" }
}
function sustainabilityTone(v: number): { tone: Tone; hint: string } {
  if (v < 40) return { tone: "bad", hint: "Clima y cumplimiento en rojo" }
  if (v < 60) return { tone: "warning", hint: "Gobernanza a vigilar" }
  return { tone: "good", hint: "Clima sano" }
}

function macroHeadline(event: EnvironmentalEvent | null | undefined, activeTypes: EventType[]): string | null {
  const type = event?.type ?? activeTypes.find((t) => MACRO_EVENT_TYPES.includes(t)) ?? null
  if (!type || !MACRO_EVENT_TYPES.includes(type)) return null
  switch (type) {
    case "fx_gap":
      return "Se disparó el dólar"
    case "salary_parity":
      return "Presión paritaria en el sector"
    case "regulatory_change":
      return "Nueva exigencia de la SSN"
    default:
      return null
  }
}

interface AgentRuntime {
  gx: number
  gy: number
  targetGx: number
  targetGy: number
  home: { gx: number; gy: number }
  table: { gx: number; gy: number }
  speed: number
  baseSpeed: number
  phase: "atDesk" | "toTable" | "atTable" | "toDesk"
  waitUntil: number
  facing: 1 | -1
  el: SVGGElement | null
}

interface FrenteTeam {
  index: number
  busy: boolean
  label: string
  progress: number
  color: string
}

export default function OfficeScene({
  gameState,
  previousGameState,
  activeEvent,
  className,
  compact = false,
  pulseKey = 0,
}: OfficeSceneProps) {
  const [pulsing, setPulsing] = useState(false)
  const activeTypes = useMemo(
    () => gameState.activeModifiers.map((m) => m.eventType),
    [gameState.activeModifiers],
  )
  const hasIncident = useMemo(
    () => activeTypes.some((t) => INCIDENT_EVENT_TYPES.includes(t)) || gameState.processControl < 35,
    [activeTypes, gameState.processControl],
  )
  const headline = macroHeadline(activeEvent, activeTypes)
  const prev = previousGameState ?? gameState

  const areas: AreaDef[] = useMemo(() => {
    const c = clientTone(gameState.clientSatisfaction)
    const cap = capacityTone(gameState.teamCapacity)
    const p = processTone(gameState.processControl, hasIncident)
    const s = sustainabilityTone(gameState.sustainability)
    return [
      {
        key: "client",
        area: "Cliente",
        name: "María L.",
        value: gameState.clientSatisfaction,
        prev: prev.clientSatisfaction,
        ...c,
        tile: { gx: 1, gy: 1 },
        tableSpot: { gx: 1.65, gy: 1.65 },
      },
      {
        key: "team",
        area: "Equipo",
        name: "Lucía V.",
        value: gameState.teamCapacity,
        prev: prev.teamCapacity,
        ...cap,
        tile: { gx: 3, gy: 1 },
        tableSpot: { gx: 2.35, gy: 1.65 },
      },
      {
        key: "product",
        area: "Producto GAUS",
        name: "Tomás R.",
        value: gameState.processControl,
        prev: prev.processControl,
        ...p,
        tile: { gx: 3, gy: 3 },
        tableSpot: { gx: 2.35, gy: 2.35 },
      },
      {
        key: "compliance",
        area: "Cumplimiento",
        name: "Esteban M.",
        value: gameState.sustainability,
        prev: prev.sustainability,
        ...s,
        tile: { gx: 1, gy: 3 },
        tableSpot: { gx: 1.65, gy: 2.35 },
      },
    ]
  }, [gameState, prev, hasIncident])

  const frenteTeams: FrenteTeam[] = useMemo(
    () =>
      gameState.initiativeSlots.slice(0, TEAM_SLOT_COUNT).map((slot, index) => {
        if (slot.type === "fallow") {
          return { index, busy: false, label: "Libre", progress: 0, color: "#94a3b8" }
        }
        const initiative = INITIATIVES[slot.type]
        return {
          index,
          busy: true,
          label: shortLabel(initiative.name),
          progress: Math.round(slot.stageProgress),
          color: initiative.color,
        }
      }),
    [gameState.initiativeSlots],
  )

  const newHire = useMemo(() => {
    const revealed = gameState.jobPositions.filter((j) => j.revealed)
    if (revealed.length === 0) return null
    const pending = revealed.find((j) => !j.fixed) ?? revealed[0]
    return { title: pending.title, area: pending.area, fixed: pending.fixed }
  }, [gameState.jobPositions])

  const busyTeams = frenteTeams.filter((t) => t.busy).length
  const agentsRef = useRef<AgentRuntime[]>([])
  const lowEnergy = gameState.teamCapacity < 50

  if (agentsRef.current.length !== areas.length + (newHire ? 1 : 0)) {
    const base: AgentRuntime[] = areas.map((a) => ({
      gx: a.tile.gx,
      gy: a.tile.gy,
      targetGx: a.tile.gx,
      targetGy: a.tile.gy,
      home: { ...a.tile },
      table: { ...a.tableSpot },
      speed: 0.9,
      baseSpeed: 0.9,
      phase: "atDesk",
      waitUntil: 0,
      facing: 1,
      el: null,
    }))
    if (newHire) {
      base.push({
        gx: 2,
        gy: -0.6,
        targetGx: 2,
        targetGy: 0.4,
        home: { gx: 2, gy: 0.4 },
        table: { gx: 2, gy: 1.4 },
        speed: 0.8,
        baseSpeed: 0.8,
        phase: "toDesk",
        waitUntil: 0,
        facing: 1,
        el: null,
      })
    }
    agentsRef.current = base
  }

  const setAgentRef = (index: number) => (el: SVGGElement | null) => {
    if (agentsRef.current[index]) agentsRef.current[index].el = el
  }

  useEffect(() => {
    if (pulseKey <= 0) return
    setPulsing(true)
    const now = performance.now()
    for (const agent of agentsRef.current) {
      agent.targetGx = agent.table.gx
      agent.targetGy = agent.table.gy
      agent.phase = "toTable"
      agent.speed = agent.baseSpeed * 2.2
      agent.waitUntil = now + 2200
    }
    const timer = window.setTimeout(() => {
      setPulsing(false)
      for (const agent of agentsRef.current) {
        agent.speed = agent.baseSpeed
      }
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [pulseKey])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const speedMul = lowEnergy ? 0.45 : 1

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      for (const a of agentsRef.current) {
        if (a.phase === "atDesk" || a.phase === "atTable") {
          if (now >= a.waitUntil) {
            if (a.phase === "atDesk") {
              a.targetGx = a.table.gx
              a.targetGy = a.table.gy
              a.phase = "toTable"
            } else {
              a.targetGx = a.home.gx
              a.targetGy = a.home.gy
              a.phase = "toDesk"
            }
          }
        } else {
          const dx = a.targetGx - a.gx
          const dy = a.targetGy - a.gy
          const dist = Math.hypot(dx, dy)
          const step = a.speed * speedMul * dt
          if (a.facing !== (dx >= 0 ? 1 : -1) && Math.abs(dx) > 0.02) a.facing = dx >= 0 ? 1 : -1
          if (dist <= step || dist < 0.001) {
            a.gx = a.targetGx
            a.gy = a.targetGy
            a.phase = a.phase === "toTable" ? "atTable" : "atDesk"
            a.waitUntil = now + 1400 + Math.random() * 2600
          } else {
            a.gx += (dx / dist) * step
            a.gy += (dy / dist) * step
          }
        }

        if (a.el) {
          const p = iso(a.gx, a.gy)
          const moving = a.phase === "toTable" || a.phase === "toDesk"
          const bob = moving ? Math.sin(now / 110) * (pulsing ? 2.4 : 1.6) : pulsing && a.phase === "atTable" ? Math.sin(now / 80) * 1.2 : 0
          a.el.setAttribute("transform", `translate(${p.x.toFixed(1)} ${(p.y + bob).toFixed(1)}) scale(${a.facing} 1)`)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [lowEnergy, areas.length, Boolean(newHire), pulsing])

  const floor = [iso(0, 0), iso(5, 0), iso(5, 5), iso(0, 5)]
  const floorPoints = floor.map((p) => `${p.x},${p.y}`).join(" ")
  const screenColor = hasIncident ? "#ef4444" : gameState.executionSpeed < 45 ? "#f59e0b" : "#2563eb"

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow",
        pulsing && "office-decision-pulse",
        className,
      )}
    >
      {headline && (
        <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
          <span aria-hidden>📰</span>
          {headline}
        </div>
      )}

      <div className="relative">
        <svg
          viewBox="0 0 820 360"
          preserveAspectRatio="xMidYMid meet"
          className={cn(
            "block w-full touch-pan-y",
            compact ? "h-[155px] sm:h-[210px] lg:h-[240px]" : "h-auto min-h-[200px]",
          )}
          role="img"
          aria-label="Oficina de Colinet Trotta con el comité trabajando"
        >
          <polygon
            className="office-floor-layer"
            points={`${iso(0, 0).x},${iso(0, 0).y} ${iso(5, 0).x},${iso(5, 0).y} ${iso(5, 0).x},${iso(5, 0).y - 60} ${iso(0, 0).x},${iso(0, 0).y - 60}`}
            fill="#eef2f7"
          />
          <polygon
            className="office-floor-layer"
            points={`${iso(0, 0).x},${iso(0, 0).y} ${iso(0, 5).x},${iso(0, 5).y} ${iso(0, 5).x},${iso(0, 5).y - 60} ${iso(0, 0).x},${iso(0, 0).y - 60}`}
            fill="#f8fafc"
          />

          <g transform={`translate(${iso(0, 0).x - 70} ${iso(0, 0).y - 52})`}>
            <rect x="0" y="0" width="64" height="34" rx="3" fill="#0f172a" />
            <rect x="4" y="4" width="56" height="26" rx="2" fill={screenColor} opacity="0.9" />
            <text x="32" y="21" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
              GAUS mp
            </text>
          </g>

          <polygon className="office-floor-layer" points={floorPoints} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
          {[1, 2, 3, 4].map((i) => (
            <g key={`g${i}`} stroke="#e2e8f0" strokeWidth="1">
              <line x1={iso(i, 0).x} y1={iso(i, 0).y} x2={iso(i, 5).x} y2={iso(i, 5).y} />
              <line x1={iso(0, i).x} y1={iso(0, i).y} x2={iso(5, i).x} y2={iso(5, i).y} />
            </g>
          ))}

          {(() => {
            const c = iso(2, 2)
            return (
              <g>
                <ellipse cx={c.x} cy={c.y + 16} rx="58" ry="20" fill="#000" opacity="0.05" />
                <polygon
                  points={`${c.x},${c.y - 14} ${c.x + 52},${c.y + 12} ${c.x},${c.y + 38} ${c.x - 52},${c.y + 12}`}
                  fill={pulsing ? "#bfdbfe" : "#dbe5f1"}
                  stroke={pulsing ? "#3b82f6" : "#c2d0e2"}
                  strokeWidth="2"
                />
              </g>
            )
          })()}

          {areas.map((a) => {
            const p = iso(a.tile.gx, a.tile.gy)
            return (
              <g key={`desk-${a.key}`}>
                <ellipse cx={p.x} cy={p.y + 14} rx="30" ry="11" fill="#000" opacity="0.05" />
                <polygon
                  points={`${p.x},${p.y - 2} ${p.x + 26},${p.y + 11} ${p.x},${p.y + 24} ${p.x - 26},${p.y + 11}`}
                  fill="#e2e8f0"
                />
                {a.key === "product" && (
                  <rect x={p.x + 14} y={p.y - 16} width="18" height="13" rx="2" fill={hasIncident ? "#b91c1c" : "#334155"} />
                )}
                {a.key === "team" && (
                  <rect x={p.x + 12} y={p.y - 12} width="16" height="11" rx="2" fill="#0f172a" />
                )}
              </g>
            )
          })}

          {/* Equipos dedicados: frentes visibles en la oficina */}
          {frenteTeams.map((team, i) => {
            const tile = FRETE_TILES[i]
            if (!tile) return null
            const p = iso(tile.gx, tile.gy)
            return (
              <g key={`frente-${team.index}`}>
                <ellipse cx={p.x} cy={p.y + 10} rx="22" ry="8" fill="#000" opacity="0.05" />
                <polygon
                  points={`${p.x},${p.y - 4} ${p.x + 20},${p.y + 6} ${p.x},${p.y + 16} ${p.x - 20},${p.y + 6}`}
                  fill={team.busy ? "#e0f2fe" : "#f8fafc"}
                  stroke={team.busy ? team.color : "#cbd5e1"}
                  strokeWidth="1.5"
                  strokeDasharray={team.busy ? undefined : "4 3"}
                />
                {team.busy && (
                  <rect
                    x={p.x - 16}
                    y={p.y + 18}
                    width="32"
                    height="3"
                    rx="1.5"
                    fill="#e2e8f0"
                  />
                )}
                {team.busy && (
                  <rect
                    x={p.x - 16}
                    y={p.y + 18}
                    width={(32 * team.progress) / 100}
                    height="3"
                    rx="1.5"
                    fill={team.color}
                  />
                )}
                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                  Eq. {team.index + 1}
                </text>
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="8" fontWeight="600" fill="#0f172a">
                  {team.busy ? shortLabel(team.label, 12) : "Libre"}
                </text>
              </g>
            )
          })}

          {(() => {
            const sp = iso(4.3, 4.3)
            return (
              <g>
                <rect x={sp.x - 12} y={sp.y - 34} width="24" height="44" rx="3" fill={hasIncident ? "#991b1b" : "#475569"} />
                {[0, 1, 2].map((i) => (
                  <rect
                    key={i}
                    x={sp.x - 8}
                    y={sp.y - 28 + i * 12}
                    width="16"
                    height="5"
                    rx="1"
                    fill={hasIncident ? "#fca5a5" : "#38bdf8"}
                  />
                ))}
                {hasIncident && (
                  <text x={sp.x} y={sp.y - 42} textAnchor="middle" fontSize="16">
                    💨
                  </text>
                )}
              </g>
            )
          })()}

          {areas.map((a, i) => (
            <g key={`agent-${a.key}`} ref={setAgentRef(i)}>
              <ellipse cx="0" cy="2" rx="11" ry="4" fill="#000" opacity="0.12" />
              <rect x="-7" y="-22" width="14" height="20" rx="6" fill={TONE_BODY[a.tone]} />
              <circle cx="0" cy="-27" r="7" fill="#fcd9b8" />
              <circle cx="4" cy="-34" r="4.5" fill={TONE_FILL[a.tone]} stroke="#fff" strokeWidth="1.5" />
            </g>
          ))}

          {newHire && (
            <g ref={setAgentRef(areas.length)}>
              <ellipse cx="0" cy="2" rx="11" ry="4" fill="#000" opacity="0.12" />
              <rect x="-7" y="-22" width="14" height="20" rx="6" fill={newHire.fixed ? "#16a34a" : "#94a3b8"} />
              <circle cx="0" cy="-27" r="7" fill="#fcd9b8" />
              <text x="0" y="-37" textAnchor="middle" fontSize="13" fontWeight="700" fill={newHire.fixed ? "#16a34a" : "#d97706"}>
                {newHire.fixed ? "★" : "?"}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">
        {areas.map((a) => (
          <StatusCard key={a.key} area={a} compact={compact} />
        ))}
      </div>

      <FrentesStrip teams={frenteTeams} busyTeams={busyTeams} newHire={newHire} />
    </div>
  )
}

function FrentesStrip({
  teams,
  busyTeams,
  newHire,
}: {
  teams: FrenteTeam[]
  busyTeams: number
  newHire: { title: string; fixed: boolean } | null
}) {
  return (
    <div className="space-y-2 border-t border-slate-100 bg-slate-50/80 px-2 py-2 sm:px-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Frentes en la oficina</p>
        <span className="shrink-0 text-[10px] font-medium text-slate-600">{busyTeams}/3 equipos ocupados</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible">
        {teams.map((team) => (
          <div
            key={team.index}
            className={cn(
              "min-w-[108px] shrink-0 rounded-lg border px-2 py-1.5 sm:min-w-0",
              team.busy ? "border-sky-200 bg-white" : "border-dashed border-slate-300 bg-white/60",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
              <span className="text-[10px] font-bold text-slate-700">Equipo {team.index + 1}</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-900">{team.label}</p>
            {team.busy && (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-all" style={{ width: `${team.progress}%`, backgroundColor: team.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
      {newHire && (
        <p
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-medium leading-snug",
            newHire.fixed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
          )}
        >
          {newHire.fixed ? `Rol definido: ${newHire.title}` : `Nuevo integrante: definí el rol de ${newHire.title}`}
        </p>
      )}
    </div>
  )
}

function StatusCard({ area, compact }: { area: AreaDef; compact?: boolean }) {
  const delta = area.value - area.prev
  const Arrow = delta > 0.5 ? ArrowUpRight : delta < -0.5 ? ArrowDownRight : Minus
  const arrowColor = delta > 0.5 ? "text-emerald-600" : delta < -0.5 ? "text-red-600" : "text-slate-400"
  const toneChip =
    area.tone === "good"
      ? "bg-emerald-100 text-emerald-800"
      : area.tone === "warning"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800"

  return (
    <div className={cn("flex flex-col gap-0.5 bg-white px-2 py-1.5 sm:gap-1 sm:px-2.5 sm:py-2", compact && "py-1.5")}>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[10px]">{area.area}</span>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-slate-900 sm:text-base">
          {Math.round(area.value)}
          <Arrow className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", arrowColor)} />
        </span>
      </div>
      <span className={cn("w-fit rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:px-2 sm:text-[10px]", toneChip)}>
        {area.tone === "good" ? "En forma" : "Mejorar"}
      </span>
      <span className="line-clamp-2 text-[9px] leading-snug text-slate-500 sm:line-clamp-1 sm:text-[10px]">{area.hint}</span>
    </div>
  )
}
