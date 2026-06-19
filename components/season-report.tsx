"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Award, AlertTriangle, Building2, ShieldCheck, DollarSign, Workflow, X } from "lucide-react"
import type { BusinessGameState } from "@/types/business-game"

interface SeasonReportProps {
  gameState: BusinessGameState
  initialData: BusinessGameState
  onClose: () => void
  onContinue: () => void
}

export default function SeasonReport({ gameState, initialData, onClose, onContinue }: SeasonReportProps) {
  const calculateChange = (current: number, initial: number) => {
    const change = current - initial
    const percentage = ((change / initial) * 100).toFixed(1)
    return { change, percentage, isPositive: change >= 0 }
  }

  const processControlChange = calculateChange(gameState.processControl, initialData.processControl)
  const sustainabilityChange = calculateChange(gameState.sustainability, initialData.sustainability)
  const moneyChange = calculateChange(gameState.money, initialData.money)
  const teamCapacityChange = calculateChange(gameState.teamCapacity, initialData.teamCapacity)

  const getPerformanceGrade = () => {
    const avgScore = (gameState.processControl + gameState.sustainability + gameState.clientSatisfaction) / 3
    if (avgScore >= 80) return { grade: "A", color: "text-green-600", message: "Excelente alineación entre estrategia, operación y mercado" }
    if (avgScore >= 65) return { grade: "B", color: "text-blue-600", message: "Buen ciclo, con tensiones todavía controlables" }
    if (avgScore >= 50) return { grade: "C", color: "text-yellow-600", message: "Hubo avances, pero con trade-offs mal resueltos" }
    return { grade: "D", color: "text-red-600", message: "El sistema quedó frágil, reactivo y sin margen" }
  }

  const performance = getPerformanceGrade()

  const achievements = []
  if (gameState.processControl > initialData.processControl + 20) {
    achievements.push({ title: "Gobernanza efectiva", description: "Mejoraste de forma visible el nivel de control y proceso" })
  }
  if (gameState.sustainability > 80) {
    achievements.push({ title: "Confianza de mercado", description: "Sostuviste una señal fuerte de seguridad y consistencia" })
  }
  if (gameState.money > initialData.money) {
    achievements.push({ title: "Caja fortalecida", description: "Cerraste el ciclo con mejor margen que al inicio" })
  }
  if (gameState.executionSpeed > 70 && gameState.teamCapacity > 70) {
    achievements.push({ title: "Capacidad bien gestionada", description: "Mantuviste velocidad y capacidad del equipo en paralelo" })
  }

  const recommendations = []
  if (gameState.processControl < 50) {
    recommendations.push({
      icon: ShieldCheck,
      title: "Ordenar gobernanza",
      description: "Definí responsables, criterios y evidencia. Sin eso, la ejecución queda a intuición.",
    })
  }
  if (gameState.sustainability < 60) {
    recommendations.push({
      icon: Building2,
      title: "Reconstruir confianza",
      description: "Usá seguridad, cumplimiento y consistencia como parte de la propuesta de valor, no como freno burocrático.",
    })
  }
  if (gameState.executionSpeed < 40) {
    recommendations.push({
      icon: Workflow,
      title: "Recuperar velocidad",
      description: "Bajá frentes abiertos, limpiá dependencias y protegé foco del equipo para volver a entregar.",
    })
  }
  if (gameState.teamCapacity < 40) {
    recommendations.push({
      icon: Workflow,
      title: "Proteger capacidad",
      description: "No cargues más iniciativas hasta resolver saturación, roles difusos o deuda técnica acumulada.",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background shadow-2xl">
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between pb-4 border-b">
            <div>
              <h2 className="text-3xl font-bold text-balance">Debrief del ciclo</h2>
              <p className="text-muted-foreground mt-1">Cierre del capítulo operativo: qué funcionó, qué se tensionó y qué sigue</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Desempeño general</h3>
                <div className={`text-6xl font-bold ${performance.color}`}>{performance.grade}</div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 font-medium">{performance.message}</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Control y procesos</span>
                    <span className="font-bold">{gameState.processControl}%</span>
                  </div>
                  <Progress value={gameState.processControl} className="h-2.5" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Confianza de mercado</span>
                    <span className="font-bold">{gameState.sustainability}%</span>
                  </div>
                  <Progress value={gameState.sustainability} className="h-2.5" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Satisfacción de clientes</span>
                    <span className="font-bold">{gameState.clientSatisfaction}%</span>
                  </div>
                  <Progress value={gameState.clientSatisfaction} className="h-2.5" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-2">
              <h3 className="text-lg font-semibold mb-4">Indicadores clave</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Control y procesos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {processControlChange.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-bold ${processControlChange.isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {processControlChange.isPositive ? "+" : ""}
                      {processControlChange.percentage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Confianza de mercado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sustainabilityChange.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-bold ${sustainabilityChange.isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {sustainabilityChange.isPositive ? "+" : ""}
                      {sustainabilityChange.percentage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium">Caja</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {moneyChange.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-bold ${moneyChange.isPositive ? "text-green-600" : "text-red-600"}`}>
                      {moneyChange.isPositive ? "+" : ""}${Math.abs(moneyChange.change)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Workflow className="h-5 w-5 text-cyan-600" />
                    </div>
                    <span className="text-sm font-medium">Capacidad del equipo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {teamCapacityChange.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-bold ${teamCapacityChange.isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {teamCapacityChange.isPositive ? "+" : ""}
                      {teamCapacityChange.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {achievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Logros desbloqueados
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {achievements.map((achievement, i) => (
                  <Card
                    key={i}
                    className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{achievement.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Recomendaciones para el próximo turno
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <Card
                    key={i}
                    className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <rec.icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card className="p-5 bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 shadow-sm">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Para llevarte
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              En Organización y Gestión Empresarial, una buena decisión no gana en una sola variable. Estrategia, cultura, estructura y ejecución se condicionan entre sí. Si acelerás sacrificando control, o innovás sin patrocinio ni gobernanza, el sistema lo cobra más adelante.
            </p>
          </Card>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="flex-1 h-12 font-medium bg-transparent">
              Revisar tablero
            </Button>
            <Button
              onClick={onContinue}
              className="flex-1 h-12 font-semibold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-lg"
            >
              Ver epílogo estratégico
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
