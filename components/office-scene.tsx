"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus, Plus, RefreshCw } from "lucide-react"
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
  onOpenJobPositions?: () => void
  onAssignTeam?: (index: number) => void
}

type Tone = "good" | "warning" | "bad"

const INCIDENT_EVENT_TYPES: EventType[] = ["ai_incident", "delivery_bottleneck", "security_audit", "vendor_blocker"]
const MACRO_EVENT_TYPES: EventType[] = ["fx_gap", "salary_parity", "regulatory_change"]

/** Tres mesas en esquinas del piso (centro libre para reunión). */
const FRETE_TILES = [
  { gx: 0.9, gy: 0.95 }, // Eq. 1 — arriba izquierda
  { gx: 4.0, gy: 0.95 }, // Eq. 2 — arriba derecha
  { gx: 0.9, gy: 3.95 }, // Eq. 3 — abajo izquierda (rack queda abajo derecha)
]

/** Identidad fija por equipo (independiente de la iniciativa asignada). */
const TEAM_IDENTITY = [
  { body: "#2563eb", badge: "#1d4ed8", label: "1", hue: 208 },
  { body: "#d97706", badge: "#b45309", label: "2", hue: 35 },
  { body: "#7c3aed", badge: "#6d28d9", label: "3", hue: 270 },
] as const

/** Zona de deambulación libre (lejos de la mesa, hacia el centro de la sala). */
const TEAM_PATROL_ZONES = [
  { minGx: 1.15, maxGx: 2.4, minGy: 1.25, maxGy: 2.45 },
  { minGx: 2.6, maxGx: 3.85, minGy: 1.25, maxGy: 2.45 },
  { minGx: 1.15, maxGx: 2.4, minGy: 2.55, maxGy: 3.75 },
] as const

/** Posición del empleado sentado frente al monitor (trabajando). */
const FRETE_AGENT_OFFSETS = [
  { dgx: 0.22, dgy: 0.38 },
  { dgx: -0.22, dgy: 0.38 },
  { dgx: 0.22, dgy: -0.38 },
]

const MEETING_CENTER = { gx: 2, gy: 2 }
const DESK_CLEAR_RADIUS = 1.05

function teamPatrolHome(index: number) {
  const zone = TEAM_PATROL_ZONES[index]
  if (!zone) return MEETING_CENTER
  return {
    gx: (zone.minGx + zone.maxGx) / 2,
    gy: (zone.minGy + zone.maxGy) / 2,
  }
}

function frenteAgentSpot(index: number) {
  const tile = FRETE_TILES[index]
  const off = FRETE_AGENT_OFFSETS[index] ?? { dgx: -0.28, dgy: 0.22 }
  if (!tile) return teamPatrolHome(index)
  return { gx: tile.gx + off.dgx, gy: tile.gy + off.dgy }
}

function pickIdleWanderTarget(
  agent: Pick<TeamAgentRuntime, "slotIndex" | "homeGx" | "homeGy" | "targetGx" | "targetGy">,
) {
  const zone = TEAM_PATROL_ZONES[agent.slotIndex]
  const desk = FRETE_TILES[agent.slotIndex]
  if (!zone) {
    agent.targetGx = agent.homeGx
    agent.targetGy = agent.homeGy
    return
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const gx = zone.minGx + Math.random() * (zone.maxGx - zone.minGx)
    const gy = zone.minGy + Math.random() * (zone.maxGy - zone.minGy)
    if (!desk || Math.hypot(gx - desk.gx, gy - desk.gy) >= DESK_CLEAR_RADIUS) {
      agent.targetGx = gx
      agent.targetGy = gy
      return
    }
  }

  agent.targetGx = (zone.minGx + zone.maxGx) / 2
  agent.targetGy = (zone.minGy + zone.maxGy) / 2
}

function beginIdleWander(agent: TeamAgentRuntime) {
  pickIdleWanderTarget(agent)
  agent.phase = "idleWander"
  agent.idlePauseUntil = 0
}

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

/** Sombreado de color hex (patrón de business-tycoon/primitives.js). */
function shadeHex(hex: string, amount: number): string {
  const h = hex.replace("#", "")
  let r = parseInt(h.slice(0, 2), 16) + amount
  let g = parseInt(h.slice(2, 4), 16) + amount
  let b = parseInt(h.slice(4, 6), 16) + amount
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `rgb(${r},${g},${b})`
}

