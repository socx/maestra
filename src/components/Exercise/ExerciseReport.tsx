import { } from 'react'
import { SpeakerWaveIcon } from '@heroicons/react/20/solid'
import type { Attempt } from '../../types/exercise'

type Props = {
  attempts: Attempt[]
  correctCount: number
  resetToWizard: () => void
  speakWord: (text: string) => void
  isSpeakingAvailable: boolean
}

export default function ExerciseReport({ attempts, correctCount, resetToWizard, speakWord, isSpeakingAvailable }: Props) {
  const totalCount = attempts.length
  const percentCorrect = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100)

  return (
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
                const correct = a.attempt.trim().toLowerCase() === a.item.word.trim().toLowerCase()
                const correctWord = a.item.word
                const attemptWord = a.attempt || ''
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
                        >
                          <SpeakerWaveIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{attemptWord}</td>
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
  )
}
