"use client"



import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

import PortfolioMap from "@/components/portfolio-map"

import DecisionDeck from "@/components/decision-deck"

import JobPositionsPanel from "@/components/job-positions-panel"

import DataModal from "@/components/data-modal"

import InitiativeSelector from "@/components/initiative-selector"

import EventModal from "@/components/event-modal"

import MissionPanel from "@/components/mission-panel"

import AchievementSystem from "@/components/achievement-system"

import StrategicHeader from "@/components/strategic-header"

import KpiStrip from "@/components/kpi-strip"

import GameProgressStrip from "@/components/game-progress-strip"

import MobileDecisionDock from "@/components/mobile-decision-dock"

import { AlertTriangle, ChevronDown, ChevronUp, X, Trophy } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { ScenarioId } from "@/types/scenario"

import type { Season, InitiativeType } from "@/types/initiatives"

import { SCENARIOS } from "@/types/scenario"

import { SEASONS } from "@/types/initiatives"

import type { BusinessGameState } from "@/types/business-game"

import { getStoryBeat } from "@/lib/story-arc"

import { getAvailableBusinessActions } from "@/lib/game-engine"

import { evaluateGameStatus, type GameStatus } from "@/lib/game-balance"

import { useGameLoop, type GameLoopInitialOverrides } from "@/lib/use-game-loop"
import type { LearningRecap } from "@/lib/learning-recap"
import type { PersistedGamePayload } from "@/lib/use-game-persistence"

import type { BusinessActionDefinition } from "@/lib/business-decisions"

import OfficeScene from "@/components/office-scene"



type SecondaryTab = "portafolio" | "puestos" | "mision"



interface GameDashboardProps {
  initialGameState: BusinessGameState
  initialSeason: Season
  initialLoopOverrides?: GameLoopInitialOverrides
  sessionKey: number
  onStateChange: (state: BusinessGameState) => void
  onSeasonChange: (season: Season) => void
  onEndCycle: (status: GameStatus, learningRecap: LearningRecap) => void
  onPersist?: (payload: PersistedGamePayload) => void
  selectedScenario: ScenarioId | null
}