const WOOD_DESK = { top: "#8B7355", left: "#6B5335", right: "#7B6345" } as const
const CHAIR_WOOD = { top: "#7B6B4B", left: "#5B4B2B", right: "#6B5B3B" } as const

function IsoMonitor({
  cx,
  cy,
  screenHue = 208,
  badge,
}: {
  cx: number
  cy: number
  screenHue?: number
  badge?: string
}) {
  return (
    <g>
      {/* Teclado sobre la tapa (tycoon: keyboard/mat on desk) */}
      <rect x={cx - 8} y={cy - 4} width="16" height="2.4" rx="0.5" fill="#2b3037" />
      {/* Cuerpo del monitor */}
      <rect x={cx - 11} y={cy - 22} width="22" height="15" rx="1.5" fill="#0e1013" />
      <rect x={cx - 10.5} y={cy - 21.5} width="21" height="1" fill="rgba(255,255,255,0.08)" />
      {/* Pantalla activa con UI bars */}
      <rect x={cx - 9} y={cy - 20} width="18" height="11" rx="0.5" fill={`hsl(${screenHue},42%,16%)`} />
      <rect x={cx - 8} y={cy - 18.5} width="5" height="1.6" rx="0.3" fill={`hsla(${screenHue},65%,48%,0.85)`} />
      <rect x={cx - 2} y={cy - 18.5} width="6" height="1.6" rx="0.3" fill={`hsla(${screenHue},65%,48%,0.85)`} />
      <rect x={cx - 8} y={cy - 15.5} width="11" height="1.2" rx="0.3" fill="rgba(220,240,255,0.35)" />
      <polygon
        points={`${cx - 9},${cy - 20} ${cx - 2},${cy - 20} ${cx - 5},${cy - 16} ${cx - 9},${cy - 16}`}
        fill="rgba(255,255,255,0.07)"
      />
      {/* Soporte + base */}
      <rect x={cx - 1.5} y={cy - 7.5} width="3" height="4.5" fill="#2a2d33" />
      <rect x={cx - 5.5} y={cy - 3.5} width="11" height="1.8" rx="0.5" fill="#3a3f47" />
      {badge && (
        <>
          <circle cx={cx + 8} cy={cy - 21} r="4.5" fill={`hsl(${screenHue},55%,38%)`} stroke="#fff" strokeWidth="0.8" />
          <text x={cx + 8} y={cy - 19.5} textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">
            {badge}
          </text>
        </>
      )}
    </g>
  )
}

/** Silla isométrica (tycoon: drawBox asiento + respaldo). */
function IsoChair({ cx, cy }: { cx: number; cy: number }) {
  const scx = cx - 16
  const scy = cy + 5
  const sw = 14
  const sh = 7
  const depth = 5
  const top = `${scx},${scy - depth} ${scx + sw / 2},${scy + sh / 2 - depth} ${scx},${scy + sh - depth} ${scx - sw / 2},${scy + sh / 2 - depth}`
  const left = `${scx - sw / 2},${scy + sh / 2 - depth} ${scx},${scy + sh - depth} ${scx},${scy + sh} ${scx - sw / 2},${scy + sh / 2}`
  const right = `${scx + sw / 2},${scy + sh / 2 - depth} ${scx},${scy + sh - depth} ${scx},${scy + sh} ${scx + sw / 2},${scy + sh / 2}`
  return (
    <g>
      <polygon points={left} fill={CHAIR_WOOD.left} />
      <polygon points={right} fill={CHAIR_WOOD.right} />
      <polygon points={top} fill={CHAIR_WOOD.top} />
      <rect x={scx - 4} y={scy - 14} width="8" height="5" rx="1" fill={CHAIR_WOOD.left} />
    </g>
  )
}

