import { } from 'react'
import { SpeakerWaveIcon } from '@heroicons/react/20/solid'

import type { NormalisedWord } from '../../types/exercise'

type Props = {
  item: NormalisedWord
  currentInput: string
  setCurrentInput: (v: string) => void
  submitCurrent: () => void
  cancel: () => void
  speakWord: (text: string) => void
  isSpeakingAvailable: boolean
}

export default function InProgressQuestion({
  item,
  currentInput,
  setCurrentInput,
  submitCurrent,
  cancel,
  speakWord,
  isSpeakingAvailable,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Spell the word</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Definition:</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.definition}</p>
        </div>

        <button
          type="button"
          onClick={() => speakWord(item.word)}
          disabled={!isSpeakingAvailable}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
          aria-label={`Pronounce ${item.word}`}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submitCurrent()
            }
          }}
          className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          autoComplete="off"
          autoFocus
        />

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={submitCurrent}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={cancel}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
