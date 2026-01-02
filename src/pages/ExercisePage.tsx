import { SpeakerWaveIcon } from '@heroicons/react/20/solid'
import { useEffect, useMemo, useRef, useState } from 'react'

import wordsData from '../services/data/subject-vocab-normalised.json'

type NormalisedWord = {
  word: string
  definition: string
  synonymns: string[]
  usage: string
  category: string
  'sub-category': string
  stage: 'KS3' | 'KS4' | 'General' | string
}

type StageOption = 'General' | 'KS3' | 'KS4' | 'Mixed'

type ExerciseMode = 'wizard' | 'inProgress' | 'report'

type Attempt = {
  item: NormalisedWord
  attempt: string
}

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

function toTitleCase(input: string): string {
  const trimmed = String(input ?? '').trim()
  if (!trimmed) return ''
  return trimmed.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
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

function WizardProgress({ currentStep }: { currentStep: number }) {
  const steps = useMemo(
    () => [
      { id: 1, name: 'Select Stage' },
      { id: 2, name: 'Select Category' },
      { id: 3, name: 'Select Number of Words' },
      { id: 4, name: 'Set maximum time per word' },
      { id: 5, name: 'Start Exercise' },
    ],
    [],
  )

  const percent = ((Math.max(1, Math.min(5, currentStep)) - 1) / 4) * 100

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Step {currentStep} of 5</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{steps[currentStep - 1]?.name}</p>
      </div>

      <div className="mt-3" aria-hidden="true">
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-2 rounded-full bg-indigo-600"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="mt-4 space-y-2" aria-label="Progress">
        {steps.map((step) => {
          const status = step.id < currentStep ? 'complete' : step.id === currentStep ? 'current' : 'upcoming'
          return (
            <li key={step.id} className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span
                  className={
                    status === 'complete'
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white'
                      : status === 'current'
                        ? 'flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-600 text-xs font-semibold text-indigo-600'
                        : 'flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300'
                  }
                >
                  {step.id}
                </span>
                <span
                  className={
                    status === 'current'
                      ? 'text-sm font-semibold text-gray-900 dark:text-gray-100'
                      : 'text-sm text-gray-700 dark:text-gray-200'
                  }
                >
                  {step.name}
                </span>
              </span>
              <span
                className={
                  status === 'complete'
                    ? 'text-xs font-medium text-indigo-600'
                    : status === 'current'
                      ? 'text-xs font-medium text-gray-900 dark:text-gray-100'
                      : 'text-xs text-gray-500 dark:text-gray-400'
                }
              >
                {status === 'complete' ? 'Done' : status === 'current' ? 'In progress' : 'Upcoming'}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function ExercisePage() {
  const allWords = useMemo(() => {
    return (wordsData as NormalisedWord[]).filter((w) => w && w.word && w.category)
  }, [])

  const [mode, setMode] = useState<ExerciseMode>('wizard')
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
    // Keep category valid when stage changes.
    if (categoriesForStage.length === 0) {
      setSelectedCategory('')
      return
    }

    if (!selectedCategory || !categoriesForStage.includes(selectedCategory)) {
      setSelectedCategory(categoriesForStage[0])
    }
  }, [categoriesForStage, selectedCategory])

  useEffect(() => {
    // Clamp numberOfWords when category/stage changes.
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
  const modeRef = useRef<ExerciseMode>('wizard')

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
      // Prevent double-submits for the same index.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentIndex, maxTimeSeconds])

  const correctCount = useMemo(() => {
    return attempts.reduce((acc, a) => {
      const ok = normaliseForCompare(a.attempt) === normaliseForCompare(a.item.word)
      return acc + (ok ? 1 : 0)
    }, 0)
  }, [attempts])

  const totalCount = attempts.length
  const percentCorrect = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100)

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
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Set up your exercise, then test your spelling.
        </p>
      </div>

      {mode === 'wizard' ? (
        <div className="space-y-6">
          <WizardProgress currentStep={wizardStep} />

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            {wizardStep === 1 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 1: Select Stage</h2>
                <fieldset className="space-y-3">
                  <legend className="sr-only">Select stage</legend>
                  {(['General', 'KS3', 'KS4', 'Mixed'] as StageOption[]).map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
                      <input
                        type="radio"
                        name="stage"
                        value={s}
                        checked={selectedStage === s}
                        onChange={() => setSelectedStage(s)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                      />
                      {s}
                    </label>
                  ))}
                </fieldset>
              </div>
            ) : null}

            {wizardStep === 2 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 2: Select Category</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedStage === 'Mixed'
                    ? 'Showing all categories (no stage filtering).'
                    : `Showing categories for stage: ${selectedStage}.`}
                </p>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  >
                    {categoriesForStage.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 3: Select Number of Words</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedCategory ? (
                    <>
                      Available words in <span className="font-medium">{selectedCategory}</span>: {maxWordsInCategory}
                    </>
                  ) : (
                    'Select a category first.'
                  )}
                </p>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="numWords" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Number of Words
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{numberOfWords}</span>
                  </div>
                  <input
                    id="numWords"
                    type="range"
                    min={1}
                    max={Math.max(1, maxWordsInCategory)}
                    value={Math.min(numberOfWords, Math.max(1, maxWordsInCategory))}
                    onChange={(e) => setNumberOfWords(Number(e.target.value))}
                    disabled={!selectedCategory || maxWordsInCategory <= 0}
                    className="mt-3 w-full"
                  />
                  <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>1</span>
                    <span>{Math.max(1, maxWordsInCategory)}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {wizardStep === 4 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 4: Set maximum time per word</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Choose between 10 and 30 seconds.</p>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="maxTime" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Maximum time per word
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{maxTimeSeconds}s</span>
                  </div>
                  <input
                    id="maxTime"
                    type="range"
                    min={10}
                    max={30}
                    value={maxTimeSeconds}
                    onChange={(e) => setMaxTimeSeconds(Number(e.target.value))}
                    className="mt-3 w-full"
                  />
                  <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>10s</span>
                    <span>30s</span>
                  </div>
                </div>
              </div>
            ) : null}

            {wizardStep === 5 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 5: Start Exercise</h2>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                  <div>Stage: {selectedStage}</div>
                  <div>Category: {selectedCategory || '—'}</div>
                  <div>Number of Words: {numberOfWords}</div>
                  <div>Maximum time per word: {maxTimeSeconds} seconds</div>
                </div>

                <button
                  type="button"
                  onClick={startExercise}
                  disabled={!selectedCategory || maxWordsInCategory <= 0}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Exercise
                </button>
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-between">
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
        </div>
      ) : null}

      {mode === 'inProgress' ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Question {currentIndex + 1} of {totalQuestions}
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  Category: {selectedCategory} · Stage: {selectedStage}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Time left: {timeLeft}s</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Auto-advances when time runs out.</p>
              </div>
            </div>
          </div>

          {currentItem ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Spell the word</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Definition:</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{currentItem.definition}</p>
                </div>

                <button
                  type="button"
                  onClick={() => speakWord(currentItem.word)}
                  disabled={!isSpeakingAvailable}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                  aria-label={`Pronounce ${currentItem.word}`}
                  title={isSpeakingAvailable ? 'Pronounce word' : 'Speech synthesis not available'}
                >
                  <SpeakerWaveIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <label htmlFor="answer" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Your spelling
                </label>
                <input
                  id="answer"
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  autoComplete="off"
                  autoFocus
                />

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => submitCurrent()}
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Submit
                  </button>

                  <button
                    type="button"
                    onClick={resetToWizard}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'report' ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Well done for your attempt. Out of a total of {totalCount} questions, you had {correctCount} ({percentCorrect}%) correct attempts.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="max-h-[32rem] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-950">
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-950 dark:text-gray-200"
                    >
                      Word
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-950 dark:text-gray-200"
                    >
                      Your Attempt
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-950 dark:text-gray-200"
                    >
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {attempts.map((a, idx) => {
                    const correct = normaliseForCompare(a.attempt) === normaliseForCompare(a.item.word)
                    const correctWord = toTitleCase(a.item.word)
                    const attemptWord = toTitleCase(a.attempt)
                    return (
                      <tr key={`${a.item.category}|${a.item.word}|${idx}`}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <span>{correctWord}</span>
                            <button
                              type="button"
                              onClick={() => speakWord(a.item.word)}
                              disabled={!isSpeakingAvailable}
                              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                              aria-label={`Pronounce ${a.item.word}`}
                              title={isSpeakingAvailable ? 'Pronounce word' : 'Speech synthesis not available'}
                            >
                              <SpeakerWaveIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {attemptWord || <span className="text-gray-500 dark:text-gray-400">(blank)</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span className={correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                            {correct ? '✅ Correct' : '❌ Incorrect'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-700 dark:text-gray-200">Would you like to attempt another exercise?</p>
            <button
              type="button"
              onClick={resetToWizard}
              className="mt-3 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Make another Attempt
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