/** Mesa de trabajo isométrica (tycoon drawBox + monitor + silla). */
function IsoDesk({
  cx,
  cy,
  hw = 24,
  topFill = WOOD_DESK.top,
  leftFill = WOOD_DESK.left,
  rightFill = WOOD_DESK.right,
  monitor,
  label,
  labelFill = "#3d3428",
  interactive,
  ariaLabel,
  onActivate,
}: {
  cx: number
  cy: number
  hw?: number
  topFill?: string
  leftFill?: string
  rightFill?: string
  monitor?: { screenHue?: number; badge?: string }
  label?: string
  labelFill?: string
  interactive?: boolean
  ariaLabel?: string
  onActivate?: () => void
}) {
  const depth = 10
  const legH = 9
  const top = `${cx},${cy - 2} ${cx + hw},${cy + 11} ${cx},${cy + 24} ${cx - hw},${cy + 11}`
  const hitTop = `${cx},${cy - 6} ${cx + hw + 4},${cy + 11} ${cx},${cy + 28} ${cx - hw - 4},${cy + 11}`
  const leftFace = `${cx - hw},${cy + 11} ${cx},${cy + 24} ${cx},${cy + 24 + depth} ${cx - hw + 5},${cy + 11 + depth}`
  const rightFace = `${cx + hw},${cy + 11} ${cx},${cy + 24} ${cx},${cy + 24 + depth} ${cx + hw - 5},${cy + 11 + depth}`

  const leg = (lx: number, ly: number) => (
    <line
      key={`leg-${lx}-${ly}`}
      x1={lx}
      y1={ly}
      x2={lx}
      y2={ly + legH}
      stroke={shadeHex(WOOD_DESK.left, -20)}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  )

  return (
    <g>
      <ellipse cx={cx} cy={cy + 24} rx={hw + 1} ry={8} fill="#000" opacity="0.08" />

      <IsoChair cx={cx} cy={cy} />

      {leg(cx - hw + 9, cy + 11 + depth)}
      {leg(cx - 3, cy + 24 + depth)}
      {leg(cx + 3, cy + 24 + depth)}
      {leg(cx + hw - 9, cy + 11 + depth)}

      <polygon points={leftFace} fill={leftFill} stroke={shadeHex(leftFill, -15)} strokeWidth="0.5" />
      <polygon points={rightFace} fill={rightFill} stroke={shadeHex(rightFill, -15)} strokeWidth="0.5" />
      <polygon points={top} fill={topFill} stroke={shadeHex(topFill, 20)} strokeWidth="0.6" />

      {monitor && <IsoMonitor cx={cx} cy={cy} screenHue={monitor.screenHue} badge={monitor.badge} />}

      {label && (
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fontWeight="600" fill={labelFill}>
          {label}
        </text>
      )}

      {interactive && onActivate && (
        <polygon
          points={hitTop}
          fill="transparent"
          className="cursor-pointer hover:fill-amber-500/10 focus:outline-none"
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          onClick={onActivate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onActivate()
            }
          }}
        />
      )}
    </g>
  )
}

