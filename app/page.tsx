"use client"

import { useCallback, useState } from "react"
import WelcomeScreen from "@/components/welcome-screen"
import ScenarioSelection from "@/components/scenario-selection"
import GameDashboard from "@/components/game-dashboard"
import ResultsScreen from "@/components/results-screen"
import SeasonReport from "@/components/season-report"
import type { ScenarioId } from "@/types/scenario"
import type { Season } from "@/types/initiatives"
import type { BusinessGameState } from "@/types/business-game"
import type { GameStatus } from "@/lib/game-balance"
import { createScenarioState } from "@/lib/colinet-trotta-content"
import { useGamePersistence } from "@/lib/use-game-persistence"
import type { GameLoopInitialOverrides } from "@/lib/use-game-loop"
import type { LearningRecap } from "@/lib/learning-recap"
import { SCENARIOS } from "@/types/scenario"

function isDefeatOutcome(status: GameStatus): boolean {
  return status.isGameOver || status.outcome.startsWith("defeat")
}

export default function Home() {
  const initialScenario = createScenarioState("core_pressure")
  const { hydrated, hasValidSave, savedGame, persist, clear, saveSummary } = useGamePersistence()

  const [currentScreen, setCurrentScreen] = useState<"welcome" | "scenario" | "dashboard" | "results">("welcome")
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null)
  const [currentSeason, setCurrentSeason] = useState<Season>("spring")
  const [initialGameState, setInitialGameState] = useState<BusinessGameState>(initialScenario)
  const [gameState, setGameState] = useState<BusinessGameState>(initialScenario)
  const [sessionKey, setSessionKey] = useState(0)
  const [loopOverrides, setLoopOverrides] = useState<GameLoopInitialOverrides | undefined>(undefined)
  const [showSeasonReport, setShowSeasonReport] = useState(false)
  const [cycleResult, setCycleResult] = useState<GameStatus | null>(null)
  const [cycleLearningRecap, setCycleLearningRecap] = useState<LearningRecap | undefined>(undefined)

  const handleStartGame = () => {
    clear()
    setLoopOverrides(undefined)
    setCurrentScreen("scenario")
  }

  const handleContinueGame = () => {
    if (!savedGame) return

    setSelectedScenario(savedGame.selectedScenario)
    setGameState(savedGame.gameState)
    setInitialGameState(savedGame.initialGameState ?? savedGame.gameState)
    setCurrentSeason(savedGame.season)
    setSessionKey(savedGame.sessionKey)
    setLoopOverrides({
      cooldowns: savedGame.cooldowns,
      missions: savedGame.missions,
      rewardedMissions: savedGame.rewardedMissions,
      learningRecap: savedGame.learningRecap,
    })
    setCycleResult(null)
    setCurrentScreen("dashboard")
  }

  const handleSelectScenario = (scenarioId: ScenarioId) => {
    clear()
    setSelectedScenario(scenarioId)
    const nextState = createScenarioState(scenarioId)
    setGameState(nextState)
    setInitialGameState(nextState)
    setCurrentSeason("spring")
    setSessionKey((value) => value + 1)
    setLoopOverrides(undefined)
    setCycleResult(null)
    setCurrentScreen("dashboard")
  }

  const handleEndCycle = (status: GameStatus, learningRecap: LearningRecap) => {
    setCycleResult(status)
    setCycleLearningRecap(learningRecap)
    if (isDefeatOutcome(status)) {
      setShowSeasonReport(false)
      setCurrentScreen("results")
    } else {
      setShowSeasonReport(true)
    }
  }

  const handleContinueFromReport = () => {
    setShowSeasonReport(false)
    setCurrentScreen("results")
  }

  const handleReviewGame = () => {
    setShowSeasonReport(false)
  }

  const handlePlayAgain = () => {
    clear()
    if (selectedScenario) {
      const nextState = createScenarioState(selectedScenario)
      setGameState(nextState)
      setInitialGameState(nextState)
      setCurrentSeason("spring")
      setSessionKey((value) => value + 1)
      setLoopOverrides(undefined)
    }
    setCycleResult(null)
    setCycleLearningRecap(undefined)
    setCurrentScreen("dashboard")
  }

  const handleBackToHome = () => {
    clear()
    setLoopOverrides(undefined)
    setCurrentScreen("welcome")
  }

  const handleStateChange = useCallback((state: BusinessGameState) => {
    setGameState(state)
  }, [])

  const handleSeasonChange = useCallback((season: Season) => {
    setCurrentSeason(season)
  }, [])

  const handlePersist = useCallback(
    (payload: Parameters<typeof persist>[0]) => {
      persist(payload)
    },
    [persist],
  )

  const continueHint =
    hydrated && hasValidSave && saveSummary
      ? `${SCENARIOS[saveSummary.scenarioId].name} · turno ${saveSummary.turn} · ${saveSummary.savedAgoLabel}`
      : undefined

  return (
    <main className="min-h-screen">
      {currentScreen === "welcome" && (
        <WelcomeScreen
          onStart={handleStartGame}
          onContinue={hasValidSave ? handleContinueGame : undefined}
          continueHint={continueHint}
        />
      )}
      {currentScreen === "scenario" && <ScenarioSelection onSelectScenario={handleSelectScenario} />}
      {currentScreen === "dashboard" && (
        <>
          <GameDashboard
            key={`${selectedScenario}-${sessionKey}`}
            initialGameState={initialGameState}
            initialSeason={currentSeason}
            initialLoopOverrides={loopOverrides}
            sessionKey={sessionKey}
            onStateChange={handleStateChange}
            onSeasonChange={handleSeasonChange}
            onEndCycle={handleEndCycle}
            onPersist={handlePersist}
            selectedScenario={selectedScenario}
          />
          {showSeasonReport && (
            <SeasonReport
              gameState={gameState}
              initialData={initialGameState}
              onClose={handleReviewGame}
              onContinue={handleContinueFromReport}
            />
          )}
        </>
      )}
      {currentScreen === "results" && cycleResult && (
        <ResultsScreen
          cycleResult={cycleResult}
          initialBudget={initialGameState.money}
          learningRecap={cycleLearningRecap}
          onPlayAgain={handlePlayAgain}
          onBackToHome={handleBackToHome}
        />
      )}
    </main>
  )
}
