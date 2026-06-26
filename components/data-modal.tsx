"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, TrendingUp, TrendingDown, Activity, ShieldCheck, Building2, Workflow } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SEASONS, type Season } from "@/types/initiatives"
import type { BusinessGameState } from "@/types/business-game"
import { KPI_LABELS } from "@/types/business-game"
import {
  getSignalSnapshot,
  statusLabel,
  type KpiComparisonPoint,
  type SignalGroup,
} from "@/lib/data-modal-signals"

interface DataModalProps {
  onClose: () => void
  scenarioName?: string
  currentSeason?: Season
  gameState: BusinessGameState
  previousGameState: BusinessGameState
}

function KpiComparisonChart({ data }: { data: KpiComparisonPoint[] }) {
  return (
    <ChartContainer
      config={{
        current: { label: "Turno actual", color: "hsl(217, 91%, 60%)" },
        previous: { label: "Turno anterior", color: "hsl(0, 0%, 60%)" },
      }}
      className="h-[280px]"
    >
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="previous" fill="hsl(0, 0%, 60%)" radius={[0, 4, 4, 0]} barSize={14} />
        <Bar dataKey="current" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ChartContainer>
  )
}

function SummaryCards({ data }: { data: KpiComparisonPoint[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {data.map((item) => (
        <Card key={item.name} className="border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
            {item.delta >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900">{item.current}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Señal {statusLabel(item.current)}
            {item.delta !== 0 && (
              <span className={item.delta > 0 ? " text-emerald-700" : " text-red-700"}>
                {" "}
                · {item.delta > 0 ? "+" : ""}
                {item.delta} vs turno anterior
              </span>
            )}
          </p>
        </Card>
      ))}
    </div>
  )
}

export default function DataModal({
  onClose,
  scenarioName = "Escenario base",
  currentSeason = "spring",
  gameState,
  previousGameState,
}: DataModalProps) {
  const [selectedTab, setSelectedTab] = useState<SignalGroup>("market")

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const snapshot = useMemo(
    () => getSignalSnapshot(gameState, previousGameState),
    [gameState, previousGameState],
  )

  const marketAvg = Math.round(
    snapshot.byGroup.market.reduce((sum, item) => sum + item.current, 0) / snapshot.byGroup.market.length,
  )
  const marketDelta = Math.round(
    snapshot.byGroup.market.reduce((sum, item) => sum + item.delta, 0) / snapshot.byGroup.market.length,
  )

  const rawSignals = [
    { label: KPI_LABELS.money, value: `$${gameState.money}`, sub: "Caja disponible" },
    { label: KPI_LABELS.executionSpeed, value: `${gameState.executionSpeed}%`, sub: "Velocidad operativa" },
    { label: KPI_LABELS.teamCapacity, value: `${gameState.teamCapacity}%`, sub: "Capacidad del equipo" },
    { label: KPI_LABELS.clientSatisfaction, value: `${gameState.clientSatisfaction}%`, sub: "Satisfacción clientes" },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-background/80 p-4 backdrop-blur-sm"
    >
      <Card className="max-h-[90vh] w-full max-w-5xl overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-gradient-to-r from-sky-50 to-blue-50 p-6">
          <div>
            <h2 id="data-modal-title" className="flex items-center gap-2 text-2xl font-bold">
              <Building2 className="h-6 w-6 text-primary" />
              KPIs en detalle
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {scenarioName} · turno {snapshot.turn} · fase {SEASONS[currentSeason].name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            className="hover:bg-white/50"
            aria-label="Cerrar panel de KPIs"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rawSignals.map((signal) => (
              <Card key={signal.label} className="border-sky-100 bg-sky-50/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">{signal.label}</p>
                <p className="text-xl font-bold text-sky-950">{signal.value}</p>
                <p className="text-xs text-sky-700">{signal.sub}</p>
              </Card>
            ))}
          </div>

          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as SignalGroup)} className="space-y-6">
            <TabsList className="grid h-12 w-full grid-cols-4">
              <TabsTrigger value="market" className="font-medium">
                Mercado
              </TabsTrigger>
              <TabsTrigger value="capacity" className="font-medium">
                Capacidad
              </TabsTrigger>
              <TabsTrigger value="execution" className="font-medium">
                Ejecución
              </TabsTrigger>
              <TabsTrigger value="expansion" className="font-medium">
                Expansión
              </TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-green-900">Señal competitiva</h4>
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-900">{marketAvg}%</p>
                  <p className="mt-1 text-sm text-green-700">Promedio mercado · {statusLabel(marketAvg)}</p>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-blue-900">Variación turno</h4>
                    {marketDelta >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {marketDelta >= 0 ? "+" : ""}
                    {marketDelta} pts
                  </p>
                  <p className="mt-1 text-sm text-blue-700">Desde el turno {Math.max(1, snapshot.turn - 1)}</p>
                </Card>

                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-amber-900">Marco sugerido</h4>
                    <Building2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-lg font-bold text-amber-900">Porter + amenazas</p>
                  <p className="mt-1 text-sm text-amber-700">Clientes, rivalidad y presión externa</p>
                </Card>
              </div>

              <SummaryCards data={snapshot.byGroup.market} />
              <KpiComparisonChart data={snapshot.byGroup.market} />
            </TabsContent>

            <TabsContent value="capacity" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-blue-900">Capacidad disponible</h4>
                    <Workflow className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{snapshot.current.capacidad_equipo}%</p>
                  <p className="mt-1 text-sm text-blue-700">Señal {statusLabel(snapshot.current.capacidad_equipo)}</p>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-green-900">Control de procesos</h4>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-900">{snapshot.current.control_procesos}%</p>
                  <p className="mt-1 text-sm text-green-700">{KPI_LABELS.processControl}</p>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-purple-900">Marco sugerido</h4>
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-purple-900">Cultura + cambio</p>
                  <p className="mt-1 text-sm text-purple-700">Capacidad finita del sistema</p>
                </Card>
              </div>

              <SummaryCards data={snapshot.byGroup.capacity} />
              <KpiComparisonChart data={snapshot.byGroup.capacity} />
            </TabsContent>

            <TabsContent value="execution" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-orange-900">Velocidad</h4>
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-900">{snapshot.current.velocidad_ejecucion}%</p>
                  <p className="mt-1 text-sm text-orange-700">{KPI_LABELS.executionSpeed}</p>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-blue-900">Seguridad</h4>
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{snapshot.current.seguridad_informacion}%</p>
                  <p className="mt-1 text-sm text-blue-700">Control + confianza combinados</p>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-purple-900">Deuda técnica</h4>
                    <Workflow className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{snapshot.current.deuda_tecnica}%</p>
                  <p className="mt-1 text-sm text-purple-700">Inverso a modernización</p>
                </Card>
              </div>

              <SummaryCards data={snapshot.byGroup.execution} />
              <KpiComparisonChart data={snapshot.byGroup.execution} />
            </TabsContent>

            <TabsContent value="expansion" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <h4 className="mb-2 font-semibold text-green-900">Modernización</h4>
                  <p className="text-3xl font-bold text-green-900">{snapshot.current.modernizacion_tecnologica}%</p>
                </Card>
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <h4 className="mb-2 font-semibold text-blue-900">Ecosistema GAUS</h4>
                  <p className="text-3xl font-bold text-blue-900">{snapshot.current.madurez_ecosistema_gaus}%</p>
                </Card>
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                  <h4 className="mb-2 font-semibold text-amber-900">Rentabilidad</h4>
                  <p className="text-3xl font-bold text-amber-900">{snapshot.current.rentabilidad}%</p>
                </Card>
              </div>

              <SummaryCards data={snapshot.byGroup.expansion} />
              <KpiComparisonChart data={snapshot.byGroup.expansion} />

              <Card className="border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">Marco sugerido</h4>
                <p className="text-sm leading-relaxed text-blue-800">
                  Relaciona estas señales con <strong>Ansoff</strong>, <strong>BCG</strong> y el equilibrio entre core,
                  crecimiento y soporte.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
