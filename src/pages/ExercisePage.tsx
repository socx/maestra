import { useEffect, useMemo, useRef, useState } from 'react'

import wordsData from '../services/data/subject-vocab-normalised.json'
import WizardProgress from '../components/Exercise/WizardProgress'
import WizardSteps from '../components/Exercise/WizardSteps'
import type { StageOption } from '../components/Exercise/WizardSteps'
import InProgressQuestion from '../components/Exercise/InProgressQuestion'
import ExerciseReport from '../components/Exercise/ExerciseReport'
import type { NormalisedWord, Attempt } from '../types/exercise'

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort(compareText)
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}


function normaliseForCompare(input: string): string {
  return String(input ?? '').trim().toLowerCase()
}

function canSpeak(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  )
}

function speakWord(text: string): void {
  if (!canSpeak()) return

  const trimmed = text.trim()
  if (!trimmed) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(trimmed)
  utterance.rate = 0.95
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}

export function ExercisePage() {
  const allWords = useMemo(() => {
    return (wordsData as NormalisedWord[]).filter((w) => w && w.word && w.category)
  }, [])

  const [mode, setMode] = useState<'wizard' | 'inProgress' | 'report'>('wizard')
  const [wizardStep, setWizardStep] = useState<number>(1)

  const [selectedStage, setSelectedStage] = useState<StageOption>('General')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [numberOfWords, setNumberOfWords] = useState<number>(10)
  const [maxTimeSeconds, setMaxTimeSeconds] = useState<number>(15)

  const [exerciseItems, setExerciseItems] = useState<NormalisedWord[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [currentInput, setCurrentInput] = useState<string>('')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(15)

  const categoriesForStage = useMemo(() => {
    const filtered =
      selectedStage === 'Mixed'
        ? allWords
        : allWords.filter((w) => String(w.stage) === selectedStage)
    return uniqueSorted(filtered.map((w) => w.category))
  }, [allWords, selectedStage])

  const filteredForSelection = useMemo(() => {
    if (!selectedCategory) return []

    return allWords.filter((w) => {
      if (w.category !== selectedCategory) return false
      if (selectedStage === 'Mixed') return true
      return String(w.stage) === selectedStage
    })
  }, [allWords, selectedCategory, selectedStage])

  const maxWordsInCategory = filteredForSelection.length

  useEffect(() => {
    if (categoriesForStage.length === 0) {
      setSelectedCategory('')
      return
    }

    if (!selectedCategory || !categoriesForStage.includes(selectedCategory)) {
      setSelectedCategory(categoriesForStage[0])
    }
  }, [categoriesForStage, selectedCategory])

  useEffect(() => {
    if (maxWordsInCategory <= 0) {
      setNumberOfWords(1)
      return
    }
    setNumberOfWords((prev) => Math.max(1, Math.min(prev, maxWordsInCategory)))
  }, [maxWordsInCategory])

  const currentItem = exerciseItems[currentIndex]
  const totalQuestions = exerciseItems.length
  const isSpeakingAvailable = useMemo(() => canSpeak(), [])

  const currentIndexRef = useRef(0)
  const currentInputRef = useRef('')
  const modeRef = useRef<'wizard' | 'inProgress' | 'report'>('wizard')

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  useEffect(() => {
    currentInputRef.current = currentInput
  }, [currentInput])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const submitCurrent = (attemptOverride?: string) => {
    if (modeRef.current !== 'inProgress') return
    const idx = currentIndexRef.current
    const item = exerciseItems[idx]
    if (!item) return

    const attemptText = attemptOverride ?? currentInputRef.current
    setAttempts((prev) => {
      if (prev.length > idx) return prev
      return [...prev, { item, attempt: attemptText }]
    })

    setCurrentInput('')

    if (idx + 1 >= exerciseItems.length) {
      setMode('report')
      return
    }
    setCurrentIndex(idx + 1)
  }

  useEffect(() => {
    if (mode !== 'inProgress') return
    setTimeLeft(maxTimeSeconds)

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId)
          submitCurrent(currentInputRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [mode, currentIndex, maxTimeSeconds])

  const correctCount = useMemo(() => {
    return attempts.reduce((acc, a) => {
      const ok = normaliseForCompare(a.attempt) === normaliseForCompare(a.item.word)
      return acc + (ok ? 1 : 0)
    }, 0)
  }, [attempts])

  const canGoNext = useMemo(() => {
    if (wizardStep === 1) return true
    if (wizardStep === 2) return Boolean(selectedCategory)
    if (wizardStep === 3) return Boolean(selectedCategory) && maxWordsInCategory > 0
    if (wizardStep === 4) return true
    if (wizardStep === 5) return true
    return false
  }, [wizardStep, selectedCategory, maxWordsInCategory])

  const startExercise = () => {
    const pool = filteredForSelection
    if (pool.length === 0) return
    const picked = shuffle(pool).slice(0, Math.max(1, Math.min(numberOfWords, pool.length)))
    setExerciseItems(picked)
    setAttempts([])
    setCurrentIndex(0)
    setCurrentInput('')
    setTimeLeft(maxTimeSeconds)
    setMode('inProgress')
  }

  const resetToWizard = () => {
    setMode('wizard')
    setWizardStep(1)
    setAttempts([])
    setExerciseItems([])
    setCurrentIndex(0)
    setCurrentInput('')
    setTimeLeft(maxTimeSeconds)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exercise</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Set up your exercise, then test your spelling.</p>
      </div>

      {mode === 'wizard' ? (
        <div className="space-y-6">
          <WizardProgress currentStep={wizardStep} />

          <WizardSteps
            step={wizardStep}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
            categoriesForStage={categoriesForStage}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            numberOfWords={numberOfWords}
            setNumberOfWords={setNumberOfWords}
            maxWordsInCategory={maxWordsInCategory}
            maxTimeSeconds={maxTimeSeconds}
            setMaxTimeSeconds={setMaxTimeSeconds}
            startExercise={startExercise}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
              disabled={wizardStep === 1}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              {wizardStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => Math.min(5, s + 1))}
                  disabled={!canGoNext}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'inProgress' ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Question {currentIndex + 1} of {totalQuestions}</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Category: {selectedCategory} · Stage: {selectedStage}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Time left: {timeLeft}s</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Auto-advances when time runs out.</p>
              </div>
            </div>
          </div>

          {currentItem ? (
            <InProgressQuestion
              item={currentItem}
              currentInput={currentInput}
              setCurrentInput={setCurrentInput}
              submitCurrent={() => submitCurrent()}
              cancel={resetToWizard}
              speakWord={speakWord}
              isSpeakingAvailable={isSpeakingAvailable}
            />
          ) : null}
        </div>
      ) : null}

      {mode === 'report' ? (
        <ExerciseReport
          attempts={attempts}
          correctCount={correctCount}
          resetToWizard={resetToWizard}
          speakWord={speakWord}
          isSpeakingAvailable={isSpeakingAvailable}
        />
      ) : null}
    </div>
  )
}