interface AreaDef {
  key: string
  area: string
  value: number
  prev: number
  tone: Tone
  hint: string
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

interface TeamAgentRuntime {
  slotIndex: number
  gx: number
  gy: number
  targetGx: number
  targetGy: number
  homeGx: number
  homeGy: number
  pool: { gx: number; gy: number }
  frente: { gx: number; gy: number }
  speed: number
  phase: "atPool" | "toFrente" | "atFrente" | "toPool" | "idleWander"
  facing: 1 | -1
  busy: boolean
  idlePauseUntil: number
  el: SVGGElement | null
}

interface FrenteTeam {
  index: number
  busy: boolean
  label: string
  fullLabel: string
  progress: number
  color: string
  teamColor: string
  teamLabel: string
}

export default function OfficeScene({
  gameState,
  previousGameState,
  activeEvent,
  className,
  compact = false,
  pulseKey = 0,
  onOpenJobPositions,
  onAssignTeam,
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
        value: gameState.clientSatisfaction,
        prev: prev.clientSatisfaction,
        ...c,
      },
      {
        key: "team",
        area: "Equipo",
        value: gameState.teamCapacity,
        prev: prev.teamCapacity,
        ...cap,
      },
      {
        key: "product",
        area: "Producto GAUS",
        value: gameState.processControl,
        prev: prev.processControl,
        ...p,
      },
      {
        key: "compliance",
        area: "Cumplimiento",
        value: gameState.sustainability,
        prev: prev.sustainability,
        ...s,
      },
    ]
  }, [gameState, prev, hasIncident])

  const frenteTeams: FrenteTeam[] = useMemo(
    () =>
      gameState.initiativeSlots.slice(0, TEAM_SLOT_COUNT).map((slot, index) => {
        const identity = TEAM_IDENTITY[index] ?? TEAM_IDENTITY[0]
        if (slot.type === "unassigned") {
          return {
            index,
            busy: false,
            label: "Libre",
            fullLabel: "Libre",
            progress: 0,
            color: "#94a3b8",
            teamColor: identity.body,
            teamLabel: identity.label,
          }
        }
        const initiative = INITIATIVES[slot.type]
        return {
          index,
          busy: true,
          label: shortLabel(initiative.name),
          fullLabel: initiative.name,
          progress: Math.round(slot.stageProgress),
          color: initiative.color,
          teamColor: identity.body,
          teamLabel: identity.label,
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
  const teamAgentsRef = useRef<TeamAgentRuntime[]>([])
  const prevTeamBusyRef = useRef<boolean[]>([])
  const lowEnergy = gameState.teamCapacity < 50

  if (teamAgentsRef.current.length !== TEAM_SLOT_COUNT) {
    teamAgentsRef.current = Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => {
      const pool = teamPatrolHome(index)
      const frente = frenteAgentSpot(index)
      const busy = frenteTeams[index]?.busy ?? false
      const agent: TeamAgentRuntime = {
        slotIndex: index,
        gx: MEETING_CENTER.gx,
        gy: MEETING_CENTER.gy,
        targetGx: busy ? frente.gx : pool.gx,
        targetGy: busy ? frente.gy : pool.gy,
        homeGx: pool.gx,
        homeGy: pool.gy,
        pool,
        frente,
        speed: 1.15,
        phase: busy ? "toFrente" : "idleWander",
        facing: 1,
        busy,
        idlePauseUntil: 0,
        el: null,
      }
      if (!busy) pickIdleWanderTarget(agent)
      return agent
    })
    prevTeamBusyRef.current = frenteTeams.map((t) => t.busy)
  }

  const setTeamAgentRef = (index: number) => (el: SVGGElement | null) => {
    if (teamAgentsRef.current[index]) teamAgentsRef.current[index].el = el
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    frenteTeams.forEach((team, index) => {
      const agent = teamAgentsRef.current[index]
      if (!agent) return

      const pool = teamPatrolHome(index)
      const frente = frenteAgentSpot(index)
      agent.pool = pool
      agent.frente = frente
      agent.homeGx = pool.gx
      agent.homeGy = pool.gy

      const wasBusy = prevTeamBusyRef.current[index] ?? false
      const busyChanged = team.busy !== wasBusy

      if (busyChanged) {
        agent.busy = team.busy
        agent.idlePauseUntil = 0
        if (team.busy) {
          agent.targetGx = frente.gx
          agent.targetGy = frente.gy
          if (reducedMotion) {
            agent.gx = frente.gx
            agent.gy = frente.gy
            agent.phase = "atFrente"
          } else {
            agent.phase = "toFrente"
          }
        } else {
          agent.idlePauseUntil = 0
          if (reducedMotion) {
            agent.gx = pool.gx
            agent.gy = pool.gy
            agent.phase = "atPool"
          } else {
            beginIdleWander(agent)
          }
        }
      } else if (agent.busy !== team.busy) {
        agent.busy = team.busy
      } else if (!team.busy) {
        const atHome = Math.hypot(agent.gx - pool.gx, agent.gy - pool.gy) < 0.08
        if (!atHome && agent.phase !== "toPool" && agent.phase !== "idleWander") {
          agent.targetGx = pool.gx
          agent.targetGy = pool.gy
          agent.phase = reducedMotion ? "atPool" : "toPool"
          if (reducedMotion) {
            agent.gx = pool.gx
            agent.gy = pool.gy
          }
        }
      } else {
        const atDesk = Math.hypot(agent.gx - frente.gx, agent.gy - frente.gy) < 0.08
        if (!atDesk && agent.phase !== "toFrente") {
          agent.targetGx = frente.gx
          agent.targetGy = frente.gy
          agent.phase = reducedMotion ? "atFrente" : "toFrente"
          if (reducedMotion) {
            agent.gx = frente.gx
            agent.gy = frente.gy
          }
        }
      }
    })

    prevTeamBusyRef.current = frenteTeams.map((t) => t.busy)
  }, [frenteTeams])

  useEffect(() => {
    if (pulseKey <= 0) return
    setPulsing(true)
    const timer = window.setTimeout(() => setPulsing(false), 1100)
    return () => window.clearTimeout(timer)
  }, [pulseKey])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const speedMul = lowEnergy ? 0.45 : 1

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      for (const t of teamAgentsRef.current) {
        const moving =
          t.phase === "toFrente" || t.phase === "toPool" || t.phase === "idleWander"

        if (moving) {
          const dx = t.targetGx - t.gx
          const dy = t.targetGy - t.gy
          const dist = Math.hypot(dx, dy)
          const step =
            (t.phase === "idleWander"
              ? t.speed * 0.68
              : t.phase === "toFrente"
                ? t.speed * 1.15
                : t.speed) *
            speedMul *
            dt
          if (t.facing !== (dx >= 0 ? 1 : -1) && Math.abs(dx) > 0.02) t.facing = dx >= 0 ? 1 : -1
          if (dist <= step || dist < 0.001) {
            t.gx = t.targetGx
            t.gy = t.targetGy
            if (t.phase === "toFrente") t.phase = "atFrente"
            else if (t.phase === "toPool") beginIdleWander(t)
            else if (t.phase === "idleWander") {
              t.phase = "atPool"
              t.idlePauseUntil = now + 280 + Math.random() * 420
            }
          } else {
            t.gx += (dx / dist) * step
            t.gy += (dy / dist) * step
          }
        } else if (t.phase === "atPool" && !t.busy && now >= t.idlePauseUntil) {
          beginIdleWander(t)
        }

        if (t.el) {
          const p = iso(t.gx, t.gy)
          const isMoving =
            t.phase === "toFrente" || t.phase === "toPool" || t.phase === "idleWander"
          const working = t.phase === "atFrente" && t.busy
          const bob = isMoving
            ? Math.sin(now / 100) * 1.8
            : working
              ? Math.sin(now / 120) * 1.15
              : Math.sin(now / 380 + t.slotIndex) * 0.45
          t.el.setAttribute("transform", `translate(${p.x.toFixed(1)} ${(p.y + bob).toFixed(1)}) scale(${t.facing} 1)`)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [lowEnergy, pulsing])

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
          aria-label="Oficina de Colinet Trotta: 3 equipos y mesas de trabajo"
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

          {/* 3 mesas de equipo (clickeables) */}
          {frenteTeams.map((team, i) => {
            const tile = FRETE_TILES[i]
            if (!tile) return null
            const p = iso(tile.gx, tile.gy)
            const identity = TEAM_IDENTITY[i] ?? TEAM_IDENTITY[0]
            const ariaLabel = team.busy
              ? `Equipo ${team.index + 1} en ${team.fullLabel}. Clic para reasignar.`
              : `Equipo ${team.index + 1} libre. Clic para asignar tarea.`

            return (
              <g key={`frente-${team.index}`}>
                <IsoDesk
                  cx={p.x}
                  cy={p.y}
                  hw={26}
                  monitor={{
                    screenHue: team.busy ? 156 : identity.hue,
                    badge: identity.label,
                  }}
                  label={team.busy ? shortLabel(team.label, 10) : "Libre"}
                  interactive={Boolean(onAssignTeam)}
                  ariaLabel={ariaLabel}
                  onActivate={onAssignTeam ? () => onAssignTeam(team.index) : undefined}
                />
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

          {Array.from({ length: TEAM_SLOT_COUNT }, (_, i) => {
            const team = frenteTeams[i]
            const identity = TEAM_IDENTITY[i] ?? TEAM_IDENTITY[0]
            if (!team) return null
            return (
              <g key={`team-agent-${i}`} ref={setTeamAgentRef(i)}>
                {team.busy ? (
                  <ellipse cx="0" cy="2" rx="13" ry="5" fill={team.color} opacity="0.28" />
                ) : (
                  <ellipse cx="0" cy="2" rx="10" ry="3.5" fill="#000" opacity="0.12" />
                )}
                <rect
                  x="-6"
                  y="-18"
                  width="12"
                  height="16"
                  rx="5"
                  fill={team.busy ? team.color : identity.body}
                  stroke={team.busy ? team.color : "none"}
                  strokeWidth={team.busy ? 1.4 : 0}
                />
                <circle cx="0" cy="-23" r="6" fill="#fcd9b8" />
                {team.busy && (
                  <rect x="-5" y="-14" width="10" height="4" rx="1" fill="#1e293b" opacity="0.85" />
                )}
                <circle cx="3" cy="-28" r="4" fill={identity.badge} stroke="#fff" strokeWidth="1.2" />
                <text x="3" y="-26.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">
                  {identity.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">
        {areas.map((a) => (
          <StatusCard key={a.key} area={a} compact={compact} />
        ))}
      </div>

      <FrentesStrip
        teams={frenteTeams}
        busyTeams={busyTeams}
        newHire={newHire}
        onOpenJobPositions={onOpenJobPositions}
        onAssignTeam={onAssignTeam}
      />
    </div>
  )
}

function FrentesStrip({
  teams,
  busyTeams,
  newHire,
  onOpenJobPositions,
  onAssignTeam,
}: {
  teams: FrenteTeam[]
  busyTeams: number
  newHire: { title: string; fixed: boolean } | null
  onOpenJobPositions?: () => void
  onAssignTeam?: (index: number) => void
}) {
  const freeTeams = teams.length - busyTeams

  return (
    <div className="space-y-2.5 border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white px-2.5 py-3 sm:px-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">Tus equipos</h3>
          {freeTeams > 0 && (
            <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
              {freeTeams} {freeTeams === 1 ? "libre" : "libres"}
            </span>
          )}
        </div>
        <span className="shrink-0 text-[11px] font-medium text-slate-500">{busyTeams}/{teams.length} en marcha</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible">
        {teams.map((team) => (
          <TeamCard key={team.index} team={team} onAssign={onAssignTeam} />
        ))}
      </div>

      {newHire && (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-lg px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between",
            newHire.fixed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
          )}
        >
          <p className="text-[11px] font-medium leading-snug">
            {newHire.fixed ? `Rol definido: ${newHire.title}` : `Nuevo integrante: definí el rol de ${newHire.title}`}
          </p>
          {!newHire.fixed && onOpenJobPositions && (
            <button
              type="button"
              onClick={onOpenJobPositions}
              className="shrink-0 rounded-md bg-amber-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-900"
            >
              Ir a Puestos
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TeamCard({ team, onAssign }: { team: FrenteTeam; onAssign?: (index: number) => void }) {
  const interactive = Boolean(onAssign)
  const handleClick = () => onAssign?.(team.index)

  if (!team.busy) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!interactive}
        className={cn(
          "group flex min-w-[150px] shrink-0 flex-col gap-1.5 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 px-3 py-2.5 text-left transition-all sm:min-w-0",
          interactive && "cursor-pointer hover:border-sky-400 hover:bg-sky-50 hover:shadow-sm active:scale-[0.99]",
        )}
      >
        <div className="flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: team.teamColor }}
            >
              {team.teamLabel}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Equipo {team.index + 1}</span>
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm transition-transform group-hover:scale-110">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
        <p className="text-sm font-bold text-slate-900">Sin frente</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700">
          Asignar tarea
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!interactive}
      className={cn(
        "group flex min-w-[150px] shrink-0 flex-col gap-1 rounded-xl border bg-white px-3 py-2.5 text-left shadow-sm transition-all sm:min-w-0",
        interactive && "cursor-pointer hover:border-slate-300 hover:shadow active:scale-[0.99]",
      )}
      style={{ borderColor: `${team.color}55` }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: team.teamColor }}
          >
            {team.teamLabel}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Equipo {team.index + 1}</span>
        </span>
        {interactive && (
          <RefreshCw className="h-3 w-3 text-slate-300 transition-colors group-hover:text-slate-500" />
        )}
      </div>
      <p className="truncate text-sm font-semibold text-slate-900" title={team.fullLabel}>
        {team.fullLabel}
      </p>
      <div className="mt-0.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${team.progress}%`, backgroundColor: team.color }}
          />
        </div>
        <span className="shrink-0 text-[10px] font-bold tabular-nums text-slate-500">{team.progress}%</span>
      </div>
    </button>
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
