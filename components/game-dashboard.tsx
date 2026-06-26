"use client"



import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

import DecisionDeck from "@/components/decision-deck"

import JobPositionsPanel from "@/components/job-positions-panel"

import DataModal from "@/components/data-modal"

import InitiativeSelector from "@/components/initiative-selector"

import EventModal from "@/components/event-modal"

import ActiveEventsRail from "@/components/active-events-rail"

import MissionPanel from "@/components/mission-panel"

import AchievementSystem from "@/components/achievement-system"

import StrategicHeader from "@/components/strategic-header"

import GameProgressStrip from "@/components/game-progress-strip"

import MobileDecisionDock from "@/components/mobile-decision-dock"

import { AlertTriangle, ChevronDown, ChevronUp, Trophy } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import type { ScenarioId } from "@/types/scenario"

import type { Season, InitiativeType } from "@/types/initiatives"

import { SCENARIOS } from "@/types/scenario"

import type { BusinessGameState } from "@/types/business-game"

import { getStoryBeat } from "@/lib/story-arc"

import { getAvailableBusinessActions } from "@/lib/game-engine"

import { evaluateGameStatus, type GameStatus } from "@/lib/game-balance"

import { useGameLoop, type GameLoopInitialOverrides } from "@/lib/use-game-loop"
import type { LearningRecap } from "@/lib/learning-recap"
import type { PersistedGamePayload } from "@/lib/use-game-persistence"

import type { BusinessActionDefinition } from "@/lib/business-decisions"

import AlertList from "@/components/alert-list"

import OfficeScene from "@/components/office-scene"



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



  const [showDetail, setShowDetail] = useState(false)

  const [showInitiativeSelector, setShowInitiativeSelector] = useState(false)

  const [selectedPlotIndex, setSelectedPlotIndex] = useState<number | null>(null)

  const [showProgressDetails, setShowProgressDetails] = useState(false)

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

  const isAnyModalOpen = showDetail || showInitiativeSelector || Boolean(activeEvent)



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



  const handleOpenJobPositions = () => {

    requestAnimationFrame(() => {

      const el = document.getElementById("secondary-panel")

      if (!el) return

      const headerOffset = headerHeight + 16

      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset

      window.scrollTo({ top: y, behavior: "smooth" })

    })

  }



  const jobPositionsSection = (

    <div id="secondary-panel" className="scroll-mt-28 rounded-xl border bg-white p-4 shadow-sm sm:p-5">

      <div className="mb-4 flex items-center gap-2">

        <h2 className="text-base font-semibold text-foreground sm:text-lg">Puestos del equipo</h2>

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

          selectedScenario={selectedScenario}

          teamIndex={selectedPlotIndex}

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

          stars={gameStatus.stars}

          scenarioName={scenarioName}

          currentSeason={season}

          canCloseCycle={canCloseCycle}

          isGameOver={isGameOver}

          headline={gameStatus.headline}

          gameState={gameState}

          previousGameState={previousGameState}

          highlightLabel={topChangedKpi}

          pulseKey={feedbackPulseKey}

          onEndCycle={() => onEndCycle(gameStatus, learningRecap)}

          onOpenDetail={() => setShowDetail(true)}

        />
      </div>



      <div className="container mx-auto space-y-4 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:space-y-5 sm:px-4 md:px-6 md:py-6 dashboard-main">

        <ActiveEventsRail modifiers={gameState.activeModifiers} pendingEvent={activeEvent} />

        {alerts.length > 0 && <AlertList alerts={alerts} onDismiss={dismissAlert} />}

        <GameProgressStrip
          score={gameStatus.score}
          turn={gameState.turn}
          storyBeat={storyBeat}
          feedback={lastTurnFeedback}
          initialExpanded={gameState.turn === 1}
        />

        {/* Escenario protagonista: sticky en desktop; scroll natural en mobile */}
        <div className="z-10 max-sm:relative sm:sticky" style={{ top: headerHeight }}>
          <OfficeScene
            gameState={gameState}
            previousGameState={previousGameState}
            activeEvent={activeEvent}
            compact
            pulseKey={feedbackPulseKey}
            onOpenJobPositions={handleOpenJobPositions}
            onAssignTeam={handlePlotClick}
          />
        </div>

        {/* Deck de decisiones: justo bajo la oficina para verla reaccionar al elegir */}
        <div id="decision-deck" className="scroll-mt-28">
          <DecisionDeck gameState={gameState} cooldowns={cooldowns} onAction={handleAction} />
        </div>



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



        {/* Puestos: el equipo de la oficina y sus roles a rediseñar */}
        {jobPositionsSection}

        {/* Misión y logros: guía de aprendizaje, al pie para no competir con la operación */}
        {missionSidebar}

      </div>



      {!isAnyModalOpen && (

        <MobileDecisionDock

          suggestedAction={suggestedAction}

          canCloseCycle={canCloseCycle}

          isGameOver={isGameOver}

          onJumpToDecisions={handleJumpToDecisions}

          onCloseCycle={() => onEndCycle(gameStatus, learningRecap)}

        />

      )}



      {showDetail && (

        <DataModal

          onClose={() => setShowDetail(false)}

          scenarioName={scenarioName}

          currentSeason={season}

          gameState={gameState}

          previousGameState={previousGameState}

        />

      )}

    </div>

  )

}