export default function GameDashboard({
  initialGameState,
  initialSeason,
  initialLoopOverrides,
  sessionKey,
  onStateChange,
  onSeasonChange,
  onEndCycle,
  onPersist,
  selectedScenario,
}: GameDashboardProps) {
  const {
    gameState,
    previousGameState,
    season,
    cooldowns,
    missions,
    rewardedMissions,
    learningRecap,
    activeEvent,
    lastTurnFeedback,
    alerts,
    executeDecision,
    assignInitiative,
    redesignJob,
    resolveEvent,
    dismissAlert,
    pushAlert,
  } = useGameLoop(initialGameState, initialSeason, initialLoopOverrides)



  const [showDataModal, setShowDataModal] = useState(false)

  const [showInitiativeSelector, setShowInitiativeSelector] = useState(false)

  const [selectedPlotIndex, setSelectedPlotIndex] = useState<number | null>(null)

  const [showProgressDetails, setShowProgressDetails] = useState(false)

  const [secondaryTab, setSecondaryTab] = useState<SecondaryTab>("portafolio")

  const headerRef = useRef<HTMLDivElement>(null)

  const [headerHeight, setHeaderHeight] = useState(0)



  useLayoutEffect(() => {
    const node = headerRef.current
    if (!node) return

    const update = () => setHeaderHeight(node.offsetHeight)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(node)
    window.addEventListener("resize", update)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  useEffect(() => {

    onStateChange(gameState)

  }, [gameState, onStateChange])



  useEffect(() => {
    onSeasonChange(season)
  }, [season, onSeasonChange])

  useEffect(() => {
    if (!onPersist || !selectedScenario) return

    onPersist({
      gameState,
      initialGameState,
      season,
      cooldowns,
      missions,
      rewardedMissions,
      selectedScenario,
      sessionKey,
      learningRecap,
    })
  }, [
    gameState,
    initialGameState,
    season,
    cooldowns,
    missions,
    rewardedMissions,
    learningRecap,
    selectedScenario,
    sessionKey,
    onPersist,
  ])

  const isAnyModalOpen = showDataModal || showInitiativeSelector || Boolean(activeEvent)



  useEffect(() => {

    const lock = isAnyModalOpen

    document.body.style.overflow = lock ? "hidden" : ""

    document.body.style.touchAction = lock ? "none" : ""

    return () => {

      document.body.style.overflow = ""

      document.body.style.touchAction = ""

    }

  }, [isAnyModalOpen])



  const scenario = selectedScenario ? SCENARIOS[selectedScenario] : null

  const scenarioName = scenario ? scenario.name : "Escenario no definido"

  const gameStatus = evaluateGameStatus(gameState, { startingBudget: initialGameState.money })

  const { isGameOver, canCloseCycle } = gameStatus

  const storyBeat = getStoryBeat(gameState, selectedScenario)

  const [feedbackPulseKey, setFeedbackPulseKey] = useState(0)

  const topChangedKpi = useMemo(() => {
    if (!lastTurnFeedback) return null
    const deltas = [...lastTurnFeedback.gains, ...lastTurnFeedback.losses]
    if (deltas.length === 0) return null
    return deltas.reduce((best, item) =>
      Math.abs(item.delta) > Math.abs(best.delta) ? item : best,
    ).label
  }, [lastTurnFeedback])

  useEffect(() => {
    if (!lastTurnFeedback) return
    setFeedbackPulseKey((value) => value + 1)
  }, [lastTurnFeedback])

  const suggestedAction = getAvailableBusinessActions(gameState, cooldowns).find(

    (item) => item.isSuggested && item.canAfford && item.cooldown === 0,

  )?.action



  const handlePlotClick = (index: number) => {

    setSelectedPlotIndex(index)

    setShowInitiativeSelector(true)

  }



  const handleSelectInitiative = (cropType: InitiativeType) => {

    if (selectedPlotIndex === null) return

    assignInitiative(selectedPlotIndex, cropType, season)

    setShowInitiativeSelector(false)

  }



  const handleAction = (action: BusinessActionDefinition) => {

    executeDecision(action, selectedScenario, scenarioName)

  }



  const handleJumpToDecisions = () => {

    requestAnimationFrame(() => {

      const el = document.getElementById("decision-deck")

      if (!el) return

      const headerOffset = headerHeight + 16

      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset

      window.scrollTo({ top: y, behavior: "smooth" })

    })

  }



  const portfolioSection = (

    <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">

      <div className="mb-4 flex items-center justify-between gap-2">

        <h2 className="text-base font-semibold text-foreground sm:text-lg">Portafolio de iniciativas</h2>

        <span className="rounded-full bg-slate-100 px-2 py-1 text-right text-xs text-slate-700 sm:px-3">

          {SEASONS[season].description}

        </span>

      </div>

      <PortfolioMap

        clientSatisfaction={gameState.clientSatisfaction}

        processControl={gameState.processControl}

        executionSpeed={gameState.executionSpeed}

        teamCapacity={gameState.teamCapacity}

        initiativeSlots={gameState.initiativeSlots}

        onSlotClick={handlePlotClick}

        currentSeason={season}

      />

    </div>

  )



  const jobPositionsSection = (

    <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">

      <div className="mb-4 flex items-center gap-2">

        <h2 className="text-base font-semibold text-foreground sm:text-lg">Diseño de puestos</h2>

        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">

          Escala con la empresa

        </span>

      </div>

      <JobPositionsPanel gameState={gameState} onRedesign={redesignJob} />

    </div>

  )



  const missionSidebar = (

    <div className="rounded-xl border bg-white shadow-sm">

      <div className="border-b p-4">

        <MissionPanel missions={missions} currentWeek={gameState.turn} />

      </div>

      <button

        type="button"

        onClick={() => setShowProgressDetails((value) => !value)}

        className="flex min-h-11 w-full items-center justify-between gap-3 p-4 text-left"

      >

        <div className="flex items-center gap-2">

          <Trophy className="h-5 w-5 text-amber-500" />

          <div>

            <h2 className="text-base font-semibold text-slate-950">Logros secundarios</h2>

            <p className="text-xs text-muted-foreground">Motivación extra sin tapar la misión activa</p>

          </div>

        </div>

        {showProgressDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}

      </button>

      {showProgressDetails && (

        <div className="border-t p-4">

          <AchievementSystem

            gameState={gameState}

            onAchievementUnlock={(achievement) => {
              pushAlert(`Logro desbloqueado: ${achievement.title}`)
            }}

          />

        </div>

      )}

    </div>

  )



  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dashboard-shell">

      {showInitiativeSelector && selectedPlotIndex !== null && (

        <InitiativeSelector

          currentSeason={season}

          previousInitiative={gameState.initiativeSlots[selectedPlotIndex]?.type || null}

          onSelectInitiative={handleSelectInitiative}

          onClose={() => setShowInitiativeSelector(false)}

        />

      )}

      {activeEvent && (

        <EventModal

          event={activeEvent}

          availableBudget={gameState.money}

          currentTurn={gameState.turn}

          onMitigate={() => resolveEvent("mitigate")}

          onAccept={() => resolveEvent("accept")}

        />

      )}



      <div ref={headerRef} className="sticky top-0 z-30">
        <StrategicHeader

          turn={gameState.turn}

          score={gameStatus.score}

          scenarioName={scenarioName}

          currentSeason={season}

          canCloseCycle={canCloseCycle}

          isGameOver={isGameOver}

          headline={gameStatus.headline}

          onOpenSignals={() => setShowDataModal(true)}

          onEndCycle={() => onEndCycle(gameStatus, learningRecap)}

        />
      </div>



      <div className="container mx-auto space-y-4 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:space-y-5 sm:px-4 md:px-6 md:py-6 dashboard-main">

        <KpiStrip
          gameState={gameState}
          previousState={previousGameState}
          highlightLabel={topChangedKpi}
          pulseKey={feedbackPulseKey}
        />

        {/* Escenario protagonista: oficina fija mientras se navega el resto */}
        <div className="sticky z-10" style={{ top: headerHeight }}>
          <OfficeScene
            gameState={gameState}
            activeEvent={activeEvent}
            compact
            pulseKey={feedbackPulseKey}
          />
        </div>

        {/* Deck de decisiones: justo bajo la oficina para verla reaccionar al elegir */}
        <div id="decision-deck" className="scroll-mt-28">
          <DecisionDeck gameState={gameState} cooldowns={cooldowns} onAction={handleAction} />
        </div>

        <GameProgressStrip
          score={gameStatus.score}
          stars={gameStatus.stars}
          turn={gameState.turn}
          storyBeat={storyBeat}
          feedback={lastTurnFeedback}
          initialExpanded={gameState.turn === 1}
        />



        {isGameOver && (

          <Alert className="border-red-300 bg-red-50">

            <AlertTriangle className="h-5 w-5 text-red-600" />

            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <span className="font-semibold text-base text-red-800">{gameStatus.headline}</span>

              <Button

                variant="destructive"

                size="sm"

                className="shrink-0"

                onClick={() => onEndCycle(gameStatus, learningRecap)}

              >

                Ver resultado

              </Button>

            </AlertDescription>

          </Alert>

        )}



        {activeEvent && (

          <Alert className="bg-destructive/10 border-destructive/30">

            <AlertTriangle className="h-5 w-5 text-destructive" />

            <AlertDescription className="font-semibold text-base text-destructive">

              {activeEvent.name}: {activeEvent.description}

            </AlertDescription>

          </Alert>

        )}



        {alerts.length > 0 && (
          <div className="relative pb-1">
            {alerts.length > 1 && (
              <>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 top-2 h-[calc(100%-0.25rem)] rounded-lg border border-amber-200/70 bg-amber-100/70"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-1.5 top-1 h-[calc(100%-0.125rem)] rounded-lg border border-amber-200/50 bg-amber-100/50"
                />
              </>
            )}

            <Alert className="relative z-10 flex items-center gap-3 border-amber-200 bg-amber-50 py-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />

              <div className="min-w-0 flex-1">
                {alerts.length > 1 && (
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                    Alerta 1 de {alerts.length}
                  </p>
                )}
                <AlertDescription className="text-sm font-medium leading-snug text-amber-900">
                  {alerts[0]}
                </AlertDescription>
              </div>

              <button
                type="button"
                onClick={dismissAlert}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-900"
                aria-label="Descartar alerta"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>

            {alerts.length > 1 && (
              <p className="relative z-10 mt-2 text-center text-xs font-medium text-amber-800/80">
                {alerts.length - 1} alerta{alerts.length - 1 === 1 ? "" : "s"} más en cola
              </p>
            )}
          </div>
        )}



        {/* Contenido de apoyo: no compite con la oficina ni el deck */}

        <Tabs

          value={secondaryTab}

          onValueChange={(value) => setSecondaryTab(value as SecondaryTab)}

          className="space-y-4"

        >

          <TabsList className="grid h-11 w-full grid-cols-3">

            <TabsTrigger value="portafolio" className="text-sm font-medium">

              Portafolio

            </TabsTrigger>

            <TabsTrigger value="puestos" className="text-sm font-medium">

              Puestos

            </TabsTrigger>

            <TabsTrigger value="mision" className="text-sm font-medium">

              Misión

            </TabsTrigger>

          </TabsList>



          <TabsContent value="portafolio" className="mt-0 space-y-4 pb-4">

            {portfolioSection}

          </TabsContent>



          <TabsContent value="puestos" className="mt-0 space-y-4 pb-4">

            {jobPositionsSection}

          </TabsContent>



          <TabsContent value="mision" className="mt-0 space-y-4 pb-4">

            {missionSidebar}

          </TabsContent>

        </Tabs>

      </div>



      {!isAnyModalOpen && (

        <MobileDecisionDock

          suggestedAction={suggestedAction}

          canCloseCycle={canCloseCycle}

          onJumpToDecisions={handleJumpToDecisions}

          onCloseCycle={() => onEndCycle(gameStatus, learningRecap)}

        />

      )}



      {showDataModal && (

        <DataModal

          onClose={() => setShowDataModal(false)}

          scenarioName={scenarioName}

          currentSeason={season}

          gameState={gameState}

          previousGameState={previousGameState}

        />

      )}

    </div>

  )

}


