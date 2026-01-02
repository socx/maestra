import { } from 'react'

export type StageOption = 'General' | 'KS3' | 'KS4' | 'Mixed'

type Props = {
  step: number
  selectedStage: StageOption
  setSelectedStage: (s: StageOption) => void
  categoriesForStage: string[]
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  numberOfWords: number
  setNumberOfWords: (n: number) => void
  maxWordsInCategory: number
  maxTimeSeconds: number
  setMaxTimeSeconds: (n: number) => void
  startExercise: () => void
}

export default function WizardSteps({
  step,
  selectedStage,
  setSelectedStage,
  categoriesForStage,
  selectedCategory,
  setSelectedCategory,
  numberOfWords,
  setNumberOfWords,
  maxWordsInCategory,
  maxTimeSeconds,
  setMaxTimeSeconds,
  startExercise,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 1: Select Stage</h2>
          <fieldset className="space-y-3">
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
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 2: Select Category</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Choose a category to use for the exercise.</p>
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
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 3: Select Number of Words</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Available: {maxWordsInCategory}</p>
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
      )}

      {step === 4 && (
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
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 5: Start Exercise</h2>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
            <div>Review your choices above and press Start Exercise when ready.</div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={startExercise}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Start Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
